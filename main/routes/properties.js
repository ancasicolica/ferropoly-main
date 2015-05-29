/**
 * Things about properties
 * Created by kc on 26.05.15.
 */
'use strict';


var express = require('express');
var router = express.Router();
var propWrap = require('../lib/propertyWrapper');

/**
 * Get all properties of a team
 *
 * if teamId is set to 'undefined', all are returned
 */
router.get('/get/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }

  if (!req.params.teamId || req.params.teamId === 'undefined') {
    propWrap.getAllProperties(req.params.gameId, function (err, props) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', properties: props});
    });
  }
  else {
    propWrap.getTeamProperties(req.params.gameId, req.params.teamId, function (err, props) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', properties: props});
    });
  }
});

module.exports = router;