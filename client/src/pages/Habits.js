import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health',
    frequency: 'daily'
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get('/api/habits');
      setHabits(response.data);
    } catch (error) {
      setError('Failed to load habits');
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingHabit) {
        await axios.put(`/api/habits/${editingHabit._id}`, formData);
        setHabits(habits.map(habit => 
          habit._id === editingHabit._id 
            ? { ...habit, ...formData }
            : habit
        ));
      } else {
        const response = await axios.post('/api/habits', formData);
        setHabits([response.data, ...habits]);
      }
      
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save habit');
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency
    });
    setShowForm(true);
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      await axios.delete(`/api/habits/${habitId}`);
      setHabits(habits.filter(habit => habit._id !== habitId));
    } catch (error) {
      setError('Failed to delete habit');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'health',
      frequency: 'daily'
    });
    setEditingHabit(null);
    setShowForm(false);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
            <p className="mt-2 text-gray-600">Create and manage your daily habits</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add New Habit
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Habit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Habit Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Drink 8 glasses of water"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add a description for your habit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="learning">Learning</option>
                    <option value="productivity">Productivity</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors"
                  >
                    {editingHabit ? 'Update' : 'Create'} Habit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-4">Start building good habits by creating your first one!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Create Your First Habit
              </button>
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
                        <span className="text-sm text-gray-500 capitalize">{habit.frequency}</span>
                      </div>
                      {habit.description && (
                        <p className="mt-1 text-sm text-gray-600">{habit.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>🔥 {habit.streak} day streak</span>
                        <span>📊 {habit.totalCompletions} total</span>
                        <span>🏆 Best: {habit.longestStreak}</span>
                        {habit.checkedInToday && (
                          <span className="text-success-600 font-medium">✅ Checked in today</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
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

export default Habits;
