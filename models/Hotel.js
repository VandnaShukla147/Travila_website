const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
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
      required: [true, 'Address is required'],
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
    stars: {
      type: Number,
      min: [1, 'Stars cannot be less than 1'],
      max: [5, 'Stars cannot exceed 5'],
      default: 3
    }
  },
  price: {
    perNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      default: 'USD'
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
  amenities: [{
    type: String,
    trim: true,
    maxlength: [50, 'Amenity name cannot exceed 50 characters']
  }],
  roomTypes: [{
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Room type cannot exceed 50 characters']
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Room description cannot exceed 200 characters']
    },
    amenities: [{
      type: String,
      trim: true
    }]
  }],
  isTopRated: {
    type: Boolean,
    default: false
  },
  availability: {
    type: Boolean,
    default: true
  },
  checkIn: {
    type: String,
    default: '15:00'
  },
  checkOut: {
    type: String,
    default: '11:00'
  },
  policies: {
    cancellation: {
      type: String,
      trim: true
    },
    petPolicy: {
      type: String,
      trim: true
    },
    smokingPolicy: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
hotelSchema.index({ name: 1 });
hotelSchema.index({ 'location.city': 1 });
hotelSchema.index({ isTopRated: 1 });
hotelSchema.index({ 'rating.score': -1 });
hotelSchema.index({ 'price.perNight': 1 });
hotelSchema.index({ availability: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);