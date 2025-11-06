/**
 * Store for the team editor
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.11.2025
 **/

import {defineStore} from 'pinia'
import {getAuthToken} from '../../../common/adapters/authToken';
import axios from 'axios';
import FerropolyApiError from '../../../lib/FerropolyApiError';

export const useTeamStore = defineStore('Team', {
  state:   () => ({
    gameId:          '',
    teamId:          '',
    teamMembers:     [],
    menuBarElements: [],
    apiError:        null,
  }),
  getters: {},
  actions: {
    /**
     * Fetches data related to a specific game and team,
     * and initiates the process to fetch members associated with the team.
     *
     * @param {string} gameId - The unique identifier for the game.
     * @param {string} teamId - The unique identifier for the team.
     * @return {Promise<void>} A promise that resolves when the data has been successfully fetched.
     */
    async fetchData(gameId, teamId) {
      this.gameId = gameId;
      this.teamId = teamId;
      await this.fetchMembers();
    },
    /**
     * Stores a new member to the specified team.
     *
     * @param {string} memberId - The identifier of the member to be added.
     * @return {Promise<void>} Resolves when the member is successfully stored.
     */
    async storeMember(memberId) {
      try {
        const authToken = await getAuthToken();
        await axios.post(`/team/members/${this.gameId}/${this.teamId}`,
          {
            newMemberLogin: memberId,
            authToken
          })
        await this.fetchMembers();
      }
      catch (err) {
        this.apiError = new FerropolyApiError(err);
      }
    },
    /**
     * Removes a member from the team based on the provided member ID.
     * This method sends a DELETE request to the server using the current game and team IDs.
     * After removal, it updates the list of team members.
     *
     * @param {string} memberId - The ID of the member to be removed.
     * @return {Promise<void>} A promise that resolves when the member is successfully removed and the members list is updated.
     */
    async removeMember(memberId) {
      try {
        const authToken = await getAuthToken();
        await axios.delete(`/team/members/${this.gameId}/${this.teamId}`,
          {
            data: {
              memberToDelete: memberId,
              authToken
            }
          });
        await this.fetchMembers();
      }
      catch (err) {
        this.apiError = new FerropolyApiError(err);
      }
    },
    /**
     * Fetches the team members associated with the current game and team identifiers.
     * This method makes an API call to retrieve team member information and updates the `teamMembers` property.
     *
     * @return {Promise<void>} A promise that resolves when the team member data has been successfully retrieved and processed.
     */
    async fetchMembers() {
      const self = this;
      try {
        const resp = await axios.get(`/team/members/${this.gameId}/${this.teamId}`);
        console.log('Team members', resp.data.members);
        self.teamMembers = resp.data.members;
      }
      catch (err) {
        this.apiError = new FerropolyApiError(err);
      }
    }
  }
})
