import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add proxy for Ethiopian Telebirr API to handle CORS
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/telebirr': {
        target: 'https://196.188.120.3:38443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/telebirr\/create/, '/apiaccess/payment/gateway/create'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxy request:', req.method, req.url, '->', proxyReq.getHeader('host') + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
            console.log('Proxy response headers:', proxyRes.headers);
          });
        },
      },
    },
  },
}));
