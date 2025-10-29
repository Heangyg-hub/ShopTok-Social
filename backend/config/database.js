import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.error(`❌ Error: MONGODB_URI is not defined in .env file`)
      console.log('\n📝 To fix this:')
      console.log('1. Create backend/.env file')
      console.log('2. Add: MONGODB_URI=mongodb://localhost:27017/shoptok')
      console.log('   OR use MongoDB Atlas: mongodb+srv://user:pass@cluster.net/shoptok')
      console.log('\n💡 Using local fallback for now...\n')
      
      // Use local MongoDB as fallback
      process.env.MONGODB_URI = 'mongodb://localhost:27017/shoptok'
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`)
    console.log('\n⚠️  Options to fix:')
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community')
    console.log('2. Use MongoDB Atlas (FREE): https://www.mongodb.com/cloud/atlas')
    console.log('3. Or run mock server: npm run dev:mock\n')
    process.exit(1)
  }
}

export default connectDB

