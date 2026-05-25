import React, { useState, useEffect, useRef } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingCart, 
  User, 
  Moon, 
  Sun, 
  Search, 
  Package, 
  LogOut, 
  Settings, 
  ChevronDown, 
  ShoppingBag,
  Sparkles,
  HelpCircle,
  Shield,
  Menu,
  X
} from "lucide-react"
import { useThemeStore } from "../store/themeStore"
import { useAuthStore } from "../store/authStore"
import { cartService } from "../services/cart.service"
import { Button } from "../components/ui/Button"

export function MainLayout() {
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated
  })
  
  const cartItemCount = cartData?.totals?.itemCount || 0

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-zinc-950 text-foreground transition-colors duration-300 antialiased font-sans">
      
      {/* PREMIUM GLASSMORPHISM STICKY NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800/80 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* BRAND LOGO */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group transition-all duration-300">
                <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  Store<span className="text-primary">Front</span>
                </span>
              </Link>
            </div>

            {/* EXPANDABLE PREMIUM SEARCH BAR */}
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search for premium products, brands & more..." 
                  className="w-full bg-gray-55 dark:bg-zinc-800/50 border border-transparent rounded-full py-2 pl-11 pr-5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium text-foreground shadow-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
                {searchQuery.trim() && (
                  <button 
                    onClick={handleSearchSubmit}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/95 text-white text-[11px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer"
                  >
                    Find
                  </button>
                )}
              </div>
            </div>

            {/* NAVIGATION LINKS */}
            <nav className="hidden md:flex items-center gap-5">
              
              {/* Dark mode toggler */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="text-gray-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer h-9.5 w-9.5"
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </Button>

              {/* Shopping Cart with bounce count badge */}
              <Link to="/cart" className="relative group p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all duration-300">
                <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-zinc-300 group-hover:text-primary transition-colors" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-black shadow-md border-2 border-white dark:border-zinc-900"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Conditional Auth drop menu */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-3 pr-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-300 text-sm font-semibold text-gray-700 dark:text-zinc-300 border border-gray-100 dark:border-zinc-850 cursor-pointer"
                  >
                    <div className="h-6.5 w-6.5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-inner border border-primary/20">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">{user?.name}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-sm"
                      >
                        {/* Profile Header */}
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          {user?.role && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-extrabold uppercase bg-primary/10 text-primary dark:bg-primary/25 rounded-md">
                              {user.role}
                            </span>
                          )}
                        </div>

                        {/* Navigation items */}
                        <div className="py-1">
                          <Link 
                            to="/orders" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                          >
                            <Package className="h-4 w-4 text-gray-400" />
                            My Orders
                          </Link>
                          <Link 
                            to="/profile" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                          >
                            <User className="h-4 w-4 text-gray-400" />
                            My Profile
                          </Link>
                          {(user?.role === 'seller' || user?.role === 'admin') && (
                            <Link 
                              to="/dashboard" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                              <Shield className="h-4 w-4 text-gray-400" />
                              Seller Console
                            </Link>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 dark:border-zinc-800 pt-1 mt-1">
                          <button 
                            onClick={() => {
                              setDropdownOpen(false)
                              logout()
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-destructive hover:bg-destructive/5 transition-colors font-medium cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="default" size="sm" className="font-semibold rounded-full px-5 py-2 cursor-pointer shadow-md shadow-primary/10">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>

            {/* MOBILE MENU TOGGLER */}
            <div className="flex items-center gap-2 md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="text-gray-500 rounded-full h-9 w-9 cursor-pointer dark:text-zinc-400"
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </Button>
              <Link to="/cart" className="relative p-2 text-gray-700 dark:text-zinc-300">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 h-4.5 w-4.5 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full text-gray-700 dark:text-zinc-300 cursor-pointer h-9 w-9"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

          </div>
        </div>

        {/* MOBILE SLIDE-IN NAV MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-lg"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search premium products..." 
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-transparent rounded-xl py-2 pl-10 pr-4 text-xs placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary text-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                  />
                </div>

                {/* Mobile Links */}
                <div className="flex flex-col gap-1">
                  <Link to="/" className="px-3 py-2.5 rounded-xl hover:bg-gray-55 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center gap-2">
                    Home Store
                  </Link>
                  <Link to="/products" className="px-3 py-2.5 rounded-xl hover:bg-gray-55 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center gap-2">
                    All Products
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link to="/orders" className="px-3 py-2.5 rounded-xl hover:bg-gray-55 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center gap-2">
                        My Orders
                      </Link>
                      <Link to="/profile" className="px-3 py-2.5 rounded-xl hover:bg-gray-55 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center gap-2">
                        My Profile
                      </Link>
                      {(user?.role === 'seller' || user?.role === 'admin') && (
                        <Link to="/dashboard" className="px-3 py-2.5 rounded-xl hover:bg-gray-55 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center gap-2 text-primary">
                          Seller Console
                        </Link>
                      )}
                      <button 
                        onClick={logout}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-destructive/5 text-sm font-bold text-destructive flex items-center gap-2 text-left cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login">
                      <Button className="w-full font-bold py-2 rounded-xl shadow-md">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* GLOBAL MAIN CONTENT AREA */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <Outlet />
      </main>

      {/* MINIMALIST PREMIUM FOOTER */}
      <footer className="border-t border-gray-150 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-10 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-semibold text-gray-500 dark:text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">Store<span className="text-primary">Front</span></span>
            <p>© 2026 StoreFront. Re-architected with premium polish.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
