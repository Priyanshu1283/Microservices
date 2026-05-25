import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Link, useSearchParams } from 'react-router-dom'
import { Star, SlidersHorizontal, ChevronRight, LayoutGrid, ListFilter, Percent } from 'lucide-react'

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
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* SaaS-STYLE SIDEBAR FILTERS (COMPACTED & SLEEK) */}
      <aside className="w-full lg:w-48 flex-shrink-0">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-3.5 shadow-xs space-y-3.5 sticky top-24 transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-gray-55 dark:border-zinc-800/50 pb-2">
            <h3 className="font-extrabold text-[12.5px] text-gray-900 dark:text-white flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Filters
            </h3>
            <button 
              onClick={clearFilters}
              className="text-[9px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Categories */}
            <div>
              <h4 className="text-[8.5px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Categories</h4>
              <div className="space-y-0.5">
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground' 
                          : 'text-gray-655 dark:text-zinc-450 hover:bg-gray-50 dark:hover:bg-zinc-850/40 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{cat}</span>
                      {isActive && <ChevronRight className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price ranges */}
            <div>
              <h4 className="text-[8.5px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Price Range</h4>
              <div className="flex items-center gap-1">
                <select 
                  className="flex-1 bg-gray-55 dark:bg-zinc-800/50 border border-transparent rounded-lg p-1.5 text-[10px] outline-none focus:border-primary/50 text-gray-700 dark:text-zinc-305 font-bold cursor-pointer"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                >
                  <option value="">Min</option>
                  <option value="1000">₹1,000</option>
                  <option value="10000">₹10,000</option>
                  <option value="50000">₹50,000</option>
                </select>
                <span className="text-gray-405 text-[9px] font-black uppercase tracking-wider shrink-0">to</span>
                <select 
                  className="flex-1 bg-gray-55 dark:bg-zinc-800/50 border border-transparent rounded-lg p-1.5 text-[10px] outline-none focus:border-primary/50 text-gray-700 dark:text-zinc-305 font-bold cursor-pointer"
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

            {/* Customer rating filter */}
            <div>
              <h4 className="text-[8.5px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Rating</h4>
              <div className="space-y-0.5">
                {[4, 3, 2].map(r => {
                  const isActive = ratingFilter === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRatingFilter(r)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[10.5px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-black' 
                          : 'text-gray-655 dark:text-zinc-450 hover:bg-gray-50 dark:hover:bg-zinc-850/40 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {r} <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> & above
                      </span>
                      {isActive && <ChevronRight className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </aside>

      {/* MAIN CATALOG AREA */}
      <main className="flex-1 space-y-5">
        
        {/* Results Header */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300">
          <p className="text-xs font-bold text-gray-500 dark:text-zinc-400">
            Showing <span className="font-extrabold text-gray-900 dark:text-white text-sm">{filteredProducts.length}</span> premium products 
            {activeCategory !== 'All' && <span> in <span className="font-extrabold text-primary">{activeCategory}</span></span>}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Sort By</span>
            <div className="flex gap-2.5">
              {['Relevance', 'Price: Low', 'Price: High'].map(s => {
                const isSelected = s === 'Relevance';
                return (
                  <button 
                    key={s} 
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary text-white shadow-md shadow-primary/10' 
                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-gray-100 dark:bg-zinc-850 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850/80 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-2xs"
              >
                <Link to={`/products/${product._id}`} className="p-4 flex flex-col gap-4 h-full">
                  <div className="aspect-square bg-gray-55 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-4 relative shadow-inner">
                    <img 
                      src={product.images[0]?.url || product.images[0]} 
                      alt={product.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-106 transition-transform duration-500"
                    />
                    {product.originalPrice && (
                      <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Percent className="h-2.5 w-2.5" />
                        {Math.round(((product.originalPrice - product.price.amount) / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 line-clamp-1">{product.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-zinc-850/50">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-black">
                          {product.rating || 4.5} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold">({(product.numReviews || 0).toLocaleString()} reviews)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-gray-900 dark:text-white">₹{product.price.amount.toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="text-[10.5px] font-extrabold text-[#388e3c] dark:text-[#4caf50]">
                          Bank Offer Applied
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

    </div>
  )
}
