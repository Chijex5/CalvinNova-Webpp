import React from 'react';
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  school: string;
  sellerId: string;
  createdAt: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  school: string;
  rating: number;
  joinedDate: string;
  isAdmin?: boolean;
}