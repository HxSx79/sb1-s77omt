import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

export const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 480 },
          height: { ideal: 360 },
          aspectRatio: 4/3
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError('');
      }
    } catch (err) {
      setError('Camera access denied or not available');
      setIsStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Live Camera Feed</h3>
        <button
          onClick={isStreamActive ? stopCamera : startCamera}
          className={`p-2 rounded-full ${
            isStreamActive 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {isStreamActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm text-center px-4">
            {error}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};