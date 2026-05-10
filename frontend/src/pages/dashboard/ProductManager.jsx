import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Edit2, Trash2, Package, Image as ImageIcon, Loader2, X } from "lucide-react"
import { productService } from "../../services/product.service"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { PageTransition } from "../../components/animations/PageTransition"
import { cn } from "../../utils/cn"

export function ProductManager() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [search, setSearch] = useState("")
  
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: productService.getSellerProducts
  })

  const createProductMutation = useMutation({
    mutationFn: (formData) => productService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products'])
      setIsAdding(false)
    }
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products'])
    }
  })

  const products = productsData?.data || []

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-sm text-muted-foreground">Add and manage your store's digital products.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your products..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border-dashed border-2">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground">Start by adding your first digital product.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAdding(true)}>Add Product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden group">
              <div className="aspect-video bg-secondary relative overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 rounded-full shadow-lg"
                    onClick={() => deleteProductMutation.mutate(product._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg line-clamp-1">{product.title}</h3>
                  <span className="font-bold text-primary">₹{product.price?.amount}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className={cn(
                    "px-2 py-1 rounded-full",
                    product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                  <span className="text-muted-foreground">Category: {product.category || "General"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="px-6 py-4 border-b flex items-center justify-between bg-secondary/30">
              <h3 className="font-bold text-xl">Add New Product</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form 
              className="p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                createProductMutation.mutate(formData)
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Title</label>
                  <Input name="title" placeholder="e.g. Premium React Template" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (INR)</label>
                  <Input name="priceAmount" type="number" placeholder="499" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  name="description" 
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Describe your product..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input name="category" placeholder="Software, E-book, etc." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock / Quantity</label>
                  <Input name="stock" type="number" defaultValue="1" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Images</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/10 hover:bg-secondary/20 border-border transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Click to upload (Max 5 images)</p>
                    </div>
                    <input name="images" type="file" multiple className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Create Product
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  )
}

import { motion } from "framer-motion"
