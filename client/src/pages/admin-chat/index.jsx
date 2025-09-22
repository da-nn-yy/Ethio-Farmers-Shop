import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { chatService } from '../../services/apiService.js';

const AdminChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock chat data
  const mockChats = [
    {
      id: 1,
      participants: [
        { id: 1, name: 'Alemayehu Kebede', role: 'farmer', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
        { id: 2, name: 'Meron Tadesse', role: 'buyer', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }
      ],
      lastMessage: 'Thank you for the quick delivery!',
      lastMessageTime: '2024-01-20T10:30:00Z',
      status: 'active',
      unreadCount: 2,
      orderId: 'ORD-001'
    },
    {
      id: 2,
      participants: [
        { id: 3, name: 'Getachew Molla', role: 'farmer', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg' },
        { id: 4, name: 'Hanna Wolde', role: 'buyer', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }
      ],
      lastMessage: 'When will the coffee be ready?',
      lastMessageTime: '2024-01-20T09:15:00Z',
      status: 'active',
      unreadCount: 0,
      orderId: 'ORD-002'
    },
    {
      id: 3,
      participants: [
        { id: 5, name: 'Dawit Haile', role: 'farmer', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
        { id: 6, name: 'Tigist Bekele', role: 'buyer', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }
      ],
      lastMessage: 'The maize quality is excellent',
      lastMessageTime: '2024-01-19T16:45:00Z',
      status: 'resolved',
      unreadCount: 0,
      orderId: 'ORD-003'
    }
  ];

  const mockMessages = [
    {
      id: 1,
      chatId: 1,
      senderId: 1,
      senderName: 'Alemayehu Kebede',
      message: 'Hello! I have your order ready for pickup.',
      timestamp: '2024-01-20T10:00:00Z',
      type: 'text'
    },
    {
      id: 2,
      chatId: 1,
      senderId: 2,
      senderName: 'Meron Tadesse',
      message: 'Great! What time works best for you?',
      timestamp: '2024-01-20T10:15:00Z',
      type: 'text'
    },
    {
      id: 3,
      chatId: 1,
      senderId: 1,
      senderName: 'Alemayehu Kebede',
      message: 'Anytime after 2 PM works for me.',
      timestamp: '2024-01-20T10:20:00Z',
      type: 'text'
    },
    {
      id: 4,
      chatId: 1,
      senderId: 2,
      senderName: 'Meron Tadesse',
      message: 'Perfect! I\'ll come around 3 PM. Thank you for the quick delivery!',
      timestamp: '2024-01-20T10:30:00Z',
      type: 'text'
    }
  ];

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      const data = await chatService.getConversations();
      setChats(data.conversations || mockChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      // Fallback to mock data
      setChats(mockChats);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const data = await chatService.getMessages(chatId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Fallback to mock data
      const chatMessages = mockMessages.filter(msg => msg.chatId === chatId);
      setMessages(chatMessages);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await chatService.sendMessage(selectedChat.id, newMessage);
      setNewMessage('');
      // Reload messages to get the latest
      loadMessages(selectedChat.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined, null, or empty status
    if (!status || typeof status !== 'string') {
      status = 'active'; // Default fallback
    }
    
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: 'MessageCircle' },
      resolved: { color: 'bg-gray-100 text-gray-800', icon: 'CheckCircle' },
      blocked: { color: 'bg-red-100 text-red-800', icon: 'XCircle' }
    };
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Shield" size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 mx-auto max-w-7xl lg:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Chat Management</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Monitor and moderate user conversations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" iconName="Download">Export Chats</Button>
                <Button variant="primary" size="sm" iconName="MessageSquare">New Chat</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mx-auto max-w-7xl lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <Card className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col space-y-4">
                    <div className="relative">
                      <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-3 p-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className="p-8 text-center">
                      <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400">No conversations found</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChat(chat)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                            selectedChat?.id === chat.id
                              ? 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex -space-x-2">
                              {chat.participants.slice(0, 2).map((participant, index) => (
                                <img
                                  key={participant.id}
                                  src={participant.avatar}
                                  alt={participant.name}
                                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                                />
                              ))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                  {chat.participants.map(p => p.name).join(', ')}
                                </p>
                                <div className="flex items-center space-x-2">
                                  {chat.unreadCount > 0 && (
                                    <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                      {chat.unreadCount}
                                    </span>
                                  )}
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatTime(chat.lastMessageTime)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-2">
                                {chat.lastMessage}
                              </p>
                              <div className="flex items-center justify-between">
                                {getStatusBadge(chat.status)}
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {chat.orderId}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex -space-x-2">
                            {selectedChat.participants.slice(0, 2).map((participant, index) => (
                              <img
                                key={participant.id}
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                              />
                            ))}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {selectedChat.participants.map(p => p.name).join(', ')}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(selectedChat.status)}
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Order: {selectedChat.orderId}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" iconName="Phone">Call</Button>
                          <Button variant="outline" size="sm" iconName="MoreHorizontal" />
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 999 ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === 999
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === 999
                                ? 'text-blue-100'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          iconName="Send"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Choose a chat from the list to view messages
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminChat;
