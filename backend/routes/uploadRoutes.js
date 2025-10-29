import express from 'express'
import multer from 'multer'
import { uploadImage, uploadVideo } from '../controllers/uploadController.js'
import { protect, seller } from '../middleware/authMiddleware.js'

const router = express.Router()

// Multer configuration
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
})

// @route   POST /api/upload/image
// @desc    Upload product image
// @access  Private (Seller only)
router.post('/image', protect, seller, upload.single('image'), uploadImage)

// @route   POST /api/upload/video
// @desc    Upload product video
// @access  Private (Seller only)
router.post('/video', protect, seller, upload.single('video'), uploadVideo)

export default router

