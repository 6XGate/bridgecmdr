/* eslint-env node */
'use strict'
const { defineConfig } = require('@sixxgate/lint')
const { memo } = require('radash')

module.exports = defineConfig(({ useVue, useNode, useTypeScript }) => {
  useVue({ version: '3.4', style: 'sass' })
  useNode()
  useTypeScript()

  /** @type {() => Partial<import('eslint').Linter.RulesRecord>} */
  const useCommonJsDocRules = memo(() => ({
    // Don't require all sections to be filled out.
    'jsdoc/require-returns': 'off',
    'jsdoc/require-yields': 'off',
    // Requires too much configuration to worry about.
    'jsdoc/tag-lines': 'off',
    // Don't require DocComments.
    'jsdoc/require-jsdoc': 'off'
  }))

  /** @type {() => Partial<import('eslint').Linter.RulesRecord>} */
  const useJsDocRules = memo(() => ({
    ...useCommonJsDocRules(),
    // Only require the parameters if we want them.
    'jsdoc/require-param': ['error', { ignoreWhenAllParamsMissing: true }],
  }))

  /** @type {() => Partial<import('eslint').Linter.RulesRecord>} */
  const useTsDocRules = memo(() => ({
    ...useCommonJsDocRules(),
    // Only require the parameters if we want them.
    'jsdoc/require-param': [
      'error',
      {
        ignoreWhenAllParamsMissing: true,
        // Has issues with TSDoc
        checkDestructuredRoots: false
      }
    ],
    // Has issues with JSDOc.
    'jsdoc/check-param-names': ['error', { checkDestructured: false }],
    // TSDoc itself.
    'tsdoc/syntax': 'error'
  }))

  return {
    root: true,
    env: { es2023: true },
    plugins: ['eslint-plugin-tsdoc'],
    reportUnusedDisableDirectives: true,
    overrides: [
      // CommonJS JavaScript
      {
        files: ['*.cjs'],
        extends: ['plugin:jsdoc/recommended-error'],
        rules: {
          '@typescript-eslint/no-require-imports': 'off',
          ...useJsDocRules()
        },
        parserOptions: {
          project: './tsconfig.config.json'
        }
      },
      // Main and preload
      {
        files: ['src/core/**/*.ts', 'src/main/**/*.ts', 'src/main/**/*.js', 'src/preload/**/*.ts'],
        parserOptions: {
          project: './tsconfig.node.json'
        }
      },
      // Main and preload TypeScript
      {
        files: ['src/core/**/*.ts', 'src/main/**/*.ts', 'src/preload/**/*.ts'],
        extends: ['plugin:jsdoc/recommended-typescript-error'],
        rules: { ...useTsDocRules() }
      },
      // Main and preload JavaScript
      {
        files: ['src/main/**/*.js'],
        extends: ['plugin:jsdoc/recommended-error'],
        rules: { ...useJsDocRules() }
      },
      // Renderer
      {
        files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx', 'src/renderer/**/*.js', 'src/renderer/**/*.vue'],
        parserOptions: {
          project: './tsconfig.web.json'
        }
      },
      // Renderer TypeScript
      {
        files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx', 'src/renderer/**/*.vue'],
        extends: ['plugin:jsdoc/recommended-typescript-error'],
        rules: { ...useTsDocRules() }
      },
      // Renderer JavaScript
      {
        files: ['src/renderer/**/*.js'],
        extends: ['plugin:jsdoc/recommended-error'],
        rules: { ...useJsDocRules() }
      },
      // Vite configuration
      {
        files: ['electron.vite.config.ts', 'vite.config.ts'],
        extends: ['plugin:jsdoc/recommended-typescript-error'],
        rules: { ...useTsDocRules() },
        parserOptions: {
          project: './tsconfig.config.json'
        }
      },
      // Tests
      {
        files: ['src/tests/**/*.ts'],
        extends: ['plugin:jsdoc/recommended-typescript-error'],
        rules: { ...useTsDocRules() },
        parserOptions: {
          project: './tsconfig.test.json'
        }
      }
    ]
  }
})
