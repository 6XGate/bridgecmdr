/* eslint-env node */

const { useEsModuleOnlyRules } = require('../eslint.rules.cjs')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './base.cjs'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    ...useEsModuleOnlyRules()
  }
}
