import { io, Socket } from 'socket.io-client';

export interface Volunteer {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  isOnline: boolean;
  responseTime: string;
  avatar?: string;
}

export interface HelpRequest {
  id: string;
  type: 'navigation' | 'shopping' | 'reading' | 'general';
  status: 'pending' | 'connected' | 'completed' | 'cancelled';
  volunteer?: Volunteer;
  timestamp: string;
  userId: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'system';
}

class VolunteerService {
  private socket: Socket | null = null;
  private isConnected = false;
  private volunteers: Volunteer[] = [
    {
      id: 'vol-1',
      name: 'Emma Thompson',
      specialties: ['Navigation', 'Shopping'],
      rating: 4.9,
      isOnline: true,
      responseTime: '< 2 min',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: 'vol-2',
      name: 'David Chen',
      specialties: ['Reading', 'Technology'],
      rating: 4.8,
      isOnline: true,
      responseTime: '< 3 min',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: 'vol-3',
      name: 'Sarah Johnson',
      specialties: ['General Support', 'Navigation'],
      rating: 4.9,
      isOnline: true,
      responseTime: '< 5 min',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: 'vol-4',
      name: 'Michael Rodriguez',
      specialties: ['Shopping', 'Technology'],
      rating: 4.7,
      isOnline: false,
      responseTime: '< 10 min'
    }
  ];

  async connect() {
    if (this.isConnected) return;
    
    try {
      // Simulate WebSocket connection
      // In production, this would connect to a real volunteer service
      this.isConnected = true;
      console.log('Connected to volunteer service');
    } catch (error) {
      console.error('Failed to connect to volunteer service:', error);
    }
  }

  async disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  getAvailableVolunteers(): Volunteer[] {
    return this.volunteers.filter(vol => vol.isOnline);
  }

  getAllVolunteers(): Volunteer[] {
    return this.volunteers;
  }

  async requestHelp(type: HelpRequest['type'], description?: string): Promise<HelpRequest> {
    await this.connect();
    
    const request: HelpRequest = {
      id: `req-${Date.now()}`,
      type,
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId: 'user-1',
      description
    };

    // Simulate finding an available volunteer
    setTimeout(() => {
      const availableVolunteers = this.getAvailableVolunteers()
        .filter(vol => vol.specialties.some(specialty => 
          specialty.toLowerCase().includes(type) || 
          specialty.toLowerCase().includes('general')
        ));
      
      if (availableVolunteers.length > 0) {
        const assignedVolunteer = availableVolunteers[0];
        this.updateRequestStatus(request.id, 'connected', assignedVolunteer);
      }
    }, 2000 + Math.random() * 3000); // 2-5 second delay

    return request;
  }

  private updateRequestStatus(requestId: string, status: HelpRequest['status'], volunteer?: Volunteer) {
    // In a real implementation, this would update the request via WebSocket
    console.log(`Request ${requestId} status updated to ${status}`, volunteer);
  }

  async sendMessage(requestId: string, content: string, type: 'text' | 'voice' = 'text'): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
      type
    };

    // Simulate volunteer response
    setTimeout(() => {
      this.simulateVolunteerResponse(requestId, content);
    }, 1000 + Math.random() * 2000);

    return message;
  }

  private simulateVolunteerResponse(requestId: string, userMessage: string) {
    const responses = [
      "I understand your situation. Let me help you with that.",
      "That's a great question. Here's what I recommend...",
      "I can definitely assist you with this. Let's work through it step by step.",
      "Thank you for providing those details. Based on what you've told me...",
      "I'm here to help. Let me guide you through this process."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // In a real implementation, this would come through WebSocket
    console.log('Volunteer response:', randomResponse);
  }

  async endSession(requestId: string): Promise<void> {
    // Update request status to completed
    console.log(`Session ${requestId} ended`);
  }

  async rateVolunteer(volunteerId: string, rating: number, feedback?: string): Promise<void> {
    console.log(`Volunteer ${volunteerId} rated ${rating} stars`, feedback);
  }
}

export const volunteerService = new VolunteerService();