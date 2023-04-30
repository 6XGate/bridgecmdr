require('@rushstack/eslint-patch/modern-module-resolution')

/* eslint-env node */
const { defineConfig } = require('./src/eslint/eslint.rules.cjs')

module.exports = defineConfig({
  root: true,
  reportUnusedDisableDirectives: true,
  parserOptions: {
    ecmaVersion: 'latest'
  },
  overrides: [
    {
      files: ['*.cjs'],
      extends: './src/eslint/configs/javascript.cjs'
    },
    {
      files: ['*.js', '*.mjs', '*.jsx'],
      extends: './src/eslint/configs/ecmascript.cjs'
    },
    {
      files: ['*.ts', '*.tsx', '*.vue'],
      parserOptions: {
        project: [
          './tsconfig.json',
          './tsconfig.node.json'
        ]
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: './src/eslint/configs/typescript.cjs'
    },
    {
      files: ['*.vue'],
      extends: './src/eslint/configs/vue.cjs'
    }
  ]
})
