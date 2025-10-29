import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Feed from './pages/Feed'
import ProductDetail from './pages/ProductDetail'
import SellerDashboard from './pages/SellerDashboard'
// import BuyerDashboard from './pages/BuyerDashboard'
import Checkout from './pages/Checkout'
import AdminPanel from './pages/AdminPanel'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import MyProfile from './pages/MyProfile'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-dark-bg">
            <Routes>
              {/* Auth route without layout */}
              <Route path="/auth" element={<Auth />} />

              {/* Feed as landing page (no layout - full screen) */}
              <Route path="/" element={<Feed />} />
              
              {/* All other routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route path="discover" element={<Home />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="seller/dashboard" element={<SellerDashboard />} />
                {/* <Route path="buyer/dashboard" element={<BuyerDashboard />} /> */}
                <Route path="checkout" element={<Checkout />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="profile/:username" element={<Profile />} />
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

