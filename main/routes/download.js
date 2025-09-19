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
const _                 = require('lodash');

/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', async function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  try {
    const user = _.get(req.session, 'passport.user', 'nobody');
    await accessor.verify(user, req.params.gameId, accessor.admin);

    const report = await rankingList.createXlsx(req.params.gameId);
    res.set({
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Description': 'File Transfer',
      'Content-Disposition': 'attachment; filename=' + report.name,
      'Content-Length':      report.data.length
    });
    res.send(report.data);
  }
  catch (ex) {
    res.status(500).send({message: ex.message});
  }
});


/**
 * Returns the account info as Excel sheet (all teams only)
 */
router.get('/teamAccount/:gameId', async function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  try {
    const user = _.get(req.session, 'passport.user', 'nobody');
    await accessor.verify(user, req.params.gameId, accessor.admin);
    const report = await teamAccountReport.createXlsx(req.params.gameId);
    res.set({
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Description': 'File Transfer',
      'Content-Disposition': 'attachment; filename=' + report.name,
      'Content-Length':      report.data.length
    });
    res.send(report.data);
  }
  catch (ex) {
    res.status(500).send({message: ex.message});
  }

});

module.exports = router;
