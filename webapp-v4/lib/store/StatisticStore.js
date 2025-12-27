/**
 * Store for statistic views, only data for filtering and display
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.12.2025
 **/

import {defineStore} from 'pinia'

export const useStatisticStore = defineStore('Statistic', {
  state:   () => ({
    activeTab: '1',
    filter: {
      various:          true,
      gambling:         true,
      chancellery:      true,
      penalty:          true,
      propertyPurchase: true,
      housePurchase:    true,
      rent:             true,
      hourlyFee:        true,
      interest:         true,
    }
  }),
  getters: {},
  actions: {}
})
