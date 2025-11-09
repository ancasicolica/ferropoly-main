/**
 * The game property list contains all properties of the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.11.2025
 **/
import {get, maxBy, minBy} from 'lodash';

class GamePropertyList {
  constructor() {
    this.properties = new Map();
    this.bounds     = {
      north: 0,
      south: 0,
      east:  0,
      west:  0
    };
    this.activeProperty = null; // currently selected property, only one possible

  }

  /**
   * Returns the bounds of the properties, the most north, east, west and south point
   * @return {*|{north: number, south: number, east: number, west: number}}
   */
  getBounds() {
    if (this.bounds.north === 0) {
      // Convert Map to array to use lodash's maxBy/minBy
      const values = [...this.properties.values()];
      if (values.length === 0) {
        // No properties available; keep defaults
        return this.bounds;
      }
      this.bounds.north = parseFloat(
        maxBy(values, p => parseFloat(get(p, 'location.position.lat', 45.82))).location.position.lat
      );
      this.bounds.south = parseFloat(
        minBy(values, p => parseFloat(get(p, 'location.position.lat', 47.8))).location.position.lat
      );
      this.bounds.east = parseFloat(
        maxBy(values, p => parseFloat(get(p, 'location.position.lng', 5.8))).location.position.lng
      );
      this.bounds.west = parseFloat(
        minBy(values, p => parseFloat(get(p, 'location.position.lng', 10.5))).location.position.lng
      );
    }
    return this.bounds;

  }

  /**
   * Returns the center of the properties
   * @return {{lat: number, lng: number}}
   */
  getCenter() {
    if (this.bounds.north === 0) {
      this.getBounds();
    }
    return {
      lat: this.bounds.south + (this.bounds.north - this.bounds.south) / 2,
      lng: this.bounds.west + (this.bounds.east - this.bounds.west) / 2
    }
  }


  /**
   * Adds a property to the internal properties collection using its unique identifier (UUID) as the key.
   *
   * @param {Object} property - The property to add to the collection. The property must include a `uuid` property for identification.
   * @return {void} Does not return any value.
   */
  push(property) {
    this.properties.set(property.uuid, property);
  }

  /**
   * Displays or hides all property markers on the provided map.
   * Each property marker will be set to the specified map instance.
   *
   * @param {Map|null} map The map instance on which the markers will be displayed.
   *                       Set to null to remove all property markers from the map.
   * @return {void} Does not return a value.
   */
  showAllPropertiesOnMap(map) {
    for (const p of this.properties.values()) {
      // p is a property instance
      p.setMap(map); // map can be a Map instance or null to hide markers
    }
  }

  test() {
    const gd = [...this.properties.values()][0];

    console.log(gd.gamedata, gd.getGameData());
  }
}

export default GamePropertyList;
