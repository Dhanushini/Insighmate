import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface VoiceContextType {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, options?: { rate?: number; voice?: string }) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  transcript: string;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  processVoiceCommand: (command: string, currentModule: string) => string;
  lastSpeechError: string | null;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [lastSpeechError, setLastSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        setLastSpeechError(event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && isVoiceEnabled) {
      setLastSpeechError(null);
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string, options: { rate?: number; voice?: string } = {}) => {
    if ('speechSynthesis' in window && isVoiceEnabled) {
      speechSynthesis.cancel(); // Stop any current speech
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.8;
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      // Try to set preferred voice
      if (options.voice) {
        // Wait for voices to load
        const setVoice = () => {
          const voices = speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.name.toLowerCase().includes(options.voice!.toLowerCase())
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
        };
        
        if (speechSynthesis.getVoices().length > 0) {
          setVoice();
        } else {
          speechSynthesis.onvoiceschanged = setVoice;
        }
      }
      
      speechSynthesis.speak(utterance);
    } else if (!isVoiceEnabled) {
      console.log('Voice disabled:', text);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const processVoiceCommand = (command: string, currentModule: string): string => {
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('go to') || lowerCommand.includes('open') || lowerCommand.includes('show')) {
      if (lowerCommand.includes('home')) {
        return 'navigate:home';
      } else if (lowerCommand.includes('barcode') || lowerCommand.includes('scan')) {
        return 'navigate:barcode';
      } else if (lowerCommand.includes('community') || lowerCommand.includes('forum')) {
        return 'navigate:community';
      } else if (lowerCommand.includes('face') || lowerCommand.includes('recognition')) {
        return 'navigate:face';
      } else if (lowerCommand.includes('money') || lowerCommand.includes('currency')) {
        return 'navigate:money';
      } else if (lowerCommand.includes('volunteer') || lowerCommand.includes('help')) {
        return 'navigate:volunteer';
      } else if (lowerCommand.includes('settings') || lowerCommand.includes('preferences')) {
        return 'navigate:settings';
      }
    }
    
    // Module-specific commands
    switch (currentModule) {
      case 'barcode':
        if (lowerCommand.includes('start') || lowerCommand.includes('scan')) {
          return 'action:start_scan';
        } else if (lowerCommand.includes('stop')) {
          return 'action:stop_scan';
        }
        break;
        
      case 'face':
        if (lowerCommand.includes('recognize') || lowerCommand.includes('identify')) {
          return 'action:start_recognition';
        }
        break;
        
      case 'money':
        if (lowerCommand.includes('scan') || lowerCommand.includes('identify')) {
          return 'action:scan_currency';
        } else if (lowerCommand.includes('total')) {
          return 'action:speak_total';
        } else if (lowerCommand.includes('clear')) {
          return 'action:clear_total';
        }
        break;
        
      case 'volunteer':
        if (lowerCommand.includes('navigation')) {
          return 'action:request_navigation';
        } else if (lowerCommand.includes('shopping')) {
          return 'action:request_shopping';
        } else if (lowerCommand.includes('reading')) {
          return 'action:request_reading';
        } else if (lowerCommand.includes('general')) {
          return 'action:request_general';
        }
        break;
    }
    
    return `info:Command "${command}" recognized. Available commands include: go to [module], start scanning, get help, or say "what can I do" for more options.`;
  };

  return (
    <VoiceContext.Provider value={{
      isListening,
      startListening,
      stopListening,
      speak,
      stopSpeaking,
      isSpeaking,
      transcript,
      isVoiceEnabled,
      setIsVoiceEnabled,
      processVoiceCommand,
      lastSpeechError
    }}>
      {children}
    </VoiceContext.Provider>
  );
};