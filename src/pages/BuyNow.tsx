import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  CreditCard, 
  Lock, 
  User, 
  Package,
  AlertCircle,
  X
} from 'lucide-react';
import { useProductStore, Product } from '../store/productStore';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';

// Product interface (matching your existing structure)
interface ProductData extends Product {
  sellerName?: string;
  sellerAvatar?: string;
  sellerCampus?: string;
  sellerRating?: number;
}

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, productTitle }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productTitle: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Purchase</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Before proceeding with your purchase of <strong>{productTitle}</strong>, please confirm:
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">Important</p>
                <p className="text-sm text-amber-700">
                  Have you confirmed with the seller that the item is available and agreed on a public pickup location?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Yes, Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Buy Page Component
const BuyPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [showModal, setShowModal] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  }>({});

  // Store hooks
  const { products, loading: productsLoading, error: productError } = useProductStore();

  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLocalError(null);
        if (!products.length && !productsLoading) {
          await productService.fetchProducts();
        }
        console.log(products);

        // Find product by ID
        console.log(productId)
        const foundProduct = products.find(p => p.id === parseInt(productId || '0', 10));
        
        if (!foundProduct && products.length > 0) {
          setLocalError('Product not found');
          navigate('/marketplace'); // Redirect if product not found
        } else if (foundProduct) {
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setLocalError('Failed to load product');
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, products, productsLoading, navigate]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user && !productsLoading) {
      navigate('/login', { state: { returnTo: `/buy/${productId}` } });
    }
  }, [user, productId, navigate, productsLoading]);

  // Prevent buying own product
  useEffect(() => {
    if (product && user && product.sellerId === user.userId) {
      navigate(`/product/${product.slug}`); // Redirect to product page
    }
  }, [product, user, navigate]);

  const platformFee = product ? Math.round(product.price * 0) : 0;
  const totalAmount = product ? product.price + platformFee : 0;

  const handleConfirmPurchase = () => {
    setShowModal(false);
  };

  const handleBackClick = () => {
    if (product) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate('/marketplace');
    }
  };

  const validateCard = () => {
    const newErrors: {
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
      cardholderName?: string;
    } = {};
    
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateCard() || !product || !user) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, integrate with Paystack/Flutterwave
      console.log('Processing payment...', {
        productId: product.id,
        sellerId: product.sellerId,
        buyerId: user.userId,
        amount: totalAmount,
        cardDetails: { ...cardDetails, cvv: '***' } // Don't log CVV
      });
      
      // Redirect to success page
      navigate(`/payment/success/${product.id}`, {
        state: {
          productTitle: product.title,
          amount: totalAmount,
          sellerId: product.sellerId
        }
      });
      
    } catch (error) {
      console.error('Payment failed:', error);
      navigate(`/payment/error/${product.id}`, {
        state: {
          error: 'Payment processing failed. Please try again.'
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
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

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Loading and error states
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (localError || productError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {localError || productError || 'Product not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're trying to purchase could not be loaded.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (showModal) {
    return (
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => navigate(`/product/${product.slug}`)}
        onConfirm={handleConfirmPurchase}
        productTitle={product.title}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Review & Complete Your Purchase</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Product Summary */}
          <div className="space-y-6">
            {/* Product Summary Component */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Product Summary
              </h2>
              
              <div className="flex space-x-4">
                <img
                  src={product.images?.[0] || '/api/placeholder/150/150'}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/150/150';
                  }}
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description.substring(0, 100)}{product.description.length > 100 ? '...' : ''}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 mb-1">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>Seller: {product.sellerName || `User ${product.sellerId.slice(0, 8)}`}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {product.school}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                      {product.condition}
                    </span>
                    <span className="ml-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Secure Escrow Protection</h3>
                  <p className="text-sm text-blue-800">
                    Your payment will be held securely in CalvinNova's escrow wallet until you confirm 
                    receipt of the item. This protects both you and the seller.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Details */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Product Price</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform Fee (2.5%)</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-indigo-600">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <strong>Recipient:</strong> CalvinNova Escrow Wallet
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && (
                    <p className="text-red-600 text-sm mt-1">{errors.cardholderName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({...cardDetails, cardNumber: formatCardNumber(e.target.value)})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={(e) => setCardDetails({...cardDetails, expiryDate: formatExpiryDate(e.target.value)})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cvv ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.cvv && (
                      <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Pay Now - {formatPrice(totalAmount)}</span>
                </>
              )}
            </button>

            {/* Legal Notice */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">
                By completing this purchase, you agree to CalvinNova's Terms of Service and Privacy Policy. 
                Your payment is protected by our escrow service. Funds will only be released to the seller 
                after you confirm receipt of the item in good condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;