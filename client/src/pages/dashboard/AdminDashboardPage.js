import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  Search,
  UserCheck,
  UserX
} from 'lucide-react';

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    ['admin', 'dashboard'],
    () => api.get('/api/admin/dashboard').then(res => res.data)
  );

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['admin', 'users', searchTerm, statusFilter],
    () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return api.get(`/api/admin/users?${params}`).then(res => res.data);
    },
    {
      enabled: activeTab === 'users'
    }
  );

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['admin', 'products', searchTerm, statusFilter],
    () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return api.get(`/api/admin/products?${params}`).then(res => res.data);
    },
    {
      enabled: activeTab === 'products'
    }
  );

  // Approve product mutation
  const approveProductMutation = useMutation(
    (productId) => api.put(`/api/admin/products/${productId}/approve`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'products']);
        queryClient.invalidateQueries(['admin', 'dashboard']);
      },
    }
  );

  // Reject product mutation
  const rejectProductMutation = useMutation(
    (productId) => api.put(`/api/admin/products/${productId}/reject`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'products']);
        queryClient.invalidateQueries(['admin', 'dashboard']);
      },
    }
  );

  // Suspend user mutation
  const suspendUserMutation = useMutation(
    (userId) => api.put(`/api/admin/users/${userId}/suspend`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'users']);
        queryClient.invalidateQueries(['admin', 'dashboard']);
      },
    }
  );

  // Activate user mutation
  const activateUserMutation = useMutation(
    (userId) => api.put(`/api/admin/users/${userId}/activate`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'users']);
        queryClient.invalidateQueries(['admin', 'dashboard']);
      },
    }
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-300 mt-1">Manage your gaming marketplace</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData?.stats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Products</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData?.stats?.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Orders</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData?.stats?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(dashboardData?.stats?.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Pending Products</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData?.stats?.pendingProducts || 0}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('products')}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                Review →
              </button>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Active Disputes</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData?.stats?.activeDisputes || 0}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                Review →
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-dark-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Products
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search and Filter */}
            {activeTab !== 'overview' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-600 bg-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    {activeTab === 'users' && (
                      <>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </>
                    )}
                    {activeTab === 'products' && (
                      <>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Users */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
                  <div className="bg-dark-700 rounded-lg p-4">
                    {dashboardData?.recentUsers?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.recentUsers.slice(0, 5).map((user) => (
                          <div key={user._id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-white">{user.username}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent users</p>
                    )}
                  </div>
                </div>

                {/* Top Sellers */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Top Sellers</h3>
                  <div className="bg-dark-700 rounded-lg p-4">
                    {dashboardData?.topSellers?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.topSellers.slice(0, 5).map((seller, index) => (
                          <div key={seller._id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {seller.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-white">{seller.username}</p>
                                <p className="text-sm text-gray-500">{seller.sales} sales</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">
                                {formatCurrency(seller.revenue || 0)}
                              </p>
                              <p className="text-sm text-gray-500">Revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No sellers yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : usersData?.users?.length > 0 ? (
                  <div className="space-y-4">
                    {usersData.users.map((user) => (
                      <div key={user._id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{user.username}</h3>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {user.role}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.isActive ? 'Active' : 'Suspended'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Joined</p>
                              <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                            </div>
                            <div className="flex space-x-2">
                              {user.isActive ? (
                                <button
                                  onClick={() => suspendUserMutation.mutate(user._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Suspend User"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => activateUserMutation.mutate(user._id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Activate User"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
                    <p className="text-gray-500">No users match your search criteria.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : productsData?.products?.length > 0 ? (
                  <div className="space-y-4">
                    {productsData.products.map((product) => (
                      <div key={product._id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={product.images?.[0] || '/placeholder-product.jpg'}
                            alt={product.title}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-white">{product.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                product.isApproved ? 'bg-green-100 text-green-800' :
                                product.isActive ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {product.isApproved ? 'Approved' :
                                 product.isActive ? 'Pending' : 'Rejected'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>${product.price}</span>
                                <span>{product.game}</span>
                                <span>{product.platform}</span>
                                <span>By {product.seller.username}</span>
                              </div>
                              {!product.isApproved && product.isActive && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => approveProductMutation.mutate(product._id)}
                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => rejectProductMutation.mutate(product._id)}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                    <p className="text-gray-500">No products match your search criteria.</p>
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

export default AdminDashboardPage;
