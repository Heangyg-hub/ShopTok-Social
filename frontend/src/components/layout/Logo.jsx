import { Link } from 'react-router-dom'

function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
        <span className="text-lg md:text-xl font-bold">S</span>
      </div>
      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        ShopTok
      </span>
    </Link>
  )
}

export default Logo

