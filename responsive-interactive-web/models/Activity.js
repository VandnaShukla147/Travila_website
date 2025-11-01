const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [50, 'Country name cannot exceed 50 characters']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  duration: {
    hours: {
      type: Number,
      required: [true, 'Duration in hours is required'],
      min: [0.5, 'Duration must be at least 0.5 hours']
    },
    days: {
      type: Number,
      min: [0, 'Days cannot be negative'],
      default: 0
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
      enum: ['person', 'group', 'hour'],
      default: 'person'
    }
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Easy', 'Moderate', 'Intermediate', 'Hard', 'Expert']
  },
  minAge: {
    type: Number,
    min: [0, 'Minimum age cannot be negative'],
    default: 0
  },
  maxAge: {
    type: Number,
    min: [0, 'Maximum age cannot be negative']
  },
  maxGroupSize: {
    type: Number,
    min: [1, 'Max group size must be at least 1'],
    default: 20
  },
  minGroupSize: {
    type: Number,
    min: [1, 'Min group size must be at least 1'],
    default: 1
  },
  included: [{
    type: String,
    trim: true,
    maxlength: [100, 'Included item cannot exceed 100 characters']
  }],
  excluded: [{
    type: String,
    trim: true,
    maxlength: [100, 'Excluded item cannot exceed 100 characters']
  }],
  requirements: [{
    type: String,
    trim: true,
    maxlength: [100, 'Requirement cannot exceed 100 characters']
  }],
  whatToBring: [{
    type: String,
    trim: true,
    maxlength: [100, 'Item cannot exceed 100 characters']
  }],
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
    }
  },
  images: {
    main: {
      type: String,
      required: [true, 'Main image is required'],
      trim: true
    },
    gallery: [{
      type: String,
      trim: true
    }]
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    trim: true
  },
  highlights: [{
    type: String,
    trim: true,
    maxlength: [100, 'Highlight cannot exceed 100 characters']
  }],
  itinerary: [{
    time: {
      type: String,
      required: true,
      trim: true
    },
    activity: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Activity name cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  availability: {
    type: Boolean,
    default: true
  },
  seasonality: {
    startMonth: {
      type: Number,
      min: [1, 'Start month must be between 1-12'],
      max: [12, 'Start month must be between 1-12']
    },
    endMonth: {
      type: Number,
      min: [1, 'End month must be between 1-12'],
      max: [12, 'End month must be between 1-12']
    }
  },
  weatherDependent: {
    type: Boolean,
    default: false
  },
  cancellationPolicy: {
    freeCancellation: {
      type: Boolean,
      default: true
    },
    cancelBefore: {
      type: Number, // hours before activity
      default: 24
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activitySchema.index({ category: 1 });
activitySchema.index({ 'location.city': 1 });
activitySchema.index({ isPopular: 1 });
activitySchema.index({ isFeatured: 1 });
activitySchema.index({ 'rating.score': -1 });
activitySchema.index({ difficulty: 1 });
activitySchema.index({ availability: 1 });

module.exports = mongoose.model('Activity', activitySchema);