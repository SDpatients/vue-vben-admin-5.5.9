import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    uni.default(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@api': resolve(__dirname, 'src/api'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@stores': resolve(__dirname, 'src/stores'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
  build: {
    sourcemap: false,
    minify: false,
  },
  server: {
    port: 5173,
    open: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/v1': {
        target: 'http://192.168.0.151:8080',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path,
      },
      '/api': {
        target: 'http://192.168.0.151:8080',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path,
      },
    },
  },
})
