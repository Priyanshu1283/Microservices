import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../../services/order.service'
import { Card } from '../../components/ui/Card'
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
  ArrowLeft
} from 'lucide-react'
import { PageTransition } from '../../components/animations/PageTransition'

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
      queryClient.invalidateQueries(['my-orders'])
      alert("Order cancelled successfully")
    },
    onError: (err) => alert("Failed to cancel order: " + err.message)
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }) => orderService.updateShippingAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-orders'])
      setIsEditingAddress(false)
      alert("Address updated successfully")
    },
    onError: (err) => alert("Failed to update address: " + err.message)
  })

  const orders = data?.orders || []
  const selectedOrder = orders.find(o => o._id === selectedOrderId)

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2874f0]"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading your orders...</p>
    </div>
  )

  if (selectedOrderId && selectedOrder) {
    return (
      <PageTransition className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="gap-2 text-[#2874f0] font-bold" 
          onClick={() => {
            setSelectedOrderId(null)
            setIsEditingAddress(false)
          }}
        >
          <ArrowLeft className="h-4 w-4" /> BACK TO ALL ORDERS
        </Button>

        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</p>
              <h2 className="text-lg font-mono font-bold">#{selectedOrder._id.toUpperCase()}</h2>
            </div>
            <Badge 
              variant={selectedOrder.status === 'COMPLETED' ? 'success' : selectedOrder.status === 'CANCELLED' ? 'destructive' : 'warning'}
              className="h-8 px-4 text-sm"
            >
              {selectedOrder.status}
            </Badge>
          </div>

          <div className="p-6 space-y-8">
            {/* Products List */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#2874f0]" /> Items in this order
              </h3>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-6 p-4 border rounded-sm hover:bg-gray-50 transition-colors">
                  <div className="h-24 w-24 rounded-sm bg-gray-50 flex items-center justify-center overflow-hidden border shrink-0">
                    <img src={item.product?.images?.[0]?.url || item.product?.images?.[0]} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-gray-900 hover:text-[#2874f0] cursor-pointer line-clamp-1">{item.product?.title || 'Product'}</h4>
                    <p className="text-sm text-gray-500">Seller: Pranshu Retail Ltd.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-bold text-lg">₹{(item.price.amount * item.quantity).toLocaleString()}</span>
                      <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Delivery Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#2874f0]" /> Delivery Address
                  </h3>
                  {selectedOrder.status === 'PENDING' && !isEditingAddress && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#2874f0] font-bold" 
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
                      <Edit3 className="h-4 w-4 mr-1" /> EDIT
                    </Button>
                  )}
                </div>

                {isEditingAddress ? (
                  <div className="space-y-3 p-4 bg-blue-50/50 rounded-sm border border-blue-100">
                    <Input 
                      placeholder="Street/Area" 
                      value={newAddress.street} 
                      onChange={e => setNewAddress({...newAddress, street: e.target.value})} 
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="City" 
                        value={newAddress.city} 
                        onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                      />
                      <Input 
                        placeholder="Pincode" 
                        value={newAddress.pincode} 
                        onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} 
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="bg-[#2874f0] text-white font-bold"
                        onClick={() => updateAddressMutation.mutate({ id: selectedOrder._id, address: newAddress })}
                      >
                        SAVE
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingAddress(false)}>CANCEL</Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded-sm text-sm text-gray-700 leading-relaxed">
                    <p className="font-bold">{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p className="font-bold mt-1">Pincode: {selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.zip}</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#388e3c]" /> Order Summary
                </h3>
                <div className="p-4 bg-gray-50 rounded-sm space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Price ({selectedOrder.items.length} items)</span>
                    <span>₹{selectedOrder.totalPrice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#388e3c] font-bold">
                    <span>Discount</span>
                    <span>- ₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-[#388e3c] font-bold italic">FREE</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-lg text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{selectedOrder.totalPrice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedOrder.status === 'PENDING' && (
              <div className="pt-6 border-t flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-200 hover:bg-red-50 font-bold gap-2"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to cancel this order?")) {
                      cancelOrderMutation.mutate(selectedOrder._id)
                    }
                  }}
                >
                  <XCircle className="h-4 w-4" /> CANCEL ORDER
                </Button>
                <Button className="bg-[#2874f0] text-white font-bold gap-2">
                  NEED HELP?
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    )
  }

  if (orders.length === 0) return (
    <div className="text-center py-16 px-4 bg-white rounded-sm shadow-sm border">
      <div className="bg-[#2874f0]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="h-10 w-10 text-[#2874f0]" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Looks like you haven't placed any orders yet. Start shopping and find something you love!
      </p>
      <Button className="bg-[#fb641b] text-white font-bold px-8" onClick={() => window.location.href = '/products'}>
        START SHOPPING
      </Button>
    </div>
  )

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-sm shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 font-bold">{orders.length} TOTAL ORDERS</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order._id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-200 rounded-sm">
            <div className="p-4 sm:p-6 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#2874f0]/10 rounded-sm">
                    <Package className="h-5 w-5 text-[#2874f0]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Order ID</p>
                    <p className="font-mono text-sm font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Placed On</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <Badge 
                    variant={order.status === 'COMPLETED' ? 'success' : order.status === 'CANCELLED' ? 'destructive' : 'warning'}
                    className="h-7 px-3 text-[11px] font-bold"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-6 py-4 border-t border-gray-50">
                <div className="h-16 w-16 rounded-sm bg-gray-50 flex items-center justify-center overflow-hidden border shrink-0">
                  <img src={order.items[0]?.product?.images?.[0]?.url || order.items[0]?.product?.images?.[0]} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{order.items[0]?.product?.title || 'Product'}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.items.length > 1 ? `+ ${order.items.length - 1} more items` : '1 Item'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-gray-900">₹{order.totalPrice.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#2874f0] font-bold hover:bg-[#2874f0]/5 gap-1"
                  onClick={() => setSelectedOrderId(order._id)}
                >
                  VIEW DETAILS <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageTransition>
  )
}
