/**
 * Geolocation for Ferropoly
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.07.21
 **/

import {ref, readonly} from 'vue';
import EventEmitter from '../../../common/lib/eventEmitter';
import {get} from 'lodash';

// Switch to slow scan once accuracy is better than this (meters)
const ACCURACY_THRESHOLD_M        = 50;
// Maximum time spent in fast acquisition mode before falling back to slow scan
const FAST_ACQUISITION_TIMEOUT_MS = 60000;
// Interval for the slow scan phase
const SLOW_SCAN_INTERVAL_MS       = 30000;

/**
 * Returns true if the current device is a mobile device (phone or tablet).
 * Geolocation is only meaningful on devices carried by the user.
 * @returns {boolean}
 */
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Composable providing GPS geolocation, restricted to mobile devices only.
 *
 * Tracking runs in two phases:
 *   1. Fast acquisition: watchPosition pushes updates as GPS lock improves.
 *      Ends when accuracy <= ACCURACY_THRESHOLD_M or after FAST_ACQUISITION_TIMEOUT_MS.
 *   2. Slow scan: getCurrentPosition every SLOW_SCAN_INTERVAL_MS.
 *
 * Emits 'player-position-update' on success and 'player-position-error' on failure.
 */
export function useGeograph() {
  const position = ref(null);
  const emitter  = new EventEmitter();

  /**
   * Updates the reactive position and emits the appropriate event.
   * @param {GeolocationPosition|null} geoLocationPosition
   */
  const setPosition = (geoLocationPosition) => {
    if (!geoLocationPosition) {
      position.value = null;
      emitter.emit('player-position-error');
    } else {
      position.value = {
        lat:      get(geoLocationPosition, 'coords.latitude', 0),
        lng:      get(geoLocationPosition, 'coords.longitude', 0),
        accuracy: get(geoLocationPosition, 'coords.accuracy', 1000)
      };
      emitter.emit('player-position-update', position.value);
    }
  };

  /**
   * Handles geolocation errors uniformly.
   * @param {GeolocationPositionError} err
   */
  const handleError = (err) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        console.warn('GPS: User denied the request for Geolocation.');
        setPosition(null);
        break;
      case err.POSITION_UNAVAILABLE:
        console.warn('GPS: Location information is unavailable.');
        break;
      case err.TIMEOUT:
        console.warn('GPS: The request to get user location timed out.');
        break;
      default:
        console.error('GPS: An unknown error occurred.');
        break;
    }
  };

  /**
   * Phase 2: Polls position once every SLOW_SCAN_INTERVAL_MS using getCurrentPosition.
   */
  const startSlowScan = () => {
    console.log(`GPS: Entering slow scan mode (interval: ${SLOW_SCAN_INTERVAL_MS / 1000}s).`);
    setInterval(() => {
      navigator.geolocation.getCurrentPosition(setPosition, handleError, {
        maximumAge:         SLOW_SCAN_INTERVAL_MS,
        enableHighAccuracy: true
      });
    }, SLOW_SCAN_INTERVAL_MS);
  };

  /**
   * Starts GPS tracking with two phases for maximum responsiveness:
   *
   *   Phase 1 — Fast acquisition: uses watchPosition so the OS pushes each
   *   improvement in GPS lock immediately. Ends as soon as accuracy reaches
   *   ACCURACY_THRESHOLD_M, or after FAST_ACQUISITION_TIMEOUT_MS.
   *
   *   Phase 2 — Slow scan: periodic getCurrentPosition every SLOW_SCAN_INTERVAL_MS.
   *
   * Does nothing on non-mobile devices.
   */
  const startTracking = () => {
    if (!isMobileDevice()) {
      console.log('GPS: Geolocation is only available on mobile devices.');
      return;
    }

    if (!navigator.geolocation) {
      console.log('GPS: Geolocation is not supported by this browser.');
      setPosition(null);
      return;
    }

    console.log('GPS: Starting fast acquisition phase.');

    let watchId   = null;
    let timeoutId = null;

    const endFastPhase = (reason) => {
      if (watchId === null) return; // already stopped
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      clearTimeout(timeoutId);
      timeoutId = null;
      console.log(`GPS: Fast acquisition ended (${reason}), switching to slow scan.`);
      startSlowScan();
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        if (pos.coords.accuracy <= ACCURACY_THRESHOLD_M) {
          endFastPhase(`accuracy ${Math.round(pos.coords.accuracy)}m ≤ ${ACCURACY_THRESHOLD_M}m`);
        }
      },
      (err) => {
        handleError(err);
        endFastPhase('error');
      },
      {maximumAge: 0, enableHighAccuracy: true}
    );

    // Fallback: leave fast mode after timeout even if accuracy goal was never reached
    timeoutId = setTimeout(() => endFastPhase('timeout'), FAST_ACQUISITION_TIMEOUT_MS);
  };

  /**
   * One-time position request — useful for manual refresh outside the tracking cycle.
   * Does nothing on non-mobile devices.
   */
  const localize = () => {
    if (!isMobileDevice()) {
      console.log('GPS: Geolocation is only available on mobile devices.');
      return;
    }
    if (!navigator.geolocation) {
      setPosition(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(setPosition, handleError, {
      maximumAge:         0,
      enableHighAccuracy: true
    });
  };

  /**
   * Returns whether the current position is valid.
   * @returns {boolean}
   */
  const positionIsValid = () => {
    return position.value !== null && position.value.lat !== 0;
  };

  /**
   * Returns the last known position.
   * @returns {object|null}
   */
  const getLastLocation = () => {
    return position.value;
  };

  return {
    position:     readonly(position),
    isMobile:     isMobileDevice(),
    localize,
    startTracking,
    positionIsValid,
    getLastLocation,
    on:           (event, handler) => emitter.on(event, handler),
    off:          (event, handler) => emitter.off(event, handler)
  };
}

// Singleton instance for app-wide use
const geograph = useGeograph();

export default geograph;
