import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authUpdateTrigger, setAuthUpdateTrigger] = useState(0)

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (savedToken && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setToken(savedToken)
            setUser(parsedUser)
            console.log('✅ AuthContext: User restored from localStorage', parsedUser.email)
            console.log('📋 AuthContext: User following array:', parsedUser.following)
          } catch (parseError) {
            console.warn('⚠️ AuthContext: Invalid user data in localStorage, clearing...')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } else {
          console.log('ℹ️ AuthContext: No saved authentication found')
        }
      } catch (error) {
        console.error('❌ AuthContext: Error during initialization:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
        console.log('✅ AuthContext: Initialization complete')
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ AuthContext: Login successful for', data.email)
        console.log('📋 AuthContext: Login response data:', data)
        console.log('📋 AuthContext: Following array:', data.following)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data))
        setToken(data.token)
        setUser(data)
        setAuthUpdateTrigger(prev => prev + 1) // Force re-render

        // Return navigation info based on role
        let redirectTo = '/'
        if (data.role === 'seller') {
          redirectTo = '/seller/dashboard'
        } else if (data.role === 'admin') {
          redirectTo = '/admin'
        }

        console.log('🔄 AuthContext: Redirecting to', redirectTo)
        return { success: true, data, redirectTo }
      } else {
        console.warn('❌ AuthContext: Login failed:', data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: Login network error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  const register = async (name, email, password, role = 'buyer') => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ AuthContext: Registration successful for', data.email)
        console.log('📋 AuthContext: Register response data:', data)
        console.log('📋 AuthContext: Following array:', data.following)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data))
        setToken(data.token)
        setUser(data)
        setAuthUpdateTrigger(prev => prev + 1) // Force re-render

        // Return navigation info based on role
        let redirectTo = '/'
        if (data.role === 'seller') {
          redirectTo = '/seller/dashboard'
        } else if (data.role === 'admin') {
          redirectTo = '/admin'
        }

        console.log('🔄 AuthContext: Redirecting to', redirectTo)
        return { success: true, data, redirectTo }
      } else {
        console.warn('❌ AuthContext: Registration failed:', data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: Registration network error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setAuthUpdateTrigger(prev => prev + 1) // Force re-render
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const updatedUser = await response.json()
        console.log('🔄 AuthContext: User refreshed')
        console.log('📋 AuthContext: Updated following array:', updatedUser.following)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setAuthUpdateTrigger(prev => prev + 1)
        return { success: true, user: updatedUser }
      } else {
        return { success: false, message: 'Failed to refresh user data' }
      }
    } catch (error) {
      return { success: false, message: 'Network error' }
    }
  }

  const followUser = async (userId) => {
    if (!token || !user) return { success: false, message: 'Not authenticated' }
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Update local user data to reflect the new follow
        await refreshUser()
        return { success: true, message: 'User followed successfully' }
      } else {
        return { success: false, message: data.message || 'Failed to follow user' }
      }
    } catch (error) {
      console.error('❌ AuthContext: Follow user error:', error)
      return { success: false, message: 'Network error' }
    }
  }
  
  const unfollowUser = async (userId) => {
    if (!token || !user) return { success: false, message: 'Not authenticated' }
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Update local user data to reflect the unfollow
        await refreshUser()
        return { success: true, message: 'User unfollowed successfully' }
      } else {
        return { success: false, message: data.message || 'Failed to unfollow user' }
      }
    } catch (error) {
      console.error('❌ AuthContext: Unfollow user error:', error)
      return { success: false, message: 'Network error' }
    }
  }
  
  const isFollowing = (userId) => {
    if (!user || !user.following) return false
    return user.following.some(followedUser => 
      typeof followedUser === 'object' 
        ? followedUser._id === userId 
        : followedUser === userId
    )
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    followUser,
    unfollowUser,
    isFollowing,
    isAuthenticated: !!user,
    authUpdateTrigger // For components that need to know when auth state changes
  }

  console.log('🔄 AuthContext: Providing context with state:', {
    isAuthenticated: !!user,
    hasUser: !!user,
    hasToken: !!token,
    loading,
    userRole: user?.role
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
