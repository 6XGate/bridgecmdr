import { fileURLToPath, URL } from 'node:url'
import { externalizeDepsPlugin } from 'electron-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Allow `.js` file endings.
    alias: [{ find: /^(.*)\.js$/u, replacement: '$1' }]
  },
  plugins: [
    externalizeDepsPlugin(),
    tsconfigPaths({
      projects: [fileURLToPath(new URL('./tsconfig.base.json', import.meta.url))],
      loose: true
    })
  ],
  test: {
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      exclude: [
        // Ignore the ouput directories.
        'dist/**',
        'out/**',
        // No real unit tests can be run on the main process start-up.
        'src/main/index.ts',
        'src/main/main.ts',
        // No real unit tests can be run on the render process start-up.
        'src/renderer/index.ts',
        'src/renderer/main.ts',
        // Not going to test or cover the UI right now.
        'src/renderer/helpers/attachment.ts',
        'src/renderer/helpers/element.ts',
        'src/renderer/modals/dialogs.ts',
        'src/renderer/plugins/router.ts',
        'src/renderer/plugins/vuetify.ts',
        'src/renderer/**/*.vue',
        // The configurations don't need any testing or converage.
        'electron.vite.config.ts',
        ...coverageConfigDefaults.exclude
      ]
    }
  }
})
