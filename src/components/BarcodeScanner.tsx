import React, { useState, useRef, useEffect } from 'react';
import { Camera, Volume2, Info, CheckCircle, AlertCircle, CameraOff, RotateCcw } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useVoice } from '../contexts/VoiceContext';

interface Product {
  name: string;
  brand: string;
  size: string;
  price: string;
  description: string;
  nutritionHighlights: string[];
  allergens: string[];
  category: string;
}

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<Array<{code: string, product: Product, timestamp: string}>>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { speak } = useVoice();

  // Comprehensive product database
  const productDatabase: { [key: string]: Product } = {
    // Common grocery items
    '012345678905': {
      name: "Organic Whole Milk",
      brand: "Farm Fresh",
      size: "1 Gallon",
      price: "$4.99",
      description: "Fresh organic whole milk from grass-fed cows. Rich in calcium and vitamins.",
      nutritionHighlights: ["High in Protein", "Calcium Rich", "Vitamin D Fortified"],
      allergens: ["Contains Milk"],
      category: "Dairy"
    },
    '123456789012': {
      name: "Whole Wheat Bread",
      brand: "Baker's Choice",
      size: "24 oz",
      price: "$3.49",
      description: "Freshly baked whole wheat bread with natural ingredients.",
      nutritionHighlights: ["High Fiber", "Whole Grains", "No Preservatives"],
      allergens: ["Contains Wheat", "Contains Gluten"],
      category: "Bakery"
    },
    '987654321098': {
      name: "Greek Yogurt",
      brand: "Mountain Valley",
      size: "32 oz",
      price: "$5.99",
      description: "Creamy Greek yogurt with live active cultures.",
      nutritionHighlights: ["High Protein", "Probiotics", "Low Fat"],
      allergens: ["Contains Milk"],
      category: "Dairy"
    },
    '456789012345': {
      name: "Bananas",
      brand: "Fresh Produce",
      size: "1 lb",
      price: "$1.29",
      description: "Fresh yellow bananas, perfect for snacking or smoothies.",
      nutritionHighlights: ["High in Potassium", "Natural Energy", "Vitamin B6"],
      allergens: ["None"],
      category: "Produce"
    },
    '789012345678': {
      name: "Chicken Breast",
      brand: "Premium Poultry",
      size: "2 lbs",
      price: "$8.99",
      description: "Fresh boneless, skinless chicken breast. High quality protein source.",
      nutritionHighlights: ["High Protein", "Low Fat", "No Antibiotics"],
      allergens: ["None"],
      category: "Meat"
    },
    '345678901234': {
      name: "Coca-Cola",
      brand: "Coca-Cola",
      size: "12 fl oz",
      price: "$1.99",
      description: "Classic Coca-Cola soft drink in aluminum can.",
      nutritionHighlights: ["Caffeine", "Classic Taste"],
      allergens: ["None"],
      category: "Beverages"
    },
    // Add more common barcodes
    '0123456789012': {
      name: "Apple iPhone Charger",
      brand: "Apple",
      size: "1m",
      price: "$19.99",
      description: "Official Apple Lightning to USB cable for charging and syncing.",
      nutritionHighlights: ["MFi Certified", "Fast Charging", "Durable"],
      allergens: ["None"],
      category: "Electronics"
    }
  };

  useEffect(() => {
    // Initialize barcode reader
    readerRef.current = new BrowserMultiFormatReader();
    
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    stopCamera();
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Request camera with specific constraints for better barcode scanning
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          focusMode: 'continuous',
          zoom: 1.0
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
          startRealTimeScanning();
          speak('Camera activated. Point at any barcode to scan automatically.');
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted and try again.');
      speak('Camera access denied. Please check your browser permissions and try again.');
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    setIsScanning(false);
    
    if (readerRef.current) {
      readerRef.current.reset();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    speak('Camera stopped.');
  };

  const startRealTimeScanning = () => {
    if (!readerRef.current || !videoRef.current || scanningRef.current) return;
    
    scanningRef.current = true;
    setIsScanning(true);
    
    const scanContinuously = async () => {
      if (!scanningRef.current || !videoRef.current || !readerRef.current) return;
      
      try {
        // Use ZXing to decode barcode from video
        const result = await readerRef.current.decodeOnceFromVideoDevice(undefined, videoRef.current);
        
        if (result) {
          const barcodeText = result.getText();
          
          // Only process if it's a new barcode (prevent duplicate scans)
          if (barcodeText !== lastScannedCode) {
            setLastScannedCode(barcodeText);
            await processBarcode(barcodeText);
            
            // Brief pause before next scan to prevent rapid duplicate scans
            setTimeout(() => {
              if (scanningRef.current) {
                scanContinuously();
              }
            }, 2000);
          } else {
            // Continue scanning immediately if same barcode
            setTimeout(() => {
              if (scanningRef.current) {
                scanContinuously();
              }
            }, 100);
          }
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          // No barcode found, continue scanning
          setTimeout(() => {
            if (scanningRef.current) {
              scanContinuously();
            }
          }, 100);
        } else {
          console.error('Barcode scanning error:', error);
          // Continue scanning after error
          setTimeout(() => {
            if (scanningRef.current) {
              scanContinuously();
            }
          }, 500);
        }
      }
    };
    
    // Start scanning after a brief delay to ensure video is ready
    setTimeout(() => {
      if (scanningRef.current) {
        scanContinuously();
      }
    }, 1000);
  };

  const processBarcode = async (barcode: string) => {
    console.log('Barcode detected:', barcode);
    
    // Look up product in our database
    let product = productDatabase[barcode];
    
    if (!product) {
      // Try to fetch from a real API (OpenFoodFacts as example)
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
          product = {
            name: data.product.product_name || "Unknown Product",
            brand: data.product.brands || "Unknown Brand",
            size: data.product.quantity || "N/A",
            price: "Price not available",
            description: data.product.generic_name || `Product with barcode ${barcode}`,
            nutritionHighlights: data.product.nutrient_levels ? 
              Object.keys(data.product.nutrient_levels).map(key => 
                `${key}: ${data.product.nutrient_levels[key]}`
              ) : ["Information not available"],
            allergens: data.product.allergens_tags || ["Check product packaging"],
            category: data.product.categories || "General"
          };
        }
      } catch (apiError) {
        console.log('API lookup failed, using fallback');
      }
    }
    
    if (!product) {
      // Fallback for unknown products
      product = {
        name: "Unknown Product",
        brand: "Generic",
        size: "N/A",
        price: "Price not available",
        description: `Product with barcode ${barcode}. Product details not found in database.`,
        nutritionHighlights: ["Information not available"],
        allergens: ["Check product packaging"],
        category: "Unknown"
      };
    }
    
    setScannedProduct(product);
    
    // Add to scan history
    setScanHistory(prev => [{
      code: barcode,
      product,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]); // Keep last 10 scans
    
    // Announce product details via speech synthesis
    const announcement = `Product scanned: ${product.name} by ${product.brand}. Size: ${product.size}. Price: ${product.price}.`;
    speak(announcement);
    
    // Provide haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const speakProductDetails = () => {
    if (scannedProduct) {
      const fullDetails = `
        Product: ${scannedProduct.name} by ${scannedProduct.brand}.
        Size: ${scannedProduct.size}.
        Price: ${scannedProduct.price}.
        Category: ${scannedProduct.category}.
        Description: ${scannedProduct.description}.
        Nutrition highlights: ${scannedProduct.nutritionHighlights.join(', ')}.
        Allergens: ${scannedProduct.allergens.join(', ')}.
      `;
      
      speak(fullDetails);
    }
  };

  const rescanBarcode = () => {
    setLastScannedCode('');
    setScannedProduct(null);
    speak('Ready to scan new barcode.');
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Barcode Scanner</h2>
            <p className="text-blue-100">Scan product barcodes to get detailed audio descriptions</p>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <div className="bg-gray-900 rounded-xl aspect-video relative overflow-hidden mb-6">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      aria-label="Camera feed for barcode scanning"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ display: 'none' }}
                    />
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-green-400 rounded-lg w-64 h-32 relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-48 h-1 bg-red-500 animate-pulse"></div>
                          </div>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                            Scanning for barcodes...
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg">
                        <p className="text-sm">
                          {isScanning ? 'Scanning for barcodes...' : 'Point camera at barcode'}
                        </p>
                        {lastScannedCode && (
                          <p className="text-xs text-gray-300 mt-1">
                            Last scanned: {lastScannedCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {cameraError ? (
                      <div className="text-center">
                        <CameraOff className="w-16 h-16 text-red-400 mb-4" />
                        <p className="text-red-400 text-lg">Camera Error</p>
                        <p className="text-gray-400 text-sm mt-2 max-w-md">{cameraError}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-400 text-lg">Click "Start Camera" to begin scanning</p>
                        <p className="text-gray-500 text-sm mt-2">Make sure to allow camera access when prompted</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                    aria-label="Start camera for barcode scanning"
                  >
                    <Camera className="w-6 h-6 mr-3" />
                    Start Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopCamera}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center"
                      aria-label="Stop camera"
                    >
                      <CameraOff className="w-6 h-6 mr-3" />
                      Stop Camera
                    </button>
                    <button
                      onClick={rescanBarcode}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center"
                      aria-label="Reset scanner for new barcode"
                    >
                      <RotateCcw className="w-6 h-6 mr-3" />
                      Rescan
                    </button>
                  </>
                )}
              </div>
              
              {cameraError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700 font-medium">Camera Access Required</p>
                  </div>
                  <p className="text-red-600 text-sm mt-2">
                    Please allow camera access when prompted by your browser, then click "Start Camera" again.
                  </p>
                </div>
              )}
            </div>

            {scannedProduct && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-green-800">Product Identified</h3>
                  <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {scannedProduct.category}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{scannedProduct.name}</h4>
                    <p className="text-lg text-gray-700 mb-2">Brand: {scannedProduct.brand}</p>
                    <p className="text-lg text-gray-700 mb-2">Size: {scannedProduct.size}</p>
                    <p className="text-2xl font-bold text-green-600 mb-4">{scannedProduct.price}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={speakProductDetails}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                        aria-label="Listen to full product details"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Speak Details
                      </button>
                      
                      <button
                        onClick={rescanBarcode}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center"
                        aria-label="Scan another barcode"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Scan Another
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                    <p className="text-gray-700 mb-4">{scannedProduct.description}</p>
                    
                    <div className="mb-4">
                      <h6 className="font-medium text-gray-900 mb-2">Nutrition Highlights</h6>
                      <div className="flex flex-wrap gap-2">
                        {scannedProduct.nutritionHighlights.map((highlight: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h6 className="font-medium text-gray-900 mb-2">Allergens</h6>
                      <div className="flex flex-wrap gap-2">
                        {scannedProduct.allergens.map((allergen: string, index: number) => (
                          <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scanHistory.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Scans ({scanHistory.length})
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {scanHistory.map((scan, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{scan.product.name}</h4>
                          <p className="text-sm text-gray-600">{scan.product.brand} • {scan.product.price}</p>
                          <p className="text-xs text-gray-500">Barcode: {scan.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{getTimeAgo(scan.timestamp)}</p>
                          <button
                            onClick={() => {
                              setScannedProduct(scan.product);
                              speak(`Showing details for ${scan.product.name}`);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                            aria-label={`View details for ${scan.product.name}`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Info className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-800">How to Use</h3>
              </div>
              <ul className="text-blue-700 space-y-2">
                <li>• Click "Start Camera" and allow camera access when prompted</li>
                <li>• Point your camera at any barcode (UPC, EAN, QR code)</li>
                <li>• The app will automatically detect and scan barcodes in real-time</li>
                <li>• Product information will be announced immediately via voice</li>
                <li>• Use "Speak Details" to hear complete product information again</li>
                <li>• View your recent scans in the history section below</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-blue-800 text-sm font-medium">
                  💡 Tip: Hold your device steady and ensure good lighting for best scanning results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;