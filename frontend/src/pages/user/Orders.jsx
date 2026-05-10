import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../../services/order.service'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Package, Clock, MapPin, ChevronRight, ShoppingBag } from 'lucide-react'

export function Orders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders()
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Failed to load orders</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  const orders = data?.orders || []

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't placed any orders yet. Start shopping and find something you love!
        </p>
        <Button onClick={() => window.location.href = '/products'}>
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order._id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Placed On</p>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Badge 
                    variant={order.status === 'COMPLETED' ? 'success' : order.status === 'PENDING' ? 'warning' : 'secondary'}
                    className="h-7 px-3"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 py-3 border-t first:border-t-0">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm sm:text-base line-clamp-1">{item.product?.title || 'Unknown Product'}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Qty: {item.quantity} × {item.price.currency} {item.price.amount}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.price.currency} {item.price.amount * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="line-clamp-1">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-right flex-1 sm:flex-none">
                    <p className="text-xs font-medium text-muted-foreground">Total Paid</p>
                    <p className="text-lg font-bold text-primary">
                      {order.totalPrice.currency} {order.totalPrice.amount}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    Details <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
