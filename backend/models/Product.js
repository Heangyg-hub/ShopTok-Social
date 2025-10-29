import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: 2000
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  
  // Media
  images: [{
    url: String,
    publicId: String
  }],
  video: {
    url: String,
    publicId: String,
    thumbnail: String
  },
  
  // Inventory
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: 0,
    default: 0
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['electronics', 'fashion', 'beauty', 'home', 'sports', 'toys', 'books', 'phones', 'other']
  },
  tags: [String],
  
  // Seller info
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Features & Specifications
  features: [String],
  specifications: {
    type: Map,
    of: String
  },
  
  // Social engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  
  // Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'flagged', 'out_of_stock'],
    default: 'active'
  },
  
  // Analytics
  totalSales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes for search optimization
productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ seller: 1 })
productSchema.index({ category: 1 })
productSchema.index({ status: 1 })

const Product = mongoose.model('Product', productSchema)

export default Product

