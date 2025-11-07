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
  {
    name    : 'account',
    entry   : path.join(__dirname, 'apps', 'account', 'app.js'),
    htmlFile: 'account.html'
  },
  {
    name    : 'team',
    entry   : path.join(__dirname, 'apps', 'team', 'app.js'),
    htmlFile: 'team.html'
  },
  {
    name    : 'reception',
    entry   : path.join(__dirname, 'apps', 'reception', 'app.js'),
    htmlFile: 'reception.html'
  },
];
