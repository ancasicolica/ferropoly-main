/**
 * Route for the team accounts
 * Created by kc on 27.05.15.
 */


const express                 = require('express');
const router                  = express.Router();
const accessor                = require('../lib/accessor');
const collectAccountStatement = require('../lib/accounting/collectAccountStatement');
const _                       = require("lodash");
const logger = require('../../common/lib/logger').getLogger('teamAccount route');

router.get('/get/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (req.params.teamId === 'undefined' || req.params.teamId === 'all') {
    req.params.teamId = undefined;
  }
  try {
    const user = _.get(req.session, 'passport.user', 'nobody');
    accessor.verify(user, req.params.gameId, accessor.admin, async function (err) {

      if (err) {
        // This is not the admin. How about a player with valid TeamID?
        accessor.verifyPlayer(user, req.params.gameId, req.params.teamId, async function (err) {
          if (err) {
            return res.status(401).send({message: err.message});
          }
          const accountData = await collectAccountStatement(req);
          res.send(accountData);
        })
      } else {
        const accountData = await collectAccountStatement(req);
        res.send(accountData);
      }
    });
  }
  catch (e) {
    logger.error(e);
    res.status(500).send({message: e.message});
  }

});

module.exports = router;

