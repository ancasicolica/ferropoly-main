
/*
 * Copyright (c) 2021 Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 */

module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    // add more generic rulesets here, such as:
    //'eslint:recommended',
    'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
  ],
  rules: {
    'vue/html-indent': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
  }
}
