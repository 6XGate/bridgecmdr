/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

// For `import/extensions` and its settings
const kVueExtensions = ['vue']
const kJavaScriptExtensions = ['js', 'jsx', 'cjs', 'mjs']
const kTypeScriptExtensions = ['ts', 'tsx', 'mts', 'cts', 'd.ts']
const kAllExtensions = [...kTypeScriptExtensions, ...kJavaScriptExtensions]
const kResolveExtensions = kAllExtensions.map(ext => `.${ext}`)
const kNeverUseExtensions = Object.fromEntries(kAllExtensions.map(ext => [ext, 'never']))

/** @return {import('eslint').Linter.RulesRecord} */
const useBaseRules = () => ({
  //
  // Possible problems
  //

  'array-callback-return': ['error', { allowImplicit: false, checkForEach: false }],
  'constructor-super': 'error',
  'no-async-promise-executor': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-const-assign': 'error',
  'no-constant-condition': ['error', { checkLoops: false }],
  // Not-Standard: Prevent unexpected behaviour.
  'no-constructor-return': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-dupe-args': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty-character-class': 'error',
  'no-empty-pattern': 'error',
  'no-ex-assign': 'error',
  'no-fallthrough': 'error',
  'no-func-assign': 'error',
  'no-import-assign': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-misleading-character-class': 'error',
  // Not-Standard: This should not be allowed for new ECMAScript natives.
  'no-new-native-nonconstructor': 'error',
  'no-new-symbol': 'error',
  'no-obj-calls': 'error',
  // Not-Standard: The return value is ignored.
  'no-promise-executor-return': 'warn',
  'no-prototype-builtins': 'error',
  'no-self-assign': ['error', { props: true }],
  'no-self-compare': 'error',
  // Not-Standard: The return value is ignored.
  'no-setter-return': 'warn',
  'no-sparse-arrays': 'error',
  'no-template-curly-in-string': 'error',
  'no-this-before-super': 'error',
  'no-unexpected-multiline': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unreachable': 'error',
  'no-unreachable-loop': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  // Not-Standard: Can raise errors.
  'no-unsafe-optional-chaining': 'error',
  // Not-Standard: Wasteful.
  'no-unused-private-class-members': 'error',
  'no-useless-backreference': 'error',
  'use-isnan': ['error', { enforceForSwitchCase: true, enforceForIndexOf: true }],
  'valid-typeof': ['error', { requireStringLiterals: true }],

  //
  // Suggestions
  //

  'arrow-body-style': ['error', 'as-needed'],
  // Not-Standard: This is always erroneous.
  'block-scoped-var': 'error',
  // Not-Standard: Could indicate buggy behaviour.
  'consistent-return': 'error',
  'accessor-pairs': ['error', { setWithoutGet: true, enforceForClassMembers: true }],
  'curly': ['error', 'multi-line'],
  // Non-Standard: Ensures all cases are handled.
  'default-case': 'error',
  'default-case-last': 'error',
  'eqeqeq': ['error', 'always', { null: 'ignore' }],
  // Non-Standard: Prevent confusion.
  'func-name-matching': 'warn',
  // Non-Standard: Better readability.
  'grouped-accessor-pairs': 'error',
  // Not-Standard: Prevent buggy behaviour.
  'guard-for-in': 'error',
  'new-cap': ['error', { newIsCap: true, capIsNew: false, properties: true }],
  // Not-Standard: Violates modern UX guidelines.
  'no-alert': 'error',
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-confusing-arrow': ['error', { allowParens: true }],
  // Not-Standard: Could cause buggy behaviour.
  'no-continue': 'warn',
  'no-delete-var': 'error',
  // Not-Standard: Prevent unexpected behaviour.
  'no-div-regex': 'error',
  // Not-Standard: Readability.
  'no-else-return': 'error',
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-eval': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-extra-boolean-cast': 'error',
  'no-floating-decimal': 'error',
  'no-global-assign': 'error',
  // Not-Standard: Could indicate buggy behaviour.
  'no-implicit-coercion': 'error',
  // Not-Standard: Could indicate buggy behaviour.
  'no-implicit-globals': 'error',
  'no-iterator': 'error',
  // Not-Standard: Prevent unexpected behaviour.
  'no-label-var': 'error',
  'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  'no-lone-blocks': 'error',
  // Not-Standard: Readability.
  'no-lonely-if': 'error',
  // Not-Standard: Readability.
  'no-multi-assign': 'error',
  'no-mixed-operators': ['error', {
    groups: [
      ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
      ['&&', '||'],
      ['in', 'instanceof']
    ],
    allowSamePrecedence: true
  }],
  'no-multi-str': 'error',
  // Not-Standard: Readability.
  'no-nested-ternary': 'warn',
  'no-new': 'error',
  'no-new-func': 'error',
  'no-new-object': 'error',
  'no-new-wrappers': 'error',
  'no-octal': 'error',
  'no-octal-escape': 'error',
  'no-proto': 'error',
  'no-regex-spaces': 'error',
  'no-return-assign': ['error', 'except-parens'],
  // Not-Standard: Eval adjacent.
  'no-script-url': 'error',
  'no-sequences': 'error',
  'no-shadow-restricted-names': 'error',
  'no-undef-init': 'error',
  'no-unneeded-ternary': ['error', { defaultAssignment: false }],
  'no-useless-call': 'error',
  'no-useless-catch': 'error',
  'no-useless-computed-key': 'error',
  // Not-Standard: Readability.
  'no-useless-concat': 'error',
  'no-useless-escape': 'error',
  'no-useless-rename': 'error',
  'no-useless-return': 'error',
  'no-var': /* Stricter than Standard JS warn */ 'error',
  'no-void': 'error',
  'no-with': 'error',
  'object-shorthand': ['warn', 'properties'],
  'one-var': ['error', { initialized: 'never' }],
  'prefer-const': ['error', { destructuring: 'all' }],
  // Not-Standard: Readability.
  'prefer-exponentiation-operator': 'error',
  // Not-Standard: Readability.
  'prefer-numeric-literals': 'error',
  // Not-Standard: Readability.
  'prefer-object-spread': 'error',
  'prefer-promise-reject-errors': 'error',
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  // Not-Standard: Readability.
  'prefer-rest-params': 'warn',
  // Not-Standard: Readability.
  'prefer-spread': 'warn',
  // Not-Standard: Readability.
  'prefer-template': 'warn',
  'quote-props': /* Stricter than Standard JS `as-needed` */ ['error', 'consistent-as-needed'],
  // Not-Standard: Prevent unexpected behaviour.
  'radix': 'error',
  // Not-Standard: Ensures proper matching.
  'require-unicode-regexp': 'error',
  // Not-Standard: Ensures proper usage of generator function.
  'require-yield': 'error',
  'spaced-comment': ['error', 'always', {
    line: { markers: ['*package', '!', '/', ',', '='] },
    block: { balanced: true, markers: ['*package', '!', ',', ':', '::', 'flow-include'], exceptions: ['*'] }
  }],
  'symbol-description': 'error',

  //
  // Layout & Formatting
  //

  // Not-Standard: Readability.
  'array-bracket-newline': ['error', 'consistent'],
  'array-bracket-spacing': ['error', 'never'],
  // Not-Standard: Readability.
  'array-element-newline': ['error', 'consistent'],
  // Not-Standard: Readability.
  'arrow-parens': ['error', 'as-needed'],
  'arrow-spacing': ['error', { before: true, after: true }],
  'comma-style': ['error', 'last'],
  'computed-property-spacing': ['error', 'never', { enforceForClassMembers: true }],
  'dot-location': ['error', 'property'],
  'eol-last': 'error',
  'generator-star-spacing': ['error', { before: true, after: true }],
  // Not-Standard: Our preferred setting.
  'linebreak-style': ['error', 'unix'],
  'multiline-ternary': ['error', 'always-multiline'],
  'new-parens': 'error',
  'no-mixed-spaces-and-tabs': 'error',
  'no-multi-spaces': 'error',
  'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
  'no-tabs': 'error',
  'no-trailing-spaces': 'error',
  'no-whitespace-before-property': 'error',
  'object-curly-newline': ['error', { multiline: true, consistent: true }],
  'object-property-newline': ['error', { allowMultiplePropertiesPerLine: true }],
  'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before', '|>': 'before' } }],
  'padded-blocks': ['error', { blocks: 'never', switches: 'never', classes: 'never' }],
  'rest-spread-spacing': ['error', 'never'],
  'semi-spacing': ['error', { before: false, after: true }],
  // Not-Standard: Readability.
  'semi-style': 'error',
  'space-in-parens': ['error', 'never'],
  'space-unary-ops': ['error', { words: true, nonwords: false }],
  // Not-Standard: Readability.
  'switch-colon-spacing': 'error',
  'template-curly-spacing': ['error', 'never'],
  'template-tag-spacing': ['error', 'never'],
  'unicode-bom': ['error', 'never'],
  'wrap-iife': ['error', 'any', { functionPrototypeMethods: true }],
  // Not-Standard: Prevent unexpected behaviour.
  'wrap-regex': 'warn',

  //
  // Import
  //

  'import/export': 'error',
  'import/first': 'error',
  'import/newline-after-import': 'error',
  'import/no-absolute-path': ['error', { esmodule: true, commonjs: true, amd: false }],
  'import/no-amd': 'error',
  'import/no-anonymous-default-export': 'error',
  'import/no-commonjs': 'error',
  'import/no-duplicates': 'error',
  'import/no-dynamic-require': 'error',
  'import/no-mutable-exports': 'error',
  'import/no-named-default': 'error',
  'import/no-self-import': 'error',
  'import/no-unused-modules': 'error',
  'import/no-useless-path-segments': 'error',
  'import/no-webpack-loader-syntax': 'error',
  'import/consistent-type-specifier-style': 'error',

  //
  // Import order
  //

  'import/order': ['error', {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
    alphabetize: { order: 'asc' }
  }],

  //
  // Overrides
  //

  // Node; our package is not published to NPM.
  'n/no-unpublished-import': 'off',
  'n/no-unpublished-require': 'off'
})

/** @return {import('eslint').Linter.RulesRecord} */
const useJavaScriptOnlyRules = () => ({
  //
  // Possible problems
  //

  'no-dupe-class-members': 'error',
  'no-loss-of-precision': 'error',
  'no-undef': 'error',
  'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, vars: 'all' }],
  'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],

  //
  // Suggestions
  //

  'camelcase': ['error', { allow: ['^UNSAFE_'], properties: 'never', ignoreGlobals: true }],
  // Non-Standard: Required by TypeScript, might as well in JavaScript as well.
  'default-param-last': 'error',
  'dot-notation': ['error', { allowKeywords: true }],
  'no-array-constructor': 'error',
  'no-implied-eval': 'error',
  // Not-Standard: Prevent unexpected behaviour.
  'no-loop-func': 'error',
  'no-redeclare': ['error', { builtinGlobals: false }],
  // Not-Standard: Prevent unexpected behaviour.
  'no-shadow': 'error',
  'no-throw-literal': 'error',
  'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
  'no-useless-constructor': 'error',
  // Not-Standard: Ensures proper usage of async functions.
  'require-await': 'error',

  //
  // Layout & Formatting
  //

  'block-spacing': ['error', 'always'],
  'brace-style': ['error', '1tbs', { allowSingleLine: true }],
  'comma-dangle': ['error', { arrays: 'never', objects: 'never', imports: 'never', exports: 'never', functions: 'never' }],
  'comma-spacing': ['error', { before: false, after: true }],
  'func-call-spacing': ['error', 'never'],
  'indent': ['error', 2, {
    SwitchCase: 1,
    VariableDeclarator: 1,
    outerIIFEBody: 1,
    MemberExpression: 1,
    FunctionDeclaration: { parameters: 1, body: 1 },
    FunctionExpression: { parameters: 1, body: 1 },
    CallExpression: { arguments: 1 },
    ArrayExpression: 1,
    ObjectExpression: 1,
    ImportDeclaration: 1,
    flatTernaryExpressions: false,
    ignoreComments: false,
    ignoredNodes: ['TemplateLiteral *', 'JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXFragment', 'JSXOpeningFragment', 'JSXClosingFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild'],
    offsetTernaryExpressions: true
  }],
  'key-spacing': ['error', { beforeColon: false, afterColon: true }],
  'keyword-spacing': ['error', { before: true, after: true }],
  'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
  'no-extra-parens': ['error', 'functions'],
  'object-curly-spacing': ['error', 'always'],
  // Not-Standard: Readability.
  'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
  'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
  'semi': ['error', 'never'],
  'space-before-blocks': ['error', 'always'],
  'space-before-function-paren': ['error', 'always'],
  'space-infix-ops': 'error'
})

/** @return {import('eslint').Linter.RulesRecord} */
const useCommonJsOnlyRules = () => ({
  'import/no-commonjs': 'off'
})

/** @return {import('eslint').Linter.RulesRecord} */
const useEsModuleOnlyRules = () => ({
  'import/no-commonjs': 'error'
})

/** @return {import('@typescript-eslint/eslint-plugin').TSESLint.Linter.RulesRecord} */
const useTypeScriptOnlyRules = () => ({
  //
  // Handled by TypeScript
  //

  'no-undef': 'off',

  //
  // Supported rules
  //

  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/ban-ts-comment': ['error', {
    'ts-expect-error': 'allow-with-description',
    'ts-ignore': true,
    'ts-nocheck': true,
    'ts-check': false,
    'minimumDescriptionLength': 3
  }],
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/ban-types': ['warn', {
    extendDefaults: false,
    types: {
      'String': { message: 'Use string instead', fixWith: 'string' },
      'Boolean': { message: 'Use boolean instead', fixWith: 'boolean' },
      'Number': { message: 'Use number instead', fixWith: 'number' },
      'Symbol': { message: 'Use symbol instead', fixWith: 'symbol' },
      'BigInt': { message: 'Use bigint instead', fixWith: 'bigint' },
      'Function': {
        message: [
          'The `Function` type accepts any function-like value.',
          'It provides no type safety when calling the function, which can be a common source of bugs.',
          'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
          'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.'
        ].join('\n')
      },
      // object typing
      'Object': {
        message: [
          'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
          '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
          '- If you want a type meaning "any value", you probably want `unknown` instead.'
        ].join('\n')
      },
      '{}': {
        message: [
          '`{}` actually means "any non-nullish value".',
          '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
          '- If you want a type meaning "any value", you probably want `unknown` instead.'
        ].join('\n')
      }
    }
  }],
  '@typescript-eslint/class-literal-property-style': ['error', 'fields'],
  '@typescript-eslint/consistent-generic-constructors': ['error', 'constructor'],
  '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
  '@typescript-eslint/consistent-type-assertions': ['error', {
    assertionStyle: 'as',
    objectLiteralTypeAssertions: 'never'
  }],
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
  '@typescript-eslint/consistent-type-imports': ['error', {
    prefer: 'type-imports',
    disallowTypeAnnotations: true,
    fixStyle: 'separate-type-imports'
  }],
  // Non-standard: Readability for public.
  '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
  '@typescript-eslint/member-delimiter-style': ['error', {
    multiline: { delimiter: 'none' },
    singleline: { delimiter: 'comma', requireLast: false }
  }],
  '@typescript-eslint/method-signature-style': 'error',
  '@typescript-eslint/naming-convention': ['error', {
    selector: 'variableLike',
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
    format: ['camelCase', 'PascalCase', 'UPPER_CASE']
  }],
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-confusing-void-expression': ['error', {
    ignoreArrowShorthand: false,
    ignoreVoidOperator: false
  }],
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-parameter-properties': 'error',
  '@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true }],
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  // Not-Standard: Prevent unexpected behaviour.
  '@typescript-eslint/prefer-literal-enum-member': ['error', { allowBitwiseExpressions: true }],
  '@typescript-eslint/prefer-nullish-coalescing': ['error', {
    ignoreConditionalTests: false,
    ignoreMixedLogicalExpressions: false
  }],
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  // Non-standard: Readability.
  '@typescript-eslint/prefer-regexp-exec': 'error',
  // Non-standard: Readability.
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/prefer-ts-expect-error': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
  '@typescript-eslint/restrict-plus-operands': ['error', { checkCompoundAssignments: true }],
  '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
  '@typescript-eslint/return-await': ['error', 'always'],
  '@typescript-eslint/strict-boolean-expressions': ['error', {
    allowString: false,
    allowNumber: false,
    allowNullableObject: false,
    allowNullableBoolean: false,
    allowNullableString: false,
    allowNullableNumber: false,
    allowAny: false
  }],
  '@typescript-eslint/triple-slash-reference': ['error', { lib: 'never', path: 'never', types: 'never' }],
  // Not-Standard: Prevent unexpected behaviour.
  '@typescript-eslint/unbound-method': ['warn', { ignoreStatic: true }],
  // Non-standard: Readability.
  '@typescript-eslint/unified-signatures': 'error',
  'no-void': ['error', { allowAsStatement: true }],

  //
  // Extension rules
  //

  // Possible problems
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-loss-of-precision': 'error',
  '@typescript-eslint/no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, vars: 'all' }],
  '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false, enums: false, variables: false, typedefs: false }],
  // Suggestions
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/dot-notation': ['error', { allowKeywords: true }],
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/no-throw-literal': 'error',
  '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/require-await': 'error',
  // Layout & Formatting
  '@typescript-eslint/block-spacing': ['error', 'always'],
  '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@typescript-eslint/comma-dangle': ['error', { arrays: 'never', objects: 'never', imports: 'never', exports: 'never', functions: 'never' }],
  '@typescript-eslint/comma-spacing': ['error', { before: false, after: true }],
  '@typescript-eslint/func-call-spacing': ['error', 'never'],
  '@typescript-eslint/indent': ['error', 2, {
    SwitchCase: 1,
    VariableDeclarator: 1,
    outerIIFEBody: 1,
    MemberExpression: 1,
    FunctionDeclaration: { parameters: 1, body: 1 },
    FunctionExpression: { parameters: 1, body: 1 },
    CallExpression: { arguments: 1 },
    ArrayExpression: 1,
    ObjectExpression: 1,
    ImportDeclaration: 1,
    flatTernaryExpressions: false,
    ignoreComments: false,
    ignoredNodes: ['TemplateLiteral *', 'JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXFragment', 'JSXOpeningFragment', 'JSXClosingFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild'],
    offsetTernaryExpressions: true
  }],
  '@typescript-eslint/key-spacing': ['error', { beforeColon: false, afterColon: true }],
  '@typescript-eslint/keyword-spacing': ['error', { before: true, after: true }],
  '@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
  '@typescript-eslint/no-extra-parens': ['error', 'functions'],
  '@typescript-eslint/object-curly-spacing': ['error', 'always'],
  '@typescript-eslint/padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
  '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
  '@typescript-eslint/semi': ['error', 'never'],
  '@typescript-eslint/space-before-blocks': ['error', 'always'],
  '@typescript-eslint/space-before-function-paren': ['error', 'always'],
  '@typescript-eslint/space-infix-ops': 'error',

  //
  // Imports
  //

  'import/extensions': ['error', 'ignorePackages', kNeverUseExtensions],

  //
  // Overrides
  //

  // TypeScript handles this, and we use the same names on types and variables at times.
  '@typescript-eslint/no-redeclare': 'off',

  //
  // Conflicting rules
  //

  // TypeScript supports syntax and modules node normally would not.
  'n/no-unsupported-features/es-syntax': 'off',
  // 'n/no-missing-import': 'off',
  // Disable rules that aren't needed or just don't really work in TypeScript.
  'import/no-named-as-default-member': 'off',
  'import/named': 'off',
  'import/namespace': 'off',
  'import/default': 'off'
})

/** @return {import('@typescript-eslint/eslint-plugin').TSESLint.Linter.RulesRecord} */
const useVueOnlyRules = () => ({
  //
  // Vue
  //

  // Preferred style
  'vue/component-api-style': 'error',
  'vue/component-name-in-template-casing': ['warn', 'PascalCase', { registeredComponentsOnly: false }],
  'vue/component-options-name-casing': 'warn',
  'vue/custom-event-name-casing': 'warn',
  'vue/define-emits-declaration': 'error',
  'vue/define-macros-order': 'warn',
  'vue/define-props-declaration': ['error', 'runtime'],
  'vue/html-button-has-type': 'warn',
  'vue/match-component-file-name': 'error',
  'vue/next-tick-style': 'warn',
  'vue/no-duplicate-attr-inheritance': 'error',
  'vue/no-empty-component-block': 'error',
  'vue/no-required-prop-with-default': 'error',
  'vue/no-static-inline-styles': 'warn',
  'vue/no-template-target-blank': 'error',
  'vue/no-unsupported-features': ['error', { version: '^3.2.0' }],
  'vue/no-unused-properties': 'warn',
  'vue/no-unused-refs': 'warn',
  'vue/no-useless-mustaches': 'warn',
  'vue/no-useless-v-bind': 'warn',
  'vue/no-v-text': 'warn',
  'vue/padding-line-between-blocks': 'warn',
  'vue/prefer-true-attribute-shorthand': 'warn',
  'vue/require-name-property': 'warn',
  'vue/static-class-names-order': 'warn',
  'vue/v-for-delimiter-style': ['error', 'of'],

  //
  // Extension rules
  //

  // Possible problems
  'vue/no-constant-condition': ['error', { checkLoops: false }],
  'vue/no-empty-pattern': 'error',
  'vue/no-irregular-whitespace': 'error',
  'vue/no-loss-of-precision': 'error',
  'vue/no-sparse-arrays': 'error',

  // Suggestions
  'vue/camelcase': ['error', { allow: ['^UNSAFE_'], properties: 'never', ignoreGlobals: true }],
  'vue/dot-notation': ['error', { allowKeywords: true }],
  'vue/eqeqeq': ['error', 'always', { null: 'ignore' }],
  'vue/no-useless-concat': 'error',
  'vue/prefer-template': 'warn',
  'vue/quote-props': ['error', 'consistent-as-needed'],

  // Layout & Formatting
  'vue/array-bracket-newline': ['error', 'consistent'],
  'vue/array-bracket-spacing': ['error', 'never'],
  'vue/array-element-newline': ['error', 'consistent'],
  'vue/arrow-spacing': ['error', { before: true, after: true }],
  'vue/block-spacing': ['error', 'always'],
  'vue/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  'vue/comma-dangle': ['error', { arrays: 'never', objects: 'never', imports: 'never', exports: 'never', functions: 'never' }],
  'vue/comma-spacing': ['error', { before: false, after: true }],
  'vue/comma-style': ['error', 'last'],
  'vue/dot-location': ['error', 'property'],
  'vue/func-call-spacing': ['error', 'never'],
  'vue/key-spacing': ['error', { beforeColon: false, afterColon: true }],
  'vue/keyword-spacing': ['error', { before: true, after: true }],
  'vue/multiline-ternary': ['error', 'always-multiline'],
  'vue/no-extra-parens': ['error', 'functions'],
  'vue/object-curly-newline': ['error', { multiline: true, consistent: true }],
  'vue/object-curly-spacing': ['error', 'always'],
  'vue/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before', '|>': 'before' } }],
  'vue/space-in-parens': ['error', 'never'],
  'vue/space-infix-ops': 'error',
  'vue/space-unary-ops': ['error', { words: true, nonwords: false }],
  'vue/template-curly-spacing': ['error', 'never'],

  //
  // Language limits
  //

  'vue/block-lang': ['error', {
    script: { lang: 'ts', allowNoLang: false },
    template: { lang: 'html', allowNoLang: true },
    style: { lang: 'css', allowNoLang: true } // Maybe SCSS/SASS later?
  }],

  //
  // Overrides
  //

  // Disabled because of erronious inclusion in pre-defined rule sets.
  'vue/require-default-prop': 'off', // Not appropriate for Vue 3+ or 2.7+

  // Disables or modifies a few recommended rules that makes things too verbose or long
  'vue/first-attribute-linebreak': 'off',
  'vue/html-closing-bracket-newline': ['warn', { multiline: 'never' }],
  'vue/html-closing-bracket-spacing': ['warn', { selfClosingTag: 'never' }],
  'vue/html-self-closing': ['warn', { html: { normal: 'never' } }],
  'vue/max-attributes-per-line': 'off',
  'vue/singleline-html-element-content-newline': 'off'

  /*
    TODO: Support for the following rules later:
    - vue/no-bare-strings-in-template -- We will need to identify every place localized strings
      should appear in Vuetify components, and our own.
    - vue/no-restricted-call-after-await -- We will need to identify all call that must be called
      in setup synchronously.
  */
})

/**
 * @param {import('@typescript-eslint/utils').TSESLint.Linter.Config} config
 * @return {import('@typescript-eslint/utils').TSESLint.Linter.Config}
 */
const defineConfig = config => config

module.exports = {
  // Extensions
  kVueExtensions,
  kJavaScriptExtensions,
  kTypeScriptExtensions,
  kAllExtensions,
  kResolveExtensions,
  kNeverUseExtensions,
  // Rules
  useBaseRules,
  useJavaScriptOnlyRules,
  useCommonJsOnlyRules,
  useEsModuleOnlyRules,
  useTypeScriptOnlyRules,
  useVueOnlyRules,
  // Wrapper, for typing.
  defineConfig
}
