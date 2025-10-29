import { Link } from 'react-router-dom'
import { ShoppingBag, LogOut } from 'lucide-react'

function UserMenu({ user, onLogout }) {
  const getDashboardLink = () => {
    if (user.role === 'admin') return '/admin'
    if (user.role === 'seller') return '/seller/dashboard'
    return '/buyer/dashboard'
  }
  
  return (
    <>
      <Link
        to={getDashboardLink()}
        className="hover:text-primary transition-colors"
      >
        <ShoppingBag className="w-6 h-6" />
      </Link>
      <Link
        to="/profile"
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full border-2 border-primary"
        />
        <div className="hidden md:block">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user.role}</p>
        </div>
      </Link>
      <button
        onClick={onLogout}
        className="text-gray-400 hover:text-white transition-colors"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </>
  )
}

export default UserMenu

