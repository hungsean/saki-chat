import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads', // 平行執行測試
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        'src/components/ui/**', // shadcn/ui 元件
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/test/**',
      ],
    },
  },
});
