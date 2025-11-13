/**
 * This is the property store (more correctly it should be called "PropertiesStore" but this
 * is an difficult word, so keep it in singular).
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.11.2025
 **/

import {defineStore} from 'pinia';
import {getMapMarkerInstance} from '../MapMarkers';
import {get, assign, isString, findIndex} from 'lodash';
import axios from 'axios';

export const usePropertyStore = defineStore('Property', {
  state:   () => ({
    properties:            new Map(),
    ready:                 false,
    debugOutput:           false, // activates additional outputs onto the console if set to true
    showMarkersAsCategory: false, // when true, markers are displayed in category style
    gameId:                '',
    filter:                {
      propertyStatus: 'free', // all / free / bought
      teams:          [], // property with team uuid is set to true or false
    }
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
      const self   = this;
      const teamId = get(options, 'teamId', null);
      let url      = `/properties/get/${this.gameId}`;
      if (teamId) {
        url += `/${teamId}`;
      }
      try {
        const resp = await axios.get(url);
        console.log(resp.data);
        for (const prop of resp.data.properties) {
          if (prop.gamedata) {
            const p = this.properties.get(prop.uuid);
            if (p) {
              assign(p.gamedata, prop.gamedata);
              if (p.gamedata.owner && self.debugOutput) {
                console.log('owned', p);
              }
            }
          }
        }
        this.updateFilter();
      }
      catch (err) {
        console.error(err);
      }
    },
    /**
     * Updates the visibility of properties on the map based on the current filter criteria.
     *
     * Depending on the filter settings for property status ('all', 'free', or 'bought') and teams,
     * this method modifies the `visibleOnMap` property of each property accordingly.
     * It also applies the updated filter to the map markers by invoking the `applyFilter` method
     * of the map marker instance.
     *
     * @return {void} This method does not return a value.
     */
    updateFilter() {
      const self = this;
      console.log('update filter', this.filter);

      /**
       * Checks if the team filter is active on a property
       * @param prop
       * @return {boolean}
       */
      function teamsFilterActive(prop) {
        return findIndex(self.filter.teams, p => prop.gamedata.owner === p) >= 0;
      }

      if (this.filter.propertyStatus === 'all') {
        for (const property of this.properties.values()) {
          property.visibleOnMap = !isString(property.gamedata.owner) || teamsFilterActive(property);
        }
      } else if (this.filter.propertyStatus === 'free') {
        for (const property of this.properties.values()) {
          property.visibleOnMap = !isString(property.gamedata.owner);
        }
      } else if (this.filter.propertyStatus === 'bought') {
        for (const property of this.properties.values()) {
          property.visibleOnMap = isString(property.gamedata.owner) && teamsFilterActive(property);
        }
      }

      getMapMarkerInstance().applyFilter();
    }
  }
})
