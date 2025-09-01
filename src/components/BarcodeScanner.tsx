import React, { useState, useRef, useEffect } from 'react';
import { Camera, Volume2, Info, CheckCircle, AlertCircle, CameraOff } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize barcode reader
    readerRef.current = new BrowserMultiFormatReader();
    
    return () => {
      // Cleanup on unmount
      if (readerRef.current) {
        readerRef.current.reset();
      }
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        
        // Start continuous barcode scanning
        startBarcodeScanning();
        
        // Announce camera activation
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('Camera activated. Point at a barcode to scan automatically.');
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Camera access denied. Please check your browser permissions.');
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const stopCamera = () => {
    // Stop barcode scanning
    if (readerRef.current) {
      readerRef.current.reset();
    }
    scanningRef.current = false;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Camera stopped.');
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startBarcodeScanning = () => {
    if (!readerRef.current || !videoRef.current || scanningRef.current) return;
    
    scanningRef.current = true;
    setIsScanning(true);
    
    const scanBarcode = async () => {
      if (!scanningRef.current || !videoRef.current || !readerRef.current) return;
      
      try {
        const result = await readerRef.current.decodeOnceFromVideoDevice(undefined, videoRef.current);
        
        if (result && result.getText() !== lastScannedCode) {
          const barcodeText = result.getText();
          setLastScannedCode(barcodeText);
          await processBarcode(barcodeText);
          
          // Brief pause before next scan
          setTimeout(() => {
            if (scanningRef.current) {
              scanBarcode();
            }
          }, 2000);
        } else {
          // Continue scanning
          setTimeout(() => {
            if (scanningRef.current) {
              scanBarcode();
            }
          }, 100);
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          // No barcode found, continue scanning
          setTimeout(() => {
            if (scanningRef.current) {
              scanBarcode();
            }
          }, 100);
        } else {
          console.error('Barcode scanning error:', error);
          setTimeout(() => {
            if (scanningRef.current) {
              scanBarcode();
            }
          }, 500);
        }
      }
    };
    
    scanBarcode();
  };

  const processBarcode = async (barcode: string) => {
    // Mock product database - in a real app, this would call an API
    const mockProducts: { [key: string]: any } = {
      '012345678905': {
        name: "Organic Whole Milk",
        brand: "Farm Fresh",
        size: "1 Gallon",
        price: "$4.99",
        description: "Fresh organic whole milk from grass-fed cows. Rich in calcium and vitamins.",
        nutritionHighlights: ["High in Protein", "Calcium Rich", "Vitamin D Fortified"],
        allergens: ["Contains Milk"]
      },
      '123456789012': {
        name: "Whole Wheat Bread",
        brand: "Baker's Choice",
        size: "24 oz",
        price: "$3.49",
        description: "Freshly baked whole wheat bread with natural ingredients.",
        nutritionHighlights: ["High Fiber", "Whole Grains", "No Preservatives"],
        allergens: ["Contains Wheat", "Contains Gluten"]
      },
      '987654321098': {
        name: "Greek Yogurt",
        brand: "Mountain Valley",
        size: "32 oz",
        price: "$5.99",
        description: "Creamy Greek yogurt with live active cultures.",
        nutritionHighlights: ["High Protein", "Probiotics", "Low Fat"],
        allergens: ["Contains Milk"]
      }
    };

    // Check if we have product data for this barcode
    let product = mockProducts[barcode];
    
    if (!product) {
      // Generic product for unknown barcodes
      product = {
        name: "Unknown Product",
        brand: "Generic",
        size: "N/A",
        price: "Price not available",
        description: `Product with barcode ${barcode}. Product details not found in database.`,
        nutritionHighlights: ["Information not available"],
        allergens: ["Check product packaging"]
      };
    }
    
    setScannedProduct(product);
    
    // Announce product details via speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Product scanned: ${product.name} by ${product.brand}. Size: ${product.size}. Price: ${product.price}. ${product.description}`
      );
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const speakProductDetails = () => {
    if (scannedProduct && 'speechSynthesis' in window) {
      const fullDetails = `
        Product: ${scannedProduct.name} by ${scannedProduct.brand}.
        Size: ${scannedProduct.size}.
        Price: ${scannedProduct.price}.
        Description: ${scannedProduct.description}.
        Nutrition highlights: ${scannedProduct.nutritionHighlights.join(', ')}.
        Allergens: ${scannedProduct.allergens.join(', ')}.
      `;
      
      const utterance = new SpeechSynthesisUtterance(fullDetails);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
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
                    {isScanning && (
                      <div className="absolute inset-4 border-2 border-green-400 rounded-lg animate-pulse">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-48 h-2 bg-red-500 animate-pulse"></div>
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
                        <p className="text-gray-400 text-sm mt-2">{cameraError}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-400 text-lg">Click "Start Camera" to begin scanning</p>
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
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center"
                    aria-label="Stop camera"
                  >
                    <CameraOff className="w-6 h-6 mr-3" />
                    Stop Camera
                  </button>
                )}
              </div>
              
              {cameraError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-center">{cameraError}</p>
                  <p className="text-red-600 text-sm text-center mt-2">
                    Make sure to allow camera access when prompted by your browser.
                  </p>
                </div>
              )}
            </div>

            {scannedProduct && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-green-800">Product Identified</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{scannedProduct.name}</h4>
                    <p className="text-gray-700 mb-2">Brand: {scannedProduct.brand}</p>
                    <p className="text-gray-700 mb-2">Size: {scannedProduct.size}</p>
                    <p className="text-xl font-bold text-green-600">{scannedProduct.price}</p>
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
                
                <div className="flex flex-wrap gap-4 mt-6">
                  <button
                    onClick={speakProductDetails}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                    aria-label="Listen to full product details"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Speak Details
                  </button>
                  
                  <button
                    onClick={() => setScannedProduct(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
                    aria-label="Clear current scan result"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-6 mt-8">
              <div className="flex items-center mb-4">
                <Info className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-800">How to Use</h3>
              </div>
              <ul className="text-blue-700 space-y-2">
                <li>• Click "Start Camera" to activate barcode scanning</li>
                <li>• Point your camera at any barcode or QR code</li>
                <li>• The app will automatically detect and scan barcodes</li>
                <li>• Product information will be announced via voice</li>
                <li>• Use "Speak Details" to hear full product information again</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;