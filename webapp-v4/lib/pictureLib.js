/**
 * Helper functions for the pictures
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.12.2025
 **/

import {createLuxonDate} from '../common/lib/formatters';

/**
 * Extracts and returns the location text from the provided picture information object.
 *
 * @param {Object} pictureInfo - The object containing picture information, including location details.
 * @return {string|null} The extracted location text, or null if the location information is unavailable.
 */
function getLocationText(pictureInfo) {
  const address = pictureInfo?.location?.results?.[0]?.formatted_address;
  if (!address) {
    return null;
  }
  return address.split(', Switzerland')[0];
}

/**
 * Determines whether a warning should be active for a picture based on its last modified date.
 *
 * @param {Object} pictureInfo - An object containing metadata about the picture.
 * @param {Date} pictureInfo.lastModifiedDate - The date when the picture was last modified.
 * @return {boolean} True if the picture's last modified date is older than 12 hours; otherwise, false.
 */
function pictureTooOldWarningActive(pictureInfo) {
  if (!pictureInfo.lastModifiedDate || !pictureInfo.timestamp) {
    return false;
  }
  const lastModifiedDate = createLuxonDate(pictureInfo.lastModifiedDate);
  const timestamp = createLuxonDate(pictureInfo.timestamp);
  const diffInHours = timestamp.diff(lastModifiedDate, 'hours').as('hours');
  return diffInHours > 12;
}

export {getLocationText, pictureTooOldWarningActive}
