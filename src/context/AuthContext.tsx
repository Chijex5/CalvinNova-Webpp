import React, { useEffect, createContext, useContext } from 'react';
import { useUserStore } from '../store/userStore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import app from '../firebase/firebaseConfig';

const auth = getAuth(app);

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;
  role: 'buyer' | 'seller' | 'both' | 'admin';
}

interface SignupData {
  name: string;
  email: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'both';
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
    isAdmin, 
    isBuyer, 
    isSeller 
  } = useUserStore();

  // Mock function to get user data from backend
  const getUserDataFromBackend = async (userId: string, email: string): Promise<User> => {
    // This would be replaced with actual backend call
    // For now, returning mock data
    return {
      id: userId,
      name: 'John Doe', // This would come from backend
      email: email,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      isAdmin: email.includes('admin'),
      role: 'both'
    };
  };

  // Firebase auth state listener
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from backend using Firebase UID
          const userData = await getUserDataFromBackend(firebaseUser.uid, firebaseUser.email!);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If backend fails, create minimal user object
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email!,
            avatar: firebaseUser.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
            role: 'buyer'
          };
          setUser(fallbackUser);
        }
      } else {
        clearUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setLoading]);

  const login = async (email: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Get user data from backend
      const userData = await getUserDataFromBackend(userId, email);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      setLoading(true);
      // This would typically create user in backend and Firebase
      // For now, just mock the response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        role: data.role
      };
      
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      clearUser();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if Firebase logout fails
      clearUser();
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
        const userData = await getUserDataFromBackend(currentUser.uid, currentUser.email!);
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