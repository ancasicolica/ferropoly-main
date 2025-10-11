/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 11.10.2025
 **/

import {defineStore} from 'pinia'
import FerropolyApiError from '../../../lib/FerropolyApiError';
import axios from 'axios'
import {assign} from 'lodash'

export const useJoinStore = defineStore('Join', {
  state:   () => ({
    menuBarElements: [],
    gameId: '',
    apiError: null,
    gameplay: {
      owner     : {},
      scheduling: {},
      internal  : {
        gameId: 'none'
      },
      rules     : {
        text: '<em>not yet</em>'
      },
      joining   : {
        infotext     : '',
        possibleUntil: '2121-12-21T00:00:00'
      },
      gamename  : ''
    },
    user    : {
      personalData: {},
      id          : '',
      name        : ''
    },
    teamInfo: {
      name            : '',
      organization    : '',
      phone           : '',
      remarks         : '',
      confirmed       : false,
      id              : null,
      registrationDate: null,
      changedDate     : null
    },

  }),
  getters: {},
  actions: {
    async fetchData(gameId) {
      this.gameId = gameId;
      try {
        const resp = await axios.get(`/join/data/${gameId}`);
        const data = resp.data;
        // assign is important, otherwise no 2-way-binding in vue possible!
        assign(this.gameplay, data.gameplay);
        assign(this.user, data.user);
        assign(this.teamInfo, data.teamInfo);
      }
      catch(err) {
        this.apiError = new FerropolyApiError(err);
      }
    }
  }
})
