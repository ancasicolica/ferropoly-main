#!/usr/bin/env node
const {DateTime} = require('luxon');
const {CronJob}  = require('cron');

let scheduledTs = DateTime.now().minus({seconds: 1});
try {
  const job =
          CronJob.from({
              cronTime:     scheduledTs.set({ 'milliseconds': 0}),
              onTick:       () => {
                console.log('done');
              },
              start:        true,
              timezone:     'Europe/Berlin',
              errorHandler: err => {
                console.log('err', err)
              },
              runOnInit:    false,
              name:         `event test`,
              threshold:    3000  // 3 seconds tolerance - the job with 1 sec in past should be fired immediately
            }
          );
}
catch (err) {
  console.error('Error while creating CronJob', err);
}
