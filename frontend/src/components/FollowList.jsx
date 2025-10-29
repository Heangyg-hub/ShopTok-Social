import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, UserCheck, X } from 'lucide-react'
import { useAuth } from './AuthContext'

function FollowList({ users, type, onClose }) {
  const { user: currentUser, isAuthenticated, followUser, unfollowUser, isFollowing } = useAuth()
  const [followLoading, setFollowLoading] = useState({})

  const handleFollowToggle = async (userId) => {
    if (!isAuthenticated || userId === currentUser?._id) return
    
    // Set loading state for this specific user
    setFollowLoading(prev => ({ ...prev, [userId]: true }))
    
    try {
      const isCurrentlyFollowing = isFollowing(userId)
      
      if (isCurrentlyFollowing) {
        await unfollowUser(userId)
      } else {
        await followUser(userId)
      }
    } catch (error) {
      console.error('Error toggling follow status:', error)
    } finally {
      // Clear loading state
      setFollowLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-dark-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{type === 'followers' ? 'Followers' : 'Following'}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {users && users.length > 0 ? (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user._id} className="flex items-center justify-between">
                <Link 
                  to={`/user/${user.name}`} 
                  className="flex items-center space-x-3 flex-1"
                  onClick={onClose}
                >
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-400 truncate max-w-[200px]">{user.bio}</p>
                    )}
                  </div>
                </Link>
                
                {isAuthenticated && currentUser && currentUser._id !== user._id && (
                  <button
                    onClick={() => handleFollowToggle(user._id)}
                    disabled={followLoading[user._id]}
                    className={`${
                      isFollowing(user._id) 
                        ? 'btn-secondary text-sm' 
                        : 'btn-primary text-sm'
                    } px-3 py-1.5 flex items-center gap-1.5`}
                  >
                    {followLoading[user._id] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isFollowing(user._id) ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {type === 'followers' 
                ? 'No followers yet' 
                : 'Not following anyone yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FollowList
