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
const {DateTime}      = require('luxon');
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
 * Handles the generation of account statements for a specific game and property within a provided date range.
 * Validates user access and fetches the account data based on the parameters supplied in the request.
 *
 * @param {Object} req - The HTTP request object. Contains information such as parameters (gameId, propertyId, start,
 *   and end), session data, etc.
 * @param {Object} res - The HTTP response object. Used to send the response back to the client.
 * @return {void} Sends an HTTP response with the account statement data on success, or an error message on failure.
 */
function accountStatementHandler(req, res) {
  try {
    if (!req.params.gameId) {
      return res.status(404).send({status: 'error', message: 'No gameId supplied'});
    }
    if (req.params.propertyId === 'undefined' || req.params.propertyId === 'all') {
      req.params.propertyId = undefined;
    }
    if (!req.params.start) {
      req.params.start = undefined;
    }
    if (!req.params.end) {
      req.params.end = undefined;
    }

    const gameId     = req.params.gameId;
    const propertyId = req.params.propertyId;
    const start      = req.params.start || '2020-01-01';
    const end        = req.params.end || '2525-01-01';

    const user = _.get(req.session, 'passport.user', 'nobody');
    accessor.verify(user, gameId, accessor.admin)
      .then(async () => {
        const accountData = await propertyAccount.getAccountStatement(gameId, propertyId, DateTime.fromISO(start).toJSDate(), DateTime.fromISO(end).toJSDate());
        res.send({register: accountData});
      })
      .catch(err => {
        // This is not the admin. Refuse.
        return res.status(403).send({message: err.message});
      })
  }
  catch (e) {
    logger.error(e);
    res.status(500).send({message: e.message});
  }
}

// New since 2025: these routes are only allowed for admins. Users will have their own route, preventing abuse.
router.get('/getAccountStatement/:gameId/:propertyId/:start/:end', accountStatementHandler);
router.get('/getAccountStatement/:gameId/:propertyId/:start', accountStatementHandler);
router.get('/getAccountStatement/:gameId/:propertyId', accountStatementHandler);
router.get('/getAccountStatement/:gameId', accountStatementHandler);


/**
 * Handles the generation of account statements for a specific game and property within a provided date range.
 * Validates user access and fetches the account data based on the parameters supplied in the request.
 *
 * This is the handler for teams
 *
 * @param {Object} req - The HTTP request object. Contains information such as parameters (gameId, propertyId, start,
 *   and end), session data, etc.
 * @param {Object} res - The HTTP response object. Used to send the response back to the client.
 * @return {void} Sends an HTTP response with the account statement data on success, or an error message on failure.
 */
function teamAccountStatementHandler(req, res) {
  try {
    if (!req.params.gameId) {
      return res.status(404).send({status: 'error', message: 'No gameId supplied'});
    }
    if (!req.params.teamId) {
      return res.status(404).send({status: 'error', message: 'No teamId supplied'});
    }
    if (req.params.propertyId === 'undefined' || req.params.propertyId === 'all') {
      req.params.propertyId = undefined;
    }
    if (!req.params.start) {
      req.params.start = undefined;
    }
    if (!req.params.end) {
      req.params.end = undefined;
    }

    const gameId     = req.params.gameId;
    const propertyId = req.params.propertyId === 'all' ? undefined : req.params.propertyId;
    const teamId     = req.params.teamId;
    const start      = req.params.start || '2020-01-01';
    const end        = req.params.end || '2525-01-01';

    const user = _.get(req.session, 'passport.user', 'nobody');
    accessor.verifyPlayer(user, gameId, teamId)
      .then(async () => {
        let properties;
        if (propertyId) {
          properties = [propertyId];
        } else {
          properties = await propertyModel.getPropertiesIdsForTeam(gameId, teamId);
        }
        const accountData = [];
        for (const prop of properties) {
          const data = await propertyAccount.getAccountStatement(gameId, prop.uuid, DateTime.fromISO(start).toJSDate(), DateTime.fromISO(end).toJSDate());
          if (!data) {
          } else if (Array.isArray(data)) {
            accountData.push(...data);
          } else {
            accountData.push(data);
          }
        }
        res.send({register: accountData});
      })
      .catch(err => {
        // This is not the admin. Refuse.
        return res.status(403).send({message: err.message});
      })
  }
  catch (e) {
    logger.error(e);
    res.status(500).send({message: e.message});
  }
}

// New since 2025: specialized routes for teams
router.get('/getTeamAccountStatement/:gameId/:teamId/:propertyId/:start/:end', teamAccountStatementHandler);
router.get('/getTeamAccountStatement/:gameId/:teamId/:propertyId/:start', teamAccountStatementHandler);
router.get('/getTeamAccountStatement/:gameId/:teamId/:propertyId', teamAccountStatementHandler);
router.get('/getTeamAccountStatement/:gameId/:teamId', teamAccountStatementHandler);


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
    .catch(err => {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    });
});

module.exports = router;

