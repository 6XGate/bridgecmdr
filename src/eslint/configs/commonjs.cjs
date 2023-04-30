/* eslint-env node */
const { useCommonJsOnlyRules } = require('../eslint.rules.cjs')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'plugin:n/recommended',
    './base.cjs'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script'
  },
  plugins: ['n'],
  rules: {
    ...useCommonJsOnlyRules()
  }
}
