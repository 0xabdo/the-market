import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import { 
  Star, 
  Package, 
  Search
} from 'lucide-react';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [productFilter, setProductFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user profile
  const { data: user, isLoading: userLoading } = useQuery(
    ['user', userId],
    () => api.get(`/api/users/${userId}`).then(res => res.data),
    {
      enabled: !!userId
    }
  );

  // Fetch user's products
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', 'seller', userId, productFilter, searchTerm],
    () => {
      const params = new URLSearchParams();
      if (productFilter !== 'all') params.append('status', productFilter);
      if (searchTerm) params.append('search', searchTerm);
      return api.get(`/api/products/seller/${userId}?${params}`).then(res => res.data);
    },
    {
      enabled: !!userId && activeTab === 'products'
    }
  );

  // Fetch user's reviews
  const { data: reviewsData } = useQuery(
    ['reviews', 'user', userId],
    () => api.get(`/api/reviews/user/${userId}`).then(res => res.data),
    {
      enabled: !!userId
    }
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
          <p className="text-gray-300">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const filteredProducts = productsData?.products?.filter(product => {
    if (productFilter === 'all') return true;
    if (productFilter === 'active') return product.isActive && product.isApproved;
    if (productFilter === 'pending') return !product.isApproved;
    if (productFilter === 'inactive') return !product.isActive;
    return true;
  }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                  <p className="text-gray-300 mt-1">{user.email}</p>
                  {user.bio && (
                    <p className="text-gray-300 mt-2 max-w-2xl">{user.bio}</p>
                  )}
                </div>
                
                {/* Rating and Stats */}
                <div className="mt-4 md:mt-0 flex flex-col items-end">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">
                      {reviewsData?.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-500">
                      ({reviewsData?.totalReviews || 0} reviews)
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Member since {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {productsData?.total || 0}
                  </div>
                  <div className="text-sm text-gray-500">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.sales || 0}
                  </div>
                  <div className="text-sm text-gray-500">Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {reviewsData?.totalReviews || 0}
                  </div>
                  <div className="text-sm text-gray-500">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {user.views || 0}
                  </div>
                  <div className="text-sm text-gray-500">Profile Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Products ({productsData?.total || 0})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Star className="h-4 w-4 inline mr-2" />
                Reviews ({reviewsData?.totalReviews || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                {/* Products Filter and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Products</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={product.images?.[0] || '/placeholder-product.jpg'}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              ${product.price}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                product.isActive && product.isApproved
                                  ? 'bg-green-100 text-green-800'
                                  : !product.isApproved
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.isActive && product.isApproved
                                  ? 'Active'
                                  : !product.isApproved
                                  ? 'Pending'
                                  : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                            <span>{product.game}</span>
                            <span>{product.platform}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                    <p className="text-gray-500">
                      {searchTerm || productFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'This seller hasn\'t added any products yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviewsData?.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.reviews.map((review) => (
                      <div key={review._id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {review.reviewer?.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-white">
                                {review.reviewer?.username}
                              </span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-300 mb-2">{review.comment}</p>
                            {review.product && (
                              <div className="text-sm text-gray-500">
                                Review for: <span className="font-medium">{review.product.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
                    <p className="text-gray-500">This seller hasn't received any reviews yet.</p>
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

export default UserProfilePage;


