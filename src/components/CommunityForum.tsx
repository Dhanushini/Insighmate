import React, { useState } from 'react';
import { MessageCircle, Users, Plus, Heart, MessageSquare, Clock, Send } from 'lucide-react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useVoice } from '../contexts/VoiceContext';

const CommunityForum: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('General');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  
  const { posts, addPost, likePost, addComment, currentUser } = useDatabase();
  const { speak } = useVoice();
  
  const categories = ['All', 'Technology', 'Daily Living', 'Community', 'Support', 'General'];

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !currentUser) {
      speak('Please fill in all fields to create a post.');
      return;
    }
    
    addPost({
      author: currentUser.name,
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      userId: currentUser.id
    });
    
    speak(`Post "${newPostTitle}" created successfully in ${newPostCategory} category.`);
    
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('General');
    setShowNewPost(false);
  };

  const handleLikePost = (postId: string, postTitle: string) => {
    likePost(postId);
    speak(`Liked post: ${postTitle}`);
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim() || !currentUser) {
      speak('Please enter a comment.');
      return;
    }
    
    addComment(postId, {
      author: currentUser.name,
      content: newComment,
      userId: currentUser.id
    });
    
    speak('Comment added successfully.');
    setNewComment('');
  };

  const speakPost = (post: any) => {
    const timeAgo = getTimeAgo(post.timestamp);
    speak(
      `Post by ${post.author}, ${timeAgo}. Title: ${post.title}. Content: ${post.content}. ${post.likes} likes, ${post.comments.length} comments.`
    );
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'less than an hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-8">
      <div className="container-responsive">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <h2 className="heading-responsive font-bold mb-2">Community Forum</h2>
            <p className="text-responsive text-purple-100">Connect, share experiences, and support each other</p>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      speak(`Viewing ${category} posts`);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${
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
                onClick={() => {
                  setShowNewPost(!showNewPost);
                  speak(showNewPost ? 'Closing new post form' : 'Opening new post form');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center mobile-full sm:w-auto justify-center"
                aria-label="Create new post"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </button>
            </div>

            {showNewPost && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">Create New Post</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter post title"
                      aria-label="Post title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      aria-label="Post category"
                    >
                      {categories.filter(cat => cat !== 'All').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Share your thoughts, experiences, or questions..."
                      aria-label="Post content"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handleCreatePost}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 flex-1 sm:flex-none"
                      aria-label="Publish post"
                    >
                      Publish Post
                    </button>
                    <button
                      onClick={() => setShowNewPost(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 flex-1 sm:flex-none"
                      aria-label="Cancel post creation"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                          {getTimeAgo(post.timestamp)}
                        </div>
                      </div>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <button 
                      onClick={() => handleLikePost(post.id, post.title)}
                      className="flex items-center hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 rounded p-1"
                      aria-label={`Like post: ${post.likes} likes`}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes} likes
                    </button>
                    <button 
                      onClick={() => {
                        setExpandedPost(expandedPost === post.id ? null : post.id);
                        speak(expandedPost === post.id ? 'Collapsed comments' : `Showing ${post.comments.length} comments`);
                      }}
                      className="flex items-center hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded p-1"
                      aria-label={`View comments: ${post.comments.length} comments`}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments.length} comments
                    </button>
                    <button
                      onClick={() => speakPost(post)}
                      className="flex items-center hover:text-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 rounded p-1"
                      aria-label="Listen to post"
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Listen
                    </button>
                  </div>

                  {expandedPost === post.id && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-3 mb-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                <Users className="w-3 h-3 text-gray-500" />
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500 ml-2">{getTimeAgo(comment.timestamp)}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
                          aria-label="Type comment"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center"
                          aria-label="Send comment"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No posts found in this category</p>
                <button
                  onClick={() => setShowNewPost(true)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300"
                  aria-label="Create the first post in this category"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;