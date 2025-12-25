/**
 * This scheduler watches for events of the gameplays:
 *
 * - Start of the game
 * - Interest rounds
 * - End of the game
 *
 * Created by kc on 19.04.15.
 */


const eventRepo    = require('../../common/models/schedulerEventModel');
const EventEmitter = require('events').EventEmitter;
const {CronJob}    = require('cron');
const {DateTime}   = require('luxon');
const gameCache    = require('./gameCache');
const logger       = require('../../common/lib/logger').getLogger('gameScheduler');
const settings     = require('../settings');

/**
 * Constructor of the scheduler
 * @constructor
 */
class Scheduler extends EventEmitter {
  constructor(_settings) {
    super();
    logger.info('initializing scheduler');
    EventEmitter.call(this);

    this.settings = _settings;
    if (!this.settings.scheduler) {
      this.scheduler = {delay: 15};
    }
    this.jobs      = [];
    this.updateJob = undefined;

    new CronJob('0 1 0 * * *',
      function () {
        // Update cache at start of the day
        gameCache.refreshCache().catch(err => {
          logger.error('Error in refreshCache', err);
        });
      },
      null,
      true,
      'Europe/Berlin')
  }

  /**
   * Handles an event: the event is requested from the DB for this instance, if this fails,
   * another instance is handling it
   * @param channel
   * @param event
   */
  handleEvent(channel, event) {
    let self = this;
    logger.info('Handling event ' + event._id + ' for ' + channel, event);
    eventRepo.requestEventSave(event, self.settings.server.serverId).then(ev => {
      if (!ev) {
        logger.info('Event already handled by other instance: ' + event._id + ' for ' + channel);
        return;
      }
      logger.info('event handled by this instance: ' + event._id + ' for ' + channel);
      // Now emit the event. The event callback is attached, without calling this callback, the
      // event won't be marked as solved!
      ev.callback = self.handleEventCallback;
      self.emit(channel, ev);
    }).catch(err => {
      logger.error('Error while handling event: ' + event._id + ' message: ' + err.message, err);
    });
  };

  /**
   * After handling an event it has to be marked as 'solved' by the designated handler by
   * calling this callback (found in event.callback)
   * @param err
   * @param event
   */
  handleEventCallback(err, event) {
    if (err) {
      logger.warn('Error in event handler callback', {event, err});
      return;
    }
    eventRepo.saveAfterHandling(event).then(() => {
      logger.debug(`${event.gameId}: Event handling "${event.type}" finished. Message:" "${event.message}"`, {id: event._id, timestamp: event.timestamp});
    }).catch(err => {
      logger.error('Error while saving handled event', {event, err});
    });
  };

  /**
   * Update: load all events of next few hours.
   * @param callback
   */
  update(callback) {
    logger.info('Scheduler update');
    let self = this;
    let i;
    eventRepo.getUpcomingEvents().then(events => {
      logger.info('Events read: ' + events.length, events);

      // Cancel all existing jobs
      for (i = 0; i < self.jobs.length; i++) {
        self.jobs[i].stop();
      }
      self.jobs = [];

      if (events.length > 0) {
        const now = DateTime.now();

        let handlerFunction = function (ev) {
          logger.info(`${ev.gameId}: Emitting event type:${ev.type} id:${ev._id}`);
          self.handleEvent(ev.type, ev);
        };

        for (i = 0; i < events.length; i++) {
          let event = events[i];
          logger.debug(`${events[i].gameId}: upcoming Event "${events[i].type}"`, events[i]);

          if (event.timestamp < now) {
            logger.info(`${event.gameId}: Emit an old event:${event._id}`, event);
            self.handleEvent(event.type, event);
          } else {
            logger.info(`${event.gameId}: Push event in joblist:${event._id} @ ${event.timestamp}`, event);
            let scheduledTs = DateTime.fromJSDate(event.timestamp).plus({seconds: self.settings.scheduler.delay});
            self.jobs.push(
              new CronJob(scheduledTs.toJSDate(),
                handlerFunction.bind(null, event),
                null,
                true,
                'Europe/Berlin'));
          }
        }
      }

      // Start the next update job
      if (self.updateJob) {
        self.updateJob.stop();
      }
      // Update once an hour
      self.updateJob = new CronJob(
        '* 53 * * * *',
        function () {
          self.update(function (err) {
            if (err) {
              logger.error('SCHEDULER UPDATE FAILED!', err);
            }
          })
        },
        null,
        true,
        'Europe/Berlin');
    }).finally(callback);

  };

  /**
   * Request a specific event for handling it
   * @param event
   * @param callback
   */
  requestEventSave(event, callback) {
    eventRepo.requestEventSave(event, this.settings.serverId).then(ev => {
      callback(null, ev);
    }).catch(callback);
  };

  /**
   * Mark an event as handled
   * @param event
   * @param callback
   */
  markEventHandled(event, callback) {
    eventRepo.saveAfterHandling(event).then(ev => {
      callback(null, ev);
    }).catch(callback);
  };
}

/*
 What needs to be done:
 - load all gameplays, get the next event
 - subscribe to this event and handle it
 - when handling it, subscribe to the next event

 Design it as event emitter or do we all here?
 */
const gameScheduler = new Scheduler(settings);
module.exports      = gameScheduler;
