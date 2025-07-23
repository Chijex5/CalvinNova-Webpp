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
  const [jsQRLoaded, setJsQRLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load jsQR library and wait for it to be available
  useEffect(() => {
    const loadJsQR = async () => {
      try {
        // Check if jsQR is already loaded
        if ((window as any).jsQR) {
          console.log('jsQR already loaded');
          setJsQRLoaded(true);
          return;
        }

        console.log('Loading jsQR library...');

        // Try multiple CDN sources as fallback
        const cdnSources = [
          'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js',
          'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
          'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
        ];

        let loadSuccess = false;
        
        for (const src of cdnSources) {
          try {
            console.log(`Trying to load jsQR from: ${src}`);
            
            // Remove any existing script first
            const existingScript = document.querySelector(`script[src*="jsqr"], script[src*="jsQR"]`);
            if (existingScript) {
              document.head.removeChild(existingScript);
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.crossOrigin = 'anonymous'; // Add CORS attribute
            
            const scriptLoadPromise = new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Script load timeout'));
              }, 10000); // 10 second timeout

              script.onload = () => {
                clearTimeout(timeout);
                console.log(`Script loaded from ${src}`);
                
                // Wait for library initialization with multiple checks
                let checkCount = 0;
                const maxChecks = 20;
                
                const checkLibrary = () => {
                  checkCount++;
                  console.log(`Checking jsQR availability (attempt ${checkCount})`);
                  
                  if ((window as any).jsQR && typeof (window as any).jsQR === 'function') {
                    console.log('jsQR is now available!');
                    resolve();
                  } else if (checkCount < maxChecks) {
                    setTimeout(checkLibrary, 200);
                  } else {
                    reject(new Error('jsQR failed to initialize after loading'));
                  }
                };
                
                // Start checking immediately
                checkLibrary();
              };
              
              script.onerror = (error) => {
                clearTimeout(timeout);
                console.error(`Failed to load from ${src}:`, error);
                reject(new Error(`Failed to load from ${src}`));
              };
            });
            
            document.head.appendChild(script);
            await scriptLoadPromise;
            
            loadSuccess = true;
            setJsQRLoaded(true);
            break; // Success, exit the loop
            
          } catch (error) {
            console.warn(`Failed to load jsQR from ${src}:`, error);
            // Continue to next CDN source
          }
        }
        
        if (!loadSuccess) {
          throw new Error('All CDN sources failed to load jsQR');
        }
        
      } catch (err) {
        console.error('Error loading jsQR:', err);
        setError(`Failed to load QR scanner library. Please check your internet connection and refresh the page. Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    loadJsQR();
    
    return () => {
      // Cleanup: remove script if it exists
      const existingScript = document.querySelector(`script[src*="jsqr"], script[src*="jsQR"]`);
      if (existingScript && document.head.contains(existingScript)) {
        try {
          document.head.removeChild(existingScript);
        } catch (e) {
          console.warn('Could not remove script:', e);
        }
      }
    };
  }, []);

  const startCamera = async () => {
    if (!jsQRLoaded) {
      setError('QR scanner library not loaded yet. Please wait and try again, or refresh the page if the issue persists.');
      return;
    }

    // Check if jsQR is actually available
    if (!(window as any).jsQR || typeof (window as any).jsQR !== 'function') {
      setError('QR scanner library is not properly initialized. Please refresh the page and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer back camera but don't require it
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        const handleVideoReady = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playing successfully');
                setIsScanning(true);
                setIsLoading(false);
                // Start scanning after video is properly playing
                setTimeout(() => {
                  startScanning();
                }, 1000);
              })
              .catch((playError) => {
                console.error('Error playing video:', playError);
                setError('Failed to start camera stream. Please allow camera permissions and try again.');
                setIsLoading(false);
              });
          }
        };
        
        videoRef.current.onloadedmetadata = handleVideoReady;
        videoRef.current.oncanplay = handleVideoReady;
        
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setError('Camera stream error. Please check camera permissions and try again.');
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMessage = 'Camera access failed. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access in your browser settings and try again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device. You can try uploading an image instead.';
      } else if (err.name === 'NotSupportedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage += 'Camera not supported or constraints not satisfied. Try uploading an image instead.';
      } else {
        errorMessage += err.message || 'Unknown error occurred. Please refresh and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    console.log('Starting QR code scanning...');
    
    scanIntervalRef.current = setInterval(() => {
      scanFrame();
    }, 300); // Scan every 300ms for better performance
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning || !jsQRLoaded) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }
    
    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to scan for QR codes
      const jsQR = (window as any).jsQR;
      if (!jsQR || typeof jsQR !== 'function') {
        console.error('jsQR not available or not a function');
        setError('QR scanner library became unavailable. Please refresh the page.');
        stopCamera();
        return;
      }
      
      const code = jsQR(imageData.data, canvas.width, canvas.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code && code.data) {
        console.log('QR Code detected:', code.data);
        handleScanSuccess(code.data);
      }
    } catch (scanError) {
      console.error('Scan error:', scanError);
      // Don't show error to user for individual scan failures, just log them
      // The scanning will continue automatically
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      setStream(null);
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  const handleScanSuccess = (scannedData: string) => {
    // Stop scanning immediately when we find a code
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    try {
      let parsedData;
      
      // Try to parse JSON if it's a string
      if (typeof scannedData === 'string') {
        try {
          parsedData = JSON.parse(scannedData);
        } catch (parseError) {
          console.error('Failed to parse QR code as JSON:', parseError);
          setError('Invalid QR code format. Please scan the correct QR code.');
          // Restart scanning after a delay
          setTimeout(() => {
            if (isScanning) {
              startScanning();
            }
          }, 2000);
          return;
        }
      } else {
        parsedData = scannedData;
      }
      
      console.log('Parsed QR data:', parsedData);
      console.log('Expected transaction data:', {
        transactionId: transactionData.transactionId,
        sellerId: transactionData.sellerId,
        verificationCode: transactionData.verificationCode
      });
      
      // Verify scanned data matches transaction data
      if (parsedData.transactionId === transactionData.transactionId &&
          parsedData.sellerId === transactionData.sellerId &&
          parsedData.verificationCode === transactionData.verificationCode) {
        setScanResult(parsedData);
        setShowConfirmModal(true);
        stopCamera();
      } else {
        console.log('QR code data does not match transaction');
        setError('QR code does not match this transaction. Please scan the correct code.');
        // Restart scanning after showing error
        setTimeout(() => {
          setError(null);
          if (isScanning) {
            startScanning();
          }
        }, 3000);
      }
    } catch (parseError) {
      console.error('Error processing scanned data:', parseError);
      setError('Failed to process QR code. Please try again.');
      setTimeout(() => {
        setError(null);
        if (isScanning) {
          startScanning();
        }
      }, 2000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!jsQRLoaded) {
      setError('QR scanner library not loaded yet. Please wait and try again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
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
        
        try {
          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Use jsQR to scan for QR codes
          const jsQR = (window as any).jsQR;
          if (!jsQR) {
            setError('QR scanner library not available');
            setIsLoading(false);
            return;
          }
          
          const code = jsQR(imageData.data, canvas.width, canvas.height);
          
          if (code && code.data) {
            handleScanSuccess(code.data);
          } else {
            setError('No QR code found in image. Please try a clearer image.');
          }
        } catch (scanError) {
          console.error('File scan error:', scanError);
          setError('Failed to scan QR code from image. Please try again.');
        }
        
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setError('Failed to load image. Please try a different file.');
        setIsLoading(false);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
  };

  const confirmReceipt = async () => {
    try {
      // TODO: Implement backend call to confirm buyer received item
      console.log('Confirming receipt for transaction:', transactionData.transactionId);
      setShowConfirmModal(false);
      // Navigate to success page or show success state
    } catch (error) {
      console.error('Error confirming receipt:', error);
      setError('Failed to confirm receipt. Please try again.');
    }
  };

  const resetScanner = () => {
    setError(null);
    setScanResult(null);
    setIsScanning(false);
    setIsLoading(false);
    setShowConfirmModal(false);
    stopCamera();
  };

  // Cleanup on unmount
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

        {/* Library Loading Status */}
        {!jsQRLoaded && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <p className="text-sm text-blue-800 dark:text-blue-300">Loading QR scanner...</p>
            </div>
          </div>
        )}

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
                  disabled={!jsQRLoaded}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-5 h-5" />
                  <span>{jsQRLoaded ? 'Start Camera Scanner' : 'Loading Scanner...'}</span>
                </button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">or</div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!jsQRLoaded}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  muted
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror the video for better UX
                  }}
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