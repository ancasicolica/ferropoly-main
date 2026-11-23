/**
 * Handler in main for challenges
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.11.2026
 **/
const logger = require('../../../common/lib/logger').getLogger('challengeHandler');

const {CHALLENGE_START, CHALLENGE_HALF_TIME, CHALLENGE_END} = require('../../../common/lib/schedulerEventTypes');

const init = function (scheduler) {
  scheduler.on(CHALLENGE_START, async function (event) {
    try {
      logger.info('CHALLENGE_START detected, no handling yet');
      event.callback(null, event);
    }
    catch (err) {
      event.callback(err, event);
    }
  });

  scheduler.on(CHALLENGE_HALF_TIME, async function (event) {
    try {
      logger.info('CHALLENGE_HALF_TIME detected, no handling yet');
      event.callback(null, event);
    }
    catch (err) {
      event.callback(err, event);
    }
  });

  scheduler.on(CHALLENGE_END, async function (event) {
    try {
      logger.info('CHALLENGE_END detected, no handling yet');
      event.callback(null, event);
    }
    catch (err) {
      event.callback(err, event);
    }
  });

}

module.exports = {
  init
}
