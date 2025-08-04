import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle, Package, User, Clock, ArrowRight, MessageCircle, Phone, MapPin } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { is } from 'date-fns/locale';

interface Product {
  id: number;
  title: string;
  price: number;
  images?: string[];
  sellerName?: string;
  sellerId: string;
  school?: string;
  condition?: string;
  category?: string;
  phoneNumber?: string; // Placeholder for future implementation
}

interface PaymentSuccessPageProps {
  product: Product;
  transactionReference?: string | null;
}

const PaymentSuccessPage = ({ product, transactionReference }: PaymentSuccessPageProps) => {
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  const user = useUserStore((state) => state.user);
  const { startMessaging, chats } = useChatStore()
  const navigate = useNavigate();
  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleGoToOrders = () => {
    navigate(`/account/transaction/${transactionReference}`);
  };

  const handleBackToMarketplace = () => {
    navigate('/marketplace');
  };

  const handleContactSeller = async () => {
   if (!user) {
      navigate('/login')
      return
    }
    setIsContactingSeller(true)

    try {
      // Check if conversation already exists
      const existingChat = chats.find((chat) => {
        const members = Object.keys(chat.state.members || {})
        return members.includes(user.userId) && members.includes(product.sellerId)
      })
      if (existingChat) {
        navigate(`/chat/${existingChat.id}`)
      } else {
        const chatId = await startMessaging([product.sellerId])
        navigate(`/chat/${chatId}`)
      }
    } catch (error) {
      console.error('Error creating/getting chat:', error)
    } finally {
      setIsContactingSeller(false)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Header with success icon */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your payment is held in escrow until you confirm delivery by scanning the seller's QR code.</p>
          </div>

          {/* Content */}
          <div className="p-8">
            
            {/* Transaction Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {transactionReference || 'Processing...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="text-gray-900 dark:text-white">Paystack</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    In Escrow
                  </span>
                </div>
              </div>
            </div>

            {/* Product Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Product Purchased
              </h2>
              
              <div className="flex space-x-4">
                <img 
                  src={product.images?.[0] || '/api/placeholder/120/120'} 
                  alt={product.title} 
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/120/120';
                  }} 
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{product.title}</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <User className="w-4 h-4 mr-1" />
                    <span>Seller: {product.sellerName || `User ${product.sellerId.slice(0, 8)}`}</span>
                  </div>
                  
                  {/* Seller Contact Info */}
                  <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Seller Contact</h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{product.phoneNumber || '+234 XXX XXX XXXX'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{product.school || 'Campus'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {product.condition && (
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {product.condition}
                      </span>
                    )}
                    {product.category && (
                      <span className="inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    )}
                    {product.school && (
                      <span className="inline-block bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        {product.school}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                What Happens Next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Contact the Seller</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use the in-app chat or call them directly to coordinate pickup details and confirm availability.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Meet on Campus</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Arrange to meet in a public, well-lit area on campus for the exchange.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Scan QR Code to Confirm Delivery</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When you receive the item, scan the seller's QR code to release payment from escrow.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dispute if Necessary</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If the item isn't as described, file a dispute before scanning with photo documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleContactSeller}
                  disabled={isContactingSeller}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {isContactingSeller ? 'Contacting' : 'Chat with Seller'}
                </button>
                
                <button 
                  onClick={handleGoToOrders}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold rounded-xl transition-colors duration-200"
                >
                  <Package className="w-5 h-5 mr-2" />
                  View My Orders
                </button>
              </div>
              
              <button 
                onClick={handleBackToMarketplace}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-xl transition-colors duration-200"
              >
                Continue Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your payment is secured by CalvinNova's escrow system. 
            Funds will only be released after you scan the seller's QR code to confirm receipt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;