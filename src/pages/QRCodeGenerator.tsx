import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Button  from '../components/Button';
import { BrowserQRCodeReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import RatingModal from '../components/RatingModal';
import api from '../utils/apiService';
import { Camera, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Shield, Star, Sparkles, CreditCard, Clock, Trophy, Heart, Zap, User, Package, X, StopCircle, Lightbulb, AlertTriangle, Upload, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tr } from 'date-fns/locale';

export interface TransactionData {
  transactionId: string;
  verificationCode: string;
  sellerName: string;
  sellerId: string;
  buyerId: string;
  createdAt: string;
  isSeller: boolean;
}
const GenerateQRCode = ({
  transactionData,
  onBack,
  onConfirm
}: {
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
  const handleConfirm = async () => {
    try {
      const response = await api.post(`/api/transactions/complete/${transactionData.transactionId}`);
      if (response && response.data.success) {
        setShowConfirmModal(false);
        onConfirm();
      }
    } catch (error) {
      console.error('Error confirming transaction:', error);
    }
  };
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Generating QR Code...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 text-center mb-6">
          <div className="bg-white p-2 rounded-lg inline-block shadow-inner">
            {qrData && <QRCodeSVG value={qrData} size={320} level="M" includeMargin={false} className="mx-auto" />}
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

      </div>

      {/* Seller Confirmation Modal */}
      {showConfirmModal && <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Payout</h3>
              <button onClick={() => setShowConfirmModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The buyer has confirmed they received the item. By agreeing, you confirm the transaction is complete and authorize the payout.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                I Agree
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
const ScanQRCode = ({
  transactionData,
  onBack,
  onComplete
}: {
  transactionData: TransactionData;
  onBack: () => void;
  onComplete: () => void;
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionProcessing, setTransactionProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(Date.now());
  const [isProcessingConfirmation, setIsProcessingConfirmation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<any>(null); // Store the controls returned by decodeFromVideoDevice

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing streams first
      await stopCamera();

      // Initialize ZXing code reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader();
      }
      const codeReader = codeReaderRef.current;
      try {
        // Get available video devices
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          throw new Error('No camera found on this device. You can try uploading an image instead.');
        }

        // Try to find back camera first, fallback to first available
        const selectedDeviceId = videoInputDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear') || device.label.toLowerCase().includes('environment'))?.deviceId || videoInputDevices[0].deviceId;
        setIsScanning(true);
        setIsLoading(false);

        // Start continuous decode from video device and store the controls
        controlsRef.current = await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result, error, controls) => {
          setScanAttempts(prev => prev + 1);
          setLastScanTime(Date.now());
          if (result) {
            handleScanSuccess(result.getText());
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error('Scan error:', error);
          }
        });
      } catch (cameraError: any) {
        console.error('Camera setup error:', cameraError);
        let errorMessage = 'Camera access failed. ';
        if (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError') {
          errorMessage += 'Please allow camera access in your browser settings and try again.';
        } else if (cameraError.name === 'NotFoundError' || cameraError.name === 'DevicesNotFoundError') {
          errorMessage += 'No camera found on this device. You can try uploading an image instead.';
        } else if (cameraError.name === 'NotSupportedError' || cameraError.name === 'ConstraintNotSatisfiedError') {
          errorMessage += 'Camera not supported or constraints not satisfied. Try uploading an image instead.';
        } else {
          errorMessage += cameraError.message || 'Unknown error occurred. Please refresh and try again.';
        }
        setError(errorMessage);
        setIsLoading(false);
        setIsScanning(false);
      }
    } catch (err: any) {
      console.error('General camera error:', err);
      setError('Failed to initialize camera. Please refresh and try again.');
      setIsLoading(false);
      setIsScanning(false);
    }
  };
  const stopCamera = async () => {
    try {
      // Method 1: Stop using ZXing controls (primary method)
      if (controlsRef.current && typeof controlsRef.current.stop === 'function') {
        try {
          await controlsRef.current.stop();
          console.log('ZXing controls stopped successfully');
        } catch (stopError) {
          console.error('Error stopping ZXing controls:', stopError);
        }
        controlsRef.current = null;
      }

      // Method 3: Stop MediaStream tracks directly (additional safety)
      if (stream) {
        stream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
            console.log(`Stopped ${track.kind} track:`, track.label);
          }
        });
        setStream(null);
      }

      // Method 4: Get and stop any active tracks from video element
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream;
        if (videoStream && videoStream.getTracks) {
          videoStream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
              track.stop();
              console.log(`Stopped video element track:`, track.label);
            }
          });
        }
        videoRef.current.srcObject = null;
      }

      // Method 5: Query all active media streams and stop them (nuclear option)
      try {
        if (navigator.mediaDevices) {
          // We can't directly enumerate active streams, but we can ensure our video element is clear
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
            videoRef.current.load();
          }
        }
      } catch (enumerateError) {
        console.error('Error during device enumeration cleanup:', enumerateError);
      }
      setIsScanning(false);
      console.log('Camera stop sequence completed');
    } catch (error) {
      console.error('Error in stopCamera:', error);
      setIsScanning(false);
    }
  };
  const handleScanSuccess = (scannedData: string) => {
    // Prevent multiple scans while processing
    if (isProcessingConfirmation || showConfirmModal) {
      return;
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
            setError(null);
            if (isScanning) {
              startCamera();
            }
          }, 2000);
          return;
        }
      } else {
        parsedData = scannedData;
      }

      // Verify scanned data matches transaction data
      if (parsedData.transactionId === transactionData.transactionId && parsedData.sellerId === transactionData.sellerId && parsedData.verificationCode === transactionData.verificationCode) {
        // Stop scanning before showing modal
        stopCamera();
        setScanResult(parsedData);
        setShowConfirmModal(true);
      } else {
        setError('QR code does not match this transaction. Please scan the correct code.');
        // Restart scanning after showing error
        setTimeout(() => {
          setError(null);
          if (isScanning) {
            startCamera();
          }
        }, 3000);
      }
    } catch (parseError) {
      console.error('Error processing scanned data:', parseError);
      setError('Failed to process QR code. Please try again.');
      setTimeout(() => {
        setError(null);
        if (isScanning) {
          startCamera();
        }
      }, 2000);
    }
  };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      // Initialize ZXing code reader if not already done
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader();
      }
      const codeReader = codeReaderRef.current;

      // Create a temporary URL for the file and decode QR code from it
      const imageUrl = URL.createObjectURL(file);
      try {
        const result = await codeReader.decodeFromImageUrl(imageUrl);
        if (result) {
          handleScanSuccess(result.getText());
        } else {
          setError('No QR code found in image. Please try a clearer image.');
        }
      } finally {
        // Clean up the temporary URL
        URL.revokeObjectURL(imageUrl);
      }
    } catch (scanError: any) {
      console.error('File scan error:', scanError);
      if (scanError instanceof NotFoundException) {
        setError('No QR code found in image. Please try a clearer image.');
      } else {
        setError('Failed to scan QR code from image. Please try again.');
      }
    }
    setIsLoading(false);

    // Reset file input
    event.target.value = '';
  };
  const confirmReceipt = async () => {
    try {
      setTransactionProcessing(true);
      setIsProcessingConfirmation(true);
      setShowConfirmModal(false);
      const response = await api.post(`/api/transactions/complete/${transactionData.transactionId}`);
      if (response && response.data.success) {
        await stopCamera();
        onComplete();
      }
    } catch (error) {
      console.error('Error confirming receipt:', error);
      setError('Failed to confirm receipt. Please try again.');
      setIsProcessingConfirmation(false);
    } finally {
      setTransactionProcessing(false);
      setIsProcessingConfirmation(false);
    }
  };
  const resetScanner = () => {
    setError(null);
    setScanResult(null);
    setIsScanning(false);
    setIsLoading(false);
    setShowConfirmModal(false);
    setScanAttempts(0);
    setLastScanTime(Date.now());
    setIsProcessingConfirmation(false);
    stopCamera();
  };

  // Cleanup on unmount and when component changes
  useEffect(() => {
    return () => {
      console.log('ScanQRCode component unmounting, cleaning up camera...');
      stopCamera();
    };
  }, []);

  // Additional cleanup when leaving the scanning state
  useEffect(() => {
    if (!isScanning && controlsRef.current) {
      stopCamera();
    }
  }, [isScanning]);

  // Get seller's first name
  const getSellerFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };
  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:scale-105">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Scan QR Code</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete your transaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Transaction Info Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{transactionData.sellerName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transaction #{transactionData.transactionId.slice(-6)}</p>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl border border-blue-200/50 dark:border-gray-600/50 p-5 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">How it works</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Ask the seller to show you their QR code, then scan it to confirm you've received the item safely.
              </p>
            </div>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {!isScanning && !isLoading && !error && <div className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Camera className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Ready to Scan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Choose how you'd like to scan the seller's QR code
              </p>
              
              <div className="space-y-4">
                <button onClick={startCamera} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]">
                  <Camera className="w-5 h-5" />
                  <span>Use Camera</span>
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                </div>
                
                <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]">
                  <Upload className="w-5 h-5" />
                  <span>Upload Image</span>
                </button>
                
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>}

          {isLoading && <div className="p-8 text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Initializing Camera</h3>
              <p className="text-gray-600 dark:text-gray-300">Please wait a moment...</p>
            </div>}

          {(isScanning || isLoading) && <div className="relative">
              {/* Camera Feed */}
              <div className="relative bg-black rounded-t-2xl overflow-hidden" style={{
            aspectRatio: '4/3'
          }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                
                {/* Scanning Overlay */}
                {isScanning && <>
                    {/* Dark overlay with cutout */}
                    <div className="absolute inset-0 bg-black/50">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          {/* Main scanning area - larger size */}
                          <div className="w-64 h-64 border-4 border-white rounded-2xl bg-transparent shadow-lg">
                            {/* Corner indicators */}
                            <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl-lg animate-pulse"></div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr-lg animate-pulse"></div>
                            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl-lg animate-pulse"></div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br-lg animate-pulse"></div>
                            
                            {/* Active scanning line animation */}
                            <div className="absolute inset-0 overflow-hidden rounded-xl">
                              <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent absolute animate-bounce" style={{
                          top: `${scanAttempts % 20 * 5}%`,
                          transition: 'top 0.3s ease-in-out'
                        }}></div>
                            </div>
                            
                            {/* Scan activity indicator */}
                            <div className="absolute top-2 right-2">
                              <div className={`w-3 h-3 rounded-full ${Date.now() - lastScanTime < 500 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                            </div>
                          </div>
                          
                          {/* Crosshair center */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                            <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-ping"></div>
                            <div className="absolute inset-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>}
              </div>
              
              {/* Controls */}
              <div className="p-6 text-center">
                {isScanning ? <>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${Date.now() - lastScanTime < 500 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {Date.now() - lastScanTime < 500 ? 'Actively Scanning' : 'Scanning...'}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Keep QR code steady in frame
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {Date.now() - lastScanTime < 500 ? '📡 Signal detected' : '🔍 Searching for QR code'}
                    </div>
                    <button onClick={stopCamera} className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors">
                      <StopCircle className="w-4 h-4" />
                      <span>Stop Scanning</span>
                    </button>
                  </> : <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>}
              </div>
            </div>}

          {error && <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Scan Failed</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-6 leading-relaxed px-4">{error}</p>
              <button onClick={resetScanner} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                Try Again
              </button>
            </div>}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-800/50 p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Tips for better scanning</h4>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Hold your phone steady</li>
                <li>• Keep QR code within the frame</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Confirmation Modal */}
      {showConfirmModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">QR Code Verified!</h3>
                    <p className="text-green-100 text-sm">Ready to complete transaction</p>
                  </div>
                </div>
                <button onClick={() => setShowConfirmModal(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Confirm Item Receipt</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Please confirm you have received the item from <span className="font-medium text-gray-900 dark:text-white">{transactionData.sellerName}</span> and verify it's correct and undamaged.
                </p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-800/50 p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Once confirmed, payment will be released to {getSellerFirstName(transactionData.sellerName)} immediately.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Cancel
                </button>
                <button onClick={confirmReceipt} disabled={transactionProcessing} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {transactionProcessing ? 'Confirming.....' : 'Confirm Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};
const BuyerTransactionProcessing = ({
  sellerName,
  transactionId,
  onComplete
}: {
  sellerName: string;
  transactionId: string;
  onComplete: () => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPulse, setShowPulse] = useState(true);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
  }>>([]);
  const processingSteps = [{
    icon: Package,
    text: "Confirming item receipt",
    subtext: "Verifying handover completion",
    duration: 2000,
    color: "from-blue-500 to-cyan-500"
  }, {
    icon: Shield,
    text: "Securing transaction",
    subtext: "Applying security protocols",
    duration: 1800,
    color: "from-green-500 to-emerald-500"
  }, {
    icon: CreditCard,
    text: "Processing payment release",
    subtext: "Authorizing seller payout",
    duration: 2500,
    color: "from-purple-500 to-pink-500"
  }, {
    icon: Trophy,
    text: "Finalizing transaction",
    subtext: "Completing all records",
    duration: 1200,
    color: "from-yellow-500 to-orange-500"
  }];

  // Initialize floating particles
  useEffect(() => {
    const newParticles = Array.from({
      length: 12
    }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2000
    }));
    setParticles(newParticles);
  }, []);
  useEffect(() => {
    const stepTimeouts: NodeJS.Timeout[] = [];

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 0.8; // Takes about 7.5 seconds to complete
      });
    }, 60);

    // Step progression
    let cumulativeDuration = 0;
    processingSteps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);

        // Add some visual feedback
        if (index < processingSteps.length - 1) {
          setShowPulse(false);
          setTimeout(() => setShowPulse(true), 100);
        }
      }, cumulativeDuration);
      stepTimeouts.push(timeout);
      cumulativeDuration += step.duration;
    });

    // Complete transaction after all steps
    const completionTimeout = setTimeout(() => {
      onComplete();
    }, cumulativeDuration + 500);
    return () => {
      clearInterval(progressInterval);
      stepTimeouts.forEach(timeout => clearTimeout(timeout));
      clearTimeout(completionTimeout);
    };
  }, [onComplete]);
  const currentStepData = processingSteps[currentStep];
  const CurrentIcon = currentStepData?.icon || Package;
  const getSellerFirstName = (fullName: string) => fullName.split(' ')[0];
  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 dark:from-indigo-800/20 dark:to-purple-800/20 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-br from-pink-200/40 to-red-200/40 dark:from-pink-800/20 dark:to-red-800/20 rounded-full animate-pulse delay-1000 blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-green-200/50 to-blue-200/50 dark:from-green-800/30 dark:to-blue-800/30 rounded-full animate-pulse delay-500 blur-md"></div>
        
        {/* Floating particles */}
        {particles.map(particle => <div key={particle.id} className="absolute w-2 h-2 bg-indigo-400/60 dark:bg-indigo-300/40 rounded-full animate-bounce" style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        animationDelay: `${particle.delay}ms`,
        animationDuration: `${3000 + Math.random() * 2000}ms`
      }} />)}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="max-w-md w-full">
          
          {/* Processing Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Heart className="w-5 h-5 text-pink-200 animate-pulse" />
                  <h1 className="text-lg font-bold">Processing Your Purchase</h1>
                  <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse delay-300" />
                </div>
                <p className="text-indigo-100 text-sm">
                  Completing transaction with {getSellerFirstName(sellerName)}
                </p>
                <div className="mt-3 text-xs text-indigo-200 bg-white/10 rounded-full px-3 py-1 inline-block">
                  ID: #{transactionId.slice(-8)}
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="p-8 text-center">
              
              {/* Main Progress Ring */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                {/* Background ring */}
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                  {/* Progress ring with gradient */}
                  <circle cx="80" cy="80" r="70" stroke="url(#progressGradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`} className="transition-all duration-500 ease-out drop-shadow-sm" />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {/* Animated Icon */}
                    <div className={`w-20 h-20 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-xl transform transition-all duration-700 ${showPulse ? 'scale-110' : 'scale-100'}`} style={{
                    background: `linear-gradient(135deg, ${currentStepData ? currentStepData.color.replace('from-', '').replace(' to-', ', ').replace('-500', '') : 'rgb(99, 102, 241), rgb(139, 92, 246)'})`,
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                  }}>
                      <CurrentIcon className={`w-10 h-10 text-white transition-all duration-500 ${currentStep === processingSteps.length - 1 ? 'animate-bounce' : ''}`} />
                    </div>
                    
                    {/* Progress Percentage */}
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {Math.round(progress)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Complete
                    </div>
                  </div>
                </div>

                {/* Floating success indicators around the ring */}
                {progress > 25 && <div className="absolute top-2 right-8 animate-bounce delay-300">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>}
                
                {progress > 50 && <div className="absolute bottom-2 left-8 animate-bounce delay-700">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>}
                
                {progress > 75 && <div className="absolute top-8 left-2 animate-bounce delay-1000">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </div>}
              </div>

              {/* Current Step Display */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentStepData?.text || "Initializing..."}
                  </h2>
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse delay-150"></div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  {currentStepData?.subtext || "Please wait..."}
                </p>

                {/* Step Progress Indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {processingSteps.map((step, index) => <div key={index} className={`h-2 rounded-full transition-all duration-700 ${index <= currentStep ? `bg-gradient-to-r ${step.color} w-10 shadow-md` : 'bg-gray-200 dark:bg-gray-700 w-2'}`} />)}
                </div>
              </div>

              {/* Processing Details */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        Estimated completion
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.max(0, Math.round((100 - progress) * 0.08))} seconds remaining
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 animate-pulse" />
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="font-semibold text-green-800 dark:text-green-200 text-sm">
                    Secure Transaction
                  </p>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                  Your payment is protected by our escrow system. Please don't close this page during processing.
                </p>
              </div>
            </div>
          </div>

          {/* Fun Loading Messages */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {progress < 30 ? "Hang tight, magic happening..." : progress < 60 ? "Almost there, stay awesome!" : progress < 90 ? "Final touches, you're amazing!" : "Success incoming! 🎉"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

// Enhanced Success Page Component
const TransactionSuccess = ({
  onBack,
  userType,
  transactionData
}: {
  onBack: () => void;
  userType: 'seller' | 'buyer';
  transactionData: TransactionData;
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  useEffect(() => {
    // Stage 0: Initial load
    const timer1 = setTimeout(() => setAnimationStage(1), 300);

    // Stage 1: Confetti explosion
    const timer2 = setTimeout(() => {
      setShowConfetti(true);
      setAnimationStage(2);
    }, 800);

    // Stage 2: Content reveal
    const timer3 = setTimeout(() => setAnimationStage(3), 1500);

    // Stage 3: Final state
    const timer4 = setTimeout(() => {
      setShowConfetti(false);
      setAnimationStage(4);
    }, 4000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleRatingSubmit = async (rating: number, comment: string, categories: string[]) => {
    try {
      const response = await api.post('/api/user/rate', {
        transactionId: transactionData.transactionId,
        sellerId: transactionData.sellerId,
        rating,
        comment,
        theRights:categories,
      });
      const data = response.data
      if (data.success) {
        setShowRatingModal(false);
        toast.success('Thank you for your feedback!');
      }
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const confettiPieces = Array.from({
    length: 50
  }, (_, i) => ({
    id: i,
    color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][i % 6],
    left: Math.random() * 100,
    animationDelay: Math.random() * 2,
    size: Math.random() * 6 + 4
  }));

  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      
      {/* Confetti Animation */}
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-30">
          {confettiPieces.map(piece => <div key={piece.id} className="absolute animate-bounce" style={{
        left: `${piece.left}%`,
        backgroundColor: piece.color,
        width: `${piece.size}px`,
        height: `${piece.size}px`,
        borderRadius: piece.id % 3 === 0 ? '50%' : piece.id % 2 === 0 ? '0%' : '20%',
        animationDelay: `${piece.animationDelay}s`,
        animationDuration: '3s',
        top: '-10px'
      }} />)}
        </div>}

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200/30 dark:bg-green-800/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-16 w-12 h-12 bg-emerald-300/40 dark:bg-emerald-700/40 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 left-20 w-16 h-16 bg-green-100/50 dark:bg-green-900/50 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-8 w-8 h-8 bg-emerald-200/60 dark:bg-emerald-800/60 rounded-full animate-pulse delay-1500"></div>
      </div>

      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className={`p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:scale-110 transform ${animationStage >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`transition-all duration-500 delay-300 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Complete</h1>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">✨ Successfully processed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8 relative z-10">
        
        {/* Success Card */}
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-1000 transform ${animationStage >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}>
          
          {/* Success Header with Gradient */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className={`relative z-10 text-center transition-all duration-800 delay-500 ${animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Animated Success Icon */}
              <div className="relative inline-block mb-4">
                <div className={`w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform transition-all duration-700 ${animationStage >= 2 ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}>
                  <CheckCircle className={`w-10 h-10 text-white transition-all duration-500 delay-700 ${animationStage >= 2 ? 'scale-100' : 'scale-0'}`} />
                </div>
                
                {/* Sparkle Effects */}
                {animationStage >= 2 && <>
                    <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-ping" />
                    <Star className="w-3 h-3 text-yellow-200 absolute -bottom-1 -left-1 animate-pulse delay-300" />
                    <Zap className="w-3 h-3 text-yellow-100 absolute top-2 -left-2 animate-bounce delay-500" />
                  </>}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">🎉 Amazing!</h2>
              <p className="text-green-100 text-sm font-medium">
                Your transaction was successful
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-6">
            
            {/* Status Message */}
            <div className={`text-center transition-all duration-600 delay-700 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {userType === 'seller' ? '💰 Payment Processing' : '📦 Item Confirmed'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {userType === 'seller' ? 'Great job! Your payment will be processed and transferred to your account within the next few minutes.' : 'Perfect! You\'ve successfully confirmed receipt of your item. The transaction is now complete.'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className={`grid grid-cols-2 gap-4 transition-all duration-600 delay-900 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  {userType === 'seller' ? <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" /> : <Package className="w-5 h-5 text-green-600 dark:text-green-400" />}
                </div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  {userType === 'seller' ? 'Secure Payment' : 'Item Verified'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {userType === 'seller' ? 'Protected transfer' : 'Quality confirmed'}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Transaction</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Complete</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className={`bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-5 transition-all duration-600 delay-1100 ${animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">What's next?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {userType === 'seller' ? 'You\'ll receive a notification once the payment hits your account. Check your transaction history for updates.' : 'You can rate your experience and the seller. Check your purchase history anytime in your account.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className={`transition-all duration-600 delay-1300 ${animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button onClick={onBack} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2" fullWidth={false} type="button"  >
                <Heart className="w-5 h-5" />
                <span>Continue Shopping</span>
              </Button>

              <Button type="button" variant="outline" className="w-full mt-4 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 rounded-lg py-3 px-5 flex items-center justify-center space-x-2" icon={<Star className="w-5 h-5" />} onClick={()=> setShowRatingModal(true)}>
                <span>Rate your experience</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Success Elements */}
        {animationStage >= 2 && <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 animate-bounce delay-1000">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="absolute top-8 right-8 animate-pulse delay-1500">
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <div className="absolute bottom-16 left-8 animate-bounce delay-2000">
              <Trophy className="w-4 h-4 text-indigo-400" />
            </div>
          </div>}
      </div>
      {showRatingModal && <RatingModal onClose={() => setShowRatingModal(false)} sellerName={transactionData.sellerName}  onSubmit={(rating, feedback, categories) => {handleRatingSubmit(rating, feedback, categories)}} />}
    </div>;
};

// Main Component
const QRTransactionSystem = () => {
  const [currentView, setCurrentView] = useState('loading');
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const {
    transactionId
  } = useParams();
  const {
    user
  } = useAuth();
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await api.get(`/api/transactions/complete/${transactionId}`);
        if (!response.data.success) {
          toast.error(response.data.message || 'Failed to fetch transaction data.');
          setCurrentView('error');
          console.error("Failed to fetch transaction data:", response.data.message);
          return;
        }
        const data = response.data.transaction;
        if (!data) {
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
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Something went wrong while fetching the transaction.';
        toast.error(message);
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
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading transaction...</p>
            </div>
          </div>;
      case 'error':
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
              <p className="text-gray-600 dark:text-gray-300">Failed to load transaction data</p>
            </div>
          </div>;
      case 'unauthorized':
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unauthorized</h2>
              <p className="text-gray-600 dark:text-gray-300">You don't have access to this transaction</p>
            </div>
          </div>;
      case 'success':
        return transactionData ? <TransactionSuccess onBack={() => setCurrentView('main')} userType={transactionData.isSeller ? 'seller' : 'buyer'} transactionData={transactionData} /> : null;
      case 'buyerProcessing':
        return <BuyerTransactionProcessing sellerName={transactionData?.sellerName || 'Seller'} transactionId={transactionData?.transactionId || 'N/A'} onComplete={() => setCurrentView('success')} />;
      case 'main':
      default:
        if (!transactionData) return null;
        return transactionData.isSeller ? <GenerateQRCode transactionData={transactionData} onBack={() => setCurrentView('main')} onConfirm={handleSellerConfirm} /> : <ScanQRCode transactionData={transactionData} onBack={() => setCurrentView('main')} onComplete={() => setCurrentView('success')} />;
    }
  };
  return <div className="relative">
      {renderCurrentView()}
    </div>;
};
export default QRTransactionSystem;