const path = require('path');

/**
 * This module configures all Ferropoly Webapps for the Webpack configuration
 */
module.exports = [
  {
    name    : 'login',
    entry   : path.join(__dirname, 'apps', 'login', 'app.js'),
    htmlFile: 'login.html'
  },
  {
    name    : 'game-selector',
    entry   : path.join(__dirname, 'apps', 'gameSelector', 'app.js'),
    htmlFile: 'game-selector.html'
  },
  {
    name    : 'join',
    entry   : path.join(__dirname, 'apps', 'join', 'app.js'),
    htmlFile: 'join.html'
  },
  {
    name    : 'game-info',
    entry   : path.join(__dirname, 'apps', 'info', 'app.js'),
    htmlFile: 'game-info.html'
  },

];
