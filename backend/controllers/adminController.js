import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const flaggedProducts = await Product.countDocuments({ status: 'flagged' })

    // Calculate total revenue
    const orders = await Order.find({ isPaid: true })
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)

    // Get user stats by role
    const buyerCount = await User.countDocuments({ role: 'buyer' })
    const sellerCount = await User.countDocuments({ role: 'seller' })
    const adminCount = await User.countDocuments({ role: 'admin' })

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const newProducts = await Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })

    res.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        flaggedProducts
      },
      usersByRole: {
        buyers: buyerCount,
        sellers: sellerCount,
        admins: adminCount
      },
      last30Days: {
        newUsers,
        newProducts,
        recentOrders
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const users = await User.find()
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort('-createdAt')

    const total = await User.countDocuments()

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    // Deactivate instead of delete to preserve order history
    user.isActive = false
    await user.save()

    res.json({ message: 'User deactivated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    user.role = role
    await user.save()

    res.json({ message: 'User role updated successfully', user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private (Admin only)
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const products = await Product.find()
      .populate('seller', 'name email storeName')
      .limit(limit)
      .skip(skip)
      .sort('-createdAt')

    const total = await Product.countDocuments()

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

// @desc    Flag/unflag product
// @route   PUT /api/admin/products/:id/flag
// @access  Private (Admin only)
export const flagProduct = async (req, res) => {
  try {
    const { flagged, reason } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.status = flagged ? 'flagged' : 'active'
    if (reason) {
      product.flagReason = reason
    }

    await product.save()

    res.json({ 
      message: flagged ? 'Product flagged successfully' : 'Product unflagged successfully',
      product 
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await product.deleteOne()

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

