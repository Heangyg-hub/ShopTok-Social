import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, ShoppingCart, X, Image, Play, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../components/AuthContext'

function VideoCard({ product, isActive, onWishlistUpdate }) {
  const { user, isAuthenticated, followUser: ctxFollowUser, unfollowUser: ctxUnfollowUser, authUpdateTrigger } = useAuth()
  const navigate = useNavigate()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(product.likes?.length || 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showProduct, setShowProduct] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [showImages, setShowImages] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  // Initialize viewMode based on whether product has video or just images
  const [viewMode, setViewMode] = useState(() => {
    // If product has video, start in video mode, otherwise start in images mode
    return (product.video && product.video.url) ? 'video' : 'images'
  })
  const videoRef = useRef(null)
  const token = localStorage.getItem('token')
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Format large numbers (1234 -> 1.2K)
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }
  
  // Check if product is in wishlist and liked on mount
  useEffect(() => {
    if (isAuthenticated && product._id) {
      checkWishlistStatus()
      checkLikeStatus()
      checkFollowStatus()
    }
  }, [isAuthenticated, product._id, user?.following, authUpdateTrigger])
  
  // Check if current user is following the seller
  const checkFollowStatus = () => {
    if (!isAuthenticated || !user?.following || !product.seller?._id) {
      setIsFollowing(false)
      return
    }
    
    const sellerId = product.seller._id
    const isCurrentUserFollowing = user.following.some(followedUser => {
      const followedUserId = typeof followedUser === 'object' ? followedUser._id : followedUser
      return followedUserId === sellerId
    })
    
    setIsFollowing(isCurrentUserFollowing)
  }
  
  // Handler for follow/unfollow
  const handleFollowToggle = async (e) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
    
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    
    if (!product.seller?._id) return
    
    setFollowLoading(true)
    
    try {
      let result
      
      if (isFollowing) {
        // Unfollow
        if (ctxUnfollowUser) {
          result = await ctxUnfollowUser(product.seller._id)
        } else {
          const response = await fetch(`http://localhost:5000/api/users/${product.seller._id}/follow`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          result = { success: response.ok }
        }
      } else {
        // Follow
        if (ctxFollowUser) {
          result = await ctxFollowUser(product.seller._id)
        } else {
          const response = await fetch(`http://localhost:5000/api/users/${product.seller._id}/follow`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          result = { success: response.ok }
        }
      }
      
      if (result.success) {
        setIsFollowing(!isFollowing)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }
  
  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/me/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const wishlist = await response.json()
      if (response.ok) {
        setIsInWishlist(wishlist.some(item => item._id === product._id))
      }
    } catch (error) {
      console.error('Error checking wishlist:', error)
    }
  }
  
  const checkLikeStatus = async () => {
    try {
      // Check if current user has liked this product
      if (product.likes && user?._id) {
        setIsLiked(product.likes.some(like => like === user._id || like._id === user._id))
      }
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }
  
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    
    setLikeLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id}/like`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Toggle like state
        setIsLiked(!isLiked)
        // Update count
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
      } else {
        console.error('Like error:', data.message)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLikeLoading(false)
    }
  }
  
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    
    setWishlistLoading(true)
    try {
      const method = isInWishlist ? 'DELETE' : 'POST'
      const response = await fetch(`http://localhost:5000/api/users/wishlist/${product._id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsInWishlist(!isInWishlist)
        if (onWishlistUpdate) onWishlistUpdate()
      } else {
        console.error('Wishlist error:', data.message)
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
    } finally {
      setWishlistLoading(false)
    }
  }
  
  useEffect(() => {
    if (product.video && product.video.url && videoRef.current && viewMode === 'video') {
      if (isActive) {
        videoRef.current.play().catch(err => console.log('Video play error:', err))
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive, viewMode, product.video])
  
  // Reset to first image when switching to image mode
  useEffect(() => {
    if (viewMode === 'images') {
      setCurrentImageIndex(0)
    }
  }, [viewMode])
  
  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  // Post comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !isAuthenticated) return

    setCommentLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      })

      if (response.ok) {
        setCommentText('')
        fetchComments()
      } else {
        const data = await response.json()
        console.error('Comment error:', data.message)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  // Check if product has video OR images
  if ((!product.video || !product.video.url) && (!product.images || product.images.length === 0)) {
    return null // Skip products without videos or images
  }

  const handleNextImage = () => {
    if (!product.images || product.images.length === 0) return
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }
  
  const handlePrevImage = () => {
    if (!product.images || product.images.length === 0) return
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }

  // Swipe gesture handlers
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    e.stopPropagation()
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // Reset state even if incomplete
      setTouchStart(null)
      setTouchEnd(null)
      return
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNextImage()
    } else if (isRightSwipe) {
      handlePrevImage()
    }
    
    // Reset state after handling
    setTouchStart(null)
    setTouchEnd(null)
  }

  const onTouchCancel = () => {
    // Reset state if touch is canceled
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Mouse drag handlers for desktop
  const onMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setTouchStart(e.clientX)
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    setTouchEnd(e.clientX)
  }

  const onMouseUp = () => {
    if (!isDragging) return
    
    if (!touchStart || !touchEnd) {
      // Reset state even if incomplete
      setIsDragging(false)
      setTouchStart(null)
      setTouchEnd(null)
      return
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNextImage()
    } else if (isRightSwipe) {
      handlePrevImage()
    }
    
    // Reset state after handling
    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-black overflow-hidden">
      {/* Video or Image View */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
      {viewMode === 'video' && product.video && product.video.url ? (
        <video
          ref={videoRef}
          src={product.video.url}
          poster={product.video.thumbnail || product.images?.[0]?.url}
          loop
          playsInline
          muted
          className="w-full h-full object-contain bg-black"
          onClick={() => videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          <img
            src={product.images?.[currentImageIndex]?.url || product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-full object-contain bg-black touch-none select-none pointer-events-auto"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => {
              setIsDragging(false)
              setTouchStart(null)
              setTouchEnd(null)
            }}
          />
          
          {/* Image Indicators */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-30">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-primary w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      </div>
      
      {/* Toggle View Button - only show if both video and images exist */}
      {product.images && product.images.length > 0 && product.video && product.video.url && (
        <button
          onClick={() => {
            const newMode = viewMode === 'video' ? 'images' : 'video'
            setViewMode(newMode)
            
            // Handle video playback
            if (newMode === 'video' && videoRef.current && isActive) {
              setTimeout(() => {
                videoRef.current?.play().catch(err => console.log('Play error:', err))
              }, 100)
            } else if (newMode === 'images' && videoRef.current) {
              videoRef.current.pause()
            }
          }}
          className="absolute top-20 right-4 z-30 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/70 transition-colors flex items-center gap-2"
        >
          {viewMode === 'video' ? (
            <>
              <Image className="w-5 h-5" />
              <span className="text-sm font-semibold">{product.images.length} Photos</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span className="text-sm font-semibold">Back to Video</span>
            </>
          )}
        </button>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none z-10" />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-20 md:pb-8 z-20 pointer-events-none">
        <div className="pointer-events-auto flex items-end justify-between">
          {/* Left Side - Product Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-3">
              <Link 
                to={`/profile/${product.seller?.name}`} 
                className="hover:opacity-90 transition-opacity"
              >
                <img
                  src={product.seller?.avatar || 'https://i.pravatar.cc/150?img=1'}
                  alt={product.seller?.name || 'Seller'}
                  className="w-12 h-12 rounded-full border-2 border-primary/50 hover:border-primary transition-all"
                />
              </Link>
              <div className='flex flex-col gap-1'>
                <Link 
                  to={`/profile/${product.seller?.name}`} 
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {product.seller?.name || 'Unknown Seller'}
                </Link>
                {user?._id !== product.seller?._id && (
                  <button 
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`text-sm font-semibold hover:underline transition-colors ${
                      isFollowing ? 'text-white' : 'text-primary'
                    } ${followLoading ? 'opacity-50' : ''}`}
                  >
                    {followLoading ? '...' : isFollowing ? 'Following' : '+ Follow'}
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold drop-shadow-lg">{product.name}</h3>
              <p className="text-gray-200 text-sm line-clamp-2 drop-shadow-md">{product.description?.slice(0, 100)}{product.description?.length > 100 ? '...' : ''}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-primary drop-shadow-lg">${product.price}</p>
                {product.stock > 0 && (
                  <span className="text-xs text-green-400 font-semibold">✓ In Stock</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowProduct(true)}
              className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Buy Now
            </button>
          </div>
          
          {/* Right Side - Actions */}
          <div className="flex flex-col items-center space-y-6 ml-4">
            {/* Like Button with Count */}
            <button 
              onClick={handleLikeToggle}
              disabled={likeLoading}
              className="flex flex-col items-center hover:scale-110 transition-transform disabled:opacity-50"
              title={isLiked ? "Unlike" : "Like this product"}
            >
              <div className="relative">
                <Heart
                  className={`w-9 h-9 drop-shadow-lg transition-all ${
                    isLiked 
                      ? 'fill-red-500 text-red-500 scale-110' 
                      : 'fill-transparent text-white'
                  } ${likeLoading ? 'animate-pulse' : ''}`}
                />
              </div>
              <span className="text-white font-bold text-base mt-1 drop-shadow-md">
                {formatCount(likeCount)}
              </span>
            </button>
            
            {/* Wishlist/Save Button */}
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className="flex flex-col items-center hover:scale-110 transition-transform disabled:opacity-50"
              title={isInWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Bookmark
                className={`w-8 h-8 ${isInWishlist ? 'fill-white text-white' : 'text-white'} ${wishlistLoading ? 'animate-pulse' : ''}`}
              />
              <span className="text-sm mt-1 font-semibold">{isInWishlist ? 'Saved' : 'Save'}</span>
            </button>
            
            {/* Comments Button */}
            <button 
              onClick={() => {
                if (isAuthenticated) {
                  setShowComments(true)
                  fetchComments()
                } else {
                  navigate('/auth')
                }
              }}
              className="flex flex-col items-center hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-8 h-8" />
              <span className="text-sm mt-1 font-semibold">{formatCount(product.numReviews || 0)}</span>
            </button>
            
            {/* Share Button */}
            <button className="flex flex-col items-center hover:scale-110 transition-transform">
              <Share2 className="w-8 h-8" />
              <span className="text-sm mt-1">Share</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 animate-fade-in">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-dark-hover rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <img
                      src={comment.user?.avatar || 'https://i.pravatar.cc/150'}
                      alt={comment.user?.name || 'User'}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-dark-card rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.user?.name || 'Anonymous'}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 ml-2">
                        <button className="text-xs text-gray-400 hover:text-primary">
                          Like ({comment.likes?.length || 0})
                        </button>
                        <button className="text-xs text-gray-400 hover:text-primary">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
            
            {/* Comment Input */}
            {isAuthenticated && (
              <form onSubmit={handleCommentSubmit} className="p-4 border-t border-dark-border bg-black/50">
                <div className="flex gap-3 items-end">
                  <img
                    src={user?.avatar || 'https://i.pravatar.cc/150'}
                    alt={user?.name || 'You'}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-primary"
                      rows={2}
                      maxLength={500}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentLoading}
                    className="px-6 py-3 bg-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-[52px]">
                  {commentText.length}/500 characters
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProduct && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-card rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[80vh] overflow-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Product Details</h2>
              <button
                onClick={() => setShowProduct(false)}
                className="hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Image Gallery */}
              {product.images && product.images.length > 0 && (
                <div>
                  <div className="relative mb-4 rounded-lg overflow-hidden bg-dark-surface">
                    <img
                      src={product.images[currentImageIndex]?.url}
                      alt={product.name}
                      className="w-full aspect-square object-contain"
                    />
                    
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {product.images.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex 
                              ? 'border-primary scale-105' 
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-400">{product.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-3xl font-bold text-primary">${product.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Stock</p>
                  <p className="font-semibold">{product.stock} available</p>
                </div>
              </div>
              
              <div className="border-t border-dark-border pt-6">
                <h4 className="font-semibold mb-4">Seller Information</h4>
                <div className="flex items-center space-x-3 mb-4">
                  <Link to={`/profile/${product.seller?.name}`}>
                    <img
                      src={product.seller?.avatar || 'https://i.pravatar.cc/150?img=1'}
                      alt={product.seller?.name || 'Seller'}
                      className="w-10 h-10 rounded-full"
                    />
                  </Link>
                  <div>
                    <Link 
                      to={`/profile/${product.seller?.name}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {product.seller?.name || 'Unknown Seller'}
                    </Link>
                    <div className="text-xs text-gray-400">
                      {product.seller?.followers?.length || 0} followers
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Category: {product.category}</p>
                  <p>• {product.rating || 0} ★ ({product.numReviews || 0} reviews)</p>
                  <p>• {product.totalSales || 0} sold</p>
                </div>
              </div>
              
              <Link
                to={`/product/${product._id}`}
                className="btn-primary w-full block text-center py-3"
              >
                View Full Details & Buy
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  
  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products')
        const data = await response.json()
        
        // Show products that have either videos OR images
        const validProducts = data.products.filter(p => 
          (p.video && p.video.url) || (p.images && p.images.length > 0)
        )
        setProducts(validProducts)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])
  
  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop
      const height = window.innerHeight
      const index = Math.round(scrollTop / height)
      setCurrentIndex(index)
    }
  }
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }
  
  if (products.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-4">No Products Yet</h2>
          <p className="text-gray-400 mb-6">Be the first to upload a product!</p>
          <Link to="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          <Link to="/discover" className="text-xl font-bold hover:text-primary transition-colors flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <span>ShopTok</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">For You</span>
            <span className="text-sm text-gray-400">({products.length})</span>
          </div>
          <Link to="/profile" className="hover:text-primary transition-colors">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Video Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="snap-y snap-mandatory h-screen overflow-y-scroll snap-container"
      >
        {products.map((product, index) => (
          <VideoCard
            key={product._id}
            product={product}
            isActive={index === currentIndex}
          />
        ))}
      </div>
      
      {/* Progress Indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-40 space-y-2">
        {products.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all ${
              index === currentIndex ? 'bg-primary' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default Feed

