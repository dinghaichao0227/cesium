// import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import requireTransform from 'vite-plugin-require-transform';
import electronBuilder from "electron-builder"



// https://vitejs.dev/config/
export default defineConfig({
  // configureWebpack: {
  //   node: {
  //     __dirname: true
  //   }
  // }
  electronBuilder: {
    preload: './electron-preload.js',
  },
  server: {
    // mimeTypes:{
    //   'text/css': ["css"]
    // }
  },
  devServer: {
    open: true
  },
  plugins: [vue(),
    requireTransform({
      fileRegex: /.js$|.vue$/
    }),
  ],
  resolve: {
    alias: {
      // '@': path.resolve(__dirname,"src")
    }
  }
})

