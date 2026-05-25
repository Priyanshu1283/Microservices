import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  Loader2, 
  ShieldCheck,
  Truck,
  ArrowRight,
  Info
} from "lucide-react"
import { cartService } from "../../services/cart.service"
import { authService } from "../../services/auth.service"
import { orderService } from "../../services/order.service"
import { paymentService } from "../../services/payment.service"
import { Button } from "../../components/ui/Button"
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
    },
    onError: (err) => {
      console.error("Order creation failed:", err)
      alert(err.response?.data?.message || "Failed to create order. Please check your cart.")
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
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            navigate('/profile', { state: { tab: 'orders', message: 'Order placed successfully!' } })
          } catch (err) {
            alert("Payment verification failed!")
          }
        },
        prefill: {
          name: (addressesData?.user?.fullname?.firstName || "") + " " + (addressesData?.user?.fullname?.lastName || "User"),
          email: addressesData?.user?.email || "user@example.com",
          contact: selectedAddress?.phone || "9999999999"
        },
        theme: {
          color: "#2563eb"
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
    <PageTransition className="max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black mb-8 tracking-tight text-gray-900 dark:text-white border-b border-gray-50 dark:border-zinc-855/50 pb-4">
        Checkout Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Steps Accordion */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Step 1: Delivery Address */}
          <div className={cn(
            "bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-300 shadow-xs",
            step === 1 ? "border-primary ring-4 ring-primary/5" : "border-gray-150 dark:border-zinc-800"
          )}>
            <div className={cn(
              "px-6 py-4 flex items-center justify-between transition-all",
              step === 1 ? "bg-primary text-white" : "bg-gray-50 dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-850"
            )}>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs",
                  step === 1 ? "bg-white text-primary" : "bg-primary/10 text-primary"
                )}>1</span>
                <h3 className="font-extrabold uppercase text-xs tracking-wider">Delivery Address</h3>
                {step > 1 && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 fill-current text-white ml-2" />}
              </div>
              {step > 1 && (
                <button 
                  className="text-xs font-black text-primary hover:underline cursor-pointer" 
                  onClick={() => setStep(1)}
                >
                  EDIT
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {step === 1 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-6 space-y-4 overflow-hidden"
                >
                  {loadingAddresses ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary h-6 w-6" /></div>
                  ) : (
                    <div className="space-y-3.5">
                      {addressesData?.addresses?.map((addr) => (
                        <label 
                          key={addr._id} 
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                            selectedAddressId === addr._id 
                              ? "border-primary bg-primary/5 dark:bg-primary/10" 
                              : "border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850/50"
                          )}
                        >
                          <input 
                            type="radio" 
                            name="address" 
                            className="mt-1" 
                            checked={selectedAddressId === addr._id}
                            onChange={() => setSelectedAddressId(addr._id)}
                          />
                          <div className="flex-1 text-xs">
                            <p className="font-black text-sm text-gray-900 dark:text-white">{addr.fullname || "Home Address"}</p>
                            <p className="text-gray-500 dark:text-zinc-400 mt-1 font-semibold leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-gray-400 dark:text-zinc-500 font-bold mt-2">Phone: {addr.phone}</p>
                            {selectedAddressId === addr._id && (
                              <Button 
                                className="mt-4 px-8 rounded-full font-bold text-xs py-2 shadow-md shadow-primary/10 cursor-pointer animate-in fade-in zoom-in duration-200" 
                                onClick={() => setStep(2)}
                              >
                                Deliver to this Address
                              </Button>
                            )}
                          </div>
                        </label>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed rounded-xl py-3 text-xs font-bold border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-850/50 cursor-pointer flex items-center justify-center gap-1.5" 
                        onClick={() => navigate('/profile')}
                      >
                        <Plus className="h-4 w-4" /> Add New Delivery Address
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {step > 1 && selectedAddress && (
               <div className="p-4 px-6 text-xs font-semibold text-gray-600 dark:text-zinc-300 bg-gray-50/50 dark:bg-zinc-950/20">
                  <p className="font-black text-gray-950 dark:text-white text-sm">{selectedAddress.fullname}</p>
                  <p className="text-gray-400 dark:text-zinc-500 mt-0.5 leading-relaxed">{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
               </div>
            )}
          </div>

          {/* Step 2: Order Summary */}
          <div className={cn(
            "bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-300 shadow-xs",
            step === 2 ? "border-primary ring-4 ring-primary/5" : "border-gray-150 dark:border-zinc-800",
            step < 2 && "opacity-50 pointer-events-none"
          )}>
            <div className={cn(
              "px-6 py-4 flex items-center justify-between transition-all",
              step === 2 ? "bg-primary text-white" : "bg-gray-50 dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-850"
            )}>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs",
                  step === 2 ? "bg-white text-primary" : "bg-primary/10 text-primary"
                )}>2</span>
                <h3 className="font-extrabold uppercase text-xs tracking-wider">Order Summary</h3>
                {step > 2 && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 fill-current text-white ml-2" />}
              </div>
              {step > 2 && (
                <button 
                  className="text-xs font-black text-primary hover:underline cursor-pointer" 
                  onClick={() => setStep(2)}
                >
                  EDIT
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {step === 2 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-gray-100 dark:divide-zinc-850">
                    {cartData?.checkout?.lines?.map((line) => (
                      <div key={line.productId} className="p-5 flex gap-4 text-xs font-semibold">
                        <div className="h-16 w-16 bg-gray-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 dark:border-zinc-850 shadow-inner">
                           {line.product?.images?.[0] && <img src={line.product.images[0].url || line.product.images[0]} className="max-h-full max-w-full object-contain" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{line.product?.title}</p>
                          <p className="text-gray-450 dark:text-zinc-500">Quantity: {line.quantity}</p>
                          <p className="font-black text-sm text-gray-900 dark:text-white pt-1">₹{line.lineTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 flex justify-end border-t border-gray-100 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-950/20">
                     <Button className="rounded-full font-bold text-xs px-8 cursor-pointer shadow-md" onClick={() => setStep(3)}>
                       Continue to Payment
                     </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 3: Payment Options */}
          <div className={cn(
            "bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-300 shadow-xs",
            step === 3 ? "border-primary ring-4 ring-primary/5" : "border-gray-150 dark:border-zinc-800",
            step < 3 && "opacity-50 pointer-events-none"
          )}>
             <div className={cn(
                "px-6 py-4 flex items-center justify-between transition-all",
                step === 3 ? "bg-primary text-white" : "bg-gray-50 dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-850"
             )}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs",
                    step === 3 ? "bg-white text-primary" : "bg-primary/10 text-primary"
                  )}>3</span>
                  <h3 className="font-extrabold uppercase text-xs tracking-wider">Payment Options</h3>
                </div>
              </div>
              <AnimatePresence>
                {step === 3 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6 space-y-5 overflow-hidden"
                  >
                     <div className="space-y-4">
                        <label className="flex items-center gap-4 p-4 rounded-xl border border-primary bg-primary/5 dark:bg-primary/10 cursor-pointer shadow-2xs">
                           <input type="radio" checked readOnly className="text-primary focus:ring-primary" />
                           <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-primary" />
                              <span className="font-extrabold text-xs text-gray-905 dark:text-zinc-200">Online Secure Payments (UPI, Cards, NetBanking via Razorpay)</span>
                           </div>
                        </label>
                        
                        <Button 
                          className="w-full h-12 text-sm font-black tracking-wider bg-accent hover:bg-accent/95 rounded-xl shadow-lg shadow-accent/15 cursor-pointer flex items-center justify-center gap-1.5" 
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
                          {createOrderMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldCheck className="h-5 w-5 fill-current text-white" />}
                          PROCEED TO PAY ₹{cartData?.checkout?.totalAmount?.toLocaleString()}
                        </Button>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

        </div>

        {/* Right Sidebar: Stripe-like Invoice Summary */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-150 dark:border-zinc-850/80 shadow-xs space-y-6 transition-colors duration-300">
            <h3 className="font-extrabold text-base border-b border-gray-50 dark:border-zinc-800/50 pb-3 text-gray-900 dark:text-white">Price Details</h3>
            
            <div className="space-y-4 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Items ({cartData?.totals?.itemCount})</span>
                <span className="text-gray-900 dark:text-white font-bold">₹{cartData?.checkout?.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Delivery Charges</span>
                <span className="font-extrabold uppercase">FREE</span>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-gray-900 dark:text-white">
                <span className="font-extrabold text-sm">Total Amount</span>
                <span className="font-black text-xl">₹{cartData?.checkout?.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-center text-gray-400 dark:text-zinc-500 flex items-center justify-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Fully secure payment processing SSL encryption
          </div>
        </div>

      </div>
    </PageTransition>
  )
}
