const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

// Ensure one review per order
reviewSchema.index({ order: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, rating: 1 });

// Update user rating when review is created
reviewSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
      this.reviewee,
      { $inc: { 'rating.count': 1 } }
    );
    
    // Recalculate average rating
    const reviews = await mongoose.model('Review').find({ reviewee: this.reviewee });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await User.findByIdAndUpdate(
      this.reviewee,
      { 'rating.average': Math.round(averageRating * 10) / 10 }
    );
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
