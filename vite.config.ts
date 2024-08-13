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
        'out/**',
        'src/main/index.ts',
        'src/main/boot.ts',
        'src/renderer/index.ts',
        'src/renderer/main.ts',
        'src/renderer/**/*.vue',
        'electron.vite.config.ts',
        ...coverageConfigDefaults.exclude
      ]
    }
  }
})
