import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async (): Promise<any> => {
  return {
    application: {},
    vite: {
      // 添加类型注释以避免推断类型不可移植的问题
      // @ts-ignore 忽略未找到模块的类型检查
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
            target: 'http://192.168.0.120:8080',
            ws: true,
            rewrite: (path: string) => path.replace(/^\/api/, '/api'),
          },
          '/api/v1': {
            changeOrigin: true,
            target: 'http://192.168.0.120:8080',
            ws: true,
            rewrite: (path: string) => path,
          },
          '/users': {
            changeOrigin: true,
            target: 'http://192.168.0.120:8080',
            ws: true,
            rewrite: (path: string) => path,
          },
          '/ws': {
            changeOrigin: true,
            target: 'http://192.168.0.120:8080',
            ws: true,
            rewrite: (path: string) => path.replace(/^\/ws/, '/ws'),
          },
        },
      },
    },
  };
});
