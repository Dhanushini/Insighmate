import React, { useState } from 'react';
import { Camera, Users, UserCheck, Plus, Volume2 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  relationship: string;
  lastSeen: string;
  photo: string;
}

const FaceRecognition: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedPerson, setRecognizedPerson] = useState<Contact | null>(null);
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Smith',
      relationship: 'Brother',
      lastSeen: '2 days ago',
      photo: '/api/placeholder/100/100'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      relationship: 'Friend',
      lastSeen: '1 week ago',
      photo: '/api/placeholder/100/100'
    },
    {
      id: '3',
      name: 'Dr. Johnson',
      relationship: 'Doctor',
      lastSeen: '1 month ago',
      photo: '/api/placeholder/100/100'
    }
  ]);

  const startFaceRecognition = () => {
    setIsScanning(true);
    setRecognizedPerson(null);
    
    // Simulate face recognition process
    setTimeout(() => {
      const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
      setRecognizedPerson(randomContact);
      setIsScanning(false);
      
      // Announce recognized person
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Face recognized: ${randomContact.name}, your ${randomContact.relationship}. Last seen ${randomContact.lastSeen}.`
        );
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }, 3000);
  };

  const speakPersonDetails = (person: Contact) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${person.name}, your ${person.relationship}. Last seen ${person.lastSeen}.`
      );
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Face Recognition</h2>
            <p className="text-indigo-100">Identify familiar faces and get audio notifications</p>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-6 relative">
                {isScanning ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-lg">Scanning for faces...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-400 text-lg">Camera view for face recognition</p>
                  </div>
                )}
                
                {isScanning && (
                  <div className="absolute inset-4 border-2 border-green-400 rounded-lg animate-pulse"></div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={startFaceRecognition}
                  disabled={isScanning}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center"
                  aria-label="Start face recognition"
                >
                  <Users className="w-6 h-6 mr-3" />
                  {isScanning ? 'Scanning...' : 'Start Recognition'}
                </button>
              </div>
            </div>

            {recognizedPerson && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <UserCheck className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-green-800">Person Recognized</h3>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">{recognizedPerson.name}</h4>
                    <p className="text-lg text-gray-700 mb-1">Relationship: {recognizedPerson.relationship}</p>
                    <p className="text-gray-600">Last seen: {recognizedPerson.lastSeen}</p>
                  </div>
                  
                  <button
                    onClick={() => speakPersonDetails(recognizedPerson)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center"
                    aria-label="Speak person details"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Speak Details
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Saved Contacts
                </h3>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center"
                  aria-label="Add new contact"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Last seen: {contact.lastSeen}</p>
                    <button
                      onClick={() => speakPersonDetails(contact)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                      aria-label={`Speak details for ${contact.name}`}
                    >
                      Speak Details
                    </button>
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

export default FaceRecognition;