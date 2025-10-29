# Layout Components

This folder contains modular, reusable components for the application layout.

## Component Structure

```
layout/
├── Header.jsx              # Main header wrapper
├── Logo.jsx               # ShopTok logo component
├── SearchBar.jsx          # Search input with icon
├── DesktopNavigation.jsx  # Desktop navigation menu
├── MobileNavigation.jsx   # Mobile bottom navigation
├── UserMenu.jsx           # User profile menu & logout
├── WishlistButton.jsx     # Wishlist icon with counter
└── NotificationButton.jsx # Notification bell with counter
```

## Component Details

### Header.jsx
Main header component that combines Logo, SearchBar, and DesktopNavigation.

**Props:**
- `isAuthenticated` (boolean)
- `user` (object)
- `wishlistCount` (number)
- `onLogout` (function)

### Logo.jsx
Displays the ShopTok logo and links to homepage.

**Props:** None

### SearchBar.jsx
Search input field (hidden on mobile).

**Props:** None (can be extended for search functionality)

### DesktopNavigation.jsx
Navigation items for desktop view, shows different options based on auth status.

**Props:**
- `isAuthenticated` (boolean)
- `user` (object)
- `wishlistCount` (number)
- `onLogout` (function)

### MobileNavigation.jsx
Bottom navigation bar for mobile devices.

**Props:**
- `isAuthenticated` (boolean)
- `user` (object)
- `wishlistCount` (number)

### UserMenu.jsx
User profile display with avatar, name, role, and logout button.

**Props:**
- `user` (object): { avatar, name, role }
- `onLogout` (function)

### WishlistButton.jsx
Reusable wishlist/bookmark button with notification badge.

**Props:**
- `count` (number): Number of items in wishlist
- `isMobile` (boolean): Whether to show mobile or desktop version

### NotificationButton.jsx
Bell icon with notification counter.

**Props:**
- `count` (number): Number of notifications (default: 3)

## Benefits of This Structure

✅ **Modular**: Each component has a single responsibility
✅ **Reusable**: Components can be used in different contexts
✅ **Maintainable**: Easy to find and update specific features
✅ **Testable**: Small components are easier to test
✅ **Scalable**: Easy to add new features without bloating files

## Usage Example

```jsx
import Header from './layout/Header'
import MobileNavigation from './layout/MobileNavigation'

function Layout() {
  return (
    <div>
      <Header 
        isAuthenticated={true}
        user={userData}
        wishlistCount={5}
        onLogout={handleLogout}
      />
      <main>{children}</main>
      <MobileNavigation 
        isAuthenticated={true}
        user={userData}
        wishlistCount={5}
      />
    </div>
  )
}
```

## Future Enhancements

- Add search functionality to SearchBar
- Make notification count dynamic
- Add dropdown menus to UserMenu
- Add category filters to SearchBar
- Implement notification panel

