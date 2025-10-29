import { validationResult } from 'express-validator'
import User from '../models/User.js'
import { generateToken } from '../middleware/authMiddleware.js'

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, role } = req.body

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer'
    })

    if (user) {
      // Populate following array (will be empty for new user)
      const userWithFollowing = await User.findById(user._id)
        .populate('following', '_id name avatar')
        .populate('followers', '_id name avatar')
        .select('-password')

      res.status(201).json({
        _id: userWithFollowing._id,
        name: userWithFollowing.name,
        email: userWithFollowing.email,
        role: userWithFollowing.role,
        avatar: userWithFollowing.avatar,
        bio: userWithFollowing.bio,
        location: userWithFollowing.location,
        phone: userWithFollowing.phone,
        storeName: userWithFollowing.storeName,
        following: userWithFollowing.following || [],
        followers: userWithFollowing.followers || [],
        isActive: userWithFollowing.isActive,
        isVerified: userWithFollowing.isVerified,
        token: generateToken(user._id)
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Check for user
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account has been deactivated' })
    }

    // Populate following array to send to frontend
    const userWithFollowing = await User.findById(user._id)
      .populate('following', '_id name avatar')
      .populate('followers', '_id name avatar')
      .select('-password')

    res.json({
      _id: userWithFollowing._id,
      name: userWithFollowing.name,
      email: userWithFollowing.email,
      role: userWithFollowing.role,
      avatar: userWithFollowing.avatar,
      bio: userWithFollowing.bio,
      location: userWithFollowing.location,
      phone: userWithFollowing.phone,
      storeName: userWithFollowing.storeName,
      following: userWithFollowing.following || [],
      followers: userWithFollowing.followers || [],
      isActive: userWithFollowing.isActive,
      isVerified: userWithFollowing.isVerified,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', '_id name avatar')
      .populate('following', '_id name avatar')
      .populate('wishlist')

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.name = req.body.name || user.name
      user.bio = req.body.bio || user.bio
      user.location = req.body.location || user.location
      user.phone = req.body.phone || user.phone
      user.avatar = req.body.avatar || user.avatar
      
      if (req.body.storeName) {
        user.storeName = req.body.storeName
      }

      if (req.body.password) {
        user.password = req.body.password
      }

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        location: updatedUser.location,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id)
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

