import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Share2, ShoppingCart, Star, Play, Shield, Truck, RotateCcw, Loader2 } from 'lucide-react'
import { useAuth } from '../components/AuthContext'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liking, setLiking] = useState(false)
  
  const [selectedImage, setSelectedImage] = useState(0)
  
  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (product && user) {
      const liked = product.likes?.some(like => like === user._id || like._id === user._id)
      setIsLiked(liked)
    }
  }, [product, user])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`http://localhost:5000/api/products/${id}`)
      
      if (!response.ok) {
        throw new Error('Product not found')
      }
      
      const data = await response.json()
      
      // Transform images from [{url: '...'}] to ['...']
      const images = data.images && data.images.length > 0 
        ? data.images.map(img => img.url || img) 
        : ['https://via.placeholder.com/800']
      
      // Handle video
      const videoUrl = data.video?.url
      
      // Transform specifications Map to object
      const specifications = data.specifications ? 
        Object.fromEntries(data.specifications instanceof Map ? data.specifications : Object.entries(data.specifications)) :
        {}
      
      setProduct({
        ...data,
        images,
        videoUrl,
        specifications
      })
      
      // Fetch related products from the same category
      if (data.category) {
        const relatedResponse = await fetch(`http://localhost:5000/api/products/category/${data.category}`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          // Filter out current product and limit to 4
          const filtered = relatedData
            .filter(p => p._id !== data._id)
            .slice(0, 4)
            .map(p => ({
              id: p._id,
              name: p.name,
              price: p.price,
              image: p.images?.[0]?.url || p.images?.[0] || 'https://via.placeholder.com/400'
            }))
          setRelatedProducts(filtered)
        }
      }
      
    } catch (err) {
      console.error('Error fetching product:', err)
      setError(err.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!token) {
      navigate('/auth')
      return
    }

    try {
      setLiking(true)
      const response = await fetch(`http://localhost:5000/api/products/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsLiked(data.liked)
        // Update product likes count
        setProduct(prev => ({
          ...prev,
          likes: data.liked 
            ? [...prev.likes, user._id]
            : prev.likes.filter(like => like !== user._id && like._id !== user._id)
        }))
      }
    } catch (err) {
      console.error('Error liking product:', err)
    } finally {
      setLiking(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  const handleBuyNow = () => {
    if (!token) {
      navigate('/auth')
      return
    }
    
    const cartItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: selectedQuantity,
      image: product.images[0]
    }
    
    localStorage.setItem('checkoutItem', JSON.stringify(cartItem))
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Product not found'}</p>
          <button onClick={() => navigate('/feed')} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link> / 
          <Link to="/feed" className="hover:text-primary"> Products</Link> / 
          <span className="text-white"> {product.name}</span>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Images & Video */}
          <div>
            {/* Main Image/Video */}
            <div className="relative mb-4 rounded-2xl overflow-hidden bg-dark-card aspect-square">
              {selectedImage === 'video' ? (
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {product.videoUrl && (
                <button
                  onClick={() => setSelectedImage('video')}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === 'video' ? 'border-primary' : 'border-dark-border'
                  } hover:border-primary transition-colors`}
                >
                  <video src={product.videoUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-6 h-6" />
                  </div>
                </button>
              )}
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-dark-border'
                  } hover:border-primary transition-colors`}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Right - Product Info */}
          <div className="space-y-6">
            {/* Seller Info */}
            {product.seller && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${product.seller._id || product.seller.name}`} className="hover:opacity-90 transition-opacity">
                    <img
                      src={product.seller.avatar || 'https://i.pravatar.cc/150'}
                      alt={product.seller.name || product.seller.storeName}
                      className="w-12 h-12 rounded-full"
                    />
                  </Link>
                  <div>
                    <Link 
                      to={`/profile/${product.seller._id || product.seller.name}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {product.seller.storeName || product.seller.name}
                    </Link>
                    {product.rating > 0 && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {product.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
                <button className="btn-secondary py-2">Follow</button>
              </div>
            )}
            
            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-2 font-semibold">{product.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-400 ml-1">({product.numReviews || 0} reviews)</span>
                </div>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            
            {/* Description */}
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
            
            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="w-10 h-10 border border-dark-border rounded-lg hover:border-primary transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{selectedQuantity}</span>
                  <button
                    onClick={() => setSelectedQuantity(Math.min(product.stock || 1, selectedQuantity + 1))}
                    className="w-10 h-10 border border-dark-border rounded-lg hover:border-primary transition-colors"
                    disabled={!product.stock || selectedQuantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">Stock: {product.stock || 0}</p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleBuyNow}
                  className="btn-primary flex-1 py-4 text-lg"
                  disabled={!product.stock || product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  {product.stock && product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                </button>
                <button
                  onClick={handleLike}
                  className={`btn-secondary px-6 ${isLiked ? 'bg-red-500/20 border-red-500' : ''} disabled:opacity-50`}
                  disabled={liking}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="btn-secondary px-6"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="border-t border-dark-border pt-6">
                <h3 className="font-semibold mb-4">Key Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-dark-border">
              <div className="text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Secure Payment</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Fast Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">30-Day Returns</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-12 card">
            <h2 className="text-2xl font-bold mb-6">Specifications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b border-dark-border">
                  <span className="text-gray-400">{key}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="card hover:scale-105 transition-transform"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail

