import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerAmount?: number;
  sellerCampus?: string;
  sellerRating?: number;
  school: string;
  createdAt: string;
  slug: string;
  sellerPhone: string;
}
interface ProductStore {
  // State
  products: Product[];
  loading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProduct: (id: number) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getProductsBySchool: (school: string) => Product[];
  getProductsBySeller: (sellerId: string) => Product[];
  searchProducts: (query: string) => Product[];
  filterProducts: (filters: {
    category?: string;
    school?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => Product[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProducts: () => void;
}
export const useProductStore = create<ProductStore>()(devtools(persist((set, get) => ({
  // Initial state
  products: [],
  loading: false,
  error: null,
  // Actions
  setProducts: products => set({
    products,
    error: null
  }, false, 'setProducts'),
  addProduct: product => set(state => ({
    products: [...state.products, product],
    error: null
  }), false, 'addProduct'),
  updateProduct: (id, updates) => set(state => ({
    products: state.products.map(product => product.id === id ? {
      ...product,
      ...updates
    } : product),
    error: null
  }), false, 'updateProduct'),
  deleteProduct: id => set(state => ({
    products: state.products.filter(product => product.id !== id),
    error: null
  }), false, 'deleteProduct'),
  getProduct: id => {
    const {
      products
    } = get();
    return products.find(product => product.id === id);
  },
  getProductsByCategory: category => {
    const {
      products
    } = get();
    return products.filter(product => product.category === category);
  },
  getProductsBySchool: school => {
    const {
      products
    } = get();
    return products.filter(product => product.school === school);
  },
  getProductsBySeller: sellerId => {
    const {
      products
    } = get();
    return products.filter(product => product.sellerId === sellerId);
  },
  searchProducts: query => {
    const {
      products
    } = get();
    const lowerQuery = query.toLowerCase();
    return products.filter(product => product.title.toLowerCase().includes(lowerQuery) || product.description.toLowerCase().includes(lowerQuery) || product.category.toLowerCase().includes(lowerQuery));
  },
  filterProducts: filters => {
    const {
      products
    } = get();
    return products.filter(product => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.school && product.school !== filters.school) {
        return false;
      }
      if (filters.condition && product.condition !== filters.condition) {
        return false;
      }
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  },
  setLoading: loading => set({
    loading
  }, false, 'setLoading'),
  setError: error => set({
    error
  }, false, 'setError'),
  clearProducts: () => set({
    products: [],
    error: null
  }, false, 'clearProducts')
}), {
  name: 'product-store',
  // Only persist products, not loading/error states
  partialize: state => ({
    products: state.products
  })
}), {
  name: 'product-store'
}));

// Selector hooks for better performance
export const useProducts = () => useProductStore(state => state.products);
export const useProductsLoading = () => useProductStore(state => state.loading);
export const useProductsError = () => useProductStore(state => state.error);
export const useProductActions = () => useProductStore(state => ({
  setProducts: state.setProducts,
  addProduct: state.addProduct,
  updateProduct: state.updateProduct,
  deleteProduct: state.deleteProduct,
  getProduct: state.getProduct,
  getProductsByCategory: state.getProductsByCategory,
  getProductsBySchool: state.getProductsBySchool,
  getProductsBySeller: state.getProductsBySeller,
  searchProducts: state.searchProducts,
  filterProducts: state.filterProducts,
  setLoading: state.setLoading,
  setError: state.setError,
  clearProducts: state.clearProducts
}));