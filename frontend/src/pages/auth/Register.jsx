import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Package, Loader2 } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { authService } from "../../services/auth.service"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { PageTransition } from "../../components/animations/PageTransition"

export function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [error, setError] = useState("")
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm()

  const onSubmit = async (data) => {
    try {
      setError("")
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        fullname: {
          firstName: data.firstName,
          lastName: data.lastName
        },
        role: data.role // 'user' or 'seller'
      }
      const res = await authService.register(payload)
      setUser(res.user)
      
      if (res.user.role === 'seller') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to register. Please try again.")
    }
  }

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md p-8 rounded-2xl glass shadow-lg border border-border">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl mb-2">
            <Package className="h-8 w-8 text-primary" />
            <span>StoreFront</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
          <p className="text-muted-foreground text-sm">Join our premium marketplace today</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input 
                type="text" 
                placeholder="John" 
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                type="text" 
                placeholder="Doe" 
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input 
              type="text" 
              placeholder="johndoe" 
              {...register("username", { 
                required: "Username is required",
                minLength: { value: 3, message: "Username must be at least 3 characters" }
              })}
            />
            {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Type</label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("role")}
              defaultValue="user"
            >
              <option value="user" className="bg-background text-foreground">Buyer</option>
              <option value="seller" className="bg-background text-foreground">Seller</option>
            </select>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
