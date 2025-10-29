// Load environment variables FIRST (before any imports that use them)
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './config/database.js'
import { errorHandler } from './middleware/errorMiddleware.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

// Connect to database
connectDB()

// Initialize Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(morgan('dev'))

// Increase server timeout for large file uploads
app.use((req, res, next) => {
  req.setTimeout(600000) // 10 minutes
  res.setTimeout(600000) // 10 minutes
  next()
})

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ShopTok API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      upload: '/api/upload',
      admin: '/api/admin'
    }
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

