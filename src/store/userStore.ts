import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  action_url?: string;
  priority: 'low' | 'normal' | 'high';
  created_at: string;
  updated_at: string;
  transaction_id?: string;
}
export interface User {
  userId: string;
  bankDetails?: BankDetails;
  notifications?: Notification[];
  name: string;
  email: string;
  phoneNumber?: string;
  userToken: string;
  avatarUrl: string;
  campus: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastPasswordChange: string;
  role: 'buyer' | 'seller' | 'both' | 'admin' | 'agent';
}
interface UserStore {
  user: User | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  markNotificationAsRead: (notificationId: number) => void;
  markAllNotificationsAsRead: () => void;
  setBankDetails: (bankDetails: BankDetails) => void;
  deleteNotification: (notificationId: number) => void;
  setNotifications: (notifications: Notification[]) => void;
  thereIsUnreadNotifications: () => boolean;
  setLoading: (loading: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  clearUser: () => void;
  updateUserRole: (newRole: 'buyer' | 'seller' | 'both' | 'admin') => void;
  updateUser: (updates: Partial<User>) => void;

  // Computed values
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBuyer: boolean;
  isSeller: boolean;
}
export const useUserStore = create<UserStore>()(persist((set, get) => ({
  user: null,
  isLoading: false,
  // Actions
  setUser: user => set({
    user
  }),
  markNotificationAsRead: notificationId => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedNotifications = currentUser.notifications?.map(notification => notification.id === notificationId ? {
        ...notification,
        is_read: 1
      } : notification);
      set({
        user: {
          ...currentUser,
          notifications: updatedNotifications
        }
      });
    }
  },
  thereIsUnreadNotifications: () => {
    const currentUser = get().user;
    return currentUser?.notifications?.some(notification => notification.is_read === 0) || false;
  },
  markAllNotificationsAsRead: () => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedNotifications = currentUser.notifications?.map(notification => ({
        ...notification,
        is_read: 1
      }));
      set({
        user: {
          ...currentUser,
          notifications: updatedNotifications
        }
      });
    }
  },
  deleteNotification: notificationId => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedNotifications = currentUser.notifications?.filter(notification => notification.id !== notificationId);
      set({
        user: {
          ...currentUser,
          notifications: updatedNotifications
        }
      });
    }
  },
  setNotifications: notifications => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          notifications
        }
      });
    }
  },
  setBankDetails: bankDetails => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          bankDetails
        }
      });
    }
  },
  setIsAuthenticated: authenticated => set({
    isAuthenticated: authenticated
  }),
  setLoading: loading => set({
    isLoading: loading
  }),
  clearUser: () => set({
    user: null
  }),
  updateUserRole: async (newRole) => {
    const currentUser = get().user;
    if (!currentUser) return;
    set({
      user: {
        ...currentUser,
        role: newRole
      }
    });
  },
  updateUser: updates => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          ...updates
        }
      });
    }
  },
  // Computed values
  get isAuthenticated() {
    return !!get().user;
  },
  get isAdmin() {
    return get().user?.role === 'admin' || false;
  },
  get isBuyer() {
    const user = get().user;
    return user?.role === 'buyer' || user?.role === 'both' || false;
  },
  get isSeller() {
    const user = get().user;
    return user?.role === 'seller' || user?.role === 'both' || false;
  }
}), {
  name: 'user-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: state => ({
    user: state.user
  })
}));