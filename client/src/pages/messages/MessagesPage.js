import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { useAuth } from '../auth/contexts/AuthContext';
import { useSocket } from '../auth/contexts/SocketContext';
import { 
  MessageCircle, 
  Send, 
  Search, 
  CheckCheck,
  ArrowLeft
} from 'lucide-react';

const MessagesPage = () => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery(
    ['conversations'],
    () => api.get('/api/messages/conversations').then(res => res.data),
    {
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    }
  );

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery(
    ['messages', selectedConversation],
    () => api.get(`/api/messages/${selectedConversation}`).then(res => res.data),
    {
      enabled: !!selectedConversation,
      refetchInterval: 2000, // Refetch every 2 seconds for real-time chat
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    (messageData) => api.post(`/api/messages/${selectedConversation}`, messageData),
    {
      onSuccess: () => {
        setNewMessage('');
        queryClient.invalidateQueries(['messages', selectedConversation]);
        queryClient.invalidateQueries(['conversations']);
      },
    }
  );

  // Mark messages as read mutation
  const markAsReadMutation = useMutation(
    (orderId) => api.put(`/api/messages/${orderId}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['conversations']);
      },
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation, markAsReadMutation]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({ message: newMessage.trim() });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredConversations = conversationsData?.conversations?.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.otherUser.username.toLowerCase().includes(searchLower) ||
      conv.product.title.toLowerCase().includes(searchLower) ||
      conv.orderNumber.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (conversationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.orderId}
                        onClick={() => setSelectedConversation(conversation.orderId)}
                        className={`p-4 cursor-pointer hover:bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 border-l-4 transition-colors ${
                          selectedConversation === conversation.orderId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {conversation.otherUser.username.charAt(0).toUpperCase()}
                            </div>
                            {isUserOnline(conversation.otherUser._id) && (
                              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-white truncate">
                                {conversation.otherUser.username}
                              </h3>
                              <div className="flex items-center space-x-1">
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {conversation.latestMessage && formatTime(conversation.latestMessage.timestamp)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 truncate mb-1">
                              {conversation.product.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.latestMessage?.message || 'No messages yet'}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                Order #{conversation.orderNumber}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                conversation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                conversation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {conversation.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'No conversations match your search.' : 'Start a conversation by placing an order.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {conversationsData?.conversations?.find(c => c.orderId === selectedConversation)?.otherUser.username.charAt(0).toUpperCase()}
                        </div>
                        {isUserOnline(conversationsData?.conversations?.find(c => c.orderId === selectedConversation)?.otherUser._id) && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="font-semibold text-white">
                            {conversationsData?.conversations?.find(c => c.orderId === selectedConversation)?.otherUser.username}
                          </h2>
                          {isUserOnline(conversationsData?.conversations?.find(c => c.orderId === selectedConversation)?.otherUser._id) && (
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {conversationsData?.conversations?.find(c => c.orderId === selectedConversation)?.product.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Order #{conversationsData?.conversations?.find(c => c.orderId === selectedConversation)?.orderNumber}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : messagesData?.messages?.length > 0 ? (
                      messagesData.messages.map((message, index) => {
                        const isOwnMessage = message.sender._id === user._id;
                        return (
                          <div
                            key={index}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}>
                              {/* Sender name */}
                              <div className={`text-xs font-medium mb-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                              }`}>
                                {message.sender.username}
                              </div>
                              <p className="text-sm">{message.message}</p>
                              <div className={`flex items-center justify-end mt-1 space-x-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <span className="text-xs">
                                  {formatTime(message.timestamp)}
                                </span>
                                {isOwnMessage && (
                                  <CheckCheck className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
                        <p className="text-gray-500">Start the conversation by sending a message.</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sendMessageMutation.isLoading}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">Select a conversation</h2>
                  <p className="text-gray-300">Choose a conversation from the list to start messaging.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;