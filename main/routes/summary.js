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
const propertyModel               = require('../../common/models/propertyModel');
const gameLogModel                = require('../../common/models/gameLogModel');
const pricelist                   = require('../../common/lib/pricelist');
const teamModel                   = require('../../common/models/teamModel');
const errorHandler                = require('../lib/errorHandler');
const logger                      = require('../../common/lib/logger').getLogger('routes:summary');
const summaryMailer               = require('../lib/summaryMailer');
const async                       = require('async');
const moment                      = require('moment');
const _                           = require('lodash');
const gameCache                   = require('../lib/gameCache');
const path                        = require('path');
const gamecache                   = require('../lib/gameCache');
const propWrap                    = require('../lib/propertyWrapper');
const teamAccount                 = require('../lib/accounting/teamAccount');
const collectAccountStatement     = require('../lib/accounting/collectAccountStatement');
const travelLog                   = require('../../common/models/travelLogModel');
const chancellery                 = require('../lib/accounting/chancelleryAccount');
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
      return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
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
      teams.push(_.omit(t, ['data.teamLeader.email', 'data.teamLeader.phone', 'data.remarks', 'data.members']));
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
    const chancelleryStatement = await chancelleryTransactionModel.getAccountStatement(req.params.gameId);

    let balance = 0;
    for (let i in chancellery) {
      chancellery[i]         = _.omit(chancellery[i], ['_id', '__v', 'gameId']);
      balance += _.get(chancellery[i], 'transaction.amount', -1);
      chancellery[i].balance = balance;
    }

    const bucket = await picBucket.list(gameId, {uploaded: true});

    res.send({
      gameplay:      gp,
      teams:         teams.values(),
      currentGameId: gameId,
      mapApiKey:     settings.maps.apiKey,
      properties:    props,
      ranking,
      accountStatement,
      travelLog:     travelLogEntries,
      chancellery:   chancelleryStatement,
      picBucket:     bucket
    });
  }
  catch (err) {
    logger.error('Error in /summary', err);
    return res.status(500).send({message: err.message});
  }
});


/**
 * Sends a mail to all teams with the summary (debug purposes only)
 * Looks something like this: localhost:3004/summary/game-id-here/sendmail?auth=demo
 */
router.post('/:gameId/sendmail', function (req, res) {
  let mailer = summaryMailer.getMailer();

  if (req.query.auth !== settings.debugSecret) {
    return res.status(403).send({message: 'Not allowed'});
  }

  mailer.sendInfo(req.params.gameId, (err, info) => {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    res.status(200).send(info);
  })
});

module.exports = router;
