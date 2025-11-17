/**
 * A Log Entry for the Reception
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 17.11.2025
 **/
import {DateTime} from 'luxon';
import {isNumber} from 'lodash';

export const LOG_TYPE_INFO = 0;
export const LOG_TYPE_FAIL = 1;
export const LOG_TYPE_SUCCESS = 2;

export class ReceptionLogEntry  {
  constructor(options = {}) {

    function setType(suggested, amount) {
      if (suggested && !amount) {
        return suggested;
      }
      if (isNumber(amount)) {
        if (amount > 0) {
          return LOG_TYPE_SUCCESS
        }
        return LOG_TYPE_FAIL;
      } else {
        return LOG_TYPE_INFO;
      }
    }
    this.title   = options.title || '';
    this.message = options.message || '';
    this.amount = options.amount || null;
    this.type = setType(options.type, this.amount);
    this.timestamp = DateTime.now();
  }

}
