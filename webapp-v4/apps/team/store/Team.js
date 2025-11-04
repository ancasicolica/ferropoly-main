/**
 * Store for the team editor
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.11.2025
 **/

import {defineStore} from 'pinia'

export const useTeamStore = defineStore('Team', {
  state:   () => ({
    gameId:          '',
    teamId:          '',
    menuBarElements: []
  }),
  getters: {},
  actions: {
    fetchData(gameId, teamId) {
      this.gameId = gameId;
      this.teamId = teamId;
    }
  }
})
