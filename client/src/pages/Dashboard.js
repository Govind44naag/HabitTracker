import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHabits();
    fetchStats();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/api/habits`);
      setHabits(response.data);
    } catch (error) {
      setError('Failed to load habits');
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/api/habits/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      await axios.post(`${process.env.BACKEND_URL}/api/checkins`, { habitId });
      
      // Update local state
      setHabits(habits.map(habit => 
        habit._id === habitId 
          ? { ...habit, checkedInToday: true, streak: habit.streak + 1 }
          : habit
      ));
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      setError('Failed to check in habit');
      console.error('Error checking in habit:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Track your daily habits and build consistency</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">H</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Habits</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalHabits || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🔥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Streak</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalStreak || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Streak</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.averageStreak || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🏆</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Best Streak</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.longestStreak || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Today's Habits</h2>
            <Link
              to="/habits"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Manage Habits
            </Link>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-4">Start building good habits by creating your first one!</p>
              <Link
                to="/habits"
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Create Your First Habit
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => (
                <div key={habit._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{habit.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(habit.category)}`}>
                          {habit.category}
                        </span>
                      </div>
                      {habit.description && (
                        <p className="mt-1 text-sm text-gray-600">{habit.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>🔥 {habit.streak} day streak</span>
                        <span>📊 {habit.totalCompletions} total</span>
                        <span>🏆 Best: {habit.longestStreak}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {habit.checkedInToday ? (
                        <div className="flex items-center text-success-600">
                          <span className="text-2xl mr-2">✅</span>
                          <span className="text-sm font-medium">Done!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(habit._id)}
                          className="bg-success-500 hover:bg-success-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
