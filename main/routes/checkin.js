/**
 * Checkin-Route for the teams
 * Created by kc on 08.01.16.
 */

const express          = require('express');
const router           = express.Router();
const errorHandler     = require('../lib/errorHandler');
const gameCache        = require('../lib/gameCache');
const path             = require('path');

/**
 * Send HTML Page
 */
router.get('/:gameId', async function (req, res) {
  try {
    const gameData = await gameCache.getGameData(req.params.gameId);
    if (!gameData) {
      return errorHandler(res, 'Spiel nicht gefunden.', null, 404);
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'checkin.html'));
  }
  catch (err) {
    return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
  }
});

module.exports = router;

