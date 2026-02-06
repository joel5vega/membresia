import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/membresia/',
  server: {
    host: '0.0.0.0',  // ← NUEVO: expone el servidor
    port: 5173,
    strictPort: false,
    open: true,
    watch: {
      usePolling: true  // ← NUEVO: detecta cambios en Codespaces
    },
    hmr: {
      clientPort: 443  // ← NUEVO: para hot reload en Codespaces
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  define: {
    'process.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
})
