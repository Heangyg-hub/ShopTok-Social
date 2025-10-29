import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Calendar, Users, Package, Grid, Video, Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react'
import { useAuth } from '../components/AuthContext'
import FollowList from '../components/FollowList'

function Profile() {
  const { username } = useParams()
  const { user: currentUser, isAuthenticated, followUser: ctxFollowUser, unfollowUser: ctxUnfollowUser, refreshUser: ctxRefreshUser, isFollowing: checkIsFollowing, authUpdateTrigger } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/username/${username}`)
        const data = await response.json()

        if (response.ok) {
          setProfileData(data)
        } else {
          console.error('Profile not found')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfile()
    }
  }, [username])

  // Check if current user is following this profile
  useEffect(() => {
    if (isAuthenticated && currentUser && profileData?.user?._id) {
      // Check if the profile user ID is in current user's following array
      const profileUserId = profileData.user._id
      const isCurrentUserFollowing = currentUser.following?.some(followedUser => {
        // Handle both object and string formats
        const followedUserId = typeof followedUser === 'object' ? followedUser._id : followedUser
        return followedUserId === profileUserId
      }) || false
      
      setIsFollowing(isCurrentUserFollowing)
      
      console.log('🔍 Follow Check:', {
        profileUserId,
        profileUserName: profileData.user.name,
        currentUserId: currentUser._id,
        currentUserName: currentUser.name,
        followingArray: currentUser.following,
        followingArrayLength: currentUser.following?.length || 0,
        isFollowing: isCurrentUserFollowing
      })
    } else {
      setIsFollowing(false)
    }
  }, [currentUser, profileData, isAuthenticated, authUpdateTrigger])

  const handleFollow = async () => {
    if (!isAuthenticated || !profileData?.user?._id) return
    
    setFollowLoading(true)
    
    try {
      let result;
      
      if (isFollowing) {
        // Unfollow the user
        if (ctxUnfollowUser) {
          result = await ctxUnfollowUser(profileData.user._id)
        } else {
          // Fallback to direct API call
          const response = await fetch(`http://localhost:5000/api/users/${profileData.user._id}/follow`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          result = { success: response.ok }
        }
      } else {
        // Follow the user
        if (ctxFollowUser) {
          result = await ctxFollowUser(profileData.user._id)
        } else {
          // Fallback to direct API call
          const response = await fetch(`http://localhost:5000/api/users/${profileData.user._id}/follow`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          result = { success: response.ok }
        }
      }

      if (result.success) {
        // Update the follow state immediately
        setIsFollowing(!isFollowing)

        // Update followers count
        if (profileData) {
          setProfileData({
            ...profileData,
            stats: {
              ...profileData.stats,
              followers: isFollowing
                ? profileData.stats.followers - 1
                : profileData.stats.followers + 1
            }
          })
        }

        // Refresh user data to update following array
        if (ctxRefreshUser) {
          await ctxRefreshUser()
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Profile not found</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  const profile = profileData.user
  const stats = profileData.stats
  const products = profileData.products || []
  
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Cover Image */}
      <div className="relative h-64 bg-dark-card">
        <img
          src={profile.avatar || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'}
          alt="Cover"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-bg" />
      </div>
      
      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 mb-8">
            {/* Mobile: Flex container with justify-between */}
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
              {/* Avatar Container - Mobile: flex with justify-between */}
              <div className="flex items-center justify-between md:block md:pb-8">
                <div>
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-dark-bg shadow-2xl"
                  />
                </div>
                
                {/* Actions - Mobile only, positioned next to avatar */}
                <div className="flex space-x-4 md:hidden">
                  {isAuthenticated && currentUser && currentUser._id !== profile._id && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`${
                        isFollowing ? 'btn-secondary' : 'btn-primary'
                      } px-4 py-2 flex items-center gap-2 text-sm`}
                    >
                      {followLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                        </>
                      ) : (
                        <>
                          {isFollowing ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                          {isFollowing ? 'Following' : 'Follow'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 mt-4 md:mt-0">
              <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
              <p className="text-gray-400 mb-2">@{profile.name}</p>
              {profile.bio && <p className="text-lg mb-4 max-w-2xl">{profile.bio}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                {profile.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                {profile.storeName && (
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>{profile.storeName}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <button 
                  onClick={() => setShowFollowersModal(true)}
                  className="hover:bg-dark-hover px-2 py-1 rounded-md transition-colors"
                >
                  <span className="font-bold text-xl">{stats.followers.toLocaleString()}</span>
                  <span className="text-gray-400 ml-2">Followers</span>
                </button>
                <button 
                  onClick={() => setShowFollowingModal(true)}
                  className="hover:bg-dark-hover px-2 py-1 rounded-md transition-colors"
                >
                  <span className="font-bold text-xl">{stats.following.toLocaleString()}</span>
                  <span className="text-gray-400 ml-2">Following</span>
                </button>
                <div>
                  <span className="font-bold text-xl">{stats.products}</span>
                  <span className="text-gray-400 ml-2">Products</span>
                </div>
              </div>
            </div>

            {/* Actions - Desktop only */}
            <div className="hidden md:flex space-x-4">
              {isAuthenticated && currentUser && currentUser._id !== profile._id && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`${
                    isFollowing ? 'btn-secondary' : 'btn-primary'
                  } px-8 py-3 flex items-center gap-2 relative`}
                >
                  {followLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2">{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                    </>
                  ) : (
                    <>
                      {isFollowing ? (
                        <UserCheck className="w-5 h-5" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                      {isFollowing ? 'Following' : 'Follow'}
                    </>
                  )}
                </button>
              )}
              
              {/* Show Edit Profile button only when viewing own profile */}
              {isAuthenticated && currentUser && currentUser._id === profile._id && (
                <Link
                  to="/my-profile"
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Edit Profile
                </Link>
              )}

              {isAuthenticated && currentUser && currentUser._id !== profile._id && (
                <button className="btn-secondary px-6 py-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Message
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-dark-border mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-4 px-1 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'products'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-5 h-5" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-4 px-1 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'videos'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-5 h-5" />
              Videos
            </button>
          </div>
        </div>
        
        {/* Products Grid */}
        {(() => {
          // Filter products based on active tab
          const filteredProducts = products.filter(product => {
            if (activeTab === 'products') {
              // Show products with images (even if they also have videos)
              return product.images && product.images.length > 0
            } else if (activeTab === 'videos') {
              // Show only products with videos
              return product.video && product.video.url
            }
            return true
          })

          return filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group"
              >
                <div className="relative mb-4 rounded-xl overflow-hidden aspect-square">
                  <img
                    src={activeTab === 'videos' && product.video?.thumbnail 
                      ? product.video.thumbnail 
                      : product.images?.[0]?.url || product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {product.video && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Video className="w-8 h-8" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-white" />
                      {product.likes?.length || 0}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-primary font-bold">${product.price}</p>
                <p className="text-xs text-gray-400">{product.stock} in stock</p>
              </Link>
              ))}
            </div>
          ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-gray-400 mb-6">
              {profile.role === 'seller'
                ? `${profile.name} hasn't uploaded any products yet.`
                : 'No products found.'}
            </p>
          </div>
          )
        })()}
      </div>

      {/* Followers Modal */}
      {showFollowersModal && profile.followers && (
        <FollowList 
          users={profile.followers}
          type="followers"
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {/* Following Modal */}
      {showFollowingModal && profile.following && (
        <FollowList 
          users={profile.following}
          type="following"
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  )
}

export default Profile

