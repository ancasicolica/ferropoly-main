/**
 * This module receives updates from the team positions (received by geolocation) and
 * stores them into the database (but only while the game is running)
 *
 * Created by kc on 31.01.16.
 */

let ferroSocket;
const logger         = require('../../../common/lib/logger').getLogger('teams:teamPositions');
const travelLogModel = require('../../../common/models/travelLogModel');
const gameCache      = require('../gameCache');
const {DateTime} = require('luxon');
const geolib = require('geolib');

async function addLog(data) {
  try {
    const gc = await gameCache.getGameData(data.gameId)

    /**
     * Privacy: we log the position of the teams only during the game, not when they access
     * the web page before or afterwards. But there is a certain tolerance given, log also
     * a little before and after the game (could be helpful if one team is missing on the
     * way to the game respectively when coming home after the game)
     */
    let start = DateTime.fromJSDate(gc.gameplay.scheduling.gameStartTs).minus({hours: 2});
    let end   = DateTime.fromJSDate(gc.gameplay.scheduling.gameEndTs).plus({minutes: 60});
    let now   = DateTime.now();
    if (now > end || now < start) {
      logger.info(`${data.gameId} Geograph: Game not active`, {start, end, data});

      return;
    }

    // Check if there is already an info in the last 10 minutes of the team. If they do not move, do not update.
    // The movement depends on the accuracy. Check if this algorithm is accurate.
    const lastPosition = await travelLogModel.getLastPosition(data.gameId, data.teamId, 600);
    if (lastPosition) {
      const distance = geolib.getDistance({
        latitude: lastPosition.position?.lat,
        longitude: lastPosition.position?.lng
      }, {
        latitude: data.position.lat,
        longitude: data.position.lng,
      })
      if (distance < data.position.accuracy * 10) {
        logger.info(`${data.gameId} Geograph: New position too close to last one (${distance}m with ${data.position.accuracy}m accuracy)`, {data});
        return;
      }
    }
    logger.info(`${data.gameId} Geograph: New position received for ${data.user}`, {data});

    const entry = await travelLogModel.addPositionEntry(data.gameId, data.teamId, data.user, {
      lat:      data.position.lat,
      lng:      data.position.lng,
      accuracy: data.position.accuracy
    });

    // Same style as returned by the team log
    ferroSocket.emitToAdmins(data.gameId, 'player-position', entry);
    ferroSocket.emitToTeam(data.gameId, data.teamId, 'player-position', entry);
  }
  catch (err) {
    logger.error(`${data?.gameId} Geograph: problem in addLog: ${err?.message}`, err)
  }
}

/**
 * Event for the player location
 * @param data
 */
function onPlayerLocation(data) {

  switch (data.cmd) {
    case 'positionUpdate':
      addLog(data);
      break;

    default:
      logger.info('Unhandled command: ' + data.cmd);
  }
}

module.exports = {
  init: function () {
    ferroSocket = require('../ferroSocket').get();
    ferroSocket.on('player-position', onPlayerLocation);
  }
};
