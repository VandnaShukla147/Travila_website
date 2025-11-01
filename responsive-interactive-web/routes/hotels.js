const express = require('express');
const Hotel = require('../models/Hotel');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      country,
      minPrice,
      maxPrice,
      minRating,
      stars,
      isTopRated,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { availability: true };
    
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (country) filter['location.country'] = new RegExp(country, 'i');
    if (minPrice || maxPrice) {
      filter['price.perNight'] = {};
      if (minPrice) filter['price.perNight'].$gte = Number(minPrice);
      if (maxPrice) filter['price.perNight'].$lte = Number(maxPrice);
    }
    if (minRating) filter['rating.score'] = { $gte: Number(minRating) };
    if (stars) filter['rating.stars'] = Number(stars);
    if (isTopRated === 'true') filter.isTopRated = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const hotels = await Hotel.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Hotel.countDocuments(filter);

    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/hotels/top-rated
// @desc    Get top-rated hotels
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const hotels = await Hotel.find({ 
      isTopRated: true, 
      availability: true 
    })
    .sort({ 'rating.score': -1, 'rating.reviews': -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { hotels }
    });
  } catch (error) {
    console.error('Get top-rated hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top-rated hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/hotels/:id
// @desc    Get hotel by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      data: { hotel }
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/hotels/search
// @desc    Search hotels
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

    const hotels = await Hotel.find({
      $and: [
        { availability: true },
        {
          $or: [
            { name: new RegExp(q, 'i') },
            { 'location.city': new RegExp(q, 'i') },
            { 'location.country': new RegExp(q, 'i') },
            { amenities: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
    .sort({ 'rating.score': -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { hotels }
    });
  } catch (error) {
    console.error('Search hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;