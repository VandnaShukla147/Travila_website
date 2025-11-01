const express = require('express');
const router = express.Router();

// Optional auth middleware
const optionalAuth = async (req, res, next) => { try { const authHeader = req.headers['authorization']; const token = authHeader && authHeader.split(' ')[1]; if (token) { const jwt = require('jsonwebtoken'); const { User } = require('../models/common'); const decoded = jwt.verify(token, process.env.JWT_SECRET); const user = await User.findById(decoded.userId).select('-password'); if (user && user.isActive) req.user = user; } next(); } catch (error) { next(); } };

// Import models
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Car = require('../models/Car');
const Activity = require('../models/Activity');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const { Review } = require('../models/common');

// =============================
// Quick endpoints used by homepage (featured / top-rated / recent)
// =============================
// Featured tours
router.get('/tours/featured', optionalAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const tours = await Tour.find({ isFeatured: true })
      .sort({ 'rating.score': -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: { tours } });
  } catch (error) {
    console.error('Get featured tours error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured tours' });
  }
});

// Top-rated hotels
router.get('/hotels/top-rated', optionalAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const hotels = await Hotel.find({})
      .sort({ 'rating.score': -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: { hotels } });
  } catch (error) {
    console.error('Get top-rated hotels error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top-rated hotels' });
  }
});

// Recent cars
router.get('/cars/recent', optionalAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const cars = await Car.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: { cars } });
  } catch (error) {
    console.error('Get recent cars error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent cars' });
  }
});


// =============================
// Tours Routes
// =============================
router.get('/tours', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, location, minPrice, maxPrice, minRating, isFeatured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (location) filter['location.city'] = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }
    if (minRating) filter['rating.score'] = { $gte: Number(minRating) };
    if (isFeatured) filter.isFeatured = true;

    const tours = await Tour.find(filter).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }).lean();
    const total = await Tour.countDocuments(filter);

    res.json({
      success: true,
      data: { tours, pagination: { current: Number(page), pages: Math.ceil(total / limit), total } }
    });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tours' });
  }
});

router.get('/tours/:id', optionalAuth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).lean();
    if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
    res.json({ success: true, data: { tour } });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tour' });
  }
});

// =============================
// Hotels Routes
// =============================
router.get('/hotels', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, city, country, minRating, maxPrice } = req.query;
    const filter = {};
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (country) filter['location.country'] = new RegExp(country, 'i');
    if (minRating) filter['rating.score'] = { $gte: Number(minRating) };
    if (maxPrice) filter['price.perNight'] = { $lte: Number(maxPrice) };

    const hotels = await Hotel.find(filter).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }).lean();
    const total = await Hotel.countDocuments(filter);

    res.json({
      success: true,
      data: { hotels, pagination: { current: Number(page), pages: Math.ceil(total / limit), total } }
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotels' });
  }
});

router.get('/hotels/:id', optionalAuth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.json({ success: true, data: { hotel } });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotel' });
  }
});

// =============================
// Cars Routes
// =============================
router.get('/cars', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, brand, location } = req.query;
    const filter = {};
    if (brand) filter.brand = brand;
    if (location) filter['location.city'] = new RegExp(location, 'i');

    const cars = await Car.find(filter).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }).lean();
    const total = await Car.countDocuments(filter);

    res.json({
      success: true,
      data: { cars, pagination: { current: Number(page), pages: Math.ceil(total / limit), total } }
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cars' });
  }
});

router.get('/cars/:id', optionalAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, data: { car } });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch car' });
  }
});

// =============================
// Activities Routes
// =============================
router.get('/activities', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const filter = { availability: true };
    if (category) filter.category = category;

    const activities = await Activity.find(filter).limit(limit * 1).skip((page - 1) * limit).lean();
    const total = await Activity.countDocuments(filter);

    res.json({
      success: true,
      data: { activities, pagination: { current: Number(page), pages: Math.ceil(total / limit), total } }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

router.get('/activities/:id', optionalAuth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).lean();
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, data: { activity } });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
});

// =============================
// Tickets Routes
// =============================
router.get('/tickets', optionalAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ isAvailable: true }).limit(20).lean();
    res.json({ success: true, data: { tickets } });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

router.get('/tickets/:id', optionalAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).lean();
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: { ticket } });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
});

module.exports = router;
