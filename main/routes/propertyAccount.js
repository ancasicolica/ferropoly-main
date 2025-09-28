/**
 * Route for for property Account Issues
 * Created by kc on 27.05.15.
 */


const express         = require('express');
const router          = express.Router();
const propertyAccount = require('../lib/accounting/propertyAccount');
const gameCache       = require('../lib/gameCache');
const logger          = require('../../common/lib/logger').getLogger('routes:propertyAccount');
const accessor        = require('../lib/accessor');
const propertyModel   = require('../../common/models/propertyModel');
const _               = require('lodash');

/**
 * Get all account Info for a team
 */
router.get('/getRentRegister/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId || !req.params.teamId) {
    return res.status(400).send({message: 'Missing parameters'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin)
    .then(async () => {
      try {
        const data = await gameCache.getGameData(req.params.gameId);

        let gp   = data.gameplay;
        let team = data.teams.get(req.params.teamId);

        if (!gp || !team) {
          return res.status(400).send({status: 'error', message: 'Invalid params'});
        }

        console.log('XXX', gp, team);

        const register = await propertyAccount.getRentRegister(gp, team);
        res.send(register);
      }
      catch (err) {
        logger.error(err);
        return res.status(500).send({message: 'getRentRegister error: ' + err.message});
      }
    })
    .catch(err => {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    })
});

/**
 * Retrieves the account statement for a specified game and optional property.
 *
 * @param {Object} req - The HTTP request object, containing session and user information.
 * @param {Object} res - The HTTP response object, used to send responses back to the client.
 * @param {string} gameId - The unique identifier for the game whose account statement is being requested.
 * @param {string} [propertyId] - The optional identifier for the property related to the account statement.
 * @return {void} Sends the account statement data or an error message in the HTTP response.
 */
function getAccountStatement(req, res, gameId, propertyId = undefined) {
  if (!gameId) {
    return res.status(400).send({message: 'Missing parameters'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, gameId, accessor.admin)
    .then(() => {
      propertyAccount.getAccountStatement(gameId, propertyId)
        .then(register => {
          res.send({register: register});
        })
        .catch(err => {
          return res.status(500).send({message: 'getAccountStatement error: ' + err.message});
        });
    })
    .catch(err => {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    })
}

/**
 * Get all account Info for a property
 */
router.get('/getAccountStatement/:gameId/:propertyId', function (req, res) {
  getAccountStatement(req, res, req.params.gameId, req.params.propertyId);
});

/**
 * Get all account Info for a game
 */
router.get('/getAccountStatement/:gameId', function (req, res) {
  getAccountStatement(req, res, req.params.gameId);
});

/**
 * Get profitability of all properties
 */
router.get('/propertyProfitability/:gameId/', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin)
    .then(() => {
      propertyAccount.getPropertyProfitability(req.params.gameId)
        .then(info => {
          res.send({info: info});
        })
        .catch(err => {
          logger.error(err);
          return res.status(500).send({message: 'getPropertyProfitability error: ' + err.message});
        })
    })
    .catch(err => {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    })
});


/**
 * Get profitability of all properties belonging to a team
 */
router.get('/propertyProfitability/:gameId/:teamId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin)
    .then(async () => {
      try {
        // Get all properties for a team
        const properties = await propertyModel.getPropertiesIdsForTeam(req.params.gameId, req.params.teamId);
        const info       = [];
        for (const prop of properties) {
          const profit = await propertyAccount.getPropertyProfitability(req.params.gameId, prop.uuid);
          info.push(profit[0]);
        }
        res.send({info: info});
      }
      catch (err) {
        logger.error(err);
        return res.status(500).send({message: 'propertyProfitability error: ' + err.message});
      }
    })
    .catch(err=>{
      return res.status(403).send({message: 'Access right error: ' + err.message});
    });
});

module.exports = router;

