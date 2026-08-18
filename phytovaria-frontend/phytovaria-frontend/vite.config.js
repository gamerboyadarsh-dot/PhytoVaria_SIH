import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    // Proxies /api calls to the FastAPI backend during local dev so the
    // frontend can call relative paths ("/api/...") without CORS pain.
    // Change the target if Member 2's backend runs on a different port.
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
