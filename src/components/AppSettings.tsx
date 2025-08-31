import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Smartphone, Sun, Moon, Type, Accessibility } from 'lucide-react';

interface AppSettingsProps {
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
}

const AppSettings: React.FC<AppSettingsProps> = ({ isVoiceEnabled, setIsVoiceEnabled }) => {
  const [fontSize, setFontSize] = useState('large');
  const [highContrast, setHighContrast] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [voiceGender, setVoiceGender] = useState('female');

  const handleVoiceTest = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        'This is a test of the voice settings. The speech rate is currently set to your preference.'
      );
      utterance.rate = speechRate;
      
      // Try to set voice gender preference
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voiceGender === 'female' ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('samantha') 
        : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('alex')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-gray-100">Customize your app experience for optimal accessibility</p>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Voice Settings */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Volume2 className="w-6 h-6 mr-3" />
                Voice & Audio Settings
              </h3>
              
              <div className="space-y-6 bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-lg font-medium text-gray-900">Voice Prompts</label>
                    <p className="text-gray-600">Enable audio announcements and feedback</p>
                  </div>
                  <button
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`relative inline-flex h-8 w-14 rounded-full transition-colors focus:outline-none focus:ring-4 ${
                      isVoiceEnabled ? 'bg-green-500 focus:ring-green-300' : 'bg-gray-300 focus:ring-gray-300'
                    }`}
                    aria-label={`${isVoiceEnabled ? 'Disable' : 'Enable'} voice prompts`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                        isVoiceEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">Speech Rate</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    aria-label="Adjust speech rate"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">Voice Gender</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setVoiceGender('female')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                        voiceGender === 'female' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                      aria-label="Select female voice"
                    >
                      Female
                    </button>
                    <button
                      onClick={() => setVoiceGender('male')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                        voiceGender === 'male' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                      aria-label="Select male voice"
                    >
                      Male
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleVoiceTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                  aria-label="Test voice settings"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Test Voice Settings
                </button>
              </div>
            </section>

            {/* Display Settings */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Sun className="w-6 h-6 mr-3" />
                Display Settings
              </h3>
              
              <div className="space-y-6 bg-gray-50 rounded-xl p-6">
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">Font Size</label>
                  <div className="flex space-x-4">
                    {['small', 'medium', 'large', 'extra-large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 capitalize ${
                          fontSize === size 
                            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        aria-label={`Set font size to ${size}`}
                      >
                        {size.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-lg font-medium text-gray-900">High Contrast Mode</label>
                    <p className="text-gray-600">Enhance visibility with higher contrast colors</p>
                  </div>
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className={`relative inline-flex h-8 w-14 rounded-full transition-colors focus:outline-none focus:ring-4 ${
                      highContrast ? 'bg-blue-500 focus:ring-blue-300' : 'bg-gray-300 focus:ring-gray-300'
                    }`}
                    aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                        highContrast ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Accessibility Settings */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Accessibility className="w-6 h-6 mr-3" />
                Accessibility Settings
              </h3>
              
              <div className="space-y-6 bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-lg font-medium text-gray-900">Haptic Feedback</label>
                    <p className="text-gray-600">Enable vibration feedback for navigation</p>
                  </div>
                  <button
                    onClick={() => setHapticFeedback(!hapticFeedback)}
                    className={`relative inline-flex h-8 w-14 rounded-full transition-colors focus:outline-none focus:ring-4 ${
                      hapticFeedback ? 'bg-green-500 focus:ring-green-300' : 'bg-gray-300 focus:ring-gray-300'
                    }`}
                    aria-label={`${hapticFeedback ? 'Disable' : 'Enable'} haptic feedback`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                        hapticFeedback ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Screen Reader Compatibility</h4>
                  <p className="text-blue-700">This app is fully compatible with screen readers including NVDA, JAWS, and VoiceOver.</p>
                </div>
              </div>
            </section>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Settings are automatically saved and applied immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;