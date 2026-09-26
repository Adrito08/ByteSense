import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ByteSense frontend — talks to the Flask API (app.py) running separately.
// Set VITE_API_URL in .env to point at your local or deployed backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://127.0.0.1:10000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});