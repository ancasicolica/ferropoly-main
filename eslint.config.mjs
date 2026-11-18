import globals from 'globals';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        __resourceQuery: 'readonly',
        describe: 'readonly',
        describeSaga: 'readonly',
        describeEvent: 'readonly',
        describeCommand: 'readonly',
        it: 'readonly',
        xit: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        after: 'readonly',
        before: 'readonly',
        beforeEachChapter: 'readonly',
        describeScenario: 'readonly',
        describeChapter: 'readonly',
        describeStep: 'readonly',
        File: 'readonly',
        QCodeDecoder: 'readonly',
        $: 'readonly',
        L: 'readonly',
        angular: 'readonly',
        jQuery: 'readonly'
      }
    },
    settings: {
      jsx: true
    },
    rules: {
      'no-unused-vars': ['error', {vars: 'all', args: 'none'}],
      curly: ['error', 'multi-line'],
      'no-empty': 'warn',
      'handle-callback-err': 'warn',
      eqeqeq: 'warn',
      quotes: ['warn', 'single'],
      'no-unused-expressions': 'warn',
      semi: 'warn',
      'block-scoped-var': 'warn',
      'no-alert': 'warn',
      'new-cap': 'off',
      'dot-notation': 'off',
      'consistent-return': 'off',
      'brace-style': 'off',
      'no-multi-spaces': 'off',
      'no-underscore-dangle': 'off',
      'key-spacing': 'off',
      'comma-spacing': 'off',
      'no-shadow': 'off',
      'no-mixed-requires': 'off',
      'space-infix-ops': 'off',
      strict: 'off',
      camelcase: 'off',
      'comma-dangle': 'off',
      'no-extra-semi': 'off',
      'no-use-before-define': 'off',
      'eol-last': 'off',
      'no-trailing-spaces': 'off',
      indent: 'off'
    }
  }
];