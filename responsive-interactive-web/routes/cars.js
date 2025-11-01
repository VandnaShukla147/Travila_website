const express = require('express');
const Car = require('../models/Car');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cars
// @desc    Get all cars with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      brand,
      model,
      city,
      minPrice,
      maxPrice,
      transmission,
      fuelType,
      seats,
      isRecentLaunch,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { availability: true };
    
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }
    if (transmission) filter['specifications.transmission'] = transmission;
    if (fuelType) filter['specifications.fuelType'] = fuelType;
    if (seats) filter['specifications.seats'] = Number(seats);
    if (isRecentLaunch === 'true') filter.isRecentLaunch = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const cars = await Car.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Car.countDocuments(filter);

    res.json({
      success: true,
      data: {
        cars,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/cars/recent
// @desc    Get recent car launches
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const cars = await Car.find({ 
      isRecentLaunch: true, 
      availability: true 
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { cars }
    });
  } catch (error) {
    console.error('Get recent cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent cars',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/cars/:id
// @desc    Get car by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).lean();
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      data: { car }
    });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/cars/brand/:brand
// @desc    Get cars by brand
// @access  Public
router.get('/brand/:brand', optionalAuth, async (req, res) => {
  try {
    const { brand } = req.params;
    const { limit = 12 } = req.query;

    const cars = await Car.find({ 
      brand: new RegExp(brand, 'i'),
      availability: true 
    })
    .sort({ year: -1, 'rating.score': -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { cars }
    });
  } catch (error) {
    console.error('Get cars by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars by brand',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/cars/search
// @desc    Search cars
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

    const cars = await Car.find({
      $and: [
        { availability: true },
        {
          $or: [
            { brand: new RegExp(q, 'i') },
            { model: new RegExp(q, 'i') },
            { 'location.city': new RegExp(q, 'i') },
            { features: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
    .sort({ 'rating.score': -1, year: -1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { cars }
    });
  } catch (error) {
    console.error('Search cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search cars',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;