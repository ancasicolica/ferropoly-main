/**
 * Route for the team accounts
 * Created by kc on 27.05.15.
 */

const express                 = require('express');
const router                  = express.Router();
const accessor                = require('../lib/accessor');
const collectAccountStatement = require('../lib/accounting/collectAccountStatement');
const _                       = require('lodash');
const logger                  = require('../../common/lib/logger').getLogger('teamAccount route');

function requestHandler(req, res) {
  try {
    if (!req.params.gameId) {
      return res.send({status: 'error', message: 'No gameId supplied'});
    }
    if (req.params.teamId === 'undefined' || req.params.teamId === 'all') {
      req.params.teamId = undefined;
    }
    if (!req.params.start) {
      req.params.start = undefined;
    }
    if (!req.params.end) {
      req.params.end = undefined;
    }

    const gameId = req.params.gameId;
    const teamId = req.params.teamId;
    const start = req.params.start;
    const end = req.params.end;

    const user = _.get(req.session, 'passport.user', 'nobody');
    accessor.verify(user, gameId, accessor.admin)
      .then(async () => {
        const accountData = await collectAccountStatement(gameId, teamId, start, end);
        res.send(accountData);
      })

      .catch(() => {
        // This is not the admin. How about a player with valid TeamID?
        accessor.verifyPlayer(user, gameId, teamId)
          .then(async () => {
            const accountData = await collectAccountStatement(gameId, teamId, start, end);
            res.send(accountData);
          })
          .catch(err => {
            return res.status(401).send({message: err.message});
          })
      })
  }
  catch (e) {
    logger.error(e);
    res.status(500).send({message: e.message});
  }
}
router.get('/get/:gameId/:teamId/:start/:end', requestHandler);
router.get('/get/:gameId/:teamId/:start', requestHandler);
router.get('/get/:gameId/:teamId', requestHandler);
router.get('/get/:gameId', requestHandler);

module.exports = router;

