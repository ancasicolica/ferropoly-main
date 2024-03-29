/**
 * Route for all files to download (respectively the files which are not downloadable from another place
 * due to logical reasons)
 *
 * Created by kc on 06.07.15.
 */

const express           = require('express');
const router            = express.Router();
const accessor          = require('../lib/accessor');
const rankingList       = require('../lib/reports/rankingList');
const teamAccountReport = require('../lib/reports/teamAccountReport');
const _                 = require("lodash");

/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    rankingList.createXlsx(req.params.gameId, function (err, report) {
      if (err) {
        return res.status(500).send({message: 'createXlsx error: ' + err.message});
      }
      res.set({
        'Content-Type'       : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Description': 'File Transfer',
        'Content-Disposition': 'attachment; filename=' + report.name,
        'Content-Length'     : report.data.length
      });
      res.send(report.data);
    });
  });
});


/**
 * Returns the account info as Excel sheet (all teams only)
 */
router.get('/teamAccount/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    teamAccountReport.createXlsx(req.params.gameId, function (err, report) {
      if (err) {
        return res.status(500).send({message: 'createXlsx error: ' + err.message});
      }
      res.set({
        'Content-Type'       : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Description': 'File Transfer',
        'Content-Disposition': 'attachment; filename=' + report.name,
        'Content-Length'     : report.data.length
      });
      res.send(report.data);
    });
  });
});

module.exports = router;
