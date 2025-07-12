import Chat from '../models/Chat.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/chat';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// @desc    Get user chats with enhanced data
// @route   GET /api/chats
// @access  Private
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.userId': req.user.id,
      isActive: true
    })
      .populate('participants.userId', 'name email avatar isOnline lastSeen')
      .populate('lastMessage.senderId', 'name avatar')
      .sort({ 'lastMessage.timestamp': -1 });

    // Process chats to include user-specific data
    const processedChats = chats.map(chat => {
      const userParticipant = chat.participants.find(
        p => p.userId._id.toString() === req.user.id
      );
      
      const otherParticipants = chat.participants.filter(
        p => p.userId._id.toString() !== req.user.id
      );

      // For direct chats, get the other user's info
      let chatName = chat.name;
      let chatImage = chat.groupImage;
      let isOnline = false;
      let lastSeen = null;

      if (chat.type === 'direct' && otherParticipants.length > 0) {
        const otherUser = otherParticipants[0].userId;
        chatName = otherUser.name;
        chatImage = otherUser.getAvatarUrl();
        isOnline = otherUser.isOnline;
        lastSeen = otherUser.lastSeen;
      }

      return {
        ...chat.toObject(),
        name: chatName,
        image: chatImage,
        isOnline,
        lastSeen,
        unreadCount: userParticipant?.unreadCount || 0,
        isPinned: userParticipant?.isPinned || false,
        isMuted: userParticipant?.mutedUntil && new Date(userParticipant.mutedUntil) > new Date()
      };
    });

    // Sort: pinned chats first, then by last message timestamp
    processedChats.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0);
    });

    res.status(200).json({
      success: true,
      count: processedChats.length,
      data: processedChats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single chat with messages
// @route   GET /api/chats/:id
// @access  Private
export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.userId', 'name email avatar isOnline lastSeen')
      .populate('messages.senderId', 'name avatar')
      .populate('messages.seenBy.userId', 'name')
      .populate('messages.deliveredTo.userId', 'name');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.userId._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Mark chat as read for this user
    await chat.markAsRead(req.user.id);

    // Emit read receipt to other participants
    const otherParticipants = chat.participants.filter(
      p => p.userId._id.toString() !== req.user.id
    );

    otherParticipants.forEach(participant => {
      req.io.to(`user_${participant.userId._id}`).emit('messagesRead', {
        chatId: chat._id,
        readBy: req.user.id,
        readAt: new Date()
      });
    });

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
export const createChat = async (req, res) => {
  try {
    const { participants, type, name } = req.body;

    // Add current user to participants if not included
    const participantIds = [...new Set([req.user.id, ...participants])];

    // For direct chats, check if chat already exists
    if (type === 'direct' && participantIds.length === 2) {
      const existingChat = await Chat.findOne({
        type: 'direct',
        'participants.userId': { $all: participantIds }
      }).populate('participants.userId', 'name email avatar isOnline lastSeen');

      if (existingChat) {
        return res.status(200).json({
          success: true,
          data: existingChat
        });
      }
    }

    // Validate participants exist
    const users = await User.find({ _id: { $in: participantIds } });
    if (users.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some participants not found'
      });
    }

    const chatParticipants = participantIds.map(userId => ({
      userId,
      role: userId === req.user.id ? 'admin' : 'member',
      unreadCount: 0
    }));

    const chat = await Chat.create({
      name: type === 'group' ? name : undefined,
      type,
      participants: chatParticipants
    });

    await chat.populate('participants.userId', 'name email avatar isOnline lastSeen');

    // Notify other participants about new chat
    participantIds.forEach(participantId => {
      if (participantId !== req.user.id) {
        req.io.to(`user_${participantId}`).emit('newChat', chat);
      }
    });

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { content, messageType = 'text', replyTo } = req.body;
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;

    // Handle file upload if present
    if (req.file) {
      fileUrl = `/uploads/chat/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    const chat = await Chat.findById(req.params.id)
      .populate('participants.userId', 'name avatar isOnline socketId');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.userId._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    const message = {
      senderId: req.user.id,
      content: content || (fileUrl ? fileName : ''),
      messageType: req.file ? 'image' : messageType,
      fileUrl,
      fileName,
      fileSize,
      replyTo,
      status: 'sent'
    };

    chat.messages.push(message);
    
    // Increment unread count for other participants
    chat.incrementUnreadCount(req.user.id);
    
    await chat.save();

    // Populate the new message
    await chat.populate('messages.senderId', 'name avatar');
    const newMessage = chat.messages[chat.messages.length - 1];

    // Get online participants
    const onlineParticipants = chat.participants.filter(
      p => p.userId._id.toString() !== req.user.id && p.userId.isOnline
    );

    // Get offline participants
    const offlineParticipants = chat.participants.filter(
      p => p.userId._id.toString() !== req.user.id && !p.userId.isOnline
    );

    // Mark as delivered for online users
    if (onlineParticipants.length > 0) {
      newMessage.status = 'delivered';
      onlineParticipants.forEach(participant => {
        newMessage.deliveredTo.push({
          userId: participant.userId._id,
          deliveredAt: new Date()
        });
      });
      await chat.save();
    }

    // Emit real-time message to online participants
    onlineParticipants.forEach(participant => {
      req.io.to(`user_${participant.userId._id}`).emit('newMessage', {
        chatId: chat._id,
        message: newMessage,
        chat: {
          _id: chat._id,
          name: chat.name,
          type: chat.type,
          lastMessage: chat.lastMessage
        }
      });
    });

    // For offline users, they'll get messages when they reconnect via API

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload file for message
// @route   POST /api/chats/:id/upload
// @access  Private
export const uploadFile = upload.single('file');

// @desc    Pin/Unpin chat
// @route   PUT /api/chats/:id/pin
// @access  Private
export const togglePinChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const participant = chat.participants.find(
      p => p.userId.toString() === req.user.id
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    participant.isPinned = !participant.isPinned;
    await chat.save();

    res.status(200).json({
      success: true,
      data: { isPinned: participant.isPinned }
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mute/Unmute chat
// @route   PUT /api/chats/:id/mute
// @access  Private
export const toggleMuteChat = async (req, res) => {
  try {
    const { duration } = req.body; // duration in hours, 0 to unmute
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const participant = chat.participants.find(
      p => p.userId.toString() === req.user.id
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (duration > 0) {
      participant.mutedUntil = new Date(Date.now() + duration * 60 * 60 * 1000);
    } else {
      participant.mutedUntil = undefined;
    }

    await chat.save();

    res.status(200).json({
      success: true,
      data: { mutedUntil: participant.mutedUntil }
    });
  } catch (error) {
    console.error('Error toggling mute:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get online users
// @route   GET /api/chats/users/online
// @access  Private
export const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.find({
      isOnline: true,
      _id: { $ne: req.user.id }
    }).select('name email avatar lastSeen');

    res.status(200).json({
      success: true,
      data: onlineUsers
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search users for new chat
// @route   GET /api/chats/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('name email avatar isOnline lastSeen').limit(20);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export { upload };