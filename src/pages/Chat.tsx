import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import { Chat as ChatType } from '../types';

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectChat = (chat: ChatType) => {
    setSelectedChat(chat);
    setShowSidebar(false); // Hide sidebar on mobile when chat is selected
  };

  const handleBack = () => {
    setShowSidebar(true);
    setSelectedChat(null);
  };

  const handleNewChat = () => {
    // Create new chat logic
    console.log('Create new chat');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          <div className="flex h-full">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'block' : 'hidden'} lg:block`}>
              <ChatSidebar
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
              />
            </div>

            {/* Chat Interface */}
            <div className={`flex-1 ${!showSidebar ? 'block' : 'hidden'} lg:block`}>
              <ChatInterface
                selectedChat={selectedChat}
                onBack={handleBack}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;