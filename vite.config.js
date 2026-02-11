import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/membresia/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    open: true,
    watch: {
      usePolling: true
    },
    hmr: {
      protocol: 'wss',  // ← Agregar esto
      host: process.env.CODESPACE_NAME 
        ? `${process.env.CODESPACE_NAME}-5173.app.github.dev` 
        : 'localhost',  // ← Agregar esto
      clientPort: 443
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
