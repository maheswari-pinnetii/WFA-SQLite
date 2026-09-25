/// <reference types="vitest" />
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'frontend/src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'The Stackly WFA',
        short_name: 'WFA',
        description: 'Workforce Administration Platform',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ] as any,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend/src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      ignored: ['**/database/**', '**/logs/**']
    },
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
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
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
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'playwright/**'],
    globals: true,
    fileParallelism: false,
    testTimeout: 30000,
    environmentMatchGlobs: [
      ['tests/unit/**', 'jsdom'],
      ['tests/integration/**', 'node'],
      ['tests/security/**', 'node']
    ],
    setupFiles: ['./tests/setup/test-env.ts', './tests/setup/cleanup.ts'],
    globalSetup: ['./tests/setup/global.setup.ts'],
    server: {
      deps: {
        external: ['better-sqlite3', '@sqlitecloud/drivers']
      }
    }
  }
});

