/**
 * Geolocation for the Ferropoly checkin
 * Created by kc on 29.01.16.
 */

'use strict';
function Geograph() {
  this.position = null;
  this.clients  = [];
}

Geograph.prototype.localize = function () {
  var self = this;
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      function (pos) {
        // Handler when everything is ok
        self.position = pos;
        for (var i = 0; i < self.clients.length; i++) {
          self.clients[i](pos);
        }
      },
      function (err) {
        // Handler in case of an error
        switch (err.code) {
          case err.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
          case err.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
          case err.UNKNOWN_ERROR:
            console.error("An unknown error occurred.");
            break;
        }
      });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};

Geograph.prototype.getLastLocation = function () {
  return this.position;
};

Geograph.prototype.onLocationChanged = function (client) {
  this.clients.push(client);
};

var geograph = new Geograph();
