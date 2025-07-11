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
  name: string;
  email: string;
  campus: string;
  role: 'buyer' | 'seller' | 'both';
  avatarUrl?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
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
  signup: (data: SignupData) => Promise<boolean>;
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

  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isMiddleOfAuthFlow, setIsMiddleOfAuthFlow] = useState<boolean>(false);
  
  // Track if initial auth check is complete
  const initialAuthComplete = useRef<boolean>(false);
  
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      clearUser();
      setIsAuthenticated(false);
      initialAuthComplete.current = false;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if Firebase logout fails
      clearUser();
      setIsAuthenticated(false);
    }
  };

  const getUserDataFromBackend = async (retryCount = 0): Promise<User> => {
    try {
      setLoading(true);
      setIsCheckingAuth(true);
      const response = await api.get(`/api/me`);
      if (response.data && response.data.success) {
        console.log('User data fetched from backend:', response.data);
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
          console.error('Background product refresh failed:', error);
        });
        
        return response.data.user;
      }

      throw new Error('Failed to fetch user data');
    } catch (error: any) {
      console.error('Error fetching user data from backend:', error);
      
      // If it's a 401 error and we haven't retried, wait a bit and retry
      // This handles the case where the user was just created but isn't immediately available
      if (error.response?.status === 401 && retryCount < 2) {
        console.log(`Retrying user data fetch... (attempt ${retryCount + 1})`);
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

  const login = async (email: string, userId: string): Promise<Response> => {
    try {
      setIsMiddleOfAuthFlow(true);
      setLoading(true);
      
      // Get user data from backend
      const response = await api.post('/api/check', { userId });
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
      console.error('Login error:', error);
      return {success: false, message: error.response?.data.error || 'Login failed'};
    } finally {
      setIsMiddleOfAuthFlow(false);
      setLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      setIsMiddleOfAuthFlow(true);
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
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
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
    isMiddleOfAuthFlow,
    setIsMiddleOfAuthFlow,
    isCheckingAuth,
    signup,
    logout,
    refresh,
    isAuthenticated,
    isBuyer,
    isSeller,
    isLoading
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};