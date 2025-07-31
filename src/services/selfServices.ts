import api from "../utils/apiService";
import { Notification } from "../store/userStore";
export interface CheckoutData {
  productId: number;
  sellerId: string;
  transactionId: string;
  title: string;
  sellerAmount?: number; // Optional for seller's amount
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerId: string;
  amount: number;
}
const selfService = {
  checkout: async (data: CheckoutData): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const response = await api.post("/api/checkout", data);
      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: "Checkout failed"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Checkout failed"
      };
    }
  },
  markAsRead: async (notificationId: number): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const response = await api.post(`/api/user/mark-as-read/${notificationId}`);
      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: "Failed to mark notification as read"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to mark notification as read"
      };
    }
  },
  markAllAsRead: async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const response = await api.post(`/api/user/mark-all-as-read`);
      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: "Failed to mark all notifications as read"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to mark all notifications as read"
      };
    }
  },
  deleteNotification: async (notificationId: number): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const response = await api.delete(`/api/user/delete-notification/${notificationId}`);
      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
        message: "Failed to delete notification"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete notification"
      };
    }
  },
  refreshNotifications: async (): Promise<{
    success: boolean;
    notifications?: Notification[];
    message?: string;
  }> => {
    try {
      const response = await api.get(`/api/user/refresh-notifications`);
      if (response.data.success) {
        return {
          success: true,
          notifications: response.data.notifications
        };
      }
      return {
        success: false,
        message: "Failed to refresh notifications"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to refresh notifications"
      };
    }
  }
};
export default selfService;