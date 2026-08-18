import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxies /api calls to the FastAPI backend during local dev so the
    // frontend can call relative paths ("/api/...") without CORS pain.
    // Change the target if Member 2's backend runs on a different port.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
