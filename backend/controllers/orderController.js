import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' })
    }

    const order = await Order.create({
      buyer: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      statusHistory: [{
        status: 'pending',
        note: 'Order placed'
      }]
    })

    // Update product sales and stock
    for (const item of items) {
      const product = await Product.findById(item.product)
      if (product) {
        product.stock -= item.quantity
        product.totalSales += item.quantity
        await product.save()
      }
    }

    // Update buyer's total orders
    const buyer = await User.findById(req.user._id)
    buyer.totalOrders += 1
    await buyer.save()

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.product')
      .populate('items.seller', 'name storeName')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if user is authorized to view this order
    if (
      order.buyer._id.toString() !== req.user._id.toString() &&
      !order.items.some(item => item.seller._id.toString() === req.user._id.toString()) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name images')
      .sort('-createdAt')

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get seller orders
// @route   GET /api/orders/seller
// @access  Private (Seller only)
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      'items.seller': req.user._id
    })
      .populate('buyer', 'name email')
      .populate('items.product', 'name images')
      .sort('-createdAt')

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier, note } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check authorization
    const isSeller = order.items.some(
      item => item.seller.toString() === req.user._id.toString()
    )

    if (!isSeller && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' })
    }

    order.status = status
    if (trackingNumber) order.trackingNumber = trackingNumber
    if (carrier) order.carrier = carrier

    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status}`
    })

    if (status === 'delivered') {
      order.isDelivered = true
      order.deliveredAt = Date.now()

      // Update seller's total sales
      for (const item of order.items) {
        const seller = await User.findById(item.seller)
        if (seller) {
          seller.totalSales += item.price * item.quantity
          await seller.save()
        }
      }
    }

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.email_address
    }

    order.status = 'processing'
    order.statusHistory.push({
      status: 'processing',
      note: 'Payment received, order is being processed'
    })

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

