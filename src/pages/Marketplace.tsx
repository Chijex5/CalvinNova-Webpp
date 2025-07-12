import React, { useState, useEffect } from 'react';
import ModernItemEditForm from '../components/EditProduct';
import { useUserStore } from '../store/userStore';
import { useProductStore } from '../store/productStore';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MapPin, X, Heart, MessageCircle, ShoppingCart, Edit, Trash2, ChevronLeft, ChevronRight, ZoomIn, Expand, Loader } from 'lucide-react';
import { productService } from '../services/productService';
import { useChatStore } from '../store/chatStore';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerCampus?:string;
  sellerRating?: number;
  school: string;
}

// FadeIn Animation Component
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {children}
    </div>
  );
};

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productTitle: string;
}

// Image Gallery Modal Component
const ImageGalleryModal = ({ isOpen, onClose, images, initialIndex = 0, productTitle }: ImageGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    interface KeyboardEvent {
      key: string;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  if (!isOpen || !images?.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="text-white">
            <h3 className="font-semibold text-lg truncate">{productTitle}</h3>
            <p className="text-sm text-gray-300">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-20">
        <div className="relative max-w-full max-h-full">
          <img
            src={images[currentIndex]}
            alt={`${productTitle} - Image ${currentIndex + 1}`}
            className={`max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/800/600';
            }}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center p-4 space-x-2 overflow-x-auto">

            {images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-white scale-110' 
                    : 'border-white/30 hover:border-white/60'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, onEdit, currentUserId = null }: {
  product: Product;
  onEdit: (product: Product) => void;
  currentUserId?: string | null;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore(state => state.user);
  const { startMessaging, chats } = useChatStore();
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});

  const isOwner = currentUserId === product.sellerId;
  const productImages = product.images && product.images.length > 0 ? product.images : ['/api/placeholder/400/400'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };


  const handleDeleteProduct = async (productId: string): Promise<void> => {
    setDeleteLoading(true);
    try {
      await productService.deleteProduct(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Like New': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageError = (imageIndex: number) => {
    setImageError(prev => ({
      ...prev,
      [imageIndex]: true
    }));
  };

  const goToNextImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev < productImages.length - 1 ? prev + 1 : 0
    );
  };

  const goToPreviousImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : productImages.length - 1
    );
  };

  const openGallery = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsGalleryOpen(true);
  };

  const isOwnProduct = user?.userId === product.sellerId;

  const handleContactSeller = async (sellerId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isOwnProduct) {
      // Shouldn't happen, but just in case
      return;
    }

    setIsContactingSeller(true);
    setError(null); // Clear any previous errors

    try {
      // Check if conversation already exists
      const existingChat = chats.find(chat => {
        const members = Object.keys(chat.state.members || {});
        return members.includes(user.userId) && members.includes(sellerId);
      });

      if (existingChat) {
        console.log('Found existing conversation:', existingChat.id);
        // Navigate to chat with existing conversation
        navigate(`/chat/${existingChat.id}`);
      } else {
        console.log('Creating new chat between:', user.userId, 'and seller:', sellerId);
        
        // Create new conversation using Zustand store
        await startMessaging([sellerId]);
        
        // Navigate to the chat page (assuming the chat store will set currentChat)
        navigate('/chat');
      }

    } catch (error) {
      console.error('Error creating/getting chat:', error);
      setError('Failed to start conversation. Please try again.');
      
      // Show error message to user
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsContactingSeller(false);
    }
  };

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={imageError[currentImageIndex] ? '/api/placeholder/400/400' : productImages[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => handleImageError(currentImageIndex)}
          />
          
          {/* Image Navigation Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            {/* Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-800" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="w-4 h-4 text-gray-800" />
                </button>
              </>
            )}
            
            {/* Expand Button */}
            <button
              onClick={openGallery}
              className="absolute bottom-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <Expand className="w-4 h-4 text-gray-800" />
            </button>
          </div>
          
          {/* Favorite Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {/* Condition Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
              {product.condition}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-semibold">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Image Indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {productImages.map((_: string, index: number) => (
              <button
                key={index}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
                }`}
              />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Seller Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={product?.sellerAvatar || '/api/placeholder/32/32'} 
              alt={product?.sellerName || 'Seller'}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product?.sellerName || 'Unknown Seller'}
              </p>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-500">{product?.sellerRating || 'N/A'}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 truncate">{product?.sellerCampus || product.school}</span>
              </div>
            </div>
          </div>

          {/* Category and School */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {product.school}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {isOwner ? (
              <>
                <button 
                  onClick={() => onEdit(product)} // Pass the product data
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                onClick={handleDeleteProduct.bind(null, product.id)}
                className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors duration-200">
                  
                  {deleteLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
                <button 
                onClick={() => handleContactSeller(product.sellerId)}
                disabled={isContactingSeller}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors duration-200">
                  {isContactingSeller ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (    
                  <MessageCircle className="w-4 h-4" />
                )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={productImages}
        initialIndex={currentImageIndex}
        productTitle={product.title}
      />
    </>
  );
};

// Filter Sheet Component (Mobile)
const FilterSheet = ({ isOpen, onClose, filters, onFiltersChange, categories, schools }: {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    category: string;
    school: string;
    minPrice: string;
    maxPrice: string;
  };
  onFiltersChange: (filters: {
    category: string;
    school: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
  categories: string[];
  schools: string[];
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
          <select 
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* School Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">School</label>
          <select 
            value={filters.school}
            onChange={(e) => onFiltersChange({ ...filters, school: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Schools</option>
            {schools.map((school: string) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors duration-200"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// Main Marketplace Component
const MarketplaceUI = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    school: '',
    minPrice: '',
    maxPrice: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Get state from stores
  const { products, loading, error } = useProductStore();
  const user = useUserStore((state) => state.user);
  const currentUserId = user?.userId;

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await productService.fetchProducts();
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    

    loadProducts();
    console.log(products);
  }, []);

  // Extract unique categories and schools from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
      const uniqueSchools = [...new Set(products.map(p => p.school))].filter(Boolean);
      
      setCategories(uniqueCategories);
      setSchools(uniqueSchools);
    }
  }, [products]);


  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesSchool = !filters.school || product.school === filters.school;
    const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);

    return matchesSearch && matchesCategory && matchesSchool && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => productService.fetchProducts()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showEditForm && selectedProduct) {
    return (
      <ModernItemEditForm 
        productData={selectedProduct} 
        onCancel={() => setShowEditForm(false)} 
        onSuccess={() => setShowEditForm(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex space-x-2">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 bg-white"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center space-x-4 mb-6">
          <select 
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={filters.school}
            onChange={(e) => setFilters({ ...filters, school: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">All Schools</option>
            {schools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product, index) => (
            <FadeIn key={product.id} delay={index * 100}>
              <ProductCard 
                product={product} 
                currentUserId={currentUserId}
                onEdit={(product) => {
                  setSelectedProduct(product);
                  setShowEditForm(true);
                }}
              />
            </FadeIn>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ category: '', school: '', minPrice: '', maxPrice: '' });
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <FilterSheet 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        schools={schools}
      />
    </div>
  );
};

export default MarketplaceUI;