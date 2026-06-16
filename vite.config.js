import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["chrome >= 64", "safari >= 12", "ios >= 12", "firefox >= 67"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      modernPolyfills: false,
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2,
        drop_debugger: true,
        pure_getters: true,
      },
      format: { comments: false },
    },
    cssMinify: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "vendor-react";
          if (id.includes("node_modules/lucide-react")) return "vendor-icons";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    reportCompressedSize: false
  }
});
