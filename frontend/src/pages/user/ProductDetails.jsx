import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ShoppingCart, Zap, ShieldCheck, RefreshCw, Truck, Loader2, Star, ChevronRight, Heart, Share2 } from "lucide-react"
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
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-[#2874f0]" />
      <p className="text-gray-500 font-medium animate-pulse">Loading product details...</p>
    </div>
  )
  
  if (error || !product) return (
    <div className="text-center p-20 bg-white rounded-sm shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
      <p className="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
      <Button className="mt-6" onClick={() => navigate('/products')}>Back to Products</Button>
    </div>
  )

  return (
    <PageTransition className="py-2 sm:py-6">
      <div className="bg-white p-4 sm:p-8 rounded-sm shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Images & Sticky Actions */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="relative border border-gray-200 rounded-sm p-4 group">
              <div className="aspect-[4/5] relative flex items-center justify-center overflow-hidden bg-white">
                <img 
                  src={product.images?.[selectedImage]?.url || product.images?.[selectedImage]} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <button className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="flex gap-3 justify-center">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setSelectedImage(i)}
                  className={cn(
                    "h-16 w-16 p-1 rounded-sm border-2 transition-all bg-white",
                    selectedImage === i ? "border-[#2874f0]" : "border-gray-200 hover:border-[#2874f0]/50"
                  )}
                >
                  <img src={img.url || img} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                size="lg" 
                className="flex-1 h-14 font-bold text-base sm:text-lg rounded-sm bg-[#ff9f00] hover:bg-[#ff9f00]/90 text-white shadow-sm transition-transform active:scale-95"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                ADD TO CART
              </Button>
              <Button 
                size="lg" 
                className="flex-1 h-14 font-bold text-base sm:text-lg rounded-sm bg-[#fb641b] hover:bg-[#fb641b]/90 text-white border-none shadow-sm transition-transform active:scale-95"
                onClick={handleBuyNow}
              >
                <Zap className="mr-2 h-5 w-5 fill-current" />
                BUY NOW
              </Button>
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:col-span-7 space-y-4">
            {/* Breadcrumbs */}
            <nav className="flex text-[12px] text-gray-500 gap-2 items-center">
              <Link to="/" className="hover:text-[#2874f0]">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/products" className="hover:text-[#2874f0]">Products</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900 font-medium truncate">{product.title}</span>
            </nav>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">{product.title}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#388e3c] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-[3px]">
                  {product.rating || 4.5} <Star className="h-3 w-3 ml-0.5 fill-current" />
                </div>
                <span className="text-sm font-bold text-gray-400">
                  {(product.numReviews || 0).toLocaleString()} Ratings & {(Math.floor(product.numReviews/10) || 0).toLocaleString()} Reviews
                </span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="h-5 ml-2" />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <p className="text-[#388e3c] text-sm font-bold">Extra ₹{Math.round(product.price?.amount * 0.1)} off</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">₹{(product.price?.amount || 0).toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-base font-bold text-[#388e3c]">
                      {Math.round((1 - product.price.amount / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-[12px] text-gray-400 font-medium">+ ₹29 Secured Packaging Fee</p>
            </div>

            {/* Offers Section */}
            <div className="space-y-3 py-4">
              <h3 className="font-bold text-sm text-gray-900">Available Offers</h3>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/offertag_7a5415.png" alt="offer" className="h-4 w-4 mt-0.5" />
                    <span>
                      <span className="font-bold">Bank Offer</span> 10% instant discount on XYZ Bank Credit Cards, up to ₹1,500 on orders of ₹5,000 and above 
                      <span className="text-[#2874f0] font-bold cursor-pointer ml-1">T&C</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-gray-100">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="text-[13px]">
                  <p className="font-bold text-gray-800">Free Delivery</p>
                  <p className="text-gray-500">Delivery by <span className="font-bold text-gray-800">Wed, Jun 12</span></p>
                  <p className="text-gray-400 text-[11px] mt-0.5">if ordered before 12:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="text-[13px]">
                  <p className="font-bold text-gray-800">7 Days Replacement Policy</p>
                  <p className="text-gray-500">Returnable if item is damaged/defective</p>
                  <span className="text-[#2874f0] font-bold cursor-pointer">Know More</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-6">
              <h3 className="text-lg font-bold text-gray-900">Product Description</h3>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {product.description}
              </div>
            </div>
            
            {/* Seller Info */}
            <div className="border border-gray-200 p-4 rounded-sm mt-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#f0f5ff] flex items-center justify-center font-bold text-[#2874f0]">
                  {product.category?.[0] || 'S'}
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Seller</p>
                  <p className="font-bold text-[#2874f0] hover:underline cursor-pointer">Pranshu Retail Ltd.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-[#2874f0] border-[#2874f0] hover:bg-[#2874f0]/5">
                View Seller
              </Button>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  )
}
