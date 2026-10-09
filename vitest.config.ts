import { defineConfig } from 'vitest/config'
import path from 'path'

// Deliberately separate from vite.config.ts: the app config loads the React and Tailwind
// plugins, which the unit tests do not need and which slow every run down.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    // Pin the clock to a zone AHEAD of UTC. The date bug this suite guards against only
    // reproduces at a positive UTC offset, so running in UTC would let it back in silently.
    env: { TZ: 'Asia/Kolkata' },
    include: ['src/**/*.test.ts', 'server/**/*.test.js'],
    // The course data files import images; nothing under test needs them.
    exclude: ['node_modules', 'dist'],
  },
})
