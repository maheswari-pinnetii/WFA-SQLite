// vite.config.ts
import { defineConfig } from "file:///C:/Users/91970/Downloads/WFA-SQLite/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/91970/Downloads/WFA-SQLite/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/91970/Downloads/WFA-SQLite/node_modules/@tailwindcss/vite/dist/index.mjs";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/91970/Downloads/WFA-SQLite/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./frontend/src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    port: 3e3,
    open: true,
    watch: {
      ignored: ["**/database/**", "**/logs/**"]
    },
    proxy: {
      "/v1": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false
      },
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://localhost:5001",
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 3e3,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "vendor-mui";
            }
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            if (id.includes("@reduxjs") || id.includes("react-redux")) {
              return "vendor-redux";
            }
            if (id.includes("@tanstack") || id.includes("axios")) {
              return "vendor-network";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            return "vendor-core";
          }
        }
      }
    }
  },
  ssr: {
    external: ["better-sqlite3", "@sqlitecloud/drivers"]
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "playwright/**"],
    globals: true,
    fileParallelism: false,
    setupFiles: ["./tests/setup/test-env.ts", "./tests/setup/cleanup.ts"],
    globalSetup: ["./tests/setup/global.setup.ts"],
    server: {
      deps: {
        external: ["better-sqlite3", "@sqlitecloud/drivers"]
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFw5MTk3MFxcXFxEb3dubG9hZHNcXFxcV0ZBLVNRTGl0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcOTE5NzBcXFxcRG93bmxvYWRzXFxcXFdGQS1TUUxpdGVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzLzkxOTcwL0Rvd25sb2Fkcy9XRkEtU1FMaXRlL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0gYXMgYW55LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL2Zyb250ZW5kL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICB3YXRjaDoge1xuICAgICAgaWdub3JlZDogWycqKi9kYXRhYmFzZS8qKicsICcqKi9sb2dzLyoqJ11cbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICAnL3YxJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUwMDEnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICAnL3NvY2tldC5pbyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MDAxJyxcbiAgICAgICAgd3M6IHRydWUsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMzAwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAbXVpJykgfHwgaWQuaW5jbHVkZXMoJ0BlbW90aW9uJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbXVpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVjaGFydHMnKSB8fCBpZC5pbmNsdWRlcygnZDMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1jaGFydHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAcmVkdXhqcycpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1yZWR1eCcpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJlZHV4JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHRhbnN0YWNrJykgfHwgaWQuaW5jbHVkZXMoJ2F4aW9zJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbmV0d29yayc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2x1Y2lkZS1yZWFjdCcpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWljb25zJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWNvcmUnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc3NyOiB7XG4gICAgZXh0ZXJuYWw6IFsnYmV0dGVyLXNxbGl0ZTMnLCAnQHNxbGl0ZWNsb3VkL2RyaXZlcnMnXVxuICB9LFxuICB0ZXN0OiB7XG4gICAgaW5jbHVkZTogWyd0ZXN0cy8qKi8qLnRlc3Que3RzLHRzeH0nXSxcbiAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcycsICdwbGF5d3JpZ2h0LyoqJ10sXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBmaWxlUGFyYWxsZWxpc206IGZhbHNlLFxuICAgIHNldHVwRmlsZXM6IFsnLi90ZXN0cy9zZXR1cC90ZXN0LWVudi50cycsICcuL3Rlc3RzL3NldHVwL2NsZWFudXAudHMnXSxcbiAgICBnbG9iYWxTZXR1cDogWycuL3Rlc3RzL3NldHVwL2dsb2JhbC5zZXR1cC50cyddLFxuICAgIHNlcnZlcjoge1xuICAgICAgZGVwczoge1xuICAgICAgICBleHRlcm5hbDogWydiZXR0ZXItc3FsaXRlMycsICdAc3FsaXRlY2xvdWQvZHJpdmVycyddXG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLHFCQUFxQjtBQUp5SixJQUFNLDJDQUEyQztBQU94TyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQ2hDLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksa0JBQWtCLHdDQUFlLENBQUM7QUFBQSxJQUMvRDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxrQkFBa0IsWUFBWTtBQUFBLElBQzFDO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLGNBQWM7QUFBQSxRQUNaLFFBQVE7QUFBQSxRQUNSLElBQUk7QUFBQSxRQUNKLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGFBQWEsSUFBSTtBQUNmLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixnQkFBSSxHQUFHLFNBQVMsTUFBTSxLQUFLLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDbEQscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLFVBQVUsS0FBSyxHQUFHLFNBQVMsSUFBSSxHQUFHO0FBQ2hELHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEtBQUssR0FBRyxTQUFTLGFBQWEsR0FBRztBQUN6RCxxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxHQUFHLFNBQVMsV0FBVyxLQUFLLEdBQUcsU0FBUyxPQUFPLEdBQUc7QUFDcEQscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxVQUFVLENBQUMsa0JBQWtCLHNCQUFzQjtBQUFBLEVBQ3JEO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixTQUFTLENBQUMsMEJBQTBCO0FBQUEsSUFDcEMsU0FBUyxDQUFDLGdCQUFnQixlQUFlO0FBQUEsSUFDekMsU0FBUztBQUFBLElBQ1QsaUJBQWlCO0FBQUEsSUFDakIsWUFBWSxDQUFDLDZCQUE2QiwwQkFBMEI7QUFBQSxJQUNwRSxhQUFhLENBQUMsK0JBQStCO0FBQUEsSUFDN0MsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLFFBQ0osVUFBVSxDQUFDLGtCQUFrQixzQkFBc0I7QUFBQSxNQUNyRDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
