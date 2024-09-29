import { fileURLToPath, URL } from 'node:url'
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tsconfigPaths from 'vite-tsconfig-paths'
import main from './vite.config'

export default defineConfig({
  main,
  preload: {
    plugins: [
      externalizeDepsPlugin(),
      tsconfigPaths({
        projects: [fileURLToPath(new URL('./tsconfig.node.json', import.meta.url))],
        loose: true
      })
    ],
    esbuild: {
      target: ['chrome126']
    },
    resolve: {
      alias: {
        buffer: fileURLToPath(new URL('./node_modules/buffer', import.meta.url)),
        stream: fileURLToPath(new URL('./node_modules/stream-browserify', import.meta.url)),
        util: fileURLToPath(new URL('./node_modules/util', import.meta.url))
      }
    }
  },
  renderer: {
    plugins: [
      tsconfigPaths({
        projects: [fileURLToPath(new URL('./tsconfig.web.json', import.meta.url))],
        loose: true
      }),
      vue({ template: { transformAssetUrls } }),
      vueJsx(),
      vuetify(),
      vueDevTools(),
      vueI18nPlugin({
        runtimeOnly: false,
        include: [
          'src/renderer/locales/**/*.json',
          'src/renderer/locales/**/*.json5',
          'src/renderer/locales/**/*.yaml',
          'src/renderer/locales/**/*.yml'
        ]
      }) as never
    ],
    esbuild: {
      target: ['chrome126']
    },
    resolve: {
      alias: {
        buffer: fileURLToPath(new URL('./node_modules/buffer', import.meta.url)),
        stream: fileURLToPath(new URL('./node_modules/stream-browserify', import.meta.url)),
        util: fileURLToPath(new URL('./node_modules/util', import.meta.url))
      }
    }
  }
})
