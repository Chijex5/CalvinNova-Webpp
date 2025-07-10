import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { MessageSquareIcon, HeartIcon, ShareIcon, FlagIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useMockProducts } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useChatStore } from '../store/chatStore';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, getSellerById } = useMockProducts();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  
  // Using the Zustand chat store
  const { startMessaging, chats, error, setError } = useChatStore();

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/marketplace">
          <Button variant="primary">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const seller = getSellerById(product.sellerId);
  const isOwnProduct = user?.userId === product.sellerId;

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleContactSeller = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    if (isOwnProduct) {
      // Shouldn't happen, but just in case
      return;
    }

    console.log('=== DEBUG INFO ===');
    console.log('user.userId:', user?.userId);
    console.log('seller object:', seller);
    console.log('seller.id:', seller.id);
    console.log('product.sellerId:', product.sellerId);
    console.log('==================');

    setIsContactingSeller(true);
    setError(null); // Clear any previous errors

    try {
      // Check if conversation already exists
      const existingChat = chats.find(chat => {
        const members = Object.keys(chat.state.members || {});
        return members.includes(user.userId) && members.includes(seller.id);
      });

      if (existingChat) {
        console.log('Found existing conversation:', existingChat.id);
        // Navigate to chat with existing conversation
        navigate(`/chat/${existingChat.id}`);
      } else {
        console.log('Creating new chat between:', user.userId, 'and seller:', seller.id);
        
        // Create new conversation using Zustand store
        await startMessaging([seller.id]);
        
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
    <div className="container mx-auto px-4 py-6">
      <Link 
        to="/marketplace" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ChevronLeftIcon size={16} />
        <span className="ml-1">Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative">
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-w-1 aspect-h-1">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.title}
              className="w-full h-80 md:h-96 object-contain"
            />
          </div>
          
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                aria-label="Next image"
              >
                <ChevronRightIcon size={20} />
              </button>
            </>
          )}
          
          {/* Thumbnail navigation */}
          {product.images.length > 1 && (
            <div className="flex mt-4 space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="flex space-x-2">
              <button 
                className="p-2 text-gray-500 hover:text-red-500"
                aria-label="Favorite"
              >
                <HeartIcon size={20} />
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-blue-500"
                aria-label="Share"
              >
                <ShareIcon size={20} />
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-red-500"
                aria-label="Report"
              >
                <FlagIcon size={20} />
              </button>
            </div>
          </div>

          <p className="text-2xl font-bold text-blue-600 mt-2">
            ${product.price.toFixed(2)}
          </p>

          <div className="mt-4 flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">
              {product.category}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">
              {product.condition}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center">
              <img 
                src={seller.avatar} 
                alt={seller.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{seller.name}</p>
                <p className="text-sm text-gray-500">{product.school}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {isOwnProduct ? (
              <div className="flex space-x-3">
                <Button variant="secondary" fullWidth>
                  Edit Listing
                </Button>
                <Button variant="danger" fullWidth>
                  Delete Listing
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                fullWidth 
                icon={<MessageSquareIcon size={18} />}
                onClick={handleContactSeller}
                disabled={isContactingSeller}
              >
                {isContactingSeller ? 'Starting conversation...' : 'Contact Seller'}
              </Button>
            )}
          </div>

          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;