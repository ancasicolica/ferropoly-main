/**
 * Chancellery route
 * Created by kc on 28.05.15.
 */


const express        = require('express');
const router         = express.Router();
const chancellery    = require('../lib/accounting/chancelleryAccount');
const gameCache      = require('../lib/gameCache');
const logger         = require('../../common/lib/logger').getLogger('routes:chancellery');
const accessor       = require('../lib/accessor');
const _              = require('lodash');
const marketplaceApi = require('../lib/accounting/marketplace');
const {gameActive} = require('../lib/mainGameplayLib');

/**
 * Get the amount of the chancellery
 */
router.get('/balance/:gameId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  accessor.verify(user, req.params.gameId, accessor.admin).then(() => {
    chancellery.getBalance(req.params.gameId).then(data => {
      res.send(data);
    }).catch(err => {
      return res.status(500).send({message: 'getBalance error: ' + err.message});
    });
  }).catch(err => {
    return res.status(403).send({message: 'Access right error: ' + err.message});
  })
});

/**
 * Get all account entries of the chancellery
 */
router.get('/account/statement/:gameId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  accessor.verify(user, req.params.gameId, accessor.admin)
    .then(() => {
      chancellery.getAccountStatement(req.params.gameId)
        .then(data => {
          res.send({entries: data});
        }).catch(err => {
        res.status(500).send({message: 'getAccountStatement error: ' + err.message});
      });
    }).catch(err => {
    res.status(403).send({message: 'Access right error: ' + err.message});
  });
});

/**
 * play chancellery
 */
router.post('/play/:gameId/:teamId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  if (!req.params.gameId || !req.params.teamId) {
    return res.status(400).send({message: 'No gameId or teamId supplied'});
  }
  accessor.verify(user, req.params.gameId, accessor.admin).catch(err => {
    return res.status(403).send({message: `Access right error: ${err.message}`});
  }).then(async () => {
    try {
      const data = await gameCache.getGameData(req.params.gameId);

      let gp   = data.gameplay;
      let team = data.teams.get(req.params.teamId);

      if (!gameActive(gp)) {
        return res.status(406).send({message: 'Game is not active'});
      }

      const chRes = await chancellery.playChancellery(gp, team);
      res.send({result: chRes});
    }
    catch (ex) {
      logger.info('Error in /chancellery/play', ex);
      return res.status(500).send({message: 'playChancellery error: ' + ex.message});
    }
  });
});

/**
 * Gambling
 */
router.post('/gamble/:gameId/:teamId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  if (!req.body.authToken) {
    return res.status(401).send({message: 'Permission denied (Missing authToken)'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(401).send({message: 'Permission denied (Wrong authToken)'});
  }
  if (!req.params.gameId || !req.params.teamId || !req.body.amount) {
    return res.status(400).send({message: 'No gameId, teamId or amount supplied'});
  }

  accessor.verify(user, req.params.gameId, accessor.admin)
    .then(async () => {
      try {
        let amount = parseInt(req.body.amount);
        if (!_.isFinite(amount)) {
          return res.status(400).send({message: 'amount is not a number'});
        }
        const data = await gameCache.getGameData(req.params.gameId);
        let gp     = data.gameplay;
        let team   = data.teams.get(req.params.teamId);

        if (!gameActive(gp)) {
          return res.status(406).send({message: 'Game is not active'});
        }

        if (!team) {
          return res.status(404).send({message: 'team not found'});
        }

        let marketplace = marketplaceApi.getMarketplace();
        if (!marketplace.isOpen(gp)) {
          return res.status(403).send({message: 'Marketplace is closed!'});
        }

        const retVal = await chancellery.gamble(gp, team, amount)
        res.send({result: retVal});
      }
      catch (ex) {
        return res.status(500).send({message: 'gamble error: ' + ex.message});
      }
    })
    .catch(err => {
      logger.info(`Access right error ${user} in ${req.params.gameId}`, err?.message);
      return res.status(403).send({message: `Access right error: ${err.message}`});
    });
});
module.exports = router;
