import { defineConfig } from 'vite'
import path from "path";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@styled-system": path.resolve(__dirname, "./styled-system"),
    },
  },
});
