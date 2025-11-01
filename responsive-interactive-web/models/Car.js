const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
    maxlength: [100, 'Model name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Car brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
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
    }
  },
  specifications: {
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
      default: 0
    },
    transmission: {
      type: String,
      required: [true, 'Transmission type is required'],
      enum: ['Manual', 'Automatic', 'Semi-Automatic', 'CVT']
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG']
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'Seats must be at least 1'],
      max: [50, 'Seats cannot exceed 50']
    },
    engine: {
      type: String,
      trim: true
    },
    power: {
      type: String,
      trim: true
    },
    fuelCapacity: {
      type: Number,
      min: [0, 'Fuel capacity cannot be negative']
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
      enum: ['day', 'week', 'month'],
      default: 'day'
    }
  },
  image: {
    type: String,
    required: [true, 'Car image is required'],
    trim: true
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [50, 'Feature name cannot exceed 50 characters']
  }],
  isRecentLaunch: {
    type: Boolean,
    default: false
  },
  availability: {
    type: Boolean,
    default: true
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
    }
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be 1900 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color name cannot exceed 30 characters']
  },
  condition: {
    type: String,
    enum: ['New', 'Used', 'Certified Pre-Owned'],
    default: 'Used'
  },
  insurance: {
    included: {
      type: Boolean,
      default: false
    },
    coverage: {
      type: String,
      trim: true
    }
  },
  pickupLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Pickup location cannot exceed 200 characters']
  },
  returnLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Return location cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
carSchema.index({ brand: 1 });
carSchema.index({ model: 1 });
carSchema.index({ 'location.city': 1 });
carSchema.index({ isRecentLaunch: 1 });
carSchema.index({ 'price.amount': 1 });
carSchema.index({ availability: 1 });
carSchema.index({ year: -1 });

module.exports = mongoose.model('Car', carSchema);