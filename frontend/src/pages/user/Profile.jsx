import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { User, MapPin, Package, LogOut, ChevronRight, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { authService } from "../../services/auth.service"
import { useAuthStore } from "../../store/authStore"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { PageTransition } from "../../components/animations/PageTransition"
import { cn } from "../../utils/cn"

export function Profile() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState("profile") // profile, addresses, orders
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
      queryClient.invalidateQueries(['addresses'])
      setIsAddingAddress(false)
    }
  })

  const deleteAddressMutation = useMutation({
    mutationFn: authService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses'])
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
    { id: "profile", label: "Personal Information", icon: User },
    { id: "addresses", label: "Manage Addresses", icon: MapPin },
    { id: "orders", label: "My Orders", icon: Package },
  ]

  return (
    <PageTransition className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-4">
          <div className="glass p-4 rounded-xl border border-border flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
              {user?.fullname?.firstName?.[0] || user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hello,</p>
              <p className="font-bold">{user?.fullname?.firstName} {user?.fullname?.lastName}</p>
            </div>
          </div>

          <nav className="glass rounded-xl border border-border overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 text-sm font-medium transition-colors hover:bg-secondary/50",
                  activeTab === item.id ? "text-primary bg-secondary/80" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-4 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors border-t border-border"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle className="text-2xl">
                {menuItems.find(i => i.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === "profile" && (
                <div className="space-y-6 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <Input value={user?.fullname?.firstName} readOnly className="bg-secondary/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <Input value={user?.fullname?.lastName} readOnly className="bg-secondary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <Input value={user?.email} readOnly className="bg-secondary/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <Input value={user?.username} readOnly className="bg-secondary/20" />
                  </div>
                  <div className="pt-4">
                    <Button variant="outline">Edit Information</Button>
                  </div>
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-6">
                  {!isAddingAddress ? (
                    <Button className="w-full sm:w-auto gap-2" onClick={() => setIsAddingAddress(true)}>
                      <Plus className="h-4 w-4" />
                      Add a New Address
                    </Button>
                  ) : (
                    <form onSubmit={handleAddAddress} className="glass p-6 rounded-xl border border-primary/20 space-y-4">
                      <h4 className="font-bold text-lg mb-2">Add New Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Street / Area</label>
                          <Input name="street" placeholder="e.g. Indrapuri" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">City</label>
                          <Input name="city" placeholder="e.g. Bhopal" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">State</label>
                          <Input name="state" placeholder="e.g. Madhya Pradesh" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Pincode</label>
                          <Input name="pincode" placeholder="e.g. 462022" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number</label>
                          <Input name="phone" placeholder="e.g. 9876543210" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Country</label>
                          <Input name="country" defaultValue="India" required />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" name="isDefault" id="isDefault" className="rounded" />
                        <label htmlFor="isDefault" className="text-sm font-medium">Set as default address</label>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={addAddressMutation.isPending}>
                          {addAddressMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Save Address"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}

                  {loadingAddresses ? (
                    <div className="space-y-4">
                      <div className="h-24 w-full bg-secondary/20 animate-pulse rounded-lg" />
                      <div className="h-24 w-full bg-secondary/20 animate-pulse rounded-lg" />
                    </div>
                  ) : addresses?.addresses?.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No addresses found. Add one to get started.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {addresses?.addresses?.map((addr) => (
                        <div key={addr._id} className="p-4 rounded-xl border border-border relative hover:border-primary/50 transition-colors group">
                          {addr.isDefault && (
                            <span className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                              Default
                            </span>
                          )}
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-bold">{addr.fullname || user?.fullname?.firstName + " " + user?.fullname?.lastName}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p className="text-sm font-medium mt-2">Phone: {addr.phone}</p>
                            </div>
                          </div>
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteAddressMutation.mutate(addr._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="text-center py-20 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>You haven't placed any orders yet.</p>
                  <Button variant="link" className="mt-2">Start Shopping</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

      </div>
    </PageTransition>
  )
}
