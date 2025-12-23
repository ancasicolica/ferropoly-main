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
import {assign, get} from 'lodash';

export const usePicBucketStore = defineStore('PicBucket', {
  state:   () => ({
    pictures:                [],
    gameId:                  '',
    filterTeamId:            null,
    searchQuery:             null,
    sortAscending:           true,
    activePicturePropertyId: null
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
     * Assigns a property to a specified picture by updating its location data
     * and making a request to the server.
     *
     * @param {Object} picture - The picture object to which the property will be assigned.
     * @param {string} propertyId - The identifier of the property to be assigned.
     * @return {Promise<void>} A promise that resolves once the property assignment process is complete.
     */
    async assignProperty(picture, propertyId) {
      const picId         = get(picture, '_id', 'none');
      const propertyStore = usePropertyStore();
      try {
        await axios.post(`/picbucket/assign/${picId}`, {propertyId});
        const existingPic = this.pictures.find(e => e._id === picId);
        if (!existingPic) {
          return console.warn('pic not found', picture);
        }
        existingPic.locationName = propertyStore.properties.get(propertyId)?.location.name;
      }
      catch (err) {
        console.error(err);
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

      const existingPic = this.pictures.find(e => e._id === pic._id);
      if (existingPic) {
        assign(existingPic, pic)
        existingPic.teamName     = teamsStore.idToTeamName(pic.teamId);
        existingPic.locationName = propertyStore.properties.get(pic.propertyId)?.location.name;
        existingPic.timestamp    = DateTime.fromISO(pic.timestamp);
        console.log('Updated existing pic', existingPic);
      } else {
        pic.teamName     = teamsStore.idToTeamName(pic.teamId);
        pic.locationName = propertyStore.properties.get(pic.propertyId)?.location.name;
        pic.timestamp    = DateTime.fromISO(pic.timestamp);
        this.pictures.push(pic);
      }
    }
  }

})
