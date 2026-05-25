import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { 
  ShoppingBag, 
  Star, 
  Smartphone, 
  Shirt, 
  Watch, 
  Laptop, 
  Home as HomeIcon, 
  Gamepad2, 
  Utensils, 
  Car, 
  Armchair,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Percent
} from 'lucide-react'

const categories = [
  { name: 'For You', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
  { name: 'Fashion', icon: Shirt, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { name: 'Mobiles', icon: Smartphone, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' },
  { name: 'Beauty', icon: Watch, color: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400' },
  { name: 'Electronics', icon: Laptop, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
  { name: 'Home', icon: HomeIcon, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' },
  { name: 'Appliances', icon: Gamepad2, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' },
  { name: 'Toys', icon: Gamepad2, color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400' },
  { name: 'Food', icon: Utensils, color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' },
  { name: 'Auto', icon: Car, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400' },
  { name: 'Furniture', icon: Armchair, color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400' },
]

const heroSlides = [
  {
    id: 1,
    title: "Futuristic Spatial Sound",
    subtitle: "Experience depth like never before. High-fidelity acoustic architecture.",
    tag: "Exclusive Launch",
    color: "from-blue-600 via-indigo-600 to-violet-700",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    btnText: "Shop Audio Pro"
  },
  {
    id: 2,
    title: "Next-Gen Creative Studio",
    subtitle: "Unmatched performance. Reimagined efficiency for modern workspaces.",
    tag: "New Release",
    color: "from-zinc-900 via-slate-800 to-zinc-950",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    btnText: "Explore Models"
  },
  {
    id: 3,
    title: "Elevate Your Aesthetic",
    subtitle: "Curated minimalism. Redesigning everyday fashion essentials.",
    tag: "Seasonal Sale",
    color: "from-rose-600 via-pink-600 to-orange-500",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
    btnText: "Browse Collection"
  }
]

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products')
      return response.data
    }
  })

  // Auto Hero Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const products = data?.data || []
  const trendingProducts = products.slice(0, 5)

  return (
    <div className="space-y-10 -mt-6">
      
      {/* CATEGORY BAR (SCROLLABLE OR HORIZONTAL SLIDER) */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800/80 -mx-4 sm:-mx-6 px-6 py-4 overflow-x-auto no-scrollbar scroll-smooth transition-colors duration-300">
        <div className="container mx-auto max-w-7xl flex items-center justify-between min-w-max gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link 
                to={`/products?category=${encodeURIComponent(cat.name === 'For You' ? 'All' : cat.name)}`}
                className="flex flex-col items-center gap-2 group min-w-[72px]"
              >
                <div className={`p-3 rounded-full ${cat.color} shadow-xs transition-all duration-300 group-hover:scale-108 flex items-center justify-center`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-[11.5px] font-bold text-gray-600 dark:text-zinc-400 group-hover:text-primary transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DYNAMIC AUTO HERO SLIDER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-[460px] bg-zinc-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].color} flex items-center p-8 md:p-16`}
          >
            {/* Ambient background blur circles */}
            <div className="absolute top-1/4 right-1/4 h-72 w-72 bg-white/10 rounded-full filter blur-3xl" />
            
            <div className="grid md:grid-cols-2 gap-8 items-center w-full relative z-10">
              <div className="text-white space-y-4 md:space-y-6">
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10.5px] font-black uppercase tracking-widest text-[#ffe11b]">
                  {heroSlides[currentSlide].tag}
                </span>
                <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-sm md:text-base text-white/80 font-medium max-w-md leading-relaxed">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <div className="pt-2">
                  <Link to="/products">
                    <Button className="bg-white text-gray-900 hover:bg-white/95 hover:scale-105 transition-all rounded-full font-bold px-7 py-3 text-xs md:text-sm shadow-lg flex items-center gap-2 cursor-pointer active:scale-98">
                      {heroSlides[currentSlide].btnText}
                      <ArrowRight className="h-4 w-4 text-gray-900" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-center items-center h-full max-h-[300px]">
                <motion.img 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  src={heroSlides[currentSlide].image} 
                  alt={heroSlides[currentSlide].title} 
                  className="max-h-[280px] w-auto object-cover rounded-2xl shadow-2xl border-4 border-white/10"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hero Slider Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>

      {/* PERSOANLIZED AI SUGGESTION CHIP */}
      <div className="bg-gradient-to-r from-blue-500/10 via-[#3c82f6]/10 to-[#fb641b]/10 border border-blue-500/15 dark:border-blue-500/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl animate-pulse">
            <Sparkles className="h-5 w-5 fill-current text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              Looking for something tailored?
              <span className="bg-accent/10 text-accent dark:bg-accent/20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">AI RECOMMENDATION</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              Ask AI Buddy (floating on the bottom-right) to automatically search or add products to your cart!
            </p>
          </div>
        </div>
        <Link to="/products" className="shrink-0">
          <Button size="sm" variant="outline" className="rounded-full text-xs font-bold border-primary/20 text-primary hover:bg-primary/5 cursor-pointer">
            Ask AI Assistant
          </Button>
        </Link>
      </div>

      {/* TRENDING SECTION (HORIZONTAL SNAPPING SLIDER) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Trending Now
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500">Fastest selling essentials this week</p>
          </div>
          <Link to="/products">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5 flex items-center gap-1">
              Explore All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[260px] h-[340px] bg-gray-150 dark:bg-zinc-850 animate-pulse rounded-2xl flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {trendingProducts.map((product) => (
              <div key={product._id} className="min-w-[270px] max-w-[270px] snap-start bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden flex-shrink-0 flex flex-col justify-between p-4 group">
                
                <Link to={`/products/${product._id}`} className="space-y-4 flex-1 flex flex-col">
                  {/* Aspect ratio box */}
                  <div className="aspect-[4/3] bg-gray-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-3 relative shadow-inner">
                    <img 
                      src={product.images[0]?.url || product.images[0]} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-106 transition-transform duration-500"
                    />
                    {product.originalPrice && (
                      <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Percent className="h-2.5 w-2.5" />
                        {Math.round(((product.originalPrice - product.price.amount) / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 line-clamp-1">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-gray-900 dark:text-white">₹{product.price.amount.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-black">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {product.rating || 4.5}
                      </div>
                    </div>
                  </div>
                </Link>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECOMMENDED PRODUCTS GRID */}
      <div className="space-y-6">
        <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Recommended for You
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500">Based on your interests and recent searches</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10.5px] font-extrabold uppercase">
              <Zap className="h-3 w-3" /> Real-time pricing
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-[360px] bg-gray-100 dark:bg-zinc-850 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850/80 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
              >
                <Link to={`/products/${product._id}`} className="p-4 flex flex-col gap-4 h-full">
                  <div className="aspect-square bg-gray-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-4 relative shadow-inner">
                    <img 
                      src={product.images[0]?.url || product.images[0]} 
                      alt={product.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-106 transition-transform duration-500"
                    />
                    {product.originalPrice && (
                      <span className="absolute top-3 left-3 bg-[#fb641b]/10 text-[#fb641b] dark:bg-[#fb641b]/20 text-[9px] font-black px-2 py-0.5 rounded-md">
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

                    <div className="space-y-2 pt-1 border-t border-gray-50 dark:border-zinc-850/50">
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
      </div>

    </div>
  )
}
