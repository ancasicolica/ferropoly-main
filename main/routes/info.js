/**
 * Page about game info, no login required
 *
 * Created by kc on 08.05.15.
 */

const express = require('express');
const router  = express.Router();

const gameplayModel     = require('../../common/models/gameplayModel');
const pricelist         = require('../../common/lib/pricelist');
const teamModel         = require('../../common/models/teamModel');
const rulesModel        = require('../../common/models/rulesModel');
const logger            = require('../../common/lib/logger').getLogger('routes:info');
const priceListDownload = require('../../common/routes/downloadPricelist');
const _                 = require('lodash');
const path              = require('path');


/**
 * Send HTML Page
 */
router.get('/:gameId', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'game-info.html'));
});


/* GET the data for the page */
router.get('/data/:gameId', async function (req, res) {
  let gameId = req.params.gameId;

  try {
    const gp = await gameplayModel.getGameplay(gameId, null);
    if (!gp) {
      return res.status(500).send({message: 'Interner Fehler: gp ist null'});
    }

    let pl    = [];
    let rules = null;
    if (gp.internal.finalized) {
      pl = await pricelist.getPricelist(gameId);
      if (!pl) {
        return res.status(500).send({message: 'Interner Fehler: pl ist null'});
      }
    }

    rules = await rulesModel.getRules(gameId);

    const foundTeams = await teamModel.getTeams(gameId)
    // Filter some info
    let teams        = [];
    for (let i = 0; i < foundTeams.length; i++) {
      teams.push({
        name:           _.get(foundTeams[i], 'data.name', 'no-name'),
        organization:   _.get(foundTeams[i], 'data.organization', ''),
        teamLeaderName: _.get(foundTeams[i], 'data.teamLeader.name', '')
      });
    }

    res.send({gameplay: gp, pricelist: pl, teams, rules});
  }
  catch (ex) {
    logger.info('Problem in route', ex.message);
    res.status(500).send({message: ex.message});
  }

});

router.get('/:gameId/download', priceListDownload.handler);

module.exports = router;
