import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Calendar, Users, Package, Grid, Video, Heart, Edit, Save, X, Camera, Mail, Phone, Bookmark, ShoppingCart } from 'lucide-react'
import { useAuth } from '../components/AuthContext'

function MyProfile() {
  const { user, token, isAuthenticated, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Additional data states
  const [wishlist, setWishlist] = useState([])
  const [likedProducts, setLikedProducts] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [orders, setOrders] = useState([])
  const [userProducts, setUserProducts] = useState([])

  // Form state for editing
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    storeName: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    if (user) {
      setEditData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        storeName: user.storeName || ''
      })

      // Fetch additional data
      fetchUserData()
    }
  }, [user, isAuthenticated, navigate])

  const fetchUserData = async () => {
    try {
      // Fetch wishlist
      const wishlistResponse = await fetch('http://localhost:5000/api/users/me/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json()
        setWishlist(wishlistData)
      }

      // Fetch following
      const followingResponse = await fetch('http://localhost:5000/api/users/me/following', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (followingResponse.ok) {
        const followingData = await followingResponse.json()
        setFollowing(followingData)
      }

      // Fetch followers
      const followersResponse = await fetch('http://localhost:5000/api/users/me/followers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (followersResponse.ok) {
        const followersData = await followersResponse.json()
        setFollowers(followersData)
      }

      // Fetch orders
      const ordersResponse = await fetch('http://localhost:5000/api/orders/myorders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData)
      }

      // Fetch liked products
      const likedResponse = await fetch('http://localhost:5000/api/products?liked=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (likedResponse.ok) {
        const likedData = await likedResponse.json()
        setLikedProducts(likedData.products || [])
      }

      // Fetch user's products (if seller)
      if (user.role === 'seller') {
        const productsResponse = await fetch(`http://localhost:5000/api/products/user/${user._id}`)
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setUserProducts(productsData)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Profile updated successfully!')
        setIsEditing(false)

        // Refresh user data in AuthContext
        await refreshUser()

        // Refresh local data
        await fetchUserData()

        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || 'Failed to update profile')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    }

    setLoading(false)
  }

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || '',
      storeName: user?.storeName || ''
    })
    setIsEditing(false)
    setMessage('')
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/auth')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Header with Edit Button */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-gray-400">Manage your account settings and preferences</p>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary px-6 py-2 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary px-6 py-2 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Info Card */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-primary"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="input w-full max-w-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleInputChange}
                      className="input w-full max-w-md h-20 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editData.location}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="Phnom Penh, Cambodia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="+855 12 345 678"
                      />
                    </div>
                  </div>
                  {user.role === 'seller' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Store Name</label>
                      <input
                        type="text"
                        name="storeName"
                        value={editData.storeName}
                        onChange={handleInputChange}
                        className="input w-full max-w-md"
                        placeholder="Your Store Name"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                  <p className="text-gray-400 mb-2">{user.email}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'seller' ? 'bg-purple-500/20 text-purple-500' :
                      user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {user.role === 'seller' ? 'Seller' :
                       user.role === 'admin' ? 'Admin' : 'Buyer'}
                    </span>
                    <span className="text-sm text-gray-400">
                      Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  {user.bio && <p className="text-gray-300 mb-4">{user.bio}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.storeName && (
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{user.storeName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${
            message.includes('success') || message.includes('updated')
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-dark-border mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Grid },
              ...(user.role === 'seller' ? [{ id: 'products', label: 'My Products', icon: Package }] : []),
              { id: 'orders', label: 'My Orders', icon: Package },
              { id: 'wishlist', label: 'Saved Items', icon: Bookmark },
              { id: 'liked', label: 'Liked', icon: Heart },
              { id: 'following', label: 'Following', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 font-semibold flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold">{user.totalOrders || 0}</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Saved Items</p>
              <p className="text-3xl font-bold">{wishlist.length}</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Liked Products</p>
              <p className="text-3xl font-bold">{likedProducts.length}</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Following</p>
              <p className="text-3xl font-bold">{following.length}</p>
            </div>

            {user.role === 'seller' && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Sales</p>
                <p className="text-3xl font-bold">${user.totalSales?.toLocaleString() || '0'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-6">My Orders</h3>
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border border-dark-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={order.items?.[0]?.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                        alt="Product"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold">{order.items?.[0]?.name || 'Product'}</h4>
                        <p className="text-sm text-gray-400">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-400 capitalize">{order.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.totalPrice}</p>
                      <Link
                        to={`/product/${order.items?.[0]?.product}`}
                        className="text-primary text-sm hover:text-primary-dark"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-gray-400 mb-4">You haven't placed any orders yet.</p>
                  <Link to="/" className="btn-primary">Start Shopping</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-indigo-500" />
                Saved Items ({wishlist.length})
              </h3>
              <Link to="/buyer/dashboard" className="text-primary hover:text-primary-dark text-sm">
                View Dashboard →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.length > 0 ? (
                wishlist.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="border border-dark-border rounded-lg p-4 hover:border-primary transition-colors group relative"
                  >
                    <div className="absolute top-6 right-6 bg-indigo-500/90 backdrop-blur-sm p-1.5 rounded-lg z-10">
                      <Bookmark className="w-4 h-4 fill-white text-white" />
                    </div>
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold text-lg">${product.price}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.stock > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Items</h3>
                  <p className="text-gray-400 mb-4">Save products you love to view them later.</p>
                  <Link to="/feed" className="btn-primary">Browse Products</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                Liked Products ({likedProducts.length})
              </h3>
              <Link to="/buyer/dashboard" className="text-primary hover:text-primary-dark text-sm">
                View Dashboard →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedProducts.length > 0 ? (
                likedProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="border border-dark-border rounded-lg p-4 hover:border-primary transition-colors group relative"
                  >
                    <div className="absolute top-6 right-6 bg-red-500/90 backdrop-blur-sm p-1.5 rounded-lg z-10">
                      <Heart className="w-4 h-4 fill-white text-white" />
                    </div>
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <Heart className="w-4 h-4 fill-red-500" />
                        <span className="font-semibold">{product.likes?.length || 0}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.stock > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <p className="text-primary font-bold text-lg">${product.price}</p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Liked Products</h3>
                  <p className="text-gray-400 mb-4">Like products to see them here.</p>
                  <Link to="/feed" className="btn-primary">Discover Products</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-6">Following ({following.length})</h3>
            <div className="space-y-4">
              {following.length > 0 ? (
                following.map((followedUser) => (
                  <div key={followedUser._id} className="flex items-center justify-between p-4 border border-dark-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Link to={`/profile/${followedUser.name}`}>
                        <img
                          src={followedUser.avatar}
                          alt={followedUser.name}
                          className="w-12 h-12 rounded-full border border-primary hover:opacity-80 transition-opacity"
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/profile/${followedUser.name}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {followedUser.name}
                        </Link>
                        <p className="text-sm text-gray-400 capitalize">{followedUser.role}</p>
                        {followedUser.bio && (
                          <p className="text-sm text-gray-400">{followedUser.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {followedUser.location && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {followedUser.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Not Following Anyone</h3>
                  <p className="text-gray-400 mb-4">Follow sellers to see their latest products and updates.</p>
                  <Link to="/" className="btn-primary">Discover Sellers</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && user.role === 'seller' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">My Products ({userProducts.length})</h3>
              <Link
                to="/seller/dashboard"
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Manage Products
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.length > 0 ? (
                userProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="border border-dark-border rounded-lg p-4 hover:border-primary transition-colors group"
                  >
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-primary font-bold">${product.price}</p>
                    <p className="text-xs text-gray-400">{product.stock} in stock</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {product.likes?.length || 0} likes
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                  <p className="text-gray-400 mb-4">Start selling by uploading your first product.</p>
                  <Link
                    to="/seller/dashboard"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    Upload Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProfile

