import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Home, AlertTriangle, Bug, Send, XCircle, LifeBuoy, Lightbulb, ChevronRight } from 'lucide-react';
import { FadeIn } from '../utils/animations';
interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
  errorCode?: number;
  errorMessage?: string;
}
const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  resetError,
  errorCode = 500,
  errorMessage = "We're experiencing some technical difficulties"
}) => {
  const navigate = useNavigate();
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // For the floating elements animation
  const [elements] = useState(() => Array.from({
    length: 6
  }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 15 + 8,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 4
  })));
  // For the pulsing effect on the error code
  const [isPulsing, setIsPulsing] = useState(true);
  useEffect(() => {
    // Pulse the error code every 4 seconds
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    }
    window.location.reload();
  };
  const goBack = () => {
    navigate(-1);
  };
  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setIsSubmitting(true);
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would send the error report to your server
      // await api.post('/api/error-report', { errorDetails: error?.message, feedback: feedbackMessage });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit error feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/30 flex items-center justify-center relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {elements.map(el => <div key={el.id} className="absolute rounded-full bg-gradient-to-r from-red-400/10 to-orange-400/10 dark:from-red-500/20 dark:to-orange-500/20 animate-float" style={{
        left: `${el.x}%`,
        top: `${el.y}%`,
        width: `${el.size}px`,
        height: `${el.size}px`,
        animationDelay: `${el.delay}s`,
        animationDuration: `${el.duration}s`
      }} />)}
      </div>
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                  {/* Left side with error icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className={`w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg transition-all duration-300 ${isPulsing ? 'scale-105' : 'scale-100'}`}>
                        <AlertTriangle className="w-14 h-14 md:w-16 md:h-16 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 rounded-full shadow-lg py-1 px-3 border border-gray-200 dark:border-gray-600">
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                          {errorCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Right side with content */}
                  <div className="flex-1 text-center md:text-left">
                    <FadeIn direction="up" delay={0.1}>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Something Went Wrong
                      </h1>
                    </FadeIn>
                    <FadeIn direction="up" delay={0.2}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
                        {errorMessage}. Our team has been notified and is
                        working on a solution.
                      </p>
                    </FadeIn>
                    <FadeIn direction="up" delay={0.3}>
                      <div className="flex flex-wrap gap-3 mb-8">
                        <button onClick={goBack} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 group">
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                          <span>Go Back</span>
                        </button>
                        <button onClick={handleRefresh} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 group">
                          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                          <span>Refresh</span>
                        </button>
                        <Link to="/" className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                          <Home className="w-4 h-4" />
                          <span>Home</span>
                        </Link>
                      </div>
                    </FadeIn>
                    {/* Error Details Collapsible */}
                    {error && <FadeIn direction="up" delay={0.4}>
                        <div className="mb-6">
                          <button onClick={() => setShowErrorDetails(!showErrorDetails)} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 group">
                            <Bug className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {showErrorDetails ? 'Hide' : 'Show'} Technical
                              Details
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showErrorDetails ? 'rotate-90' : ''}`} />
                          </button>
                          {showErrorDetails && <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-auto max-h-32 text-sm font-mono">
                              <p className="text-red-600 dark:text-red-400">
                                {error.message}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {error.stack}
                              </p>
                            </div>}
                        </div>
                      </FadeIn>}
                  </div>
                </div>
                {/* Error Feedback Form */}
                <FadeIn direction="up" delay={0.5}>
                  <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    {!isSubmitted ? <>
                        <div className="flex items-start space-x-3 mb-4">
                          <LifeBuoy className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Help Us Improve
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Tell us what happened so we can fix it faster
                            </p>
                          </div>
                        </div>
                        <form onSubmit={submitFeedback}>
                          <div className="mb-4">
                            <textarea value={feedbackMessage} onChange={e => setFeedbackMessage(e.target.value)} placeholder="What were you trying to do when this error occurred?" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={3} />
                          </div>
                          <button type="submit" disabled={isSubmitting || !feedbackMessage.trim()} className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span>Sending...</span>
                              </> : <>
                                <Send className="w-4 h-4" />
                                <span>Send Feedback</span>
                              </>}
                          </button>
                        </form>
                      </> : <div className="text-center py-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Thank You!
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Your feedback has been submitted and will help us
                          improve.
                        </p>
                      </div>}
                  </div>
                </FadeIn>
              </div>
              {/* Helpful Tips */}
              <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50 py-4 px-8">
                <FadeIn direction="up" delay={0.6}>
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Things you can try:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Check your internet connection</li>
                        <li>• Clear your browser cache and cookies</li>
                        <li>• Try again in a few minutes</li>
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>;
};
export default ErrorPage;