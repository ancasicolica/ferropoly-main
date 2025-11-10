/**
 * This is the property store (more correctly it should be called "PropertiesStore" but this
 * is an difficult word, so keep it in singular).
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.11.2025
 **/

import {defineStore} from 'pinia'
import {getMapMarkerInstance} from '../MapMarkers';

export const usePropertyStore = defineStore('Property', {
  state:   () => ({
    properties: new Map(),
    ready: false
  }),
  getters: {},
  actions: {
    async init(properties) {
      // Create the map of properties
      for (const prop of properties) {
        prop.visibleOnMap = true;
        prop.gameData     = {
          owner:           null,
          boughtTs:        null,
          buildings:       0,
          buildingEnabled: false
        };
        this.properties.set(prop.uuid, prop);
      }

      await getMapMarkerInstance().init();
      this.ready = true;
      console.log('init done', this.properties);
    }
  }
})
