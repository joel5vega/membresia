import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/membresia/',
  server: {
    port: 5173,
    strictPort: false,
    open: true,
            hmr: process.env.CODESPACES === 'true' ? {
            host: process.env.CODESPACE_NAME + '-5173.' + process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
      protocol: 'wss',
      clientPort: 443
    } : true,
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
