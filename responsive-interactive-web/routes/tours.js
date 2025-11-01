const express = require('express');
const Tour = require('../models/Tour');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tours
// @desc    Get all tours with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      isFeatured,
      isTopRated,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { availability: true };
    
    if (category) filter.category = new RegExp(category, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }
    if (minRating) filter['rating.score'] = { $gte: Number(minRating) };
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isTopRated === 'true') filter.isTopRated = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tours = await Tour.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Tour.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tours,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tours',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/tours/featured
// @desc    Get featured tours
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const tours = await Tour.find({ 
      isFeatured: true, 
      availability: true 
    })
    .sort({ 'rating.score': -1, createdAt: -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { tours }
    });
  } catch (error) {
    console.error('Get featured tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured tours',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/tours/top-rated
// @desc    Get top-rated tours
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const tours = await Tour.find({ 
      isTopRated: true, 
      availability: true 
    })
    .sort({ 'rating.score': -1, 'rating.reviews': -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { tours }
    });
  } catch (error) {
    console.error('Get top-rated tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top-rated tours',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/tours/:id
// @desc    Get tour by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).lean();
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    res.json({
      success: true,
      data: { tour }
    });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/tours/category/:category
// @desc    Get tours by category
// @access  Public
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12 } = req.query;

    const tours = await Tour.find({ 
      category: new RegExp(category, 'i'),
      availability: true 
    })
    .sort({ 'rating.score': -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { tours }
    });
  } catch (error) {
    console.error('Get tours by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tours by category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/tours/search
// @desc    Search tours
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const tours = await Tour.find({
      $and: [
        { availability: true },
        {
          $or: [
            { title: new RegExp(q, 'i') },
            { location: new RegExp(q, 'i') },
            { category: new RegExp(q, 'i') },
            { description: new RegExp(q, 'i') }
          ]
        }
      ]
    })
    .sort({ 'rating.score': -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { tours }
    });
  } catch (error) {
    console.error('Search tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search tours',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;