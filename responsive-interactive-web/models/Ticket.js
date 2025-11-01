const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Ticket type is required'],
    enum: ['flight', 'train', 'bus', 'event', 'attraction', 'show', 'concert']
  },
  departure: {
    location: {
      type: String,
      required: [true, 'Departure location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Code cannot exceed 10 characters']
    },
    dateTime: {
      type: Date,
      required: [true, 'Departure date and time is required']
    },
    terminal: {
      type: String,
      trim: true,
      maxlength: [20, 'Terminal cannot exceed 20 characters']
    },
    gate: {
      type: String,
      trim: true,
      maxlength: [10, 'Gate cannot exceed 10 characters']
    }
  },
  arrival: {
    location: {
      type: String,
      required: [true, 'Arrival location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Code cannot exceed 10 characters']
    },
    dateTime: {
      type: Date,
      required: [true, 'Arrival date and time is required']
    },
    terminal: {
      type: String,
      trim: true,
      maxlength: [20, 'Terminal cannot exceed 20 characters']
    },
    gate: {
      type: String,
      trim: true,
      maxlength: [10, 'Gate cannot exceed 10 characters']
    }
  },
  provider: {
    name: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
      maxlength: [100, 'Provider name cannot exceed 100 characters']
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Code cannot exceed 10 characters']
    },
    logo: {
      type: String,
      trim: true
    }
  },
  serviceDetails: {
    // For flights
    flightNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Flight number cannot exceed 10 characters']
    },
    aircraft: {
      type: String,
      trim: true,
      maxlength: [50, 'Aircraft cannot exceed 50 characters']
    },
    // For trains
    trainNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Train number cannot exceed 20 characters']
    },
    // For events
    venue: {
      type: String,
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters']
    },
    eventDate: {
      type: Date
    }
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
    maxlength: [50, 'Class cannot exceed 50 characters']
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
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    }
  },
  availableSeats: {
    type: Number,
    min: [0, 'Available seats cannot be negative'],
    default: 0
  },
  totalSeats: {
    type: Number,
    min: [1, 'Total seats must be at least 1']
  },
  baggage: {
    cabin: {
      type: String,
      trim: true,
      maxlength: [50, 'Cabin baggage cannot exceed 50 characters']
    },
    checked: {
      type: String,
      trim: true,
      maxlength: [50, 'Checked baggage cannot exceed 50 characters']
    },
    weightLimit: {
      type: String,
      trim: true,
      maxlength: [20, 'Weight limit cannot exceed 20 characters']
    }
  },
  amenities: [{
    type: String,
    trim: true,
    maxlength: [50, 'Amenity cannot exceed 50 characters']
  }],
  restrictions: {
    refundable: {
      type: Boolean,
      default: false
    },
    changeable: {
      type: Boolean,
      default: false
    },
    transferable: {
      type: Boolean,
      default: false
    },
    cancellationFee: {
      type: Number,
      min: [0, 'Cancellation fee cannot be negative'],
      default: 0
    }
  },
  duration: {
    hours: {
      type: Number,
      min: [0, 'Hours cannot be negative']
    },
    minutes: {
      type: Number,
      min: [0, 'Minutes cannot be negative'],
      max: [59, 'Minutes cannot exceed 59']
    }
  },
  stops: [{
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    arrivalTime: {
      type: Date
    },
    departureTime: {
      type: Date
    },
    duration: {
      type: Number, // minutes
      min: [0, 'Duration cannot be negative']
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  bookingDeadline: {
    type: Date
  },
  checkInDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ticketSchema.index({ type: 1 });
ticketSchema.index({ 'departure.location': 1 });
ticketSchema.index({ 'arrival.location': 1 });
ticketSchema.index({ 'departure.dateTime': 1 });
ticketSchema.index({ 'provider.name': 1 });
ticketSchema.index({ isAvailable: 1 });
ticketSchema.index({ isFeatured: 1 });
ticketSchema.index({ 'price.amount': 1 });

// Virtual for duration in minutes
ticketSchema.virtual('durationInMinutes').get(function() {
  return (this.duration.hours || 0) * 60 + (this.duration.minutes || 0);
});

// Virtual for formatted duration
ticketSchema.virtual('formattedDuration').get(function() {
  const hours = this.duration.hours || 0;
  const minutes = this.duration.minutes || 0;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  }
  return 'N/A';
});

module.exports = mongoose.model('Ticket', ticketSchema);