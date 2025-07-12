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
  
  const logout = async (): Promise<void> => {
    try {
      clearUser();
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      initialAuthComplete.current = false;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if Firebase logout fails
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
        
        await client.connectUser(
          {
            id: response.data.user.userId,
            name: response.data.user.name,
            image: response.data.user.avatarUrl,
          },
          response.data.user.userToken
        );

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
        await client.connectUser(
          {
            id: response.data.user.userId,
            name: response.data.user.name,
            image: response.data.user.avatarUrl,
          },
          response.data.user.userToken
        );
        setUser(userData);
        setIsAuthenticated(true);
        initialAuthComplete.current = true;
        
        // Sync products in the background (fetch fresh products for login)
        productService.fetchProducts().catch(error => {
          console.error('Background product fetch failed:', error);
        });
        
        return {success: true, message: 'Login successful'};
      }
      
      return {success: false, message: 'Login failed'};
    } catch (error: any) {
      setError(error.response?.data.error || 'Login failed');
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
        localStorage.setItem('token', response.data.access_token);
        response.data.user.role === 'admin' ? setAdminView(true) : setAdminView(false);
        await client.connectUser(
          {
            id: response.data.user.userId,
            name: response.data.user.name,
            image: response.data.user.avatarUrl,
          },
          response.data.user.userToken
        );
        setUser(response.data.user);
        setIsAuthenticated(true);
        initialAuthComplete.current = true;
        
        // Sync products in the background (fetch fresh products for signup)
        productService.fetchProducts().catch(error => {
          console.error('Background product fetch failed:', error);
        });
        
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