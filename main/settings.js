/**
 * Settings File
 * Created by kc on 14.04.15.
 */

const pkg        = require('./../package.json');
const fs         = require('fs');
const _          = require('lodash');
const path       = require('path');
const logger     = require('../common/lib/logger').getLogger('settings');
const {v4: uuid} = require('uuid');

// Set default
let deployType = process.env.DEPLOY_TYPE || 'local';
let preview    = true;
let debug      = process.env.DEBUG || false;

// Set specific deploy type
if (process.env.DEPLOY_TYPE === 'contabo') {
  // check which instance
  let rootPath = path.join(__dirname, '..');
  console.log('Root path: ' + rootPath);
  if (_.endsWith(rootPath, 'preview')) {
    deployType = 'contabo_preview';
    debug      = true;
  } else if (_.endsWith(rootPath, 'rc')) {
    deployType = 'contabo_rc';
  } else {
    preview = false;
  }
}

let settings = {
  name   : pkg.name,
  appName: pkg.title,
  version: pkg.version,
  debug  : debug,
  preview: preview,
  appPath: 'main', // folder where the app resides

  oAuth: {
    facebook: {
      appId      : process.env.FERROPOLY_FACEBOOK_APP_ID || 'no_idea',
      secret     : process.env.FERROPOLY_FACEBOOK_APP_SECRET || 'no_secret',
      callbackURL: 'none' // is set in settings file for environment
    },

    google: {
      clientId    : process.env.FERROPOLY_GOOGLE_CLIENT_ID || 'none',
      clientSecret: process.env.FERROPOLY_GOOGLE_CLIENT_SECRET || 'no_secret',
      callbackURL : 'none' // is set in settings file for environment
    },

    dropbox: {
      clientId    : process.env.FERROPOLY_DROPBOX_CLIENT_ID || 'none',
      clientSecret: process.env.FERROPOLY_DROPBOX_CLIENT_SECRET || 'no_secret',
      callbackURL : 'none' // is set in settings file for environment
    },

    twitter: {
      consumerKey   : process.env.FERROPOLY_TWITTER_CONSUMER_KEY || 'none',
      consumerSecret: process.env.FERROPOLY_TWITTER_CONSUMER_SECRET || 'no_secret',
      callbackURL   : 'none' // is set in settings file for environment
    },

    microsoft: {
      clientId    : process.env.FERROPOLY_MICROSOFT_CLIENT_ID || 'none',
      clientSecret: process.env.FERROPOLY_MICROSOFT_CLIENT_SECRET || 'no_secret',
      callbackURL : 'none' // is set in settings file for environment
    }
  }
};

settings.mailer = {
  senderAddress: process.env.MAILER_SENDER,
  host         : process.env.MAILER_HOST,
  port         : process.env.MAILER_PORT || 465,
  secure       : true,
  auth         : {
    pass: process.env.MAILER_PASS,
    user: process.env.MAILER_USER
  }
};

// This is a secret for debugging routes
settings.debugSecret = process.env.FERROPOLY_DEBUG_SECRET || uuid();

// Maps settings
settings.maps = {
  apiKey         : process.env.FERROPOLY_GOOGLE_MAPS_API_KEY || 'none',
  geocodingApiKey: process.env.FERROPOLY_GOOGLE_GEOCODING_API_KEY || null
};

// Picture Bucket in Google Storage
settings.picBucket                         = {
  bucket : 'ferropoly-test',
  baseUrl: 'https://storage.googleapis.com'
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = null;


if (debug) {
  logger.info('DEBUG Settings used');
  // Use minified javascript files wherever available
  settings.minifiedjs = false;
} else {
  logger.info('DIST Settings with minified js files used');
  // Use minified javascript files wherever available
  settings.minifiedjs = true;
}

logger.info('DEPLOY_TYPE: ' + deployType);

if (deployType && fs.existsSync(path.join(__dirname, 'settings/' + deployType + '.js'))) {
  module.exports = require('./settings/' + deployType + '.js')(settings);
} else {
  module.exports = settings;
}
