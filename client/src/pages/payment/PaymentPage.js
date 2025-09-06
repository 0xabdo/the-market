import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { CreditCard, Lock, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { product, quantity, totalAmount } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Create order and process payment mutation
  const createOrderAndPayMutation = useMutation(
    (orderData) => api.post('/api/orders/create-and-pay', orderData),
    {
      onSuccess: (response) => {
        toast.success('Payment processed successfully!');
        queryClient.invalidateQueries(['orders']);
        navigate(`/orders/${response.data.order._id}`, { 
          state: { paymentSuccess: true } 
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Payment failed');
        setIsProcessing(false);
      }
    }
  );

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!product || !product._id || !product.seller) {
      toast.error('No product found or invalid product data');
      navigate('/products');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    const orderData = {
      productId: product._id,
      quantity: parseInt(quantity),
      paymentMethod,
      amount: parseFloat(totalAmount),
      cardDetails: paymentMethod === 'stripe' ? cardDetails : null
    };
    
    setTimeout(() => {
      createOrderAndPayMutation.mutate(orderData);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Product Found</h2>
          <p className="text-gray-300 mb-4">Please select a product to purchase</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -mt-16 pt-16 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
          <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-500 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Product
          </button>
          <h1 className="text-3xl font-bold text-white">Complete Your Purchase</h1>
          <p className="text-gray-300 mt-2">Secure payment for {product.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.title}
                  className="h-16 w-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.title}</h3>
                  <p className="text-sm text-gray-400">Quantity: {quantity}</p>
                  <p className="text-sm text-gray-400">Seller: {product.seller.username}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">${product.price}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">${product.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Processing Fee</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-700 pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-primary-500">${totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Payment Details</h2>
            
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-dark-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    <CreditCard className="h-5 w-5 text-primary-500 ml-3" />
                    <span className="ml-3 text-white">Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-dark-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="demo"
                      checked={paymentMethod === 'demo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                    <span className="ml-3 text-white">Demo Payment (Instant)</span>
                  </label>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'stripe' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({
                        ...cardDetails,
                        number: formatCardNumber(e.target.value)
                      })}
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-600 bg-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          expiry: formatExpiry(e.target.value)
                        })}
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-600 bg-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value.replace(/\D/g, '').substring(0, 4)
                        })}
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-600 bg-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({
                        ...cardDetails,
                        name: e.target.value
                      })}
                      className="w-full px-4 py-3 border border-gray-600 bg-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Demo Payment Info */}
              {paymentMethod === 'demo' && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-400 font-medium">Demo Payment Mode</span>
                  </div>
                  <p className="text-green-300 text-sm mt-2">
                    This is a demo payment. No real money will be charged. The order will be processed instantly.
                  </p>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start space-x-3 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-400 font-medium text-sm">Secure Payment</p>
                  <p className="text-blue-300 text-sm">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || (paymentMethod === 'stripe' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name))}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pay ${totalAmount}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
