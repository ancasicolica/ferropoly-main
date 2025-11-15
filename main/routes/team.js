/**
 * All about teams
 * Created by kc on 07.04.16.
 */

const express = require('express');
const router  = express.Router();

const errorHandler = require('../lib/errorHandler');
const teams        = require('../../common/models/teamModel');
const users        = require('../../common/models/userModel');
const _            = require('lodash');
const accessor     = require('../lib/accessor');
const gameCache    = require('../lib/gameCache');
const path         = require('path');

/**
 * Send HTML Page
 */
router.get('/edit/:gameId/:teamId', async function (req, res) {
  try {
    const user = _.get(req.session, 'passport.user', 'nobody');
    const team = await teams.getTeam(req.params.gameId, req.params.teamId);
    if (_.get(team, 'data.teamLeader.email', 'x') !== user) {
      return errorHandler(res, 'Nicht berechtigt.', new Error('Not authorized or not found'), 403);
    }
    const gameData = await gameCache.getGameData(req.params.gameId);
    if (!gameData) {
      return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'team.html'));
  }
  catch (err) {
    return errorHandler(res, 'Interner Fehler.', err, 500);
  }
});

/**
 * Get the full member list, including all data needed for the teams member page
 * @param gameId
 * @param teamId
 */
async function getFullMemberList(gameId, teamId) {
  const team = await teams.getTeam(gameId, teamId);
  return _.get(team, 'data.members', []);
}

/**
 * Get all team members
 */
router.get('/members/:gameId/:teamId', (req, res) => {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verifyPlayer(user, req.params.gameId, req.params.teamId)
    .then(() => {
      getFullMemberList(req.params.gameId, req.params.teamId)
        .then(info => {
          res.send({members: info});
        })
        .catch(err => {
          return errorHandler(res, 'Internes Problem .', err, 500);
        })
    })
    .catch(err => {
      return errorHandler(res, 'Zugriff nicht möglich.', err, 404);
    })
});

/**
 * Add a member and get all back in return
 */
router.post('/members/:gameId/:teamId', (req, res) => {
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');

  accessor.verifyPlayer(user, req.params.gameId, req.params.teamId)
    .then(async () => {
      try {
        const team        = await teams.getTeam(req.params.gameId, req.params.teamId);
        team.data.members = team.data.members || [];

        // Add only if not already in the team
        if (!_.find(team.data.members, m => {
          return (m.login === req.body.newMemberLogin);
        })) {

          const user = await users.getUserByMailAddress(req.body.newMemberLogin);
          if (user) {
            team.data.members.push({login: req.body.newMemberLogin, personalData: user.personalData});
          } else {
            team.data.members.push({login: req.body.newMemberLogin});
          }
        }

        await teams.updateTeam(team);
        const info = await getFullMemberList(req.params.gameId, req.params.teamId);
        res.send({members: info});
      }
      catch (err) {
        return errorHandler(res, 'Internes Problem .', err, 500);
      }
    })
    .catch(err => {
      return errorHandler(res, 'Zugriff nicht möglich.', err, 404);
    });
});


/**
 * removes a member and get all back in return
 */
router.delete('/members/:gameId/:teamId', async (req, res) => {
  try {
    if (!req.body.authToken) {
      return res.status(401).send({status: 'error', message: 'Permission denied (1)'});
    }
    if (req.body.authToken !== req.session.authToken) {
      return res.status(401).send({status: 'error', message: 'Permission denied (2)'});
    }

    const team        = await teams.getTeam(req.params.gameId, req.params.teamId);
    team.data.members = team.data.members || [];
    _.remove(team.data.members, (m) => {
      return m.login === req.body.memberToDelete;
    });

    await teams.updateTeam(team);

    const info = await getFullMemberList(req.params.gameId, req.params.teamId);
    res.send({members: info});
  }
  catch (err) {
    return errorHandler(res, 'Internes Problem .', err, 500);
  }
});

module.exports = router;
