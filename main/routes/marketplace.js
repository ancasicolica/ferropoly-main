/**
 * Routes for marketplace access
 * Created by kc on 25.05.15.
 */

const express        = require('express');
const router         = express.Router();
const marketplaceApi = require('../lib/accounting/marketplace');
const accessor       = require('../lib/accessor');
const _              = require('lodash');

/**
 * Build Houses
 */
router.post('/buildHouses/:gameId/:teamId', function (req, res) {
  let marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.status(403).send({message: 'No authtoken'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin).then(() => {
    marketplace.buildHouses(req.params.gameId, req.params.teamId).then(result => {
      res.send({result: result});
    }).catch(err => {
      return res.status(500).send({message: 'buildHouses error: ' + err.message});
    });
  }).catch(err => {
    return res.status(403).send({message: 'Verification Error, ' + err.message});
  });
});

/**
 * Build a house on a specific property
 */
router.post('/buildHouse/:gameId/:teamId/:propertyId', function (req, res) {
  let marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.status(403).send({message: 'No authtoken'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin).then(() => {
    marketplace.buildHouse(req.params.gameId, req.params.teamId, req.params.propertyId).then(result => {
      res.send({result: result});
    }).catch(err => {
      return res.status(500).send({message: 'buildHouse error: ' + err.message});
    });
  }).catch(err => {
    return res.status(403).send({message: 'Verification Error, ' + err.message});
  });
});


/**
 * Buy Property
 */
router.post('/buyProperty/:gameId/:teamId/:propertyId', function (req, res) {
  let marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.status(403).send({message: 'No authtoken'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin).then(() => {
    marketplace.buyProperty({
      gameId:     req.params.gameId,
      teamId:     req.params.teamId,
      propertyId: req.params.propertyId,
      user:       user
    }).then(result => {
      res.send({result: result});
    }).catch(err => {
      return res.status(500).send({message: 'buyProperty error: ' + err.message});
    });
  }).catch(err => {
    return res.status(403).send({message: 'Verification Error, ' + err.message});
  });
});

/**
 * Pay the rents and interests. This should not be called except an urgent case (or during development)
 */
router.get('/payRents/:gameId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin).then(() => {
    let marketplace = marketplaceApi.getMarketplace();
    marketplace.payRents({gameId: req.params.gameId, user: user}).then(() => {
      res.send({status: 'ok'});
    }).catch(err => {
      return res.status(500).send({message: 'payRents error: ' + err.message});
    });
  }).catch(err => {
    return res.status(403).send({message: 'Verification Error, ' + err.message});
  });
});
module.exports = router;
