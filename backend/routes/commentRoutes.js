import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import { getComments, createComment, deleteComment, likeComment } from '../controllers/commentController.js'

const router = express.Router()

// @route   GET /api/products/:productId/comments
// @desc    Get all comments for a product
// @access  Public
router.get('/api/products/:productId/comments', getComments)

// @route   POST /api/products/:productId/comments
// @desc    Create a comment on a product
// @access  Private
router.post('/api/products/:productId/comments', protect, createComment)

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private (comment owner or admin)
router.delete('/api/comments/:commentId', protect, deleteComment)

// @route   POST /api/comments/:commentId/like
// @desc    Like/Unlike a comment
// @access  Private
router.post('/api/comments/:commentId/like', protect, likeComment)

export default router

