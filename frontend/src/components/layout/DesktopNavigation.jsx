import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import WishlistButton from './WishlistButton'
import NotificationButton from './NotificationButton'
import UserMenu from './UserMenu'

function DesktopNavigation({ isAuthenticated, user, wishlistCount, onLogout }) {
  if (!isAuthenticated || !user) {
    // Not logged in
    return (
      <>
        <NotificationButton />
        <Link to="/buyer/dashboard" className="hover:text-primary transition-colors">
          <ShoppingBag className="w-6 h-6" />
        </Link>
        <Link to="/auth" className="btn-primary">
          Sign In
        </Link>
      </>
    )
  }
  
  // Logged in user
  return (
    <>
      {/* Wishlist for Buyers */}
      {user.role === 'buyer' && (
        <WishlistButton count={wishlistCount} />
      )}
      
      <NotificationButton />
      <UserMenu user={user} onLogout={onLogout} />
    </>
  )
}

export default DesktopNavigation

