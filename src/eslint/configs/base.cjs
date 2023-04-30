/* eslint-env node */
const { useBaseRules } = require('../eslint.rules.cjs')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended'
  ],
  parserOptions: { ecmaVersion: 'latest' },
  rules: {
    ...useBaseRules()
  }
}
