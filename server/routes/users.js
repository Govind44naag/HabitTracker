const express = require('express');
const User = require('../models/User');
const Habit = require('../models/Habit');
const CheckIn = require('../models/CheckIn');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search for users to follow
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    })
    .select('username email')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent following yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (req.user.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following list
    req.user.following.push(userId);
    await req.user.save();

    // Add to user's followers list
    userToFollow.followers.push(req.user._id);
    await userToFollow.save();

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/follow/:userId
// @desc    Unfollow a user
// @access  Private
router.delete('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if following this user
    if (!req.user.following.includes(userId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Remove from following list
    req.user.following = req.user.following.filter(id => id.toString() !== userId);
    await req.user.save();

    // Remove from user's followers list
    const userToUnfollow = await User.findById(userId);
    if (userToUnfollow) {
      userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id.toString());
      await userToUnfollow.save();
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/following
// @desc    Get following list
// @access  Private
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'username email')
      .select('following');

    res.json(user.following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/feed
// @desc    Get activity feed from followed users
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent check-ins from followed users
    const checkIns = await CheckIn.find({
      user: { $in: req.user.following }
    })
    .populate('user', 'username')
    .populate('habit', 'name category')
    .sort({ date: -1 })
    .limit(parseInt(limit));

    res.json(checkIns);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/habits
// @desc    Get public habits of a user
// @access  Private
router.get('/:userId/habits', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if following this user
    if (!req.user.following.includes(userId)) {
      return res.status(403).json({ message: 'Must follow user to view their habits' });
    }

    const habits = await Habit.find({ user: userId, isActive: true })
      .select('name category streak longestStreak totalCompletions createdAt')
      .sort({ streak: -1 });

    res.json(habits);
  } catch (error) {
    console.error('Get user habits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
