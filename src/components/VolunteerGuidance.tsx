import React, { useState } from 'react';
import { Hand, Users, Phone, Video, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  isOnline: boolean;
  responseTime: string;
}

interface HelpRequest {
  id: string;
  type: 'navigation' | 'shopping' | 'reading' | 'general';
  status: 'pending' | 'connected' | 'completed';
  volunteer?: Volunteer;
  timestamp: string;
}

const VolunteerGuidance: React.FC = () => {
  const [currentRequest, setCurrentRequest] = useState<HelpRequest | null>(null);
  const [helpType, setHelpType] = useState('');
  const [volunteers] = useState<Volunteer[]>([
    {
      id: '1',
      name: 'Emma Thompson',
      specialties: ['Navigation', 'Shopping'],
      rating: 4.9,
      isOnline: true,
      responseTime: '< 2 min'
    },
    {
      id: '2',
      name: 'David Chen',
      specialties: ['Reading', 'Technology'],
      rating: 4.8,
      isOnline: true,
      responseTime: '< 3 min'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      specialties: ['General Support', 'Navigation'],
      rating: 4.9,
      isOnline: false,
      responseTime: '< 5 min'
    }
  ]);

  const helpTypes = [
    { id: 'navigation', name: 'Navigation Help', description: 'Get assistance with directions and location' },
    { id: 'shopping', name: 'Shopping Assistance', description: 'Help with product identification and shopping' },
    { id: 'reading', name: 'Reading Support', description: 'Assistance with reading text and documents' },
    { id: 'general', name: 'General Help', description: 'Any other assistance you might need' }
  ];

  const requestHelp = (type: string) => {
    setHelpType(type);
    const newRequest: HelpRequest = {
      id: Date.now().toString(),
      type: type as any,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    setCurrentRequest(newRequest);
    
    // Simulate volunteer connection
    setTimeout(() => {
      const availableVolunteer = volunteers.find(v => v.isOnline);
      if (availableVolunteer) {
        setCurrentRequest(prev => prev ? {
          ...prev,
          status: 'connected',
          volunteer: availableVolunteer
        } : null);
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Connected to volunteer ${availableVolunteer.name}. They specialize in ${availableVolunteer.specialties.join(' and ')}. You can now communicate via voice or text.`
          );
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }
      }
    }, 3000);
  };

  const endSession = () => {
    if (currentRequest) {
      setCurrentRequest({
        ...currentRequest,
        status: 'completed'
      });
      
      setTimeout(() => {
        setCurrentRequest(null);
        setHelpType('');
      }, 2000);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          'Session completed. Thank you for using volunteer guidance. Your feedback helps us improve.'
        );
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Volunteer Guidance</h2>
            <p className="text-orange-100">Get real-time assistance from trained volunteers</p>
          </div>
          
          <div className="p-8">
            {!currentRequest ? (
              <div>
                <div className="text-center mb-8">
                  <Hand className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-gray-600 text-lg">Choose the type of assistance you need</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {helpTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => requestHelp(type.id)}
                      className="bg-gray-50 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-xl p-6 text-left transition-all focus:outline-none focus:ring-4 focus:ring-orange-300"
                      aria-label={`Request ${type.name}: ${type.description}`}
                    >
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{type.name}</h4>
                      <p className="text-gray-600">{type.description}</p>
                    </button>
                  ))}
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Available Volunteers
                  </h3>
                  <div className="space-y-4">
                    {volunteers.map((volunteer) => (
                      <div key={volunteer.id} className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              {volunteer.name}
                              <span className={`ml-2 w-3 h-3 rounded-full ${volunteer.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                            </h4>
                            <p className="text-sm text-gray-600">
                              Specializes in: {volunteer.specialties.join(', ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              Rating: {volunteer.rating}/5 • Response time: {volunteer.responseTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${volunteer.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                              {volunteer.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {currentRequest.status === 'pending' && (
                  <div className="text-center mb-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Connecting to Volunteer</h3>
                    <p className="text-gray-600">Finding the best available volunteer for your request...</p>
                  </div>
                )}
                
                {currentRequest.status === 'connected' && currentRequest.volunteer && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <h3 className="text-xl font-semibold text-green-800">Connected to Volunteer</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{currentRequest.volunteer.name}</h4>
                        <p className="text-gray-700">Specializes in: {currentRequest.volunteer.specialties.join(', ')}</p>
                        <p className="text-gray-600">Rating: {currentRequest.volunteer.rating}/5</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                        aria-label="Start voice call with volunteer"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Voice Call
                      </button>
                      
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center"
                        aria-label="Start video call with volunteer"
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Video Call
                      </button>
                      
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center"
                        aria-label="Send text message to volunteer"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Text Chat
                      </button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 mb-3">
                        <strong>{currentRequest.volunteer.name}:</strong> "Hello! I'm here to help you with {helpType}. How can I assist you today?"
                      </p>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                          aria-label="Type message to volunteer"
                        />
                        <button
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300"
                          aria-label="Send message"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-center mt-6">
                      <button
                        onClick={endSession}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
                        aria-label="End volunteer session"
                      >
                        End Session
                      </button>
                    </div>
                  </div>
                )}
                
                {currentRequest.status === 'completed' && (
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Session Completed</h3>
                    <p className="text-gray-600">Thank you for using volunteer guidance!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerGuidance;