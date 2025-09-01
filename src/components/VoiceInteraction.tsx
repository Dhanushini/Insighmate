import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Navigation2, Zap } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';

interface VoiceInteractionProps {
  onNavigate?: (module: string) => void;
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ onNavigate }) => {
  const [commandHistory, setCommandHistory] = useState<Array<{ command: string; response: string; timestamp: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    isListening, 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking, 
    isSpeaking, 
    transcript,
    processVoiceCommand 
  } = useVoice();

  useEffect(() => {
    // Process completed voice commands
    if (transcript && !isListening && transcript.length > 0) {
      handleVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  const handleVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    const result = processVoiceCommand(command, 'voice');
    const [type, action] = result.split(':');
    
    let response = '';
    
    switch (type) {
      case 'navigate':
        response = `Navigating to ${action} module.`;
        if (onNavigate) {
          onNavigate(action);
        }
        break;
        
      case 'action':
        switch (action) {
          case 'start_scan':
            response = 'Starting barcode scanner.';
            break;
          case 'stop_scan':
            response = 'Stopping scanner.';
            break;
          case 'start_recognition':
            response = 'Starting face recognition.';
            break;
          case 'scan_currency':
            response = 'Starting currency recognition.';
            break;
          case 'speak_total':
            response = 'Speaking total amount.';
            break;
          case 'clear_total':
            response = 'Clearing total amount.';
            break;
          default:
            response = `Action ${action} recognized.`;
        }
        break;
        
      case 'info':
        response = action;
        break;
        
      default:
        response = `Command processed: ${command}`;
    }
    
    // Add to command history
    setCommandHistory(prev => [{
      command,
      response,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]); // Keep last 10 commands
    
    speak(response);
    setIsProcessing(false);
  };

  const voiceCommands = [
    { category: 'Navigation', commands: [
      'Go to home',
      'Open barcode scanner',
      'Show community forum',
      'Open face recognition',
      'Show money recognition',
      'Get volunteer help',
      'Open settings'
    ]},
    { category: 'Scanner Actions', commands: [
      'Start scanning',
      'Stop scanning',
      'Scan currency',
      'Recognize faces'
    ]},
    { category: 'Information', commands: [
      'Speak total amount',
      'Clear total',
      'What can I do',
      'Help me'
    ]}
  ];

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    return `${Math.floor(diffMinutes / 60)} hours ago`;
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Voice Interaction</h2>
            <p className="text-green-100">Control Insightmate with voice commands and get audio feedback</p>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mb-6">
                {isListening ? (
                  <button
                    onClick={stopListening}
                    className="w-24 h-24 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 animate-pulse"
                    aria-label="Stop listening"
                  >
                    <MicOff className="w-10 h-10" />
                  </button>
                ) : (
                  <button
                    onClick={startListening}
                    className="w-24 h-24 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
                    aria-label="Start voice recognition"
                  >
                    <Mic className="w-10 h-10" />
                  </button>
                )}
              </div>
              
              <p className="text-lg text-gray-700 mb-4">
                {isListening ? 'Listening... Speak your command' : 
                 isProcessing ? 'Processing command...' :
                 'Tap the microphone to start voice commands'}
              </p>
              
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300 flex items-center mx-auto"
                  aria-label="Stop speaking"
                >
                  <VolumeX className="w-5 h-5 mr-2" />
                  Stop Speaking
                </button>
              )}
            </div>

            {transcript && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {isListening ? 'Listening...' : 'You said:'}
                </h3>
                <p className="text-blue-700 text-lg">{transcript}</p>
              </div>
            )}

            {commandHistory.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Recent Commands
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {commandHistory.map((entry, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 text-sm">"{entry.command}"</p>
                        <span className="text-xs text-gray-500">{getTimeAgo(entry.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{entry.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Navigation2 className="w-5 h-5 mr-2" />
                Voice Commands Guide:
              </h3>
              
              {voiceCommands.map((category) => (
                <div key={category.category} className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">{category.category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.commands.map((command, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-700 font-medium text-sm">"{command}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-800 mb-2">Pro Tips:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Wait for the beep before speaking</li>
                  <li>• Use natural language - the app understands context</li>
                  <li>• Say "help" or "what can I do" for assistance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInteraction;