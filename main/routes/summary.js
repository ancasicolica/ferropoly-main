/**
 * The summary of a game, all data is collected here and uploaded to the page
 * Created by kc on 27.04.16.
 */


const express = require('express');
const router  = express.Router();

const settings                    = require('../settings');
const chancelleryTransactionModel = require('../../common/models/accounting/chancelleryTransaction');
const teamAccountTransactionModel = require('../../common/models/accounting/teamAccountTransaction');
const travelLogModel              = require('../../common/models/travelLogModel');
const errorHandler                = require('../lib/errorHandler');
const logger                      = require('../../common/lib/logger').getLogger('routes:summary');
const _                           = require('lodash');
const gameCache                   = require('../lib/gameCache');
const path                        = require('path');
const gamecache                   = require('../lib/gameCache');
const propWrap                    = require('../lib/propertyWrapper');
const collectAccountStatement     = require('../lib/accounting/collectAccountStatement');
const travelLog                   = require('../../common/models/travelLogModel');
const {DateTime}                  = require('luxon');
const picBucket                   = require('../lib/picBucket')(settings.picBucket);

let ngFile = '/js/summaryctrl.js';
if (settings.minifiedjs) {
  ngFile = '/js/min/summaryctrl.min.js';
}


/**
 * Send HTML Page
 */
router.get('/:gameId', async function (req, res) {
  try {
    const gameData = await gameCache.getGameData(req.params.gameId);

    if (!gameData) {
      return errorHandler(res, 'Spiel nicht gefunden.', new Error('Game not found'), 404);
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'summary.html'));

  }
  catch (err) {
    logger.error('Error in /summary', err);
    return errorHandler(res, 'Interner Fehler beim Laden des Spiels.', err, 500);
  }

});

router.get('/:gameId/static', async function (req, res) {
  try {

    let gameId = req.params.gameId;

    await gamecache.refreshCache();

    const gamedata = await gamecache.getGameData(gameId);
    if (!gamedata || !gamedata.gameplay) {
      return res.status(404).send({message: 'Spiel nicht gefunden.'});
    }
    let gp    = gamedata.gameplay;
    let teams = [];
    for (let t of gamedata.teams) {
      teams.push(_.omit(t[1], ['data.teamLeader.email', 'data.teamLeader.phone', 'data.remarks', 'data.members']));
    }

    // Data is only returned after the game
    if (DateTime.now() < DateTime.fromJSDate(gp.scheduling.gameEndTs)) {
      return res.status(403).send({message: 'Die Spieldaten stehen erst nach dem Spiel zur Verfügung'});
    }

    // Yes, this is what we called the node.js callback hell... but now with promises ist really looks nicer!
    const props = await propWrap.getAllProperties(gameId);

    for (let i in props) {
      props[i] = _.omit(props[i], ['_id', '__v', 'gameId']);
    }
    // Now we continue with the ranking list
    const ranking = await teamAccountTransactionModel.getRankingList(req.params.gameId);

    for (let i in ranking) {
      ranking[i] = _.omit(ranking[i], ['_id', '__v', 'gameId']);
    }
    // of course we want to add all account statements of all teams too
    const accountStatement = await collectAccountStatement(req);
    // now we get all travel log entries
    const travelLogEntries = await travelLogModel.getAllLogEntries(req.params.gameId, undefined);

    for (let i in travelLogEntries) {
      travelLog[i] = _.omit(travelLog[i], ['_id', '__v', 'gameId']);
    }

    // and the chancellery shall also not to be forgotten
    const chancelleryStatement = await chancelleryTransactionModel.getEntries(req.params.gameId);

    let balance = 0;
    const chancelleryEntries = [];
    for (let entry of chancelleryStatement) {
      let e = _.omit(entry, ['_id', '__v', 'gameId']);
      balance += _.get(e, 'transaction.amount', -1);
      e.balance = balance;
      chancelleryEntries.push(e);
    }

    const bucket = await picBucket.list(gameId, {uploaded: true});

    res.send({
      gameplay:      gp,
      teams:         teams,
      currentGameId: gameId,
      mapApiKey:     settings.maps.apiKey,
      properties:    props,
      ranking,
      accountStatement,
      travelLog:     travelLogEntries,
      chancellery:   chancelleryEntries,
      picBucket:     bucket
    });
  }
  catch (err) {
    logger.error('Error in /summary', err);
    return res.status(500).send({message: err.message});
  }
});

module.exports = router;
