import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Package, Loader2 } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { authService } from "../../services/auth.service"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { PageTransition } from "../../components/animations/PageTransition"

export function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [error, setError] = useState("")
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      setError("")
      const res = await authService.login(data)
      setUser(res.user)
      
      // Redirect based on role
      if (res.user.role === 'seller' || res.user.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to login. Please try again.")
    }
  }

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl glass shadow-lg border border-border">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl mb-2">
            <Package className="h-8 w-8 text-primary" />
            <span>StoreFront</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
