import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Images referenced by API-delivered course HTML (VITE_CONTENT_SOURCE=api); served by Spring.
      '/content-assets': 'http://localhost:3001',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Course content is NOT grouped here: every course is a dynamic import (see
        // src/app/data/courseModules.ts), so Rollup gives each course, and each extras file, its
        // own chunk and a reader downloads only what they open. Forcing it into one chunk would
        // undo that. Only the quiz banks stay grouped. Vendor chunking is left to Rollup on
        // purpose: it already keeps jspdf and html2canvas in their own lazy chunks.
        manualChunks(id) {
          if (id.includes('src/app/data/quiz/')) return 'quiz-banks'
        },
      },
    },
    // Individual course chunks are large and lazy-loaded, so the default 500 kB warning is
    // noise. Anything above this is worth a look.
    chunkSizeWarningLimit: 1500,
  },
})
