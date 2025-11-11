/**
 * This is the property store (more correctly it should be called "PropertiesStore" but this
 * is an difficult word, so keep it in singular).
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.11.2025
 **/

import {defineStore} from 'pinia';
import {getMapMarkerInstance} from '../MapMarkers';
import {get, assign} from 'lodash';
import axios from 'axios';

export const usePropertyStore = defineStore('Property', {
  state:   () => ({
    properties: new Map(),
    ready: false,
    gameId: ''
  }),
  getters: {},
  actions: {
    /**
     * Initializes the properties and sets up the required map markers.
     *
     * @param gameId
     * @param {Array<Object>} properties - An array of property objects to initialize.
     * Each property object should include a `uuid` and other relevant attributes.
     * @return {Promise<void>} A promise that resolves once the initialization is completed.
     */
    async init(gameId, properties) {
      // Create the map of properties
      for (const prop of properties) {
        prop.visibleOnMap = true;
        prop.gamedata     = {
          owner:           null,
          boughtTs:        null,
          buildings:       0,
          buildingEnabled: false
        };
        this.properties.set(prop.uuid, prop);
      }
      this.gameId = gameId;
      await getMapMarkerInstance().init();
      this.ready = true;
      console.log('init done', this.properties);
    },
    /**
     * Updates the property store elements for the gamedata (ownership, building enabled, ...)
     * @param options
     * @return {Promise<void>}
     */
    async update(options = {}) {
      console.log('updating', options);
      const teamId = get(options, 'teamId', null);
      let url = `/properties/get/${this.gameId}`;
      if (teamId) {
        url += `/${teamId}`;
      }
      try {
        const resp = await axios.get(url);
        console.log(resp.data);
        for(const prop of resp.data.properties) {
          if (prop.gamedata) {
            const p = this.properties.get(prop.uuid);
            if (p) {
              assign(p.gamedata, prop.gamedata);
              if (p.gamedata.owner) {
                console.log('owned', p);
              }
            }
          }
        }
      }
      catch(err) {
        console.error(err);
      }
    }
  }
})
