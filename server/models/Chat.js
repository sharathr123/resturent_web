import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    deliveredTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    seenBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    editedAt: Date,
    isEdited: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["direct", "group", "support"],
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["member", "admin"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastSeen: {
          type: Date,
          default: Date.now,
        },
        isPinned: {
          type: Boolean,
          default: false,
        },
        unreadCount: {
          type: Number,
          default: 0,
        },
        mutedUntil: Date,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      messageType: {
        type: String,
        enum: ["text", "image", "file", "system"],
        default: "text",
      },
      timestamp: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    groupImage: String,
    description: String,
    settings: {
      allowFileSharing: {
        type: Boolean,
        default: true,
      },
      maxParticipants: {
        type: Number,
        default: 50,
      },
      onlyAdminsCanMessage: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Update last message when a new message is added
chatSchema.pre("save", function (next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.content,
      senderId: lastMsg.senderId,
      messageType: lastMsg.messageType,
      timestamp: lastMsg.createdAt || new Date(),
    };
  }
  next();
});

// Method to get unread count for a specific user
chatSchema.methods.getUnreadCount = function (userId) {
  const participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );
  return participant ? participant.unreadCount : 0;
};

// Method to mark messages as read for a user
chatSchema.methods.markAsRead = async function (userId) {
  const participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.unreadCount = 0;
    participant.lastSeen = new Date();

    // Mark messages as seen
    this.messages.forEach((message) => {
      if (message.senderId.toString() !== userId.toString()) {
        const alreadySeen = message.seenBy.some(
          (seen) => seen.userId.toString() === userId.toString()
        );
        if (!alreadySeen) {
          message.seenBy.push({
            userId: userId,
            seenAt: new Date(),
          });
          message.status = "seen";
        }
      }
    });

    await this.save();
  }
};

// Method to increment unread count for participants (except sender and users currently viewing chat)
chatSchema.methods.incrementUnreadCount = function (
  senderId,
  excludeUserIds = []
) {
  this.participants.forEach((participant) => {
    const participantId = participant.userId.toString();
    if (
      participantId !== senderId.toString() &&
      !excludeUserIds.includes(participantId)
    ) {
      participant.unreadCount += 1;
    }
  });
};

export default mongoose.model("Chat", chatSchema);
