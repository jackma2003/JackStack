import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      external: ['socket.io-client'],
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['socket.io-client'],
  },
  server: {
    port: 29366, // Frontend port
    proxy: {
      '/api': {
        target: 'http://linserv1.cims.nyu.edu:29366', // Backend port
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://linserv1.cims.nyu.edu:29366',
        changeOrigin: true,
        ws: true
      }
    }
  }
})