import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Use relative base so the app works under GitHub Pages subpath
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist" }
});
