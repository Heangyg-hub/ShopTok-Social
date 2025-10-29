import Comment from '../models/Comment.js'
import Product from '../models/Product.js'

// @desc    Get all comments for a product
// @route   GET /api/products/:id/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ product: req.params.id })
      .populate('user', 'name avatar')
      .sort('-createdAt')

    res.json({ comments })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a comment on a product
// @route   POST /api/products/:id/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const comment = await Comment.create({
      product: req.params.id,
      user: req.user._id,
      text: text.trim()
    })

    // Populate user info before sending
    await comment.populate('user', 'name avatar')

    // Update product's numReviews to include comments
    product.numReviews = (product.numReviews || 0) + 1
    await product.save()

    res.status(201).json({ comment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    await comment.deleteOne()

    // Decrement product's numReviews
    const product = await Product.findById(comment.product)
    if (product && product.numReviews > 0) {
      product.numReviews -= 1
      await product.save()
    }

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:commentId/like
// @access  Private
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const isLiked = comment.likes.includes(req.user._id)

    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      comment.likes.push(req.user._id)
    }

    await comment.save()

    res.json({ liked: !isLiked, likes: comment.likes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

