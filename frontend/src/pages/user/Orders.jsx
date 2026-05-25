import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../../services/order.service'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Package, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ShoppingBag, 
  XCircle, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Download,
  HelpCircle,
  Truck
} from 'lucide-react'
import { PageTransition } from '../../components/animations/PageTransition'
import { cn } from '../../utils/cn'

export function Orders() {
  const queryClient = useQueryClient()
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', pincode: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders()
  })

  const cancelOrderMutation = useMutation({
    mutationFn: (id) => orderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      alert("Order cancelled successfully")
    },
    onError: (err) => alert("Failed to cancel order: " + err.message)
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }) => orderService.updateShippingAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      setIsEditingAddress(false)
      alert("Address updated successfully")
    },
    onError: (err) => alert("Failed to update address: " + err.message)
  })

  const orders = data?.orders || []
  const selectedOrder = orders.find(o => o._id === selectedOrderId)

  // Status mapping to timeline index
  const getStatusIndex = (status) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING') return 1;
    if (s === 'PROCESSING') return 2;
    if (s === 'SHIPPED') return 3;
    if (s === 'COMPLETED' || s === 'DELIVERED') return 4;
    return 0; // Cancelled or unknown
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[460px] gap-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-gray-500 font-bold animate-pulse text-sm">Loading secure order history...</p>
    </div>
  )

  // Render Order Details View
  if (selectedOrderId && selectedOrder) {
    const statusIdx = getStatusIndex(selectedOrder.status);
    const isCancelled = selectedOrder.status?.toUpperCase() === 'CANCELLED';
    
    return (
      <PageTransition className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="gap-2 text-primary font-bold text-xs tracking-wider rounded-full hover:bg-primary/5 cursor-pointer" 
          onClick={() => {
            setSelectedOrderId(null)
            setIsEditingAddress(false)
          }}
        >
          <ArrowLeft className="h-4 w-4" /> BACK TO MY ORDERS
        </Button>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-850/80 overflow-hidden transition-colors duration-300">
          
          {/* Detailed View Header */}
          <div className="bg-gray-50 dark:bg-zinc-950 p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-850 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Order Details</p>
              <h2 className="text-base sm:text-lg font-mono font-black text-gray-900 dark:text-white">#{selectedOrder._id.toUpperCase()}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={selectedOrder.status === 'COMPLETED' ? 'success' : selectedOrder.status === 'CANCELLED' ? 'destructive' : 'warning'}
                className="h-8 px-4 text-xs font-black uppercase tracking-wider rounded-full"
              >
                {selectedOrder.status}
              </Badge>
              <Button variant="outline" size="sm" className="rounded-full font-bold text-xs h-8 px-4 flex items-center gap-1.5 border-gray-300 dark:border-zinc-700 cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Invoice
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Visual Timeline Tracking */}
            {!isCancelled && (
              <div className="space-y-6 bg-gray-50/50 dark:bg-zinc-950/20 p-6 rounded-2xl border border-gray-100 dark:border-zinc-850/50">
                <h4 className="font-extrabold text-xs text-gray-450 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Truck className="h-4.5 w-4.5 text-primary" /> Order Delivery Status</h4>
                
                {/* Horizontal Progress Timeline */}
                <div className="relative pt-6 pb-2">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[5%] right-[5%] h-1 bg-gray-200 dark:bg-zinc-800 rounded-full z-0">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${statusIdx === 1 ? 0 : statusIdx === 2 ? 33 : statusIdx === 3 ? 66 : 100}%` }}
                    />
                  </div>

                  {/* Timeline Nodes */}
                  <div className="flex justify-between items-center relative z-10">
                    {[
                      { step: 1, label: "Placed" },
                      { step: 2, label: "Processing" },
                      { step: 3, label: "Shipped" },
                      { step: 4, label: "Delivered" }
                    ].map(node => {
                      const isDone = statusIdx >= node.step;
                      return (
                        <div key={node.step} className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "h-7 w-7 rounded-full border-4 flex items-center justify-center text-[10px] font-black transition-all",
                            isDone 
                              ? "bg-primary border-white dark:border-zinc-900 text-white shadow-md shadow-primary/20 scale-108" 
                              : "bg-gray-100 dark:bg-zinc-800 border-white dark:border-zinc-900 text-gray-400 dark:text-zinc-500"
                          )}>
                            {isDone ? "✓" : node.step}
                          </div>
                          <span className={cn(
                            "text-[10px] font-extrabold uppercase tracking-wider",
                            isDone ? "text-primary font-black" : "text-gray-400 dark:text-zinc-500"
                          )}>
                            {node.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-55 dark:border-zinc-800/80 pb-2">
                <Package className="h-4.5 w-4.5 text-primary" /> Items in this Order
              </h3>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-5 p-4 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/85 rounded-2xl shadow-2xs hover:shadow-md transition-shadow">
                  <div className="h-20 w-20 rounded-xl bg-gray-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-zinc-850 shrink-0 p-2 shadow-inner">
                    <img src={item.product?.images?.[0]?.url || item.product?.images?.[0]} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 space-y-1.5 text-xs font-semibold">
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white hover:text-primary cursor-pointer line-clamp-1">{item.product?.title || 'Product'}</h4>
                    <p className="text-gray-400 dark:text-zinc-500">Premium Seller Hub</p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="font-black text-sm text-gray-900 dark:text-white">₹{(item.price.amount * item.quantity).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest bg-gray-50 dark:bg-zinc-950 px-2 py-0.5 rounded border">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Delivery Address Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-55 dark:border-zinc-800/80 pb-2">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-primary" /> Delivery Address
                  </h3>
                  {selectedOrder.status === 'PENDING' && !isEditingAddress && (
                    <button 
                      className="text-xs font-black text-primary hover:underline cursor-pointer flex items-center gap-0.5" 
                      onClick={() => {
                        setNewAddress({
                          street: selectedOrder.shippingAddress.street || '',
                          city: selectedOrder.shippingAddress.city || '',
                          state: selectedOrder.shippingAddress.state || '',
                          pincode: selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.zip || ''
                        })
                        setIsEditingAddress(true)
                      }}
                    >
                      <Edit3 className="h-3.5 w-3.5" /> EDIT
                    </button>
                  )}
                </div>

                {isEditingAddress ? (
                  <div className="space-y-3.5 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/15 animate-in fade-in slide-in-from-top-1">
                    <Input 
                      placeholder="Street/Area" 
                      value={newAddress.street} 
                      onChange={e => setNewAddress({...newAddress, street: e.target.value})} 
                      className="rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="City" 
                        value={newAddress.city} 
                        onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                        className="rounded-xl"
                      />
                      <Input 
                        placeholder="Pincode" 
                        value={newAddress.pincode} 
                        onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} 
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <Button 
                        size="sm" 
                        className="rounded-full font-bold text-xs px-6 py-2 shadow-md cursor-pointer"
                        onClick={() => updateAddressMutation.mutate({ id: selectedOrder._id, address: newAddress })}
                      >
                        SAVE
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full text-xs font-bold px-6 py-2 cursor-pointer text-gray-500" onClick={() => setIsEditingAddress(false)}>CANCEL</Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border border-gray-150 dark:border-zinc-800/80 rounded-2xl text-xs font-semibold text-gray-650 dark:text-zinc-350 leading-relaxed shadow-inner">
                    <p className="font-extrabold text-sm text-gray-950 dark:text-white mb-1">{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p className="font-black text-gray-400 dark:text-zinc-500 mt-2 uppercase tracking-widest text-[9.5px]">Pincode: {selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.zip}</p>
                  </div>
                )}
              </div>

              {/* Order summary calculations */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-55 dark:border-zinc-800/80 pb-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Payment Summary
                </h3>
                <div className="p-5 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-850 space-y-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 shadow-inner">
                  <div className="flex justify-between">
                    <span>Subtotal ({selectedOrder.items.length} items)</span>
                    <span className="text-gray-900 dark:text-white font-bold">₹{selectedOrder.totalPrice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount applied</span>
                    <span className="font-bold">- ₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-150 dark:border-zinc-800 font-black text-base text-gray-900 dark:text-white">
                    <span>Grand Total</span>
                    <span>₹{selectedOrder.totalPrice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Action */}
            {selectedOrder.status === 'PENDING' && (
              <div className="pt-6 border-t border-gray-100 dark:border-zinc-850 flex justify-end gap-3.5">
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/20 font-bold text-xs tracking-wider rounded-full gap-1.5 cursor-pointer shadow-sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to cancel this order?")) {
                      cancelOrderMutation.mutate(selectedOrder._id)
                    }
                  }}
                >
                  <XCircle className="h-4 w-4" /> CANCEL ORDER
                </Button>
                <Button className="rounded-full font-bold text-xs px-6 py-2 shadow-md flex items-center gap-1.5 cursor-pointer">
                  <HelpCircle className="h-4 w-4" /> NEED HELP?
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    )
  }

  // Render Empty State
  if (orders.length === 0) return (
    <PageTransition className="max-w-4xl mx-auto py-10">
      <div className="text-center py-16 px-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-850/80 max-w-md mx-auto transition-colors duration-300">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/10">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-black mb-2 text-gray-900 dark:text-white">No Orders Placed Yet</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-xs mx-auto">
          You haven't made any purchases yet. Start exploring our rich catalog to find products you love!
        </p>
        <Button className="w-full bg-accent hover:bg-accent/95 rounded-full font-bold text-xs tracking-wider cursor-pointer shadow-md shadow-accent/15 py-3.5" onClick={() => window.location.href = '/products'}>
          START SHOPPING
        </Button>
      </div>
    </PageTransition>
  )

  // Render Orders List View
  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      
      {/* List Header */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-zinc-850/80 transition-colors duration-300">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">My Orders</h1>
        <Badge className="bg-primary/10 text-primary dark:bg-primary/20 text-xs font-black uppercase px-3 py-1 rounded-full">
          {orders.length} TOTAL ORDERS
        </Badge>
      </div>

      {/* Orders Thread */}
      <div className="grid gap-4.5">
        {orders.map((order) => (
          <div key={order._id} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850/80 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col group shadow-2xs">
            <div className="p-5 flex flex-col justify-between h-full gap-4">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 flex items-center justify-center shadow-inner">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Order ID</p>
                    <p className="font-mono text-xs font-black text-gray-900 dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 flex-wrap text-xs font-semibold">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1 text-right">Placed On</p>
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <Badge 
                    variant={order.status === 'COMPLETED' ? 'success' : order.status === 'CANCELLED' ? 'destructive' : 'warning'}
                    className="h-7 px-3 text-[10.5px] font-black uppercase tracking-wider rounded-full"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-5 py-2">
                <div className="h-16 w-16 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden p-2 shrink-0 shadow-inner">
                  <img src={order.items[0]?.product?.images?.[0]?.url || order.items[0]?.product?.images?.[0]} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0 text-xs font-semibold">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate leading-snug">{order.items[0]?.product?.title || 'Product'}</h4>
                  <p className="text-gray-400 dark:text-zinc-500 mt-1 uppercase tracking-widest text-[9.5px]">
                    {order.items.length > 1 ? `+ ${order.items.length - 1} more items` : '1 Item'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-gray-900 dark:text-white">₹{order.totalPrice.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-gray-50 dark:border-zinc-850 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary font-black hover:bg-primary/5 rounded-full text-xs tracking-wider gap-1.5 cursor-pointer"
                  onClick={() => setSelectedOrderId(order._id)}
                >
                  VIEW DETAILS <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  )
}
