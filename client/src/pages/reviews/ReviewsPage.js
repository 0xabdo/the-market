import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { useAuth } from '../auth/contexts/AuthContext';
import { 
  Star, 
  Plus, 
  Search, 
  Calendar,
  MessageSquare,
  Package
} from 'lucide-react';

const ReviewsPage = () => {
  const { user } = useAuth();
  
  // Use user for debugging (remove in production)
  console.log('Current user:', user);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch user's reviews (received)
  const { data: receivedReviewsData, isLoading: receivedLoading } = useQuery(
    ['reviews', 'my'],
    () => api.get('/api/reviews/my').then(res => res.data),
    {
      enabled: activeTab === 'received'
    }
  );

  // Fetch orders that can be reviewed
  const { data: reviewableOrdersData, isLoading: ordersLoading } = useQuery(
    ['orders', 'reviewable'],
    () => api.get('/api/orders?status=completed&canReview=true').then(res => res.data),
    {
      enabled: activeTab === 'write'
    }
  );

  // Create review mutation
  const createReviewMutation = useMutation(
    (reviewData) => api.post('/api/reviews', reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', 'my']);
        queryClient.invalidateQueries(['orders', 'reviewable']);
        setShowCreateReview(false);
        setSelectedOrder(null);
      },
    }
  );

  const handleCreateReview = (orderId, rating, comment) => {
    createReviewMutation.mutate({ orderId, rating, comment });
  };

  const filteredReceivedReviews = receivedReviewsData?.reviews?.filter(review => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.reviewer.username.toLowerCase().includes(searchLower) ||
        review.product.title.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower)
      );
    }
    if (ratingFilter !== 'all') {
      return review.rating === parseInt(ratingFilter);
    }
    return true;
  }) || [];

  const filteredReviewableOrders = reviewableOrdersData?.orders?.filter(order => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.seller.username.toLowerCase().includes(searchLower) ||
        order.product.title.toLowerCase().includes(searchLower) ||
        order.orderNumber.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Reviews</h1>
              <p className="text-gray-300 mt-1">Manage your reviews and ratings</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setActiveTab('write')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Write Review</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Star className="h-4 w-4 inline mr-2" />
                Reviews Received ({receivedReviewsData?.total || 0})
              </button>
              <button
                onClick={() => setActiveTab('write')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'write'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Write Reviews ({reviewableOrdersData?.total || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'received' ? 'reviews' : 'orders'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {activeTab === 'received' && (
                <div className="flex gap-2">
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              )}
            </div>

            {/* Content */}
            {activeTab === 'received' && (
              <div>
                {receivedLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredReceivedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReceivedReviews.map((review) => (
                      <div key={review._id} className="border border-gray-700 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {review.reviewer.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-white">
                                  {review.reviewer.username}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Package className="h-4 w-4" />
                                <span>{review.product.title}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Order #{review.order.orderNumber}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
                    <p className="text-gray-500">
                      {searchTerm || ratingFilter !== 'all'
                        ? 'No reviews match your search criteria.'
                        : 'You haven\'t received any reviews yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'write' && (
              <div>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredReviewableOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReviewableOrders.map((order) => (
                      <div key={order._id} className="border border-gray-700 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={order.product.images?.[0] || '/placeholder-product.jpg'}
                            alt={order.product.title}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-white">
                                  {order.product.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Sold by {order.seller.username}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  Order #{order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Completed {formatDate(order.updatedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-green-600">
                                ${order.totalAmount}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowCreateReview(true);
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                              >
                                <Star className="h-4 w-4" />
                                <span>Write Review</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No orders to review</h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? 'No orders match your search criteria.'
                        : 'You don\'t have any completed orders to review yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Review Modal */}
        {showCreateReview && selectedOrder && (
          <CreateReviewModal
            order={selectedOrder}
            onSubmit={handleCreateReview}
            onClose={() => {
              setShowCreateReview(false);
              setSelectedOrder(null);
            }}
            isLoading={createReviewMutation.isLoading}
          />
        )}
      </div>
    </div>
  );
};

// Create Review Modal Component
const CreateReviewModal = ({ order, onSubmit, onClose, isLoading }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(order._id, rating, comment);
    }
  };

  const renderStars = (currentRating, onRatingChange) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <Star
              className={`h-8 w-8 ${
                star <= currentRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Write a Review</h2>
        
        <div className="mb-4 p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 rounded-lg">
          <h3 className="font-semibold text-white">{order.product.title}</h3>
          <p className="text-sm text-gray-500">Sold by {order.seller.username}</p>
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            {renderStars(rating, setRating)}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this seller..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewsPage;
