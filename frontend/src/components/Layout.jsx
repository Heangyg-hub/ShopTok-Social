import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Header from './layout/Header'
import MobileNavigation from './layout/MobileNavigation'

function Layout() {
  const { user, logout, isAuthenticated, authUpdateTrigger } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [wishlistCount, setWishlistCount] = useState(0)
  const token = localStorage.getItem('token')
  
  // Fetch wishlist count
  useEffect(() => {
    if (isAuthenticated && user?.role === 'buyer') {
      fetchWishlistCount()
    }
  }, [isAuthenticated, user, location.pathname])
  
  const fetchWishlistCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/me/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const wishlist = await response.json()
      if (response.ok) {
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0)
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Hide layout on full-screen pages
  const isFullScreen = location.pathname === '/feed'

  // Force re-render when auth state changes
  useEffect(() => {
    // This effect runs when authUpdateTrigger changes
    // No need to do anything, just forces re-render
  }, [authUpdateTrigger])

  if (isFullScreen) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAuthenticated={isAuthenticated}
        user={user}
        wishlistCount={wishlistCount}
        onLogout={handleLogout}
      />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <MobileNavigation 
        isAuthenticated={isAuthenticated}
        user={user}
        wishlistCount={wishlistCount}
      />
    </div>
  )
}

export default Layout

