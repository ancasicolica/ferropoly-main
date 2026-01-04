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
import {computed, ref} from 'vue';

export const usePropertyStore = defineStore('Property', () => {

  let gameId = '';

  // Store properties
  const properties            = ref(new Map());
  const ready                 = ref(false);
  const debugOutput           = ref(false); // activates additional outputs onto the console if set to true
  const showMarkersAsCategory = ref(false); // when true, markers are displayed in category style
  const markerGroupModus      = ref(true);  // when true, property groups are displayed more special
  const markerMode            = ref(MARKER_MODE_INFO);
  const propertiesVersion     = ref(0); // increments whenever ownership-related data changes (used for memoized
                                        // getters)
  const filter = ref({
    propertyStatus: PROPERTY_FILTER_STATUS_ALL,
    teams:          [],
    propertyGroup:  PROPERTY_FILTER_GROUP_NONE,
    propertyUuid:   PROPERTY_FILTER_UUID_NONE,
    price:          PROPERTY_FILTER_PRICE_NONE
  });


  /**
   * A computed property that creates and returns a list of prices.
   * The list is derived from the `values` of the `properties.value` object.
   *
   * @constant {Array} pricelist
   * @type {Array}
   * @readonly
   */
  const pricelist        = computed(() => [...properties.value.values()]);
  /**
   * Number of free properties (not sold)
   * @return {number}
   */
  const freePropertiesNb = computed(() => {
    let count = 0;
    for (const property of properties.value.values()) {
      if (property?.gamedata?.owner == null) {
        count++;
      }
    }
    return count;
  });

  /**
   * Number of bought properties
   * @return {number}
   */
  const boughtPropertiesNb = computed(() => {
    let count = 0;
    for (const property of properties.value.values()) {
      if (property?.gamedata?.owner != null) {
        count++;
      }
    }
    return count;
  });

  /**
   * Number of buildings on all properties
   * @return {number}
   */
  const buildingNb = computed(() => {
    let count = 0;
    for (const property of properties.value.values()) {
      if (property?.gamedata?.buildings != null) {
        count += property.gamedata.buildings;
      }
    }
    return count;
  });


  /**
   * A computed property that determines the most profitable properties based on their profit value.
   *
   * @type {Array}
   */
  const mostProfitableProperties = computed(() => {
    const propertiesArray = [...properties.value.values()];

    // Filter out properties with profit 0 or undefined
    const profitableProps = propertiesArray.filter(p => p?.account?.profit && p.account.profit > 0);

    if (profitableProps.length === 0) {
      return [];
    }

    // Sort by profit descending
    profitableProps.sort((a, b) => b.account.profit - a.account.profit);

    // Get the top 3
    const top3 = profitableProps.slice(0, 3);

    if (top3.length < 3) {
      return top3;
    }

    const thirdHighestProfit = top3[2].account.profit;

    // Check if more properties have the same profit as the 3rd one
    const allWithThirdProfit = profitableProps.filter(p => p.account.profit === thirdHighestProfit);

    if (allWithThirdProfit.length > 1) {
      // Return all properties with profit >= third highest
      return profitableProps.filter(p => p.account.profit >= thirdHighestProfit);
    }

    return top3;
  });

  /**
   * Returns an array with the least profitable properties
   * @type {Array}
   */
  const leastProfitableProperties = computed(() => {
    const propertiesArray = [...properties.value.values()];

    // Filter out properties with profit 0 or undefined
    const profitableProps = propertiesArray.filter(p => p?.account?.profit);

    if (profitableProps.length === 0) {
      return [];
    }

    // Sort by profit descending
    profitableProps.sort((a, b) => a.account.profit - b.account.profit);

    // Get the top 3 (of the lowest)
    return profitableProps.slice(0, 3);
  });

  /**
   * Returns all properties owned by the given teamId.
   * Efficient for frequent calls: results are memoized per teamId and invalidated via propertiesVersion.
   *
   * Usage: store.propertiesByTeamId(teamId)
   */
  const propertiesByTeamId = computed(() => {
    // Memoization cache lives in the getter closure
    let lastVersion     = -1;
    const cacheByTeamId = new Map(); // teamId -> Array<property>

    return (teamId) => {
      if (!teamId) {
        console.warn('No teamId supplied, no properties');
        return [];
      }

      // Invalidate cache when underlying data changed
      if (propertiesVersion.value !== lastVersion) {
        cacheByTeamId.clear();
        lastVersion = propertiesVersion.value;
      }

      const cached = cacheByTeamId.get(teamId);
      if (cached) {
        return cached;
      }

      // Build once per (version, teamId)
      const result = [];
      for (const prop of properties.value.values()) {
        if (prop?.gamedata?.owner === teamId) {
          result.push(prop);
        }
      }

      cacheByTeamId.set(teamId, result);
      return result;
    };

  });


  /**
   * Initializes the properties and sets up the required map markers.
   *
   * @param _gameId
   * @param {Array<Object>} props - An array of property objects to initialize.
   * Each property object should include a `uuid` and other relevant attributes.
   * @return {Promise<void>} A promise that resolves once the initialization is completed.
   */
  async function init(_gameId, props) {
    // Create the map of properties
    for (const prop of props) {
      prop.visibleOnMap = true;
      prop.gamedata     = prop.gamedata || {
        owner:           null,
        ownerName:       null,
        boughtTs:        null,
        buildings:       0,
        buildingEnabled: false,
      };
      if (prop.gamedata.owner) {
        prop.gamedata.ownerName = useTeamsStore().idToTeamName(prop.gamedata.owner);
      }
      prop.account    = {
        transactions:       new Map(),  // all property account transactions
        profit:             0,  // sum of all transactions
        lastValidTimestamp: DateTime.fromISO('2022-07-06T12:00') // last valid timestamp of the transactions
      }
      prop.searchText = createNormalizedString(prop.location.name);
      properties.value.set(prop.uuid, prop);
    }
    propertiesVersion.value++;
    await getMapMarkerInstance().init();
    gameId = _gameId;
    ready.value  = true;
    console.log('init done', properties.value);
  }

  /**
   * Updates an existing property within the properties map based on the provided property object.
   *
   * @param {Object} property - The property object to be updated. Must include a `uuid` to locate the property in
   *   the map and a `gamedata` field for updating.
   * @return {void} This method does not return a value.
   */
  function updateProperty(property) {
    const p = this.properties.get(property.uuid);
    if (p) {
      p.gamedata           = property.gamedata;
      p.gamedata.ownerName = useTeamsStore().idToTeamName(p.gamedata.owner);
      propertiesVersion.value++;
      updateFilter();
      console.log(`${property.location.name} updated`, p.gamedata);
      updateTransactions(property.uuid).catch(err => {
        console.error('Error while updating transactions', err);
      })
    } else {
      console.warn('updateProperty: property not found', property);
    }
  }

  /**
   * Updates the property store elements for the gamedata (ownership, building enabled, ...)
   * @param options
   * @return {Promise<void>}
   */
  async function update(options = {}) {
    try {
      console.log('updating', options);

      const teamId = get(options, 'teamId', null);
      let url      = `/properties/get/${gameId}`;
      if (teamId) {
        url += `/${teamId}`;
      }
      const resp = await axios.get(url);

      console.log(resp.data);
      for (const prop of resp.data.properties) {
        if (prop.gamedata) {
          const p = properties.value.get(prop.uuid);
          if (p) {
            assign(p.gamedata, prop.gamedata);
            if (p.gamedata.owner) {
              if (debugOutput.value) {
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
      await updateTransactions();
      propertiesVersion.value++;
    }
    catch (err) {
      console.error('error in PropertyStore.update', err);
    }
    finally {
      updateFilter()
    }
  }

  /**
   * Updates transaction data for a specific property or all properties.
   *
   * @param {string} [propertyId='all'] - The ID of the property to update transactions for.
   *                                      Use 'all' to update transactions for all properties.
   * @param _transactions
   * @return {Promise<void>} Resolves once the transaction data has been updated or completes with an error.
   */
  async function updateTransactions(propertyId = 'all', _transactions = null) {
    const entry = properties.value.get(propertyId);
    let start   = '2022-07-06T12:00';
    if (entry) {
      start = entry.account.lastValidTimestamp.toISO();
    }
    try {
      let transactions = _transactions;

      if (!transactions) {
        const url    = `/propertyAccount/getAccountStatement/${gameId}/${propertyId}/${start}`
        const resp   = await axios.get(url);
        transactions = resp.data.register;
      }
      console.log('Transactions', transactions);
      const updatedProperties = new Map();

      for (const t of transactions) {
        const entry = properties.value.get(t.propertyId);
        if (!entry) {
          console.warn('Property for account entry not found', t);
        } else {
          entry.account.transactions.set(t._id, t);
          entry.account.lastValidTimestamp = DateTime.fromISO(t.timestamp);
          updatedProperties.set(t.propertyId, true);
        }
      }
      updatedProperties.forEach((value, key) => {
        //console.log(`updating ${key}`);
        const prop = properties.value.get(key);
        if (!prop) {
          return console.warn('property not found', key);
        }
        prop.account.profit = 0;
        prop.account.transactions.forEach(transaction => {
          prop.account.profit += transaction.amount;
        })
        //console.log('profit', prop.account.profit);
      })
      console.log('finished updating');
    }
    catch (err) {
      console.error('updateTransactions failed: ' + err.message, err);
    }
  }

  /**
   * Resets a specific property for a given team (UNDO all bookings on it!)
   *
   * @param {string} teamId - The unique identifier of the team associated with the property to reset.
   * @param {string} propertyId - The unique identifier of the property to be reset.
   * @return {Promise<void>} A promise that resolves when the property reset process is complete.
   */
  async function resetProperty(teamId, propertyId) {
    console.log('Reset of a property requested', propertyId);
    try {
      const authToken = await getAuthToken();
      const resp      = await axios.post(`/storno/${gameId}/${propertyId}`, {authToken, reason: 'Fehlbuchung'});
      console.log(resp, resp.data);
      return resp.data;
    }
    catch (err) {
      console.error(err, err.response.data);
      return null;
    }
  }

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
  function updateFilter() {
    console.log('update filter', filter.value);

    /**
     * Checks if the team filter is active on a property
     * @param prop
     * @return {boolean}
     */
    function teamsFilterActive(prop) {
      return findIndex(filter.value.teams, p => prop.gamedata.owner === p) >= 0;
    }

    if (filter.value.propertyStatus === PROPERTY_FILTER_STATUS_ALL) {
      // All Properties, bought ones and free ones, the bought ones considering the Team Filter
      for (const property of properties.value.values()) {
        property.visibleOnMap = !isString(property.gamedata.owner) || teamsFilterActive(property);
      }
    } else if (filter.value.propertyStatus === PROPERTY_FILTER_STATUS_FREE) {
      // Only available properties, not yet sold
      for (const property of properties.value.values()) {
        property.visibleOnMap = !isString(property.gamedata.owner);
      }
    } else if (filter.value.propertyStatus === PROPERTY_FILTER_STATUS_BOUGHT) {
      // Only bought properties, considering the Team Filter
      for (const property of properties.value.values()) {
        property.visibleOnMap = isString(property.gamedata.owner) && teamsFilterActive(property);
      }
    } else if (filter.value.propertyStatus === PROPERTY_FILTER_STATUS_NONE) {
      // No filtering for free/bought and teams but filtering for some other interesting things

      if (filter.value.propertyGroup) {
        // Filtering by property group
        for (const property of properties.value.values()) {
          property.visibleOnMap = property.pricelist.propertyGroup === filter.value.propertyGroup;
        }
      } else if (filter.value.propertyUuid) {
        // Filtering by property uuid
        for (const property of properties.value.values()) {
          property.visibleOnMap = property.uuid === filter.value.propertyUuid;
        }
      } else if (filter.value.price) {
        // Filtering by property price
        for (const property of properties.value.values()) {
          property.visibleOnMap = property.pricelist.price === filter.value.price;
        }
      } else {
        // ALL (really all) properties on the map
        for (const property of properties.value.values()) {
          property.visibleOnMap = true;
        }
      }
    } else {
      console.warn('Unknown propertyStatusFilter', filter.value.propertyStatus);
    }

    getMapMarkerInstance().applyFilter();
  }

  return {
    properties, ready, debugOutput, showMarkersAsCategory, markerGroupModus, markerMode, propertiesVersion, filter,
    pricelist, freePropertiesNb, boughtPropertiesNb, buildingNb, mostProfitableProperties, leastProfitableProperties,
    propertiesByTeamId,
    init, updateProperty, update, updateTransactions, resetProperty, updateFilter
  }

})
