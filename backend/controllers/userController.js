import User from '../models/User.js'
import Product from '../models/Product.js'

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', '_id name avatar')
      .populate('following', '_id name avatar')

    if (user) {
      // Get user's products
      const products = await Product.find({ seller: user._id, status: 'active' })
        .limit(20)
        .sort('-createdAt')

      res.json({
        user,
        products,
        stats: {
          followers: user.followers.length,
          following: user.following.length,
          products: products.length,
          totalSales: user.totalSales
        }
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user._id)

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' })
    }

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following this user' })
    }

    currentUser.following.push(req.params.id)
    userToFollow.followers.push(req.user._id)

    await currentUser.save()
    await userToFollow.save()

    res.json({ message: 'User followed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user._id)

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' })
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    )
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user._id.toString()
    )

    await currentUser.save()
    await userToUnfollow.save()

    res.json({ message: 'User unfollowed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username })
      .populate('followers', '_id name avatar')
      .populate('following', '_id name avatar')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get user's products
    const products = await Product.find({ seller: user._id, status: 'active' })
      .limit(20)
      .sort('-createdAt')

    // Remove password from response
    const { password, ...userWithoutPassword } = user.toObject()

    res.json({
      user: userWithoutPassword,
      products,
      stats: {
        followers: user.followers.length,
        following: user.following.length,
        products: products.length,
        totalSales: user.totalSales
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user's wishlist
// @route   GET /api/users/me/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist')
    res.json(user.wishlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const user = await User.findById(req.user._id)

    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' })
    }

    user.wishlist.push(req.params.productId)
    await user.save()

    res.json({ message: 'Product added to wishlist' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.productId
    )

    await user.save()

    res.json({ message: 'Product removed from wishlist' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get users I'm following
// @route   GET /api/users/me/following
// @access  Private
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'name avatar bio location role')

    res.json(user.following)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get my followers
// @route   GET /api/users/me/followers
// @access  Private
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'name avatar bio location role')

    res.json(user.followers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

