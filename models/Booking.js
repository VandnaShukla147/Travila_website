const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingType: {
    type: String,
    required: [true, 'Booking type is required'],
    enum: ['tour', 'hotel', 'car', 'activity', 'ticket']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Item ID is required']
  },
  bookingDetails: {
    checkIn: {
      type: Date,
      required: function() {
        return ['tour', 'hotel', 'activity'].includes(this.bookingType);
      }
    },
    checkOut: {
      type: Date,
      required: function() {
        return ['hotel'].includes(this.bookingType);
      }
    },
    startDate: {
      type: Date,
      required: function() {
        return ['tour', 'activity'].includes(this.bookingType);
      }
    },
    endDate: {
      type: Date,
      required: function() {
        return ['tour', 'activity'].includes(this.bookingType);
      }
    },
    pickupDate: {
      type: Date,
      required: function() {
        return ['car'].includes(this.bookingType);
      }
    },
    returnDate: {
      type: Date,
      required: function() {
        return ['car'].includes(this.bookingType);
      }
    },
    guests: {
      adults: {
        type: Number,
        required: function() {
          return ['tour', 'hotel', 'activity'].includes(this.bookingType);
        },
        min: [1, 'At least 1 adult is required']
      },
      children: {
        type: Number,
        min: [0, 'Children count cannot be negative'],
        default: 0
      },
      infants: {
        type: Number,
        min: [0, 'Infants count cannot be negative'],
        default: 0
      }
    },
    rooms: {
      type: Number,
      min: [1, 'At least 1 room is required'],
      default: 1
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
      default: 0
    },
    fees: {
      type: Number,
      min: [0, 'Fees cannot be negative'],
      default: 0
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      default: 'USD'
    }
  },
  payment: {
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash']
    },
    status: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      trim: true
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative'],
      default: 0
    }
  },
  status: {
    type: String,
    required: [true, 'Booking status is required'],
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  cancellationPolicy: {
    canCancel: {
      type: Boolean,
      default: true
    },
    cancelBefore: {
      type: Number, // hours before check-in/start
      default: 24
    },
    refundPercentage: {
      type: Number,
      min: [0, 'Refund percentage cannot be negative'],
      max: [100, 'Refund percentage cannot exceed 100'],
      default: 100
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      }
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'bookingDetails.checkIn': 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for booking reference
bookingSchema.virtual('bookingReference').get(function() {
  return `TRV-${this._id.toString().slice(-8).toUpperCase()}`;
});

module.exports = mongoose.model('Booking', bookingSchema);