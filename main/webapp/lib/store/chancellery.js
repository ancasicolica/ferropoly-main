/**
 * Chancellery Store file
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get, sumBy, filter} from 'lodash';

const {getChancelleryField, updateChancelleryField} = createHelpers({
  getterType  : 'getChancelleryField',
  mutationType: 'updateChancelleryField'
});

const module = {
  namespaced: true,
  state     : () => ({
    list: []
  }),
  getters   : {
    getChancelleryField,
    asset(state) {
      return sumBy(state.list, 'transaction.amount');
    },
    /**
     * List chancellery entries by team
     * @param state
     * @returns {function(*): unknown[]}
     */
    listByTeam: (state) => (id) => {
      return filter(state.list, function (n) {
        return n.transaction.origin.uuid === id;
      });
    },
    /**
     * Number of all chancellery entries
     * @param state
     * @returns {*}
     */
    numberOfEntries: state => {
      return state.list.length;
    }
  },
  mutations : {
    updateChancelleryField
  },
  actions   : {
    /**
     * Updates the chancellery
     * @param state
     * @param options has to contain the gameId
     * @returns {Promise<unknown>}
     */
    updateChancellery({state}, options) {
      return new Promise((resolve, reject) => {
        axios.get(`/chancellery/account/statement/${options.gameId}`)
          .then(resp => {
            console.log('Chancellery read', resp.data);
            state.list = resp.data.entries;
            let balance = 0;
            state.list.forEach(entry => {
              entry.balance = balance + get(entry, 'transaction.amount', 0);
              balance = entry.balance;
            });
          })
          .catch(err => {
            console.error(err);
            return reject({
              message : get(err, 'response.data.message', null) || err.message,
              infoText: 'Es gab einen Fehler beim Laden der Chance/Kanzlei Daten:',
              active  : true
            });
          })
      })
    },
    /**
     * Saves the chancellery data received by another path (summary app)
     * @param state
     * @param options
     */
    saveChancelleryData({state}, options) {
      state.list = options.chancellery;
    }
  }
};

export default module;
