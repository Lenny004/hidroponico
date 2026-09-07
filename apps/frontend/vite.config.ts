import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/salud": "http://localhost:3001",
      "/pipeline": "http://localhost:3001",
      "/grafo": "http://localhost:3001",
    },
  },
});
