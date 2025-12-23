/**
 * Some functions useful for proerties
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.12.2025
 **/

import {filter, get} from 'lodash';
import {useGameplayStore} from './store/GameplayStore';
import {usePropertyStore} from './store/PropertyStore';


/**
 * Returns the value of the property for rent and interest. This function checks also if a group belongs to one team
 * Pretty much the same as gound in propertyAccount.js in the backend, but it is implemented here as I consider it
 * better performing in the frontend: do not use too much calculating power in the backend just for a nerdy stats!
 * @param property
 * @param calculateWithBuildingNb number of buildings which shall be used for calculation, leave empty if game decides
 * @returns {*}
 */
function evaluatePropertyValue(property, calculateWithBuildingNb = -1) {
  const gameplayStore = useGameplayStore();
  const propertyStore = usePropertyStore();

  let propertyGroup = get(property, 'pricelist.propertyGroup', -1);
  let properties    = filter([...propertyStore.properties.values()], p => {
    return p.pricelist.propertyGroup === propertyGroup;
  });

  let sameGroup = 0;
  for (let i = 0; i < properties.length; i++) {
    if (get(properties[i], 'gamedata.owner', 'che') === get(property, 'gamedata.owner', 'ge')) {
      sameGroup++;
    }
  }
  let retVal = {};
  let factor = 1;
  if ((properties.length > 1) && (sameGroup === properties.length)) {
    // all properties in a group belong the same team, pay more!
    factor = gameplayStore.gameplay.gameParams.rentFactors.allPropertiesOfGroup || 2;
    // console.log(`Properties in group ${propertyGroup} count ${factor} x`);
  }

  let rent = 0;
  let buildingNb;
  if (calculateWithBuildingNb >= 0) {
    buildingNb = calculateWithBuildingNb;
  } else {
    buildingNb = property.gamedata.buildings || 0;
  }

  switch (buildingNb) {
    case 0:
      rent = property.pricelist.rents.noHouse;
      break;
    case 1:
      rent = property.pricelist.rents.oneHouse;
      break;
    case 2:
      rent = property.pricelist.rents.twoHouses;
      break;
    case 3:
      rent = property.pricelist.rents.threeHouses;
      break;
    case 4:
      rent = property.pricelist.rents.fourHouses;
      break;
    case 5:
      rent = property.pricelist.rents.hotel;
      break;
    default:
      console.warn('invalid building nb', property);
  }

  retVal.amount = rent * factor;
  retVal.uuid   = property.uuid;
  return retVal.amount;
}
/**
 * Evaluates the property value for a given team.
 *
 * @param {number} teamId - The ID of the team.
 * @return {Object} - The evaluation result with the sum and maximum value.
 */
function evaluatePropertyValueForTeam(teamId) {
  const propertyStore = usePropertyStore();

  let props  = propertyStore.propertiesByTeamId(teamId);
  let retVal = {
    sum: 0,
    max: 0
  }
  props.forEach(p => {
    retVal.sum += evaluatePropertyValue(p);
    retVal.max += evaluatePropertyValue(p, 5);
  })
  return retVal;
}

export {evaluatePropertyValue, evaluatePropertyValueForTeam}
