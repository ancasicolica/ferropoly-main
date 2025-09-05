/**
 * Wrapper arount the property model, just delivers the data needed for the main game
 *
 * Reason for this module: simplify testing and access to properties
 * Created by kc on 24.04.15.
 */

const pm     = require('../../common/models/propertyModel');
const logger = require('../../common/lib/logger').getLogger('propertyWrapper');

module.exports = {
  /**
   * Get the property for a given location and game
   * @param gameId
   * @param propertyId
   * @param callback
   */
  getProperty: async function (gameId, propertyId, callback) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in getProperty');
      return callback(new Error('no callback'));
    }
    return await pm.getPropertyById(gameId, propertyId);
  },
  /**
   * Get the properties of a team
   * @param gameId
   * @param teamId
   * @param callback
   */
  getTeamProperties: async function (gameId, teamId, callback) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in getTeamProperties');
      return callback(new Error('no callback'));
    }
    return await pm.getPropertiesForTeam(gameId, teamId);
  },

  /**
   * Get all properties of a gameplay (lean)
   * @param gameId
   * @param callback
   */
  getAllProperties: async function (gameId, callback) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in getAllProperties');
      return callback(new Error('no callback'));
    }
    return await pm.getPropertiesForGameplay(gameId, {lean: true});
  },

  /**
   * Get all properties of a (pricelist-) group
   * @param gameId
   * @param groupId
   * @param callback
   */
  getPropertiesOfGroup: async function (gameId, groupId, callback) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in getPropertiesOfGroup');
      return callback(new Error('no callback'));
    }
    return await pm.getPropertiesForGameplay(gameId, {'propertyGroup': groupId});
  },
  /**
   * Update the property
   * @param property
   * @param callback
   */
  updateProperty: async function (property, callback) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in updateProperty');
      return callback(new Error('no callback'));
    }
    return await pm.updateProperty(property.gameId, property)
  },

  /**
   * Allow building for the properties again (all properties of this gameplay)
   * @param gameId
   * @param callback
   */
  allowBuilding: async function (gameId, callback) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in allowBuilding');
      return callback(new Error('no callback'));
    }
    return await pm.allowBuilding(gameId);
  },

  init: function () {
  }
};
