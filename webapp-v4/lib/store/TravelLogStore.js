/**
 * Store for the travelling logs
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.01.2026
 **/

import {defineStore} from 'pinia'
import {ref, computed} from 'vue'

export const useTravelLogStore = defineStore('TravelLog', () => {
  const logs = ref({});

  // Getter

  /**
   * Returns all log entries as array
   */
  const allLogs = computed(() => Object.values(logs.value))

  /**
   * Grooups dhe logs by team for faster access
   */
  const logsByTeam = computed(() => {
    const grouped = {}
    allLogs.value.forEach(log => {
      if (!grouped[log.teamId]) {
        grouped[log.teamId] = []
      }
      grouped[log.teamId].push(log)
    })
    // Optional: Innerhalb der Teams nach Zeitstempel sortieren
    Object.keys(grouped).forEach(teamId => {
      grouped[teamId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    })
    return grouped
  })

  /**
   * Returns the log for one specific team
   */
  const getLogForTeam = computed(() => (teamId) => {
    return logsByTeam.value[teamId] || []
  })


  /**
   * Adds new entries to the log store, overwriting existing entries with the same _id
   * @param {Array} logEntries
   */
  function addLogEntries(logEntries) {
    if (!Array.isArray(logEntries)) return

    const newLogs = { ...logs.value }
    logEntries.forEach(entry => {
      if (entry._id) {
        newLogs[entry._id] = entry
      }
    })
    logs.value = newLogs
  }


  return {
    logs,
    allLogs,
    logsByTeam,
    getLogForTeam,
    addLogEntries
  }
})
