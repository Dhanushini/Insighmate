import React, { useState } from 'react';
import { Camera, DollarSign, Volume2, Banknote, Coins } from 'lucide-react';

interface CurrencyResult {
  type: 'bill' | 'coin';
  denomination: string;
  currency: string;
  confidence: number;
}

const MoneyRecognition: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedCurrency, setRecognizedCurrency] = useState<CurrencyResult | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [scannedItems, setScannedItems] = useState<CurrencyResult[]>([]);

  const simulateCurrencyRecognition = () => {
    setIsScanning(true);
    setRecognizedCurrency(null);
    
    const mockCurrencies: CurrencyResult[] = [
      { type: 'bill', denomination: '$20', currency: 'USD', confidence: 98 },
      { type: 'bill', denomination: '$10', currency: 'USD', confidence: 95 },
      { type: 'bill', denomination: '$5', currency: 'USD', confidence: 97 },
      { type: 'bill', denomination: '$1', currency: 'USD', confidence: 99 },
      { type: 'coin', denomination: '$0.25', currency: 'USD', confidence: 92 },
      { type: 'coin', denomination: '$0.10', currency: 'USD', confidence: 94 },
      { type: 'coin', denomination: '$0.05', currency: 'USD', confidence: 96 }
    ];
    
    setTimeout(() => {
      const randomCurrency = mockCurrencies[Math.floor(Math.random() * mockCurrencies.length)];
      setRecognizedCurrency(randomCurrency);
      setIsScanning(false);
      
      // Add to total and scanned items
      const value = parseFloat(randomCurrency.denomination.replace('$', ''));
      setTotalAmount(prev => prev + value);
      setScannedItems(prev => [...prev, randomCurrency]);
      
      // Announce currency recognition
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `${randomCurrency.type === 'bill' ? 'Bill' : 'Coin'} recognized: ${randomCurrency.denomination} ${randomCurrency.currency}. Confidence: ${randomCurrency.confidence} percent. Total amount: ${(totalAmount + value).toFixed(2)} dollars.`
        );
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }, 2500);
  };

  const speakTotal = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Total amount scanned: ${totalAmount.toFixed(2)} dollars. You have scanned ${scannedItems.length} items.`
      );
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const clearTotal = () => {
    setTotalAmount(0);
    setScannedItems([]);
    setRecognizedCurrency(null);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Total cleared. Ready to scan new currency.');
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
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
              <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-6 relative">
                {isScanning ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-lg">Analyzing currency...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-400 text-lg">Point camera at currency to identify</p>
                  </div>
                )}
                
                {isScanning && (
                  <div className="absolute inset-4 border-2 border-green-400 rounded-lg animate-pulse"></div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={simulateCurrencyRecognition}
                  disabled={isScanning}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-300 flex items-center"
                  aria-label="Start currency recognition"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  {isScanning ? 'Scanning...' : 'Scan Currency'}
                </button>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scanned Items</h3>
                <div className="space-y-2">
                  {scannedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        {item.type === 'bill' ? (
                          <Banknote className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <Coins className="w-5 h-5 text-orange-600 mr-3" />
                        )}
                        <span className="font-medium text-gray-900">
                          {item.denomination} {item.currency}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.confidence}% confidence
                      </span>
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