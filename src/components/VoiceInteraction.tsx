import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, MessageCircle } from 'lucide-react';

const VoiceInteraction: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          processVoiceCommand(transcript);
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    if (lowerCommand.includes('scan') || lowerCommand.includes('barcode')) {
      responseText = 'Opening barcode scanner. Point your camera at a barcode to scan products.';
    } else if (lowerCommand.includes('community') || lowerCommand.includes('forum')) {
      responseText = 'Opening community forum. Here you can connect with other users and share experiences.';
    } else if (lowerCommand.includes('money') || lowerCommand.includes('currency')) {
      responseText = 'Opening money recognition. Point your camera at currency to identify bills and coins.';
    } else if (lowerCommand.includes('face') || lowerCommand.includes('person')) {
      responseText = 'Opening face recognition. This will help you identify familiar contacts.';
    } else if (lowerCommand.includes('help') || lowerCommand.includes('volunteer')) {
      responseText = 'Connecting you with volunteer assistance. A volunteer will be notified to help you.';
    } else if (lowerCommand.includes('settings') || lowerCommand.includes('preferences')) {
      responseText = 'Opening settings. Here you can customize your app preferences.';
    } else {
      responseText = `I heard: "${command}". Try saying commands like "open barcode scanner", "show community forum", or "get volunteer help".`;
    }

    setResponse(responseText);
    speakResponse(responseText);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const voiceCommands = [
    'Open barcode scanner',
    'Show community forum',
    'Get volunteer help',
    'Recognize money',
    'Identify faces',
    'Open settings'
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Voice Interaction</h2>
            <p className="text-green-100">Control the app with voice commands and get audio feedback</p>
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
                {isListening ? 'Listening... Speak your command' : 'Tap the microphone to start voice commands'}
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
                  You said:
                </h3>
                <p className="text-blue-700 text-lg">{transcript}</p>
              </div>
            )}

            {response && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Response:
                </h3>
                <p className="text-green-700 text-lg">{response}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Example Voice Commands:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {voiceCommands.map((command, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 font-medium">"{command}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInteraction;