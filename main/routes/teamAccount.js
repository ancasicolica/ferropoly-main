/**
 * Route for the team accounts
 * Created by kc on 27.05.15.
 */
'use strict';


var express = require('express');
var router = express.Router();
var teamAccount = require('../lib/accounting/teamAccount');
var _ = require('lodash');

router.get('/get/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (req.params.teamId === 'undefined') {
    req.params.teamId = undefined;
  }

  var teamBalance = {};

  teamAccount.getAccountStatement(req.params.gameId, req.params.teamId, function(err, data) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }

    for (var i = 0; i < data.length; i++) {
      if (_.isUndefined(teamBalance[data[i].teamId])) {
        teamBalance[data[i].teamId] = 0;
      }
      teamBalance[data[i].teamId] += data[i].transaction.amount;
      data[i].balance = teamBalance[data[i].teamId];
    //  data[i].transaction = _.omit(data[i].transaction, 'origin');
      data[i] = _.omit(data[i], ['_id', 'gameId','__v']);
    }
    res.send({status:'ok', accountData: data});
  });

});

module.exports = router;

