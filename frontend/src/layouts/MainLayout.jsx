import React from "react"
import { Outlet, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ShoppingCart, User, Moon, Sun, Search, Package } from "lucide-react"
import { useThemeStore } from "../store/themeStore"
import { useAuthStore } from "../store/authStore"
import { cartService } from "../services/cart.service"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"

export function MainLayout() {
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const navigate = useNavigate()
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated
  })
  
  const cartItemCount = cartData?.totals?.itemCount || 0;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm py-2">
        <div className="container mx-auto px-4 flex items-center justify-between gap-8 h-12">
          
          <div className="flex items-center gap-10 flex-1">
            <Link to="/" className="flex flex-col items-start leading-tight">
              <div className="bg-[#ffe11b] px-2 py-0.5 rounded-sm">
                <span className="text-[#2874f0] font-bold italic text-xl">Pranshu</span>
              </div>
              <span className="text-[11px] italic font-medium text-gray-500 pl-1">
                Explore <span className="text-[#ffe11b] font-bold">Test Mode</span>
              </span>
            </Link>

            <div className="flex-1 max-w-2xl relative">
              <div className="flex items-center w-full bg-[#f0f5ff] rounded-md border border-transparent focus-within:border-[#2874f0] group transition-all">
                <Search className="ml-4 h-4 w-4 text-gray-500 group-focus-within:text-[#2874f0]" />
                <Input 
                  placeholder="Search for Products, Brands and More" 
                  className="border-none bg-transparent focus-visible:ring-0 text-sm h-10 w-full placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <Link to="/orders" className="flex items-center gap-2 text-gray-700 hover:text-[#2874f0] transition-colors">
                  <Package className="h-5 w-5" />
                  <span className="text-sm font-medium">Orders</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-[#2874f0] transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">Profile</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-700">Logout</Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 font-medium flex items-center gap-2 hover:bg-[#2874f0] hover:text-white border border-gray-200 px-6">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}

            <Link to="/cart" className="flex items-center gap-2 text-gray-700 hover:text-[#2874f0] transition-colors">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[#ff6161] text-white text-[10px] flex items-center justify-center font-bold animate-in fade-in zoom-in duration-300">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">Cart</span>
            </Link>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-500">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container mx-auto px-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 StoreFront. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
