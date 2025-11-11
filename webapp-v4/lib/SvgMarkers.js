/**
 * Helper functions for creating custom map markers with Font Awesome icons
 */
import {icon} from '@fortawesome/fontawesome-svg-core'
import {faTrain} from '@fortawesome/free-solid-svg-icons';


/**
 * Creates a custom marker element using Font Awesome icons.
 *
 * @param {Object} faIcon - The Font Awesome icon object used to generate the marker.
 * @param {Object} options - The customization options for the marker.
 * @param {number} [options.size=24] - The size of the marker icon.
 * @param {string} [options.color='red'] - The color of the marker icon.
 * @return {HTMLElement} The generated custom marker element.
 */
function createCustomMarkerElement(faIcon, options) {
  const {
          size  = 24,
          color = 'red'
        } = options;

  const markerElement = document.createElement('div');

  const iconData = icon(faIcon);

  // Train SVG Icon (von Font Awesome kopiert)
  markerElement.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="${size}" 
         height="${size}" 
         viewBox="0 0 448 512"
         fill="${color}"
         style="cursor: pointer;">
      <path d="${iconData.icon[4]}"/>
  `;
  return markerElement;
}



/**
 * Creates an advanced FontAwesome marker with the specified options.
 *
 * @param {Object} options - Configuration options for creating the marker.
 * @param {google.maps.LatLng|google.maps.LatLngLiteral} options.position - The position of the marker on the map.
 * @param {google.maps.Map} options.map - The Google Maps instance to place the marker on.
 * @param {Object} [options.faIcon=faTrain] - The FontAwesome icon to use for the marker. Defaults to `faTrain`.
 * @param {string} [options.color='#d32f2f'] - The color of the icon. Defaults to `#d32f2f`.
 * @param {number} [options.size=24] - The size of the icon in pixels. Defaults to 24.
 * @param {string} [options.title=''] - The title of the marker, displayed as a tooltip on hover. Defaults to an empty string.
 * @param {Object} options.AdvancedMarkerElement - The constructor for creating advanced marker elements.
 *
 * @return {Object} An instance of the advanced marker element customized with a FontAwesome icon.
 */
export function createAdvancedFontAwesomeMarker(options) {
  const {
          position,
          map,
          faIcon = faTrain,
          color  = '#d32f2f',
          size   = 24,
          title  = ''
        } = options;


  // Create AdvancedMarkerElement
  return new options.AdvancedMarkerElement({
    map,
    position,
    content: createCustomMarkerElement(options.faIcon, options),
    title
  });
}
