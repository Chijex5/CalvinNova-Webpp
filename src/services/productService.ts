import api from '../utils/apiService'; // Your API service
import { useProductStore, Product } from '../store/productStore'; // Your product store

interface GetProductsResponse {
  items: Product[];
  success: boolean;
}

interface ApiErrorResponse {
  message: string;
}

class ProductService {
  private lastFetchTime = 0;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Fetch all products from the backend with caching logic
   */
  async fetchProducts(forceRefresh = false): Promise<Product[]> {
    try {
      const store = useProductStore.getState();
      const now = Date.now();
      const timeSinceLastFetch = now - this.lastFetchTime;
      
      // Check if we have cached products and they're still valid
      if (!forceRefresh && store.products.length > 0 && timeSinceLastFetch < this.cacheTimeout) {
        console.log('Using cached products');
        return store.products;
      }

      // If we're forcing refresh or cache is invalid, fetch from API
      console.log('Fetching products from API');
      store.setLoading(true);
      store.setError(null);

      const response = await api.get<GetProductsResponse>('/api/users/items');
      
      if (response.data.success) {
        const products = response.data.items;
        store.setProducts(products);
        this.lastFetchTime = now; // Update last fetch time
        return products;
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
      const store = useProductStore.getState();
      store.setError(errorMessage);
      
      // If we have cached products, return them instead of throwing
      if (store.products.length > 0) {
        console.log('API failed, returning cached products');
        return store.products;
      }
      
      throw new Error(errorMessage);
    } finally {
      const store = useProductStore.getState();
      store.setLoading(false);
    }
  }

  /**
   * Refresh products from backend (force refresh)
   */
  async refreshProducts(): Promise<void> {
    await this.fetchProducts(true);
  }

  /**
   * Get products with error handling
   */
  async getProducts(): Promise<Product[]> {
    try {
      return await this.fetchProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return cached products if available
      const store = useProductStore.getState();
      return store.products;
    }
  }

  /**
   * Initialize products on app startup
   */
  async initializeProducts(): Promise<void> {
    try {
      await this.fetchProducts();
    } catch (error) {
      console.error('Failed to initialize products:', error);
      // Continue with cached products if available
    }
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid(): boolean {
    const store = useProductStore.getState();
    const timeSinceLastFetch = Date.now() - this.lastFetchTime;
    return store.products.length > 0 && timeSinceLastFetch < this.cacheTimeout;
  }

  /**
   * Clear cache and force next fetch to go to API
   */
  clearCache(): void {
    this.lastFetchTime = 0;
    const store = useProductStore.getState();
    store.clearProducts();
  }

  /**
   * Set cache timeout (in milliseconds)
   */
  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;

// Hook for using the product service in React components
export const useProductService = () => {
  const store = useProductStore();
  
  return {
    ...store,
    fetchProducts: productService.fetchProducts.bind(productService),
    refreshProducts: productService.refreshProducts.bind(productService),
    initializeProducts: productService.initializeProducts.bind(productService),
    isCacheValid: productService.isCacheValid.bind(productService),
    clearCache: productService.clearCache.bind(productService),
    setCacheTimeout: productService.setCacheTimeout.bind(productService),
  };
};