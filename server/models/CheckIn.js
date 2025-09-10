const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Ensure one check-in per habit per day
checkInSchema.index({ habit: 1, date: 1 }, { unique: true });

// Helper method to get date string for comparison
checkInSchema.methods.getDateString = function() {
  return this.date.toISOString().split('T')[0];
};

module.exports = mongoose.model('CheckIn', checkInSchema);
