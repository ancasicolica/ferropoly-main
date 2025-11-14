/**
 * Filter values for the property store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 14.11.2025
 **/

/**
 * No filtering for the status, all properties are ok but other filters might apply
 * @type {string}
 */
export const PROPERTY_FILTER_STATUS_NONE = 'none'

/**
 * Show only free properties
 * @type {string}
 */
export const PROPERTY_FILTER_STATUS_FREE = 'free';

/**
 * Filter free and bought properties (if the team filter also applies)
 * @type {string}
 */
export const PROPERTY_FILTER_STATUS_ALL = 'all';

/**
 * Show all bought properties (if the team filter also applies)
 * @type {string}
 */
export const PROPERTY_FILTER_STATUS_BOUGHT = 'bought';


// ---- Filters only for PROPERTY_FILTER_STATUS_NONE -----
/**
 * No filter for property groups
 * @type {null}
 */
export const PROPERTY_FILTER_GROUP_NONE = null;

/**
 * Property filter for a uuid of a property
 * @type {null}
 */
export const PROPERTY_FILTER_UUID_NONE = null;
