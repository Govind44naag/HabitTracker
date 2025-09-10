import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Social = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeed();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
  }, [activeTab]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users/feed');
      setFeed(response.data);
    } catch (error) {
      setError('Failed to load activity feed');
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users/following');
      setFollowing(response.data);
    } catch (error) {
      setError('Failed to load following list');
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axios.post(`/api/users/follow/${userId}`);
      setSearchResults(searchResults.filter(user => user._id !== userId));
      if (activeTab === 'following') {
        fetchFollowing();
      }
    } catch (error) {
      setError('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.delete(`/api/users/follow/${userId}`);
      setFollowing(following.filter(user => user._id !== userId));
      if (activeTab === 'feed') {
        fetchFeed();
      }
    } catch (error) {
      setError('Failed to unfollow user');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      health: 'bg-green-100 text-green-800',
      fitness: 'bg-blue-100 text-blue-800',
      learning: 'bg-purple-100 text-purple-800',
      productivity: 'bg-yellow-100 text-yellow-800',
      mindfulness: 'bg-pink-100 text-pink-800',
      social: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Social</h1>
        <p className="mt-2 text-gray-600">Follow friends and see their progress</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'feed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'following'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Following ({following.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Find Friends
          </button>
        </nav>
      </div>

      {/* Activity Feed Tab */}
      {activeTab === 'feed' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : feed.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-500 mb-4">Follow some friends to see their progress!</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {feed.map((checkIn) => (
                  <div key={checkIn._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {checkIn.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {checkIn.user.username}
                          </p>
                          <span className="text-sm text-gray-500">
                            checked in
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(checkIn.date)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-lg font-medium text-gray-900">
                            {checkIn.habit.name}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(checkIn.habit.category)}`}>
                            {checkIn.habit.category}
                          </span>
                        </div>
                        {checkIn.notes && (
                          <p className="mt-2 text-sm text-gray-600">{checkIn.notes}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Following Tab */}
      {activeTab === 'following' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">People You Follow</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : following.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone yet</h3>
                <p className="text-gray-500 mb-4">Search for friends to follow and see their progress!</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {following.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Find Friends</h2>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
                {searchResults.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user._id)}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
