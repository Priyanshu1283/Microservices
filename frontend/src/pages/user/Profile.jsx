import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { User, MapPin, Package, LogOut, ChevronRight, Plus, Trash2, CheckCircle2, ShieldCheck, Mail, ShieldAlert, Key } from "lucide-react"
import { authService } from "../../services/auth.service"
import { useAuthStore } from "../../store/authStore"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { PageTransition } from "../../components/animations/PageTransition"
import { cn } from "../../utils/cn"

export function Profile() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState("profile") // profile, addresses
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const queryClient = useQueryClient()

  const { data: addresses, isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: authService.getAddresses,
    enabled: activeTab === "addresses"
  })

  const addAddressMutation = useMutation({
    mutationFn: authService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setIsAddingAddress(false)
    }
  })

  const deleteAddressMutation = useMutation({
    mutationFn: authService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })

  const handleAddAddress = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const addressData = {
      street: formData.get("street"),
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      country: formData.get("country") || "India",
      phone: formData.get("phone"),
      isDefault: formData.get("isDefault") === "on"
    }
    addAddressMutation.mutate(addressData)
  }

  const menuItems = [
    { id: "profile", label: "Account Information", icon: User },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
  ]

  return (
    <PageTransition className="max-w-6xl mx-auto py-2 sm:py-6">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Selector */}
        <aside className="w-full md:w-68 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850/80 p-5 rounded-2xl flex items-center gap-4 mb-2 shadow-xs transition-colors duration-300">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20 shadow-inner">
              {user?.fullname?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Customer Deck</p>
              <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate max-w-[120px]">{user?.fullname?.firstName} {user?.fullname?.lastName}</p>
            </div>
          </div>

          <nav className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850/80 rounded-2xl overflow-hidden shadow-xs transition-colors duration-300">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 text-xs font-black uppercase tracking-wider transition-colors hover:bg-gray-50 dark:hover:bg-zinc-850/50 cursor-pointer",
                    isActive ? "text-primary bg-primary/5 dark:bg-primary/10" : "text-gray-500 dark:text-zinc-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4.5 w-4.5" />
                    {item.label}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-4 text-xs font-black uppercase tracking-wider text-destructive hover:bg-destructive/5 transition-colors border-t border-gray-100 dark:border-zinc-800 cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content Area Panel */}
        <main className="flex-1">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850/80 rounded-2xl shadow-xs min-h-[460px] p-6 sm:p-8 transition-colors duration-300 space-y-6">
            
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white border-b border-gray-50 dark:border-zinc-800/50 pb-4">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>

            {/* TAB: PROFILE ACCOUNT INFO */}
            {activeTab === "profile" && (
              <div className="space-y-6 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    <label>First Name</label>
                    <Input value={user?.fullname?.firstName || ''} readOnly className="bg-gray-55 dark:bg-zinc-950 font-bold border-transparent rounded-xl text-gray-700 dark:text-zinc-300" />
                  </div>
                  <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    <label>Last Name</label>
                    <Input value={user?.fullname?.lastName || ''} readOnly className="bg-gray-55 dark:bg-zinc-950 font-bold border-transparent rounded-xl text-gray-700 dark:text-zinc-300" />
                  </div>
                </div>
                
                <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  <label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email Address</label>
                  <Input value={user?.email || ''} readOnly className="bg-gray-55 dark:bg-zinc-950 font-bold border-transparent rounded-xl text-gray-700 dark:text-zinc-300" />
                </div>

                <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  <label className="flex items-center gap-1"><Key className="h-3.5 w-3.5" /> Username</label>
                  <Input value={user?.username || ''} readOnly className="bg-gray-55 dark:bg-zinc-950 font-bold border-transparent rounded-xl text-gray-700 dark:text-zinc-300" />
                </div>
                
                <div className="pt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10.5px] font-extrabold uppercase tracking-wide">
                    <ShieldCheck className="h-4 w-4" /> Secured Account
                  </span>
                </div>
              </div>
            )}

            {/* TAB: MANAGING ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                {!isAddingAddress ? (
                  <Button className="w-full sm:w-auto gap-2 rounded-xl font-bold text-xs tracking-wider cursor-pointer shadow-md shadow-primary/10" onClick={() => setIsAddingAddress(true)}>
                    <Plus className="h-4.5 w-4.5" />
                    ADD A NEW ADDRESS
                  </Button>
                ) : (
                  <form onSubmit={handleAddAddress} className="bg-gray-50/60 dark:bg-zinc-950/20 p-5 rounded-2xl border border-primary/20 dark:border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Add New Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        <label>Street / Area</label>
                        <Input name="street" placeholder="e.g. Indrapuri" required className="rounded-xl border-gray-200 dark:border-zinc-800" />
                      </div>
                      <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        <label>City</label>
                        <Input name="city" placeholder="e.g. Bhopal" required className="rounded-xl border-gray-200 dark:border-zinc-800" />
                      </div>
                      <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        <label>State</label>
                        <Input name="state" placeholder="e.g. Madhya Pradesh" required className="rounded-xl border-gray-200 dark:border-zinc-800" />
                      </div>
                      <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        <label>Pincode</label>
                        <Input name="pincode" placeholder="e.g. 462022" required className="rounded-xl border-gray-200 dark:border-zinc-800" />
                      </div>
                      <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        <label>Phone Number</label>
                        <Input name="phone" placeholder="e.g. 9876543210" required className="rounded-xl border-gray-200 dark:border-zinc-800" />
                      </div>
                      <div className="space-y-1.5 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        <label>Country</label>
                        <Input name="country" defaultValue="India" required className="rounded-xl border-gray-200 dark:border-zinc-800" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" name="isDefault" id="isDefault" className="rounded text-primary focus:ring-primary h-4 w-4" />
                      <label htmlFor="isDefault" className="text-xs font-bold text-gray-600 dark:text-zinc-300">Set as default address</label>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-zinc-850">
                      <Button type="submit" disabled={addAddressMutation.isPending} className="rounded-full font-bold text-xs px-6 py-2 cursor-pointer shadow-md">
                        {addAddressMutation.isPending ? <Loader2 className="animate-spin h-4.5 w-4.5" /> : "SAVE ADDRESS"}
                      </Button>
                      <Button type="button" variant="ghost" className="rounded-full text-xs font-bold px-6 py-2 cursor-pointer text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => setIsAddingAddress(false)}>CANCEL</Button>
                    </div>
                  </form>
                )}

                {loadingAddresses ? (
                  <div className="space-y-4">
                    <div className="h-24 w-full bg-gray-50 dark:bg-zinc-950 animate-pulse rounded-2xl" />
                    <div className="h-24 w-full bg-gray-50 dark:bg-zinc-950 animate-pulse rounded-2xl" />
                  </div>
                ) : addresses?.addresses?.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-25" />
                    <p className="text-xs font-bold text-gray-500 dark:text-zinc-400">No addresses found. Add one above to get started!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {addresses?.addresses?.map((addr) => (
                      <div key={addr._id} className="p-5 rounded-2xl border border-gray-150 dark:border-zinc-800/80 relative hover:border-primary dark:hover:border-primary/60 transition-all duration-300 group bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md flex items-start justify-between">
                        
                        <div className="flex items-start gap-4">
                          <div className="mt-1 p-2 rounded-xl bg-gray-50 dark:bg-zinc-950 text-gray-400 dark:text-zinc-500 border border-gray-100 dark:border-zinc-800 flex items-center justify-center">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-gray-900 dark:text-white">{addr.fullname || user?.fullname?.firstName + " " + user?.fullname?.lastName}</p>
                              {addr.isDefault && (
                                <span className="bg-primary/10 text-primary dark:bg-primary/20 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-gray-400 dark:text-zinc-500 font-bold mt-2">Phone: {addr.phone}</p>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8.5 w-8.5 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer flex items-center justify-center" 
                            onClick={() => deleteAddressMutation.mutate(addr._id)}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>

      </div>
    </PageTransition>
  )
}
