import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Check, Lock } from 'lucide-react'

function Checkout() {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [orderPlaced, setOrderPlaced] = useState(false)
  
  // Mock cart items
  const cartItems = [
    {
      id: 1,
      name: 'Wireless Headphones Pro',
      price: 129.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'
    }
  ]
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 9.99
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax
  
  const handlePlaceOrder = (e) => {
    e.preventDefault()
    setOrderPlaced(true)
    setTimeout(() => {
      navigate('/buyer/dashboard')
    }, 3000)
  }
  
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for your order. You'll receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/buyer/dashboard')}
            className="btn-primary w-full py-3"
          >
            View My Orders
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">First Name</label>
                    <input type="text" className="input w-full" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Last Name</label>
                    <input type="text" className="input w-full" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input type="email" className="input w-full" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input type="tel" className="input w-full" placeholder="+855 12 345 678" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Address</label>
                  <input type="text" className="input w-full" placeholder="123 Main Street, Apt 4B" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">City</label>
                    <input type="text" className="input w-full" placeholder="Phnom Penh" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Postal Code</label>
                    <input type="text" className="input w-full" placeholder="12000" />
                  </div>
                </div>
              </form>
            </div>
            
            {/* Payment Method */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              
              <div className="space-y-4 mb-6">
                {/* Credit Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 border-2 rounded-lg transition-colors flex items-center space-x-4 ${
                    paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-dark-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-primary' : 'border-dark-border'
                  }`}>
                    {paymentMethod === 'card' && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <CreditCard className="w-6 h-6" />
                  <span className="font-semibold">Credit/Debit Card</span>
                </button>
                
                {/* ABA Pay */}
                <button
                  onClick={() => setPaymentMethod('aba')}
                  className={`w-full p-4 border-2 rounded-lg transition-colors flex items-center space-x-4 ${
                    paymentMethod === 'aba' ? 'border-primary bg-primary/10' : 'border-dark-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'aba' ? 'border-primary' : 'border-dark-border'
                  }`}>
                    {paymentMethod === 'aba' && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <Smartphone className="w-6 h-6" />
                  <span className="font-semibold">ABA Pay</span>
                </button>
                
                {/* Bakong KHQR */}
                <button
                  onClick={() => setPaymentMethod('khqr')}
                  className={`w-full p-4 border-2 rounded-lg transition-colors flex items-center space-x-4 ${
                    paymentMethod === 'khqr' ? 'border-primary bg-primary/10' : 'border-dark-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'khqr' ? 'border-primary' : 'border-dark-border'
                  }`}>
                    {paymentMethod === 'khqr' && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <Smartphone className="w-6 h-6" />
                  <span className="font-semibold">Bakong KHQR</span>
                </button>
              </div>
              
              {paymentMethod === 'card' && (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Card Number</label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                      <input type="text" className="input w-full" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">CVV</label>
                      <input type="text" className="input w-full" placeholder="123" />
                    </div>
                  </div>
                </form>
              )}
              
              {paymentMethod === 'aba' && (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    You'll be redirected to ABA Pay to complete your payment
                  </p>
                </div>
              )}
              
              {paymentMethod === 'khqr' && (
                <div className="text-center py-8">
                  <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <p className="text-black text-sm">KHQR Code Here</p>
                  </div>
                  <p className="text-gray-400">Scan this QR code with your banking app</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{item.name}</p>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${item.price}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 py-6 border-t border-dark-border">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-dark-border">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Place Order
              </button>
              
              <p className="text-center text-sm text-gray-400 mt-4">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

