/**
 * Routes for postbox ("Messenger"
 * Created by kc on 9.8.18
 */

const express   = require('express');
const router    = express.Router();
const accessor  = require('../lib/accessor');
const postbox   = require('../../common/models/postboxModel');
const users     = require('../../common/models/userModel');
const gameCache = require('../lib/gameCache');
const _         = require('lodash');
const moment    = require('moment');
/**
 * Submit an image as Message
 */
router.post('/uploadimage/:gameId/:teamId', function (req, res) {

  if (!req.body.authToken) {
    return res.status(403).send({message: 'No auth token'});
  }
  if (req.body.authToken !== req.session.ferropolyToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.player, function (err) {
    if (err) {
      return res.status(403).send({message: 'Verification Error, ' + err.message});
    }

    users.getUserByMailAddress(req.session.passport.user, (err, activeUser) => {
      if (err) {
        return res.status(500).send({message: 'getUserByMailAddress Error, ' + err.message});
      }

      console.log("File received: ", req.imageData);
      // console.log('Body:', util.inspect(req.body));
      let base64String = req.body.imageData;
      let base64Image  = base64String.split(';base64,').pop();

      console.log(req.body);
      postbox.createMessage(req.params.gameId,
        {
          email   : req.session.passport.user,
          teamId  : req.params.teamId,
          name    : _.get(activeUser, 'personalData.forename', 'Unbekannt') + ' ' + _.get(activeUser, 'personalData.surname', ''),
          position: {
            lat     : _.get(req, 'body.lat', 0),
            lng     : _.get(req, 'body.lng', 0),
            accuracy: _.get(req, 'body.accuracy', 0),
          }
        },
        {
          id: 'reception'
        },
        {
          photo: {
            image           : base64Image,
            make            : _.get(req, 'body.exifMake', undefined),
            model           : _.get(req, 'body.exifModel', undefined),
            dateTimeOriginal: _.get(req, 'body.exifDateTimeOriginal', undefined)
          }
        },
        err => {
          if (err) {
            return res.status(500).send({message: 'createMessage (Postbox) error: ' + err.message});
          }
          res.send({});
        }
      );
    });
  });
});

/**
 * get some of the messages
 */
router.get('/messages/:gameId/:teamId', function (req, res) {

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.player, function (err) {
    if (err) {
      return res.status(403).send({message: 'Verification Error, ' + err.message});
    }

    postbox.getMessages(req.params.gameId, req.params.teamId,
      (err, messages) => {
        if (err) {
          return res.status(500).send({message: 'createMessage (Postbox) error: ' + err.message});
        }
        let result = [];
        messages.forEach(m => {
          if (m.message.photo) {
            delete m.message.photo.image;
            m.message.photo.url = '/postbox/images/' + req.params.gameId + '/' + req.params.teamId+ '/' + m._id + '/img.jpg';
          }
        });
        res.send({messages});
      }
    );


  });
});


/**
 * get image
 */
router.get('/images/:gameId/:teamId/:imageId/img.jpg', function (req, res) {

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.player, function (err) {
    if (err) {
      return res.status(403).send({message: 'Verification Error, ' + err.message});
    }

    postbox.getMessage(req.params.gameId, req.params.imageId,
      (err, message) => {
        if (err) {
          return res.status(500).send({message: 'getMessage (Postbox) error: ' + err.message});
        }
        let imageString = _.get(message, 'message.photo.image', 'nada');
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(Buffer.from(imageString, 'base64'));
      }
    );


  });
});

module.exports = router;
