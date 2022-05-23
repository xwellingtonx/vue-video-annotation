import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import process from 'process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    minify: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/scss/_variables.scss";
        @import "./src/scss/_button.scss";`
      }
    }
  },
  base: process.env.NODE_ENV === 'production' ? '/vue-video-annotation/' : '/',
})
