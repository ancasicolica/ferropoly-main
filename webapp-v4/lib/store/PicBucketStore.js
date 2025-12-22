/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 07.12.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import {useTeamsStore} from './TeamsStore';
import {usePropertyStore} from './PropertyStore';
import {DateTime} from 'luxon';

export const usePicBucketStore = defineStore('PicBucket', {
  state:   () => ({
    pictures:     [],
    gameId:       '',
    filterTeamId: null,
    searchQuery:  null,
    sortAscending:    true
  }),
  getters: {
    getPicturesForProperty: (state) => (propertyId) => {
      return state.pictures.filter(pic => pic.propertyId === propertyId);
    },
    getPicturesForTeam:     (state) => (teamId) => {
      return state.pictures.filter(pic => pic.teamId === teamId);
    }
  },
  actions: {
    /**
     * Fetches pictures from the server and updates the local pictures array.
     * The method builds a URL using the provided gameId and optionally a teamId,
     * fetches data from the API, and stores the resulting pictures.
     *
     * @param {Object} options - Options object for fetching pictures.
     * @param {string} [options.gameId] - The ID of the game to fetch pictures for.
     *                                     If provided, it updates the instance's gameId.
     * @param {string} [options.teamId] - The team ID to fetch pictures for,
     *                                     if applicable.
     * @return {Promise<void>} A promise that resolves once the pictures are successfully fetched and stored
     *                         or rejects in case of an error.
     */
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
          this.addPicture(pic);
        }
        console.log('Pictures loaded', self.pictures);
      }
      catch (err) {
        console.warn(err);
      }
    },
    /**
     * Adds a picture to the PicBucket Store.
     *
     * @param {Object} pic The picture object to be added to the store.
     * @return {void} This method does not return a value.
     */
    addPicture(pic) {
      //console.log('Adding picture into PicBucket Store', pic);
      const teamsStore    = useTeamsStore();
      const propertyStore = usePropertyStore();
      pic.teamName        = teamsStore.idToTeamName(pic.teamId);
      pic.locationName    = propertyStore.properties.get(pic.propertyId)?.location.name;
      pic.timestamp       = DateTime.fromISO(pic.timestamp);
      this.pictures.push(pic);
    }
  }
})
