import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
  // The PR-preview workflow sets VITE_BASE_PATH to the per-PR GitHub Pages
  // sub-path (e.g. /krkn-dashboard/pr-preview/pr-12/). Normal builds use "/".
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  esbuild: {
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    extensions: [".js", ".json", ".jsx", ".mjs"],
  },
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true,
  },
});
