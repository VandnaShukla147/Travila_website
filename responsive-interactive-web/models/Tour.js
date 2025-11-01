const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  duration: {
    days: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day']
    },
    nights: {
      type: Number,
      required: [true, 'Duration in nights is required'],
      min: [0, 'Nights cannot be negative']
    }
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Price amount is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      default: 'USD'
    },
    per: {
      type: String,
      required: [true, 'Price per unit is required'],
      enum: ['person', 'group', 'room'],
      default: 'person'
    }
  },
  rating: {
    score: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    reviews: {
      type: Number,
      min: [0, 'Review count cannot be negative'],
      default: 0
    },
    badge: {
      type: String,
      enum: ['Top Rated', 'Popular', 'New', 'Best Value'],
      default: null
    }
  },
  image: {
    type: String,
    required: [true, 'Tour image is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Tour description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  highlights: [{
    type: String,
    trim: true,
    maxlength: [100, 'Highlight cannot exceed 100 characters']
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTopRated: {
    type: Boolean,
    default: false
  },
  availability: {
    type: Boolean,
    default: true
  },
  maxGroupSize: {
    type: Number,
    min: [1, 'Max group size must be at least 1'],
    default: 20
  },
  minAge: {
    type: Number,
    min: [0, 'Minimum age cannot be negative'],
    default: 0
  },
  included: [{
    type: String,
    trim: true
  }],
  excluded: [{
    type: String,
    trim: true
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    activities: [{
      type: String,
      trim: true
    }]
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
tourSchema.index({ isFeatured: 1 });
tourSchema.index({ isTopRated: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ location: 1 });
tourSchema.index({ 'rating.score': -1 });
tourSchema.index({ 'price.amount': 1 });
tourSchema.index({ availability: 1 });

module.exports = mongoose.model('Tour', tourSchema);