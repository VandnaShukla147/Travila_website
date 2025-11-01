const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  itemType: {
    type: String,
    required: [true, 'Item type is required'],
    enum: ['tour', 'hotel', 'car', 'activity', 'ticket']
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Item ID is required']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    min: [0, 'Helpful count cannot be negative'],
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  response: {
    text: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other'],
    trim: true
  },
  moderationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ itemId: 1, itemType: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ isPublic: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ userId: 1 });

// Compound index for unique review per booking
reviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });

// Virtual for average rating calculation
reviewSchema.statics.getAverageRating = async function(itemId, itemType) {
  const result = await this.aggregate([
    {
      $match: {
        itemId: mongoose.Types.ObjectId(itemId),
        itemType: itemType,
        isPublic: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);