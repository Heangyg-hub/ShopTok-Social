import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ShoppingBag, Users, Store } from 'lucide-react'
import { useAuth } from '../components/AuthContext'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  // Try to use AuthContext, but handle errors gracefully
  let authData
  try {
    authData = useAuth()
  } catch (error) {
    // Fallback if AuthContext is not available
    console.error('❌ AuthContext not available:', error.message)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-dark-card p-8 rounded-lg border border-dark-border">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p className="text-gray-400 mb-6">
              The authentication system is not properly initialized. This might be due to:
            </p>
            <ul className="text-sm text-gray-400 text-left mb-6 space-y-1">
              <li>• Missing AuthProvider in the component tree</li>
              <li>• Backend server not running</li>
              <li>• Network connectivity issues</li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                Reload Application
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary w-full"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { login, register, isAuthenticated, user, loading: authLoading } = authData

  // Show loading while AuthContext is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        // Login using AuthContext
        const result = await login(formData.email, formData.password)

        if (result.success) {
          setMessage('Login successful!')

          // Navigate based on role
          if (result.redirectTo) {
            navigate(result.redirectTo)
          } else {
            navigate('/')
          }
        } else {
          setMessage(result.message || 'Login failed')
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setMessage('Passwords do not match')
          setLoading(false)
          return
        }

        const result = await register(formData.name, formData.email, formData.password, formData.role)

        if (result.success) {
          setMessage('Account created successfully!')

          // Navigate based on role
          if (result.redirectTo) {
            navigate(result.redirectTo)
          } else {
            navigate('/')
          }
        } else {
          setMessage(result.message || 'Registration failed')
        }
      }
    } catch (error) {
      setMessage('Network error. Please check if backend is running.')
    }

    setLoading(false)
  }

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    // Redirect based on role
    let redirectTo = '/'
    if (user.role === 'seller') {
      redirectTo = '/seller/dashboard'
    } else if (user.role === 'admin') {
      redirectTo = '/admin'
    }

    navigate(redirectTo)
    return null
  }

  // If auth is still loading, don't render anything
  if (authLoading) {
    return null
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 blur-3xl"></div>
      
      <div className="relative max-w-md w-full">
        <div className="card">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ShopTok
            </span>
          </Link>
          
          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 font-semibold rounded-lg transition-colors ${
                isLogin ? 'bg-primary text-white' : 'bg-dark-surface text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 font-semibold rounded-lg transition-colors ${
                !isLogin ? 'bg-primary text-white' : 'bg-dark-surface text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input w-full pl-10"
                    placeholder="John Doe"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input w-full pl-10"
                  placeholder="john@example.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input w-full pl-10"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input w-full pl-10"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2">I am a:</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.role === 'buyer'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-dark-border hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={formData.role === 'buyer'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Buyer</span>
                  </label>
                  <label className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.role === 'seller'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-dark-border hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="seller"
                      checked={formData.role === 'seller'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <Store className="w-5 h-5" />
                    <span className="font-semibold">Seller</span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formData.role === 'buyer' ? 'Browse and purchase products' : 'Sell products and manage your store'}
                </p>
              </div>
            )}
            
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-400">Remember me</span>
                </label>
                <button type="button" className="text-primary hover:text-primary-dark">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successful') || message.includes('created')
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-dark-border"></div>
            <span className="px-4 text-sm text-gray-400">or continue with</span>
            <div className="flex-1 border-t border-dark-border"></div>
          </div>
          
          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-secondary py-3 flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
            <button className="btn-secondary py-3 flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>
          
          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <button className="text-primary hover:text-primary-dark">Terms of Service</button>
            {' '}and{' '}
            <button className="text-primary hover:text-primary-dark">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth

