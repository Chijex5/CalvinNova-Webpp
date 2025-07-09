import React, { useEffect, useState, createContext, useContext } from 'react';
import { useUserStore } from '../store/userStore';
import api from '../utils/apiService';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import app from '../firebase/firebaseConfig';

const auth = getAuth(app);

interface User {
  id: string;
  name: string;
  email: string;
  campus: string;
  avatar: string;
  isAdmin?: boolean;
  role: 'buyer' | 'seller' | 'both' | 'admin';
}

interface SignupData {
  name: string;
  email: string;
  campus: string;
  role: 'buyer' | 'seller' | 'both';
  avatar?: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, userId: string) => Promise<boolean>;
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


  // Mock function to get user data from backend
  const getUserDataFromBackend = async (userId: string): Promise<User> => {
    try {
      const response = await api.get(`/api/me/${userId}`);
      if (response.data && response.data.success) {
        setIsAuthenticated(true);
        return response.data.user;
        
      }
      throw new Error('Failed to fetch user data');
    } catch (error) {
      console.error('Error fetching user data from backend:', error);
      throw error;
    }
  };
  

  // Firebase auth state listener
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from backend using Firebase UID
          const userData = await getUserDataFromBackend(firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        clearUser();
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setLoading]);

  const login = async ( userId: string): Promise<boolean> => {
    try {
      // Get user data from backend
      const response = await api.post('/api/check', { userId });
      if (response && response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const response = await api.post('/api/signup', data)

      if (response && response.data.success){
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      clearUser();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if Firebase logout fails
      clearUser();
      setIsAuthenticated(false);
    }
  };

  const refresh = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        setLoading(true);
        // Force refresh the Firebase token
        await currentUser.getIdToken(true);
        
        // Refetch user data from backend
        const userData = await getUserDataFromBackend(currentUser.uid);
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
    signup,
    logout,
    refresh,
    isAuthenticated,
    isBuyer,
    isSeller,
    isLoading
  };

  // Show loading screen while checking authentication
  if (isLoading) {
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