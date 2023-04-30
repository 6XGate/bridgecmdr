/* eslint-env node */
const { useJavaScriptOnlyRules } = require('../eslint.rules.cjs')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './esmodule.cjs'
  ],
  rules: {
    ...useJavaScriptOnlyRules()
  }
}
