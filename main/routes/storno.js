/**
 * The "storno" route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 14.12.2025
 **/

const express          = require('express');
const router           = express.Router();
const accessor         = require('../lib/accessor');
const _                = require('lodash');
const logger           = require('../../common/lib/logger').getLogger('storno');
const {getMarketplace} = require('../lib/accounting/marketplace');


router.post('/:gameId/:propertyId', function (req, res) {
  if (!req.body.authToken) {
    return res.status(403).send({message: 'No authtoken'});
  }
  if (req.body.authToken !== req.session?.authToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin).then(async () => {
    logger.info(`${req.params.gameId}: STORNO REQUEST for property ${req.params.propertyId}`);

    try {
      const gameId     = req.params.gameId;
      const propertyId = req.params.propertyId;
      const reason     = req.body.reason || ''

      let retVal = await getMarketplace().resetProperty(gameId, propertyId, reason);
      return res.send(retVal);
    }
    catch (err) {
      logger.error(err);
      return res.status(500).send({message: err.message});
    }
  }).catch(err => {
    return res.status(403).send({message: 'Verification Error, ' + err.message});
  });
})

module.exports = router;
