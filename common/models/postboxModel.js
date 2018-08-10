/**
 * Model for the ferropoly postbox
 * Created by kc on 10.8.18
 */

const mongoose = require('mongoose');
var moment     = require('moment');
var util       = require('util');
var _          = require('lodash');
var logger     = require('../lib/logger').getLogger('postboxModel');


/**
 * The mongoose schema for message in the Postbox
 */
const messageSchema = mongoose.Schema({

  _id      : String,
  gameId   : String, // Gameplay this property belongs to
  timestamp: {type: Date, default: Date.now},
  status   : {type: String, default: 'sent'}, // sent / received
  sender   : {
    teamId  : String, // Sender ID as string, 'reception' for the reception
    email   : String, // the Senders Email (is also the login)
    name    : String, // the Senders name
    position: {
      lat     : Number,
      lng     : Number,
      accuracy: Number
    }
  },
  receiver : {
    id: String  // teamId or 'reception'
  },
  message  : {
    photo: {
      image           : String, // Base 64 String of a photo taken by mobile
      make            : String, // Make info from Exif
      model           : String, // Model info from Exif
      dateTimeOriginal: String // Date when pic was taken (Exif Format, any format!)
    },
    text : String, // Text sent
  }

}, {autoIndex: true});


const Message = mongoose.model('Postbox', messageSchema);

/**
 * Create a new Message
 * @param sender
 * @param gameId
 * @param receiver
 * @param message
 * @param callback
 */
let createMessage = function (gameId, sender, receiver, message, callback) {
  let msg      = new Message();
  msg.gameId   = gameId;
  msg._id      = gameId + '-' + moment().valueOf();
  msg.sender   = {
    teamId  : sender.teamId || 'none',
    email   : sender.email,
    name    : sender.name,
    position: sender.position
  };
  msg.receiver = {
    id: receiver.id
  };
  msg.message  = {
    photo: message.photo,
    text : message.text
  };
  msg.save(function (err, savedMessage) {
    callback(err, savedMessage);
  })
};

module.exports = {
  Model        : messageSchema,
  createMessage: createMessage

};
