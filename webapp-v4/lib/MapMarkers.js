/**
 * A library for Google Maps markers
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.11.2025
 **/

import {usePropertyStore} from './store/PropertyStore';
import mapLoader from '../common/lib/googleLoader';
import EventEmitter from '../common/lib/eventEmitter';
import {get, maxBy, minBy} from 'lodash';
import {toRaw} from 'vue';
import {faHouse} from '@fortawesome/free-solid-svg-icons';
import {createAdvancedFontAwesomeMarker} from './SvgMarkers.js';
import {useTeamsStore} from './store/TeamsStore';
import {booleanYesNo, buildingStatus, formatAccessibility, formatGameTime, formatPrice} from '../common/lib/formatters';
import {MARKER_MODE_INFO, MARKER_MODE_RECEPTION} from './constants/markerMode';
import {getMapRoutesInstance} from './MapRoutes';

class MapMarkers extends EventEmitter {
  // The Icons to use
  static ICON_EDIT_LOCATION     = '/images/markers/selected.png';
  static ICON_TRAIN_LOCATION    = '/images/markers/z-neutral.png';
  static ICON_BUS_LOCATION      = '/images/markers/b-neutral.png';
  static ICON_BOAT_LOCATION     = '/images/markers/s-neutral.png';
  static ICON_CABLECAR_LOCATION = '/images/markers/v-neutral.png';
  static ICON_OTHER_LOCATION    = '/images/markers/v-neutral.png';

  static ICON_PRICE_LABELS           = ['01.png', '02.png', '03.png', '04.png', '05.png', '06.png', '07.png', '08.png',
                                        '09.png', '10.png'];
  static ICON_TRAIN_LOCATION_USED    = '/images/markers/32-b/z-';
  static ICON_BUS_LOCATION_USED      = '/images/markers/32-b/b-';
  static ICON_BOAT_LOCATION_USED     = '/images/markers/32-b/s-';
  static ICON_CABLECAR_LOCATION_USED = '/images/markers/32-b/v-';
  static ICON_OTHER_LOCATION_USED    = '/images/markers/32-b/v-';

  constructor() {
    super();

    this.propertyStore = null;
    this.markers       = new Map();
    this.bounds        = {
      north: 0,
      south: 0,
      east:  0,
      west:  0
    };
    this.ready         = false;
    this.teamsStore    = useTeamsStore();
    this.infoWindow    = null;
    this.map           = null;
  }

  /**
   * Initializes the application by loading the map instance, creating markers for properties,
   * and setting up relevant event listeners. This method populates the internal markers and prepares
   * the map for interaction.
   *
   * @return {Promise<void>} A promise that resolves when the initialization is complete,
   * indicating that the API is loaded, markers are created, and the application is ready.
   */
  async init() {
    const self     = this;
    const instance = await mapLoader.getInstance();

    this.propertyStore  = usePropertyStore();
    self.googleInstance = instance;
    getMapRoutesInstance().setGoogleInstance(instance);
    console.log('Api loaded, creating default markers');
    console.log('PropertyStore has', this.propertyStore.properties.size, 'properties');

    for (let prop of this.propertyStore.properties.values()) {
      //console.log('Creating marker for property:', prop.location.name, prop.uuid);

      let marker = new instance.AdvancedMarkerElement({
        position: {
          lat: parseFloat(prop.location.position.lat),
          lng: parseFloat(prop.location.position.lng)
        },
        map:      null,
        title:    prop.location.name,
      });
      //  console.log(`Marker set for ${marker.title}, ${marker.position.lat}`)
      marker.addListener('click', () => {
        self.emit('property-selected', prop);
      })
      self.markers.set(prop.uuid, marker);
    }
    this.infoWindow = new this.googleInstance.InfoWindow();
    console.log('Created', self.markers.size, 'markers');
    this.ready = true;
  }

  setMap(map) {
    this.map = map;
  }

  /**
   * Returns the bounds of the properties, the most north, east, west and south point
   * @return {*|{north: number, south: number, east: number, west: number}}
   */
  getBounds() {
    if (this.bounds.north === 0) {
      // Convert Map to array to use lodash's maxBy/minBy
      const values = [...this.markers.values()];
      if (values.length === 0) {
        // No properties available; keep defaults
        return this.bounds;
      }
      this.bounds.north = parseFloat(
        maxBy(values, p => parseFloat(get(p, 'position.lat', 45.82))).position.lat
      );
      this.bounds.south = parseFloat(
        minBy(values, p => parseFloat(get(p, 'position.lat', 47.8))).position.lat
      );
      this.bounds.east  = parseFloat(
        maxBy(values, p => parseFloat(get(p, 'position.lng', 5.8))).position.lng
      );
      this.bounds.west  = parseFloat(
        minBy(values, p => parseFloat(get(p, 'position.lng', 10.5))).position.lng
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
   * Applies a filter to map markers based on their associated properties' visibility.
   * Updates the marker's visibility and content on the map.
   *
   * @param {Object} _map - The map instance that the markers should be applied to.
   * @return {void} This method does not return a value.
   */
  applyFilter(_map = null) {
    if (!this.ready) {
      console.log('not ready for applyFilter yet');
      return;
    }

    if (!_map) {
      _map = this.map;
    }
    const map            = toRaw(_map);
    const self           = this;
    const showAsCategory = self.propertyStore.showMarkersAsCategory;
    const markerMode     = self.propertyStore.markerMode;

    console.log('APPLY FILTER called', map);

    let visibleCount   = 0;
    let removedMarkers = 0;
    let addedMarkers   = 0;
    for (const marker of self.markers) {
      const prop = self.propertyStore.properties.get(marker[0]);
      // console.log(marker, prop);
      if (prop) {
        if (prop.visibleOnMap) {
          // Display marker on map
          const oldMarker = this.markers.get(prop.uuid)
          if (oldMarker) {
            oldMarker.map = null;
            oldMarker.remove();
            removedMarkers++;
          }

          // IMPORTANT: Set content BEFORE adding to map!
          const newMarker = this.createMarker(prop, {showAsCategory, markerMode});
          newMarker.map   = map;
          this.markers.set(prop.uuid, newMarker);
          addedMarkers++;
          visibleCount++;
          if (self.propertyStore.debugOutput) {
            console.log(`  ✓ Marker ${prop.location.name} set to visible`);
          }
        } else {
          // Hide marker on map
          if (self.propertyStore.debugOutput) {
            console.log(`  ○ Marker ${prop.location.name} hidden (visibleOnMap=false)`);
          }
          marker[1].map = null;
          marker[1].remove();
          removedMarkers++;
        }
      } else {
        console.warn('No fit for marker in properties', marker);
      }
    }
    console.log(`APPLY FILTER complete: ${visibleCount} markers visible. added:${addedMarkers} removed:${removedMarkers}`);
  }

  /**
   * Creates the marker for the property
   * @param property
   * @param options
   * @return {HTMLImageElement|null}
   */
  createMarker(property, options = {}) {
    const self = this;
    const {
            showAsCategory = false,
            markerMode     = MARKER_MODE_INFO
          }    = options;

    let marker;

    if (property?.gamedata.owner) {
      // -----------------------------------
      // Owned properties are "simple", just display the icon for an owned property in the team color
      // As the store controls whether the gamedata is loaded or not (and for which groups), there
      // must be no separate check for displaying the gamedata markers.
      marker = createAdvancedFontAwesomeMarker({
        AdvancedMarkerElement: this.googleInstance.AdvancedMarkerElement,
        faIcon:                faHouse,
        color:                 self.teamsStore.idToColor(property.gamedata.owner),

        size:         24,
        position:     {
          lat: parseFloat(property.location.position.lat),
          lng: parseFloat(property.location.position.lng)
        },
        map:          null,
        gmpClickable: true
      });
    } else {
      // -----------------------------------
      // Generic Markers for free properties
      marker = new this.googleInstance.AdvancedMarkerElement({
        position:     {
          lat: parseFloat(property.location.position.lat),
          lng: parseFloat(property.location.position.lng)
        },
        map:          null,
        gmpClickable: true,
        title:        property.location.name
      });

      const htmlElement = document.createElement('img');
      const priceTag    = options.showAsCategory ? -1 : get(property, 'pricelist.priceTag', 0) - 1;

      switch (property.location.accessibility) {
        case 'train':
          if (priceTag === -1) {
            htmlElement.src = MapMarkers.ICON_TRAIN_LOCATION;
          } else {
            htmlElement.src = MapMarkers.ICON_TRAIN_LOCATION_USED + MapMarkers.ICON_PRICE_LABELS[priceTag];
          }
          break;

        case 'bus':
          if (priceTag === -1) {
            htmlElement.src = MapMarkers.ICON_BUS_LOCATION;
          } else {
            htmlElement.src = MapMarkers.ICON_BUS_LOCATION_USED + MapMarkers.ICON_PRICE_LABELS[priceTag];
          }
          break;

        case 'boat':
          if (priceTag === -1) {
            htmlElement.src = MapMarkers.ICON_BOAT_LOCATION;
          } else {
            htmlElement.src = MapMarkers.ICON_BOAT_LOCATION_USED + MapMarkers.ICON_PRICE_LABELS[priceTag];
          }
          break;

        case 'cablecar':
          if (priceTag === -1) {
            htmlElement.src = MapMarkers.ICON_CABLECAR_LOCATION;
          } else {
            htmlElement.src = MapMarkers.ICON_CABLECAR_LOCATION_USED + MapMarkers.ICON_PRICE_LABELS[priceTag];
          }
          break;

        default:
          if (priceTag === -1) {
            htmlElement.src = MapMarkers.ICON_OTHER_LOCATION;
          } else {
            htmlElement.src = MapMarkers.ICON_OTHER_LOCATION_USED + MapMarkers.ICON_PRICE_LABELS[priceTag];
          }
          break;
      }
      marker.append(htmlElement);
    }

    // Add the listener which will
    // a) emit an event
    // b) open a pop-up window
    marker.addListener('click', () => {
      self.infoWindow.close();
      const header     = document.createElement('h3');
      header.innerHTML = property.location.name;
      self.infoWindow.setHeaderContent(header);
      if (options.markerMode === MARKER_MODE_RECEPTION) {
        self.infoWindow.setContent(self.setInfoWindowContentReception(property));
      } else if (options.markerMode === MARKER_MODE_INFO) {
        self.infoWindow.setContent(self.setInfoWindowContentInfo(property));
      } else {
        console.warn('Unknown marker mode', options.markerMode);
      }
      self.infoWindow.open(marker.map, marker);
      self.emit('property-selected', property);
    })

    // console.log('created marker', marker);
    return marker;
  }

  /**
   * Sets the content of the information window for a given property for the RECEPTION.
   *
   * @param {Object} property - The property object containing details to be displayed in the information window.
   * The object may include `gamedata` (owner, purchase timestamp, building details) and `pricelist` (price).
   * @return {HTMLDivElement} A DOM element containing the content of the information window, formatted based on the
   *   property data.
   */
  setInfoWindowContentReception(property) {
    const self    = this;
    const element = document.createElement('div');
    if (property?.gamedata.owner) {
      element.innerHTML = `
      <div>Besitzer: ${self.teamsStore.idToTeamName(property.gamedata.owner)}</div>
      <div>Kaufpreis: ${property.pricelist.price}</div>
      <div>Kaufzeit: ${formatGameTime(property.gamedata.boughtTs)}</div>
      <p>
      <div>&nbsp;</div>
      <div>Baustatus: ${buildingStatus(property.gamedata.buildings)}</div>
      <div>Hausbau möglich: ${booleanYesNo(property.gamedata.buildingEnabled)}</div>
      </p>
    `;
    } else {
      element.innerHTML = `
      <div>Kaufpreis: ${formatPrice(property.pricelist.price)}</div>
      <div>verfügbar</div>
    `;
    }
    return element;
  }

  /**
   * Sets the info window of a marker for INFO purposes
   * @param property
   * @return {HTMLDivElement}
   */
  setInfoWindowContentInfo(property) {
    const self    = this;
    const element = document.createElement('div');
    if (property?.gamedata.owner) {
      element.innerHTML = `
      <div>Besitzer: ${self.teamsStore.idToTeamName(property.gamedata.owner)}</div>
      <div>Kaufpreis: ${property.pricelist.price}</div>
      <div>Kaufzeit: ${formatGameTime(property.gamedata.boughtTs)}</div>
      <p>
      <div>&nbsp;</div>
      <div>Baustatus: ${buildingStatus(property.gamedata.buildings)}</div>
      <div>Hausbau möglich: ${booleanYesNo(property.gamedata.buildingEnabled)}</div>
      </p>
    `;
    } else {
      element.innerHTML = `
      <div>Kaufpreis: ${formatPrice(property.pricelist.price)}</div>
      <div>Erreichbarkeit: ${formatAccessibility(property.location.accessibility)}</div>
    `;
    }
    return element;
  }

}

let instance = null;

function getMapMarkerInstance() {
  if (!instance) {
    console.log('Creating MapMarker Instance');
    instance = new MapMarkers();
  }
  return instance;

}

export {MapMarkers, getMapMarkerInstance}
