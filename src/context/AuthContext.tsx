import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { client } from '../lib/stream-chat';
import { useProductService } from '../services/productService';
import api from '../utils/apiService';
import { getAuth, signOut } from 'firebase/auth';
import app from '../firebase/firebaseConfig';

const auth = getAuth(app);

interface User {
  userId: string;
  name: string;
  email: string;
  userToken: string;
  campus: string;
  avatarUrl: string;
  isAdmin?: boolean;
  role: 'buyer' | 'seller' | 'both' | 'admin';
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  campus: string;
  password: string;
  confirmPassword: string;
  userRole: 'buyer' | 'seller' | 'both';
  avatarUrl?: string;
}

interface Response {
  success: boolean;
  message: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isCheckingAuth: boolean;
  isMiddleOfAuthFlow: boolean;
  setIsMiddleOfAuthFlow: (isMiddleOfAuthFlow: boolean) => void
  setIsCheckingAuth: (checking: boolean) => void;
  login: (email: string, userId: string) => Promise<Response>;
  verifcation: (token: string) => Promise<{status: boolean, user?: User, message?: string}>;
  error: string | null;
  clearError: () => void;
  setError: (error: string | null) => void;
  resetPassword: (email: string) => Promise<Response>;
  signup: (data: SignupData) => Promise<Response>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { 
    user, 
    setUser, 
    clearUser, 
    isLoading, 
    setLoading, 
    isAuthenticated, 
    setIsAuthenticated,
    isAdmin, 
    isBuyer, 
    isSeller 
  } = useUserStore();

  const productService = useProductService();

  const { setAdminView } = useChatStore();
  const [error, setError] = useState<string | null>(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isMiddleOfAuthFlow, setIsMiddleOfAuthFlow] = useState<boolean>(false);
  
  // Track if initial auth check is complete
  const initialAuthComplete = useRef<boolean>(false);
  // Track if StreamChat is connected
  const streamChatConnected = useRef<boolean>(false);
  
  // Helper function to safely connect to StreamChat
  const connectToStreamChat = async (userData: User) => {
    try {
      // Disconnect if already connected
      if (streamChatConnected.current) {
        await client.disconnect();
        streamChatConnected.current = false;
      }

      await client.connectUser(
        {
          id: userData.userId,
          name: userData.name,
          image: userData.avatarUrl,
        },
        userData.userToken
      );
      
      streamChatConnected.current = true;
    } catch (error) {
      console.error('StreamChat connection error:', error);
      // Don't throw here - StreamChat connection failure shouldn't prevent login
    }
  };

  // Helper function to safely disconnect from StreamChat
  const disconnectFromStreamChat = async () => {
    try {
      if (streamChatConnected.current) {
        await client.disconnect();
        streamChatConnected.current = false;
      }
    } catch (error) {
      console.error('StreamChat disconnect error:', error);
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      await disconnectFromStreamChat();
      clearUser();
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      initialAuthComplete.current = false;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if logout fails
      clearUser();
      setIsAuthenticated(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const getUserDataFromBackend = async (retryCount = 0): Promise<User> => {
    try {
      setLoading(true);
      setIsCheckingAuth(true);
      const response = await api.get(`/api/me`);
      if (response.data && response.data.success) {
        setIsAuthenticated(true);
        response.data.user.role === 'admin' ? setAdminView(true) : setAdminView(false);
        
        // Connect to StreamChat
        await connectToStreamChat(response.data.user);

        // Sync products in the background (refresh existing products)
        productService.refreshProducts().catch(error => {
          setError('Failed to refresh products');
        });
        
        return response.data.user;
      }

      throw new Error('Failed to fetch user data');
    } catch (error: any) {
      setError(error || 'Error fetching user data from backend');
      
      // If it's a 401 error and we haven't retried, wait a bit and retry
      // This handles the case where the user was just created but isn't immediately available
      if (error.response?.status === 401 && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return getUserDataFromBackend(retryCount + 1);
      }
      
      // Only logout if we're not in the middle of auth flow
      if (!isMiddleOfAuthFlow) {
        await logout();
      }
      throw error;
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    let mounted = true;
    
    const checkInitialAuth = async () => {
      if (initialAuthComplete.current) return;
      
      // Check if we have a stored token
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = await getUserDataFromBackend();
          if (mounted) {
            setUser(userData);
            initialAuthComplete.current = true;
          }
        } catch (error) {
          console.error('Initial auth check failed:', error);
          if (mounted) {
            // Clear any invalid token
            localStorage.removeItem('token');
            clearUser();
            setIsAuthenticated(false);
            setLoading(false);
            setIsCheckingAuth(false);
          }
        }
      } else {
        // No token found
        if (mounted) {
          clearUser();
          setIsAuthenticated(false);
          setLoading(false);
          setIsCheckingAuth(false);
        }
      }
    };

    checkInitialAuth();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromStreamChat();
    };
  }, []);

  const resetPassword = async (email: string): Promise<Response> => {
    try {
      setLoading(true);
      const response = await api.post('/api/reset-password', { email });
      if (response && response.data.success) {
        return { success: true, message: 'Password reset email sent successfully' };
      }
      setError('Failed to send password reset email');
      return { success: false, message: 'Failed to send password reset email' };
    } catch (error: any) {
      setError(error.response?.data.message || 'Failed to send password reset email');
      return { success: false, message: error.response?.data.message || 'Failed to send password reset email' };
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string): Promise<Response> => {
    try {
      setLoading(true);

      const response = await api.post('/api/login', { email, password });
      if (response && response.data.success) {
        localStorage.setItem('token', response.data.access_token);
        const userData = response.data.user;
        response.data.user.role === 'admin' ? setAdminView(true) : setAdminView(false);
        
        // Connect to StreamChat
        await connectToStreamChat(userData);
        
        setUser(userData);
        setIsAuthenticated(true);
        initialAuthComplete.current = true;
        
        return {success: true, message: 'Login successful'};
      }
      
      return {success: false, message: 'Login failed'};
    } catch (error: any) {
      setError(error.response?.data.error || 'Login failed');
      console.error(error)
      return {success: false, message: error.response?.data.error || 'Login failed'};
    } finally {
      setIsMiddleOfAuthFlow(false);
      setLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<Response> => {
    try {
      setLoading(true);
      
      const response = await api.post('/api/signup', data);

      if (response && response.data.success) {
        return {success: true, message: 'Signup successful'};
      }
      
      return {success: false, message: 'Signup Failed'};
    } catch (error: any) {
      setError(error.response?.data.message || 'Signup failed');
      return {success: false, message: error.response?.data.message || 'Signup failed'};
    } finally {
      setIsMiddleOfAuthFlow(false);
      setLoading(false);
    }
  };

  const verifcation = async (token: string): Promise<{status: boolean, user?: User, message?: string}> => {
    try {
      setLoading(true);
      const response = await api.get(`/verify-email/${token}`);
      
      if (response && response.data.success) {
        localStorage.setItem('token', response.data.access_token);
        response.data.user.role === 'admin' ? setAdminView(true) : setAdminView(false);
        
        // Connect to StreamChat
        await connectToStreamChat(response.data.user);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        initialAuthComplete.current = true;
        
        productService.fetchProducts().catch(error => {
          console.error('Background product fetch failed:', error);
        });

        return {status: true, user: response.data.user, message: 'Email verified successfully'};
      }
      
      return {status: false, message: 'Email verification failed'};
    } catch (error: any) {
      setError(error.response?.data.message || 'Email verification failed');
      console.error('Verification error:', error);
      return {status: false, message: error.response?.data.message || 'Email verification failed'};
    } finally {
      setIsMiddleOfAuthFlow(false);
      setLoading(false);
    }
  }
  const refresh = async (): Promise<void> => {
    if (isMiddleOfAuthFlow) {
      console.warn('Cannot refresh while in the middle of an auth flow');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setLoading(true);
        
        // Refetch user data from backend
        const userData = await getUserDataFromBackend();
        setUser(userData);
      } catch (error) {
        console.error('Refresh error:', error);
        // If refresh fails, logout user
        await logout();
      } finally {
        setLoading(false);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAdmin,
    login,
    setIsCheckingAuth,
    setError,
    error,
    verifcation,
    clearError,
    isMiddleOfAuthFlow,
    setIsMiddleOfAuthFlow,
    resetPassword,
    isCheckingAuth,
    signup,
    logout,
    refresh,
    isAuthenticated,
    isBuyer,
    isSeller,
    isLoading
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};