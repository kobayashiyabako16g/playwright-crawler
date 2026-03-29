import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/main.ts'],
  outDir: 'dist',
  format: 'esm',
  target: 'node24',
  clean: true,
})
