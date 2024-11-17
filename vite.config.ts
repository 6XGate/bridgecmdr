import { fileURLToPath, URL } from 'node:url'
import { externalizeDepsPlugin } from 'electron-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    externalizeDepsPlugin(),
    tsconfigPaths({
      projects: [fileURLToPath(new URL('./tsconfig.base.json', import.meta.url))],
      loose: true
    })
  ],
  esbuild: {
    target: ['node20']
  },
  test: {
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      reportOnFailure: true,
      exclude: [
        // Ignore the output directories.
        'dist/**',
        'out/**',
        // No real tests can be run on the main process start-up.
        'src/main/index.ts',
        'src/main/main.ts',
        // No real tests can be run on the preload process.
        'src/preload/index.ts',
        // No real tests can be run on the render process start-up.
        'src/renderer/index.ts',
        'src/renderer/main.ts',
        // Not going to automatically test tRPC code, since it is a copy of the WebSocket server.
        'src/core/rpc/ipc.ts',
        'src/main/routes/**/*.ts',
        'src/main/routes/**/*.ts',
        'src/main/services/rpc/**/*.ts',
        // Not going to test the core URL module till it's used.
        'src/core/url.ts',
        // Not going to test or cover the UI right now.
        // TODO: There are some parts that do need coverage:
        // - Import and export.
        'src/renderer/services/**/*.ts',
        'src/renderer/**/*.ts',
        'src/renderer/**/*.tsx',
        'src/renderer/**/*.vue',
        // No real need to test the support and seeding framework.
        'src/tests/support/**/*.ts',
        'src/tests/seeds/**/*.ts',
        // The configurations don't need any testing or coverage.
        'electron.vite.config.ts',
        ...coverageConfigDefaults.exclude
      ]
    }
  }
})
