import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    // e2e (Playwright) mają własny runner - vitest ich nie dotyka
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
