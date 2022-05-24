import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), dts({
    outputDir: 'dist/types',
    exclude: ['src/components', 'src/utils', 'src/interfaces', ]
  })],
  build: {
    minify: true, 
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VueVideoAnnotation",
      fileName: (format) => `vue-video-annotation.${format}.js`,
    },
    rollupOptions: {
      external: ["vue", "fabric", "uuid", "vue-fullscreen"],
      output: {
        globals: {
          vue: "Vue",
          fabric: "fabric",
          uuid: "uuid",
          "vue-fullscreen": "vue-fullscreen"
        },
      },
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/scss/_variables.scss";
        @import "./src/scss/_button.scss";`
      }
    }
  },
  publicDir: '' //avoid to copy favicon
})
