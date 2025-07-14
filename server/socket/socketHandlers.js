import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

// In-memory store for user socket mapping and active chats
const userSocketMap = new Map(); // userId -> socketId
const socketUserMap = new Map(); // socketId -> userId
const userActiveChatMap = new Map(); // userId -> chatId (currently viewing chat)

export const handleConnection = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    console.log(`User ${socket.user.name} connected with socket ${socket.id}`);

    // Store user-socket mapping
    userSocketMap.set(userId, socket.id);
    socketUserMap.set(socket.id, userId);

    // Update user online status
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Join user to their chat rooms
    try {
      const userChats = await Chat.find({
        "participants.userId": userId,
      }).select("_id");

      userChats.forEach((chat) => {
        socket.join(`chat_${chat._id}`);
      });

      // Notify contacts about user coming online
      await notifyContactsStatusChange(userId, true, io);
    } catch (error) {
      console.error("Error joining chat rooms:", error);
    }

    // Handle user entering a specific chat (viewing chat screen)
    socket.on("enterChat", async (chatId) => {
      try {
        console.log(`User ${userId} entered chat ${chatId}`);
        // Set user's active chat
        userActiveChatMap.set(userId, chatId);

        // Mark all messages in this chat as read
        const chat = await Chat.findById(chatId);
        if (chat) {
          await chat.markAsRead(userId);

          // Notify other participants that messages were read
          const otherParticipants = chat.participants.filter(
            (p) => p.userId.toString() !== userId
          );

          otherParticipants.forEach((participant) => {
            const participantSocketId = userSocketMap.get(
              participant.userId.toString()
            );
            if (participantSocketId) {
              io.to(participantSocketId).emit("messagesRead", {
                chatId,
                readBy: userId,
                readAt: new Date(),
              });
            }
          });

          // Emit updated chat list to user (with unread count = 0)
          socket.emit("chatUpdated", {
            chatId,
            unreadCount: 0,
          });
        }
      } catch (error) {
        console.error("Error entering chat:", error);
      }
    });

    // Handle user leaving a specific chat
    socket.on("leaveChat", (chatId) => {
      console.log(`User ${userId} left chat ${chatId}`);
      userActiveChatMap.delete(userId);
    });

    // Handle typing indicator
    socket.on("typing", async ({ chatId, isTyping }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        // Check if user is participant
        const isParticipant = chat.participants.some(
          (p) => p.userId.toString() === userId
        );

        if (!isParticipant) return;

        // Emit to other participants in the chat
        socket.to(`chat_${chatId}`).emit("userTyping", {
          chatId,
          userId,
          userName: socket.user.name,
          isTyping,
        });
      } catch (error) {
        console.error("Error handling typing:", error);
      }
    });

    // Handle message delivery confirmation
    socket.on("messageDelivered", async ({ messageId, chatId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const message = chat.messages.id(messageId);
        if (!message) return;

        // Add to delivered list if not already there
        const alreadyDelivered = message.deliveredTo.some(
          (d) => d.userId.toString() === userId
        );

        if (!alreadyDelivered) {
          message.deliveredTo.push({
            userId: userId,
            deliveredAt: new Date(),
          });

          // Update message status
          if (message.status === "sent") {
            message.status = "delivered";
          }

          await chat.save();

          // Notify sender about delivery
          const senderSocketId = userSocketMap.get(message.senderId.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit("messageStatusUpdate", {
              messageId,
              chatId,
              status: "delivered",
              deliveredBy: userId,
              deliveredAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("Error updating message delivery:", error);
      }
    });

    // Handle message seen confirmation
    socket.on("messageSeen", async ({ messageId, chatId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const message = chat.messages.id(messageId);
        if (!message) return;

        // Add to seen list if not already there
        const alreadySeen = message.seenBy.some(
          (s) => s.userId.toString() === userId
        );

        if (!alreadySeen) {
          message.seenBy.push({
            userId: userId,
            seenAt: new Date(),
          });

          message.status = "seen";
          await chat.save();

          // Notify sender about seen status
          const senderSocketId = userSocketMap.get(message.senderId.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit("messageStatusUpdate", {
              messageId,
              chatId,
              status: "seen",
              seenBy: userId,
              seenAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("Error updating message seen:", error);
      }
    });

    socket.on("messageError", async ({ name }) => {
      console.log("Error sending message:", name);
    });

    // Handle new message sending
    socket.on("sendMessage", async (payload) => {
      console.log("📦 Received sendMessage payload:", payload);

      const {
        chatId,
        content,
        messageType = "text",
        fileUrl,
        fileName,
        fileSize,
      } = payload || {};

      try {
        const chat = await Chat.findById(chatId).populate(
          "participants.userId",
          "name avatar isOnline socketId"
        );

        if (!chat) return;

        // Validate sender is a participant
        const isParticipant = chat.participants.some(
          (p) =>
            (p.userId?._id?.toString?.() || p.userId?.toString?.()) === userId
        );

        if (!isParticipant) return;

        // Prepare new message
        const message = {
          senderId: userId,
          content: content || (fileUrl ? fileName : ""),
          messageType,
          fileUrl,
          fileName,
          fileSize,
          status: "sent",
        };

        // Push new message
        chat.messages.push(message);

        const otherParticipants = chat.participants.filter(
          (p) => p.userId.toString() !== userId
        );

        const participantsNotViewingChat = otherParticipants.filter((p) => {
          const participantId = p.userId._id.toString();
          return userActiveChatMap.get(participantId) !== chatId;
        });

        const participantIdsToUpdate = participantsNotViewingChat.map((p) =>
          p.userId._id.toString()
        );

        chat.incrementUnreadCount(userId, participantIdsToUpdate);

        await chat.save();

        // Re-fetch latest populated message
        const latestChat = await Chat.findById(chatId)
          .populate("messages.senderId", "name avatar")
          .lean(); // Use lean to avoid Mongoose document overhead

        const newMessage = latestChat.messages[latestChat.messages.length - 1];

        // Get online participants
        const onlineParticipants = otherParticipants.filter((p) =>
          userSocketMap.has(p.userId._id.toString())
        );

        if (onlineParticipants.length > 0) {
          const updates = [];

          onlineParticipants.forEach((participant) => {
            const participantId = participant.userId._id.toString();
            const participantSocketId = userSocketMap.get(participantId);

            const isViewingChat =
              !participantsNotViewingChat.includes(participantId);

            // Emit message to online participant
            if (participantSocketId) {
              io.to(participantSocketId).emit("newMessage", {
                chatId: chat._id,
                message: newMessage,
                chat: {
                  _id: chat._id,
                  name: chat.name,
                  type: chat.type,
                  lastMessage: chat.lastMessage,
                  unreadCount: isViewingChat ? 0 : participant.unreadCount,
                },
              });
            }

            // Queue DB update for delivery
            updates.push(
              Chat.updateOne(
                { _id: chatId, "messages._id": newMessage._id },
                {
                  $set: { "messages.$.status": "delivered" },
                  $addToSet: {
                    "messages.$.deliveredTo": {
                      userId: participantId,
                      deliveredAt: new Date(),
                    },
                  },
                }
              )
            );
          });

          await Promise.all(updates); // run all updates concurrently
        }

        // Emit back to sender
        socket.emit("messageSent", {
          chatId: chat._id,
          message: newMessage,
        });
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.name} disconnected`);

      // Remove from mapping
      userSocketMap.delete(userId);
      socketUserMap.delete(socket.id);
      userActiveChatMap.delete(userId);

      // Update user offline status
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        socketId: null,
        lastSeen: new Date(),
      });

      // Notify contacts about user going offline
      await notifyContactsStatusChange(userId, false, io);
    });
  });
};

// Helper function to notify contacts about status change
async function notifyContactsStatusChange(userId, isOnline, io) {
  try {
    // Find all chats where this user is a participant
    const userChats = await Chat.find({
      "participants.userId": userId,
    }).populate("participants.userId", "_id");

    // Get all unique contact IDs
    const contactIds = new Set();
    userChats.forEach((chat) => {
      chat.participants.forEach((participant) => {
        if (participant.userId._id.toString() !== userId) {
          contactIds.add(participant.userId._id.toString());
        }
      });
    });

    // Notify each contact about status change
    contactIds.forEach((contactId) => {
      const contactSocketId = userSocketMap.get(contactId);
      if (contactSocketId) {
        io.to(contactSocketId).emit("userStatusChange", {
          userId,
          isOnline,
          lastSeen: new Date(),
        });
      }
    });
  } catch (error) {
    console.error("Error notifying contacts about status change:", error);
  }
}

// Helper functions for external use
export function getUserSocketId(userId) {
  return userSocketMap.get(userId);
}

export function getSocketUserId(socketId) {
  return socketUserMap.get(socketId);
}

export function isUserOnline(userId) {
  return userSocketMap.has(userId);
}

export function isUserViewingChat(userId, chatId) {
  return userActiveChatMap.get(userId) === chatId;
}