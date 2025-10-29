import Logo from './Logo'
import SearchBar from './SearchBar'
import DesktopNavigation from './DesktopNavigation'

function Header({ isAuthenticated, user, wishlistCount, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-lg border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <SearchBar />
          <nav className="hidden md:flex items-center space-x-6">
            <DesktopNavigation 
              isAuthenticated={isAuthenticated}
              user={user}
              wishlistCount={wishlistCount}
              onLogout={onLogout}
            />
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

