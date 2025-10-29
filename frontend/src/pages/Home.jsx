import { Link, useNavigate } from 'react-router-dom'
import { Play, ShoppingCart, Users, TrendingUp, Package, BarChart } from 'lucide-react'
import { useAuth } from '../components/AuthContext'

function Home() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Render different CTAs based on user role
  const renderCTA = () => {
    if (!isAuthenticated) {
      // Not logged in - show default CTAs
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Start Shopping
          </Link>
          <Link to="/auth" className="btn-secondary text-lg px-8 py-3">
            Sign In / Sign Up
          </Link>
        </div>
      )
    }

    // Logged in - show role-specific CTAs
    if (user.role === 'seller') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/seller/dashboard" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Seller Dashboard
          </Link>
          <Link to="/" className="btn-secondary text-lg px-8 py-3 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Browse Feed
          </Link>
        </div>
      )
    }

    if (user.role === 'admin') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/admin" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Admin Panel
          </Link>
          <Link to="/" className="btn-secondary text-lg px-8 py-3 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Browse Feed
          </Link>
        </div>
      )
    }

    // Buyer role - show buyer dashboard and feed
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* <Link to="/buyer/dashboard" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          My Dashboard
        </Link> */}
        <Link to="/" className="btn-secondary text-lg px-8 py-3 flex items-center gap-2">
          <Play className="w-5 h-5" />
          Browse Feed
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {isAuthenticated ? (
                <>
                  Welcome back, <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>!
                </>
              ) : (
                <>
                  Shop Through{' '}
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Video
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              {isAuthenticated && user.role === 'seller' 
                ? 'Manage your products and grow your business on ShopTok'
                : isAuthenticated && user.role === 'admin'
                ? 'Monitor and manage the ShopTok platform'
                : isAuthenticated && user.role === 'buyer'
                ? 'Explore trending products, manage your orders, and discover your favorite sellers'
                : 'Discover amazing products through engaging short videos. The future of online shopping is here.'
              }
            </p>
            {renderCTA()}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why <span className="text-primary">ShopTok</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card animate-slide-up hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Video Shopping</h3>
              <p className="text-gray-400">
                See products in action through engaging short videos, just like your
                favorite social media
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingCart className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Easy Checkout</h3>
              <p className="text-gray-400">
                Buy directly from videos with our seamless checkout experience
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Social Shopping</h3>
              <p className="text-gray-400">
                Follow sellers, like products, and discover trending items from the
                community
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="card bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/50">
              <TrendingUp className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Join thousands of shoppers and sellers on ShopTok today
              </p>
              <Link to="/auth" className="btn-primary text-lg px-10 py-4 inline-block">
                Create Your Account
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* Footer */}
      <footer className="bg-dark-surface border-t border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 ShopTok. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

