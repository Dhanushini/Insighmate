import React, { useState, useEffect } from 'react';
import { Hand, Users, Phone, Video, MessageSquare, Clock, CheckCircle, Star, Send, MapPin, Globe, Award } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { volunteerService, Volunteer, HelpRequest, ChatMessage } from '../services/volunteerService';

const VolunteerGuidance: React.FC = () => {
  const [currentRequest, setCurrentRequest] = useState<HelpRequest | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  
  const { speak } = useVoice();

  useEffect(() => {
    // Load available volunteers
    setVolunteers(volunteerService.getAllVolunteers());
    
    // Set up real-time message handling
    const handleNewMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
      if (message.senderId !== 'user-1') {
        speak(`${message.senderName} says: ${message.content}`);
      }
    };
    
    const handleStatusChange = (request: HelpRequest) => {
      setCurrentRequest(request);
      if (request.status === 'connected' && request.volunteer) {
        speak(`Connected to ${request.volunteer.name}. They specialize in ${request.volunteer.specialties.join(' and ')}.`);
      } else if (request.status === 'completed') {
        speak('Session completed successfully. Thank you for using volunteer guidance.');
      }
    };
    
    volunteerService.onMessage(handleNewMessage);
    volunteerService.onStatusChange(handleStatusChange);
    
    return () => {
      volunteerService.removeMessageHandler(handleNewMessage);
      volunteerService.removeStatusHandler(handleStatusChange);
    };
  }, []);

  const helpTypes = [
    { id: 'navigation', name: 'Navigation Help', description: 'Get assistance with directions and location', icon: '🧭' },
    { id: 'shopping', name: 'Shopping Assistance', description: 'Help with product identification and shopping', icon: '🛒' },
    { id: 'reading', name: 'Reading Support', description: 'Assistance with reading text and documents', icon: '📖' },
    { id: 'general', name: 'General Help', description: 'Any other assistance you might need', icon: '💬' }
  ];

  const requestHelp = async (type: string) => {
    setIsConnecting(true);
    speak(`Requesting ${type} assistance. Searching for the best available volunteer with expertise in ${type}.`);
    
    try {
      const request = await volunteerService.requestHelp(type as any);
      setCurrentRequest(request);
      setIsConnecting(false);
      
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
      type: 'text',
      isRead: true
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Send to volunteer service
    await volunteerService.sendMessage(currentRequest.id, newMessage);
    setNewMessage('');
  };

  const endSession = async () => {
    if (currentRequest) {
      await volunteerService.endSession(currentRequest.id);
      
      setTimeout(() => {
        setCurrentRequest(null);
        setChatMessages([]);
      }, 3000);
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {volunteers.map((volunteer) => (
                      <div 
                        key={volunteer.id} 
                        className={`bg-white rounded-lg p-4 border-2 transition-all cursor-pointer ${
                          volunteer.isOnline 
                            ? 'border-blue-200 hover:border-blue-400 hover:shadow-md' 
                            : 'border-gray-200 opacity-60'
                        } ${selectedVolunteer?.id === volunteer.id ? 'border-blue-500 shadow-lg' : ''}`}
                        onClick={() => setSelectedVolunteer(selectedVolunteer?.id === volunteer.id ? null : volunteer)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            {volunteer.avatar ? (
                              <img 
                                src={volunteer.avatar} 
                                alt={volunteer.name}
                                className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <Users className="w-7 h-7 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                {volunteer.name}
                                <span className={`ml-2 w-3 h-3 rounded-full ${volunteer.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                              </h4>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                {volunteer.rating}/5
                                <Clock className="w-4 h-4 text-gray-400 ml-3 mr-1" />
                                {volunteer.responseTime}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${volunteer.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                              volunteer.isOnline 
                                ? 'text-green-700 bg-green-100' 
                                : 'text-gray-500 bg-gray-100'
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {volunteer.specialties.map((specialty, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {specialty}
                              </span>
                            ))}
                          </div>
                          
                          {selectedVolunteer?.id === volunteer.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                              {volunteer.location && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {volunteer.location}
                                </div>
                              )}
                              {volunteer.languages && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Globe className="w-4 h-4 mr-2" />
                                  {volunteer.languages.join(', ')}
                                </div>
                              )}
                              {volunteer.experience && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Award className="w-4 h-4 mr-2" />
                                  {volunteer.experience}
                                </div>
                              )}
                            </div>
                          )}
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
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Chat with {currentRequest.volunteer.name}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          Online
                        </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                        {chatMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.senderId === 'user-1' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === 'user-1' 
                                ? 'bg-orange-500 text-white' 
                                : message.type === 'system' 
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-gray-100 text-gray-900'
                            }`}>
                              {message.senderId !== 'user-1' && (
                                <p className="text-sm font-medium mb-1">{message.senderName}</p>
                              )}
                              <p>{message.content}</p>
                              <p className="text-xs opacity-75 mt-1">{getTimeAgo(message.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                        {chatMessages.length === 0 && (
                          <div className="text-center text-gray-500 py-8">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Start a conversation with your volunteer</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={`Message ${currentRequest.volunteer.name}...`}
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
                          disabled={!newMessage.trim()}
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
                      <p className="text-sm text-gray-600 mb-4">
                        How was your session with {currentRequest.volunteer?.name}?
                      </p>
                      <div className="flex justify-center space-x-2 mb-4">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => {
                              volunteerService.rateVolunteer(currentRequest.volunteer?.id || '', rating);
                              speak(`You rated ${rating} out of 5 stars. Thank you for your feedback. This helps us improve our service.`);
                            }}
                            className="text-3xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded p-1"
                            aria-label={`Rate ${rating} stars`}
                          >
                            <Star className="w-10 h-10 text-yellow-400 hover:text-yellow-500 hover:fill-current" />
                          </button>
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Tap a star to rate your experience</p>
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