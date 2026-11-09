import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works under a GitHub Pages project path.
  base: './',
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
