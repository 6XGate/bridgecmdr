module.exports = {
    root: true,

    env: {
        "shared-node-browser": true,
        browser: true,
        worker: true,
        node: true,
        es6: true,
    },
    plugins: [
        "vue",
        "@typescript-eslint",
        "import",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript",
        "plugin:import/warnings",
        "plugin:import/errors",
        "plugin:node/recommended",
        "plugin:vue/recommended",
        "@vue/typescript",
    ],
    globals: {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
    },
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        parser: "@typescript-eslint/parser"
    },
    rules: {
        // # Possible Errors
        "no-await-in-loop": "error",
        "no-template-curly-in-string": "error",
        "no-console": "off",

        // # Best Practices
        "accessor-pairs": "error",
        "array-callback-return": "error",
        "block-scoped-var": "error",
        "class-methods-use-this": "warn",
        "consistent-return": "error",
        "curly": ["error", "all"],
        "default-case": "error",
        "dot-location": ["error", "object"],
        "dot-notation": "warn",
        "eqeqeq": "error",
        "guard-for-in": "error",
        "no-alert": "error",
        "no-caller": "error",
        "no-div-regex": "error",
        "no-else-return": "error",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "warn",
        "no-labels": "error",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-invalid-this": "error",
        "no-iterator": "error",
        "no-lone-blocks": "error",
        "no-loop-func": "error",
        "no-multi-spaces": "off",
        "no-multi-str": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "warn",
        "no-proto": "error",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-unmodified-loop-condition": "error",
        "no-unused-expressions": ["warn", {
            allowShortCircuit: true,
            allowTernary: true,
        }],
        "no-useless-call": "error",
        "no-useless-concat": "error",
        "no-useless-return": "error",
        "no-void": "error",
        "prefer-promise-reject-errors": "warn",
        "radix": ["error", "as-needed"],
        "require-unicode-regexp": "error",
        "wrap-iife": ["error", "inside"],
        "yoda": ["error", "never", {
            exceptRange: true,
        }],

        // # Variables
        "no-label-var": "error",
        "no-shadow": "warn",

        // # Node.js and CommonJS
        "no-process-env": "off",
        "no-process-exit": "off",

        // # Stylistic Issues
        "array-bracket-newline": ["error", { "multiline": true }],
        "array-bracket-spacing": ["error", "always" , {
            singleValue: false,
        }],
        "array-element-newline": ["error", "consistent"],
        "block-spacing": "error",
        "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
        "comma-dangle": ["error", "always-multiline"],
        "comma-style": ["error", "last"],
        "computed-property-spacing": ["error", "never"],
        "eol-last": ["error", "always"],
        "func-call-spacing": ["error", "never"],
        "func-name-matching": "warn",
        "indent": ["error", 4, {
            SwitchCase: 1,

        }],
        "key-spacing": ["error", {
            afterColon: true,
            align: "value",
        }],
        "keyword-spacing": ["error", {
            before: true,
            after: true,
        }],
        "linebreak-style": ["error", "unix"],
        "lines-between-class-members": ["error", "always", {
            exceptAfterSingleLine: true,
        }],
        "new-cap": ["error", {
            capIsNewExceptions: [
                "Source",
                "SourceModel",
                "Switch",
                "SwitchModel",
                "Tie",
                "TieModel",
            ],
        }],
        "new-parens": "error",
        "no-array-constructor": "error",
        "no-continue": "warn",
        "no-lonely-if": "error",
        "no-mixed-operators": "warn",
        "no-multi-assign": "error",
        "no-multiple-empty-lines": "error",
        "no-nested-ternary": "warn",
        "no-new-object": "error",
        "no-trailing-spaces": "error",
        "no-unneeded-ternary": "warn",
        "object-curly-newline": ["error", {
            multiline: true,
            consistent: true,
        }],
        "object-curly-spacing": ["error", "always"],
        "object-property-newline": ["error", {
            allowAllPropertiesOnSameLine: true,
        }],
        "one-var": ["error", "never"],
        "operator-linebreak": ["error", "after"],
        "padding-line-between-statements": ["error", {
            blankLine: "always",
            prev: "*",
            next: "return",
        }],
        "prefer-object-spread": "warn",
        "quote-props": ["error", "consistent"],
        "quotes": ["error", "double", {
            avoidEscape: true,
        }],
        "semi-spacing": "error",
        "semi-style": "error",
        "space-before-blocks": "error",
        "space-before-function-paren": ["error", {
            anonymous: "always",
            named: "never",
            asyncArrow: "always",
        }],
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "switch-colon-spacing": "error",
        "template-tag-spacing": ["error", "never"],
        "unicode-bom": ["error", "never"],
        "wrap-regex": "warn",

        // # ECMAScript 6
        "arrow-body-style": ["error", "as-needed"],
        "arrow-parens": ["error", "as-needed"],
        "arrow-spacing": "error",
        "generator-star-spacing": "error",
        "no-confusing-arrow": ["error", {
            allowParens: true,
        }],
        "no-useless-computed-key": "warn",
        "no-useless-rename": "error",
        "no-var": "error",
        "prefer-const": "warn",
        "prefer-numeric-literals": "error",
        "prefer-rest-params": "warn",
        "prefer-spread": "warn",
        "prefer-template": "warn",
        "rest-spread-spacing": ["error", "never"],
        "symbol-description": "error",
        "template-curly-spacing": ["error", "never"],
        "yield-star-spacing": "error",

        // # TypeScript
        "@typescript-eslint/no-useless-constructor": "error",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-function-return-type": ["error", {
            allowExpressions: true,
        }],
        "@typescript-eslint/semi": ["error", "always"],
        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],

        // # Import
        "import/first": "off",
        "import/extensions": ["error", "never", {
            "vue": "always",
        }],

        // # Node
        "node/no-unsupported-features/es-syntax": "off",
        "node/no-unpublished-require": "off",
        "node/no-unpublished-import": "off",
        "node/no-missing-require": ["error", {
            tryExtensions: [".js", ".ts", ".d.ts"],
        }],
        "node/no-missing-import": ["error", {
            tryExtensions: [".js", ".ts", ".d.ts"],
        }],

        // # Vue
        "vue/singleline-html-element-content-newline": "off",
        "vue/html-self-closing": "off",
        "vue/max-attributes-per-line": "off",
        "vue/html-indent": ["error", 4],
        "vue/html-closing-bracket-spacing": [ "error", {
            selfClosingTag: "never",
        }],"vue/html-closing-bracket-newline": ["error", {
            singleline: "never",
            multiline: "never",
        }],
        "vue/script-indent": ["error", 4, {
            baseIndent: 1,
            // "switchCase": 0,
            // "ignores": [],
        }],"vue/order-in-components": ["error", {
            "order": [
                "el",
                "name",
                "parent",
                "functional",
                ["delimiters", "comments"],
                ["components", "directives", "filters"],
                "extends",
                "mixins",
                "inheritAttrs",
                "model",
                ["props", "propsData"],
                "fetch",
                "asyncData",
                "data",
                "computed",
                "watch",
                "methods",
                "LIFECYCLE_HOOKS",
                "head",
                ["template", "render"],
                "renderError",
            ]
        }],
    },
    "overrides": [
        {
            files: [ "*.vue" ],
            rules: {
                "indent": "off",
            },
        }
    ],
};
