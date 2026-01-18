/**
 * This is the store for game logs
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.01.2026
 **/

import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {DateTime} from 'luxon';

const NUMBER_OF_ENTRIES = 10;

export const useGameLogStore = defineStore('GameLog', () => {
  const logs = ref(new Map());

  const numberOfEntries = ref(NUMBER_OF_ENTRIES);

  const addLogEntry = function (entry) {
    entry.timestamp = DateTime.fromISO(entry.timestamp);
    logs.value.set(entry.id, entry)
  }


  const currentEntries = computed(() => {
    return Array.from(logs.value.values())
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      .slice(0, numberOfEntries.value);
  })

  return {logs, addLogEntry, currentEntries, numberOfEntries}
})
