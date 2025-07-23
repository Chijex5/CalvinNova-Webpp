import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  MessageCircle, 
  MapPin, 
  Clock, 
  QrCode, 
  Shield, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Heart,
  Home,
  User,
  AlertCircle
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

// Confetti component
const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const newParticles = [];
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.speedX,
        y: particle.y + particle.speedY,
        rotation: particle.rotation + particle.rotationSpeed,
      })).filter(particle => particle.y < 110));
    }, 50);

    // Clear after animation completes
    setTimeout(() => {
      clearInterval(interval);
      setParticles([]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute transition-all duration-75 ease-linear"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
};

// Step component
const StepCard = ({ number, icon: Icon, title, description, highlight = false }) => (
  <div className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
    highlight ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200' : 'bg-white border border-gray-200'
  } shadow-lg hover:shadow-xl`}>
    <div className="flex items-start space-x-4">
      <div className={`rounded-full p-3 ${
        highlight ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-100'
      }`}>
        <span className={`text-lg font-bold ${highlight ? 'text-white' : 'text-gray-700'}`}>
          {number}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <Icon className={`w-5 h-5 ${highlight ? 'text-indigo-600' : 'text-gray-600'}`} />
          <h3 className={`font-semibold ${highlight ? 'text-indigo-900' : 'text-gray-900'}`}>
            {title}
          </h3>
        </div>
        <p className={`text-sm ${highlight ? 'text-indigo-700' : 'text-gray-600'} leading-relaxed`}>
          {description}
        </p>
      </div>
    </div>
  </div>
);

const PaymentSuccessPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Get data from location state (passed from buy page)
  const { productTitle, amount, sellerId } = location.state || {};
  
  // Store hooks
  const { products, loading: productsLoading, error: productError } = useProductStore();

  useEffect(() => {
    // Hide confetti after 4 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Simulate step progression for demo
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => prev < 5 ? prev + 1 : 1);
    }, 3000);

    return () => clearInterval(stepTimer);
  }, []);

  // Format price function
  const formatPrice = (price) => {
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

        const foundProduct = products.find(p => p.id === parseInt(productId || '0', 10));
        
        if (!foundProduct && products.length > 0) {
          setLocalError('Product not found');
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
  }, [productId, products, productsLoading]);

  const steps = [
    {
      number: '1',
      icon: MessageCircle,
      title: 'Wait for the Seller to Confirm Meetup Location',
      description: 'The seller has been notified about your payment and will share a safe public campus location to meet. You\'ll get a notification in chat as soon as they do.',
      highlight: currentStep === 1
    },
    {
      number: '2',
      icon: Clock,
      title: 'Agree on a Meetup Time',
      description: 'Once the seller shares a location, use the chat to agree on a specific time to meet. Remember, all meetups must happen on campus.',
      highlight: currentStep === 2
    },
    {
      number: '3',
      icon: QrCode,
      title: 'Collect the Item & Scan the Seller\'s QR Code',
      description: 'At the meetup: The seller will show you a special QR code. Scan it using the app to confirm that you\'ve received the item. This automatically releases the money to the seller.',
      highlight: currentStep === 3
    },
    {
      number: '4',
      icon: Shield,
      title: 'Have an Issue? Don\'t Scan Just Yet',
      description: 'Only scan the QR if you received the correct item and it\'s in good condition ✅. If there\'s any issue, you can pause and report it before confirming delivery.',
      highlight: currentStep === 4
    },
    {
      number: '5',
      icon: HelpCircle,
      title: 'Need Help?',
      description: 'We\'re here for you! You can message the seller directly via chat or reach out to NovaPlus Support anytime.',
      highlight: currentStep === 5
    }
  ];

  // Use product data from store or location state
  const displayProductTitle = product?.title || productTitle || 'Product';
  const displayAmount = amount || (product ? product.price + Math.round(product.price * 0) : 0);
  const displaySellerId = sellerId || product?.sellerId || '';

  // Loading and error states
  if (productsLoading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (localError || productError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {localError || productError}
          </h2>
          <p className="text-gray-600 mb-4">
            There was an issue loading the product details.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Payment Successful! 🎉</h1>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <div className="relative bg-white rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎊
          </h2>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 max-w-lg mx-auto mb-6">
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">Amount Paid:</span> {formatPrice(displayAmount)}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              <span className="font-semibold">Product:</span> {displayProductTitle}
            </p>
            {product && (
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={product.images?.[0] || '/api/placeholder/60/60'}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/60/60';
                  }}
                />
                <div className="text-sm text-gray-600">
                  <p>{product.condition} • {product.category}</p>
                  <p>{product.school}</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center space-x-2 text-indigo-600">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Securely held in escrow</span>
            </div>
          </div>

          <p className="text-xl text-gray-700 mb-2">
            Hey there 👋, your payment was successful and we've securely held the money for you.
          </p>
          <p className="text-lg text-indigo-600 font-medium">
            Now here's what you should do next:
          </p>
        </div>

        {/* What's Next Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Here's What Happens Next 🚀
          </h3>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <StepCard key={index} {...step} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate(`/chat/${displaySellerId}`)}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Message Seller</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigate('/support')}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-indigo-300 font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Get Support</span>
          </button>
        </div>

        {/* Thank You Message */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 rounded-r-2xl p-8 mb-8">
          <div className="flex items-start space-x-4">
            <Heart className="w-8 h-8 text-orange-500 mt-1 animate-pulse" />
            <div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">
                Thank You for Using NovaPlus! 🧡
              </h3>
              <p className="text-orange-800 leading-relaxed mb-4">
                You're supporting a student-powered community where <strong>trust, speed, and safety</strong> come first. 
                Keep things friendly, and enjoy your new item! 
              </p>
              <div className="flex items-center space-x-2 text-orange-700">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Happy shopping! 🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
            Quick Reminders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Only meet on campus for safety</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Your money is safely held in escrow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Scan QR only when satisfied with item</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Report issues before confirming delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;