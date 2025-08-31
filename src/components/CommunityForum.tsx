import React, { useState } from 'react';
import { MessageCircle, Users, Plus, Heart, MessageSquare, Clock } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  category: string;
}

const CommunityForum: React.FC = () => {
  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: 'Sarah M.',
      title: 'Great grocery shopping app recommendation',
      content: 'I found this amazing app that reads out product names when you scan them. Has anyone tried similar tools?',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 5,
      category: 'Technology'
    },
    {
      id: '2',
      author: 'Michael R.',
      title: 'Navigation tips for busy intersections',
      content: 'I wanted to share some techniques I learned for safely crossing busy intersections using audio cues...',
      timestamp: '5 hours ago',
      likes: 8,
      comments: 3,
      category: 'Daily Living'
    },
    {
      id: '3',
      author: 'Emily Chen',
      title: 'Volunteer appreciation post',
      content: 'Huge thanks to all the volunteers who help us navigate daily challenges. Your support means everything!',
      timestamp: '1 day ago',
      likes: 24,
      comments: 12,
      category: 'Community'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Technology', 'Daily Living', 'Community', 'Support'];

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Community Forum</h2>
            <p className="text-purple-100">Connect, share experiences, and support each other</p>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                      selectedCategory === category
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                    aria-label={`Filter posts by ${category}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center"
                aria-label="Create new post"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </button>
            </div>

            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.author}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {post.timestamp}
                        </div>
                      </div>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <button 
                      className="flex items-center hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 rounded"
                      aria-label={`Like post: ${post.likes} likes`}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes} likes
                    </button>
                    <button 
                      className="flex items-center hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
                      aria-label={`View comments: ${post.comments} comments`}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments} comments
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No posts found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;