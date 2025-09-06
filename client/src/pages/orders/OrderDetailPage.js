import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Package, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/contexts/AuthContext';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [newMessage, setNewMessage] = useState('');

  // Fetch order details
  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    () => api.get(`/api/orders/${id}`).then(res => res.data),
    {
      enabled: !!id
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    (messageData) => api.post(`/api/orders/${id}/message`, messageData),
    {
      onSuccess: () => {
        toast.success('Message sent successfully');
        queryClient.invalidateQueries(['order', id]);
        setNewMessage('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send message');
      }
    }
  );

  // Update order status mutation
  const updateStatusMutation = useMutation(
    (statusData) => api.put(`/api/orders/${id}/status`, statusData),
    {
      onSuccess: () => {
        toast.success('Order status updated successfully');
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries(['orders']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      message: newMessage.trim()
    });
  };

  const handleStatusUpdate = (newStatus) => {
    updateStatusMutation.mutate({ status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/20';
      case 'paid': return 'text-blue-500 bg-blue-500/20';
      case 'processing': return 'text-purple-500 bg-purple-500/20';
      case 'delivered': return 'text-green-500 bg-green-500/20';
      case 'completed': return 'text-green-600 bg-green-600/20';
      case 'cancelled': return 'text-red-500 bg-red-500/20';
      case 'disputed': return 'text-orange-500 bg-orange-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'disputed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Order not found</h2>
          <p className="text-gray-300 mb-4">The order you're looking for doesn't exist</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isBuyer = user._id === order.buyer._id;
  const isSeller = user._id === order.seller._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-500 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Order Details</h1>
              <p className="text-gray-300 mt-1">Order #{order.orderNumber}</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium capitalize">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Order Number</h3>
                  <p className="text-white font-mono">{order.orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Order Date</h3>
                  <p className="text-white">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Total Amount</h3>
                  <p className="text-white font-semibold">${order.totalAmount}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Method</h3>
                  <p className="text-white capitalize">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Product Details</h2>
              
              <div className="flex items-start space-x-4">
                <img
                  src={order.product.images?.[0] || '/placeholder-product.jpg'}
                  alt={order.product.title}
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{order.product.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{order.product.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>Quantity: {order.quantity}</span>
                    <span>Price: ${order.product.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Delivery Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Delivery Method</h3>
                  <p className="text-white">{order.deliveryDetails.method}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Expected Delivery</h3>
                  <p className="text-white">{order.deliveryDetails.time}</p>
                </div>
                {order.deliveryDetails.deliveredAt && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Delivered At</h3>
                    <p className="text-white">{formatDate(order.deliveryDetails.deliveredAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Participants</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Buyer</h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                      {order.buyer.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{order.buyer.username}</p>
                      <p className="text-gray-400 text-sm">{order.buyer.email}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Seller</h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                      {order.seller.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{order.seller.username}</p>
                      <p className="text-gray-400 text-sm">{order.seller.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
              
              <div className="space-y-3">
                {/* Status Update Buttons */}
                {isBuyer && order.status === 'delivered' && (
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Delivery
                  </button>
                )}

                {isSeller && order.status === 'paid' && (
                  <button
                    onClick={() => handleStatusUpdate('processing')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Start Processing
                  </button>
                )}

                {isSeller && order.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate('delivered')}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </button>
                )}

                {/* Message Button */}
                <button
                  onClick={() => setActiveTab('messages')}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Messages
                </button>
              </div>
            </div>

            {/* Messages */}
            {activeTab === 'messages' && (
              <div className="bg-dark-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Messages</h2>
                
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {order.messages && order.messages.length > 0 ? (
                    order.messages.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.sender._id === user._id 
                          ? 'bg-primary-500/20 ml-4' 
                          : 'bg-gray-700 mr-4'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">
                            {message.sender.username}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{message.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No messages yet</p>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="mt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-600 bg-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                      className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;