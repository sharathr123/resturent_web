import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageCircle, Pin, MoreVertical, Users, UserPlus } from 'lucide-react';
import { Chat, User } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../lib/socket';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import { formatTime, formatDate } from '../../lib/utils';
import { getUserDetails } from '../../service/asyncstorage';

interface ChatSidebarProps {
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedChat,
  onSelectChat,
  onNewChat,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const user = getUserDetails();

  useEffect(() => {
    fetchChats();
    setupSocketListeners();

    return () => {
      socket.off('newMessage');
      socket.off('newChat');
      socket.off('userStatusChange');
      socket.off('messagesRead');
    };
  }, []);

  const setupSocketListeners = () => {
    socket.on('newMessage', (data: any) => {
      updateChatWithNewMessage(data);
    });

    socket.on('newChat', (newChat: any) => {
      setChats(prev => [newChat, ...prev]);
    });

    socket.on('userStatusChange', (data: any) => {
      updateUserStatus(data);
    });

    socket.on('messagesRead', (data: any) => {
      updateChatReadStatus(data);
    });

    // Listen for chat presence updates
        socket.on('chatPresenceUpdate', (data: any) => {
      updateChatPresence(data);
    });

  };

   // Add function to handle chat presence updates
  const updateChatPresence = (data: any) => {
    // This can be used to show if other users are currently viewing the chat
    // For now, we'll just log it
    console.log('Chat presence update:', data);
  };

  const fetchChats = async () => {
    try {
      const response = await api.getChats();
      if (response.success && response.data) {
        setChats(response.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChatWithNewMessage = (data: any) => {
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat._id === data.chatId) {
          return {
            ...chat,
            lastMessage: data.chat.lastMessage,
            unreadCount: chat._id === selectedChat?._id ? 0 : (chat.unreadCount || 0) + 1
          };
        }
        return chat;
      });

      // Sort chats: pinned first, then by last message timestamp
      return updatedChats.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastMessage?.timestamp || 0).getTime() -
          new Date(a.lastMessage?.timestamp || 0).getTime();
      });
    });
  };

  const updateUserStatus = (data: any) => {
    setChats(prev => prev.map(chat => {
      if (chat.type === 'direct') {
        // Find if this chat involves the user whose status changed
        const otherUser = chat.participantDetails?.find(p => p._id === data.userId);
        if (otherUser) {
          return {
            ...chat,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen
          };
        }
      }
      return chat;
    }));
  };

  const updateChatReadStatus = (data: any) => {
    setChats(prev => prev.map(chat => {
      if (chat._id === data.chatId) {
        return {
          ...chat,
          unreadCount: 0
        };
      }
      return chat;
    }));
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await api.searchUsers(query);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const createDirectChat = async (otherUser: User) => {
    try {
      const response = await api.createChat({
        participants: [otherUser._id!],
        type: 'direct'
      });

      if (response.success && response.data) {
        setShowNewChatModal(false);
        setUserSearchQuery('');
        setUsers([]);
        onSelectChat(response.data);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    const chatName = chat.name || 'Unknown';
    const lastMessageContent = chat.lastMessage?.content || '';

    return chatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.lastMessage) return 'No messages yet';

    const { content, messageType, senderId } = chat.lastMessage;
    const isOwnMessage = senderId === user?.id;
    const prefix = isOwnMessage ? 'You: ' : '';

    switch (messageType) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'file':
        return `${prefix}📎 File`;
      default:
        return `${prefix}${content}`;
    }
  };

  const getOnlineStatus = (chat: Chat) => {
    if (chat.type !== 'direct') return null;

    return chat.isOnline ? (
      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5" />
    ) : null;
  };

  return (
    <>
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNewChatModal(true)}>
                <UserPlus size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No chats found' : 'No conversations'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try a different search term' : 'Start a new conversation to get help'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowNewChatModal(true)}>
                  <UserPlus size={16} className="mr-2" />
                  Start New Chat
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => onSelectChat(chat)}
                    className={`p-4 cursor-pointer transition-colors relative ${selectedChat?._id === chat._id ? 'bg-orange-50 border-r-2 border-orange-600' : ''
                      }`}
                  >
                    {chat.isPinned && (
                      <Pin className="absolute top-2 right-2 w-3 h-3 text-gray-400" />
                    )}

                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar
                          src={chat.image}
                          name={chat.name}
                          size="lg"
                        />
                        {getOnlineStatus(chat)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate flex items-center">
                            {chat.name || 'Unknown'}
                            {chat.type === 'group' && (
                              <Users size={14} className="ml-1 text-gray-400" />
                            )}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.lastMessage.timestamp)}
                              </span>
                            )}
                            {(chat.unreadCount ?? 0) > 0 && (
                              <Badge variant="error" size="sm">
                                {(chat.unreadCount ?? 0) > 99 ? '99+' : chat.unreadCount}
                              </Badge>
                            )}

                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {getLastMessagePreview(chat)}
                          </p>

                          {chat.type === 'direct' && !chat.isOnline && chat.lastSeen && (
                            <span className="text-xs text-gray-400 ml-2">
                              {formatTime(chat.lastSeen)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => {
          setShowNewChatModal(false);
          setUserSearchQuery('');
          setUsers([]);
        }}
        title="Start New Chat"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => {
                setUserSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {searchingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {userSearchQuery.length < 2 ? 'Type to search users' : 'No users found'}
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => createDirectChat(user)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar
                        src={user.avatar}
                        name={user.name}
                        size="md"
                      />
                      {user.isOnline && (
                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    {user.isOnline ? (
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {user.lastSeen ? formatTime(user.lastSeen) : 'Offline'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChatSidebar;