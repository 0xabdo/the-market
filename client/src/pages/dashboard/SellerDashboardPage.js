import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Plus,
  Eye,
  Star,
  Search
} from 'lucide-react';
import { useAuth } from '../auth/contexts/AuthContext';
import api from '../../utils/api';

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [productFilter, setProductFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');

  // Fetch seller products
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', 'my', productFilter],
    () => api.get(`/api/products/my?status=${productFilter}`).then(res => res.data),
    {
      enabled: activeTab === 'products'
    }
  );

  // Fetch seller orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ['orders', 'selling'],
    () => api.get('/api/orders?type=selling').then(res => res.data),
    {
      enabled: activeTab === 'orders'
    }
  );

  // Fetch seller stats
  const { data: statsData } = useQuery(
    ['user-stats', user?._id],
    () => api.get(`/api/users/${user?._id}/stats`).then(res => res.data),
    {
      enabled: !!user?._id
    }
  );

  const filteredProducts = productsData?.products?.filter(product => {
    if (productFilter === 'all') return true;
    if (productFilter === 'active') return product.isActive && product.isApproved;
    if (productFilter === 'pending') return product.isActive && !product.isApproved;
    if (productFilter === 'inactive') return !product.isActive;
    return true;
  }) || [];

  const filteredOrders = ordersData?.orders?.filter(order => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  }) || [];

  const stats = {
    totalProducts: statsData?.products?.totalProducts || 0,
    totalViews: statsData?.products?.totalViews || 0,
    totalSales: statsData?.products?.totalSales || 0,
    totalRevenue: statsData?.orders?.totalRevenue || 0,
    totalOrders: statsData?.orders?.totalOrders || 0,
    averageRating: statsData?.reviews?.averageRating || 0,
    totalReviews: statsData?.reviews?.totalReviews || 0
  };

  const ProductCard = ({ product }) => (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{product.title}</h3>
          <p className="text-sm text-gray-300">{product.game} • {product.category}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`badge ${
            !product.isActive ? 'badge-danger' :
            !product.isApproved ? 'badge-warning' :
            'badge-success'
          }`}>
            {!product.isActive ? 'Inactive' :
             !product.isApproved ? 'Pending' :
             'Active'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {product.views}
          </div>
          <div className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.sales}
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">${product.price}</p>
          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300">
          Created {new Date(product.createdAt).toLocaleDateString()}
        </p>
        <div className="flex space-x-2">
          <Link
            to={`/products/${product._id}`}
            className="btn-outline text-sm px-3 py-1"
          >
            View
          </Link>
          <Link
            to={`/products/${product._id}/edit`}
            className="btn-secondary text-sm px-3 py-1"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );

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
            src={order.buyer.avatar || '/default-avatar.png'}
            alt={order.buyer.username}
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-medium text-white">{order.buyer.username}</p>
            <p className="text-xs text-gray-500">Buyer</p>
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
          <button 
            onClick={() => navigate(`/orders/${order._id}`)}
            className="btn-outline text-sm px-3 py-1"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-gray-300 mt-2">Manage your products and orders</p>
            </div>
            <Link
              to="/products/create"
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Product
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Package className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Products</p>
                <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Sales</p>
                <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Rating</p>
                <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                {/* Product Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="input-field w-auto"
                    >
                      <option value="all">All Products</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending Approval</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="input-field w-64"
                    />
                  </div>
                </div>

                {/* Products List */}
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-700 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                    <p className="text-gray-300 mb-4">
                      {productFilter === 'all' 
                        ? "You haven't created any products yet."
                        : `No products with status "${productFilter}" found.`
                      }
                    </p>
                    <Link to="/products/create" className="btn-primary">
                      Create Your First Product
                    </Link>
                  </div>
                )}
              </div>
            )}

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
                      <div key={i} className="bg-gray-700 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
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
                        ? "You haven't received any orders yet."
                        : `No orders with status "${orderFilter}" found.`
                      }
                    </p>
                    <Link to="/products" className="btn-primary">
                      Browse Products
                    </Link>
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

export default SellerDashboardPage;
