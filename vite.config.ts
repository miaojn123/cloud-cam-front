import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // ElMessage 等 API 自动注入，与 main 中全量 app.use(ElementPlus) 配合；样式已在 main 全量引入，避免重复
    AutoImport({
      resolvers: [
        ElementPlusResolver({
          importStyle: false,
        }),
      ],
      dts: 'src/auto-imports.d.ts',
      dtsMode: 'overwrite',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'esnext',
  },
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
})
