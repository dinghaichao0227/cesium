import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import requireTransform from 'vite-plugin-require-transform';



// https://vitejs.dev/config/
export default defineConfig({
  // configureWebpack: {
  //   node: {
  //     __dirname: true
  //   }
  // }
  server: {
    host:'0.0.0.0',
    port:5173,
    open: true,
    proxy: {
    }
    // mimeTypes:{
    //   'text/css': ["css"]
    // }
  },
  // devServer: {
  //   host:'0.0.0.0',
  //   port:5173,
  //   open: true,
  //   },
  plugins: [vue(),
  requireTransform({
    fileRegex: /.js$|.vue$/
  }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "src")
    }
  }
})

