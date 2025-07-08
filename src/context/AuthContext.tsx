import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;
  role: 'buyer' | 'seller' | 'both';
  school: string;
}
interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'both';
  school: string;
}
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isBuyer: boolean;
  isSeller: boolean;
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
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Mock user for demo purposes
  useEffect(() => {
    // Simulate fetching user from storage
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      isAdmin: true,
      role: 'both',
      school: 'University of California, Berkeley'
    };
    setUser(mockUser);
    setLoading(false);
  }, []);
  const login = async (email: string, password: string) => {
    // Mock login
    if (email && password) {
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        isAdmin: email.includes('admin'),
        role: 'both',
        school: 'University of California, Berkeley'
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };
  const signup = async (data: SignupData) => {
    // Mock signup
    try {
      // In a real app, this would make an API call to create the user
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        role: data.role,
        school: data.school
      };
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };
  const logout = () => {
    setUser(null);
  };
  const value = {
    user,
    isAdmin: !!user?.isAdmin,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isBuyer: user?.role === 'buyer' || user?.role === 'both' || false,
    isSeller: user?.role === 'seller' || user?.role === 'both' || false
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};