import Product from '../models/Product.js'

// @desc    Get all products with pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Build query
    let query = { status: 'active' }
    
    // Filter by liked products (if user is authenticated)
    if (req.query.liked === 'true' && req.user) {
      query.likes = req.user._id
    }
    
    // Filter by seller
    if (req.query.seller) {
      query.seller = req.query.seller
    }

    const products = await Product.find(query)
      .populate('seller', 'name avatar storeName')
      .limit(limit)
      .skip(skip)
      .sort('-createdAt')

    const total = await Product.countDocuments(query)

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name avatar storeName followers')
      .populate('reviews.user', 'name avatar')

    if (product) {
      // Increment views
      product.views += 1
      await product.save()

      res.json(product)
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller only)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      seller: req.user._id
    })

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' })
    }

    Object.assign(product, req.body)
    const updatedProduct = await product.save()

    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' })
    }

    await product.deleteOne()

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Like/Unlike a product
// @route   POST /api/products/:id/like
// @access  Private
export const likeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const isLiked = product.likes.includes(req.user._id)

    if (isLiked) {
      product.likes = product.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      product.likes.push(req.user._id)
    }

    await product.save()

    res.json({ liked: !isLiked, likes: product.likes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' })
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    }

    product.reviews.push(review)
    product.numReviews = product.reviews.length
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length

    await product.save()

    res.status(201).json({ message: 'Review added' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category,
      status: 'active'
    })
      .populate('seller', 'name avatar')
      .sort('-createdAt')

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ message: 'Search query required' })
    }

    const products = await Product.find({
      $text: { $search: q },
      status: 'active'
    })
      .populate('seller', 'name avatar')
      .limit(50)

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

