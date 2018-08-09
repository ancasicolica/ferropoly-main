/**
 * Routes for postbox ("Messenger"
 * Created by kc on 9.8.18
 */

const express  = require('express');
const router   = express.Router();
const accessor = require('../lib/accessor');


/**
 * Build Houses
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

    console.log("File received: ", req.imageData);
    // console.log('Body:', util.inspect(req.body));
    let base64String = req.body.imageData;
    let base64Image  = base64String.split(';base64,').pop();

    console.log(base64Image);
    res.send({});

  });
});
module.exports = router;
