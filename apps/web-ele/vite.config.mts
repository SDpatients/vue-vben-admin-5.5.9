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
      server: {
        port: 5779, // 设置固定端口，避免自动切换导致的问题
        proxy: {
          '/api': {
            changeOrigin: true,
            // 指向自定义后端服务地址
            target: 'http://192.168.0.108:8081',
            ws: true,
            rewrite: (path: string) => path.replace(/^\/api/, '/api'),
          },
        },
      },
    },
  };
});
