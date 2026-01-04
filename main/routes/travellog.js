/**
 * The travel log route
 * Created by kc on 11.06.15.
 */

const express   = require('express');
const router    = express.Router();
const travelLog = require('../../common/models/travelLogModel');
const logger    = require('../../common/lib/logger').getLogger('routes:travellog');
const accessor  = require('../lib/accessor');
const _         = require('lodash');

/**
 * Get the Travel log
 */
function handler(req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  const user   = _.get(req.session, 'passport.user', 'nobody');
  const teamId = req.params.teamId || undefined;
  const gameId = req.params.gameId;

  /**
   * Collect data and send it back
   * @param tId
   */
  async function collectAndSendLog(tId) {
    if (tId) {
      logger.info(`${gameId}: TravelLog Request for ${tId}`);
    } else {
      logger.info(`${gameId}: TravelLog Request for all teams`);
    }

    try {
      const log = await travelLog.getAllLogEntries(gameId, tId);
      for (let i = 0; i < log.length; i++) {
        log[i] = _.omit(log[i], ['__v', 'gameId']);
      }
      res.send(log);
    }
    catch(err) {
      return res.status(500).send({message: err.message});
    }
  }

  accessor.verify(user, gameId, accessor.admin)
    .then(async () => {
      // Admin Response
      await collectAndSendLog(teamId);
    })
    .catch(() => {
      accessor.verifyPlayer(user, gameId, teamId)
        .then(async () => {
          // User response
          return await collectAndSendLog(teamId);
        })
        .catch(err => {
          return res.status(401).send({message: err.message});
        })
    })

}

router.get('/:gameId/:teamId', handler);
router.get('/:gameId', handler);

module.exports = router;
