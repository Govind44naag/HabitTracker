const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const CheckIn = require('../models/CheckIn');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/habits
// @desc    Get all habits for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    
    // Get today's check-ins for each habit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const habitsWithCheckIns = await Promise.all(
      habits.map(async (habit) => {
        const todayCheckIn = await CheckIn.findOne({
          habit: habit._id,
          date: { $gte: today, $lt: tomorrow }
        });

        return {
          ...habit.toObject(),
          checkedInToday: !!todayCheckIn
        };
      })
    );

    res.json(habitsWithCheckIns);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name is required and must be less than 100 characters'),
  body('category')
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other'])
    .withMessage('Invalid category'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly'])
    .withMessage('Frequency must be daily or weekly')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, frequency = 'daily' } = req.body;

    // Check for duplicate habit name
    const existingHabit = await Habit.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      user: req.user._id
    });

    if (existingHabit) {
      return res.status(400).json({ message: 'You already have a habit with this name' });
    }

    const habit = new Habit({
      name,
      description,
      category,
      frequency,
      user: req.user._id
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name must be less than 100 characters'),
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, frequency } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== habit.name) {
      const existingHabit = await Habit.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        user: req.user._id,
        _id: { $ne: habit._id }
      });

      if (existingHabit) {
        return res.status(400).json({ message: 'You already have a habit with this name' });
      }
    }

    // Update fields
    if (name) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (category) habit.category = category;
    if (frequency) habit.frequency = frequency;

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete a habit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Soft delete by setting isActive to false
    habit.isActive = false;
    await habit.save();

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/habits/stats
// @desc    Get habit statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true });
    
    const stats = {
      totalHabits: habits.length,
      totalStreak: habits.reduce((sum, habit) => sum + habit.streak, 0),
      averageStreak: habits.length > 0 ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length) : 0,
      longestStreak: Math.max(...habits.map(habit => habit.longestStreak), 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
