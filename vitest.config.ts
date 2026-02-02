import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [Vue(), VueJsx()],
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '**/node_modules/**',
        'e2e/',
        '**/e2e/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/coverage/**',
        '**/public/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/mock/**',
        '**/mocks/**',
        '**/types/**',
        '**/typings/**',
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/playwright.config.*',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
    reporters: ['verbose'],
  },
});
