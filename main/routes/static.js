/**
 * Static game data
 *
 * Replaces the formerly embedded data into pug files
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.03.22
 **/
const express          = require('express');
const router           = express.Router();
const gamecache        = require('../lib/gameCache');
const _                = require('lodash');
const pricelist        = require('../../common/lib/pricelist');
const authTokenManager = require('../../common/lib/authTokenManager');
const logger           = require('../../common/lib/logger').getLogger('static');
const settings         = require('../settings');


router.get('/:gameId', async function (req, res) {
  try {

    let gameId = req.params.gameId;
    const user = _.get(req.session, 'passport.user', 'nobody');

    await gamecache.refreshCache();

    const gamedata = await gamecache.getGameData(gameId);
    if (!gamedata) {
      return res.status(404).send({message: 'Spiel nicht gefunden!'});
    }

    let gp    = gamedata.gameplay;
    let teams = Array.from(gamedata.teams.values());

    // The team is only returned if the requesting user is a player
    let team = _.find(_.values(teams), function (t) {
      if (t.data.teamLeader.email === user) {
        return true;
      }
      return _.find(t.data.members, function (m) {
        return m.login === user;
      });
    });

    let pl = await pricelist.getPricelist(gameId);

    if (!pl) {
      pl = {};
    }

    const token           = await authTokenManager.getNewTokenAsync({
      user:          user,
      proposedToken: req.session.authToken
    });
    req.session.authToken = token;
    logger.debug(`Session saved for ${user} in ${gameId}`, req.session);
    res.send({
      authToken:     token,
      socketUrl:     '/',
      gameplay:      gp,
      pricelist:     pl,
      team:          team,
      teams:         _.values(teams),
      currentGameId: gameId,
      mapApiKey:     settings.maps.apiKey,
      user:          user
    });
  }
  catch (e) {
    res.status(500).send({message:e.message});
  }
});

module.exports = router;
