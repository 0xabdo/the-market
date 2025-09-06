const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  category: {
    type: String,
    required: true,
    enum: ['accounts', 'items', 'currency', 'services']
  },
  game: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['PC', 'PlayStation', 'Xbox', 'Mobile', 'Nintendo Switch', 'Other']
  },
  images: [{
    url: String,
    publicId: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: ['instant', 'manual', 'scheduled']
  },
  deliveryTime: {
    type: String,
    required: true,
    default: 'Instant'
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  tags: [String],
  specifications: {
    level: Number,
    rank: String,
    region: String,
    additionalInfo: String
  },
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ title: 'text', description: 'text', game: 'text', tags: 'text' });
productSchema.index({ category: 1, game: 1, price: 1 });
productSchema.index({ seller: 1, isActive: 1 });

// Method to get average rating from reviews
productSchema.methods.getAverageRating = async function() {
  const Review = mongoose.model('Review');
  const result = await Review.aggregate([
    { $match: { product: this._id } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  return {
    average: result[0]?.average || 0,
    count: result[0]?.count || 0
  };
};

module.exports = mongoose.model('Product', productSchema);
