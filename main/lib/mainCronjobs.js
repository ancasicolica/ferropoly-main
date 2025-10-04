/**
 * Cron jobs for the main program
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.04.23
 **/
const {CronJob} = require('cron');
const autopilot = require('./autopilot');
const logger    = require('../../common/lib/logger').getLogger('cronjobs');
const settings  = require('../settings');
const _         = require('lodash');

/**
 * Cron job for the autopilot refresher
 */
function setupAutopilotRefresher() {
  if (_.get(settings, 'autopilot.enabled')) {
    new CronJob('0 0 3 * * *',
      function () {
        logger.info('Cronjob autopilot refresher');
        autopilot.refreshActiveGames();
      },
      null,
      true,
      'Europe/Berlin')
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
