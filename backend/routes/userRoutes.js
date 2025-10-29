import express from 'express'
import {
  getUserById,
  getUserByUsername,
  followUser,
  unfollowUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getFollowing,
  getFollowers
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// @route   GET /api/users/username/:username
// @desc    Get user by username
// @access  Public
router.get('/username/:username', getUserByUsername)

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUserById)

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', protect, followUser)

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/follow', protect, unfollowUser)

// @route   GET /api/users/me/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/me/wishlist', protect, getWishlist)

// @route   POST /api/users/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/wishlist/:productId', protect, addToWishlist)

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/wishlist/:productId', protect, removeFromWishlist)

// @route   GET /api/users/me/following
// @desc    Get users I'm following
// @access  Private
router.get('/me/following', protect, getFollowing)

// @route   GET /api/users/me/followers
// @desc    Get my followers
// @access  Private
router.get('/me/followers', protect, getFollowers)

export default router

