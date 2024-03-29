/**
 * Travel Log module for the store
 *
 * This module REQUIRES TEAMS and PROPERTY-REGISTER module to be present!
 *
 * On the interface level, supply following objects:
 *
 * Entry with a property assigned:
 *   {
 *     "position": {
 *       "lat": 47.193967,
 *       "lng": 8.822888000000034,
 *       "accuracy": 200
 *     },
 *     "timestamp": "2022-04-10T10:11:48.629Z",
 *     "teamId": "464100c8-2631-4712-9919-625f2a771ad9",
 *     "propertyId": "fff70c4c-2217-4b5f-a32b-850933576597"
 *   }
 *
 *   GPS based entry: no propertyId, user login instead:
 *   {
 *     "position": {
 *       "lat": 47.297084,
 *       "lng": 8.8676974,
 *       "accuracy": 15.686
 *     },
 *     "timestamp": "2022-04-10T10:08:56.353Z",
 *     "teamId": "6da075ab-5b45-414e-a2b1-e8166e81a900",
 *     "user": "team1@ferropoly.ch"
 *   }
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get, forOwn} from 'lodash';
import TeamTrack from '../teamTrack';

const {getTravelLogField, updateTravelLogField} = createHelpers({
  getterType  : 'getTravelLogField',
  mutationType: 'updateTravelLogField'
});

/**
 * Creates a trave log entry
 * @param tl
 * @param rootGetters
 * @returns {{lng, name, accuracy: number, propertyId: null, lat, ts}}
 */
const createEntry = function (tl, rootGetters) {
  let propertyId = get(tl, 'propertyId', null);
  let name;
  if (propertyId) {
    name = get(rootGetters['propertyRegister/getPropertyById'](propertyId), 'location.name', 'none');
  } else {
    name = `GPS: ${tl.position.lat}, ${tl.position.lng}`
  }
  return {
    lat       : tl.position.lat,
    lng       : tl.position.lng,
    ts        : tl.timestamp,
    name      : name,
    accuracy  : get(tl, 'position.accuracy', 10000),
    propertyId: get(tl, 'propertyId', null)
  };
}

/**
 * Initialize the entry for a team
 * @param _teamId
 * @param state
 * @param rootGetters
 */
function initTeam(state, rootGetters, _teamId) {
  console.log('TRAVELLOG initTeam', rootGetters);
  state.log[_teamId] = new TeamTrack({
    id   : _teamId,
    color: rootGetters['teams/idToColor'](_teamId),
    name : rootGetters['teams/idToTeamName'](_teamId)
  });
}

/**
 * Handles the trave log entries received
 * @param teamId
 * @param getters
 * @param state
 * @param travelLog
 * @param rootGetters
 */
function handleTravelLogData(teamId, getters, state, travelLog, rootGetters) {
  if (!teamId) {
    let teams = rootGetters['teams/getTeamList'];
    // Create for each team a log (if not existing)
    console.log('TEAMS', teams);
    teams.forEach(t => {
      if (!state.log[t.uuid]) {
        state.log[t.uuid] = new TeamTrack({
          id   : t.uuid,
          color: t.color,
          name : t.name
        });
      }
    })
    // Returns all entries, clear existing ones
    forOwn(state.log, (val, key) => {
      state.log[key].clear();
    })
  }

  travelLog.forEach(tl => {
    if (!state.log[tl.teamId]) {
      // Create new track for a team if it does not already exist

      initTeam(state, rootGetters, teamId);
    }
    state.log[tl.teamId].pushLocation(createEntry(tl, rootGetters));
  });
}

/**
 * The module itself
 * @type {{mutations: {updateTravelLogField: *}, state: (function(): {log: {}}), getters: {teamLog: (function(*): function(*): *), getTravelLogField: *}, actions: {saveTravelLogEntries({state: *, getters: *, rootGetters: *}, *): void, update({state: *, getters: *, rootGetters: *}, *): Promise<unknown>, updateGpsPosition({state: *, rootGetters: *}, *): void}, namespaced: boolean}}
 */
const module = {
  namespaced: true,
  state     : () => ({
    log: {},
    lastPosition: {}
  }),
  getters   : {
    getTravelLogField,
    teamLog: (state) => (id) => {
      return state.log[id];
    }
  },
  mutations : {
    updateTravelLogField
  },
  actions   : {
    /**
     * Updates the travel log for one team
     * @param state
     * @param options gameId must be supplied
     * @param rootGetters
     * @param getters
     */
    update({state, getters, rootGetters}, options) {
      return new Promise((resolve, reject) => {
        let teamId = get(options, 'teamUuid', undefined);

        if (teamId && !state.log[teamId]) {
          // Init data container asap
          initTeam(state, rootGetters, teamId);
        }

        axios.get(`/travellog/${options.gameId}/${teamId}`)
          .then(resp => {
            handleTravelLogData(teamId, getters, state, resp.data.travelLog, rootGetters);
            console.log('Travellog read', state.log);
            return resolve(state.log);
          })
          .catch(err => {
            console.error(err);
            return reject({
              message : get(err, 'response.data.message', null) || err.message,
              infoText: 'Es gab einen Fehler beim Laden des TravelLogs:',
              active  : true
            });
          })
      });
    },
    /**
     * Saves the travel log entries received for summary
     * @param state
     * @param getters
     * @param rootGetters
     * @param options
     */
    saveTravelLogEntries({state, getters, rootGetters}, options) {
      handleTravelLogData(undefined, getters, state, options.travelLog, rootGetters);
      console.log('Travellog saved', state.log);
    },
    /**
     * Updates the GPS position received, same format as in the travel log read over API
     * @param state
     * @param rootGetters
     * @param options
     */
    updateGpsPosition({state, rootGetters}, options) {
      let entry  = createEntry(options.entry, rootGetters);
      let teamId = options.entry.teamId;
      console.log('New GPS entry received', entry);
      if (!state.log[teamId]) {
        state.log[teamId] = new TeamTrack({
          id   : teamId,
          color: rootGetters['teams/idToColor'](teamId),
          name : rootGetters['teams/idToTeamName'](teamId)
        });
      }
      state.log[teamId].pushLocation(entry);
      state.lastPosition = entry;
    }
  },
};

export default module;
