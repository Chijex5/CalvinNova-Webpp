import React from 'react';
import { Product, User } from './types';
// Mock categories
export const categories = [{
  id: 'electronics',
  name: 'Electronics'
}, {
  id: 'books',
  name: 'Books & Textbooks'
}, {
  id: 'furniture',
  name: 'Furniture'
}, {
  id: 'clothing',
  name: 'Clothing'
}, {
  id: 'appliances',
  name: 'Appliances'
}, {
  id: 'sports',
  name: 'Sports & Outdoors'
}, {
  id: 'other',
  name: 'Other'
}];
// Mock schools
export const schools = ['University of California, Berkeley', 'Stanford University', 'UCLA', 'MIT', 'Harvard University', 'University of Michigan'];
// Mock users
export const users: User[] = [{
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  school: 'University of California, Berkeley',
  rating: 4.8,
  joinedDate: 'January 2022',
  isAdmin: true
}, {
  id: 'NOak9U3r5ZNDG3tgRLdu8RW7Yqh1',
  name: 'Chijioke Uzodinma',
  email: 'embroconnec9@gmail.com',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=H944WKxX',
  school: 'Unn',
  rating: 4.9,
  joinedDate: 'July 2025'
}, {
  id: '3',
  name: 'Michael Brown',
  email: 'michael@example.com',
  avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
  school: 'UCLA',
  rating: 4.7,
  joinedDate: 'December 2021'
}, {
  id: '4',
  name: 'Emily Davis',
  email: 'emily@example.com',
  avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
  school: 'University of Michigan',
  rating: 4.5,
  joinedDate: 'August 2022'
}];
// Mock products
export const initialProducts: Product[] = [{
  id: '1',
  title: 'MacBook Pro 2021 13" M1',
  description: 'Like new MacBook Pro with M1 chip, 16GB RAM, 512GB SSD. Includes charger and protective case. Only used for one semester.',
  price: 1200,
  category: 'Electronics',
  condition: 'Like New',
  images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1626&q=80', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
  school: 'University of California, Berkeley',
  sellerId: 'NOak9U3r5ZNDG3tgRLdu8RW7Yqh1',
  createdAt: '2023-05-15T10:30:00Z'
}, {
  id: '2',
  title: 'Calculus: Early Transcendentals 8th Edition',
  description: 'Textbook in excellent condition, no highlights or notes. Perfect for Calculus I and II courses.',
  price: 65,
  category: 'Books',
  condition: 'Good',
  images: ['https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80'],
  school: 'Stanford University',
  sellerId: '3',
  createdAt: '2023-05-12T14:20:00Z'
}, {
  id: '3',
  title: 'Minimalist Desk Lamp',
  description: 'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port included. Perfect for dorm rooms.',
  price: 35,
  category: 'Furniture',
  condition: 'Like New',
  images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80'],
  school: 'UCLA',
  sellerId: '1',
  createdAt: '2023-05-10T09:15:00Z'
}, {
  id: '4',
  title: 'College Hoodie - Size M',
  description: 'Official college hoodie, size medium. Worn only a few times, in great condition. Very warm and comfortable.',
  price: 25,
  category: 'Clothing',
  condition: 'Good',
  images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'],
  school: 'MIT',
  sellerId: '4',
  createdAt: '2023-05-08T16:45:00Z'
}, {
  id: '5',
  title: 'Mini Refrigerator',
  description: 'Compact 3.2 cu ft refrigerator, perfect for dorms. Includes freezer compartment and adjustable shelves. Only used for one year.',
  price: 80,
  category: 'Appliances',
  condition: 'Good',
  images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'],
  school: 'Harvard University',
  sellerId: '2',
  createdAt: '2023-05-07T11:30:00Z'
}, {
  id: '6',
  title: 'Wireless Noise-Cancelling Headphones',
  description: 'Sony WH-1000XM4 wireless noise-cancelling headphones. Great battery life and sound quality. Includes carrying case and cables.',
  price: 180,
  category: 'Electronics',
  condition: 'Like New',
  images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1165&q=80', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80'],
  school: 'University of Michigan',
  sellerId: '3',
  createdAt: '2023-05-05T13:20:00Z'
}, {
  id: '7',
  title: 'Basketball',
  description: 'Official size basketball, barely used. Perfect for pickup games or practice.',
  price: 15,
  category: 'Sports',
  condition: 'Good',
  images: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80'],
  school: 'UCLA',
  sellerId: '4',
  createdAt: '2023-05-03T17:40:00Z'
}, {
  id: '8',
  title: 'Desk Chair - Ergonomic',
  description: 'Comfortable ergonomic desk chair with lumbar support and adjustable height. Perfect for long study sessions.',
  price: 70,
  category: 'Furniture',
  condition: 'Good',
  images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'],
  school: 'University of California, Berkeley',
  sellerId: '1',
  createdAt: '2023-05-01T10:15:00Z'
}];
// Hook to access mock data
export const useMockProducts = () => {
  const featuredProducts = initialProducts.slice(0, 4);
  const getSellerById = (id: string) => {
    return users.find(user => user.id === id) || users[0];
  };
  return {
    products: initialProducts,
    featuredProducts,
    categories: categories,
    schools,
    getSellerById
  };
};