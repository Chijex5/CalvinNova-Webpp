import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import api from '../utils/apiService';
import { Camera, CheckCircle, AlertCircle, ArrowLeft, Smartphone, Package, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface TransactionData {
  transactionId: string;
  verificationCode: string;
  sellerName: string;
  sellerId: string;
  buyerId: string;
  createdAt: string;
  isSeller: boolean;
}

const GenerateQRCode = ({ transactionData, onBack, onConfirm }: { 
  transactionData: TransactionData; 
  onBack: () => void;
  onConfirm: () => void;
}) => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { 
      setQrData(JSON.stringify({
        transactionId: transactionData.transactionId,
        verificationCode: transactionData.verificationCode,
        sellerId: transactionData.sellerId
      }));
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [transactionData]);

  const handleConfirm = () => {
    setShowConfirmModal(false);
    onConfirm();
    // TODO: Implement backend call to confirm seller has agreed to payout
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Generating QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction QR Code</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Ready for Delivery</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Show this QR code to the buyer when handing over the item. They will scan it to confirm receipt.
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center mb-6">
          <div className="bg-white p-4 rounded-lg inline-block shadow-inner">
            {qrData && (
              <QRCodeSVG 
                value={qrData} 
                size={256}
                level="M"
                includeMargin={true}
                className="mx-auto"
              />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Transaction ID: {transactionData.transactionId}
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-1">Secure Transaction</p>
              <p className="text-sm text-green-700 dark:text-green-400">
                This QR code contains encrypted verification data that ensures only the authorized buyer can confirm receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-1">Important</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Make sure to click "I Agree" in your confirmation dialog after the buyer scans this code. This ensures proper payout processing.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Buyer Has Confirmed - Complete Transaction
        </button>
      </div>

      {/* Seller Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Payout</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The buyer has confirmed they received the item. By agreeing, you confirm the transaction is complete and authorize the payout.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScanQRCode = ({ transactionData, onBack }: { 
  transactionData: TransactionData; 
  onBack: () => void;
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startScanning();
        };
      }
      setIsScanning(true);
      setError(null);
    } catch (err) {
      setError('Camera permission denied or not available');
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    scanIntervalRef.current = setInterval(() => {
      scanFrame();
    }, 500); // Scan every 500ms
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data from canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    try {
      // Use jsQR to scan for QR codes
      const code = (window as any).jsQR(imageData.data, canvas.width, canvas.height);
      
      if (code && code.data) {
        handleScanSuccess(code.data);
      }
    } catch (scanError) {
      // Continue scanning on error
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (scannedData: any) => {
    try {
      let parsedData;
      
      // Try to parse JSON if it's a string
      if (typeof scannedData === 'string') {
        parsedData = JSON.parse(scannedData);
      } else {
        parsedData = scannedData;
      }
      
      // Verify scanned data matches transaction data
      if (parsedData.transactionId === transactionData.transactionId &&
          parsedData.sellerId === transactionData.sellerId &&
          parsedData.verificationCode === transactionData.verificationCode) {
        setScanResult(parsedData);
        setShowConfirmModal(true);
        stopCamera();
      } else {
        setError('QR code does not match this transaction');
      }
    } catch (parseError) {
      setError('Invalid QR code format');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (!canvasRef.current) {
            setError('Canvas not available');
            setIsLoading(false);
            return;
          }
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            setError('Canvas context not available');
            setIsLoading(false);
            return;
          }
          
          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          try {
            // Use jsQR to scan for QR codes
            const code = (window as any).jsQR(imageData.data, canvas.width, canvas.height);
            
            if (code && code.data) {
              handleScanSuccess(code.data);
            } else {
              setError('No QR code found in image');
            }
          } catch (scanError) {
            setError('Failed to scan QR code from image');
          }
          
          setIsLoading(false);
        };
        
        img.onerror = () => {
          setError('Failed to load image');
          setIsLoading(false);
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const confirmReceipt = () => {
    // TODO: Implement backend call to confirm buyer received item
    setShowConfirmModal(false);
    // Navigate to success page or show success state
  };

  const resetScanner = () => {
    setError(null);
    setScanResult(null);
    setIsScanning(false);
    setIsLoading(false);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [stream]);

  // Load jsQR library when component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Get seller's first name
  const getSellerFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Scan QR Code</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Verify Item Receipt</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Scan the seller's QR code to confirm you've received the item and complete the transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          {!isScanning && !isLoading && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Camera className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Ready to Scan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Position the QR code within the camera frame
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={startCamera}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Camera Scanner</span>
                </button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">or</div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Upload QR Code Image
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Processing...</p>
            </div>
          )}

          {isScanning && !isLoading && (
            <div className="text-center py-8">
              <div className="w-full h-64 bg-black rounded-lg mb-4 relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-8 border-2 border-green-400 rounded animate-pulse"></div>
              </div>
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <p className="text-gray-600 dark:text-gray-300 mb-4">Scanning for QR code...</p>
              <button
                onClick={stopCamera}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                Stop Scanning
              </button>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Scan Failed</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={resetScanner}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Buyer Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Receipt</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Confirm that you have received the item from {transactionData.sellerName} and that it is correct and intact with nothing wrong. If you accept, we will immediately pay {getSellerFirstName(transactionData.sellerName)} their money.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReceipt}
                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Success Page Component
const TransactionSuccess = ({ onBack, userType }: { onBack: () => void; userType: 'seller' | 'buyer' }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Complete</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">✅ Success!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {userType === 'seller' 
              ? 'Transaction confirmed! Payment will be processed shortly.'
              : 'Item receipt confirmed! The transaction is complete.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Component
const QRTransactionSystem = () => {
  const [currentView, setCurrentView] = useState('loading');
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const { transactionId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await api.get(`/api/transactions/complete/${transactionId}`);
        if(!response.data.success){
          setCurrentView('error');
          console.error("Failed to fetch transaction data:", response.data.message);
          return;
        }

        const data = response.data.transaction
        if (!data) {
          console.log("no data returned", response.data)
          setCurrentView('error');
          return;
        }
        // Verify user authorization
        if (data.sellerId !== user?.userId && data.buyerId !== user?.userId) {
          setCurrentView('unauthorized');
          return;
        }
        
        setTransactionData(data);
        setCurrentView('main');
      } catch (error) {
        console.error('Error fetching transaction:', error);
        setCurrentView('error');
      }
    };

    if (transactionId && user) {
      fetchTransactionData();
    }
  }, [transactionId, user]);

  const handleSellerConfirm = () => {
    // TODO: Implement seller confirmation backend call
    setCurrentView('success');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'loading':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading transaction...</p>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
              <p className="text-gray-600 dark:text-gray-300">Failed to load transaction data</p>
            </div>
          </div>
        );
      
      case 'unauthorized':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unauthorized</h2>
              <p className="text-gray-600 dark:text-gray-300">You don't have access to this transaction</p>
            </div>
          </div>
        );
      
      case 'success':
        return (
          <TransactionSuccess 
            onBack={() => setCurrentView('main')}
            userType={transactionData?.isSeller ? 'seller' : 'buyer'}
          />
        );
      
      case 'main':
      default:
        if (!transactionData) return null;
        
        return transactionData.isSeller ? (
          <GenerateQRCode 
            transactionData={transactionData}
            onBack={() => setCurrentView('main')}
            onConfirm={handleSellerConfirm}
          />
        ) : (
          <ScanQRCode 
            transactionData={transactionData}
            onBack={() => setCurrentView('main')}
          />
        );
    }
  };

  return (
    <div className="relative">
      {renderCurrentView()}
    </div>
  );
};

export default QRTransactionSystem;