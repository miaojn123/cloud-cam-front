import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  esbuild: {
    target: 'es2018',
  } as any,
  build: {
    target: 'es2018',
  },
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
})
