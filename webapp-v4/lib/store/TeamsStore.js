/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.11.2025
 **/

import {defineStore} from 'pinia'
import {find, result, sortBy} from 'lodash';
import {Team} from '../Team.js';

export const useTeamsStore = defineStore('Teams', {
  state:   () => ({
    teams: []
  }),
  getters: {
    /**
     * Converts a teamId to the name of the team
     * @param state
     * @return {function(*): String}
     */
    idToTeamName: (state) => (id) => {
      return result(find(state.teams, {uuid: id}), 'data.name');
    },

    /**
     * Returns the team by its ID
     * @param state
     * @returns {function(*): unknown}
     */
    teamById: (state) => (id) => {
      console.log('Requesting', id, state.teams);
      return find(state.teams, {uuid: id});
    },
    /**
     * Returns the color of a team by its ID
     * @param state
     * @returns {function(*): unknown}
     */
    idToColor: (state) => (id) => {
      const color = result(find(state.teams, {uuid: id}), 'color');
      if (!color) {
        return 'pink';
      }
      return color;
    },
    /**
     * Returns the number of teams
     * @param state
     * @returns {number}
     */
    numberOfTeams: (state) => {
      return state.teams.length;
    }
  },
  actions: {
    setTeams(teams) {
      let i           = 0;
      let sortedTeams = sortBy(teams, 'data.name');
      console.log('SORTING', teams, sortedTeams);
      sortedTeams.forEach(t => {
        this.teams.push(new Team(t, i));
        i++;
      });
    }
  }
})
