/**
 * The store for the online connectivity over a socket
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.01.2026
 **/

import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useSocketStore = defineStore('Socket', () => {
  const connected       = ref(false)

  return {connected}
})
