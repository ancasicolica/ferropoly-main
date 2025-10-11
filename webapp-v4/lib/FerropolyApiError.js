/**
 * Class representing an API Error
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 11.10.2025
 **/
import {get} from 'lodash'

class FerropolyApiError {
  constructor(err) {
    this.message = get(err, 'response.data.message', get(err, 'message', 'Generischer Fehler'));
    this.statusCode = get(err, 'response.status', -1);
    this.statusText = get(err, 'response.statusText', 'Unbekannter Fehler');
    this.httpMessage = get(err, 'message', 'Generic HTTP ERROR');
    this.causingUrl = get(err, 'request.responseURL', 'unknown');

    console.warn(`API call returned status ${this.statusCode} for ${this.causingUrl}: ${this.message}`, err)
  }
}

export default FerropolyApiError
