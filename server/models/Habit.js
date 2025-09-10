const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  category: {
    type: String,
    required: true,
    enum: ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCompletions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure unique habit names per user
habitSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Habit', habitSchema);
