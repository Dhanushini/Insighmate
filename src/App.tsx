import React, { useState, useEffect } from 'react';
import { Camera, Users, Mic, DollarSign, MessageCircle, Settings, Volume2, Hand, Eye } from 'lucide-react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import BarcodeScanner from './components/BarcodeScanner';
import CommunityForum from './components/CommunityForum';
import VoiceInteraction from './components/VoiceInteraction';
import FaceRecognition from './components/FaceRecognition';
import MoneyRecognition from './components/MoneyRecognition';
import VolunteerGuidance from './components/VolunteerGuidance';
import AppSettings from './components/AppSettings';
import VoicePrompts from './components/VoicePrompts';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { VoiceProvider } from './contexts/VoiceContext';

function App() {
  const [activeModule, setActiveModule] = useState('home');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const modules = [
    { id: 'barcode', name: 'Barcode Scanner', icon: Camera, description: 'Scan products and get audio descriptions' },
    { id: 'community', name: 'Community Forum', icon: MessageCircle, description: 'Connect with other users' },
    { id: 'voice', name: 'Voice Commands', icon: Mic, description: 'Voice interaction and control' },
    { id: 'face', name: 'Face Recognition', icon: Eye, description: 'Identify familiar contacts' },
    { id: 'money', name: 'Money Recognition', icon: DollarSign, description: 'Identify currency and transactions' },
    { id: 'volunteer', name: 'Volunteer Help', icon: Hand, description: 'Get real-time assistance' },
    { id: 'settings', name: 'Settings', icon: Settings, description: 'Customize your experience' }
  ];

  useEffect(() => {
    // Initialize voice synthesis on component mount
    if ('speechSynthesis' in window) {
      console.log('Speech synthesis available');
    }
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'barcode':
        return <BarcodeScanner />;
      case 'community':
        return <CommunityForum />;
      case 'voice':
        return <VoiceInteraction />;
      case 'face':
        return <FaceRecognition />;
      case 'money':
        return <MoneyRecognition />;
      case 'volunteer':
        return <VolunteerGuidance />;
      case 'settings':
        return <AppSettings isVoiceEnabled={isVoiceEnabled} setIsVoiceEnabled={setIsVoiceEnabled} />;
      default:
        return (
          <div className="p-8">
            <div className="container-responsive">
              <div className="text-center mb-12">
                <h1 className="heading-responsive font-bold text-gray-900 mb-4">
                  Welcome to Insightmate
                </h1>
                <p className="text-responsive text-gray-700 leading-relaxed max-w-3xl mx-auto px-4">
                  An integrated assistive solution designed to enhance accessibility, foster independence, 
                  and improve quality of life for individuals with visual impairments.
                </p>
              </div>
              
              <div className="grid-responsive-lg mobile-stack tablet-grid-2 desktop-grid-3">
                {modules.map((module) => {
                  const IconComponent = module.icon;
                  return (
                    <button
                      key={module.id}
                      onClick={() => setActiveModule(module.id)}
                      className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-left group border-2 border-transparent hover:border-blue-200 focus:border-blue-500 focus:outline-none mobile-text-center sm:text-left"
                      aria-label={`Access ${module.name}: ${module.description}`}
                    >
                      <div className="flex items-center mb-4 mobile-full justify-center sm:justify-start">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 ml-0 sm:ml-4 mt-2 sm:mt-0">{module.name}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{module.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DatabaseProvider>
      <VoiceProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <Navigation 
            modules={modules} 
            activeModule={activeModule} 
            setActiveModule={setActiveModule} 
          />
          <main className="flex-1" role="main">
            {renderModule()}
          </main>
          <VoicePrompts isEnabled={isVoiceEnabled} activeModule={activeModule} />
        </div>
      </VoiceProvider>
    </DatabaseProvider>
  );
}

export default App;