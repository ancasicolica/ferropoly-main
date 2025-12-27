/**
 * The library for gameplay things in the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.12.2025
 **/

import {DateTime} from 'luxon';

function createLuxonDate(value) {
  if (value instanceof DateTime) {
    return value;
  }
  if (value instanceof Date) {
    return DateTime.fromJSDate(value);
  }
  return DateTime.fromISO(value);
}

export function gameActive(gameplay) {
  const start = createLuxonDate(gameplay.scheduling.gameStartTs);
  const end   = createLuxonDate(gameplay.scheduling.gameEndTs);
  const now   = DateTime.now();

  return now >= start && now <= end;
}
