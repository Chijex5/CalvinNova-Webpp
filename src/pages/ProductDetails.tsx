import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ProductDetailSkeleton from '../components/loaders/ProductDetsilSkeleton';
import { MessageSquareIcon, HeartIcon, ShareIcon, FlagIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon, CalendarIcon, EyeIcon } from 'lucide-react';
import { useProductStore, Product } from '../store/productStore';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useChatStore } from '../store/chatStore';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };
// SEO Hook for dynamic meta updates
const useProductSEO = (product) => {
  useEffect(() => {
    if (!product) return;
    
    // Only update if we're on client-side (SSR already handled initial load)
    if (typeof window !== 'undefined' && !window.__SSR_RENDERED__) {
      // Update page title
      document.title = `${product.title} - ${formatPrice(product.price)} | CalvinNova Marketplace`;
      
      // Update meta description
      updateMetaTag('description', 
        `Buy ${product.title} in ${product.condition} condition for ${formatPrice(product.price)}. ${product.description.substring(0, 150)}`
      );
      
      // Update Open Graph tags
      updateMetaTag('og:title', product.title, 'property');
      updateMetaTag('og:description', product.description.substring(0, 160), 'property');
      updateMetaTag('og:image', product.images[0], 'property');
      updateMetaTag('og:type', 'product', 'property');
      
      // Add/update structured data
      addStructuredData(product);
    }
  }, [product]);
};

// Helper functions for SEO
const updateMetaTag = (name, content, attribute = 'name') => {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.content = content;
};

const addStructuredData = (product) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": product.images,
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": "NGN",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": product.sellerName
      }
    },
    "category": product.category,
    "condition": product.condition
  });
  document.head.appendChild(script);
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSSRData, setIsSSRData] = useState(false);

  // Store hooks
  const {
    products,
    loading: productsLoading,
    error: productError
  } = useProductStore();
  const {
    startMessaging,
    chats,
    error: chatError,
    setError: setChatError
  } = useChatStore();

  // Apply SEO updates when product changes
  useProductSEO(product);

  

  // Check for server-side rendered data first
  useEffect(() => {
    // Check if we have SSR data injected by the server
    if (typeof window !== 'undefined' && window.__PRODUCT_DATA__) {
      const ssrProduct = window.__PRODUCT_DATA__;
      if (ssrProduct.slug === slug) {
        setProduct(ssrProduct);
        setIsSSRData(true);
        // Mark that SSR was used so we don't override meta tags
        window.__SSR_RENDERED__ = true;
        return;
      }
    }
    
    // Fallback to client-side loading
    loadProductClientSide();
  }, [slug]);

  // Client-side product loading (fallback)
  const loadProductClientSide = async () => {
    try {
      setLocalError(null);

      // If products are not loaded yet, load them
      if (!products.length && !productsLoading) {
        await productService.fetchProducts();
      }

      // Find product by slug
      const foundProduct = products.find(p => p.slug === slug);
      if (!foundProduct && products.length > 0) {
        setLocalError('Product not found');
      } else if (foundProduct) {
        setProduct(foundProduct);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      setLocalError('Failed to load product');
    }
  };

  // Image navigation handlers
  const nextImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
  }, [product?.images?.length]);

  const prevImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
  }, [product?.images?.length]);

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyPress = e => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextImage, prevImage]);

  // Contact seller handler
  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: `/product/${slug}`
        }
      });
      return;
    }
    if (isOwnProduct) return;
    setIsContactingSeller(true);
    setChatError(null);
    try {
      const sellerId = product?.sellerId;

      // Check for existing conversation
      if (!sellerId) return;
      const existingChat = chats.find(chat => {
        const members = Object.keys(chat.state.members || {});
        return members.includes(user.userId) && members.includes(sellerId);
      });
      if (existingChat) {
        navigate(`/chat/${existingChat.id}`);
      } else {
        // Create new conversation
        const chatId = await startMessaging([sellerId]);
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      setChatError('Failed to start conversation. Please try again.');
      setTimeout(() => setChatError(null), 5000);
    } finally {
      setIsContactingSeller(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: `/product/${slug}`
        }
      });
      return;
    }
    try {
      setIsFavorited(prev => !prev);
      // Here you would call your API to toggle favorite
      // await productService.toggleFavorite(product.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setIsFavorited(prev => !prev); // Revert on error
    }
  };

  // Share product with better SEO data
  const handleShare = async () => {
    const shareData = {
      title: `${product?.title} - ${formatPrice(product?.price || 0)}`,
      text: `Check out this ${product?.category} for ${formatPrice(product?.price || 0)}: ${product?.title}`,
      url: window.location.href
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  // Report product
  const handleReport = () => {
    navigate(`/report/product/${slug}`);
  };

  // Calculate derived values
  const isOwnProduct = user?.userId === product?.sellerId;
  const displayError = localError || productError || chatError;

  // Loading state - but only show if we don't have SSR data
  if (!isSSRData && (productsLoading || !product) && !displayError) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (displayError || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Link to="/marketplace" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ChevronLeftIcon size={16} />
          <span className="ml-1">Back to Marketplace</span>
        </Link>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {localError === 'Product not found' ? 'Product Not Found' : 'Something went wrong'}
          </h2>
          <p className="mb-6 text-gray-600">
            {localError === 'Product not found' 
              ? "The product you're looking for doesn't exist or has been removed." 
              : displayError || 'Unable to load product details. Please try again.'}
          </p>
          <div className="space-x-4">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Link to="/marketplace">
              <Button variant="secondary">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 dark:bg-gray-900">
      {/* Breadcrumb navigation - Enhanced for SEO */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
        <Link to="/marketplace" className="hover:text-blue-600 dark:hover:text-blue-400">
          Marketplace
        </Link>
        <span>›</span>
        <Link to={`/marketplace?category=${product.category}`} className="hover:text-blue-600 dark:hover:text-blue-400">
          {product.category}
        </Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-gray-100">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images - Enhanced with better alt tags */}
        <div className="relative">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square">
            <img 
              src={product.images[currentImageIndex]} 
              alt={`${product.title} - ${product.condition} condition - Image ${currentImageIndex + 1} of ${product.images.length}`}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
              loading="eager" // First image should load immediately
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }} 
            />
          </div>
          
          {product.images.length > 1 && (
            <>
              <button 
                onClick={prevImage} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors" 
                aria-label="Previous image"
              >
                <ChevronLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={nextImage} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors" 
                aria-label="Next image"
              >
                <ChevronRightIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 dark:bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </>
          )}
          
          {/* Thumbnail navigation */}
          {product.images.length > 1 && (
            <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600/20 dark:ring-blue-400/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.title} view ${index + 1}`}
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Enhanced with semantic HTML */}
        <div className="space-y-6">
          {/* Header */}
          <header>
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {product.title}
              </h1>
              <div className="flex space-x-1 ml-4">
                <button 
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorited 
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <HeartIcon size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" 
                  aria-label="Share product"
                >
                  <ShareIcon size={20} />
                </button>
                <button 
                  onClick={handleReport}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" 
                  aria-label="Report product"
                >
                  <FlagIcon size={20} />
                </button>
              </div>
            </div>

            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" itemProp="price">
              {formatPrice(product.price)}
            </p>
          </header>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {product.category}
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
              {product.condition}
            </span>
            {product.school && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1">
                <MapPinIcon size={14} />
                {product.school}
              </span>}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Description</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Product Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 py-3 border-y border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <CalendarIcon size={16} />
              <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon size={16} />
              <span>{product.views || 0} views</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Seller Information</h3>
            <div className="flex items-center">
              <img src={product.sellerAvatar || '/default-avatar.png'} alt={product.sellerName} className="w-12 h-12 rounded-full mr-3 ring-2 ring-white dark:ring-gray-700 shadow-sm" onError={e => {
              e.target.src = '/default-avatar.png';
            }} />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{product.sellerName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.school}</p>
                {product.sellerRating && <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⭐ {product.sellerRating.toFixed(1)} ({product.sellerRating || 0} reviews)
                  </p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isOwnProduct ? <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" fullWidth onClick={() => navigate(`/product/${slug}/edit`)}>
                  Edit Listing
                </Button>
                <Button variant="danger" fullWidth onClick={() => {
              if (window.confirm('Are you sure you want to delete this listing?')) {
                // Handle delete
              }
            }}>
                  Delete Listing
                </Button>
              </div> : <div className="grid grid-cols-2 gap-3">
                <Button variant="primary" fullWidth icon={<MessageSquareIcon size={18} />} onClick={handleContactSeller} disabled={isContactingSeller} className="py-4">
                  {isContactingSeller ? 'Starting conversation...' : 'Contact Seller'}
                </Button>
                <Button variant="secondary" fullWidth icon={<ShoppingBagIcon size={18} />} onClick={() => navigate(`/buy/${product.id}`)} className={`py-4 ${isFavorited ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                  Buy Now
                </Button>
              </div>}
          </div>

          {/* Error Message */}
          {chatError && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{chatError}</p>
            </div>}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Similar Products</h2>
        {/* You can add a RelatedProducts component here */}
      </div>
    </div>
  );
};
export default ProductDetails;