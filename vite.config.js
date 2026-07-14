import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Generates the service worker and precaches all built assets,
    // so the PWA works offline right after the first visit.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // registered manually in main.jsx
      manifest: false, // public/manifest.json is used as-is
      includeAssets: [
        'manifest.json',
        'icon-192.svg',
        'icon-512.svg',
        'icon-192.png',
        'icon-512.png',
        'apple-touch-icon.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        // The sampled sound chunk is ~1 MB base64
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html'
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
