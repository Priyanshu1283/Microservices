import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/products': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/cart': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/orders': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/payments': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3005',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
