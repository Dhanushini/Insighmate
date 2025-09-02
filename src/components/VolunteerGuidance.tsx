import React, { useState, useEffect } from 'react';
import { Hand, Users, Phone, Video, MessageSquare, Clock, CheckCircle, Star, Send } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { volunteerService, Volunteer, HelpRequest, ChatMessage } from '../services/volunteerService';

const VolunteerGuidance: React.FC = () => {
  const [currentRequest, setCurrentRequest] = useState<HelpRequest | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { speak } = useVoice();

  useEffect(() => {
    // Load available volunteers
    setVolunteers(volunteerService.getAllVolunteers());
  }, []);

  const helpTypes = [
    { id: 'navigation', name: 'Navigation Help', description: 'Get assistance with directions and location', icon: '🧭' },
    { id: 'shopping', name: 'Shopping Assistance', description: 'Help with product identification and shopping', icon: '🛒' },
    { id: 'reading', name: 'Reading Support', description: 'Assistance with reading text and documents', icon: '📖' },
    { id: 'general', name: 'General Help', description: 'Any other assistance you might need', icon: '💬' }
  ];

  const requestHelp = async (type: string) => {
    setIsConnecting(true);
    speak(`Requesting ${type} assistance. Finding available volunteer.`);
    
    try {
      const request = await volunteerService.requestHelp(type as any);
      setCurrentRequest(request);
      
      // Simulate volunteer connection
      setTimeout(() => {
        const availableVolunteers = volunteerService.getAvailableVolunteers()
          .filter(v => v.specialties.some(s => s.toLowerCase().includes(type) || s.toLowerCase().includes('general')));
        
        if (availableVolunteers.length > 0) {
          const assignedVolunteer = availableVolunteers[0];
          setCurrentRequest(prev => prev ? {
            ...prev,
            status: 'connected',
            volunteer: assignedVolunteer
          } : null);
          
          // Add initial volunteer message
          const welcomeMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: assignedVolunteer.id,
            senderName: assignedVolunteer.name,
            content: `Hello! I'm ${assignedVolunteer.name} and I'm here to help you with ${type}. How can I assist you today?`,
            timestamp: new Date().toISOString(),
            type: 'text'
          };
          setChatMessages([welcomeMessage]);
          
          speak(`Connected to volunteer ${assignedVolunteer.name}. They specialize in ${assignedVolunteer.specialties.join(' and ')}. You can now communicate via voice or text.`);
        }
        setIsConnecting(false);
      }, 2000 + Math.random() * 3000);
      
    } catch (error) {
      console.error('Error requesting help:', error);
      speak('Error connecting to volunteer service. Please try again.');
      setIsConnecting(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRequest) return;
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate volunteer response
    setTimeout(() => {
      const responses = [
        "I understand your situation. Let me help you with that step by step.",
        "That's a great question. Based on your description, I recommend...",
        "I can definitely assist you with this. Let's work through it together.",
        "Thank you for providing those details. Here's what I suggest...",
        "I'm here to help. Let me guide you through this process carefully."
      ];
      
      const volunteerResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: currentRequest.volunteer?.id || 'volunteer',
        senderName: currentRequest.volunteer?.name || 'Volunteer',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, volunteerResponse]);
      speak(`${volunteerResponse.senderName} says: ${volunteerResponse.content}`);
    }, 1000 + Math.random() * 2000);
  };

  const endSession = async () => {
    if (currentRequest) {
      await volunteerService.endSession(currentRequest.id);
      setCurrentRequest({
        ...currentRequest,
        status: 'completed'
      });
      
      setTimeout(() => {
        setCurrentRequest(null);
        setChatMessages([]);
      }, 3000);
      
      speak('Session completed. Thank you for using volunteer guidance. Your feedback helps us improve.');
    }
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
                      disabled={isConnecting}
                      className="bg-gray-50 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-xl p-6 text-left transition-all focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-50"
                      aria-label={`Request ${type.name}: ${type.description}`}
                    >
                      <div className="text-3xl mb-3">{type.icon}</div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{type.name}</h4>
                      <p className="text-gray-600">{type.description}</p>
                    </button>
                  ))}
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Available Volunteers ({volunteers.filter(v => v.isOnline).length} online)
                  </h3>
                  <div className="space-y-4">
                    {volunteers.map((volunteer) => (
                      <div key={volunteer.id} className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {volunteer.avatar ? (
                              <img 
                                src={volunteer.avatar} 
                                alt={volunteer.name}
                                className="w-12 h-12 rounded-full mr-4 object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <Users className="w-6 h-6 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                {volunteer.name}
                                <span className={`ml-2 w-3 h-3 rounded-full ${volunteer.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                              </h4>
                              <p className="text-sm text-gray-600">
                                Specializes in: {volunteer.specialties.join(', ')}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                {volunteer.rating}/5 • Response time: {volunteer.responseTime}
                              </div>
                            </div>
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
                {(currentRequest.status === 'pending' || isConnecting) && (
                  <div className="text-center mb-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Connecting to Volunteer</h3>
                    <p className="text-gray-600">Finding the best available volunteer for your {currentRequest.type} request...</p>
                  </div>
                )}
                
                {currentRequest.status === 'connected' && currentRequest.volunteer && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <h3 className="text-xl font-semibold text-green-800">Connected to Volunteer</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      {currentRequest.volunteer.avatar ? (
                        <img 
                          src={currentRequest.volunteer.avatar} 
                          alt={currentRequest.volunteer.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-green-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{currentRequest.volunteer.name}</h4>
                        <p className="text-gray-700">Specializes in: {currentRequest.volunteer.specialties.join(', ')}</p>
                        <div className="flex items-center text-gray-600">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {currentRequest.volunteer.rating}/5 rating
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <button
                        onClick={() => speak('Voice call feature would be activated here.')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center"
                        aria-label="Start voice call with volunteer"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Voice Call
                      </button>
                      
                      <button
                        onClick={() => speak('Video call feature would be activated here.')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center"
                        aria-label="Start video call with volunteer"
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Video Call
                      </button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                        {chatMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.senderId === 'user-1' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === 'user-1' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm font-medium mb-1">{message.senderName}</p>
                              <p>{message.content}</p>
                              <p className="text-xs opacity-75 mt-1">{getTimeAgo(message.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                          aria-label="Type message to volunteer"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage();
                            }
                          }}
                        />
                        <button
                          onClick={sendMessage}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300 flex items-center"
                          aria-label="Send message"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-center">
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
                    <p className="text-gray-600 mb-6">Thank you for using volunteer guidance!</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Rate Your Experience</h4>
                      <div className="flex justify-center space-x-2 mb-4">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => {
                              volunteerService.rateVolunteer(currentRequest.volunteer?.id || '', rating);
                              speak(`Rated ${rating} stars. Thank you for your feedback.`);
                            }}
                            className="text-2xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded"
                            aria-label={`Rate ${rating} stars`}
                          >
                            <Star className="w-8 h-8 text-yellow-400 hover:text-yellow-500" />
                          </button>
                        ))}
                      </div>
                    </div>
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