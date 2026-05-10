import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { cartService } from "../../services/cart.service"
import { Button } from "../../components/ui/Button"
import { Skeleton } from "../../components/ui/Skeleton"
import { PageTransition } from "../../components/animations/PageTransition"

export function Cart() {
  const queryClient = useQueryClient()
  
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, qty }) => cartService.updateItemQuantity(productId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
    }
  })

  // We'll treat deleting as updating quantity to 0 for this example, 
  // or add a removeItem to the service if it exists.
  // Assuming PATCH with qty=0 removes it, or we need a DELETE endpoint.
  // The cart endpoint documentation said PATCH /api/cart/items/:productId.

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty < 1) return
    updateItemMutation.mutate({ productId, qty: newQty })
  }

  const { cart, totals, checkout } = cartData || {}
  const checkoutLines = checkout?.lines || []

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div><Skeleton className="h-64 w-full rounded-xl" /></div>
        </div>
      </div>
    )
  }

  if (!cart || checkoutLines.length === 0) {
    return (
      <PageTransition className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="glass p-12 rounded-3xl text-center max-w-md border border-border">
          <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products">
            <Button size="lg" className="w-full">Start Shopping</Button>
          </Link>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {checkoutLines.map((line) => (
            <div key={line.productId} className="glass p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-6 border border-border items-start sm:items-center">
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {line.product?.images?.[0] ? (
                  <img src={line.product.images[0].url} alt={line.product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <Link to={`/products/${line.productId}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                  {line.product?.title || "Unknown Product"}
                </Link>
                <div className="text-muted-foreground mt-1 mb-4 font-medium">
                  {line.currency === 'USD' ? '$' : '₹'}{line.priceAmount}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1 border border-border/50">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md"
                      onClick={() => handleUpdateQuantity(line.productId, line.quantity - 1)}
                      disabled={line.quantity <= 1 || updateItemMutation.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{line.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md"
                      onClick={() => handleUpdateQuantity(line.productId, line.quantity + 1)}
                      disabled={updateItemMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Assuming we need a delete button, we can set quantity to 0 if the backend supports it, or use a specific delete endpoint */}
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="font-bold text-lg text-right sm:w-24">
                {line.currency === 'USD' ? '$' : '₹'}{line.lineTotal}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="glass p-6 rounded-2xl border border-border sticky top-24">
          <h3 className="font-semibold text-lg mb-6">Order Summary</h3>
          
          <div className="space-y-4 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items ({totals?.itemCount})</span>
              <span className="font-medium">{checkout?.currency === 'USD' ? '$' : '₹'}{checkout?.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="font-semibold text-base">Subtotal</span>
              <span className="font-bold text-xl">{checkout?.currency === 'USD' ? '$' : '₹'}{checkout?.totalAmount}</span>
            </div>
          </div>

          <Link to="/checkout" className="block">
            <Button size="lg" className="w-full">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-4 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Secure checkout
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

// Temporary ShieldCheck icon since it's not imported at the top
import { ShieldCheck } from "lucide-react"
