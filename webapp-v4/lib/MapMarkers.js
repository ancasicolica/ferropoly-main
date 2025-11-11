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
import {useTeamsStore} from './store/Teams';

class MapMarkers extends EventEmitter {
  constructor() {
    super();
    // The Icons to use
    this.ICON_EDIT_LOCATION     = '/images/markers/selected.png';
    this.ICON_TRAIN_LOCATION    = '/images/markers/z-neutral.png';
    this.ICON_BUS_LOCATION      = '/images/markers/b-neutral.png';
    this.ICON_BOAT_LOCATION     = '/images/markers/s-neutral.png';
    this.ICON_CABLECAR_LOCATION = '/images/markers/v-neutral.png';
    this.ICON_OTHER_LOCATION    = '/images/markers/v-neutral.png';

    this.iconPriceLabels             = ['01.png', '02.png', '03.png', '04.png', '05.png', '06.png', '07.png', '08.png',
                                        '09.png', '10.png'];
    this.ICON_TRAIN_LOCATION_USED    = '/images/markers/32-b/z-';
    this.ICON_BUS_LOCATION_USED      = '/images/markers/32-b/b-';
    this.ICON_BOAT_LOCATION_USED     = '/images/markers/32-b/s-';
    this.ICON_CABLECAR_LOCATION_USED = '/images/markers/32-b/v-';
    this.ICON_OTHER_LOCATION_USED    = '/images/markers/32-b/v-';


    this.propertyStore = usePropertyStore();
    this.markers       = new Map();
    this.bounds        = {
      north: 0,
      south: 0,
      east:  0,
      west:  0
    };
    this.ready         = false;
    this.teamsStore    = useTeamsStore();

  }

  async init() {
    const self     = this;
    const instance = await mapLoader.getInstance();

    self.googleInstance = instance;
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
        title:    prop.location.name
      });
      //  console.log(`Marker set for ${marker.title}, ${marker.position.lat}`)
      marker.addListener('click', () => {
        self.emit('property-selected', prop);
      })
      self.markers.set(prop.uuid, marker);
    }
    console.log('Created', self.markers.size, 'markers');
    this.ready = true;
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
  applyFilter(_map) {
    if (!this.ready) {
      console.log('not ready for applyFilter yet');
      return;
    }

    const map = toRaw(_map);

    const self = this;
    console.log('APPLY FILTER called');
    console.log('  - Map instance:', map);
    console.log('  - Markers available:', self.markers.size);
    console.log('  - Properties in store:', self.propertyStore.properties.size);

    let visibleCount = 0;
    for (const marker of self.markers) {
      const prop = self.propertyStore.properties.get(marker[0]);
      // console.log(marker, prop);
      if (prop) {
        /*  console.log(`Property ${prop.location.name}:`, {
         visibleOnMap:   prop.visibleOnMap,
         hasMarker:      !!marker[1],
         markerPosition: marker[1].position
         });*/

        if (prop.visibleOnMap) {
          // IMPORTANT: Set content BEFORE adding to map!
          marker[1]     = this.createMarker(prop);
          marker[1].map = map;
          visibleCount++;
          console.log(`  ✓ Marker ${prop.location.name} set to visible`, marker[1].children);

        } else {
          marker[1].map = null;
          console.log(`  ○ Marker ${prop.location.name} hidden (visibleOnMap=false)`);
        }
      } else {
        console.warn('No fit for marker in properties', marker);
      }
    }
    console.log(`APPLY FILTER complete: ${visibleCount} markers visible`, this.markers);
  }

  getPriceIconIndex() {
    return '01.png';
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
            showAsCategory = false
          } = options;

    if (property?.gamedata.owner) {
      // Owned properties are "simple", just display the icon for a owned property in the teams color
      return createAdvancedFontAwesomeMarker({
        AdvancedMarkerElement: this.googleInstance.AdvancedMarkerElement,
        faIcon:                faHouse,
        color:                 self.teamsStore.idToColor(property.gamedata.owner),

        size:     24,
        position: {
          lat: parseFloat(property.location.position.lat),
          lng: parseFloat(property.location.position.lng)
        },
        map:      null,
      });
    }

    // -----------------------------------
    // Generic Markers for free properties
    const marker = new this.googleInstance.AdvancedMarkerElement({
      position: {
        lat: parseFloat(property.location.position.lat),
        lng: parseFloat(property.location.position.lng)
      },
      map:      null,
      title:    property.location.name
    });

    const htmlElement = document.createElement('img');
    const priceTag    = options.showAsCategory ? -1 : get(property, 'pricelist.priceTag', 0) - 1;

    console.log('priceTag', priceTag, this.iconPriceLabels[priceTag], property);

    switch (property.location.accessibility) {
      case 'train':
        if (priceTag === -1) {
          htmlElement.src = this.ICON_TRAIN_LOCATION;
        } else {
          htmlElement.src = this.ICON_TRAIN_LOCATION_USED + this.iconPriceLabels[priceTag];
        }
        break;

      case 'bus':
        if (priceTag === -1) {
          htmlElement.src = this.ICON_BUS_LOCATION;
        } else {
          htmlElement.src = this.ICON_BUS_LOCATION_USED + this.iconPriceLabels[priceTag];
        }
        break;

      case 'boat':
        if (priceTag === -1) {
          htmlElement.src = this.ICON_BOAT_LOCATION;
        } else {
          htmlElement.src = this.ICON_BOAT_LOCATION_USED + this.iconPriceLabels[priceTag];
        }
        break;

      case 'cablecar':
        if (priceTag === -1) {
          htmlElement.src = this.ICON_CABLECAR_LOCATION;
        } else {
          htmlElement.src = this.ICON_CABLECAR_LOCATION_USED + this.iconPriceLabels[priceTag];
        }
        break;

      default:
        if (priceTag === -1) {
          htmlElement.src = this.ICON_OTHER_LOCATION;
        } else {
          htmlElement.src = this.ICON_OTHER_LOCATION_USED + this.iconPriceLabels[priceTag];
        }
        break;
    }
    marker.append(htmlElement);
    return marker;
  }
}

let instance = null;

function getMapMarkerInstance() {
  if (!instance) {
    instance = new MapMarkers();
  }
  return instance;

}

export {MapMarkers, getMapMarkerInstance}
