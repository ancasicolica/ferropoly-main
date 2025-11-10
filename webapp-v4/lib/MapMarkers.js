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
    this.ready = false;


  }

  async init() {
    const self     = this;
    const instance = await mapLoader.getInstance();

    self.googleInstance = instance;
    console.log('Api loaded, creating default markers');
    console.log('PropertyStore has', this.propertyStore.properties.size, 'properties');

    for (let prop of this.propertyStore.properties.values()) {
      console.log('Creating marker for property:', prop.location.name, prop.uuid);

      let marker = new instance.AdvancedMarkerElement({
        position: {
          lat: parseFloat(prop.location.position.lat),
          lng: parseFloat(prop.location.position.lng)
        },
        map:      null,
        title:    prop.location.name
      });
      console.log(`Marker set for ${marker.title}, ${marker.position.lat}`)
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
          const iconContent = self.setMarkerIcon(marker[1], prop);

          if (iconContent) {
            marker[1].content = iconContent;
            marker[1].map     = map;
            visibleCount++;
            console.log(`  ✓ Marker ${prop.location.name} set to visible`);
          } else {
            console.warn(`  ✗ No icon content for ${prop.location.name}`);
          }
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

  setMarkerIcon(marker, property, editMode = false) {
    if (!marker) {
      console.warn('No valid marker provided');
      return null;
    }

    const htmlElement        = document.createElement('img');

    let x = -1;
    if (this.pricelist) {
      x = this.pricelist.priceRange;
    }

    if (editMode) {
      htmlElement.src = this.ICON_EDIT_LOCATION;
      marker.zIndex   = 1000;
    } else {
      switch (property.location.accessibility) {
        case 'train':
          if (x === -1) {
            htmlElement.src = this.ICON_TRAIN_LOCATION;
            marker.zIndex   = 1;
          } else {
            htmlElement.src = this.ICON_TRAIN_LOCATION_USED + this.getPriceIconIndex(x);
            marker.zIndex   = 20;
          }
          break;

        case 'bus':
          if (x === -1) {
            htmlElement.src = this.ICON_BUS_LOCATION;
            marker.zIndex   = 1;
          } else {
            htmlElement.src = this.ICON_BUS_LOCATION_USED + this.getPriceIconIndex(x);
            marker.zIndex   = 15;
          }
          break;

        case 'boat':
          if (x === -1) {
            htmlElement.src = this.ICON_BOAT_LOCATION;
            marker.zIndex   = 1;
          } else {
            htmlElement.src = this.ICON_BOAT_LOCATION_USED + this.getPriceIconIndex(x);
            marker.zIndex   = 18;
          }
          break;

        case 'cablecar':
          if (x === -1) {
            htmlElement.src = this.ICON_CABLECAR_LOCATION;
            marker.zIndex   = 1;
          } else {
            htmlElement.src = this.ICON_CABLECAR_LOCATION_USED + this.getPriceIconIndex(x);
            marker.zIndex   = 20;
          }
          break;

        default:
          if (x === -1) {
            htmlElement.src = this.ICON_OTHER_LOCATION;
            marker.zIndex   = 1;
          } else {
            htmlElement.src = this.ICON_OTHER_LOCATION_USED + this.getPriceIconIndex(x);
            marker.zIndex   = 5;
          }
          break;
      }
    }

 /*   console.log('Created icon element:', {
      property:      property.location.name,
      src:           htmlElement.src,
      accessibility: property.location.accessibility
    });
*/
    return htmlElement;
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
