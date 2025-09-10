const express = require('express');
const { body, validationResult } = require('express-validator');
const CheckIn = require('../models/CheckIn');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/checkins
// @desc    Create a check-in for a habit
// @access  Private
router.post('/', [
  auth,
  body('habitId')
    .isMongoId()
    .withMessage('Valid habit ID is required'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { habitId, completed = true, notes } = req.body;

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await CheckIn.findOne({
      habit: habitId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingCheckIn) {
      return res.status(400).json({ message: 'Already checked in for this habit today' });
    }

    // Create check-in
    const checkIn = new CheckIn({
      habit: habitId,
      user: req.user._id,
      completed,
      notes
    });

    await checkIn.save();

    // Update habit streak and stats
    if (completed) {
      habit.streak += 1;
      habit.totalCompletions += 1;
      
      if (habit.streak > habit.longestStreak) {
        habit.longestStreak = habit.streak;
      }
    } else {
      habit.streak = 0;
    }

    await habit.save();

    res.status(201).json(checkIn);
  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/checkins/habit/:habitId
// @desc    Get check-ins for a specific habit
// @access  Private
router.get('/habit/:habitId', auth, async (req, res) => {
  try {
    const { habitId } = req.params;
    const { limit = 30, page = 1 } = req.query;

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const skip = (page - 1) * limit;
    const checkIns = await CheckIn.find({ habit: habitId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await CheckIn.countDocuments({ habit: habitId });

    res.json({
      checkIns,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/checkins/recent
// @desc    Get recent check-ins for current user
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const checkIns = await CheckIn.find({ user: req.user._id })
      .populate('habit', 'name category')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(checkIns);
  } catch (error) {
    console.error('Get recent check-ins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/checkins/:id
// @desc    Delete a check-in
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const checkIn = await CheckIn.findOne({ _id: req.params.id, user: req.user._id });

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    // Update habit streak when deleting a check-in
    const habit = await Habit.findById(checkIn.habit);
    if (habit && checkIn.completed) {
      habit.streak = Math.max(0, habit.streak - 1);
      habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
      await habit.save();
    }

    await CheckIn.findByIdAndDelete(req.params.id);
    res.json({ message: 'Check-in deleted successfully' });
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
