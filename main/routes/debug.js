/**
 * Debugging route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.12.2025
 **/
const express       = require('express');
const router        = express.Router();
const gameScheduler = require('../lib/gameScheduler');

router.get('/cron', (req, res) => {
  const cronJobs = gameScheduler.getCronJobs();
  const retVal   = [];
  cronJobs.forEach(job => {
    try {
      retVal.push({name: job.name, nextDates: job.nextDates(3), lastDate: job.lastDate(), active: job.isActive});
    }
    catch (err) {
      retVal.push({name: job.name, active: job.isActive, lastDate: job.lastDate(), err: err.message});
    }

  })

  res.send(retVal);
})

module.exports = router;
