const express = require('express');
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Car = require('../models/Car');
const Activity = require('../models/Activity');
const Ticket = require('../models/Ticket');
// Optional auth inline
const optionalAuth = async (req, res, next) => { try { const authHeader = req.headers['authorization']; const token = authHeader && authHeader.split(' ')[1]; if (token) { const jwt = require('jsonwebtoken'); const { User } = require('../models/common'); const decoded = jwt.verify(token, process.env.JWT_SECRET); const user = await User.findById(decoded.userId).select('-password'); if (user && user.isActive) req.user = user; } next(); } catch (error) { next(); } };

const router = express.Router();

// @route   POST /api/search
// @desc    Universal search across all content types
// @access  Public
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { q, types = ['tours', 'hotels', 'cars', 'activities', 'tickets'], limit = 10 } = req.body;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = new RegExp(q.trim(), 'i');
    const results = {};

    // Search tours
    if (types.includes('tours')) {
      results.tours = await Tour.find({
        $and: [
          { availability: true },
          {
            $or: [
              { title: searchQuery },
              { location: searchQuery },
              { category: searchQuery },
              { description: searchQuery }
            ]
          }
        ]
      })
      .sort({ 'rating.score': -1 })
      .limit(limit)
      .lean();
    }

    // Search hotels
    if (types.includes('hotels')) {
      results.hotels = await Hotel.find({
        $and: [
          { availability: true },
          {
            $or: [
              { name: searchQuery },
              { 'location.city': searchQuery },
              { 'location.country': searchQuery },
              { amenities: { $in: [searchQuery] } }
            ]
          }
        ]
      })
      .sort({ 'rating.score': -1 })
      .limit(limit)
      .lean();
    }

    // Search cars
    if (types.includes('cars')) {
      results.cars = await Car.find({
        $and: [
          { availability: true },
          {
            $or: [
              { brand: searchQuery },
              { model: searchQuery },
              { 'location.city': searchQuery },
              { features: { $in: [searchQuery] } }
            ]
          }
        ]
      })
      .sort({ 'rating.score': -1, year: -1 })
      .limit(limit)
      .lean();
    }

    // Search activities
    if (types.includes('activities')) {
      results.activities = await Activity.find({
        $and: [
          { availability: true },
          {
            $or: [
              { title: searchQuery },
              { category: searchQuery },
              { 'location.city': searchQuery },
              { 'location.country': searchQuery },
              { description: searchQuery }
            ]
          }
        ]
      })
      .sort({ 'rating.score': -1 })
      .limit(limit)
      .lean();
    }

    // Search tickets
    if (types.includes('tickets')) {
      results.tickets = await Ticket.find({
        $and: [
          { isAvailable: true },
          {
            $or: [
              { 'departure.location': searchQuery },
              { 'arrival.location': searchQuery },
              { 'provider.name': searchQuery },
              { type: searchQuery }
            ]
          }
        ]
      })
      .sort({ 'departure.dateTime': 1 })
      .limit(limit)
      .lean();
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      success: true,
      data: {
        query: q,
        results,
        totalResults,
        searchTypes: types
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchQuery = new RegExp(q.trim(), 'i');
    const suggestions = [];

    // Get tour suggestions
    const tourSuggestions = await Tour.find({
      $or: [
        { title: searchQuery },
        { location: searchQuery },
        { category: searchQuery }
      ],
      availability: true
    })
    .select('title location category')
    .limit(limit)
    .lean();

    tourSuggestions.forEach(tour => {
      suggestions.push({
        type: 'tour',
        text: tour.title,
        subtitle: `${tour.location} • ${tour.category}`
      });
    });

    // Get hotel suggestions
    const hotelSuggestions = await Hotel.find({
      $or: [
        { name: searchQuery },
        { 'location.city': searchQuery },
        { 'location.country': searchQuery }
      ],
      availability: true
    })
    .select('name location.city location.country')
    .limit(limit)
    .lean();

    hotelSuggestions.forEach(hotel => {
      suggestions.push({
        type: 'hotel',
        text: hotel.name,
        subtitle: `${hotel.location.city}, ${hotel.location.country}`
      });
    });

    // Get car suggestions
    const carSuggestions = await Car.find({
      $or: [
        { brand: searchQuery },
        { model: searchQuery },
        { 'location.city': searchQuery }
      ],
      availability: true
    })
    .select('brand model location.city')
    .limit(limit)
    .lean();

    carSuggestions.forEach(car => {
      suggestions.push({
        type: 'car',
        text: `${car.brand} ${car.model}`,
        subtitle: car.location.city
      });
    });

    res.json({
      success: true,
      data: { suggestions: suggestions.slice(0, limit) }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/search/filters
// @desc    Get available search filters
// @access  Public
router.get('/filters', async (req, res) => {
  try {
    const filters = {
      tourCategories: await Tour.distinct('category'),
      hotelCities: await Hotel.distinct('location.city'),
      carBrands: await Car.distinct('brand'),
      activityCategories: await Activity.distinct('category'),
      ticketTypes: await Ticket.distinct('type'),
      currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      difficulties: ['Easy', 'Moderate', 'Intermediate', 'Hard', 'Expert'],
      transmissions: ['Manual', 'Automatic', 'Semi-Automatic', 'CVT'],
      fuelTypes: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG']
    };

    res.json({
      success: true,
      data: { filters }
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filters',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;