import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Tailwind CSS 4 como plugin de Vite (guía oficial "Using Vite").
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias @/ → src/ (el mismo alias se declara en tsconfig.app.json para TypeScript).
    // vite.config.ts es un módulo ES: se usa import.meta.dirname en lugar de __dirname.
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
})
