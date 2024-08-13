/* eslint-env node */
'use strict'
const { defineConfig } = require('@sixxgate/lint')

module.exports = defineConfig(({ useVue, useNode, useTypeScript }) => {
  useVue({ version: '3.4', style: 'sass' })
  useNode()
  useTypeScript()

  return {
    root: true,
    env: { es2023: true },
    reportUnusedDisableDirectives: true,
    rules: {
      // 'n/file-extension-in-import': ['error', 'always']
    },
    overrides: [
      {
        files: ['*.cjs'],
        rules: {
          '@typescript-eslint/no-require-imports': 'off'
        },
        parserOptions: {
          project: './tsconfig.config.json'
        }
      },
      {
        files: ['src/core/**/*.ts', 'src/main/**/*.ts', 'src/main/**/*.js', 'src/preload/**/*.ts'],
        parserOptions: {
          project: './tsconfig.node.json'
        }
      },
      {
        files: ['src/renderer/**/*.ts', 'src/renderer/**/*.js', 'src/renderer/**/*.vue'],
        parserOptions: {
          project: './tsconfig.web.json'
        }
      },
      {
        files: ['electron.vite.config.ts', 'vite.config.ts'],
        parserOptions: {
          project: './tsconfig.config.json'
        }
      },
      {
        files: ['src/tests/**/*.ts'],
        parserOptions: {
          project: './tsconfig.test.json'
        }
      }
    ]
  }
})
