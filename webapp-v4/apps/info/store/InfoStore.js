/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 25.10.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import FerropolyApiError from '../../../lib/FerropolyApiError';
import {DateTime} from 'luxon';

export const useInfoStore = defineStore('Info', {
  state:   () => ({
    menuBarElements: [
      {label: 'Info', route: 'root'},
      {label: 'Preisliste', route: 'pricelist'},
      {label: 'Karte', route: 'map'},
      {label: 'Spielregeln', route: 'rules'},
    ],
    pricelist:       [],
    gameInfo:        {
      date:        null,
      start:       '',
      end:         '',
      organisator: '',
      email:       '',
      phone:       '',
      gameName:    '',
    },
    gameId:          '',
    apiError:        null,
    teams:           [],
  }),
  getters: {},
  actions: {
    async fetchData(gameId) {
      try {
        this.gameId = gameId;
        console.log(`Loading data for ${gameId}`);
        const resp = await axios.get(`/info/data/${gameId}`);
        this.teams = resp.data.teams;
        const gp   = resp.data.gameplay;
        console.log(resp.data, gp);
        this.gameInfo.date        = DateTime.fromISO(gp.scheduling.gameDate);
        this.gameInfo.start       = gp.scheduling.gameStart;
        this.gameInfo.end         = gp.scheduling.gameEnd;
        this.gameInfo.organisator = gp.owner.organisatorName;
        this.gameInfo.email       = gp.owner.organisatorEmail;
        this.gameInfo.phone       = gp.owner.organisatorPhone;
        this.gameInfo.gameName       = gp.gamename;

        this.pricelist = resp.data.pricelist;
      }

      catch (err) {
        this.apiError = new FerropolyApiError(err);
      }


    }
  }
})
