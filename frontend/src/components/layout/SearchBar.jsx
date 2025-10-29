import { Search } from 'lucide-react'

function SearchBar() {
  return (
    <div className="hidden md:flex flex-1 max-w-xl mx-8">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search products, sellers..."
          className="input w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>
    </div>
  )
}

export default SearchBar

