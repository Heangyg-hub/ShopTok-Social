import { Link, useLocation } from 'react-router-dom'
import { Bookmark } from 'lucide-react'

function WishlistButton({ count, isMobile = false }) {
  const location = useLocation()
  
  const handleClick = () => {
    if (location.pathname === '/buyer/dashboard') {
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'wishlist' }))
    }
  }
  
  if (isMobile) {
    return (
      <Link 
        to="/buyer/dashboard"
        onClick={handleClick}
        className="flex flex-col items-center space-y-1 hover:text-primary transition-colors relative"
      >
        <Bookmark className="w-6 h-6" />
        {count > 0 && (
          <span className="absolute -top-1 right-3 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-semibold">
            {count > 9 ? '9+' : count}
          </span>
        )}
        <span className="text-xs">Saved</span>
      </Link>
    )
  }
  
  return (
    <Link 
      to="/buyer/dashboard"
      onClick={handleClick}
      className="relative hover:text-primary transition-colors"
      title="My Wishlist"
    >
      <Bookmark className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-semibold">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

export default WishlistButton

