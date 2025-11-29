import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 指向自定义后端服务地址
            target: 'http://192.168.0.108:8081',
            ws: true,
            rewrite: (path) => path.replace(/^\/api/, '/api'),
          },
        },
      },
    },
  };
});
