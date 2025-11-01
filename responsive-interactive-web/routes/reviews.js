const express = require('express');
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', authenticateToken, validateReview, async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      userId: req.user._id
    };

    const review = new Review(reviewData);
    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/:itemType/:itemId
// @desc    Get reviews for an item
// @access  Public
router.get('/:itemType/:itemId', async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const filter = { 
      itemType, 
      itemId, 
      isPublic: true 
    };
    if (rating) filter.rating = Number(rating);

    const reviews = await Review.find(filter)
      .populate('userId', 'profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    if (review.helpfulUsers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    review.helpfulUsers.push(req.user._id);
    review.helpful = review.helpfulUsers.length;
    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { helpful: review.helpful }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;