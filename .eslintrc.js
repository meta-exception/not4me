module.exports = {
  root: true,

  parser: "vue-eslint-parser",

  parserOptions: {
    parser: "@typescript-eslint/parser"
  },

  env: {
    browser: true
  },

  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: [
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'prettier/vue',
    'airbnb-base'
  ],

  plugins: [
    'vue',  // required to lint *.vue files
    '@typescript-eslint',
    'prettier'
  ],

  globals: {
    'ga': true, // Google Analytics
    'cordova': true,
    '__statics': true,
    'process': true
  },

  // add your custom rules here
  rules: {
    // https://github.com/prettier/eslint-plugin-prettier#options
    'prettier/prettier': ['error',
      {
        'parser': 'vue',
        'singleQuote': true,
        'trailingComma': 'es5',
        'arrowParens': 'always'
      }
    ],

    'no-param-reassign': 'off',

    'class-methods-use-this': 'warn',
    'max-len': [ 'error',
      {
        'code': 120,
        'ignoreComments': false,
        'ignoreUrls': true
      }
    ],

    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': [ 'error',
      {
        "ignore": [
          '^@',
          '^assets',
          '^components',
          '^layouts',
          '^pages',
          '^plugins',
          '^variables'
        ]
      }
    ],
    'import/no-extraneous-dependencies': 'off',
    'prefer-promise-reject-errors': 'off',

    // allow console.log during development only
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'vue/this-in-template': 'error'
  }
}
