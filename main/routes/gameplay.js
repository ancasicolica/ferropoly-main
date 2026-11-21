/**
 * New Game
 * Created by kc on 29.01.15.
 */

const express = require('express');
const router = express.Router();

const getGameInfoHandler = require('../../common/lib/getGameInfoHandler');


/* GET data of a specific gameplay */
router.get('/info/:gameId', getGameInfoHandler);

/**
 * The exports: an init function only
 * @type {{init: Function}}
 */
module.exports = {
  init: function (app) {
    app.use('/gameplay', router);
  },
};
