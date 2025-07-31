// src/services/adminService.ts
import api from "../utils/apiService";
import { useAdminDataStore } from "../store/adminData";
const adminService = {
  getAllUsers: async () => {
    const store = useAdminDataStore.getState();
    try {
      store.setLoading(true);
      const response = await api.get("api/admin/get-all-users");
      if (response.data.success) {
        store.setUsers(response.data.allUsers);
        return response.data.allUsers;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      store.setError(errorMessage);
      console.error(errorMessage);
    } finally {
      store.setLoading(false);
    }
  },
  sendWarning: async (userId: string, message: string) => {
    const store = useAdminDataStore.getState();
    try {
      store.setLoading(true);
      const response = await api.post("api/admin/send-warning", {
        userId,
        message
      });
      if (response.data.success) {
        return response.data.message;
      } else {
        throw new Error(response.data.message || 'Failed to send warning');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send warning';
      store.setError(errorMessage);
      console.error(errorMessage);
    } finally {
      store.setLoading(false);
    }
  },
  getTotalListings: async (userId: string) => {
    const store = useAdminDataStore.getState();
    try {
      store.setLoading(true);
      const response = await api.get(`api/admin/get-total-listings/${userId}`);
      if (response.data.success) {
        return response.data.totalListings;
      } else {
        throw new Error(response.data.message || 'Failed to fetch total listings');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch total listings';
      store.setError(errorMessage);
      console.error(errorMessage);
    } finally {
      store.setLoading(false);
    }
  }
};
export default adminService;