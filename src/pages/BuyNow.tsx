import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Lock, User, Package, AlertCircle, X } from 'lucide-react';
import { useProductStore, Product } from '../store/productStore';
import PaymentSuccessPage from './SuccessPage';
import { productService } from '../services/productService';
import selfService from '../services/selfServices';
import { useUserStore } from '../store/userStore';

// Product interface (matching your existing structure)
interface ProductData extends Product {
  sellerName?: string;
  sellerAvatar?: string;
  sellerCampus?: string;
  sellerRating?: number;
}

const live_secret_key = import.meta.env.VITE_PAYSTACK_LIVE_SECRET_KEY
const live_public_key = import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY
const test_secret_key = import.meta.env.VITE_PAYSTACK_TEST_SECRET_KEY
const test_public_key = import.meta.env.VITE_PAYSTACK_TEST_PUBLIC_KEY

const getPaystackKeys = () => {
  if (import.meta.env.MODE === 'production') {
    return {
      publicKey: live_public_key,
      secretKey: live_secret_key
    };
  } else {
    return {
      publicKey: test_public_key,
      secretKey: test_secret_key
    };
  }
}

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  productTitle
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productTitle: string;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Purchase</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Before proceeding with your purchase of <strong>{productTitle}</strong>, please confirm:
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-1">Important</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Have you confirmed with the seller that the item is available and agreed on a public pickup location?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
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
  const user = useUserStore(state => state.user);

  // State management
  const [showModal, setShowModal] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false); // NEW: Track purchase completion

  // Store hooks
  const {
    products,
    loading: productsLoading,
    error: productError
  } = useProductStore();

  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Only remove if it exists
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLocalError(null);
        if (!products.length && !productsLoading) {
          await productService.fetchProducts();
        }
        const foundProduct = products.find(p => p.id === parseInt(productId || '0', 10));
        if (!foundProduct && products.length > 0) {
          setLocalError('Product not found');
          navigate('/marketplace');
        } else if (foundProduct) {
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setLocalError('Failed to load product');
      }
    };
    if (productId && !purchaseCompleted) { // Don't reload if purchase is completed
      loadProduct();
    }
  }, [productId, products, productsLoading, navigate, purchaseCompleted]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user && !productsLoading && !purchaseCompleted) {
      navigate('/login', {
        state: {
          returnTo: `/buy/${productId}`
        }
      });
    }
  }, [user, productId, navigate, productsLoading, purchaseCompleted]);

  // Prevent buying own product
  useEffect(() => {
    if (product && user && product.sellerId === user.userId && !purchaseCompleted) {
      navigate(`/product/${product.slug}`);
    }
  }, [product, user, navigate, purchaseCompleted]);

  const platformFee = product ? Math.round(product.price * 0.025) : 0; // 2.5% platform fee
  const totalAmount = product ? product.price + platformFee : 0;

  const generateTransactionReference = () => {
    return `calvinnova_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleConfirmPurchase = () => {
    setShowModal(false);
  };

  const handleBackClick = () => {
    if (purchaseCompleted) {
      navigate('/marketplace');
      return;
    }
    
    if (product) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate('/marketplace');
    }
  };

  const handlePaystackSuccess = async (reference: string) => {
    try {
      console.log('Payment successful, processing checkout...', reference); // DEBUG
      setIsProcessing(true);
      setPaymentReference(reference);
      
      // Call your backend checkout function after successful Paystack payment
      const result = await selfService.checkout({
        productId: product?.id || 0,
        sellerId: product?.sellerId || '',
        sellerName: product?.sellerName || `User ${product!.sellerId.slice(0, 8)}`,
        buyerName: user?.name || '',
        sellerAmount: product?.price, // The amount that goes to seller (excluding platform fee)
        title: product?.title || '',
        transactionId: reference, // Use the real Paystack reference
        buyerEmail: user?.email || '',
        buyerId: user?.userId || '',
        amount: totalAmount,
        sellerPhone: product?.sellerPhone || ''
      });

      console.log('Checkout result:', result); // DEBUG

      if (result.success) {
        console.log('Checkout successful, showing success modal...'); // DEBUG
        // Mark purchase as completed BEFORE refreshing products
        setPurchaseCompleted(true);
        
        // Refresh products to update availability (but don't await it to avoid blocking success modal)
        productService.refreshProducts().catch(console.error);
        
        // Show success modal
        setShowSuccessModal(true);
        console.log('Success modal should be showing now'); // DEBUG
      } else {
        console.error('Checkout failed:', result.message); // DEBUG
        throw new Error(result.message || 'Failed to complete purchase');
      }
    } catch (error: any) {
      console.error('Purchase completion failed:', error);
      setLocalError(error?.response?.data?.message || error?.message || 'Failed to complete purchase');
      setPurchaseCompleted(false); // Reset on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!product || !user) return;

    setIsProcessing(true);
    setLocalError(null);

    try {
      const { publicKey } = getPaystackKeys();
      
      if (!publicKey) {
        throw new Error('Paystack public key not configured');
      }

      if (typeof window.PaystackPop === 'undefined') {
        throw new Error('Paystack library not loaded');
      }

      const reference = generateTransactionReference();

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: user.email,
        amount: totalAmount * 100, // Paystack expects amount in kobo (multiply by 100)
        currency: 'NGN',
        ref: reference,
        firstname: user.name.split(' ')[0] || user.name,
        lastname: user.name.split(' ')[1] || '',
        metadata: {
          productId: product.id,
          productTitle: product.title,
          sellerId: product.sellerId,
          buyerId: user.userId,
          custom_fields: [
            {
              display_name: "Product",
              variable_name: "product_title",
              value: product.title
            },
            {
              display_name: "Seller",
              variable_name: "seller_name",
              value: product.sellerName || `User ${product.sellerId.slice(0, 8)}`
            }
          ]
        },
        callback: function(response: any) {
          console.log('Paystack callback triggered:', response); // DEBUG
          // Payment successful
          handlePaystackSuccess(response.reference);
        },
        onClose: function() {
          console.log('Paystack modal closed'); // DEBUG
          // Payment cancelled
          setIsProcessing(false);
          setLocalError('Payment was cancelled');
        }
      });

      handler.openIframe();
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      setLocalError(error.message || 'Failed to initialize payment');
      setIsProcessing(false);
    }
  };

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('State changed:', {
      showModal,
      showSuccessModal,
      purchaseCompleted,
      isProcessing,
      paymentReference
    });
  }, [showModal, showSuccessModal, purchaseCompleted, isProcessing, paymentReference]);

  // Loading and error states
  if (productsLoading && !purchaseCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if ((localError || productError || !product) && !purchaseCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {localError || productError || 'Product not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The product you're trying to purchase could not be loaded.
          </p>
          <button 
            onClick={() => navigate('/marketplace')} 
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // PRIORITY: Show success modal if purchase is completed
  if (showSuccessModal && purchaseCompleted) {
    console.log('Rendering success modal'); // DEBUG
    return (
      <PaymentSuccessPage 
        product={product!} 
        transactionReference={paymentReference}
      />
    );
  }

  if (showModal && !purchaseCompleted) {
    return (
      <ConfirmationModal 
        isOpen={showModal} 
        onClose={() => navigate(`/product/${product!.slug}`)} 
        onConfirm={handleConfirmPurchase} 
        productTitle={product!.title} 
      />
    );
  }

  // Don't render the main buy page if purchase is completed but success modal isn't showing
  if (purchaseCompleted && !showSuccessModal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Completing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackClick} 
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review & Complete Your Purchase</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Product Summary */}
          <div className="space-y-6">
            {/* Product Summary Component */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Product Summary
              </h2>
              
              <div className="flex space-x-4">
                <img 
                  src={product!.images?.[0] || '/api/placeholder/150/150'} 
                  alt={product!.title} 
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0" 
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/150/150';
                  }} 
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{product!.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {product!.description.substring(0, 100)}{product!.description.length > 100 ? '...' : ''}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {formatPrice(product!.price)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4 mr-1" />
                      <span>Seller: {product!.sellerName || `User ${product!.sellerId.slice(0, 8)}`}</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {product!.school}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {product!.condition}
                    </span>
                    <span className="ml-2 inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {product!.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Secure Escrow Protection</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Your payment will be held securely in CalvinNova's escrow wallet until you confirm 
                    receipt of the item. This protects both you and the seller.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {localError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">Payment Error</h3>
                    <p className="text-sm text-red-800 dark:text-red-300">{localError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Details */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Product Price</span>
                  <span>{formatPrice(product!.price)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Platform Fee (2.5%)</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="border-t dark:border-gray-600 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="dark:text-white">Total Amount</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Recipient:</strong> CalvinNova Escrow Wallet
                </p>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h2>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">Secure Paystack Payment</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Your payment will be processed securely through Paystack. We accept all major cards and bank transfers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">✓ Bank cards (Visa, Mastercard, Verve)</p>
                <p className="mb-2">✓ Bank transfers</p>
                <p className="mb-2">✓ Mobile money</p>
                <p>✓ USSD payments</p>
              </div>
            </div>

            {/* Pay Now Button */}
            <button 
              onClick={handlePayment} 
              disabled={isProcessing} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
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