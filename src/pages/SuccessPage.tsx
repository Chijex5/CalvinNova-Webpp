import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle, Mail, ArrowRight, Home, HelpCircle, Package, Shield } from 'lucide-react';
import { Product } from '../store/productStore';
const SuccessAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  return <div className={`relative transition-all duration-700 ease-out transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
      <div className="relative">
        {/* Animated background circle */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full animate-pulse"></div>
        
        {/* Success icon */}
        <div className="relative bg-white dark:bg-gray-900 rounded-full p-4 shadow-lg">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 animate-bounce" style={{
          animationDuration: '1s',
          animationIterationCount: '3'
        }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{
        animationDelay: '0.5s'
      }}></div>
      </div>
    </div>;
};
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}
const AnimatedCard = ({
  children,
  delay = 0,
  className = ""
}: AnimatedCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return <div className={`transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}>
      {children}
    </div>;
};
const PaymentSuccessPage = ({
  product
}: {
  product: Product;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const {
    productTitle,
    amount,
    sellerId
  } = location.state || {};

  // Format price function
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  // Use product data from store or location state
  const displayProductTitle = product?.title || productTitle || 'Product';
  const displayAmount = amount || (product ? product.price + Math.round(product.price * 0) : 0);
  const displaySellerId = sellerId || product?.sellerId || '';
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Payment Successful
            </h1>
            <button onClick={() => navigate('/marketplace')} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 text-sm">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        
        {/* Success Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <SuccessAnimation />
          </div>
          
          <AnimatedCard delay={300}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your order has been confirmed and payment secured
            </p>
          </AnimatedCard>
        </div>

        {/* Order Summary */}
        <AnimatedCard delay={500} className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              {product && <img src={product.images?.[0] || '/api/placeholder/60/60'} alt={product.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl flex-shrink-0" onError={e => {
              e.currentTarget.src = '/api/placeholder/60/60';
            }} />}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                  {displayProductTitle}
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatPrice(displayAmount)}
                </p>
                {product && <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{product.condition}</span>
                    <span>•</span>
                    <span>{product.category}</span>
                    <span>•</span>
                    <span>{product.school}</span>
                  </div>}
                <div className="flex items-center mt-3 text-green-600 dark:text-green-400">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Payment secured in escrow</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Next Steps */}
        <AnimatedCard delay={700} className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-indigo-500" />
              What's Next?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Check your email for receipt and collection instructions
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We've sent detailed pickup information to your registered email
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Coordinate with the seller for pickup
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use the chat to arrange a safe campus meetup location
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Action Buttons */}
        <AnimatedCard delay={900}>
          <div className="space-y-3">
            <button onClick={() => navigate(`/chat/${displaySellerId}`)} className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
              <MessageCircle className="w-5 h-5" />
              <span>Message Seller</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => window.open('mailto:support@novaplus.com')} className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-sm">
                <Mail className="w-4 h-4" />
                <span>Check Email</span>
              </button>
              
              <button onClick={() => navigate('/support')} className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </button>
            </div>
          </div>
        </AnimatedCard>

        {/* Footer Note */}
        <AnimatedCard delay={1100}>
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Questions? We're here to help at{' '}
              <a href="mailto:support@novaplus.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                support@novaplus.com
              </a>
            </p>
          </div>
        </AnimatedCard>
      </div>
    </div>;
};
export default PaymentSuccessPage;