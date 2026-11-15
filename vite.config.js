import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detectamos si estamos en GitHub Codespaces
const isCodespace = !!process.env.CODESPACE_NAME

export default defineConfig({
  plugins: [react()],
  base: '/membresia/',

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    open: !isCodespace,
    watch: {
      usePolling: true,
    },
    // Solo configuramos HMR especial cuando estamos en Codespaces.
    // En local, Vite usa los defaults (ws://localhost:5173) que ya funcionan.
    ...(isCodespace && {
      hmr: {
        protocol: 'wss',
        host: `${process.env.CODESPACE_NAME}-5173.app.github.dev`,
        clientPort: 443,
      },
    }),
  },

  // Vista previa (npm run preview) también respeta el base
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },

  define: {
    'process.env.VITE_APP_VERSION': JSON.stringify(
      process.env.npm_package_version || '0.0.0'
    ),
  },
})