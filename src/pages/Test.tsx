import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Square, RotateCcw } from 'lucide-react';

const CameraCanvasApp: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = async () => {
    try {
      setError('');
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please ensure you have granted camera permissions.');
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Auto-capture frames while streaming
  useEffect(() => {
    let animationId: number;
    
    const updateCanvas = () => {
      if (isStreaming && videoRef.current && canvasRef.current) {
        captureFrame();
      }
      animationId = requestAnimationFrame(updateCanvas);
    };
    
    if (isStreaming) {
      updateCanvas();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isStreaming]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isStreaming) {
      startCamera();
    }
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Camera Canvas
          </h1>
          <p className="text-slate-300">Live camera feed displayed on HTML5 Canvas</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isStreaming
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isStreaming ? <CameraOff size={20} /> : <Camera size={20} />}
            {isStreaming ? 'Stop Camera' : 'Start Camera'}
          </button>

          <button
            onClick={captureFrame}
            disabled={!isStreaming}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
          >
            <Square size={20} />
            Capture Frame
          </button>

          <button
            onClick={toggleCamera}
            disabled={!isStreaming}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
          >
            <RotateCcw size={20} />
            {facingMode === 'user' ? 'Back Camera' : 'Front Camera'}
          </button>
        </div>

        {/* Camera Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Video Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Video Stream</h2>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera size={64} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-400">Camera not active</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Display */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Canvas Output</h2>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Square size={64} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-400">Canvas ready</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-3">How it works:</h3>
            <ul className="space-y-2 text-slate-300">
              <li>• Click "Start Camera" to access your device's camera</li>
              <li>• The video stream appears on the left side</li>
              <li>• Canvas automatically displays the live feed on the right</li>
              <li>• Use "Capture Frame" to take a snapshot</li>
              <li>• Toggle between front and back cameras (on mobile devices)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCanvasApp;