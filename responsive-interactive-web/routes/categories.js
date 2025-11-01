const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isPopular, isActive = true } = req.query;

    const filter = { isActive };
    if (isPopular === 'true') filter.isPopular = true;

    const categories = await Category.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/categories/popular
// @desc    Get popular categories
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const categories = await Category.find({ 
      isPopular: true, 
      isActive: true 
    })
    .sort({ displayOrder: 1 })
    .limit(Number(limit))
    .lean();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/categories/:slug
// @desc    Get category by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).lean();
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;