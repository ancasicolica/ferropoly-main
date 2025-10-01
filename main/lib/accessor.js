/**
 * This module handles the access to gameplays over routes: it verifies whether the
 * user has access a specific gameplay or not and if so, which rights are granted
 *
 * Created by kc on 10.07.15.
 */

const gamecache = require('./gameCache');
const _         = require('lodash');
const logger    = require('../../common/lib/logger').getLogger('lib:accessor');

const PLAYER = 1;
const ADMIN  = 2;

/**
 * Checks if admins rights are granted (as owner or as assigned admin)
 * @param email
 * @param gameplay
 * @returns {*}
 */
function userHasAdminRights(email, gameplay) {
  if (gameplay.internal.owner === email) {
    return true;
  }
  if (gameplay.admins && gameplay.admins.logins) {
    return _.find(gameplay.admins.logins, function (n) {
      return n === email;
    });
  }
  return false;
}

module.exports = {

  player: PLAYER,
  admin:  ADMIN,
  /**
   * Checks the rights: has a user the required minimal rights level?
   *
   * This function is only for admins, it does not fit for teams.
   *
   * If no rights are given, an error is issued
   *
   * @param userId
   * @param gameId
   * @param minLevel minimal level required for accessing the page
   * @param callback
   */
  verify: async function (userId, gameId, minLevel, callback) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in verify');
      return callback(new Error('no callback'));
    }

    const gc = await gamecache.getGameData(gameId);
    if (userHasAdminRights(userId, gc.gameplay)) {
      // it's the admin and the game is in the cache, return always ok
      return {hasAdminRights: true};
    }

    // If the game is over, the game data gets public
    if (_.get(gc, 'gameplay.internal.gameDataPublic', false)) {
      return {userHasAdminRights: false};
    }

    // Todo: handle player rights for future features
    logger.debug('No access rights granted for ' + userId);
    throw new Error('No access rights granted');
  },

  /**
   * Verifies whether a player has access rights to the specified game and team.
   *
   * Checks if the player is the team leader, a member of the team,
   * or has administrative rights within the game's context.
   *
   * @param {string} userId - The ID of the user to verify.
   * @param {string} gameId - The ID of the game.
   * @param {string} teamId - The ID of the team.
   * @param {Function} callback - A callback function to handle additional logic.
   * @returns {Promise<Object>} Resolves to an empty object if access is granted.
   * @throws {Error} Throws an error if the teamId is invalid or if access is denied to the user.
   */
  verifyPlayer: async function (userId, gameId, teamId, callback = null) {
    if (callback) {
      logger.info('>>>>>>>>  No more callbacks in verifyPlayer');
      return callback(new Error('no callback'));
    }
    const gc = await gamecache.getGameData(gameId);

    if (userHasAdminRights(userId, gc.gameplay)) {
      // Admin is also ok
      return {};
    }

    if (!teamId) {
      throw new Error(`${gameId}: User ${userId} has no team and therefore no access`);
    }

    let team = gc.teams.get(teamId);
    if (!team) {
      throw new Error(`${gameId}: Unknown teamId "${teamId}", not allowed`);
    }

    if (team.data.teamLeader.email === userId) {
      return {};
    }

    if (_.find(team.data.members, function (m) {
      return m === userId;
    })) {
      return {};
    }



    logger.debug(`${gameId} No user access rights granted for ${userId}`, {gameId});
    throw new Error(`${gameId}: No access rights granted`);
  }
};
