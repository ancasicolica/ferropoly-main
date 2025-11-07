/**
 * Reception route
 * Created by kc on 10.05.15.
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
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'reception.html'));
  }
  catch (err) {
    return errorHandler(res, 'Interner Fehler', err, 500);
  }
});

module.exports = router;
