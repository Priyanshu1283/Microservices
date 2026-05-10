import { Outlet, Link } from "react-router-dom"
import { ShoppingCart, User, Moon, Sun, Search, Package } from "lucide-react"
import { useThemeStore } from "../store/themeStore"
import { useAuthStore } from "../store/authStore"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"

export function MainLayout() {
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Package className="h-6 w-6 text-primary" />
            <span>StoreFront</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 bg-background/50 border-muted focus-visible:ring-primary"
            />
          </div>

          <nav className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Orders
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Profile
                  </Button>
                </Link>
                {user?.role !== 'user' && (
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
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
