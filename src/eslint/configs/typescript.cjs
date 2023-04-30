const { kResolveExtensions, useTypeScriptOnlyRules } = require('../eslint.rules.cjs')

/** @return {import('@typescript-eslint/eslint-plugin').TSESLint.Linter.RulesRecord} */
module.exports = {
  extends: [
    './esmodule.cjs',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  parserOptions: {
    // Support Vue.js components
    extraFileExtensions: ['.vue'],
    // Vue.js requires these options, which the import plug-in will pass to it
    parser: {
      js: 'espree',
      ts: '@typescript-eslint/parser'
    }
  },
  settings: {
    'import/extensions': kResolveExtensions,
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
      'vue-eslint-parser': ['.vue']
    },
    'import/resolver': {
      node: { extensions: kResolveExtensions },
      typescript: { }
    }
  },
  rules: {
    ...useTypeScriptOnlyRules()
  }
}
