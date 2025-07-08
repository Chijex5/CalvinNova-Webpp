import React, { useState, createContext, useContext } from 'react';
import { Product } from '../utils/types';
import { initialProducts } from '../utils/mockData';
interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}
const ProductContext = createContext<ProductContextType | undefined>(undefined);
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
export const ProductProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9)
    };
    setProducts([...products, newProduct as Product]);
  };
  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(products.map(product => product.id === id ? {
      ...product,
      ...updatedFields
    } : product));
  };
  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };
  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById
  };
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};