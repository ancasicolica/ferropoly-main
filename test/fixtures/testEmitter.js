/**
 * An event emitter for testing purposes
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.09.2025
 **/
const EventEmitter = require('node:events');

class TestEmitter extends EventEmitter {
  constructor() {
    super();
  }

  fireEvent(channel, data) {
    console.log(`Emitting data on channel "${channel}"`, data);
    this.emit(channel, data);
  }
}

module.exports = TestEmitter;
