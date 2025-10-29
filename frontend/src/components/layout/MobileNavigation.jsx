import { Link } from 'react-router-dom'
import { Home, Compass, ShoppingBag, User } from 'lucide-react'
import WishlistButton from './WishlistButton'

function MobileNavigation({ isAuthenticated, user, wishlistCount }) {
  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/buyer/dashboard'
    if (user.role === 'admin') return '/admin'
    if (user.role === 'seller') return '/seller/dashboard'
    return '/buyer/dashboard'
  }
  
  const getDashboardLabel = () => {
    if (isAuthenticated && user?.role === 'admin') return 'Admin'
    return 'Orders'
  }
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border z-50">
      <div className="flex items-center justify-around h-16">
        <Link to="/" className="flex flex-col items-center space-y-1 hover:text-primary transition-colors">
          <Home className="w-6 h-6" />
          <span className="text-xs">For You</span>
        </Link>
        
        <Link to="/discover" className="flex flex-col items-center space-y-1 hover:text-primary transition-colors">
          <Compass className="w-6 h-6" />
          <span className="text-xs">Discover</span>
        </Link>
        
        {/* Wishlist for Buyers (Mobile) */}
        {isAuthenticated && user?.role === 'buyer' && (
          <WishlistButton count={wishlistCount} isMobile={true} />
        )}
        
        <Link
          to={getDashboardLink()}
          className="flex flex-col items-center space-y-1 hover:text-primary transition-colors"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="text-xs">{getDashboardLabel()}</span>
        </Link>
        
        <Link
          to={isAuthenticated && user ? "/profile" : "/auth"}
          className="flex flex-col items-center space-y-1 hover:text-primary transition-colors"
        >
          {isAuthenticated && user ? (
            <>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full border border-primary"
              />
              <span className="text-xs">{user.name.split(' ')[0]}</span>
            </>
          ) : (
            <>
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  )
}

export default MobileNavigation

