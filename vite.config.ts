/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  plugins: [react(), viteTsconfigPaths()],
  server: {
    port: 3000,
    // Proxy API requests to backend during development
    // This eliminates CORS issues without needing to configure backend CORS
    // All requests to /api/* will be forwarded to the target backend
    proxy: {
      '/api': {
        target: 'https://activation-casinos-sufficient-albert.trycloudflare.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      },
    },
  },
  preview: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setup-tests.ts',
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      include: ['src/**'],
    },
  },
  optimizeDeps: { 
    exclude: ['fsevents'],
    include: ['react', 'react-dom', 'react/jsx-runtime', 'scheduler']
  },
  build: {
    rollupOptions: {
      external: ['fs/promises'],
      output: {
        manualChunks: (id) => {
          // CRITICAL: Keep React and ReactDOM together
          if (id.includes('node_modules')) {
            // React core (must be together)
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            // Firebase
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Other vendor code
            return 'vendor';
          }
          
          // Separate chatbot into its own chunk
          if (id.includes('/components/chatbot/')) {
            return 'chatbot';
          }
          
          // Separate admin/CRM features
          if (id.includes('/routes/admin/') || id.includes('/routes/app/crm')) {
            return 'admin';
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
