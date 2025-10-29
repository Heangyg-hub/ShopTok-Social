import express from 'express'
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  updateOrderToPaid
} from '../controllers/orderController.js'
import { protect, seller, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, createOrder)

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, getUserOrders)

// @route   GET /api/orders/seller
// @desc    Get seller orders
// @access  Private (Seller only)
router.get('/seller', protect, seller, getSellerOrders)

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, getOrderById)

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Seller/Admin only)
router.put('/:id/status', protect, seller, updateOrderStatus)

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, updateOrderToPaid)

export default router

