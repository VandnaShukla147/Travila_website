const express = require('express');
const Ticket = require('../models/Ticket');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tickets
// @desc    Get all tickets with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      departure,
      arrival,
      departureDate,
      minPrice,
      maxPrice,
      sortBy = 'departure.dateTime',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };
    
    if (type) filter.type = type;
    if (departure) filter['departure.location'] = new RegExp(departure, 'i');
    if (arrival) filter['arrival.location'] = new RegExp(arrival, 'i');
    if (departureDate) {
      const date = new Date(departureDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter['departure.dateTime'] = {
        $gte: date,
        $lt: nextDay
      };
    }
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tickets = await Ticket.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Ticket.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/tickets/:id
// @desc    Get ticket by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).lean();
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;