import React, { useEffect } from 'react';

interface VoicePromptsProps {
  isEnabled: boolean;
  activeModule: string;
}

const VoicePrompts: React.FC<VoicePromptsProps> = ({ isEnabled, activeModule }) => {
  useEffect(() => {
    if (!isEnabled || !('speechSynthesis' in window)) return;
    
    const announceModuleChange = () => {
      let announcement = '';
      
      switch (activeModule) {
        case 'home':
          announcement = 'Home screen. Choose a module to get started.';
          break;
        case 'barcode':
          announcement = 'Barcode scanner module. Scan products to get audio descriptions.';
          break;
        case 'community':
          announcement = 'Community forum. Connect with other users and share experiences.';
          break;
        case 'voice':
          announcement = 'Voice interaction module. Use voice commands to control the app.';
          break;
        case 'face':
          announcement = 'Face recognition module. Identify familiar contacts.';
          break;
        case 'money':
          announcement = 'Money recognition module. Identify currency and manage transactions.';
          break;
        case 'volunteer':
          announcement = 'Volunteer guidance. Get real-time assistance from trained volunteers.';
          break;
        case 'settings':
          announcement = 'Settings. Customize your app experience.';
          break;
        default:
          return;
      }
      
      // Small delay to ensure page has loaded
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }, 500);
    };
    
    announceModuleChange();
  }, [activeModule, isEnabled]);

  return null; // This component only handles voice announcements
};

export default VoicePrompts;