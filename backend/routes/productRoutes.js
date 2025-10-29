import express from 'express'
import Product from '../models/Product.js'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  addReview,
  getProductsByCategory,
  searchProducts
} from '../controllers/productController.js'
import { protect, seller, optionalProtect } from '../middleware/authMiddleware.js'
import {
  getComments,
  createComment,
  deleteComment,
  likeComment
} from '../controllers/commentController.js'

const router = express.Router()

// @route   GET /api/products
// @desc    Get all products with pagination
// @access  Public (optionally authenticated for liked products)
router.get('/', optionalProtect, getProducts)

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', searchProducts)

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', getProductsByCategory)

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', getProductById)

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Seller only)
router.post('/', protect, seller, createProduct)

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Seller/Admin only)
router.put('/:id', protect, seller, updateProduct)

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Seller/Admin only)
router.delete('/:id', protect, seller, deleteProduct)

// @route   POST /api/products/:id/like
// @desc    Like/unlike a product
// @access  Private
router.post('/:id/like', protect, likeProduct)

// @route   POST /api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', protect, addReview)

// @route   GET /api/products/:id/comments
// @desc    Get all comments for a product
// @access  Public
router.get('/:id/comments', getComments)

// @route   POST /api/products/:id/comments
// @desc    Create a comment on a product
// @access  Private
router.post('/:id/comments', protect, createComment)

// @route   GET /api/products/user/:userId
// @desc    Get products by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.params.userId,
      status: 'active'
    })
      .populate('seller', 'name avatar')
      .sort('-createdAt')

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

