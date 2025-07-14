import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Pin,
  VolumeX,
  Volume2,
  Check,
  CheckCheck,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Chat, Message } from '../../types';
import { api } from '../../lib/api';
import { socket } from '../../lib/socket';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { formatTime, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import { getUserDetails } from '../../service/asyncstorage';

interface ChatInterfaceProps {
  selectedChat: Chat | null;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedChat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = getUserDetails();

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Track that user is viewing this chat
      socket.enterChat(selectedChat._id!);
      markMessagesAsRead();
    }

    return () => {
      if (selectedChat) {
        // Track that user left this chat
        socket.leaveChat(selectedChat._id!);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced socket event handlers
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.chatId === selectedChat?._id) {
        setMessages(prev => [...prev, data.message]);
        // Auto-mark as delivered and seen since user is viewing this chat
        socket.markMessageDelivered(data.message._id, data.chatId);
        socket.markMessageSeen(data.message._id, data.chatId);
        scrollToBottom();
      }
    };

    const handleUserStatusChange = (data: { userId: string; isOnline: boolean; lastSeen: string }) => {
      // Update online status in real-time
      if (selectedChat?.type === 'direct') {
        const otherUser = selectedChat.participantDetails?.find(p => p._id === data.userId);
        if (otherUser) {
          // Update chat's online status
          // This would need to be handled by parent component or context
        }
      }
    };

    const handleTyping = (data: { chatId: string; userId: string; userName: string; isTyping: boolean }) => {
      if (data.chatId === selectedChat?._id && data.userId !== user?.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(id => id !== data.userId), data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
      }
    };

    const handleMessageStatusUpdate = (data: any) => {
      if (data.chatId === selectedChat?._id) {
        setMessages(prev => prev.map(msg =>
          msg._id === data.messageId
            ? { ...msg, status: data.status }
            : msg
        ));
      }
    };

    const handleMessageSent = (data: any) => {
      if (data.chatId === selectedChat?._id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('messageStatusUpdate', handleMessageStatusUpdate);
    socket.on('messageSent', handleMessageSent);
    socket.on('userStatusChange', handleUserStatusChange);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('messageStatusUpdate', handleMessageStatusUpdate);
      socket.off('messageSent', handleMessageSent);
      socket.off('userStatusChange', handleUserStatusChange);
    };
  }, [selectedChat, user]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const response = await api.getChat(selectedChat._id!);
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = () => {
    if (!selectedChat || !user) return;

    // Mark all unread messages as seen
    messages.forEach(message => {
      if (message.senderId !== user.id && message.status !== 'seen') {
        socket.markMessageSeen(message._id!, selectedChat._id!);
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socket.sendTyping(selectedChat._id!, false);
    }

    try {
      if (selectedFile) {
        // Upload file first, then send message via socket
        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);
        const uploadResponse = await fetch(`http://localhost:5002/api/chats/${selectedChat._id}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          // Send message via socket with file info
          socket.sendMessage({
            chatId: selectedChat._id!,
            content: messageContent,
            messageType: selectedFile.type.startsWith('image/') ? 'image' : 'file',
            fileUrl: uploadResult.fileUrl,
            fileName: selectedFile.name,
            fileSize: selectedFile.size
          });
        }

        setSelectedFile(null);
        setPreviewUrl(null);
        setUploading(false);
      } else {
        // Send text message via socket
        socket.sendMessage({
          chatId: selectedChat._id!,
          content: messageContent,
          messageType: 'text'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setUploading(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      socket.sendTyping(selectedChat?._id!, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.sendTyping(selectedChat?._id!, false);
    }, 1000);

    // Stop typing if message is empty
    if (value.length === 0 && isTyping) {
      setIsTyping(false);
      socket.sendTyping(selectedChat?._id!, false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePinChat = async () => {
    if (!selectedChat) return;

    try {
      await api.togglePinChat(selectedChat._id!);
      toast.success(selectedChat.isPinned ? 'Chat unpinned' : 'Chat pinned');
    } catch (error) {
      toast.error('Failed to update chat');
    }
  };

  const toggleMuteChat = async () => {
    if (!selectedChat) return;

    try {
      const duration = selectedChat.isMuted ? 0 : 24; // 24 hours or unmute
      await api.toggleMuteChat(selectedChat._id!, duration);
      toast.success(selectedChat.isMuted ? 'Chat unmuted' : 'Chat muted for 24 hours');
    } catch (error) {
      toast.error('Failed to update chat');
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId === user?.id) {
      switch (message.status) {
        case 'sent':
          return <Check size={14} className="text-gray-400" />;
        case 'delivered':
          return <CheckCheck size={14} className="text-gray-400" />;
        case 'seen':
          return <CheckCheck size={14} className="text-blue-500" />;
        default:
          return null;
      }
    }
    return null;
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === user?.id;
    const messageTime = formatTime(message.createdAt);

    return (
      <motion.div
        key={message._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!isOwnMessage && (
            <Avatar
              src={message.sender?.avatar}
              name={message.sender?.name}
              size="sm"
            />
          )}

          <div
            className={`px-4 py-2 rounded-lg ${isOwnMessage
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-900'
              }`}
          >
            {message.messageType === 'image' && message.fileUrl && (
              <div className="mb-2">
                <img
                  src={`http://localhost:5002${message.fileUrl}`}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}

            {message.messageType === 'file' && message.fileUrl && (
              <div className="flex items-center space-x-2 mb-2">
                <Paperclip size={16} />
                <a
                  href={`http://localhost:5002${message.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {message.fileName}
                </a>
              </div>
            )}

            {message.content && (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}

            <div className={`flex items-center justify-end space-x-1 mt-1 ${isOwnMessage ? 'text-orange-100' : 'text-gray-500'
              }`}>
              <span className="text-xs">{messageTime}</span>
              {getMessageStatus(message)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="relative">
              <Avatar
                src={selectedChat.image}
                name={selectedChat.name}
                size="md"
              />
              {selectedChat.type === 'direct' && selectedChat.isOnline && (
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5" />
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900">
                {selectedChat.name || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-500">
                {typingUsers.length > 0
                  ? 'Typing...'
                  : selectedChat.type === 'direct'
                    ? (selectedChat.isOnline ? 'Online' : `Last seen ${formatTime(selectedChat?.lastSeen)}`)
                    : `${selectedChat.participants?.length || 0} members`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Video size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={togglePinChat}>
              <Pin size={16} className={selectedChat.isPinned ? 'text-orange-600' : ''} />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleMuteChat}>
              {selectedChat.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => renderMessage(message))}
        </AnimatePresence>

        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-6 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <Paperclip size={20} className="text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={removeSelectedFile}>
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={16} />
          </Button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={uploading}
            />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile size={16} />
            </Button>
          </div>

          <Button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || uploading}
            className="rounded-full"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;