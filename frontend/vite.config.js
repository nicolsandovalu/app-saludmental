import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    force: true // Fuerza a Vite a reiniciar y limpiar la caché de dependencias
  }
})
