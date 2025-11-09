/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.11.2025
 **/

import {defineStore} from 'pinia'
import GamePropertyList from '../GamePropertyList';
import GameProperty from '../GameProperty';

const propertyList = new GamePropertyList();

export const usePropertiesStore = defineStore('Properties', {
  state:   () => ({
    gameData: new Map()
  }),
  getters: {
    getPropertyList: () => {
      return propertyList;
    }
  },
  actions: {
    init(properties) {
      const self = this;
      for (const prop of properties) {
        this.gameData.set(prop.uuid, {
          owner:           null,
          boughtTs:        null,
          buildings:       0,
          buildingEnabled: false
        });
        prop.gamedata = this.gameData.get(prop.uuid);
        prop.getGameData = () => self.gameData.get(prop.uuid);
        propertyList.push(new GameProperty(prop));
      }
      console.log('init done', this.gameData, propertyList);
      propertyList.test();
    }
  }
})
