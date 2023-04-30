/* eslint-env node */
const { useVueOnlyRules } = require('../eslint.rules.cjs')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'plugin:vue/vue3-essential',
    './typescript.cjs',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    ...useVueOnlyRules()
  }
}
