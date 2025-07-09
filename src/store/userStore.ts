import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  campus: string;
  isAdmin?: boolean;
  role: 'buyer' | 'seller' | 'both' | 'admin';
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Computed values
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBuyer: boolean;
  isSeller: boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setIsAuthenticated: (authenticated) => set({isAuthenticated: authenticated}),
      setLoading: (loading) => set({ isLoading: loading }),
      clearUser: () => set({ user: null }),
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
      
      // Computed values
      get isAuthenticated() {
        return !!get().user;
      },
      get isAdmin() {
        return !!get().user?.isAdmin;
      },
      get isBuyer() {
        const user = get().user;
        return user?.role === 'buyer' || user?.role === 'both' || false;
      },
      get isSeller() {
        const user = get().user;
        return user?.role === 'seller' || user?.role === 'both' || false;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);