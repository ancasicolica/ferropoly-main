/**
 * A store for cron jobs
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 31.12.2025
 **/

import {defineStore} from 'pinia'
import {ref} from 'vue';
import axios from 'axios';
import {DateTime} from 'luxon';

export const useCronJobStore = defineStore('CronJob', () => {
  const cronJobs = ref([]);

  async function fetch(gameId) {
    try {
      const resp = await axios.get(`/cron/${gameId}`);
      for (const job of resp.data.cronJobs) {
        job.timestamp = DateTime.fromISO(job.timestamp);
        cronJobs.value.push(job);
      }
      console.log('got cron jobs', cronJobs.value);
    }
    catch (err) {
      console.log(err);
      cronJobs.value = [];
    }
  }

  function getNextCronJob() {
    const now = DateTime.now();
    return cronJobs.value.find(job => job.timestamp > now);
  }

  return {cronJobs, fetch, getNextCronJob};
})
