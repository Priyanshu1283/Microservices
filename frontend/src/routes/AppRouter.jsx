import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

import { MainLayout } from "../layouts/MainLayout"
import { DashboardLayout } from "../layouts/DashboardLayout"
import { Home } from "../pages/user/Home"
import { Login } from "../pages/auth/Login"
import { Register } from "../pages/auth/Register"
import { Products } from "../pages/user/Products"
import { ProductDetails } from "../pages/user/ProductDetails"
import { Cart } from "../pages/user/Cart"
import { Profile } from "../pages/user/Profile"
import { Checkout } from "../pages/user/Checkout"
import { Orders } from "../pages/user/Orders"
import { DashboardOverview } from "../pages/dashboard/Overview"
import { ProductManager } from "../pages/dashboard/ProductManager"

// Protected Route Component
const RequireAuth = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public / User Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route 
          path="/profile" 
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <RequireAuth>
              <Orders />
            </RequireAuth>
          } 
        />
      </Route>

      {/* Dashboard Routes (Seller / Admin) */}
      <Route 
        path="/dashboard" 
        element={
          <RequireAuth allowedRoles={['seller', 'admin']}>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="orders" element={<div className="p-4">Manage Orders</div>} />
        <Route path="settings" element={<div className="p-4">Settings</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
