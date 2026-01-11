import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detectar si estamos en GitHub Codespaces
const isCodespaces = process.env.CODESPACES === 'true';
const codespaceName = process.env.CODESPACE_NAME;

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    base: mode === 'production' ? '/membresia/' : '/',
    server: {
      host: true, // Permitir conexiones externas
      port: 5173,
      strictPort: false,
      open: !isCodespaces, // No abrir automáticamente en Codespaces
      hmr: isCodespaces
        ? {
            // Configuración para GitHub Codespaces
            protocol: 'wss',
            host: `${codespaceName}-5173.app.github.dev`,
            clientPort: 443,
          }
        : {
            // Configuración para desarrollo local
            protocol: 'ws',
            host: 'localhost',
          },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser'
    },
    define: {
      'process.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    },
  }
})
