import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn } from '../utils/animations';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail,
  Smartphone,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

// Firebase imports
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  getAuth,
  AuthError
} from 'firebase/auth';
import app from '../firebase/firebaseConfig'
import { set } from 'date-fns';

const auth = getAuth(app);

// Firebase error code to user-friendly message mapping
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email but different sign-in method.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-action-code':
      return 'The magic link is invalid or has expired. Please request a new one.';
    case 'auth/expired-action-code':
      return 'The magic link has expired. Please request a new one.';
    case 'auth/invalid-continue-uri':
      return 'Invalid redirect URL. Please contact support.';
    case 'auth/missing-continue-uri':
      return 'Missing redirect URL. Please contact support.';
    case 'auth/unauthorized-continue-uri':
      return 'Unauthorized redirect URL. Please contact support.';
    case 'auth/quota-exceeded':
      return 'Too many requests. Please try again later.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/invalid-email-verified':
      return 'Email verification failed. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'passwordless'>('email');
  const [passwordlessMessage, setPasswordlessMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [redirectedFrom, setRedirectedFrom] = useState<string | null>(null);
  
  const { login, setIsMiddleOfAuthFlow } = useAuth();
  const navigate = useNavigate();

  const getUrlParameter = (name: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  useEffect(() => {
    const redirectedFromParam = getUrlParameter('redirectedfrom');
    if (redirectedFromParam) {
      setRedirectedFrom(decodeURIComponent(redirectedFromParam));
    }
  }, []);

  // Combined error handler for Firebase and backend errors
  const handleError = (error: any, context: string, backendResponse?: any) => {
    console.error(`${context} error:`, error);
    
    let errorMessage = '';
    
    // Handle backend response errors first (higher priority)
    if (backendResponse && !backendResponse.success) {
      errorMessage = backendResponse.message || `${context} failed. Please try again.`;
    }
    // Handle Firebase Auth errors
    else if (error?.code) {
      errorMessage = getFirebaseErrorMessage(error.code);
    }
    // Handle generic errors
    else if (error?.message) {
      errorMessage = error.message;
    }
    // Fallback error message
    else {
      errorMessage = `${context} failed. Please try again.`;
    }
    
    setError(errorMessage);
    setRetryCount(prev => prev + 1);
  };

  const clearMessages = () => {
    setError(null);
    setPasswordlessMessage('');
  };

  // Check if user is completing email link sign-in
  React.useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        return;
      }

      setIsLoading(true);
      setIsMiddleOfAuthFlow(true);
      clearMessages();

      try {
        let email = localStorage.getItem('emailForSignIn');
        
        // If no email in storage, prompt user
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (!email) {
          setError('Email is required to complete sign-in');
          setIsLoading(false);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError('Please enter a valid email address');
          setIsLoading(false);
          return;
        }
        
        const userCredential = await signInWithEmailLink(auth, email, window.location.href);
        const userId = userCredential.user.uid;
        
        // Clean up stored email
        localStorage.removeItem('emailForSignIn');
        
        // Call your login context function
        const response = await login(email, userId);
        
        // Handle response from context
        if (response.success) {
          navigate(redirectedFrom || '/');
        } else {
          // Let context handle the error, just display the message
          handleError(null, 'Email link sign-in', response);
        }
      } catch (error) {
        // Handle Firebase errors
        handleError(error, 'Email link sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    handleEmailLinkSignIn();
  }, [login, navigate, redirectedFrom]);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    setIsMiddleOfAuthFlow(true);
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    
    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userId = userCredential.user.uid;
      
      // Verify user email if required
      if (!userCredential.user.emailVerified) {
        console.warn('User email not verified');
        // You can choose to block login or just warn
        // For now, we'll continue but you might want to handle this
      }
      
      // Call your login context function
      const response = await login(email.trim(), userId);
      
      // Handle response from context
      if (response.success) {
        setRetryCount(0);
        navigate(redirectedFrom || '/');
      } else {
        // Let context handle the error, just display the message
        handleError(null, 'Login', response);
      }
    } catch (error) {
      // Handle Firebase errors
      handleError(error, 'Email/password login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsMiddleOfAuthFlow(true);
    setIsLoading(true);
    clearMessages();
    
    try {
      const provider = new GoogleAuthProvider();
      
      // Configure Google Auth Provider
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email;
      
      if (!userEmail) {
        setError('No email received from Google account');
        setIsLoading(false);
        return;
      }
      
      // Call your login context function
      const response = await login(userEmail, userId);
      
      // Handle response from context
      if (response.success) {
        setRetryCount(0);
        navigate(redirectedFrom || '/');
      } else {
        // Let context handle the error, just display the message
        handleError(null, 'Google login', response);
      }
    } catch (error) {
      // Handle Firebase errors
      handleError(error, 'Google login');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordlessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsMiddleOfAuthFlow(true);
    clearMessages();
    
    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);
      
      // Store email for completion
      localStorage.setItem('emailForSignIn', email.trim());
      
      setPasswordlessMessage('Check your email! We sent you a magic link to sign in.');
      setRetryCount(0);
    } catch (error) {
      // Handle Firebase errors
      handleError(error, 'Magic link send');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    clearMessages();
    setRetryCount(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md lg:max-w-2xl xl:max-w-4xl">
        <FadeIn direction="up">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 lg:items-center">
            
            {/* Desktop Left Side - Hero Content */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-3xl transform rotate-3"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl transform -rotate-3"></div>
                
                {/* Main content */}
                <div className="relative bg-white/80 backdrop-blur-sm p-8 xl:p-12 rounded-3xl shadow-2xl border border-white/20">
                  <div className="space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    
                    <h1 className="text-4xl xl:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome to
                      </span>
                      <br />
                      <span className="text-gray-900">CalvinNova</span>
                    </h1>
                    
                    <p className="text-lg xl:text-xl text-gray-600 leading-relaxed">
                      Your secure gateway to productivity. Sign in to access your personalized dashboard and continue your journey.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span>Secure authentication</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span>Multiple sign-in options</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                        <span>Passwordless authentication</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div className="w-full max-w-md mx-auto lg:max-w-none">
              <div className="bg-white/80 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl border border-white/20">
                
                {/* Mobile Header (hidden on desktop) */}
                <div className="text-center lg:hidden mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Welcome back!
                  </h2>
                  <p className="text-gray-600">Sign in to your CalvinNova account</p>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block text-center mb-8">
                  <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                    Sign in to your account
                  </h2>
                  <p className="text-gray-600">Choose your preferred method below</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p>{error}</p>
                        {retryCount > 2 && (
                          <button
                            onClick={handleRetry}
                            className="mt-2 text-red-600 hover:text-red-800 underline text-xs"
                          >
                            Reset and try again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message for Passwordless */}
                {passwordlessMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center mb-6">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                    <p>{passwordlessMessage}</p>
                  </div>
                )}

                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 lg:py-4 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Login Method Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email');
                      clearMessages();
                    }}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'email'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('passwordless');
                      clearMessages();
                    }}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'passwordless'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Magic Link
                  </button>
                </div>

                {/* Login Forms */}
                {loginMethod === 'email' ? (
                  <form className="space-y-6" onSubmit={handleEmailPasswordLogin}>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) clearMessages();
                          }}
                          className="appearance-none block w-full pl-10 pr-3 py-3 lg:py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) clearMessages();
                          }}
                          className="appearance-none block w-full pl-10 pr-10 py-3 lg:py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-gray-400 hover:text-gray-600 transition-colors" />
                          ) : (
                            <Eye size={18} className="text-gray-400 hover:text-gray-600 transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                      <div className="text-sm">
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 lg:py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Sign in
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </button>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={handlePasswordlessLogin}>
                    <div>
                      <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="magic-email"
                          name="magic-email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) clearMessages();
                          }}
                          className="appearance-none block w-full pl-10 pr-3 py-3 lg:py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 lg:py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending magic link...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Send magic link
                        </div>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer */}
                <div className="text-center mt-8">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Login;