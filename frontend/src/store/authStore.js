import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      
      setUser: (userData) => set({ 
        user: userData, 
        isAuthenticated: !!userData,
        role: userData?.role || null
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        role: null 
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      // We only want to persist the user data/role, token is handled by HTTP-only cookies
    }
  )
);
