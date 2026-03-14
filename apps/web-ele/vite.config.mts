import { defineConfig, loadEnv } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async ({ mode }): Promise<any> => {
  const env = loadEnv(mode, process.cwd());
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://192.168.0.151:8080';

  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      define: {
        global: 'window',
      },
      server: {
        port: 5779,
        host: '0.0.0.0',
        allowedHosts: true,
        proxy: {
          '/api': {
            changeOrigin: true,
            target: proxyTarget,
            ws: true,
            rewrite: (path: string) => path.replace(/^\/api/, '/api'),
          },
          '/api/v1': {
            changeOrigin: true,
            target: proxyTarget,
            ws: true,
            rewrite: (path: string) => path,
          },
          '/users': {
            changeOrigin: true,
            target: proxyTarget,
            ws: true,
            rewrite: (path: string) => path,
          },
          '/ws': {
            changeOrigin: true,
            target: proxyTarget,
            ws: true,
            rewrite: (path: string) => path.replace(/^\/ws/, '/ws'),
          },
        },
      },
    },
  };
});
