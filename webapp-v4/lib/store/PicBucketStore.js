/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 07.12.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';

export const usePicBucketStore = defineStore('PicBucket', {
  state:   () => ({
    pictures: [],
    gameId: ''
  }),
  getters: {
    getPicturesForProperty: (state) => (propertyId) => {
      return state.pictures.filter(pic => pic.propertyId === propertyId);
    },
    getPicturesForTeam: (state) => (teamId) => {
      return state.pictures.filter(pic => pic.teamId === teamId);
    }
  },
  actions: {
    async fetchPictures(options = {}) {
      const self = this;
      if (options.gameId) {
        this.gameId = options.gameId;
      }
      let url = `/picbucket/${this.gameId}`;
      if (options.teamId) {
        url += `/${options.teamId}`;
      }
      try {
        const resp = await axios.get(url);
        for (const pic of resp.data) {
          self.pictures.push(pic);
        }
        console.log('Pictures loaded', self.pictures);
      }
      catch(err) {
        console.warn(err);
      }
    },
    addPicture(pic) {
      console.log('Adding picture into PicBucket Store', pic);
      this.pictures.push(pic);
    }
  }
})
