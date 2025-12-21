/**
 * This is the property store (more correctly it should be called "PropertiesStore" but this
 * is an difficult word, so keep it in singular).
 *
 * Not only the properties themselves are part of this store, also their representation in
 * the map and pricelists are configured and controlled here. This store is designed for all
 * purposes of the game, for players and admins, for preparation, play and analysis.
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.11.2025
 **/

import {defineStore} from 'pinia';
import {getMapMarkerInstance} from '../MapMarkers';
import {get, assign, isString, findIndex,} from 'lodash';
import axios from 'axios';
import {MARKER_MODE_INFO} from '../constants/markerMode';
import {
  PROPERTY_FILTER_GROUP_NONE, PROPERTY_FILTER_PRICE_NONE,
  PROPERTY_FILTER_STATUS_ALL, PROPERTY_FILTER_STATUS_BOUGHT,
  PROPERTY_FILTER_STATUS_FREE, PROPERTY_FILTER_STATUS_NONE, PROPERTY_FILTER_UUID_NONE
} from '../constants/propertyStoreFilters';
import {createNormalizedString} from '../searchString';
import {useTeamsStore} from './TeamsStore';
import {getAuthToken} from '../../common/adapters/authToken';
import {DateTime} from 'luxon';

export const usePropertyStore = defineStore('Property', {
  state:   () => ({
    properties:            new Map(),
    ready:                 false,
    debugOutput:           false, // activates additional outputs onto the console if set to true
    showMarkersAsCategory: false, // when true, markers are displayed in category style
    markerGroupModus:      true,  // when true, property groups are displayed more special
    markerMode:            MARKER_MODE_INFO,
    gameId:                '',
    propertiesVersion:     0, // increments whenever ownership-related data changes (used for memoized getters)
    filter:                {
      propertyStatus: PROPERTY_FILTER_STATUS_ALL,
      teams:          [],
      propertyGroup:  PROPERTY_FILTER_GROUP_NONE,
      propertyUuid:   PROPERTY_FILTER_UUID_NONE,
      price:          PROPERTY_FILTER_PRICE_NONE
    },
  }),
  getters: {
    pricelist: (state) => {
      return [...state.properties.values()];
    },

    /**
     * Returns all properties owned by the given teamId.
     * Efficient for frequent calls: results are memoized per teamId and invalidated via propertiesVersion.
     *
     * Usage: store.propertiesByTeamId(teamId)
     */
    propertiesByTeamId: (state) => {
      // Memoization cache lives in the getter closure
      let lastVersion     = -1;
      const cacheByTeamId = new Map(); // teamId -> Array<property>

      return (teamId) => {
        if (!teamId) {
          console.warn('No teamId supplied, no properties');
          return [];
        }

        // Invalidate cache when underlying data changed
        if (state.propertiesVersion !== lastVersion) {
          cacheByTeamId.clear();
          lastVersion = state.propertiesVersion;
        }

        const cached = cacheByTeamId.get(teamId);
        if (cached) {
          return cached;
        }

        // Build once per (version, teamId)
        const result = [];
        for (const prop of state.properties.values()) {
          if (prop?.gamedata?.owner === teamId) {
            result.push(prop);
          }
        }

        cacheByTeamId.set(teamId, result);
        return result;
      };
    }
  },
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
          ownerName:       null,
          boughtTs:        null,
          buildings:       0,
          buildingEnabled: false,
        };
        prop.account      = {
          transactions:       new Map(),  // all property account transactions
          profit:             0,  // sum of all transactions
          lastValidTimestamp: DateTime.fromISO('2022-07-06T12:00') // last valid timestamp of the transactions
        }
        prop.searchText   = createNormalizedString(prop.location.name);
        this.properties.set(prop.uuid, prop);
      }
      this.propertiesVersion++;
      await getMapMarkerInstance().init();
      this.gameId = gameId;
      this.ready  = true;
      console.log('init done', this.properties);
    },

    /**
     * Updates an existing property within the properties map based on the provided property object.
     *
     * @param {Object} property - The property object to be updated. Must include a `uuid` to locate the property in
     *   the map and a `gamedata` field for updating.
     * @return {void} This method does not return a value.
     */
    updateProperty(property) {
      const p = this.properties.get(property.uuid);
      if (p) {
        p.gamedata           = property.gamedata;
        p.gamedata.ownerName = useTeamsStore().idToTeamName(p.gamedata.owner);
        this.propertiesVersion++;
        this.updateFilter();
        console.log(`${property.location.name} updated`, p.gamedata);
        this.updateTransactions(property.uuid).catch(err => {
          console.error('Error while updating transactions', err);
        })
      } else {
        console.warn('updateProperty: property not found', property);
      }
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
      axios.get(url)
        .then(async resp => {
          console.log(resp.data);
          for (const prop of resp.data.properties) {
            if (prop.gamedata) {
              const p = this.properties.get(prop.uuid);
              if (p) {
                assign(p.gamedata, prop.gamedata);
                if (p.gamedata.owner) {
                  if (self.debugOutput) {
                    console.log('owned', p);
                  }
                  p.gamedata.ownerName = useTeamsStore().idToTeamName(p.gamedata.owner);
                } else {
                  p.gamedata.ownerName = null;
                }
              } else {
                console.warn('Property not found in store', prop);
              }
            }
          }
          await self.updateTransactions();
          this.propertiesVersion++;
        })
        .catch(err => {
          console.warn('Most likely no access rights', err);
        })
        .finally(() => {
          this.updateFilter();
        })
    },
    async updateTransactions(propertyId = 'all') {
      const self  = this;
      const entry = self.properties.get(propertyId);
      let start   = '2022-07-06T12:00';
      if (entry) {
        start = entry.account.lastValidTimestamp.toISO();
      }
      const url = `/propertyAccount/getAccountStatement/${self.gameId}/${propertyId}/${start}`
      axios.get(url).then(resp => {
        console.log('Transactions', resp.data);
        const updatedProperties = new Map();

        for (const t of resp.data.register) {
          const entry = self.properties.get(t.propertyId);
          if (!entry) {
            console.warn('Property for account entry not found', t);
          } else {
            entry.account.transactions.set(t._id, t);
            entry.account.lastValidTimestamp = DateTime.fromISO(t.timestamp);
            updatedProperties.set(t.propertyId, true);
          }
        }

        updatedProperties.forEach((value, key) => {
          console.log(`updating ${key}`);
          const prop = self.properties.get(key);
          if (!prop) {
            return console.warn('property not found', key);
          }
          prop.account.profit = 0;
          prop.account.transactions.forEach(transaction => {
            prop.account.profit += transaction.amount;
          })
          console.log('profit', prop.account.profit);
        })


      })
        .catch(err => {
          console.error('updateTransactions failed', err);
        })
    },
    /**
     * Resets a specific property for a given team (UNDO all bookings on it!)
     *
     * @param {string} teamId - The unique identifier of the team associated with the property to reset.
     * @param {string} propertyId - The unique identifier of the property to be reset.
     * @return {Promise<void>} A promise that resolves when the property reset process is complete.
     */
    async resetProperty(teamId, propertyId) {
      console.log('Reset of a property requested', propertyId);
      const self = this;
      try {
        const authToken = await getAuthToken();
        const resp      = await axios.post(`/storno/${self.gameId}/${propertyId}`, {authToken, reason: 'Fehlbuchung'});
        console.log(resp, resp.data);
        return resp.data;
      }
      catch (err) {
        console.error(err, err.response.data);
        return null;
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

      if (this.filter.propertyStatus === PROPERTY_FILTER_STATUS_ALL) {
        // All Properties, bought ones and free ones, the bought ones considering the Team Filter
        for (const property of this.properties.values()) {
          property.visibleOnMap = !isString(property.gamedata.owner) || teamsFilterActive(property);
        }
      } else if (this.filter.propertyStatus === PROPERTY_FILTER_STATUS_FREE) {
        // Only available properties, not yet sold
        for (const property of this.properties.values()) {
          property.visibleOnMap = !isString(property.gamedata.owner);
        }
      } else if (this.filter.propertyStatus === PROPERTY_FILTER_STATUS_BOUGHT) {
        // Only bought properties, considering the Team Filter
        for (const property of this.properties.values()) {
          property.visibleOnMap = isString(property.gamedata.owner) && teamsFilterActive(property);
        }
      } else if (this.filter.propertyStatus === PROPERTY_FILTER_STATUS_NONE) {
        // No filtering for free/bought and teams but filtering for some other interesting things

        if (this.filter.propertyGroup) {
          // Filtering by property group
          for (const property of this.properties.values()) {
            property.visibleOnMap = property.pricelist.propertyGroup === this.filter.propertyGroup;
          }
        } else if (this.filter.propertyUuid) {
          // Filtering by property uuid
          for (const property of this.properties.values()) {
            property.visibleOnMap = property.uuid === this.filter.propertyUuid;
          }
        } else if (this.filter.price) {
          // Filtering by property price
          for (const property of this.properties.values()) {
            property.visibleOnMap = property.pricelist.price === this.filter.price;
          }
        } else {
          // ALL (really all) properties on the map
          for (const property of this.properties.values()) {
            property.visibleOnMap = true;
          }
        }
      } else {
        console.warn('Unknown propertyStatusFilter', this.filter.propertyStatus);
      }

      getMapMarkerInstance().applyFilter();
    }
  }
})
