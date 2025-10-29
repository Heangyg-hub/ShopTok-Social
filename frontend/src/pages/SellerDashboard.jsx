import { useState, useEffect } from 'react'
import { Upload, Package, DollarSign, TrendingUp, Video, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../components/AuthContext'

function SellerDashboard() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [myProducts, setMyProducts] = useState([])
  
  // Form state for new product
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'electronics'
  })

  // File upload states
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [imagePreviews, setImagePreviews] = useState([])
  const [videoPreviews, setVideoPreviews] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Mock data for stats (will be replaced with real data later)
  const stats = {
    totalSales: user?.totalSales || 0,
    totalOrders: 0,
    activeProducts: myProducts.length,
    followers: user?.followers?.length || 0
  }
  
  const recentOrders = [
    { id: 'ORD-001', product: 'Wireless Headphones', customer: 'John Doe', amount: 129.99, status: 'pending', date: '2025-10-27' },
    { id: 'ORD-002', product: 'Smart Watch', customer: 'Jane Smith', amount: 299.99, status: 'shipped', date: '2025-10-26' },
    { id: 'ORD-003', product: 'Phone Case', customer: 'Bob Wilson', amount: 29.99, status: 'delivered', date: '2025-10-25' }
  ]

  // Fetch seller's products from database
  useEffect(() => {
    if (user?._id) {
      fetchMyProducts()
    }
  }, [user])

  const fetchMyProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMyProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleInputChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    })
  }

  // Image upload handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    handleImages(files)
  }

  const handleImageDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    handleImages(imageFiles)
  }

  const handleImages = (files) => {
    // Limit to 5 images
    const validFiles = files.slice(0, 5).filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB
      if (!isValid) {
        setMessage(`${file.name} is invalid. Must be image under 10MB`)
      }
      return isValid
    })

    setSelectedImages(prev => [...prev, ...validFiles].slice(0, 5))

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result].slice(0, 5))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Video upload handlers
  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleVideo(file)
    }
  }

  const handleVideoDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      handleVideo(file)
    }
  }

  const handleVideo = (file) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('video/')) {
      setMessage('Please select a valid video file')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      setMessage('Video must be under 100MB')
      return
    }

    setSelectedVideo(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setVideoPreviews(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeVideo = () => {
    setSelectedVideo(null)
    setVideoPreviews(null)
  }

  // Prevent default drag behavior
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Reset form and close modal
  const handleCloseModal = () => {
    setShowUploadModal(false)
    setEditingProduct(null)
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: 'electronics'
    })
    setSelectedImages([])
    setSelectedVideo(null)
    setImagePreviews([])
    setVideoPreviews(null)
    setMessage('')
  }

  // Open edit modal with product data
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || 'electronics'
    })
    setImagePreviews(product.images?.map(img => img.url) || [])
    setVideoPreviews(product.video?.url || null)
    setShowUploadModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setUploadProgress(0)

    try {
      // Step 1: Upload images to Cloudinary
      let uploadedImages = []
      if (selectedImages.length > 0) {
        setMessage('Uploading images...')
        console.log('📸 Uploading', selectedImages.length, 'images...')
        
        for (let i = 0; i < selectedImages.length; i++) {
          const formData = new FormData()
          formData.append('image', selectedImages[i])
          
          const imageResponse = await fetch('http://localhost:5000/api/upload/image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
            signal: AbortSignal.timeout(120000) // 2 minute timeout per image
          })
          
          if (!imageResponse.ok) {
            const errorData = await imageResponse.json()
            console.error('❌ Image upload failed:', errorData)
            throw new Error(errorData.message || 'Image upload failed')
          }
          
          const imageData = await imageResponse.json()
          console.log('Image upload response:', imageData)
          
          uploadedImages.push({
            url: imageData.url,
            publicId: imageData.publicId
          })
          console.log('✅ Image', i + 1, 'uploaded:', imageData.url)
          setUploadProgress(((i + 1) / (selectedImages.length + (selectedVideo ? 1 : 0))) * 50)
        }
        
        console.log('✅ All images uploaded:', uploadedImages)
      }

      // Step 2: Upload video to Cloudinary
      let uploadedVideo = {}
      if (selectedVideo) {
        setMessage('Uploading video...')
        console.log('🎬 Uploading video...')
        
        const formData = new FormData()
        formData.append('video', selectedVideo)
        
        const videoResponse = await fetch('http://localhost:5000/api/upload/video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          signal: AbortSignal.timeout(300000) // 5 minute timeout for video
        })
        
        if (!videoResponse.ok) {
          const errorData = await videoResponse.json()
          console.error('❌ Video upload failed:', errorData)
          throw new Error(errorData.message || 'Video upload failed')
        }
        
        const videoData = await videoResponse.json()
        console.log('Video upload response:', videoData)
        
        uploadedVideo = {
          url: videoData.url,
          publicId: videoData.publicId,
          thumbnail: videoData.thumbnail,
          duration: videoData.duration
        }
        console.log('✅ Video uploaded:', videoData.url)
        setUploadProgress(75)
      }

      // Step 3: Create or Update product with Cloudinary URLs
      if (editingProduct) {
        setMessage('Updating product...')
        console.log('📦 Updating product with:', {
          images: uploadedImages,
          video: uploadedVideo
        })
      } else {
        setMessage('Creating product...')
        console.log('📦 Creating product with:', {
          images: uploadedImages,
          video: uploadedVideo
        })
      }
      
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.category,
        images: uploadedImages.length > 0 ? uploadedImages : editingProduct?.images || [],
        video: uploadedVideo && Object.keys(uploadedVideo).length > 0 ? uploadedVideo : editingProduct?.video || null
      }
      
      console.log('Sending to backend:', productData)
      
      const method = editingProduct ? 'PUT' : 'POST'
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      })

      const data = await response.json()
      console.log('Product response:', data)
      setUploadProgress(100)

      if (response.ok) {
        setMessage(`✅ Product ${editingProduct ? 'updated' : 'created'} successfully!`)
        console.log('✅ Product saved:', data)
        handleCloseModal()
        fetchMyProducts()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || `Failed to ${editingProduct ? 'update' : 'create'} product`)
        console.error('❌ Product save failed:', data)
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message)
      console.error('❌ Full error:', error)
    }

    setLoading(false)
    setUploadProgress(0)
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage('Product deleted successfully!')
        fetchMyProducts()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await response.json()
        setMessage(data.message || 'Failed to delete product')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
      console.error('Error:', error)
    }
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-gray-400">Manage your products and track your sales</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${
            message.includes('success') || message.includes('deleted')
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message}
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Sales</p>
            <p className="text-3xl font-bold">${stats.totalSales.toLocaleString()}</p>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Active Products</p>
            <p className="text-3xl font-bold">{stats.activeProducts}</p>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Followers</p>
            <p className="text-3xl font-bold">{stats.followers.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-dark-border mb-8">
          <div className="flex space-x-8">
            {['overview', 'products', 'orders', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Orders */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-dark-border">
                      <th className="pb-4 font-semibold">Order ID</th>
                      <th className="pb-4 font-semibold">Product</th>
                      <th className="pb-4 font-semibold">Customer</th>
                      <th className="pb-4 font-semibold">Amount</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-dark-border">
                        <td className="py-4 font-mono text-sm">{order.id}</td>
                        <td className="py-4">{order.product}</td>
                        <td className="py-4">{order.customer}</td>
                        <td className="py-4 font-semibold">${order.amount}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-green-500/20 text-green-500'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-400">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Products</h2>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Product
              </button>
            </div>
            {myProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map((product) => (
                  <div key={product._id} className="card">
                    <div className="relative mb-4">
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
                      <span className={`text-sm ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>{product.totalSales || 0} sales</span>
                      <span className={`px-2 py-1 rounded capitalize ${
                        product.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="btn-secondary px-4 py-2 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Products Yet</h3>
                <p className="text-gray-400 mb-6">Start selling by creating your first product</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create First Product
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">All Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-dark-border">
                    <th className="pb-4 font-semibold">Order ID</th>
                    <th className="pb-4 font-semibold">Product</th>
                    <th className="pb-4 font-semibold">Customer</th>
                    <th className="pb-4 font-semibold">Amount</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold">Date</th>
                    <th className="pb-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-dark-border">
                      <td className="py-4 font-mono text-sm">{order.id}</td>
                      <td className="py-4">{order.product}</td>
                      <td className="py-4">{order.customer}</td>
                      <td className="py-4 font-semibold">${order.amount}</td>
                      <td className="py-4">
                        <select className="input py-1 text-sm">
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 text-gray-400">{order.date}</td>
                      <td className="py-4">
                        <button className="text-primary hover:text-primary-dark font-semibold">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Sales Analytics</h2>
              <div className="h-64 flex items-center justify-center border border-dark-border rounded-lg">
                <p className="text-gray-400">Chart visualization would go here</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Top Products</h3>
                <div className="space-y-4">
                  {myProducts.slice(0, 3).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>{product.name}</span>
                      </div>
                      <span className="font-semibold">{product.sales} sales</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Product Sales</span>
                    <span className="font-semibold">$42,345</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="font-semibold">$2,456</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Fees</span>
                    <span className="font-semibold text-red-500">-$877</span>
                  </div>
                  <div className="border-t border-dark-border pt-4 flex items-center justify-between">
                    <span className="font-semibold">Total Revenue</span>
                    <span className="text-2xl font-bold text-primary">$43,924</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Upload Product Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-dark-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-8 animate-scale-in">
            <h2 className="text-3xl font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  className="input w-full" 
                  placeholder="Enter product name" 
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Price</label>
                  <input 
                    type="number" 
                    name="price"
                    value={productForm.price}
                    onChange={handleInputChange}
                    className="input w-full" 
                    placeholder="0.00" 
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Stock</label>
                  <input 
                    type="number" 
                    name="stock"
                    value={productForm.stock}
                    onChange={handleInputChange}
                    className="input w-full" 
                    placeholder="0" 
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2">Category</label>
                <select 
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                  <option value="home">Home</option>
                  <option value="sports">Sports</option>
                  <option value="toys">Toys</option>
                  <option value="books">Books</option>
                  <option value="phones">Phones</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Description</label>
                <textarea 
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  className="input w-full h-32 resize-none" 
                  placeholder="Describe your product"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Product Images (Max 5)</label>
                <div 
                  onDrop={handleImageDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-dark-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer min-h-[200px]"
                  onClick={() => document.getElementById('imageInput').click()}
                >
                  {imagePreviews.length === 0 && !editingProduct ? (
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">Drag & drop images here or click to browse</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                    </div>
                  ) : imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {imagePreviews.length < 5 && (
                        <div className="flex items-center justify-center aspect-square border-2 border-dashed border-dark-border rounded-lg">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ) : editingProduct && imagePreviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Current product images (upload new to replace)</p>
                    </div>
                  ) : null}
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Product Video (Optional)</label>
                <div 
                  onDrop={handleVideoDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-dark-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer min-h-[200px]"
                  onClick={() => document.getElementById('videoInput').click()}
                >
                  {!videoPreviews && !editingProduct ? (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">Drag & drop video here or click to browse</p>
                      <p className="text-sm text-gray-500">MP4, MOV up to 100MB</p>
                    </div>
                  ) : videoPreviews ? (
                    <div className="relative">
                      <video
                        src={videoPreviews}
                        controls
                        className="w-full rounded-lg max-h-64"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeVideo()
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-sm hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Current product video (upload new to replace)</p>
                    </div>
                  )}
                  <input
                    id="videoInput"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Upload Progress Bar */}
              {loading && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">{message}</span>
                    <span className="text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-dark-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50"
                >
                  {loading 
                    ? (editingProduct ? 'Updating...' : 'Uploading...') 
                    : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="btn-secondary flex-1 py-3 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard

