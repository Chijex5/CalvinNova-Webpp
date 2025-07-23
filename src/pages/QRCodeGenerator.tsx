import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, CheckCircle, AlertCircle, ArrowLeft, Smartphone, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Simple SOS-like function to generate verification codes
const sos = (length = 6) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export interface ScanedData {
    transactionId: string;
    sellerId: string;
    verificationCode: string;
    created_at: string;
}

// QR Code Generator Component (Seller Side)
const GenerateQRCode = ({ payload, onBack }: { payload: ScanedData; onBack: () => void }) => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { 
      setQrData(JSON.stringify(payload));
      setIsLoading(false);
      console.log('Generated QR payload:', payload);
    }, 1000);

    return () => clearTimeout(timer);
  }, [payload]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Generating QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Transaction QR Code</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Package className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Ready for Delivery</h2>
              <p className="text-sm text-gray-600">
                Show this QR code to the buyer when handing over the item. They will scan it to confirm receipt.
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
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
          <p className="text-sm text-gray-500 mt-4">
            Transaction ID: {payload.transactionId}
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-800 font-medium mb-1">Secure Transaction</p>
              <p className="text-sm text-green-700">
                This QR code contains encrypted verification data that ensures only the authorized buyer can confirm receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScanQRCode = ({ transactionId = "txn_demo123", onBack }: { transactionId?: string; onBack: () => void }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate camera scanner (since we can't access real camera in this environment)
  const startScanning = () => {
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    
    // Simulate scanning process
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simulate successful scan
      handleScanSuccess();
    }, 2000);
  };

  const handleScanSuccess = () => {
    const mockScanResult = {
      transactionId: transactionId,
      sellerId: 'user_abc123',
      verificationCode: sos(6),
      created_at: new Date().toISOString()
    };
    
    console.log('Scanned QR:', mockScanResult);
    setScanResult(mockScanResult);
    setIsScanning(false);
  };

  const handleScanError = (errorMsg: string) => {
    setError(errorMsg);
    setIsScanning(false);
    setIsLoading(false);
  };

const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
        // In a real implementation, you'd process the image file to extract QR code
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            handleScanSuccess();
        }, 1500);
    }
};

  const resetScanner = () => {
    setError(null);
    setScanResult(null);
    setIsScanning(false);
    setIsLoading(false);
  };

  if (scanResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Delivery Confirmed</h1>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">✅ Verified</h2>
            <p className="text-gray-600 mb-6">
              Transaction successfully verified! The item delivery has been confirmed.
            </p>
            
            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-gray-900">{scanResult.transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Seller ID:</span>
                <span className="font-mono text-gray-900">{scanResult.sellerId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Verification Code:</span>
                <span className="font-mono text-gray-900">{scanResult.verificationCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Verified At:</span>
                <span className="text-gray-900">{new Date(scanResult.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={resetScanner}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Scan Another QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Scan QR Code</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Verify Item Receipt</h2>
              <p className="text-sm text-gray-600">
                Scan the seller's QR code to confirm you've received the item and complete the transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {!isScanning && !isLoading && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Ready to Scan</h3>
              <p className="text-sm text-gray-600 mb-4">
                Position the QR code within the camera frame
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={startScanning}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Camera Scanner</span>
                </button>
                
                <div className="text-sm text-gray-500">or</div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
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
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Processing QR Code...</p>
            </div>
          )}

          {isScanning && !isLoading && (
            <div className="text-center py-8">
              <div className="w-40 h-40 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                <div className="absolute inset-4 border-2 border-green-400 rounded animate-pulse"></div>
                <Camera className="w-16 h-16 text-white" />
              </div>
              <p className="text-gray-600 mb-4">Scanning for QR code...</p>
              <button
                onClick={() => setIsScanning(false)}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Cancel Scan
              </button>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Scan Failed</h3>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button
                onClick={resetScanner}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">Need Help?</p>
              <p className="text-sm text-blue-700">
                Make sure the QR code is clearly visible and well-lit. Hold your device steady while scanning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Demo Component with Navigation
const QRCodeDemo = () => {
  const [currentView, setCurrentView] = useState('menu');
  const [payload, setPayload] = useState({
    transactionId: '',
    sellerId: '',
    verificationCode: '',
    created_at: ''
  });



  const renderCurrentView = () => {
    switch (currentView) {
      case 'generate':
        return (
          <GenerateQRCode 
            payload={payload}
            onBack={() => setCurrentView('menu')}
          />
        );
      case 'scan':
        return (
          <ScanQRCode 
            transactionId={payload.transactionId}
            onBack={() => setCurrentView('menu')}
          />
        );
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Transaction System</h1>
                <p className="text-gray-600 mb-8">Demo for delivery confirmation system</p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setCurrentView('generate')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Package className="w-5 h-5" />
                    <span>Generate QR (Seller)</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentView('scan')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Scan QR (Buyer)</span>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-6">
                  Transaction ID: {payload.transactionId || 'txn_demo123'}<br />
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderCurrentView();
};

export default QRCodeDemo;