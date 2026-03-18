import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Frontend -> Backend (evita CORS y simplifica deploy)
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true
      }
    }
  }
});

