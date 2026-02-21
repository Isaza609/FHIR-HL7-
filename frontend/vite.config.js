import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Evitar CORS: las peticiones a /api/fhir se reenvían al servidor FHIR
      '/api/fhir': {
        target: 'http://hapi.fhir.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fhir/, '/baseR4'),
      },
    },
  },
})
