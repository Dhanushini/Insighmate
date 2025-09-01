import React, { useState, useRef, useEffect } from 'react';
import { Camera, DollarSign, Volume2, Banknote, Coins, CameraOff, Trash2 } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { currencyRecognitionService } from '../services/currencyRecognition';

interface CurrencyResult {
  type: 'bill' | 'coin';
  denomination: string;
  currency: string;
  confidence: number;
  timestamp: string;
}

const MoneyRecognition: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recognizedCurrency, setRecognizedCurrency] = useState<CurrencyResult | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [scannedItems, setScannedItems] = useState<CurrencyResult[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(false);
  
  const { speak } = useVoice();

  useEffect(() => {
    // Initialize currency recognition service
    currencyRecognitionService.initialize();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Back camera for currency scanning
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        startCurrencyDetection();
        
        speak('Camera activated for money recognition. Point at currency to identify bills and coins.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
      speak('Camera access denied. Please check your browser permissions.');
    }
  };

  const stopCamera = () => {
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
    speak('Camera stopped.');
  };

  const startCurrencyDetection = () => {
    if (!videoRef.current || scanningRef.current) return;
    
    scanningRef.current = true;
    setIsScanning(true);
    
    const detectCurrency = async () => {
      if (!scanningRef.current || !videoRef.current) return;
      
      try {
        const currencies = await currencyRecognitionService.recognizeCurrency(videoRef.current);
        
        if (currencies.length > 0) {
          const currency = currencies[0];
          const newCurrency: CurrencyResult = {
            ...currency,
            timestamp: new Date().toISOString()
          };
          
          setRecognizedCurrency(newCurrency);
          
          // Add to total and scanned items
          const value = parseFloat(currency.denomination.replace('$', ''));
          setTotalAmount(prev => prev + value);
          setScannedItems(prev => [...prev, newCurrency]);
          
          speak(
            `${currency.type === 'bill' ? 'Bill' : 'Coin'} recognized: ${currency.denomination} ${currency.currency}. Confidence: ${currency.confidence} percent. Running total: ${(totalAmount + value).toFixed(2)} dollars.`
          );
          
          // Pause briefly after detection
          setTimeout(() => {
            if (scanningRef.current) {
              detectCurrency();
            }
          }, 2000);
          return;
        }
        
        // Continue scanning
        setTimeout(() => {
          if (scanningRef.current) {
            detectCurrency();
          }
        }, 300);
        
      } catch (error) {
        console.error('Currency detection error:', error);
        setTimeout(() => {
          if (scanningRef.current) {
            detectCurrency();
          }
        }, 1000);
      }
    };
    
    detectCurrency();
  };

  const speakTotal = () => {
    speak(
      `Total amount scanned: ${totalAmount.toFixed(2)} dollars. You have scanned ${scannedItems.length} items.`
    );
  };

  const clearTotal = () => {
    setTotalAmount(0);
    setScannedItems([]);
    setRecognizedCurrency(null);
    speak('Total cleared. Ready to scan new currency.');
  };

  const removeItem = (index: number) => {
    const item = scannedItems[index];
    const value = parseFloat(item.denomination.replace('$', ''));
    
    setScannedItems(prev => prev.filter((_, i) => i !== index));
    setTotalAmount(prev => prev - value);
    
    speak(`Removed ${item.denomination} ${item.type}. New total: ${(totalAmount - value).toFixed(2)} dollars.`);
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
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Money Recognition</h2>
            <p className="text-emerald-100">Identify currency notes and coins with audio feedback</p>
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
                      aria-label="Camera feed for currency recognition"
                    />
                    {isScanning && (
                      <div className="absolute inset-4 border-2 border-green-400 rounded-lg animate-pulse">
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          Analyzing currency...
                        </div>
                      </div>
                    )}
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
                        <DollarSign className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-400 text-lg">Point camera at currency to identify</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-300 flex items-center"
                    aria-label="Start camera for currency recognition"
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
            </div>

            {recognizedCurrency && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-green-800 flex items-center">
                    {recognizedCurrency.type === 'bill' ? (
                      <Banknote className="w-6 h-6 mr-3" />
                    ) : (
                      <Coins className="w-6 h-6 mr-3" />
                    )}
                    Currency Identified
                  </h3>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {recognizedCurrency.confidence}% confidence
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {recognizedCurrency.denomination} {recognizedCurrency.currency}
                    </h4>
                    <p className="text-lg text-gray-700 mb-2">
                      Type: {recognizedCurrency.type === 'bill' ? 'Bank Note' : 'Coin'}
                    </p>
                    <p className="text-gray-600">
                      Recognition accuracy: {recognizedCurrency.confidence}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Detected: {getTimeAgo(recognizedCurrency.timestamp)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="w-32 h-20 bg-green-100 rounded-lg flex items-center justify-center border-2 border-green-300">
                      {recognizedCurrency.type === 'bill' ? (
                        <Banknote className="w-12 h-12 text-green-600" />
                      ) : (
                        <Coins className="w-12 h-12 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-6 h-6 mr-3" />
                  Running Total
                </h3>
                <div className="text-3xl font-bold text-emerald-600">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={speakTotal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                  aria-label="Speak total amount"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Speak Total
                </button>
                
                <button
                  onClick={clearTotal}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
                  aria-label="Clear total amount"
                >
                  Clear Total
                </button>
              </div>
            </div>

            {scannedItems.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Scanned Items ({scannedItems.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scannedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        {item.type === 'bill' ? (
                          <Banknote className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <Coins className="w-5 h-5 text-orange-600 mr-3" />
                        )}
                        <div>
                          <span className="font-medium text-gray-900">
                            {item.denomination} {item.currency}
                          </span>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(item.timestamp)} • {item.confidence}% confidence
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                        aria-label={`Remove ${item.denomination} from total`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneyRecognition;