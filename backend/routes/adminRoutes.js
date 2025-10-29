import express from 'express'
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllProducts,
  flagProduct,
  deleteProduct,
  getStats
} from '../controllers/adminController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes require admin authentication
router.use(protect, admin)

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin only)
router.get('/stats', getStats)

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', getAllUsers)

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', deleteUser)

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', updateUserRole)

// @route   GET /api/admin/products
// @desc    Get all products
// @access  Private (Admin only)
router.get('/products', getAllProducts)

// @route   PUT /api/admin/products/:id/flag
// @desc    Flag/unflag product
// @access  Private (Admin only)
router.put('/products/:id/flag', flagProduct)

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/products/:id', deleteProduct)

export default router

