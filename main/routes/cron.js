/**
 * Returns the cron jobs for a game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 31.12.2025
 **/

const express             = require('express');
const router              = express.Router();
const schedulerEventModel = require('../../common/models/schedulerEventModel');

router.get('/:gameId', async (req, res) => {

  try {
    const cronJobs = await schedulerEventModel.getEvents(req.params.gameId);
    return res.send({cronJobs});
  }
  catch (err) {
    res.status(500).send({message: err.message});
  }
})

module.exports = router;
