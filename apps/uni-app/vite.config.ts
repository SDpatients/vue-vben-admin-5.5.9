import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

// 从配置文件读取 API 基础地址，避免硬编码
// 注意：Vite 配置在 Node 环境运行，使用 fs 读取配置文件
import fs from 'fs'

function getApiBaseUrl(): string {
  const configPath = resolve(__dirname, 'src/customer.config.ts')
  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    // 提取 baseUrl: 'xxx' 格式的配置
    const match = content.match(/baseUrl:\s*['"]([^'"]+)['"]/)
    if (match) {
      return match[1]
    }
  } catch {
    // 读取失败时使用默认值
  }
  // 默认 fallback 地址
  return 'http://192.168.0.151:8080'
}

const API_BASE_URL = getApiBaseUrl()

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
        silenceDeprecations: ['import', 'legacy-js-api'],
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
        target: API_BASE_URL,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path,
      },
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path,
      },
    },
  },
})
