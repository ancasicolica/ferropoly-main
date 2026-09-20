/**
 * Routes on a map
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.01.2026
 **/
import EventEmitter from '../common/lib/eventEmitter';
import {useTravelLogStore} from './store/TravelLogStore';
import {useTeamsStore} from './store/TeamsStore';
import {createAdvancedFontAwesomeMarker} from './SvgMarkers.js';
import {faLocationDot} from '@fortawesome/free-solid-svg-icons';

class MapRoutes extends EventEmitter {
  constructor() {
    super();
    this.map            = null;
    this.routes         = new Map(); // Stores routes by a unique ID
    this.markers        = new Map(); // Stores position markers by teamId
    this.googleInstance = null;
    this.travelLogStore = useTravelLogStore();
    this.teamsToShow    = []; // Team Ids to filter on
    this.teamsStore     = useTeamsStore();
  }

  /**
   * Sets the map
   * @param map
   */
  setMap(map) {
    this.map = map;
  }

  /**
   * Sets the google instance
   * @param instance
   */
  setGoogleInstance(instance) {
    console.log('Google instance set', instance);
    this.googleInstance = instance;
  }

  /**
   * Adds a route to the map.
   * @param {string} teamId - Unique ID for the route (which is the teamId).
   * @param {Object} options - Options for the Polyline (e.g., strokeColor, strokeWeight).
   */
  showRoute(teamId, options = {}) {
    if (!this.map || !this.googleInstance) {
      // console.warn('Map or Google instance not set. Cannot add route.', this.map, this.googleInstance);
      return false;
    }

    if (this.routes.get(teamId)) {
      this.removeRoute(teamId);
    }

    const travelLog = this.travelLogStore.getLogForTeam(teamId);
    const path      = [];
    for (const log of travelLog) {
      path.push(log.position);
    }

    const color = this.teamsStore.idToColor(teamId);

    const defaultOptions = {
      strokeColor:   color,
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

    const lastElement = travelLog.slice(-1);
    if (lastElement.length > 0) {
      const position = lastElement[0].position;
      let marker = createAdvancedFontAwesomeMarker({
        AdvancedMarkerElement: this.googleInstance.AdvancedMarkerElement,
        faIcon:                faLocationDot,
        color:                 color,
        stroke:                '#000000',
        strokeWidth:           25,
        size:                  24,
        position:              {
          lat: parseFloat(position.lat),
          lng: parseFloat(position.lng)
        },
        map:                   this.map
      });
      this.markers.set(teamId, marker);
    }

    return true;
  }

  /**
   * Removes a route from the map.
   * @param {string} id - Unique ID of the route to remove.
   */
  removeRoute(id) {
    const polyline = this.routes.get(id);
    console.log('removeRoute', id, polyline);
    if (polyline) {
      polyline.setMap(null);
      this.routes.delete(id);
    }
    const marker = this.markers.get(id);
    if (marker) {
      marker.map = null;
      this.markers.delete(id);
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
    this.markers.forEach(marker => {
      marker.map = null;
    });
    this.markers.clear();
  }

  refreshRoutes() {
    for (const teamId of this.teamsToShow) {
      this.showRoute(teamId);
    }
  }

  /**
   * Applies the team filter: all teams in the param are displayed
   * @param teams
   */
  applyTeamFilter(teams) {
    const teamsToAdd    = teams.filter(teamId => !this.teamsToShow.includes(teamId))
    const teamsToRemove = this.teamsToShow.filter(teamId => !teams.includes(teamId));

    for (const teamId of teamsToAdd) {
      this.teamsToShow.push(teamId);
    }
    for (const teamId of teamsToRemove) {
      this.teamsToShow = this.teamsToShow.filter(_teamId => _teamId !== teamId);
      this.removeRoute(teamId);
    }
    this.refreshRoutes();
    console.log('applyTeamFilter', teamsToAdd, teamsToRemove, this.teamsToShow);
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
