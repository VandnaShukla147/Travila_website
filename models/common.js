// Merged small models: Category, Review, User
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// =============================
// Category Model
// =============================
const categorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: [50, 'Category name cannot exceed 50 characters'], unique: true },
  slug: { type: String, required: [true, 'Category slug is required'], trim: true, lowercase: true, unique: true, match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'] },
  image: { type: String, required: [true, 'Category image is required'], trim: true },
  stats: { tours: { type: Number, min: [0, 'Tour count cannot be negative'], default: 0 }, activities: { type: Number, min: [0, 'Activity count cannot be negative'], default: 0 } },
  description: { type: String, required: [true, 'Category description is required'], maxlength: [500, 'Description cannot exceed 500 characters'], trim: true },
  isPopular: { type: Boolean, default: false },
  displayOrder: { type: Number, min: [0, 'Display order cannot be negative'], default: 0 },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  seoTitle: { type: String, trim: true, maxlength: [60, 'SEO title cannot exceed 60 characters'] },
  seoDescription: { type: String, trim: true, maxlength: [160, 'SEO description cannot exceed 160 characters'] },
  keywords: [{ type: String, trim: true, lowercase: true }]
}, { timestamps: true });

categorySchema.index({ slug: 1 });
categorySchema.index({ isPopular: 1 });
categorySchema.index({ displayOrder: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.virtual('subcategories', { ref: 'Category', localField: '_id', foreignField: 'parentCategory' });

// =============================
// Review Model
// =============================
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'] },
  itemType: { type: String, required: [true, 'Item type is required'], enum: ['tour', 'hotel', 'car', 'activity', 'ticket'] },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: [true, 'Item ID is required'] },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: [true, 'Booking ID is required'] },
  rating: { type: Number, required: [true, 'Rating is required'], min: [1, 'Rating must be at least 1'], max: [5, 'Rating cannot exceed 5'] },
  title: { type: String, required: [true, 'Review title is required'], trim: true, maxlength: [100, 'Title cannot exceed 100 characters'] },
  comment: { type: String, required: [true, 'Review comment is required'], trim: true, maxlength: [1000, 'Comment cannot exceed 1000 characters'] },
  images: [{ type: String, trim: true }],
  isVerified: { type: Boolean, default: false },
  helpful: { type: Number, min: [0, 'Helpful count cannot be negative'], default: 0 },
  helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  response: { text: { type: String, trim: true, maxlength: [500, 'Response cannot exceed 500 characters'] }, respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, respondedAt: { type: Date } },
  isPublic: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String, enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other'], trim: true },
  moderationNotes: { type: String, trim: true, maxlength: [500, 'Moderation notes cannot exceed 500 characters'] }
}, { timestamps: true });

reviewSchema.index({ itemId: 1, itemType: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ isPublic: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });
reviewSchema.statics.getAverageRating = async function(itemId, itemType) {
  const result = await this.aggregate([{ $match: { itemId: mongoose.Types.ObjectId(itemId), itemType: itemType, isPublic: true } }, { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }]);
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

// =============================
// User Model
// =============================
const userSchema = new mongoose.Schema({
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
  profile: { firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: [50, 'First name cannot exceed 50 characters'] }, lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: [50, 'Last name cannot exceed 50 characters'] }, phone: { type: String, trim: true, match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'] }, avatar: { type: String, default: 'assets/images/user.png' } },
  preferences: { currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'] }, language: { type: String, default: 'en', enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'] } },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tour' }],
  role: { type: String, enum: ['customer', 'admin', 'moderator'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Export all models
const Category = mongoose.model('Category', categorySchema);
const Review = mongoose.model('Review', reviewSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Category, Review, User };
