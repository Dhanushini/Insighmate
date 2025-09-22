export interface Volunteer {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  isOnline: boolean;
  responseTime: string;
  avatar?: string;
  location?: string;
  languages?: string[];
  experience?: string;
}

export interface HelpRequest {
  id: string;
  type: 'navigation' | 'shopping' | 'reading' | 'general';
  status: 'pending' | 'connected' | 'completed' | 'cancelled';
  volunteer?: Volunteer;
  timestamp: string;
  userId: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'system' | 'image';
  isRead?: boolean;
}

class VolunteerService {
  private isConnected = false;
  private currentRequest: HelpRequest | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private statusHandlers: ((request: HelpRequest) => void)[] = [];
  
  private volunteers: Volunteer[] = [
    {
      id: 'vol-1',
      name: 'Emma Thompson',
      specialties: ['Navigation', 'Shopping', 'General Support'],
      rating: 4.9,
      isOnline: true,
      responseTime: '< 2 min',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'New York, NY',
      languages: ['English', 'Spanish'],
      experience: '5+ years helping visually impaired individuals'
    },
    {
      id: 'vol-2',
      name: 'David Chen',
      specialties: ['Reading', 'Technology', 'Shopping'],
      rating: 4.8,
      isOnline: true,
      responseTime: '< 3 min',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'San Francisco, CA',
      languages: ['English', 'Mandarin'],
      experience: '3+ years in assistive technology'
    },
    {
      id: 'vol-3',
      name: 'Sarah Johnson',
      specialties: ['General Support', 'Navigation', 'Reading'],
      rating: 4.9,
      isOnline: true,
      responseTime: '< 5 min',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Chicago, IL',
      languages: ['English'],
      experience: '7+ years in accessibility services'
    },
    {
      id: 'vol-4',
      name: 'Michael Rodriguez',
      specialties: ['Shopping', 'Technology', 'General Support'],
      rating: 4.7,
      isOnline: false,
      responseTime: '< 10 min',
      location: 'Austin, TX',
      languages: ['English', 'Spanish'],
      experience: '4+ years volunteer experience'
    },
    {
      id: 'vol-5',
      name: 'Lisa Wang',
      specialties: ['Reading', 'Navigation', 'Technology'],
      rating: 4.8,
      isOnline: true,
      responseTime: '< 4 min',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Seattle, WA',
      languages: ['English', 'Korean'],
      experience: '6+ years in accessibility consulting'
    },
    {
      id: 'vol-6',
      name: 'James Wilson',
      specialties: ['Navigation', 'General Support', 'Shopping'],
      rating: 4.6,
      isOnline: true,
      responseTime: '< 6 min',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Boston, MA',
      languages: ['English'],
      experience: '2+ years helping with daily tasks'
    }
  ];

  // Realistic response templates for different scenarios
  private responseTemplates = {
    navigation: [
      "I can help you with navigation! Can you tell me your current location and where you'd like to go?",
      "For navigation assistance, I'll need to know your starting point and destination. Are you indoors or outdoors?",
      "I'm here to help with directions. Do you need help with public transportation, walking directions, or finding a specific location?",
      "Let me assist you with navigation. Are you looking for the safest route, fastest route, or most accessible path?"
    ],
    shopping: [
      "I'd be happy to help with your shopping! Are you looking for specific products or need help navigating the store?",
      "For shopping assistance, I can help identify products, read labels, or guide you through the store layout. What do you need?",
      "I'm here to help with your shopping experience. Do you need help finding items, comparing prices, or reading product information?",
      "Let me assist you with shopping. Are you in a grocery store, retail store, or shopping online?"
    ],
    reading: [
      "I can help you with reading! Do you need assistance with documents, signs, labels, or digital content?",
      "For reading support, I can describe text, read aloud, or help interpret visual information. What would you like me to read?",
      "I'm here to help with reading tasks. Is this printed text, digital content, or something else you need read?",
      "Let me assist with reading. Do you need help with mail, forms, books, or other written materials?"
    ],
    general: [
      "I'm here to provide general assistance! How can I help you today?",
      "I'd be happy to help with whatever you need. Can you tell me more about your situation?",
      "I'm available to assist you with any questions or tasks. What would you like help with?",
      "Let me know how I can support you today. I'm here to help with any challenges you're facing."
    ]
  };

  async connect() {
    if (this.isConnected) return;
    
    try {
      // Simulate WebSocket connection with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      this.isConnected = true;
      console.log('Connected to volunteer service');
    } catch (error) {
      console.error('Failed to connect to volunteer service:', error);
      throw error;
    }
  }

  async disconnect() {
    this.isConnected = false;
    this.currentRequest = null;
    console.log('Disconnected from volunteer service');
  }

  getAvailableVolunteers(): Volunteer[] {
    return this.volunteers.filter(vol => vol.isOnline);
  }

  getAllVolunteers(): Volunteer[] {
    return this.volunteers;
  }

  getVolunteersBySpecialty(specialty: string): Volunteer[] {
    return this.volunteers.filter(vol => 
      vol.isOnline && vol.specialties.some(s => 
        s.toLowerCase().includes(specialty.toLowerCase())
      )
    );
  }

  async requestHelp(type: HelpRequest['type'], description?: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<HelpRequest> {
    await this.connect();
    
    const request: HelpRequest = {
      id: `req-${Date.now()}`,
      type,
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId: 'user-1',
      description,
      priority
    };

    this.currentRequest = request;

    // Simulate realistic volunteer matching process
    setTimeout(() => {
      this.findAndAssignVolunteer(request);
    }, 2000 + Math.random() * 4000); // 2-6 second realistic delay

    return request;
  }

  private async findAndAssignVolunteer(request: HelpRequest) {
    // Find volunteers with matching specialties
    let availableVolunteers = this.getVolunteersBySpecialty(request.type);
    
    // If no specialists available, get general support volunteers
    if (availableVolunteers.length === 0) {
      availableVolunteers = this.volunteers.filter(vol => 
        vol.isOnline && vol.specialties.includes('General Support')
      );
    }
    
    if (availableVolunteers.length > 0) {
      // Sort by rating and response time
      availableVolunteers.sort((a, b) => {
        const ratingDiff = b.rating - a.rating;
        if (ratingDiff !== 0) return ratingDiff;
        
        const aTime = parseInt(a.responseTime.replace(/[^\d]/g, ''));
        const bTime = parseInt(b.responseTime.replace(/[^\d]/g, ''));
        return aTime - bTime;
      });
      
      const assignedVolunteer = availableVolunteers[0];
      
      // Update request status
      const updatedRequest: HelpRequest = {
        ...request,
        status: 'connected',
        volunteer: assignedVolunteer
      };
      
      this.currentRequest = updatedRequest;
      
      // Notify status handlers
      this.statusHandlers.forEach(handler => handler(updatedRequest));
      
      // Send initial volunteer message
      setTimeout(() => {
        const welcomeMessages = this.responseTemplates[request.type];
        const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        
        const initialMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: assignedVolunteer.id,
          senderName: assignedVolunteer.name,
          content: `Hello! I'm ${assignedVolunteer.name}. ${welcomeMessage}`,
          timestamp: new Date().toISOString(),
          type: 'system',
          isRead: false
        };
        
        this.messageHandlers.forEach(handler => handler(initialMessage));
      }, 1000);
      
    } else {
      // No volunteers available
      const updatedRequest: HelpRequest = {
        ...request,
        status: 'cancelled'
      };
      
      this.currentRequest = updatedRequest;
      this.statusHandlers.forEach(handler => handler(updatedRequest));
    }
  }

  async sendMessage(requestId: string, content: string, type: 'text' | 'voice' = 'text'): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
      type,
      isRead: true
    };

    // Simulate volunteer response with realistic delay and context-aware responses
    setTimeout(() => {
      this.generateVolunteerResponse(content, requestId);
    }, 1500 + Math.random() * 3000); // 1.5-4.5 second delay

    return message;
  }

  private generateVolunteerResponse(userMessage: string, requestId: string) {
    if (!this.currentRequest?.volunteer) return;
    
    const volunteer = this.currentRequest.volunteer;
    const messageType = this.currentRequest.type;
    
    // Context-aware responses based on user message content
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('need')) {
      const helpResponses = [
        "I'm here to help! Can you provide more specific details about what you need assistance with?",
        "Of course! Let me know exactly what you'd like me to help you with.",
        "I'd be happy to assist. Can you describe your situation in more detail?"
      ];
      response = helpResponses[Math.floor(Math.random() * helpResponses.length)];
    } else if (lowerMessage.includes('where') || lowerMessage.includes('location')) {
      response = "I can help you with location information. Can you tell me what landmarks or signs you can see around you?";
    } else if (lowerMessage.includes('read') || lowerMessage.includes('text')) {
      response = "I can help you read that. Can you point your camera at the text or describe what you're trying to read?";
    } else if (lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
      response = "I'll help you find what you're looking for. Can you describe the item or location you need?";
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = "You're very welcome! I'm glad I could help. Is there anything else you need assistance with?";
    } else {
      // General contextual responses based on request type
      const contextResponses = {
        navigation: [
          "I understand. Let me help you navigate safely. Can you describe your surroundings?",
          "For navigation, I'll need to know more about your current location. What do you see or hear around you?",
          "I can guide you step by step. Tell me about any landmarks or sounds you notice."
        ],
        shopping: [
          "I can help you with that shopping task. Are you looking for a specific product or section?",
          "Let me assist you in the store. Can you tell me what aisle you're in or what you're trying to find?",
          "I'll help you navigate the shopping experience. What specific items do you need help with?"
        ],
        reading: [
          "I can help you read that. Can you position the text in front of your camera?",
          "For reading assistance, I'll need you to show me the text. Is it a document, sign, or label?",
          "I'm ready to help with reading. Can you describe what type of text you need help with?"
        ],
        general: [
          "I understand your situation. Let me think about the best way to help you with this.",
          "That's a good question. Let me provide you with some guidance on this matter.",
          "I can definitely help you with that. Here's what I recommend..."
        ]
      };
      
      const responses = contextResponses[messageType] || contextResponses.general;
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    
    const volunteerMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      senderId: volunteer.id,
      senderName: volunteer.name,
      content: response,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false
    };
    
    this.messageHandlers.forEach(handler => handler(volunteerMessage));
  }

  async endSession(requestId: string): Promise<void> {
    if (this.currentRequest && this.currentRequest.id === requestId) {
      const completedRequest: HelpRequest = {
        ...this.currentRequest,
        status: 'completed'
      };
      
      this.currentRequest = completedRequest;
      this.statusHandlers.forEach(handler => handler(completedRequest));
      
      // Send farewell message
      setTimeout(() => {
        if (completedRequest.volunteer) {
          const farewellMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: completedRequest.volunteer.id,
            senderName: completedRequest.volunteer.name,
            content: "Thank you for letting me help you today! Feel free to reach out anytime you need assistance. Have a wonderful day!",
            timestamp: new Date().toISOString(),
            type: 'system',
            isRead: false
          };
          
          this.messageHandlers.forEach(handler => handler(farewellMessage));
        }
      }, 500);
    }
  }

  async rateVolunteer(volunteerId: string, rating: number, feedback?: string): Promise<void> {
    // Update volunteer rating (simplified average)
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    if (volunteer) {
      volunteer.rating = ((volunteer.rating * 10) + rating) / 11; // Simple moving average
      volunteer.rating = Math.round(volunteer.rating * 10) / 10; // Round to 1 decimal
    }
    
    console.log(`Volunteer ${volunteerId} rated ${rating} stars`, feedback);
  }

  // Event handlers for real-time updates
  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
  }

  onStatusChange(handler: (request: HelpRequest) => void) {
    this.statusHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: ChatMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  removeStatusHandler(handler: (request: HelpRequest) => void) {
    this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
  }

  getCurrentRequest(): HelpRequest | null {
    return this.currentRequest;
  }

  // Simulate volunteer availability changes
  simulateVolunteerStatusChanges() {
    setInterval(() => {
      // Randomly change volunteer online status
      const randomVolunteer = this.volunteers[Math.floor(Math.random() * this.volunteers.length)];
      if (Math.random() > 0.8) { // 20% chance every interval
        randomVolunteer.isOnline = !randomVolunteer.isOnline;
        console.log(`${randomVolunteer.name} is now ${randomVolunteer.isOnline ? 'online' : 'offline'}`);
      }
    }, 30000); // Check every 30 seconds
  }
}

export const volunteerService = new VolunteerService();

// Start simulating volunteer status changes
volunteerService.simulateVolunteerStatusChanges();