/**
 * Routes on a map
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.01.2026
 **/
import EventEmitter from '../common/lib/eventEmitter';
import {useTravelLogStore} from './store/TravelLogStore';


class MapRoutes extends EventEmitter {
  constructor() {
    super();
    this.map            = null;
    this.routes         = new Map(); // Stores routes by a unique ID
    this.googleInstance = null;
    this.travelLogStore = useTravelLogStore();
  }

  setMap(map) {
    this.map = map;
  }

  setGoogleInstance(instance) {
    this.googleInstance = instance;
  }

  /**
   * Adds a route to the map.
   * @param {string} teamId - Unique ID for the route (which is the teamId).
   * @param {Object} options - Options for the Polyline (e.g., strokeColor, strokeWeight).
   */
  showRoute(teamId, options = {}) {
    if (!this.map || !this.googleInstance) {
      console.warn('Map or Google instance not set. Cannot add route.');
      return;
    }

    if (this.routes.get(teamId)) {
      this.removeRoute(teamId);
    }

    const travelLog = this.travelLogStore.getLogForTeam(teamId);
    const path      = [];
    for (const log of travelLog) {
      path.push(log.position);
    }

    const defaultOptions = {
      strokeColor:   '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight:  4,
      map:           this.map,
    };

    const polyline = new this.googleInstance.Polyline({
      path: path,
      ...defaultOptions,
      ...options,
    });

    this.routes.set(teamId, polyline);
  }

  /**
   * Removes a route from the map.
   * @param {string} id - Unique ID of the route to remove.
   */
  removeRoute(id) {
    const polyline = this.routes.get(id);
    if (polyline) {
      polyline.setMap(null);
      this.routes.delete(id);
    }
  }

  /**
   * Clears all routes from the map.
   */
  clearAllRoutes() {
    this.routes.forEach(polyline => {
      polyline.setMap(null);
    });
    this.routes.clear();
  }

}

let instance = null;

function getMapRoutesInstance() {
  if (!instance) {
    console.log('Creating MapRoutes Instance');
    instance = new MapRoutes();
  }
  return instance;

}

export {MapRoutes, getMapRoutesInstance}
