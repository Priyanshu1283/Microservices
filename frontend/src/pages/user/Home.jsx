import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { 
  ShoppingBag, 
  Star, 
  Smartphone, 
  Shirt, 
  Watch, 
  Laptop, 
  Home as HomeIcon, 
  Gamepad2, 
  Utensils, 
  Car, 
  Armchair,
  ChevronRight
} from 'lucide-react'

const categories = [
  { name: 'For You', icon: ShoppingBag },
  { name: 'Fashion', icon: Shirt },
  { name: 'Mobiles', icon: Smartphone },
  { name: 'Beauty', icon: Watch },
  { name: 'Electronics', icon: Laptop },
  { name: 'Home', icon: HomeIcon },
  { name: 'Appliances', icon: Gamepad2 },
  { name: 'Toys', icon: Gamepad2 },
  { name: 'Food', icon: Utensils },
  { name: 'Auto', icon: Car },
  { name: 'Furniture', icon: Armchair },
]

export function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products')
      return response.data
    }
  })

  const products = data?.data || []

  return (
    <div className="space-y-4 -mt-8 -mx-4 sm:-mx-0">
      {/* Category Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between min-w-max gap-8 md:gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/products?category=${encodeURIComponent(cat.name === 'For You' ? 'All' : cat.name)}`}
              className="flex flex-col items-center gap-1 group min-w-[70px]"
            >
              <div className="p-2 transition-colors">
                <cat.icon className="h-6 w-6 text-gray-700 group-hover:text-primary" />
              </div>
              <span className="text-[12px] font-semibold text-gray-700 group-hover:text-primary whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-2">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 shadow-sm rounded-sm">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-sm text-gray-500">Based on your interests</p>
              </div>
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5">
                VIEW ALL <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <Link to={`/products/${product._id}`} key={product._id} className="group border rounded-sm hover:shadow-lg transition-all duration-300">
                  <div className="h-full bg-white p-4 flex flex-col gap-3">
                    <div className="aspect-[4/5] overflow-hidden flex items-center justify-center p-2 relative bg-[#f9f9f9] rounded-sm">
                      <img 
                        src={product.images[0]?.url || product.images[0]} 
                        alt={product.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="rating" className="flex items-center gap-1">
                          {product.rating || 4.5} <Star className="h-2.5 w-2.5 fill-white" />
                        </Badge>
                        <span className="text-[11px] text-gray-400 font-medium">({(product.numReviews || 0).toLocaleString()})</span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">₹{(product.price.amount).toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-[#388e3c]">
                          Bank Offer Applied
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
