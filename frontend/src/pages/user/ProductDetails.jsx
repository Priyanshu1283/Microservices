import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Truck, 
  Loader2, 
  Star, 
  ChevronRight, 
  Heart, 
  Share2,
  Package,
  Award,
  Calendar,
  Layers,
  MessageSquare
} from "lucide-react"
import { productService } from "../../services/product.service"
import { cartService } from "../../services/cart.service"
import { Button } from "../../components/ui/Button"
import { PageTransition } from "../../components/animations/PageTransition"
import { cn } from "../../utils/cn"

export function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id)
  })

  const product = productData?.data

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      await cartService.addItem(id, 1)
      setTimeout(() => {
        setAddingToCart(false)
        navigate('/cart')
      }, 500)
    } catch (err) {
      alert("Failed to add to cart")
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    try {
      await cartService.addItem(id, 1)
      navigate('/checkout')
    } catch (err) {
      alert("Failed to proceed")
    }
  }

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-gray-500 font-bold animate-pulse text-sm">Loading premium product details...</p>
    </div>
  )
  
  if (error || !product) return (
    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 max-w-md mx-auto mt-10">
      <Package className="h-14 w-14 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
      <h2 className="text-xl font-black text-gray-800 dark:text-white">Product Not Found</h2>
      <p className="text-gray-500 dark:text-zinc-400 mt-2 text-xs leading-relaxed max-w-xs mx-auto">
        The product you are looking for does not exist or has been removed from our catalog.
      </p>
      <Button className="mt-6 rounded-full font-bold text-xs px-6 py-2 cursor-pointer shadow-md" onClick={() => navigate('/products')}>
        Back to Catalog
      </Button>
    </div>
  )

  return (
    <PageTransition className="py-2 sm:py-4">
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-8 rounded-3xl shadow-xs border border-gray-100 dark:border-zinc-850/80 transition-all duration-300">
        
        {/* BREADCRUMB (COMPACTED) */}
        <nav className="flex text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest gap-2 items-center mb-5 border-b border-gray-50 dark:border-zinc-805/50 pb-4">
          <Link to="/" className="hover:text-primary transition-colors">Home Store</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <Link to="/products" className="hover:text-primary transition-colors">Catalog</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT IMAGE GALLERY */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            
            {/* Primary Image View */}
            <div className="relative border border-gray-100 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-950 rounded-2xl p-4 group overflow-hidden shadow-inner flex items-center justify-center">
              <div className="aspect-square relative w-full max-w-[340px] flex items-center justify-center overflow-hidden">
                <motion.img 
                  layoutId={`product-image-${id}`}
                  src={product.images?.[selectedImage]?.url || product.images?.[selectedImage]} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              
              {/* Floating Action Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2.5 rounded-full shadow-lg border border-gray-100 dark:border-zinc-800 flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                    isWishlisted 
                      ? 'bg-red-500 text-white border-transparent' 
                      : 'bg-white dark:bg-zinc-900 text-gray-400 dark:text-zinc-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Thumbnail Selectors */}
            <div className="flex gap-2 justify-center overflow-x-auto py-0.5">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setSelectedImage(i)}
                  className={cn(
                    "h-13 w-13 p-1 rounded-lg border-2 transition-all bg-white dark:bg-zinc-900 cursor-pointer",
                    selectedImage === i 
                      ? "border-primary scale-105 shadow-md shadow-primary/10" 
                      : "border-gray-150 dark:border-zinc-800 hover:border-primary/50"
                  )}
                >
                  <img src={img.url || img} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PRODUCT INFO */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title & Rating Summary */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug tracking-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-0.5 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 px-2.5 py-0.5 rounded-md text-[10.5px] font-black">
                  {product.rating || 4.5} <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-zinc-500">
                  {(product.numReviews || 0).toLocaleString()} Customer Ratings & Reviews
                </span>
                <span className="bg-primary/10 text-primary dark:bg-primary/20 text-[9.5px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Store Assured
                </span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 bg-gray-55/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-850 p-5 rounded-2xl">
              <p className="text-[#388e3c] dark:text-[#4caf50] text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4" /> Best Price Guarantee Included
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900 dark:text-white">₹{(product.price?.amount || 0).toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-gray-400 dark:text-zinc-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-sm font-black text-[#388e3c] bg-[#388e3c]/15 px-2.5 py-0.5 rounded-md uppercase">
                      {Math.round((1 - product.price.amount / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold">+ Secure Packaging Fees applied at checkout</p>
            </div>

            {/* Premium Action Buttons (UX Optimized) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="flex-1 h-12 font-black text-xs tracking-wider rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border-none"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? <Loader2 className="animate-spin h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                ADD TO CART
              </Button>
              <Button 
                size="lg" 
                className="flex-1 h-12 font-black text-xs tracking-wider rounded-xl bg-accent hover:bg-accent/95 text-white border-none shadow-md shadow-accent/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                onClick={handleBuyNow}
              >
                <Zap className="h-4 w-4 fill-current text-white" />
                BUY NOW
              </Button>
            </div>

            {/* Specifications & Review Tabs */}
            <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-6 space-y-4">
              <div className="flex border-b border-gray-100 dark:border-zinc-800/80 gap-6">
                <button
                  onClick={() => setActiveTab('description')}
                  className={cn(
                    "pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
                    activeTab === 'description' 
                      ? "border-b-2 border-primary text-primary" 
                      : "text-gray-400 dark:text-zinc-500 hover:text-gray-700"
                  )}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('highlights')}
                  className={cn(
                    "pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
                    activeTab === 'highlights' 
                      ? "border-b-2 border-primary text-primary" 
                      : "text-gray-400 dark:text-zinc-500 hover:text-gray-700"
                  )}
                >
                  Features & Delivery
                </button>
              </div>

              <div className="min-h-[120px] text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-semibold transition-all">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' ? (
                    <motion.div
                      key="desc"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="whitespace-pre-wrap"
                    >
                      {product.description}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="high"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex gap-3 items-start bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-100 dark:border-zinc-850">
                          <Truck className="h-5 w-5 text-primary shrink-0" />
                          <div className="text-xs">
                            <p className="font-extrabold text-gray-800 dark:text-white">Free Standard Shipping</p>
                            <p className="text-gray-500 dark:text-zinc-400 mt-0.5">Est. Arrival in 2-3 business days</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-100 dark:border-zinc-850">
                          <RefreshCw className="h-5 w-5 text-primary shrink-0" />
                          <div className="text-xs">
                            <p className="font-extrabold text-gray-800 dark:text-white">7-Day Replacement Policy</p>
                            <p className="text-gray-500 dark:text-zinc-400 mt-0.5">Hassle-free exchange policy on damage</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Seller Information Card */}
            <div className="border border-gray-150 dark:border-zinc-800/80 p-5 rounded-2xl flex items-center justify-between bg-white dark:bg-zinc-900 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm uppercase border border-primary/20">
                  {product.category?.[0] || 'S'}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-black tracking-widest">Premium Seller</p>
                  <p className="font-bold text-primary hover:underline cursor-pointer text-sm">Pranshu Retail Ltd.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-primary/5 rounded-full font-bold text-xs px-5 py-2 cursor-pointer">
                Profile
              </Button>
            </div>
            
          </div>

        </div>
      </div>
    </PageTransition>
  )
}
