import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Search, 
  Grid, 
  List, 
  Star, 
  Eye,
  Gamepad2
} from 'lucide-react';
import api from '../../utils/api';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    game: searchParams.get('game') || '',
    platform: searchParams.get('platform') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: searchParams.get('page') || '1'
  });

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery(
    ['products', filters],
    () => fetchProducts(filters),
    {
      keepPreviousData: true,
      staleTime: 30000
    }
  );

  // Fetch categories and games
  const { data: categoriesData } = useQuery(
    'categories',
    () => api.get('/api/products/categories/games').then(res => res.data),
    {
      staleTime: 300000 // 5 minutes
    }
  );

  const fetchProducts = async (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`/api/products?${queryParams}`);
    return response.data;
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: '1' };
    setFilters(newFilters);
    
    // Update URL
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', filters.search);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      game: '',
      platform: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: '1'
    });
    setSearchParams({});
  };

  const ProductCard = ({ product }) => (
    <div className="bg-dark-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/products/${product._id}`}>
        <div className="aspect-w-16 aspect-h-9 bg-gray-700">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
              <Gamepad2 className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-white hover:text-primary-500 transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
        </div>
        
        <div className="flex items-center mb-2">
          <Link to={`/users/${product.seller._id}`} className="flex items-center">
            <img
              src={product.seller.avatar || '/default-avatar.png'}
              alt={product.seller.username}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-300 hover:text-primary-500 transition-colors">
              {product.seller.username}
            </span>
          </Link>
        </div>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.seller.rating.average)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-500'
                }`}
              />
            ))}
            <span className="text-sm text-gray-400 ml-1">
              ({product.seller.rating.count})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-500">
              ${product.price}
            </span>
            <span className="text-sm text-gray-400 ml-1">
              {product.currency}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Eye className="h-4 w-4 mr-1" />
            {product.views}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="badge badge-primary text-xs">
            {product.category}
          </span>
          <span className="text-xs text-gray-400">
            {product.game}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-dark-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                  <div className="h-48 bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error loading products</h2>
          <p className="text-gray-300 mb-4">Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {filters.search ? `Search results for "${filters.search}"` : 'Browse Products'}
          </h1>
          <p className="text-gray-300">
            {productsData?.total || 0} products found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-dark-800 rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-500 hover:text-primary-400"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full input-field"
                >
                  <option value="">All Categories</option>
                  <option value="accounts">Accounts</option>
                  <option value="items">Items</option>
                  <option value="currency">Currency</option>
                  <option value="services">Services</option>
                </select>
              </div>

              {/* Game */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game
                </label>
                <select
                  value={filters.game}
                  onChange={(e) => handleFilterChange('game', e.target.value)}
                  className="w-full input-field"
                >
                  <option value="">All Games</option>
                  {categoriesData?.games?.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  value={filters.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                  className="w-full input-field"
                >
                  <option value="">All Platforms</option>
                  {categoriesData?.platforms?.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="flex-1 input-field"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="flex-1 input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="input-field"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="views-desc">Most Popular</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-primary-500'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-primary-500'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {productsData?.products?.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {productsData.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                <p className="text-gray-300 mb-4">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {productsData?.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', String(parseInt(filters.page) - 1))}
                    disabled={parseInt(filters.page) <= 1}
                    className="px-3 py-2 text-sm font-medium text-gray-300 bg-dark-800 border border-gray-600 rounded-md hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, productsData.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange('page', String(pageNum))}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          parseInt(filters.page) === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-300 bg-dark-800 border border-gray-600 hover:bg-dark-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handleFilterChange('page', String(parseInt(filters.page) + 1))}
                    disabled={parseInt(filters.page) >= productsData.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-300 bg-dark-800 border border-gray-600 rounded-md hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
