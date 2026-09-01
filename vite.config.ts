/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend/src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/v1': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'vendor-redux';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-network';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-core';
          }
        },
      },
    },
  },
  ssr: {
    external: ['better-sqlite3', '@sqlitecloud/drivers']
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'tests/**/*.spec.ts'],
    globals: true,
    server: {
      deps: {
        external: ['better-sqlite3', '@sqlitecloud/drivers']
      }
    }
  }
});

