import React, { useState, useRef } from 'react';
import { Camera, Volume2, Info, CheckCircle, AlertCircle } from 'lucide-react';

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const simulateBarcodeScan = () => {
    setScanning(true);
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      const mockProduct = {
        name: "Organic Whole Milk",
        brand: "Farm Fresh",
        size: "1 Gallon",
        price: "$4.99",
        description: "Fresh organic whole milk from grass-fed cows. Rich in calcium and vitamins.",
        nutritionHighlights: ["High in Protein", "Calcium Rich", "Vitamin D Fortified"],
        allergens: ["Contains Milk"]
      };
      
      setScannedProduct(mockProduct);
      setScanning(false);
      setIsScanning(false);
      
      // Announce product details via speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Product identified: ${mockProduct.name} by ${mockProduct.brand}. Size: ${mockProduct.size}. Price: ${mockProduct.price}. ${mockProduct.description}`
        );
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }, 3000);
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
              <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-6 relative overflow-hidden">
                {isScanning ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-lg">Scanning product...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-400 text-lg">Camera view will appear here</p>
                  </div>
                )}
                
                {scanning && (
                  <div className="absolute inset-0 border-4 border-red-500 animate-pulse"></div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={simulateBarcodeScan}
                  disabled={isScanning}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                  aria-label="Start barcode scanning"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  {isScanning ? 'Scanning...' : 'Start Scanning'}
                </button>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;