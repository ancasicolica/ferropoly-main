/**
 * Cron jobs for the main program
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.04.23
 **/
const schedule  = require('node-schedule');
const autopilot = require('./autopilot');
const logger    = require('../../common/lib/logger').getLogger('cronjobs');
const settings  = require('../settings');
const _         = require('lodash');

/**
 * Cron job for the autopilot refresher
 */
function setupAutopilotRefresher() {
  if (_.get(settings, 'autopilot.enabled')) {
    try {
      schedule.scheduleJob('autopilotRefesher', '0 3 * * *', function () {
        logger.info('Cronjob autopilot refresher');
        autopilot.refreshActiveGames();
      });
    }
    catch (err) {
      logger.error('Error in mainCronjobs.setupAutopilotRefresher', err);
    }
  }
}

/**
 * The exports
 * @type {{init: Function}}
 */
module.exports = {
  init: function () {
    setupAutopilotRefresher();
  }
};
