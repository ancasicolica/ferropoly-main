/**
 * The autopilot - generates automatically data for test games
 * Created by kc on 13.06.15.
 */


const _           = require('lodash');
const logger      = require('../../common/lib/logger').getLogger('autopilot');
const moment      = require('moment');
const gameCache   = require('./gameCache');
const travelLog   = require('../../common/models/travelLogModel');
const properties  = require('../../common/models/propertyModel');
const marketplace = require('./accounting/marketplace');
const propertyLib = require('../../common/lib/propertyLib');
let settings;

/**
 * Autoplay: called by the timer
 */
function autoplay() {
  try {
    gameCache.getGameData(settings.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        startTimer();
        return;
      }
      let gp    = data.gameplay;
      let teams = _.values(data.teams);

      if (moment().isBefore(moment(gp.scheduling.gameStartTs))) {
        logger.info('Game not started yet');
        // Make sure that we do not poll to often, fall back to a 15 minute cycle
        startTimer((15 * 60 * 1000));
        return;
      }
      if (moment().isAfter(moment(gp.scheduling.gameEndTs))) {
        logger.info('Game over, do nothing');
        // Make sure that we do not poll to often, fall back to a 15 minute cycle
        startTimer((15 * 60 * 1000));
        return;
      }

      // Choose a team (random)
      let team = teams[_.random(0, teams.length - 1)];
      travelLog.getAllLogEntries(settings.gameId, team.uuid, function (err, log) {
        if (err) {
          logger.error(err);
          startTimer();
          return;
        }

        properties.getPropertiesForGameplay(settings.gameId, {lean: true}, function (err, props) {
          if (err) {
            logger.error(err);
            startTimer();
            return;
          }
          playRound(settings.gameId, team.uuid, log, props, function () {
            startTimer();
          });
        });

      });
    });
  }
  catch (exception) {
    logger.error('Error in autoplay', exception);
  }
}
/**
 * Play a round, we don't care about any errors here
 * @param gp
 * @param team
 * @param travelLog
 * @param properties
 * @param callback
 */
function playRound(gameId, teamId, travelLog, properties, callback) {
  // play chancellery
  let mp = marketplace.getMarketplace();
  mp.chancellery(gameId, teamId, function () {
    mp.buildHouses(gameId, teamId, function () {
      let propertyId = selectClosestsProperty(travelLog, properties);
      mp.buyProperty({gameId: gameId, teamId: teamId, propertyId: propertyId}, function () {
        callback();
      });
    });
  });
  // build houses
  // try to buy one property
}


/**
 * Select the closest property (respectively one out of 3, to avoid taking all teams the same route)
 * @param travelLog
 * @param properties
 * @returns {*}
 */
function selectClosestsProperty(travelLog, properties) {
  if (travelLog.length === 0) {
    // First property, just start random
    return properties[_.random(0, properties.length - 1)].uuid;
  }
  let lastItem  = _.last(travelLog);
  let distances = propertyLib.calculateDistances(lastItem.propertyId, properties);
  let i         = 0;

  let closestPropertyId;
  let variant = _.random(0, 2);
  while (i < distances.length && !closestPropertyId) {
    if (!_.find(travelLog, {propertyId: distances[i].propertyId})) {
      if (variant === 0) {
        closestPropertyId = distances[i].propertyId;
      }
      variant--;
    }
    i++;
  }
  return closestPropertyId;
}
function startTimer(delay) {
  _.delay(autoplay, delay || settings.interval);
}


module.exports = {
  /**
   * Initialize (always, autopilot is only started when configured)
   * @param options
   */
  init: function (options) {
    if (!options.autopilot) {
      logger.info('autopilot NOT CONFIGURED');
      return;
    }
    if (!options.autopilot.active) {
      logger.info('autopilot NOT ACTIVE');
      return;
    }
    settings          = options.autopilot;
    settings.interval = options.autopilot.interval || (5 * 60 * 1000);
    settings.gameId   = options.autopilot.gameId || 'play-a-demo-game';
    logger.info('autopilot ACTIVE');
    startTimer();
  }
};
