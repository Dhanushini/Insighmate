import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, Zap, History } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';

interface Product {
  name: string;
  brand?: string;
  barcode: string;
  scannedAt: Date;
}

export default function BarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { speak } = useVoice();

  const startScanning = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        speak('Camera started. Point at a barcode to scan.');
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      speak('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    speak('Scanning stopped.');
  };

  const simulateBarcodeScan = () => {
    // Simulate scanning a common product
    const mockProducts = [
      { name: 'Coca-Cola Classic', brand: 'Coca-Cola', barcode: '049000028911' },
      { name: 'Lay\'s Classic Potato Chips', brand: 'Lay\'s', barcode: '028400064316' },
      { name: 'Oreo Cookies', brand: 'Nabisco', barcode: '044000032227' },
      { name: 'Tide Laundry Detergent', brand: 'Tide', barcode: '037000127895' }
    ];
    
    const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const product: Product = {
      ...randomProduct,
      scannedAt: new Date()
    };
    
    setCurrentProduct(product);
    setScannedProducts(prev => [product, ...prev.slice(0, 9)]);
    speak(`Product scanned: ${product.name} by ${product.brand}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Square className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Barcode Scanner</h1>
              <p className="text-blue-100">Scan products to get information</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Camera Section */}
          <div className="mb-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-400 w-64 h-32 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Placeholder when not scanning */}
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Square className="w-5 h-5" />
                Stop Scanning
              </button>
            )}
            
            <button
              onClick={simulateBarcodeScan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Zap className="w-5 h-5" />
              Test Scan
            </button>
          </div>

          {/* Current Product */}
          {currentProduct && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Last Scanned Product</h3>
              <div className="text-green-700">
                <p className="font-medium">{currentProduct.name}</p>
                {currentProduct.brand && <p className="text-sm">Brand: {currentProduct.brand}</p>}
                <p className="text-sm">Barcode: {currentProduct.barcode}</p>
                <p className="text-sm">Scanned: {currentProduct.scannedAt.toLocaleTimeString()}</p>
              </div>
            </div>
          )}

          {/* Scan History */}
          {scannedProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Scan History</h3>
              </div>
              <div className="space-y-3">
                {scannedProducts.map((product, index) => (
                  <div key={`${product.barcode}-${index}`} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        {product.brand && <p className="text-sm text-gray-600">Brand: {product.brand}</p>}
                        <p className="text-sm text-gray-500">Barcode: {product.barcode}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {product.scannedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}