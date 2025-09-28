/**
 * Caching game relevant things: gameplay and teams
 *
 * Only data of the current date is hold in the cache, refreshing the cache using
 * a cron job should be considered.
 *
 * Created by kc on 22.04.15.
 */


const teamModel            = require('../../common/models/teamModel');
const gpModel              = require('../../common/models/gameplayModel');
const logger               = require('../../common/lib/logger').getLogger('gameCache');
const {DateTime, Interval} = require('luxon');

let gameCache = new Map();

module.exports = {
  getGameData: async function (gameId, callback) {
    if (callback) {
      logger.info('>>>>>>>>>> No more callbacks in getGameData');
      return callback(new Error('no more callbacks'));
    }

    if (gameCache.has(gameId)) {
      const gp = gameCache.get(gameId);
      if (!gp.gameplay || !gp.teams) {
        logger.warn(`${gameId}: Missing important info getGameData`, {gameId});
        throw new Error('cached game corrupt: ' + gameId);
      }
      return gp;
    }

    // not in cache
    let gp = null;
    try {
      gp = await gpModel.getGameplay(gameId, null);
      if (!gp) {
        logger.info(`${gameId}: not found`);
        return null;
      }
    }
    catch (ex) {
      return null;
    }

    logger.info(`${gameId}: GP-Query`, {gameId});

    let result = {gameplay: gp};

    const teams = await teamModel.getTeams(gameId);

    // Add all teams to the result
    result.teams = new Map();
    for (let team of teams) {
      delete team._id;
      delete team.gameId;
      delete team.__v;
      result.teams.set(team.uuid, team);
    }

    // check if we have to add it to cache or not
    const start    = DateTime.now().set({hours: 0, minutes: 0});
    const end      = DateTime.now().set({hours: 23, minutes: 59});
    const gamedate = DateTime.fromJSDate(new Date(gp.scheduling.gameDate));
    if (Interval.fromDateTimes(start, end).contains(gamedate)) {
      logger.info(`${gameId}: GP added to cache`, {gameId});
      gameCache.set(gameId, result);
    }

    if (!result || !result.gameplay || !result.teams) {
      logger.info(`${gameId}: Missing important info in gameplay`, {gameId, result});
      throw new Error('new game in cache is corrupt: ' + gameId);
    }

    return result;
  },

  /**
   * Refresh the cache: clear it and rebuild it. After calling this function, we can use
   * the synch versions: all current teams are in the cache while the other ones should
   * not be used (as their game can't be played).
   *
   * Add this job to a cron job
   * @param callback
   */
  refreshCache: async function (callback) {
    if (callback) {
      logger.info('>>>>>>>>>> No more callbacks in refreshCache');
      return callback(new Error('no more callbacks'));
    }
    logger.info('Refreshing gameCache');
    const gameplays = await gpModel.getAllGameplays();

    gameCache = new Map();

    if (!gameplays || gameplays.length === 0) {
      callback(null);
      return;
    }

    logger.info('Nb Gameplays found: ' + gameplays.length);
    for (let gameplay of gameplays) {
      const gameDate = DateTime.fromJSDate(new Date(gameplay.scheduling.gameDate));
      // Check if gameDate is today (same calendar day)
      if (DateTime.now().hasSame(gameDate, 'day')) {
        logger.info(`${gameplay.internal.gameId}: added to cache`);
        gameCache.set(gameplay.internal.gameId, {gameplay: gameplay, teams: new Map()});
      } else {
        logger.info(`${gameplay.internal.gameId}: not added to cache`);
      }
    }

    if (gameCache.size === 0) {
      logger.info('No gameplays added to cache, it remains empty');
      return;
    }


    for (let cacheEntry of gameCache.values()) {
      let gp = cacheEntry.gameplay;
      // logger.info('GP value:', gp);
      if (!gp.internal) {
        logger.error('gp.internal not defined', gp);
        return;
      }
      const teams = await teamModel.getTeams(gp.internal.gameId);

      if (teams && teams.length > 0) {
        for (let team of teams) {
          cacheEntry.teams.set(team.uuid, team);
        }
      }
    }

    logger.info(`Games in cache: ${gameCache.size}`, gameCache.keys());
  },
  getCache:     function () {
    return gameCache;
  }
};
