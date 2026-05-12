import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

import fs from 'fs'

function getApiBaseUrl(): string {
  const configPath = resolve(__dirname, 'src/customer.config.ts')
  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    const match = content.match(/baseUrl:\s*['"]([^'"]+)['"]/)
    if (match) {
      return match[1]
    }
  } catch {
  }
  return 'http://192.168.0.151:8080'
}

const API_BASE_URL = getApiBaseUrl()

export default defineConfig(({ mode }) => {
  const isBuild = mode === 'production'

  return {
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
      minify: isBuild ? 'terser' : false,
      terserOptions: isBuild
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
            mangle: {
              toplevel: true,
              safari10: true,
            },
            format: {
              comments: false,
            },
          }
        : undefined,
    },
    esbuild: isBuild
      ? {
          drop: ['console', 'debugger'],
          legalComments: 'none',
        }
      : {},
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
  }
})
