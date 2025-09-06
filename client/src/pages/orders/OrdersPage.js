import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../auth/contexts/AuthContext';
import api from '../../utils/api';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user orders
  const { data: ordersData, isLoading } = useQuery(
    ['orders', 'all'],
    () => api.get('/api/orders').then(res => res.data)
  );

  const filteredOrders = ordersData?.orders?.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = searchQuery === '' || 
      order.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'disputed': return 'badge-danger';
      case 'delivered': return 'badge-primary';
      default: return 'badge-warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'disputed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const OrderCard = ({ order }) => {
    const isBuyer = order.buyer._id === user._id;
    const otherUser = isBuyer ? order.seller : order.buyer;
    const userRole = isBuyer ? 'Buyer' : 'Seller';

    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{order.product.title}</h3>
            <p className="text-sm text-gray-300">Order #{order.orderNumber}</p>
          </div>
          <span className={`badge ${getStatusColor(order.status)} flex items-center`}>
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">{order.status}</span>
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src={otherUser.avatar || '/default-avatar.png'}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium text-white">{otherUser.username}</p>
              <p className="text-sm text-gray-500">{userRole}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">${order.totalAmount}</p>
            <p className="text-sm text-gray-500">{order.currency}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-300">
            <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
            {order.deliveryDetails?.deliveredAt && (
              <p>Delivered: {new Date(order.deliveryDetails.deliveredAt).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <span>Qty: {order.quantity}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              to={`/orders/${order._id}`}
              className="btn-outline text-sm px-3 py-1 flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Link>
            <Link
              to={`/orders/${order._id}`}
              className="btn-secondary text-sm px-3 py-1 flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Link>
          </div>
          
          {order.status === 'delivered' && isBuyer && (
            <button className="btn-primary text-sm px-3 py-1">
              Confirm Delivery
            </button>
          )}
          
          {order.status === 'paid' && !isBuyer && (
            <button className="btn-primary text-sm px-3 py-1">
              Process Order
            </button>
          )}
          
          {order.status === 'processing' && !isBuyer && (
            <button className="btn-primary text-sm px-3 py-1">
              Mark Delivered
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          <p className="text-gray-300 mt-2">Track and manage your orders</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
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
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-64"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 animate-pulse">
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
                ? "You haven't placed or received any orders yet."
                : `No orders with status "${orderFilter}" found.`
              }
            </p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
