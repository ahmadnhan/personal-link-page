import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",            // <- مهم جداً: اجعلها "/" وليس مساراً فرعياً
  build: { outDir: "dist" },
});
