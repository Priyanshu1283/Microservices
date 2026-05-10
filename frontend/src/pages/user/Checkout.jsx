import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MapPin, ShoppingBag, CreditCard, ChevronRight, CheckCircle2, Plus, Loader2 } from "lucide-react"
import { cartService } from "../../services/cart.service"
import { authService } from "../../services/auth.service"
import { orderService } from "../../services/order.service"
import { paymentService } from "../../services/payment.service"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { PageTransition } from "../../components/animations/PageTransition"
import { cn } from "../../utils/cn"

export function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1) // 1: Address, 2: Summary, 3: Payment
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  
  const { data: cartData } = useQuery({ queryKey: ['cart'], queryFn: cartService.getCart })
  const { data: addressesData, isLoading: loadingAddresses } = useQuery({ queryKey: ['addresses'], queryFn: authService.getAddresses })

  const selectedAddress = addressesData?.addresses?.find(a => a._id === selectedAddressId) || addressesData?.addresses?.find(a => a.isDefault)

  useEffect(() => {
    if (selectedAddress && !selectedAddressId) {
      setSelectedAddressId(selectedAddress._id)
    }
  }, [selectedAddress, selectedAddressId])

  const createOrderMutation = useMutation({
    mutationFn: (address) => orderService.createOrder(address),
    onSuccess: async (data) => {
      const orderId = data.order._id
      handlePayment(orderId)
    }
  })

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async (orderId) => {
    const res = await loadRazorpay()
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?")
      return
    }

    try {
      const paymentData = await paymentService.createPayment(orderId)
      const { payment } = paymentData

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: payment.price.amount,
        currency: payment.price.currency,
        name: "StoreFront",
        description: "Payment for Order #" + orderId,
        order_id: payment.razorpayOrderId,
        handler: async function (response) {
          const verifyData = {
            razorpayOrderId: payment.razorpayOrderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          }
          try {
            await paymentService.verifyPayment(verifyData)
            queryClient.invalidateQueries(['cart'])
            navigate('/profile', { state: { tab: 'orders', message: 'Order placed successfully!' } })
          } catch (err) {
            alert("Payment verification failed!")
          }
        },
        prefill: {
          name: addressesData?.user?.fullname?.firstName + " " + addressesData?.user?.fullname?.lastName,
          email: addressesData?.user?.email
        },
        theme: {
          color: "#2874f0"
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (err) {
      console.error(err)
      alert("Failed to initiate payment")
    }
  }

  if (!cartData?.cart?.items?.length && step === 1) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button className="mt-4" onClick={() => navigate('/products')}>Go to Shop</Button>
      </div>
    )
  }

  return (
    <PageTransition className="max-w-4xl mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Steps */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Step 1: Delivery Address */}
          <div className={cn("glass rounded-lg border overflow-hidden", step === 1 ? "border-primary ring-1 ring-primary/20" : "border-border opacity-70")}>
            <div className={cn("px-6 py-4 flex items-center justify-between", step === 1 ? "bg-primary text-white" : "bg-secondary")}>
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded bg-white text-primary flex items-center justify-center font-bold text-xs">1</span>
                <h3 className="font-bold uppercase text-sm tracking-wider">Delivery Address</h3>
                {step > 1 && <CheckCircle2 className="h-5 w-5 ml-2" />}
              </div>
              {step > 1 && (
                <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary underline" onClick={() => setStep(1)}>
                  CHANGE
                </Button>
              )}
            </div>
            
            {step === 1 && (
              <CardContent className="p-6">
                {loadingAddresses ? (
                   <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
                ) : (
                  <div className="space-y-4">
                    {addressesData?.addresses?.map((addr) => (
                      <label key={addr._id} className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        selectedAddressId === addr._id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/30"
                      )}>
                        <input 
                          type="radio" 
                          name="address" 
                          className="mt-1" 
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{addr.fullname || "Home"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs font-bold mt-2">Phone: {addr.phone}</p>
                          {selectedAddressId === addr._id && (
                            <Button className="mt-4 px-8" onClick={() => setStep(2)}>DELIVER HERE</Button>
                          )}
                        </div>
                      </label>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={() => navigate('/profile')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
            {step > 1 && selectedAddress && (
               <div className="p-4 px-6 text-sm">
                  <p className="font-bold">{selectedAddress.fullname}</p>
                  <p className="text-muted-foreground">{selectedAddress.street}, {selectedAddress.city}...</p>
               </div>
            )}
          </div>

          {/* Step 2: Order Summary */}
          <div className={cn("glass rounded-lg border overflow-hidden", step === 2 ? "border-primary ring-1 ring-primary/20" : "border-border", step < 2 && "opacity-50 pointer-events-none")}>
            <div className={cn("px-6 py-4 flex items-center justify-between", step === 2 ? "bg-primary text-white" : "bg-secondary")}>
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded bg-white text-primary flex items-center justify-center font-bold text-xs">2</span>
                <h3 className="font-bold uppercase text-sm tracking-wider">Order Summary</h3>
              </div>
            </div>
            {step === 2 && (
              <CardContent className="p-0">
                <div className="divide-y">
                  {cartData?.checkout?.lines?.map((line) => (
                    <div key={line.productId} className="p-4 flex gap-4">
                      <div className="h-20 w-20 bg-secondary rounded overflow-hidden flex-shrink-0">
                         {line.product?.images?.[0] && <img src={line.product.images[0].url} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{line.product?.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {line.quantity}</p>
                        <p className="font-bold text-sm mt-2">₹{line.lineTotal}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 flex justify-end border-t">
                   <Button onClick={() => setStep(3)}>CONTINUE TO PAYMENT</Button>
                </div>
              </CardContent>
            )}
          </div>

          {/* Step 3: Payment Options */}
          <div className={cn("glass rounded-lg border overflow-hidden", step === 3 ? "border-primary ring-1 ring-primary/20" : "border-border", step < 3 && "opacity-50 pointer-events-none")}>
             <div className={cn("px-6 py-4 flex items-center justify-between", step === 3 ? "bg-primary text-white" : "bg-secondary")}>
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded bg-white text-primary flex items-center justify-center font-bold text-xs">3</span>
                  <h3 className="font-bold uppercase text-sm tracking-wider">Payment Options</h3>
                </div>
              </div>
              {step === 3 && (
                <CardContent className="p-6">
                   <div className="space-y-4">
                      <label className="flex items-center gap-4 p-4 rounded-lg border border-primary bg-primary/5 cursor-pointer">
                         <input type="radio" checked readOnly />
                         <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span className="font-bold text-sm">Online Payment (UPI, Card, NetBanking)</span>
                         </div>
                      </label>
                      <Button 
                        className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90" 
                        disabled={createOrderMutation.isPending}
                        onClick={() => {
                          const addressBody = {
                            street: selectedAddress.street,
                            city: selectedAddress.city,
                            state: selectedAddress.state,
                            pincode: selectedAddress.pincode,
                            country: selectedAddress.country || "India"
                          }
                          createOrderMutation.mutate(addressBody)
                        }}
                      >
                        {createOrderMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "PAY ₹" + cartData?.checkout?.totalAmount}
                      </Button>
                   </div>
                </CardContent>
              )}
          </div>

        </div>

        {/* Right Sidebar: Price Details */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Price Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex justify-between text-sm">
                  <span>Price ({cartData?.totals?.itemCount} items)</span>
                  <span>₹{cartData?.checkout?.totalAmount}</span>
               </div>
               <div className="flex justify-between text-sm text-green-600">
                  <span>Delivery Charges</span>
                  <span className="uppercase">Free</span>
               </div>
               <div className="pt-4 border-t border-dashed flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{cartData?.checkout?.totalAmount}</span>
               </div>
               <p className="text-xs text-green-600 font-bold">You will save ₹0 on this order</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </PageTransition>
  )
}
