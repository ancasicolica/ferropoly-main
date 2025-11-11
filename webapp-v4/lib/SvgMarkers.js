
/**
 * Helper functions for creating custom map markers with Font Awesome icons
 */
import { icon } from '@fortawesome/fontawesome-svg-core'
import {faTrain} from '@fortawesome/free-solid-svg-icons';
/**
 * Creates a custom marker element using a Font Awesome icon and a specified color.
 *
 * @param {Object} faIcon The Font Awesome icon object to be used for the marker.
 * @param {string} color The color to fill the SVG icon with.
 * @return {HTMLElement} The created marker element as an HTML div element containing the SVG icon.
 */
function createCustomMarkerElement(faIcon, color) {
  const size = 24;

  const markerElement = document.createElement('div');

  const i = icon(faIcon);

  // Train SVG Icon (von Font Awesome kopiert)
  markerElement.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="${size}" 
         height="${size}" 
         viewBox="0 0 448 512"
         fill="${color}"
         style="cursor: pointer;">
      <path d="${i.icon[4]}"/>
  `;
  return markerElement;
}


/**
 * Creates a custom advanced Font Awesome marker with configurable properties such as icon, color, size, and more.
 *
 * @param {Object} options - Configuration options for the marker.
 * @param {Object} options.position - The geographical position of the marker (e.g., LatLng instance).
 * @param {Object} options.map - The map instance where the marker will be added.
 * @param {string} [options.iconClass='fa-train'] - The Font Awesome icon class to use for the marker.
 * @param {string} [options.color='#d32f2f'] - The color of the Font Awesome icon and the border of the marker.
 * @param {string} [options.backgroundColor='#ffffff'] - The background color for the marker.
 * @param {number} [options.size=40] - The size (width and height) of the circular marker container, in pixels.
 * @param {string} [options.title=''] - The optional tooltip text for the marker.
 * @param {Function} options.AdvancedMarkerElement - Function or class responsible for creating advanced marker elements.
 *
 * @return {Object} A new AdvancedMarkerElement instance configured with the specified options.
 */
export function createAdvancedFontAwesomeMarker(options) {
  const {
          position,
          map,
          faIcon = faTrain,
          color = '#d32f2f',
          backgroundColor = '#ffffff',
          size = 40,
          title = ''
        } = options;

  // Create custom HTML element for the marker
  const markerElement = document.createElement('div');
  markerElement.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    background-color: ${backgroundColor};
    border: 2px solid ${color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;

  const iconElement = document.createElement('i');
  iconElement.className = `fa-solid`;
  iconElement.style.fontSize = `${size * 0.6}px`;
  iconElement.style.color = color;

  markerElement.appendChild(iconElement);

  // Create AdvancedMarkerElement
  return new options.AdvancedMarkerElement({
    map,
    position,
    content: createCustomMarkerElement(options.faIcon, options.color),
    title
  });
}
