import express from 'express';
import {
  getUserChats,
  getChat,
  createChat,
  sendMessage,
  uploadFile,
  togglePinChat,
  toggleMuteChat,
  getOnlineUsers,
  searchUsers
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Chat routes
router.get('/', protect, getUserChats);
router.post('/', protect, createChat);
router.get('/users/online', protect, getOnlineUsers);
router.get('/users/search', protect, searchUsers);

// Individual chat routes
router.get('/:id', protect, getChat);
router.post('/:id/messages', protect, uploadFile, sendMessage);
router.post('/:id/upload', protect, uploadFile, (req, res) => {
  res.json({ success: true, fileUrl: `/uploads/chat/${req.file.filename}` });
});
router.put('/:id/pin', protect, togglePinChat);
router.put('/:id/mute', protect, toggleMuteChat);

export default router;