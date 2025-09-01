import React, { useState, useRef, useEffect } from 'react';
import { Camera, Users, UserCheck, Plus, Volume2, Eye, CameraOff, UserPlus } from 'lucide-react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useVoice } from '../contexts/VoiceContext';
import { faceRecognitionService } from '../services/faceRecognition';

const FaceRecognition: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recognizedPerson, setRecognizedPerson] = useState<any>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(false);
  
  const { contacts, addContact, updateContactLastSeen } = useDatabase();
  const { speak } = useVoice();

  useEffect(() => {
    // Initialize face recognition service
    faceRecognitionService.initialize();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Front camera for face recognition
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        startFaceDetection();
        
        speak('Camera activated for face recognition. Position faces in the camera view.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
      speak('Camera access denied. Please check your browser permissions.');
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
    speak('Camera stopped.');
  };

  const startFaceDetection = () => {
    if (!videoRef.current || scanningRef.current) return;
    
    scanningRef.current = true;
    setIsScanning(true);
    
    const detectFaces = async () => {
      if (!scanningRef.current || !videoRef.current) return;
      
      try {
        const faces = await faceRecognitionService.detectFaces(videoRef.current);
        
        if (faces.length > 0) {
          const face = faces[0];
          
          if (face.match) {
            // Found a match in our contacts
            const contact = contacts.find(c => c.name === face.match.name);
            if (contact) {
              setRecognizedPerson(contact);
              updateContactLastSeen(contact.id);
              speak(`Face recognized: ${contact.name}, your ${contact.relationship}.`);
              
              // Pause scanning briefly after recognition
              setTimeout(() => {
                if (scanningRef.current) {
                  detectFaces();
                }
              }, 3000);
              return;
            }
          } else {
            // Unknown face detected
            setRecognizedPerson({ unknown: true, confidence: 85 });
            speak('Unknown face detected. Would you like to add this person to your contacts?');
          }
        }
        
        // Continue scanning
        setTimeout(() => {
          if (scanningRef.current) {
            detectFaces();
          }
        }, 500);
        
      } catch (error) {
        console.error('Face detection error:', error);
        setTimeout(() => {
          if (scanningRef.current) {
            detectFaces();
          }
        }, 1000);
      }
    };
    
    detectFaces();
  };

  const addNewContact = async () => {
    if (!newContactName.trim() || !newContactRelationship.trim()) {
      speak('Please enter both name and relationship.');
      return;
    }
    
    try {
      // In a real implementation, you'd capture the face descriptor here
      const faceDescriptor = Array.from({ length: 128 }, () => Math.random());
      
      addContact({
        name: newContactName,
        relationship: newContactRelationship,
        userId: 'user-1'
      });
      
      // Store face descriptor for recognition
      faceRecognitionService.addFaceDescriptor(
        Date.now().toString(),
        newContactName,
        faceDescriptor
      );
      
      speak(`Contact ${newContactName} added successfully.`);
      setIsAddingContact(false);
      setNewContactName('');
      setNewContactRelationship('');
      setRecognizedPerson(null);
      
    } catch (error) {
      console.error('Error adding contact:', error);
      speak('Error adding contact. Please try again.');
    }
  };

  const speakPersonDetails = (person: any) => {
    if (person.unknown) {
      speak('Unknown person detected. You can add them to your contacts if you wish.');
    } else {
      const timeAgo = getTimeAgo(person.lastSeen);
      speak(`${person.name}, your ${person.relationship}. Last seen ${timeAgo}.`);
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
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
              <div className="bg-gray-900 rounded-xl aspect-video relative overflow-hidden mb-6">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      aria-label="Camera feed for face recognition"
                    />
                    {isScanning && (
                      <div className="absolute inset-4 border-2 border-blue-400 rounded-lg animate-pulse">
                        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                          Scanning for faces...
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {cameraError ? (
                      <div className="text-center">
                        <CameraOff className="w-16 h-16 text-red-400 mb-4" />
                        <p className="text-red-400 text-lg">Camera Error</p>
                        <p className="text-gray-400 text-sm mt-2">{cameraError}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Eye className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-400 text-lg">Click "Start Camera" to begin face recognition</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center"
                    aria-label="Start camera for face recognition"
                  >
                    <Camera className="w-6 h-6 mr-3" />
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center"
                    aria-label="Stop camera"
                  >
                    <CameraOff className="w-6 h-6 mr-3" />
                    Stop Camera
                  </button>
                )}
              </div>
            </div>

            {recognizedPerson && !recognizedPerson.unknown && (
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
                    <p className="text-gray-600">Last seen: {getTimeAgo(recognizedPerson.lastSeen)}</p>
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

            {recognizedPerson && recognizedPerson.unknown && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <UserPlus className="w-6 h-6 text-yellow-600 mr-3" />
                  <h3 className="text-xl font-semibold text-yellow-800">Unknown Person Detected</h3>
                </div>
                
                <p className="text-yellow-700 mb-4">
                  A face has been detected but not recognized. Would you like to add this person to your contacts?
                </p>
                
                <button
                  onClick={() => setIsAddingContact(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-yellow-300 flex items-center"
                  aria-label="Add unknown person to contacts"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add to Contacts
                </button>
              </div>
            )}

            {isAddingContact && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Add New Contact</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter person's name"
                      aria-label="Enter contact name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={newContactRelationship}
                      onChange={(e) => setNewContactRelationship(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Friend, Family, Colleague"
                      aria-label="Enter relationship"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={addNewContact}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
                      aria-label="Save new contact"
                    >
                      Save Contact
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingContact(false);
                        setNewContactName('');
                        setNewContactRelationship('');
                        setRecognizedPerson(null);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
                      aria-label="Cancel adding contact"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Saved Contacts ({contacts.length})
                </h3>
                <button
                  onClick={() => setIsAddingContact(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center"
                  aria-label="Add new contact manually"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </button>
              </div>
              
              {contacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          <p className="text-sm text-gray-600">{contact.relationship}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Last seen: {getTimeAgo(contact.lastSeen)}</p>
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
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No contacts saved yet</p>
                  <p className="text-gray-400">Add contacts to enable face recognition</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;