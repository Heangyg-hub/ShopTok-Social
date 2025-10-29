import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: 500
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Reply to another comment
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  // Flag for moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String
}, {
  timestamps: true
})

// Indexes
commentSchema.index({ product: 1 })
commentSchema.index({ user: 1 })
commentSchema.index({ createdAt: -1 })

const Comment = mongoose.model('Comment', commentSchema)

export default Comment

