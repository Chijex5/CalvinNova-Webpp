import { useState, useEffect } from "react";
import { Zap, ArrowLeft, CheckCircle, Sparkles, Star, CreditCard, Clock, Heart, Trophy, Package } from "lucide-react";
import Button from "../components/Button";
import RatingModal from "../components/RatingModal";

const TransactionSuccess = ({
  onBack,
  userType
}: {
  onBack: () => void;
  userType: 'seller' | 'buyer';
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [showRattingModal, setShowRatingModal] = useState(false);
  useEffect(() => {
    // Stage 0: Initial load
    const timer1 = setTimeout(() => setAnimationStage(1), 300);

    // Stage 1: Confetti explosion
    const timer2 = setTimeout(() => {
      setShowConfetti(true);
      setAnimationStage(2);
    }, 800);

    // Stage 2: Content reveal
    const timer3 = setTimeout(() => setAnimationStage(3), 1500);

    // Stage 3: Final state
    const timer4 = setTimeout(() => {
      setShowConfetti(false);
      setAnimationStage(4);
    }, 4000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);
  const confettiPieces = Array.from({
    length: 50
  }, (_, i) => ({
    id: i,
    color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][i % 6],
    left: Math.random() * 100,
    animationDelay: Math.random() * 2,
    size: Math.random() * 6 + 4
  }));

  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      
      {/* Confetti Animation */}
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-30">
          {confettiPieces.map(piece => <div key={piece.id} className="absolute animate-bounce" style={{
        left: `${piece.left}%`,
        backgroundColor: piece.color,
        width: `${piece.size}px`,
        height: `${piece.size}px`,
        borderRadius: piece.id % 3 === 0 ? '50%' : piece.id % 2 === 0 ? '0%' : '20%',
        animationDelay: `${piece.animationDelay}s`,
        animationDuration: '3s',
        top: '-10px'
      }} />)}
        </div>}

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200/30 dark:bg-green-800/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-16 w-12 h-12 bg-emerald-300/40 dark:bg-emerald-700/40 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 left-20 w-16 h-16 bg-green-100/50 dark:bg-green-900/50 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-8 w-8 h-8 bg-emerald-200/60 dark:bg-emerald-800/60 rounded-full animate-pulse delay-1500"></div>
      </div>

      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className={`p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:scale-110 transform ${animationStage >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`transition-all duration-500 delay-300 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Complete</h1>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">✨ Successfully processed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8 relative z-10">
        
        {/* Success Card */}
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-1000 transform ${animationStage >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}>
          
          {/* Success Header with Gradient */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className={`relative z-10 text-center transition-all duration-800 delay-500 ${animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Animated Success Icon */}
              <div className="relative inline-block mb-4">
                <div className={`w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform transition-all duration-700 ${animationStage >= 2 ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}>
                  <CheckCircle className={`w-10 h-10 text-white transition-all duration-500 delay-700 ${animationStage >= 2 ? 'scale-100' : 'scale-0'}`} />
                </div>
                
                {/* Sparkle Effects */}
                {animationStage >= 2 && <>
                    <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-ping" />
                    <Star className="w-3 h-3 text-yellow-200 absolute -bottom-1 -left-1 animate-pulse delay-300" />
                    <Zap className="w-3 h-3 text-yellow-100 absolute top-2 -left-2 animate-bounce delay-500" />
                  </>}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">🎉 Amazing!</h2>
              <p className="text-green-100 text-sm font-medium">
                Your transaction was successful
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-6">
            
            {/* Status Message */}
            <div className={`text-center transition-all duration-600 delay-700 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {userType === 'seller' ? '💰 Payment Processing' : '📦 Item Confirmed'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {userType === 'seller' ? 'Great job! Your payment will be processed and transferred to your account within the next few minutes.' : 'Perfect! You\'ve successfully confirmed receipt of your item. The transaction is now complete.'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className={`grid grid-cols-2 gap-4 transition-all duration-600 delay-900 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  {userType === 'seller' ? <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" /> : <Package className="w-5 h-5 text-green-600 dark:text-green-400" />}
                </div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  {userType === 'seller' ? 'Secure Payment' : 'Item Verified'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {userType === 'seller' ? 'Protected transfer' : 'Quality confirmed'}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Transaction</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Complete</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className={`bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-5 transition-all duration-600 delay-1100 ${animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">What's next?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {userType === 'seller' ? 'You\'ll receive a notification once the payment hits your account. Check your transaction history for updates.' : 'You can rate your experience and the seller. Check your purchase history anytime in your account.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className={`transition-all duration-600 delay-1300 ${animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button onClick={onBack} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2" fullWidth={false} type="button"  >
                <Heart className="w-5 h-5" />
                <span>Continue Shopping</span>
              </Button>

              <Button type="button" variant="outline" className="w-full mt-4 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 rounded-lg py-3 px-5 flex items-center justify-center space-x-2" icon={<Star className="w-5 h-5" />} onClick={()=> setShowRatingModal(true)}>
                <span>Rate your experience</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Success Elements */}
        {animationStage >= 2 && <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 animate-bounce delay-1000">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="absolute top-8 right-8 animate-pulse delay-1500">
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <div className="absolute bottom-16 left-8 animate-bounce delay-2000">
              <Trophy className="w-4 h-4 text-indigo-400" />
            </div>
          </div>}
      </div>
      {showRattingModal && <RatingModal onClose={() => setShowRatingModal(false)}  onSubmit={(rating, feedback, categories) => {console.log(rating, feedback, categories)}} />}
    </div>;
};
export default TransactionSuccess;