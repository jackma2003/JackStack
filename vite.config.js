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
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 29366, // Frontend port
    proxy: {
      '/api': {
        target: 'http://linserv1.cims.nyu.edu:29366', // Backend port
        changeOrigin: true,
      }
    }
  }
})
