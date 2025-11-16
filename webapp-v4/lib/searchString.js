/**
 * Provides functions for generalising strings for searchs
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.11.2025
 **/
import {upperCase} from 'lodash';


export function createNormalizedString(value) {
  value = upperCase(value);
  value = value.replace(/À/g, 'A');
  value = value.replace(/È/g, 'E');
  value = value.replace(/É/g, 'E');
  value = value.replace(/Ë/g, 'E');
  value = value.replace(/Î/g, 'I');
  value = value.replace(/Ä/g, 'A');
  value = value.replace(/Ö/g, 'O');
  value = value.replace(/Ü/g, 'U');
  return value;
}
