import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  ShoppingCart, 
  Package, 
  MessageSquare, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../auth/contexts/AuthContext';
import api from '../../utils/api';

const BuyerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');

  // Fetch user orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ['orders', 'buying'],
    () => api.get('/api/orders?type=buying').then(res => res.data),
    {
      enabled: activeTab === 'orders'
    }
  );

  // Fetch user reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    ['reviews', 'my'],
    () => api.get('/api/reviews/my').then(res => res.data),
    {
      enabled: activeTab === 'reviews'
    }
  );

  const filteredOrders = ordersData?.orders?.filter(order => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  }) || [];

  const stats = {
    totalOrders: ordersData?.orders?.length || 0,
    completedOrders: ordersData?.orders?.filter(o => o.status === 'completed').length || 0,
    pendingOrders: ordersData?.orders?.filter(o => ['pending', 'paid', 'processing'].includes(o.status)).length || 0,
    totalSpent: ordersData?.orders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0) || 0
  };

  const OrderCard = ({ order }) => (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{order.product.title}</h3>
          <p className="text-sm text-gray-300">Order #{order.orderNumber}</p>
        </div>
        <span className={`badge ${
          order.status === 'completed' ? 'badge-success' :
          order.status === 'cancelled' ? 'badge-danger' :
          order.status === 'disputed' ? 'badge-danger' :
          'badge-warning'
        }`}>
          {order.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={order.seller.avatar || '/default-avatar.png'}
            alt={order.seller.username}
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-medium text-white">{order.seller.username}</p>
            <p className="text-xs text-gray-500">Seller</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">${order.totalAmount}</p>
          <p className="text-xs text-gray-500">{order.currency}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300">
          Ordered on {new Date(order.createdAt).toLocaleDateString()}
        </p>
        <div className="flex space-x-2">
          <button className="btn-outline text-sm px-3 py-1">
            View Details
          </button>
          {order.status === 'delivered' && (
            <button className="btn-primary text-sm px-3 py-1">
              Confirm Delivery
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const ReviewCard = ({ review }) => (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <img
            src={review.product.images?.[0]?.url || '/default-product.png'}
            alt={review.product.title}
            className="w-12 h-12 rounded-lg mr-4"
          />
          <div>
            <h3 className="font-semibold text-white">{review.product.title}</h3>
            <p className="text-sm text-gray-300">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {review.comment && (
        <p className="text-gray-700 mb-4">{review.comment}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={review.reviewee.avatar || '/default-avatar.png'}
            alt={review.reviewee.username}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-300">Seller: {review.reviewee.username}</span>
        </div>
        <span className="text-sm text-gray-500">
          {review.helpful.count} helpful
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-300 mt-2">Welcome back, {user.username}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Spent</p>
                <p className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Reviews
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'orders' && (
              <div>
                {/* Order Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      className="input-field w-auto"
                    >
                      <option value="all">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="input-field w-64"
                    />
                  </div>
                </div>

                {/* Orders List */}
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order._id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
                    <p className="text-gray-300 mb-4">
                      {orderFilter === 'all' 
                        ? "You haven't placed any orders yet."
                        : `No orders with status "${orderFilter}" found.`
                      }
                    </p>
                    <button className="btn-primary">
                      Browse Products
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : reviewsData?.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
                    <p className="text-gray-300 mb-4">
                      You haven't reviewed any products yet.
                    </p>
                    <button className="btn-primary">
                      Browse Products
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboardPage;
