/**
 * Statistics API
 * Created by kc on 25.05.15.
 */


const express         = require('express');
const router          = express.Router();
const teamAccount     = require('../lib/accounting/teamAccount');
const propertyAccount = require('../lib/accounting/propertyAccount');
const gameCache       = require('../lib/gameCache');
const logger          = require('../../common/lib/logger').getLogger('routes:statistics');
const accessor        = require('../lib/accessor');
const _               = require('lodash');

/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin)
    .then(() => {
      teamAccount.getRankingList(req.params.gameId)
        .then(ranking => {
          res.send({ranking: ranking});
        })
        .catch(err => {
          logger.error(err);
          return res.status(500).send({message: err.message});
        });
    })
    .catch(err => {
      return res.status(401).send({message: err.message});
    });
});


/**
 * Get the list with the income of all teams
 */
router.get('/income/:gameId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin)
    .then(async () => {
      try {
        const data = await gameCache.getGameData(req.params.gameId);
        let gp     = data.gameplay;
        let teams  = data.teams.values();
        const info = [];
        for (let team of teams) {
          let result = await propertyAccount.getRentRegister(gp, team);
          info.push(result);
        }
        res.send({info: info});
      }
      catch (err) {
        logger.error(err);
        return res.status(500).send({message: err.message});
      }
    })
    .catch(err => {
      return res.status(401).send({message: err.message});
    });

});


/**
 * Get the list with the income of a specific team (only own data for every team, hardcoded)
 */
router.get('/income/:gameId/:teamId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verifyPlayer(user, req.params.gameId, req.params.teamId)
    .then(async () => {
      try {
        const data = await gameCache.getGameData(req.params.gameId);
        const team = data.teams.get(req.params.teamId);
        if (!team) {
          return res.status(404).send({message: 'Team not found'});
        }
        const result = await propertyAccount.getRentRegister(data.gameplay, team);
        return res.send({info: result});
      }
      catch (err) {
        logger.error(err);
        return res.status(500).send({message: err.message});
      }
    })
    .catch(err => {
      return res.status(401).send({message: err.message});
    })
});


module.exports = router;
