import dotenv from 'dotenv'

dotenv.config()

console.log('\n🔍 Checking Environment Variables...\n')

console.log('PORT:', process.env.PORT || '❌ NOT SET')
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET')
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET (hidden for security)' : '❌ NOT SET')
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET')
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET')

console.log('\n')

if (!process.env.MONGODB_URI) {
  console.log('⚠️  MONGODB_URI is missing in your .env file!')
  console.log('\n📝 Your backend/.env should look like this:\n')
  console.log('PORT=5000')
  console.log('NODE_ENV=development')
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.net/shoptok')
  console.log('JWT_SECRET=your_secret_key')
  console.log('FRONTEND_URL=http://localhost:3000')
  console.log('\n')
} else {
  console.log('✅ All required variables are set!')
  console.log('You can now run: npm run dev')
  console.log('\n')
}

