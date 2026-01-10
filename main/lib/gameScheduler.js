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
const schedule     = require('node-schedule');
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
    const self    = this;
    this.settings = _settings;
    if (!this.settings.scheduler) {
      this.scheduler = {delay: 15};
    }
    this.jobs = [];

    try {
      this.refreshCronJob = schedule.scheduleJob('refreshJob', '1 0 * * *', function () {
        // Update cache at start of the day
        gameCache.refreshCache().catch(err => {
          logger.error('Error in refreshCache (cronjob)', err);
        });
      });

      this.updateJob = schedule.scheduleJob('updateJob', '53 0/3 * * *', function () {
        // // Update every 3 hours
        self.update();
      });
    }
    catch (err) {
      logger.error('Error in Scheduler constructor', err);
    }
  }

  /**
   * The error handler for cron jobs
   * @param err
   */
  cronErrorHandler(err) {
    logger.error('Error in cron job', err);
  }

  /**
   * Retrieves a list of all cron jobs managed by the system.
   * The method returns an array that combines existing jobs,
   * an update job, and a refresh cron job.
   *
   * @return {Array} An array containing all cron jobs.
   */
  getCronJobs() {
    return [...this.jobs, this.updateJob, this.refreshCronJob];
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
        logger.debug(`${event.gameId}: Event handling '${event.type}'finished. Message: '${event.message}'`, {
          id: event._id,
          timestamp:
              event.timestamp
        });
      }
    ).catch(err => {
      logger.error('Error while saving handled event', {event, err});
    });
  };

  /**
   * Update: load all events of the next few hours.
   * @param callback
   */
  update(callback) {
    logger.info('Scheduler update');
    let self = this;
    let i;
    // this returns the events for the next 4 hours
    eventRepo.getUpcomingEvents().then(events => {
      logger.info('Events read: ' + events.length, events);

      // Cancel all existing jobs
      try {
        for (i = 0; i < self.jobs.length; i++) {
          self.jobs[i].cancel();
        }
      }
      finally {
        self.jobs = [];
      }

      if (events.length > 0) {
        const now = DateTime.now().plus({seconds: 3});

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
            let scheduledTs = DateTime.fromJSDate(event.timestamp).set({millisecond: 0}).plus({seconds: self.settings.scheduler.delay});
            try {
              self.jobs.push(schedule.scheduleJob(event._id, scheduledTs.toJSDate(), handlerFunction.bind(null, event)));
            }
            catch (err) {
              logger.error(`Error in Scheduler.update with entry ${scheduledTs.toJSDate()}`, err);
            }
          }
        }
      }
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
