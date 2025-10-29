import { useState } from 'react'
import { Users, Package, DollarSign, AlertTriangle, Search, MoreVertical, Ban, CheckCircle } from 'lucide-react'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Mock data
  const stats = {
    totalUsers: 15234,
    totalProducts: 2345,
    totalRevenue: 456789,
    flaggedContent: 23
  }
  
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'buyer', status: 'active', joined: '2025-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'seller', status: 'active', joined: '2025-02-20' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'buyer', status: 'suspended', joined: '2025-03-10' }
  ]
  
  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      seller: 'TechGear',
      price: 129.99,
      status: 'active',
      sales: 234,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
    },
    {
      id: 2,
      name: 'Smart Watch',
      seller: 'WearableTech',
      price: 299.99,
      status: 'active',
      sales: 156,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
    },
    {
      id: 3,
      name: 'Suspicious Product',
      seller: 'FakeStore',
      price: 9.99,
      status: 'flagged',
      sales: 2,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100'
    }
  ]
  
  const flaggedContent = [
    {
      id: 1,
      type: 'product',
      title: 'Suspicious Product',
      reporter: 'user123',
      reason: 'Counterfeit goods',
      date: '2025-10-27',
      status: 'pending'
    },
    {
      id: 2,
      type: 'comment',
      title: 'Inappropriate comment on...',
      reporter: 'user456',
      reason: 'Spam',
      date: '2025-10-26',
      status: 'pending'
    }
  ]
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage users, products, and platform content</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
          </div>
          
          <div className="card">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold">{stats.totalProducts.toLocaleString()}</p>
          </div>
          
          <div className="card">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
          </div>
          
          <div className="card">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Flagged Content</p>
            <p className="text-3xl font-bold">{stats.flaggedContent}</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-dark-border mb-8">
          <div className="flex space-x-8">
            {['dashboard', 'users', 'products', 'flagged'].map((tab) => (
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
        
        {/* Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
              <div className="h-64 border border-dark-border rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Analytics charts would be displayed here</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-dark-border">
                    <span className="text-sm">New user registered</span>
                    <span className="text-xs text-gray-400">2m ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dark-border">
                    <span className="text-sm">Product reported</span>
                    <span className="text-xs text-gray-400">15m ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dark-border">
                    <span className="text-sm">New order placed</span>
                    <span className="text-xs text-gray-400">1h ago</span>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="btn-secondary w-full py-2 text-left">
                    Export User Data
                  </button>
                  <button className="btn-secondary w-full py-2 text-left">
                    Generate Revenue Report
                  </button>
                  <button className="btn-secondary w-full py-2 text-left">
                    Review Pending Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Users</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-dark-border">
                    <th className="pb-4 font-semibold">User</th>
                    <th className="pb-4 font-semibold">Email</th>
                    <th className="pb-4 font-semibold">Role</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold">Joined</th>
                    <th className="pb-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-dark-border">
                      <td className="py-4 font-semibold">{user.name}</td>
                      <td className="py-4 text-gray-400">{user.email}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400">{user.date}</td>
                      <td className="py-4">
                        <button className="hover:text-primary transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Products</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-dark-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-400">by {product.seller}</p>
                      <p className="text-sm text-gray-400">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-bold text-primary">${product.price}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {product.status === 'flagged' && (
                        <>
                          <button className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </button>
                          <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                            <Ban className="w-5 h-5 text-red-500" />
                          </button>
                        </>
                      )}
                      <button className="hover:text-primary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'flagged' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Flagged Content</h2>
            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <div key={item.id} className="p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-semibold">
                          {item.type}
                        </span>
                        <span className="text-sm text-gray-400">{item.date}</span>
                      </div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400">Reported by {item.reporter}</p>
                      <p className="text-sm text-gray-400">Reason: {item.reason}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button className="btn-secondary py-2 px-4 text-sm">
                      Review
                    </button>
                    <button className="bg-green-500/20 text-green-500 hover:bg-green-500/30 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                      Approve
                    </button>
                    <button className="bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel

