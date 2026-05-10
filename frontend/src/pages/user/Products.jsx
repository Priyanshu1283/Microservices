import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Link, useSearchParams } from 'react-router-dom'
import { Star, Filter, SlidersHorizontal, ChevronDown, Search } from 'lucide-react'

export function Products() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const categoryParam = searchParams.get('category') || 'All'
  
  const [activeCategory, setActiveCategory] = useState(categoryParam)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [ratingFilter, setRatingFilter] = useState(0)

  // Update activeCategory when URL param changes
  React.useEffect(() => {
    setActiveCategory(categoryParam)
  }, [categoryParam])

  const { data, isLoading } = useQuery({
    queryKey: ['products', activeCategory, q, minPrice, maxPrice, ratingFilter],
    queryFn: async () => {
      const response = await api.get('/products', {
        params: { 
          category: activeCategory,
          q: q,
          minprice: minPrice,
          maxprice: maxPrice,
          rating: ratingFilter
        }
      })
      return response.data
    }
  })

  const products = data?.data || []
  const filteredProducts = products

  const categories = ['All', 'Mobiles', 'Fashion', 'Electronics', 'Home', 'Appliances']

  const clearFilters = () => {
    setActiveCategory('All')
    setMinPrice('')
    setMaxPrice('')
    setRatingFilter(0)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-6">
        <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h3>
            <Button variant="ghost" size="sm" className="text-primary text-xs font-bold" onClick={clearFilters}>CLEAR ALL</Button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={activeCategory === cat}
                      onChange={() => setActiveCategory(cat)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className={`text-sm ${activeCategory === cat ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <select 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded p-1 text-xs outline-none focus:border-primary"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                >
                  <option value="">Min</option>
                  <option value="1000">₹1,000</option>
                  <option value="10000">₹10,000</option>
                  <option value="50000">₹50,000</option>
                </select>
                <span className="text-gray-400 text-xs">to</span>
                <select 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded p-1 text-xs outline-none focus:border-primary"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="">Max</option>
                  <option value="10000">₹10,000</option>
                  <option value="50000">₹50,000</option>
                  <option value="100000">₹100,000</option>
                  <option value="500000">₹500,000</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Ratings</h4>
              <div className="space-y-2">
                {[4, 3, 2].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="rating"
                      checked={ratingFilter === r}
                      onChange={() => setRatingFilter(r)}
                      className="w-4 h-4 rounded-full border-gray-300 text-primary focus:ring-primary" 
                    />
                    <span className={`text-sm ${ratingFilter === r ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'} flex items-center gap-1`}>
                      {r} <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> & above
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-4">
        <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100 flex items-center justify-between">
          <p className="text-sm">
            Showing <span className="font-bold">{filteredProducts.length}</span> products 
            {activeCategory !== 'All' && <span> in <span className="font-bold">{activeCategory}</span></span>}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500">Sort By</span>
            <div className="flex gap-4">
              {['Relevance', 'Popularity', 'Price -- Low to High', 'Price -- High to Low'].map(s => (
                <button key={s} className={`text-sm pb-1 border-b-2 transition-all ${s === 'Relevance' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-primary'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Link to={`/products/${product._id}`} key={product._id} className="group border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 rounded-sm">
                <div className="p-4 flex flex-col h-full gap-3">
                  <div className="aspect-square bg-[#f9f9f9] rounded-sm flex items-center justify-center p-4 relative overflow-hidden">
                    <img 
                      src={product.images[0]?.url || product.images[0]} 
                      alt={product.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="rating" className="flex items-center gap-1">
                        {product.rating || 4.5} <Star className="h-2.5 w-2.5 fill-white" />
                      </Badge>
                      <span className="text-[11px] text-gray-400 font-bold">
                        ({(product.numReviews || 0).toLocaleString()})
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{product.price.amount.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#388e3c] mt-1">
                        Bank Offer Applied
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
