import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    manifest: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://backendportfoliowebsite-production.up.railway.app",
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
});
