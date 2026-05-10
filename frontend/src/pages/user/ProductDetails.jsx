import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ShoppingCart, Zap, ShieldCheck, RefreshCw, Truck, Loader2, Star, ChevronRight } from "lucide-react"
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
      // Small delay for better UX feel
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

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
  if (error || !product) return <div className="text-center p-20">Product not found</div>

  return (
    <PageTransition className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Images */}
        <div className="md:col-span-5 space-y-4">
          <div className="glass rounded-xl border border-border p-4 bg-white dark:bg-card overflow-hidden">
            <div className="aspect-square relative flex items-center justify-center overflow-hidden">
              {product.images?.[selectedImage] ? (
                <img 
                  src={product.images[selectedImage].url} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain transition-transform hover:scale-105" 
                />
              ) : (
                <ShoppingCart className="h-20 w-20 opacity-10" />
              )}
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "h-16 w-16 rounded-md border-2 overflow-hidden flex-shrink-0 transition-all",
                  selectedImage === i ? "border-primary" : "border-border hover:border-primary/50"
                )}
              >
                <img src={img.url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              size="lg" 
              variant="secondary" 
              className="flex-1 h-14 font-bold text-lg rounded-none bg-[#ff9f00] hover:bg-[#ff9f00]/90 text-white"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2" />}
              ADD TO CART
            </Button>
            <Button 
              size="lg" 
              className="flex-1 h-14 font-bold text-lg rounded-none bg-[#fb641b] hover:bg-[#fb641b]/90 text-white border-none"
              onClick={handleBuyNow}
            >
              <Zap className="mr-2 fill-current" />
              BUY NOW
            </Button>
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="md:col-span-7 space-y-6">
          <nav className="flex text-xs text-muted-foreground gap-2 items-center">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <ChevronRight className="h-3 w-3" />
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/products')}>Products</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate">{product.title}</span>
          </nav>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                4.5 <Star className="h-3 w-3 ml-1 fill-current" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">1,245 Ratings & 158 Reviews</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-foreground">₹{product.price?.amount}</span>
            <span className="text-sm text-muted-foreground line-through">₹{Math.round(product.price?.amount * 1.5)}</span>
            <span className="text-sm font-bold text-green-600">33% off</span>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-sm uppercase text-muted-foreground">Available Offers</h3>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-2 items-start text-sm">
                  <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><span className="font-bold">Bank Offer</span> 10% instant discount on XYZ Bank Credit Cards, up to ₹1,500. <span className="text-primary font-bold cursor-pointer">T&C</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-bold">Free Delivery</p>
                <p className="text-muted-foreground">Expected by Wed, Jun 12</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-bold">7 Days Replacement</p>
                <p className="text-muted-foreground">Policy available for this item</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Product Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
          
          <div className="glass p-6 rounded-xl border border-border mt-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center font-bold">
                {product.seller?.name?.[0] || 'S'}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Sold by</p>
                <p className="font-bold text-primary">{product.seller?.name || 'Authorized Seller'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  )
}
