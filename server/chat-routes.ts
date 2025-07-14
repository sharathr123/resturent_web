import { Router } from "express";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema, insertChatParticipantSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get user's chats with pagination
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const chats = await storage.getChatsByUser(userId, limit, offset);
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// Get specific chat
router.get("/:id", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const chat = await storage.getChat(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if user is a participant
    const participants = await storage.getChatParticipants(chatId);
    const isParticipant = participants.some(p => p.userId === userId && p.isActive);
    
    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// Create new chat
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = insertChatSchema.parse({
      ...req.body,
      creatorId: userId,
    });

    const chat = await storage.createChat(validatedData);
    
    // Add creator as participant
    await storage.addChatParticipant({
      chatId: chat.id,
      userId: userId,
      role: "owner",
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

// Get chat messages with pagination
router.get("/:id/messages", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a participant
    const participants = await storage.getChatParticipants(chatId);
    const isParticipant = participants.some(p => p.userId === userId && p.isActive);
    
    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await storage.getMessages(chatId, limit, offset);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message
router.post("/:id/messages", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a participant
    const participants = await storage.getChatParticipants(chatId);
    const isParticipant = participants.some(p => p.userId === userId && p.isActive);
    
    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    const validatedData = insertMessageSchema.parse({
      ...req.body,
      chatId,
      senderId: userId,
    });

    const message = await storage.createMessage(validatedData);
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get chat participants
router.get("/:id/participants", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a participant
    const participants = await storage.getChatParticipants(chatId);
    const isParticipant = participants.some(p => p.userId === userId && p.isActive);
    
    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// Add participant to chat
router.post("/:id/participants", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a participant with admin rights
    const participants = await storage.getChatParticipants(chatId);
    const currentParticipant = participants.find(p => p.userId === userId && p.isActive);
    
    if (!currentParticipant || !['owner', 'admin'].includes(currentParticipant.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const validatedData = insertChatParticipantSchema.parse({
      chatId,
      userId: req.body.userId,
      role: req.body.role || "member",
    });

    const participant = await storage.addChatParticipant(validatedData);
    res.status(201).json(participant);
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Failed to add participant" });
  }
});

// Remove participant from chat
router.delete("/:id/participants/:userId", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a participant with admin rights or removing themselves
    const participants = await storage.getChatParticipants(chatId);
    const currentParticipant = participants.find(p => p.userId === userId && p.isActive);
    
    if (!currentParticipant || 
        (userId !== targetUserId && !['owner', 'admin'].includes(currentParticipant.role))) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    await storage.removeChatParticipant(chatId, targetUserId);
    res.status(204).send();
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ error: "Failed to remove participant" });
  }
});

// Get online users
router.get("/users/online", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const onlineUsers = await storage.getOnlineUsers();
    res.json(onlineUsers);
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).json({ error: "Failed to fetch online users" });
  }
});

// Search for users to start new chats
router.get("/users/search", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    // This would need to be implemented in storage
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;