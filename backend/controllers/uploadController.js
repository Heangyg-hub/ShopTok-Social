import cloudinary from '../config/cloudinary.js'
import { Readable } from 'stream'

// Helper function to upload file to Cloudinary with timeout
const uploadToCloudinary = (buffer, resourceType = 'image', folder = 'shoptok') => {
  return new Promise((resolve, reject) => {
    console.log(`☁️ Uploading ${resourceType} to Cloudinary folder: ${folder}`)
    console.log(`Buffer size: ${buffer.length} bytes`)
    
    // Set timeout for upload (2 minutes for images, 5 minutes for videos)
    const timeoutDuration = resourceType === 'video' ? 300000 : 120000
    const timeout = setTimeout(() => {
      console.error('❌ Upload timeout after', timeoutDuration, 'ms')
      reject(new Error('Upload timeout - file may be too large'))
    }, timeoutDuration)
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        timeout: timeoutDuration, // Add timeout to Cloudinary config
        use_filename: true,
        unique_filename: true,
        transformation: resourceType === 'video' ? [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ] : [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        clearTimeout(timeout) // Clear timeout on completion
        if (error) {
          console.error('❌ Cloudinary upload stream error:', error)
          reject(error)
        } else {
          console.log('✅ Cloudinary upload stream successful')
          resolve(result)
        }
      }
    )

    try {
      const readableStream = new Readable()
      readableStream.push(buffer)
      readableStream.push(null)
      readableStream.pipe(uploadStream)
      
      // Handle stream errors
      readableStream.on('error', (err) => {
        clearTimeout(timeout)
        console.error('❌ Readable stream error:', err)
        reject(err)
      })
      
      uploadStream.on('error', (err) => {
        clearTimeout(timeout)
        console.error('❌ Upload stream error:', err)
        reject(err)
      })
    } catch (streamError) {
      clearTimeout(timeout)
      console.error('❌ Stream creation error:', streamError)
      reject(streamError)
    }
  })
}

// @desc    Upload product image
// @route   POST /api/upload/image
// @access  Private (Seller only)
export const uploadImage = async (req, res) => {
  try {
    console.log('📸 Image upload request received')
    console.log('File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file')
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' })
    }

    console.log('✅ File validation passed, uploading to Cloudinary...')
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'image', 'shoptok/products')

    console.log('✅ Cloudinary upload successful:', result.secure_url)

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    })
  } catch (error) {
    console.error('❌ Image upload error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    res.status(500).json({ 
      message: 'Error uploading image', 
      error: error.message,
      details: error.toString()
    })
  }
}

// @desc    Upload product video
// @route   POST /api/upload/video
// @access  Private (Seller only)
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only MP4, MOV, AVI, and WebM are allowed' })
    }

    // Check file size (max 100MB)
    if (req.file.size > 100 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large. Maximum size is 100MB' })
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'video', 'shoptok/videos')

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      thumbnail: cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 400, crop: 'fill' },
          { quality: 'auto' }
        ]
      })
    })
  } catch (error) {
    console.error('Video upload error:', error)
    res.status(500).json({ message: 'Error uploading video', error: error.message })
  }
}

