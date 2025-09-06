import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Star, 
  Eye, 
  ShoppingCart, 
  Shield, 
  Clock,
  Gamepad2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../auth/contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => api.get(`/api/products/${id}`).then(res => res.data),
    {
      enabled: !!id
    }
  );

  // Fetch product reviews
  const { data: reviewsData } = useQuery(
    ['product-reviews', id],
    () => api.get(`/api/products/${id}/reviews`).then(res => res.data),
    {
      enabled: !!id
    }
  );

  // Use reviewsData to avoid unused variable warning
  const reviews = reviewsData || [];
  
  // Log reviews for debugging (remove in production)
  console.log('Product reviews:', reviews);


  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user._id === product.seller._id) {
      toast.error('You cannot buy your own product');
      return;
    }

    // Redirect to payment page with product details
    navigate('/payment', { 
      state: { 
        product: product,
        quantity: quantity,
        totalAmount: product.price * quantity
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
          <p className="text-gray-300 mb-4">The product you're looking for doesn't exist</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-300 mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center hover:text-primary-500 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Products
          </button>
          <span>/</span>
          <span className="text-white">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden mb-4">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <Gamepad2 className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-700'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {product.title}
              </h1>
              
              <div className="flex items-center mb-4">
                <Link to={`/users/${product.seller._id}`} className="flex items-center">
                  <img
                    src={product.seller.avatar || '/default-avatar.png'}
                    alt={product.seller.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-white hover:text-primary-500 transition-colors">
                      {product.seller.username}
                    </p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.seller.rating.average)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-300 ml-1">
                        ({product.seller.rating.count} reviews)
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {product.views} views
                </div>
                <div className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {product.sales} sales
                </div>
                <span className="badge badge-primary">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-primary-500 mb-2">
                ${product.price}
                <span className="text-lg text-gray-300 ml-1">
                  {product.currency}
                </span>
              </div>
              <p className="text-gray-300">
                Delivery: {product.deliveryTime}
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Specifications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {product.specifications.level && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-300">Level:</span>
                      <span className="font-medium">{product.specifications.level}</span>
                    </div>
                  )}
                  {product.specifications.rank && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-300">Rank:</span>
                      <span className="font-medium">{product.specifications.rank}</span>
                    </div>
                  )}
                  {product.specifications.region && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-300">Region:</span>
                      <span className="font-medium">{product.specifications.region}</span>
                    </div>
                  )}
                  {product.specifications.additionalInfo && (
                    <div className="py-2">
                      <span className="text-gray-300">Additional Info:</span>
                      <p className="text-white mt-1">{product.specifications.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-300">Stock:</span>
                <span className="font-medium">{product.stock} available</span>
              </div>

              {product.stock > 0 ? (
                <>
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-1"
                    >
                      {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now - ${(product.price * quantity).toFixed(2)}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-300 mb-2">Out of Stock</p>
                  <button
                    className="btn-outline"
                    onClick={() => navigate('/products')}
                  >
                    Browse Similar Products
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-300">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure Payment
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Instant Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
