import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useProductStore } from '../store/productStore';
import { productService } from '../services/productService';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  X,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Expand,
  Loader,
  SlidersHorizontal,
  Check,
  Eye,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  MoreVertical,
  Plus,
  AlertCircle,
  BarChart3,
  Users,
  ShoppingCart,
  Clock,
} from 'lucide-react';

interface Product {
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

// Image Gallery Modal (reused from marketplace)
interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productTitle: string;
}

const ImageGalleryModal = ({ isOpen, onClose, images, initialIndex = 0, productTitle }: ImageGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  const goToPrevious = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  };

  const goToNext = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!isOpen || !images?.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 dark:bg-black/98 backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 dark:from-black/70 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="text-white">
            <h3 className="font-semibold text-lg truncate">{productTitle}</h3>
            <p className="text-sm text-gray-300 dark:text-gray-400">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-colors duration-200"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-20">
        <div className="relative max-w-full max-h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={images[currentIndex]}
            alt={`${productTitle} - Image ${currentIndex + 1}`}
            className={`max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => setIsZoomed(!isZoomed)}
            onLoad={handleImageLoad}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/800/600';
              setIsLoading(false);
            }}
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};

// Product Card for Seller Dashboard
const SellerProductCard = ({
  product,
  onEdit,
  onDelete,
  viewMode = 'grid'
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const productImages = product.images && product.images.length > 0 ? product.images : ['/api/placeholder/400/400'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'good':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'used':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const calculateCommission = (price: number, sellerPrice: number) => {
    return price - sellerPrice;
  };

  const calculateAgentPercentage = (price: number, sellerPrice: number) => {
    const commission = calculateCommission(price, sellerPrice);
    return (commission / price) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="relative w-full md:w-48 h-48 flex-shrink-0">
            <img
              src={productImages[0]}
              alt={product.title}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
              }}
            />
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
                {product.condition}
              </span>
            </div>
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                {product.title}
              </h3>
              <div className="relative ml-4">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                {showActions && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-32">
                    <button
                      onClick={() => {
                        navigate(`/product/${product.slug}`);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        onEdit(product);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(product);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                {product.school}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(product.createdAt)}
              </div>
              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                {product.category}
              </div>
            </div>

            {/* Pricing Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Listing Price</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">{`Platform Fee (${calculateAgentPercentage(product.price, product.sellerAmount || 0)})`}</p>
                <p className="font-semibold text-red-700 dark:text-red-400">-{formatPrice(calculateCommission(product.price, product.sellerAmount || 0))}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Your Earnings</p>
                <p className="font-semibold text-green-700 dark:text-green-400">{formatPrice(product?.sellerAmount || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <ImageGalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          images={productImages}
          productTitle={product.title}
        />
      </div>
    );
  }

  // Grid view (default)
  return (
    <>
      <div
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={productImages[currentImageIndex]}
            alt={product.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovering ? 'scale-110' : 'scale-100'
            } ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
            }}
            onLoad={() => setIsImageLoading(false)}
          />

          {/* Condition Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getConditionColor(product.condition)}`}>
              {product.condition}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-semibold shadow-md">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className={`absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-700 transform hover:scale-110 transition-all duration-200 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Expand className="w-4 h-4 text-gray-800 dark:text-gray-200" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
            {product.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {product.school}
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Earnings Info */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-600 dark:text-green-400">Your Earnings:</span>
              <span className="font-semibold text-green-700 dark:text-green-300">
                {formatPrice(product.sellerAmount || 0)}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Platform fee: {formatPrice(calculateCommission(product.price, product.sellerAmount || 0))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-auto">
            <button
              onClick={() => navigate(`/product/${product.slug}`)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
            <button
              onClick={() => onEdit(product)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(product)}
              className="px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Listed on {formatDate(product.createdAt)}
          </div>
        </div>
      </div>

      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={productImages}
        productTitle={product.title}
      />
    </>
  );
};

// Main Seller Dashboard Component
const SellerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products, loading, error } = useProductStore();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // Filter products to only show current user's products
  const myProducts = products.filter(product => product.sellerId === user?.userId);

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
  }, []);

  // Extract unique categories from user's products
  useEffect(() => {
    if (myProducts.length > 0) {
      const uniqueCategories = [...new Set(myProducts.map(p => p.category))].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [myProducts]);

  // Filter and sort products
  const filteredProducts = myProducts
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);
      const matchesCondition = !filters.condition || product.condition.toLowerCase() === filters.condition.toLowerCase();

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesCondition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

  // Calculate earnings
  const totalListingValue = myProducts.reduce((sum, product) => sum + product.price, 0);
  const totalCommission = myProducts.reduce((sum, product) => {
    const commission = product.price - (product.sellerAmount || 0);
    return sum + (commission > 0 ? commission : 0);
  }, 0);
  const totalEarnings = totalListingValue - totalCommission;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const handleDeleteRequest = (product: Product) => {
    setDeleteConfirmProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct) return;
    setDeleteLoading(true);
    try {
      await productService.deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  // Redirect if not a seller
  useEffect(() => {
    if (user && user.role !== 'seller' && user.role !== 'both') {
      navigate('/marketplace');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Products</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your listings and track earnings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/sell"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FadeIn delay={0}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{myProducts.length}</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Total Products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active listings</p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalEarnings)}</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Total Earnings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">After platform fees</p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalListingValue)}</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Listing Value</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total product value</p>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {myProducts.length > 0 ? formatPrice(totalListingValue / myProducts.length) : formatPrice(0)}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Average Price</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Per product</p>
            </div>
          </FadeIn>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Highest Price</option>
              <option value="price-low">Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Any Condition</option>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Min Price</label>
              <input
                type="number"
                placeholder="₦0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="₦999,999"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium text-gray-900 dark:text-white">{filteredProducts.length}</span> of{' '}
            <span className="font-medium text-gray-900 dark:text-white">{myProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product, index) => (
              <FadeIn key={product.id} delay={index * 50}>
                <SellerProductCard
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  viewMode={viewMode}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {myProducts.length === 0 ? (
              <>
                <div className="w-20 h-20 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No products yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start selling by adding your first product. It's quick and easy to get started!
                </p>
                <Link
                  to="/sell"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Link>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ category: '', condition: '', minPrice: '', maxPrice: '' });
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        )}

        {/* Earnings Summary (when products exist) */}
        {myProducts.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Earnings Breakdown
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Based on current listings
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatPrice(totalListingValue)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Listing Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  -{formatPrice(totalCommission)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Platform Fees (8%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {formatPrice(totalEarnings)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your Net Earnings</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-1">About Platform Fees:</p>
                  <p>We charge a 8% commission on each sale to cover payment processing, platform maintenance, and seller support services.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteConfirmProduct(null)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Delete Product
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                "{deleteConfirmProduct.title}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;