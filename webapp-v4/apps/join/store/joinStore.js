/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 11.10.2025
 **/

import {defineStore} from 'pinia'
import FerropolyApiError from '../../../lib/FerropolyApiError';
import axios from 'axios'
import {assign} from 'lodash'
import {teamNameSchema, organizationNameSchema, teamPhoneSchema} from '../../../common/schemas/PlayerSchema';
import {joinFormSchema} from '../lib/joinFormSchema';
import {getAuthToken} from '../../../common/adapters/authToken';
import {DateTime} from 'luxon';

export const useJoinStore = defineStore('Join', {
  state:   () => ({
    menuBarElements: [],
    gameId:          '',
    apiError:        null,
    gameplay:        {
      owner:      {},
      scheduling: {},
      internal:   {
        gameId: 'none'
      },
      rules:      {
        text: '<em>not yet</em>'
      },
      joining:    {
        infotext:      '',
        possibleUntil: '2121-12-21T00:00:00'
      },
      gamename:   ''
    },
    user:            {
      personalData: {
        name:  '',
        email: ''
      },
      id:           '',

    },
    teamInfo:        {
      name:             '',
      organization:     '',
      phone:            '',
      remarks:          '',
      confirmed:        false,
      id:               null,
      registrationDate: null,
      changedDate:      null
    },
    teamInfoEdit:    {
      name:         '',
      organization: '',
      phone:        '',
      remarks:      '',
    },

  }),
  getters: {
    teamNameValidation(state) {
      return teamNameSchema.safeParse(state.teamInfoEdit.name);
    },
    teamPhoneValidation(state) {
      return teamPhoneSchema.safeParse(state.teamInfoEdit.phone);
    },
    teamOrganizationValidation(state) {
      return organizationNameSchema.safeParse(state.teamInfoEdit.organization);
    },
    formValidation(state) {
      return joinFormSchema.safeParse(state.teamInfoEdit);
    },
    joiningPossible(state) {
      return (DateTime.fromISO(state.gameplay.joining.possibleUntil) > DateTime.now())
    }
  },
  actions: {
    /**
     * Fetches game data from the server for the given game ID and updates the local state with the retrieved data.
     *
     * @param {string} gameId - The unique identifier of the game to fetch data for.
     * @return {Promise<void>} A promise that resolves when the game data has been successfully fetched and local state
     *   updated, or rejects if an error occurs during the process.
     */
    async fetchData(gameId) {
      this.gameId = gameId;
      try {
        const resp = await axios.get(`/join/data/${gameId}`);
        const data = resp.data;
        console.log(resp.data);
        // assign is important, otherwise no 2-way-binding in vue possible!
        assign(this.gameplay, data.gameplay);
        assign(this.user, data.user);
        assign(this.teamInfo, data.teamInfo);
        this.resetEditData();
      }
      catch (err) {
        this.apiError = new FerropolyApiError(err);
      }
    },
    /**
     * Resets the editable team information data to the original team information values.
     *
     * @return {void} Does not return any value.
     */
    resetEditData() {
      this.teamInfoEdit.name         = this.teamInfo.name;
      this.teamInfoEdit.organization = this.teamInfo.organization;
      this.teamInfoEdit.phone        = this.teamInfo.phone;
      this.teamInfoEdit.remarks      = this.teamInfo.remarks;
    },
    /**
     * Joins a game using the provided game ID and team information, sends the data to the server,
     * and, if successful, refreshes the game data.
     *
     * @return {Promise<void>} A promise that resolves when the game is joined successfully and the data is reloaded.
     *                         If an error occurs during the process, it is captured and assigned to the apiError.
     */
    async joinGame() {
      try {
        const authToken = await getAuthToken();
        console.log('authToken', authToken);
        await axios.post(`/join/${this.gameId}`,
          {
            authToken,
            teamName    : this.teamInfoEdit.name,
            organization: this.teamInfoEdit.organization,
            phone       : this.teamInfoEdit.phone,
            remarks     : this.teamInfoEdit.remarks
          })
        console.log('saved, ok, loading data again');
        await this.fetchData(this.gameId);
      }
      catch (err) {
        this.apiError = new FerropolyApiError(err);
      }
    }
  }
})
