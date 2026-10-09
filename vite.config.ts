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
  build: {
    rollupOptions: {
      output: {
        // The course content is by far the largest thing here (474 topics, 3,430 HTML
        // blocks). Splitting it away from component code means editing a component does
        // not invalidate megabytes of cached content for returning students, and the two
        // download in parallel. Vendor chunking is left to Rollup on purpose: it already
        // keeps jspdf and html2canvas in their own lazy chunks, and a blanket vendor
        // group would drag them into the initial load.
        manualChunks(id) {
          if (id.includes('src/app/data/topics/')) return 'course-topics'
          if (id.includes('src/app/data/quiz/')) return 'quiz-banks'
          if (id.includes('src/app/data/')) return 'course-data'
        },
      },
    },
    // The course-content chunks are legitimately large and are lazy-loaded, so the
    // default 500 kB warning is pure noise. Anything above this is worth a look.
    chunkSizeWarningLimit: 1500,
  },
})
