/**
 * Gameplays access
 * Created by kc on 07.04.16.
 */

const express       = require('express');
const router        = express.Router();
const gameplayModel = require('../../common/models/gameplayModel');
const logger        = require('../../common/lib/logger').getLogger('routes:index');
const teams         = require('../../common/models/teamModel');
const _             = require('lodash');

/**
 * Get the gameplays for the user, the ones owned and the ones as player
 */
router.get('/', async function (req, res) {
  try {
    const user = _.get(req.session, 'passport.user', null);
    if (!user) {
      return res.status(401).send({message: 'No valid user logged in'});
    }
    const gameplays = await gameplayModel.getGameplaysForUser(user);

    logger.info(`${user} is requesting gameplays. Got ${gameplays.length} gameplays.`);

    let retVal = {success: true, gameplays: [], games: []};
    if (gameplays) {
      gameplays.forEach(function (gameplay) {
        retVal.gameplays.push({
          internal:   gameplay.internal,
          gamename:   gameplay.gamename,
          scheduling: gameplay.scheduling,
          log:        gameplay.log,
          mobile:     gameplay.mobile
        });
      });
    }

    const myTeams = await teams.getMyTeams(user);
    if (!myTeams) {
      // No teams as player. return
      return res.send(retVal);
    }
    for (const team of myTeams) {
      const gp = await gameplayModel.getGameplay(team.gameId, null);
      retVal.games.push({
        internal:   gp.internal,
        gamename:   gp.gamename,
        scheduling: gp.scheduling,
        log:        gp.log,
        mobile:     gp.mobile,
        team:       team,
        owner:      gp.owner,
        isTeamLead: user === _.get(team, 'data.teamLeader.email', 'nomail')
      });
    }
    return res.send(retVal);
  }
  catch (e) {
    logger.error(e);
    return res.status(500).send({message: e.message});
  }
});
module.exports = router;

