import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Info } from "lucide-react"
import { cartService } from "../../services/cart.service"
import { Button } from "../../components/ui/Button"
import { Skeleton } from "../../components/ui/Skeleton"
import { PageTransition } from "../../components/animations/PageTransition"

export function Cart() {
  const queryClient = useQueryClient()
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, qty }) => cartService.updateItemQuantity(productId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
  
  const removeItemMutation = useMutation({
    mutationFn: (productId) => cartService.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty < 1) return
    updateItemMutation.mutate({ productId, qty: newQty })
  }
  
  const handleDeleteItem = (productId) => {
    if (window.confirm("Remove this item from cart?")) {
      removeItemMutation.mutate(productId)
    }
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    if (couponCode.trim()) {
      setCouponApplied(true)
    }
  }

  const { cart, totals, checkout } = cartData || {}
  const checkoutLines = checkout?.lines || []

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 mt-4">
        <Skeleton className="h-9 w-40 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
          <div><Skeleton className="h-64 w-full rounded-2xl" /></div>
        </div>
      </div>
    )
  }

  if (!cart || checkoutLines.length === 0) {
    return (
      <PageTransition className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 p-10 sm:p-14 rounded-3xl text-center max-w-md border border-gray-100 dark:border-zinc-850/80 shadow-2xl transition-colors duration-300">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary animate-bounce-slow border border-primary/10">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black mb-2 text-gray-900 dark:text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-xs mx-auto">
            Before you can checkout, you must add some premium items to your shopping cart.
          </p>
          <Link to="/products">
            <Button size="lg" className="w-full rounded-full font-bold text-xs tracking-wider cursor-pointer shadow-md shadow-primary/15">
              BROWSE CATALOG
            </Button>
          </Link>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black mb-8 tracking-tight text-gray-900 dark:text-white border-b border-gray-50 dark:border-zinc-855/50 pb-4">
        Shopping Cart
      </h1>
      
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {checkoutLines.map((line) => (
              <motion.div 
                key={line.productId} 
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl flex flex-col sm:flex-row gap-5 border border-gray-100 dark:border-zinc-850/80 items-start sm:items-center shadow-2xs hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 dark:border-zinc-800 shadow-inner">
                  {line.product?.images?.[0] ? (
                    <img src={line.product.images[0].url || line.product.images[0]} alt={line.product.title} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Link to={`/products/${line.productId}`} className="font-extrabold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                    {line.product?.title || "Unknown Product"}
                  </Link>
                  <div className="text-xs font-bold text-gray-400 dark:text-zinc-500">
                    Price: {(line.product?.price?.currency || checkout?.currency || 'INR') === 'USD' ? '$' : '₹'}{(line.product?.price?.amount || 0).toLocaleString()}
                  </div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-zinc-950 rounded-xl p-1 border border-gray-150/40 dark:border-zinc-800">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-zinc-900 cursor-pointer text-gray-500 dark:text-zinc-400"
                        onClick={() => handleUpdateQuantity(line.productId, line.quantity - 1)}
                        disabled={line.quantity <= 1 || updateItemMutation.isPending}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center font-bold text-xs text-gray-800 dark:text-zinc-200">{line.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-zinc-900 cursor-pointer text-gray-500 dark:text-zinc-400"
                        onClick={() => handleUpdateQuantity(line.productId, line.quantity + 1)}
                        disabled={updateItemMutation.isPending}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg cursor-pointer h-8 w-8"
                      onClick={() => handleDeleteItem(line.productId)}
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="font-black text-sm text-gray-900 dark:text-white text-right sm:w-24 sm:self-center">
                  {(line.product?.price?.currency || checkout?.currency || 'INR') === 'USD' ? '$' : '₹'}{(line.lineTotal || 0).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-850/80 shadow-xs space-y-6">
            <h3 className="font-extrabold text-base border-b border-gray-50 dark:border-zinc-800/50 pb-3 text-gray-900 dark:text-white">Order Summary</h3>
            
            {/* Promo Code section */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                  className="w-full bg-gray-55 dark:bg-zinc-950 border border-transparent rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-primary/50 text-foreground font-semibold placeholder:text-gray-400"
                />
              </div>
              <Button 
                type="submit" 
                size="sm"
                disabled={couponApplied || !couponCode.trim()}
                className="rounded-xl font-bold text-xs px-4 py-2 cursor-pointer shadow-sm active:scale-95"
              >
                Apply
              </Button>
            </form>

            {couponApplied && (
              <div className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 px-3.5 py-2 rounded-xl text-[10.5px] font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                <span>Coupon Applied successfully! 🏷️</span>
                <button onClick={() => {setCouponApplied(false); setCouponCode("")}} className="text-xs font-black underline cursor-pointer">Remove</button>
              </div>
            )}
            
            <div className="space-y-4 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="text-gray-900 dark:text-white font-bold">{totals?.itemCount}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount (10%)</span>
                  <span className="font-bold">- {(checkout?.currency || 'INR') === 'USD' ? '$' : '₹'}{((checkout?.totalAmount || 0) * 0.1).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fees</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-gray-900 dark:text-white">
                <span className="font-extrabold text-sm">Subtotal</span>
                <span className="font-black text-xl">
                  {(checkout?.currency || 'INR') === 'USD' ? '$' : '₹'}
                  {couponApplied 
                    ? ((checkout?.totalAmount || 0) * 0.9).toLocaleString() 
                    : (checkout?.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="block pt-2">
              <Button size="lg" className="w-full rounded-xl font-bold text-xs tracking-wider shadow-md shadow-primary/10 cursor-pointer flex items-center justify-center gap-1.5 h-12">
                PROCEED TO CHECKOUT
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="text-[10px] text-center text-gray-400 dark:text-zinc-500 flex items-center justify-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Fully secure checkout SSL encryption
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
