const express = require('express');
const Activity = require('../models/Activity');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/activities
// @desc    Get all activities with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      city,
      country,
      minPrice,
      maxPrice,
      difficulty,
      minAge,
      isPopular,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { availability: true };
    
    if (category) filter.category = new RegExp(category, 'i');
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (country) filter['location.country'] = new RegExp(country, 'i');
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }
    if (difficulty) filter.difficulty = difficulty;
    if (minAge) filter.minAge = { $lte: Number(minAge) };
    if (isPopular === 'true') filter.isPopular = true;
    if (isFeatured === 'true') filter.isFeatured = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const activities = await Activity.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Activity.countDocuments(filter);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/activities/popular
// @desc    Get popular activities
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const activities = await Activity.find({ 
      isPopular: true, 
      availability: true 
    })
    .sort({ 'rating.score': -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    console.error('Get popular activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular activities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/activities/:id
// @desc    Get activity by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).lean();
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;