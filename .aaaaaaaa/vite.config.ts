import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://globalyogas.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
