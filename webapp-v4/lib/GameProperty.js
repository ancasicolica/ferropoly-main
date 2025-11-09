/**
 * A property for the game, not reactive, containing static game data
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.11.2025
 **/
import Property from '../common/lib/Property';

class GameProperty extends Property {
  constructor(prop) {
    super(prop);
  }

  getPriceIconIndex() {
    return '01.png';
  }
  /**
   * Set the icon for this location in the map, this is editor specific
   * @param editMode true if editing the item
   */
  setMarkerIcon(editMode) {
    const htmlElement = document.createElement('img');
    if (this.marker) {
      let x = -1;
      if (this.pricelist) {
        x = this.pricelist.priceRange;
      }
      if (editMode) {
        htmlElement.src    = this.ICON_EDIT_LOCATION
        this.marker.zIndex = 1000;
      } else {
        switch (this.location.accessibility) {
          case 'train':
            if (x === -1) {
              htmlElement.src = this.ICON_TRAIN_LOCATION;
              this.marker.zIndex = 1;
            } else {
              htmlElement.src = this.ICON_TRAIN_LOCATION_USED + this.getPriceIconIndex(x);
              this.marker.zIndex = 20;
            }
            break;

          case 'bus':
            if (x === -1) {
              htmlElement.src = this.ICON_BUS_LOCATION;
              this.marker.zIndex = 1;
            } else {
              htmlElement.src = this.ICON_BUS_LOCATION_USED + this.getPriceIconIndex(x);
              this.marker.zIndex = 15;
            }
            break;

          case 'boat':
            if (x === -1) {
              htmlElement.src = this.ICON_BOAT_LOCATION;
              this.marker.zIndex = 1;
            } else {
              htmlElement.src = this.ICON_BOAT_LOCATION_USED + this.getPriceIconIndex(x);
              this.marker.zIndex = 18;
            }
            break;

          case 'cablecar':
            if (x === -1) {
              htmlElement.src = this.ICON_CABLECAR_LOCATION;
              this.marker.zIndex = 1;
            } else {
              htmlElement.src = this.ICON_CABLECAR_LOCATION_USED + this.getPriceIconIndex(x);
              this.marker.zIndex = 20;
            }
            break;

          default:
            if (x === -1) {
              htmlElement.src = this.ICON_OTHER_LOCATION;
              this.marker.zIndex = 1;
            } else {
              htmlElement.src = this.ICON_OTHER_LOCATION_USED + this.getPriceIconIndex(x);
              this.marker.zIndex = 5;
            }
            break;
        }
      }
      this.marker.content = htmlElement;
    }
  };
}

export default GameProperty;
