import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Search, Filter, Loader2, ShoppingCart } from "lucide-react"
import { productService } from "../../services/product.service"
import { cartService } from "../../services/cart.service"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Skeleton } from "../../components/ui/Skeleton"
import { PageTransition } from "../../components/animations/PageTransition"

export function Products() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  
  // Use a simple debounce for search
  // In a real app, use useDebounce hook
  
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', debouncedSearch],
    queryFn: () => productService.getProducts({ q: debouncedSearch })
  })

  const products = productsData?.data || []

  const handleSearch = (e) => {
    e.preventDefault()
    setDebouncedSearch(search)
  }

  const handleAddToCart = async (e, productId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await cartService.addItem(productId, 1)
      alert("Added to cart!") // Replace with Toast notification
    } catch (err) {
      alert("Failed to add to cart")
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="glass p-5 rounded-xl border border-border">
            <div className="flex items-center gap-2 font-semibold mb-4 text-lg">
              <Filter className="h-5 w-5 text-primary" />
              Filters
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" size="icon" variant="secondary">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Categories</label>
                <div className="space-y-2">
                  {['Software', 'Courses', 'Templates', 'Graphics'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Price Range</label>
                <div className="flex gap-2 items-center">
                  <Input type="number" placeholder="Min" className="w-full" />
                  <span>-</span>
                  <Input type="number" placeholder="Max" className="w-full" />
                </div>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">All Products</h2>
            <select className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option>Latest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive glass rounded-xl border border-destructive/20">
              Failed to load products. Please try again later.
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground glass rounded-xl border border-border">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Link key={product._id} to={`/products/${product._id}`} className="group relative block">
                  <div className="glass rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.title} 
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="font-bold text-lg">
                          {product.price?.currency === 'USD' ? '$' : '₹'}{product.price?.amount}
                        </div>
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full z-10" onClick={(e) => handleAddToCart(e, product._id)}>
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  )
}
