/**
 * Things about properties
 * Created by kc on 26.05.15.
 */

const express  = require('express');
const router   = express.Router();
const propWrap = require('../lib/propertyWrapper');
const accessor = require('../lib/accessor');
const _        = require('lodash');
const logger = require('../../common/lib/logger').getLogger('routes:properties');

function handleGetPropertiesRequest(req, res, gameId, teamId) {
  if (!gameId) {
    logger.info('No gameId, no properties', {gameId, teamId});
    return res.status(400).send({message: 'No gameId supplied'});
  }

  const user = _.get(req.session, 'passport.user', 'nobody');

  accessor.verify(user, gameId, accessor.admin)
    .then(() => {
      // Admin has access to all properties
      console.log('YYYYYY then 22222');
      if (teamId) {
        propWrap.getTeamProperties(gameId, teamId)
          .then(props => {
            console.log('YYYYYY then 4');
            res.send({properties: props});
          })
          .catch(err => {
            console.log('XXXXXX catch 3');
            return res.status(500).send({message: 'getTeamProperties error: ' + err.message});
          });
      } else {
        propWrap.getAllProperties(gameId)
          .then(props => {
            console.log('YYYYYY then 3');
            res.send({properties: props});
          })
          .catch(err => {
            console.log('XXXXXX catch 4');
            return res.status(500).send({message: 'getAllProperties error: ' + err.message});
          });
      }
    })
    .catch(() => {
      console.log('XXXXXX catch 1');
      // definitely not an admin and game in process. Be careful what we return; only data of the calling team is
      // returned
      accessor.verifyPlayer(user, gameId, teamId)
        .then(() => {
          console.log('YYYYYY then 1');
          propWrap.getTeamProperties(gameId, teamId)
            .then(props => {
              console.log('YYYYYY then 2');
              res.send({properties: props});
            })
            .catch(err => {
              console.log('XXXXXX catch 5');
              return res.status(500).send({message: 'getTeamProperties error: ' + err.message});
            });
        })
        .catch(err => {
          console.log('XXXXXX catch 2');
          return res.status(403).send({message: 'Access right error: ' + err.message});
        })
    })
}

/**
 * Get all properties of a game
 */
router.get('/get/:gameId', (req, res) => {
  handleGetPropertiesRequest(req, res, req.params.gameId, null);
});

/**
 * Get all properties of a team
 */
router.get('/get/:gameId/:teamId', function (req, res) {
  handleGetPropertiesRequest(req, res, req.params.gameId, req.params.teamId);
});

module.exports = router;
