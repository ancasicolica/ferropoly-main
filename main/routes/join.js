/**
 * Join a game
 * Created by kc on 05.02.16.
 */

const express      = require('express');
const router       = express.Router();
const gameCache    = require('../lib/gameCache');
const users        = require('../../common/models/userModel');
const teams        = require('../../common/models/teamModel');
const logger       = require('../../common/lib/logger').getLogger('routes:join');
const mailer       = require('../../common/lib/mailer');
const errorHandler = require('../lib/errorHandler');
const path         = require('path');
const _            = require('lodash');

/**
 * Send HTML Page
 */
router.get('/:gameId', async function (req, res) {
  try {
    const gameData = await gameCache.getGameData(req.params.gameId);
    if (!gameData) {
      return errorHandler(res, 'Spiel nicht gefunden.', null, 404);
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'join.html'));
  }
  catch (err) {
    errorHandler(res, 'Spiel nicht gefunden.', err, 404);
  }
});

/**
 * Returns the data displayed on the joining page
 */
router.get('/data/:gameId', async function (req, res) {
  try {
    const user = _.get(req.session, 'passport.user', 'nobody');

    const gameData = await gameCache.getGameData(req.params.gameId);

    if (!gameData) {
      return res.status(404).send({message: 'Game not found'});
    }

    let gameplay = {};
    if (gameData && gameData.gameplay) {
      gameplay = gameData.gameplay;
    }

    const userInfo = await users.getUserByMailAddress(user);
    if (!userInfo) {
      return res.status(404).send({message: 'User not found'});
    }

    const team   = await teams.getMyTeam(req.params.gameId, user);
    let teamInfo = {};
    if (team) {
      teamInfo.name             = team.data.name;
      teamInfo.organization     = team.data.organization;
      teamInfo.phone            = team.data.teamLeader.phone;
      teamInfo.remarks          = team.data.remarks;
      teamInfo.confirmed        = team.data.confirmed;
      teamInfo.id               = team.id;
      teamInfo.registrationDate = team.data.registrationDate;
      teamInfo.changedDate      = team.data.changedDate;
    }
    res.send({gameplay, user: {personalData: userInfo.personalData, id: userInfo._id}, teamInfo: teamInfo});
  }
  catch (err) {
    logger.error('GET /data', err);
    res.status(500).send({message: err.message});
  }
});

/**
 * Submit a request to join a game
 */
router.post('/:gameId', async (req, res) => {
  try {
    if (!req.body.authToken) {
      return res.status(401).send({message: 'Permission denied, no authToken found'});
    }
    if (req.body.authToken !== req.session.authToken) {
      return res.status(401).send({message: 'Permission denied, invalid authToken'});
    }
    const user = _.get(req.session, 'passport.user', 'nobody');

    const gameData = await gameCache.getGameData(req.params.gameId);

    if (!gameData) {
      return res.status(404).send({message: 'Game not found'});
    }

    const userInfo = await users.getUserByMailAddress(user);
    if (!userInfo) {
      return res.status(404).send({message: 'User not found'});
    }

    const team = await teams.getMyTeam(req.params.gameId, user);

    // Sets the data according to the request
    function setTeamData(d) {
      d.gameId                  = req.params.gameId;
      d.data                    = d.data || {};
      d.data.name               = req.body.teamName;
      d.data.organization       = req.body.organization;
      d.data.teamLeader         = {
        name:  userInfo.personalData.forename + ' ' + userInfo.personalData.surname,
        email: userInfo.personalData.email,
        phone: req.body.phone
      };
      d.data.remarks            = req.body.remarks;
      d.data.onlineRegistration = true; // Game owner can't change email address
      d.data.changedDate        = new Date();
      return d;
    }

    if (!team) {
      // New team
      logger.info(`New Team for ${req.params.gameId}: ${req.body.teamName}`);

      const newTeam = await teams.createTeam(setTeamData({
        data: {
          confirmed:        false,
          registrationDate: new Date()
        }
      }), req.params.gameId);

      logger.info(`Saved Team for ${req.params.gameId}: ${req.body.teamName} / ${newTeam.uuid}`);
      sendInfoMail(gameData.gameplay, newTeam, {newTeam: true}, err => {
        if (err) {
          logger.error(err);
        }
        res.status(200).send(newTeam);
      });
    } else {
      // Existing team
      const savedTeam = await teams.updateTeam(setTeamData(team));
      logger.info(`Saved Team for ${req.params.gameId}: ${req.body.teamName} / ${savedTeam.uuid}`);
      sendInfoMail(gameData.gameplay, savedTeam, {newTeam: false}, err => {
        if (err) {
          logger.error(err);
        }
        res.status(200).send(savedTeam);
      });
    }
  }
  catch (err) {
    logger.error('POST /', err);
    res.status(500).send({message: err.message});
  }
});


/**
 * Sends the signup mail
 * @param gameplay
 * @param team
 * @param options
 * @param callback
 */
function sendInfoMail(gameplay, team, options, callback) {

  let html    = '';
  let text    = '';
  let subject = '';
  if (options.newTeam) {
    subject = 'Neue Ferropoly Anmeldung';
    html += '<h1>Neue Ferropoly Anmeldung</h1>';
    html += `<p>${team.data.teamLeader.name} meldet sich mit dem Team "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" an.</p>`;
    html += '<p>Bite bestätige diese Anmeldung in der Ferropoly Editor App.</p>';

    text += `${team.data.teamLeader.name} meldet sich mit dem Team "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" an.\n`;
    text += 'Bitte bestätige diese Anmeldung in der Ferropoly Editor App.\n';
  } else {
    subject = 'Bearbeitete Ferropoly Anmeldung';
    html += '<h1>Bearbeitete Ferropoly Anmeldung</h1>';
    html += `<p>${team.data.teamLeader.name} hat die Anmeldung des Teams "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" bearbeitet.</p>`;
    html += '<p>Die Änderungen kannst Du in der Ferropoly Editor App anschauen.</p>';

    text += `${team.data.teamLeader.name} hat die Anmeldung des Teams "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" bearbeitet.\n`;
    text += 'Die Änderungen kannst Du in der Ferropoly Editor App anschauen.\n';
  }


  html += '<p></p>';
  html += '<p>Bitte auf dieses Mail nicht antworten, Mails an diese Adresse werden nicht gelesen. Infos und Kontakt zum Ferropoly:<a href="http://www.ferropoly.ch">www.ferropoly.ch</a></p>';
  text += 'Bitte auf dieses Mail nicht antworten, Mails an diese Adresse werden nicht gelesen. Infos und Kontakt zum Ferropoly: www.ferropoly.ch\n';

  logger.info('Mailtext created', text);
  mailer.send({
    to:      gameplay.owner.organisatorEmail,
    cc:      team.data.teamLeader.email,
    subject: subject,
    html:    html,
    text:    text
  }, callback);
}


module.exports = router;
