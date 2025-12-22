/**
 * The rules, a very, very simple store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 22.12.2025
 **/

import {defineStore} from 'pinia'

export const useRulesStore = defineStore('Rules', {
  state:   () => ({
    rules: {}
  }),
  getters: {},
  actions: {
    setRules(rules) {
      this.rules = rules;
    }
  }
})
