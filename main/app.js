/**
 * Ferropoly Main
 *
 * This is the "real" application file
 * Created by kc on 14.04.15.
 */
'use strict';
var express = require('express');
var path    = require('path');
var morgan  = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var settings    = require('./settings');
var passport    = require('passport');
var flash       = require('connect-flash');
var session     = require('express-session');
var compression = require('compression');
var MongoStore  = require('connect-mongo')(session);
var moment      = require('moment');
// Model includes
var users = require('../common/models/userModel');
//var gameplays = require('../common/models/gameplayModel');
var properties  = require('../common/models/propertyModel');
var locations   = require('../common/models/locationModel');
var ferropolyDb = require('../common/lib/ferropolyDb');
// Routes includes
var login        = require('./routes/login');
var authtoken    = require('./routes/authtoken');
var app          = express();
var ferroSocket  = require('./lib/ferroSocket');
var autopilot    = require('./lib/autopilot');
var logger       = require('../common/lib/logger').getLogger('main:app');
var logs         = require('../common/models/logModel');
var authStrategy = require('../common/lib/authStrategy')(settings, users);
logger.info('Ferropoly Copyright (C) 2015 Christian Kuster, CH-8342 Wernetshausen');
logger.info('This program comes with ABSOLUTELY NO WARRANTY;');
logger.info('This is free software, and you are welcome to redistribute it');
logger.info('under certain conditions; see www.ferropoly.ch for details.');

/**
 * Initialize DB connection, has to be only once for all models
 */
ferropolyDb.init(settings, function (err) {
  if (err) {
    logger.warning('Failed to init ferropolyDb');
    logger.error(err);
    return;
  }

  logs.init(settings);

  var server = require('http').Server(app);

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
  morgan.token('prefix', function getId(req) {
    return 'http: ' + moment().format();
  });
  app.use(morgan(':prefix :method :status :remote-addr :url'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());

  // Using compression speeds up the connection (and uses much less data for mobile)
  app.use(compression());

  // Non authenticated pages
  app.use('/info', require('./routes/info'));

  // Define Strategy, login
  passport.use(authStrategy.facebookStrategy);
  passport.use(authStrategy.googleStrategy);
  passport.use(authStrategy.localStrategy);
  // Session serializing of the user
  passport.serializeUser(authStrategy.serializeUser);
  // Session deserialisation of the user
  passport.deserializeUser(authStrategy.deserializeUser);
  // required for passport: configuration
  app.use(session({
    secret           : 'ferropolyIsAGameWithAVeryLargePlayground!',
    resave           : false,
    saveUninitialized: true,
    cookie           : {secure: false}, // This is important! secure works only for https, with http no cookie is set!!!!
    store            : new MongoStore({mongooseConnection: ferropolyDb.getDb()})
  })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
  app.use(express.static(path.join(__dirname, 'public')));

  // Set auth route
  require('../common/routes/auth')(app);

  // Routes initialisation
  app.use('/appinfo', require('../common/routes/info'));
  login.init(app, settings);
  app.use('/', require('./routes/index'));
  app.use('/test', require('./routes/test'));
  app.use('/reception', require('./routes/reception'));
  app.use('/marketplace', require('./routes/marketplace'));
  app.use('/statistics', require('./routes/statistics'));
  app.use('/properties', require('./routes/properties'));
  app.use('/download', require('./routes/download'));
  app.use('/about', require('./routes/about'));
  app.use('/gamecache/', require('./routes/gamecache'));
  app.use('/teamAccount', require('./routes/teamAccount'));
  app.use('/propertyAccount', require('./routes/propertyAccount'));
  app.use('/chancellery', require('./routes/chancellery'));
  app.use('/travellog', require('./routes/travellog'));
  app.use('/traffic', require('./routes/traffic'));
  authtoken.init(app);

  app.set('port', settings.server.port);
  app.set('ip', settings.server.host);
  ferroSocket.create(server);

  // Now it is time to start the scheduler (after initializing ferroSocket, is required by marketplace)
  var gameScheduler = require('./lib/gameScheduler');
  var marketplace   = require('./lib/accounting/marketplace').createMarketplace(gameScheduler);
  gameScheduler.update(function (err) {
    if (err) {
      logger.info('Error while updating scheduler');
    }
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err    = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error  : err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error  : {}
    });
  });

  server.listen(settings.server.port, settings.server.host, function () {
    logger.info('%s: Node server started on %s:%d ...',
      new Date(Date.now()), app.get('ip'), app.get('port'));


    logger.info('Ferropoly Main server listening on port ' + app.get('port'));


    // temporary, for deployment debugging only
    var util = require('util');
    logger.debug(util.inspect(settings));

    autopilot.init(settings);
  });


});
