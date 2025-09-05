import React, { createContext, useContext, useState, useEffect } from 'react';

interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  category: string;
  userId: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  userId: string;
}

interface Contact {
  id: string;
  name: string;
  relationship: string;
  lastSeen: string;
  faceData?: string;
  userId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

interface DatabaseContextType {
  // Posts
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  
  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'lastSeen'>) => void;
  updateContactLastSeen: (contactId: string) => void;
  
  // Users
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load data from localStorage
    const savedPosts = localStorage.getItem('insightmate_posts');
    const savedContacts = localStorage.getItem('insightmate_contacts');
    const savedUser = localStorage.getItem('insightmate_user');
    
    // Initialize with mock data
    const mockUser: User = {
      id: 'user-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      joinDate: new Date().toISOString()
    };
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      setCurrentUser(mockUser);
      localStorage.setItem('insightmate_user', JSON.stringify(mockUser));
    }

    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const mockPosts: Post[] = [
        {
          id: '1',
          author: 'Sarah M.',
          title: 'Great grocery shopping app recommendation',
          content: 'I found this amazing app that reads out product names when you scan them. Has anyone tried similar tools?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 12,
          comments: [
            {
              id: 'c1',
              author: 'Mike R.',
              content: 'Yes! I use a similar app. It really helps with independent shopping.',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              userId: 'user-2'
            }
          ],
          category: 'Technology',
          userId: 'user-2'
        },
        {
          id: '2',
          author: 'Michael R.',
          title: 'Navigation tips for busy intersections',
          content: 'I wanted to share some techniques I learned for safely crossing busy intersections using audio cues...',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          likes: 8,
          comments: [],
          category: 'Daily Living',
          userId: 'user-3'
        }
      ];
      setPosts(mockPosts);
      localStorage.setItem('insightmate_posts', JSON.stringify(mockPosts));
    }

    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Smith',
          relationship: 'Brother',
          lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1'
        },
        {
          id: '2',
          name: 'Maria Garcia',
          relationship: 'Friend',
          lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1'
        }
      ];
      setContacts(mockContacts);
      localStorage.setItem('insightmate_contacts', JSON.stringify(mockContacts));
    }
  }, []);

  const addPost = (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    setPosts(prev => [newPost, ...prev]);
    localStorage.setItem('insightmate_posts', JSON.stringify([newPost, ...posts]));
  };

  const likePost = (postId: string) => {
    setPosts(prev => {
      const updated = prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      );
      localStorage.setItem('insightmate_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const addComment = (postId: string, commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setPosts(prev => {
      const updated = prev.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      );
      localStorage.setItem('insightmate_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'lastSeen'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      lastSeen: new Date().toISOString()
    };
    setContacts(prev => [...prev, newContact]);
    localStorage.setItem('insightmate_contacts', JSON.stringify([...contacts, newContact]));
  };

  const updateContactLastSeen = (contactId: string) => {
    setContacts(prev => {
      const updated = prev.map(contact =>
        contact.id === contactId 
          ? { ...contact, lastSeen: new Date().toISOString() }
          : contact
      );
      localStorage.setItem('insightmate_contacts', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <DatabaseContext.Provider value={{
      posts,
      addPost,
      likePost,
      addComment,
      contacts,
      addContact,
      updateContactLastSeen,
      currentUser,
      setCurrentUser
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};