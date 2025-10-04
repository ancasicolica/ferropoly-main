/**
 * A Bucket for pictures for a game, e.g. the validation, that a team was there.
 *
 * Integrates an own model
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 26.02.23
 **/

const logger         = require('../../common/lib/logger').getLogger('picBucket');
const _              = require('lodash');
const {Storage}      = require('@google-cloud/storage');
const {v4: uuidv4}   = require('uuid');
const picBucketModel = require('../../common/models/picBucketModel');
const axios          = require('axios').default;
const EventEmitter   = require('node:events');
const storage        = new Storage();

/**
 * PicBucket Class
 *
 * Events:
 *   new: when a new file was uploaded (confirmed), data of the new file as payload
 *   error: when a failure in the access of the google storage was detected
 */
class PicBucket extends EventEmitter {
  /**
   * Constructor
   * @param settings
   */
  constructor(settings) {
    super();
    this.bucketName = _.get(settings, 'bucket', null);
    this.settings   = settings;
  }


  /**
   * Announces an upload of a picture
   * @param gameId
   * @param teamId
   * @param options
   * @param callback
   */
  async announceUpload(gameId, teamId, options, callback) {
    if (callback) {
      logger.info('>>>>>>> Callback is not supported anymore in announceUpload');
      return callback(new Error('Callback is not supported anymore in announceUpload'));
    }
    let self            = this;
    let fileBase        = _.get(options, 'filename', `${uuidv4()}.jpg`);
    let filename        = `${gameId}/${teamId}/${fileBase}`
    let thumbname       = `${gameId}/${teamId}/tn/${fileBase}`
    const uploadOptions = {
      version:            'v4',
      action:             'write',
      expires:            Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType:        'image/jpeg',
      virtualHostedStyle: true
    };

    // Get a v4 signed URL for uploading file
    const bucket   = storage.bucket(self.bucketName);
    const file     = bucket.file(filename);
    const thumb    = bucket.file(thumbname);
    const imageUrl = await file.getSignedUrl(uploadOptions);


    const thumbUrl = await thumb.getSignedUrl(uploadOptions)

    logger.info(`${gameId}: Picture upload announced`, {teamId, gameId});

    let pic              = new picBucketModel.Model();
    pic.gameId           = gameId;
    pic.teamId           = teamId;
    pic.filename         = filename;
    pic.message          = _.get(options, 'message', undefined);
    pic.url              = `${self.settings.baseUrl}/${self.bucketName}/${filename}`;
    pic.thumbnail        = `${self.settings.baseUrl}/${self.bucketName}/${thumbname}`;
    pic.propertyId       = _.get(options, 'propertyId', undefined);
    pic.user             = _.get(options, 'user', 'unbekannt');
    pic.lastModifiedDate = _.get(options, 'lastModifiedDate', undefined);
    pic.position         = {
      lat:      Number(_.get(options, 'position.lat', '0')),
      lng:      Number(_.get(options, 'position.lng', '0')),
      accuracy: Number(_.get(options, 'position.accuracy', '10000')),
    };
    pic._id              = `${gameId}-${fileBase}`;

    await picBucketModel.save(pic);
    return {
      uploadUrl:    imageUrl[0],
      thumbnailUrl: thumbUrl[0],
      id:           pic._id
    }
  };


  /**
   * Confirms the upload of an announced file
   * @param id of the entry created while announcing
   * @param options additional (updated) info
   * @param callback
   */
  async confirmUpload(id, options, callback) {
    if (callback) {
      logger.info('>>>>>>> Callback is not supported anymore in confirmUpload');
      return callback(new Error('Callback is not supported anymore in confirmUpload'));
    }
    let self = this;
    options  = options || {};

    const doGeolocationApiCall = _.get(options, 'doGeolocationApiCall', true);
    const entry                = await picBucketModel.findPicById({_id: id});
    if (!entry) {
      return logger.info(`Pic with ${id} not found!`);
    }
    entry.uploaded = true;
    if (options.position) {
      if (entry.position.accuracy > Number(_.get(options, 'position.accuracy', '10000'))) {
        entry.position = {
          lat:      Number(_.get(options, 'position.lat', '0')),
          lng:      Number(_.get(options, 'position.lng', '0')),
          accuracy: Number(_.get(options, 'position.accuracy', '10000')),
        };
      }
    }

    // When Geolocation API is active, run the query
    const apiKey = process.env.FERROPOLY_GOOGLE_GEOCODING_API_KEY || null;
    if (doGeolocationApiCall && entry.position.accuracy < 2000 && apiKey) {
      const latlng = `${entry.position.lat},${entry.position.lng}`;
      try {
        const resp = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&location_type=ROOFTOP|RANGE_INTERPOLATED&key=${apiKey}`);
        logger.info(`${entry.gameId}: Geolocation API call ok`, resp.data);
        entry.location = resp.data;
      }
      catch (err) {
        logger.error(`${entry.gameId}: Error in Geocoding API`, err);
      }
    }

    self.emit('new', entry);
    await picBucketModel.save(entry);
    return entry;

  }

  /**
   * Returns a list of the elements fitting the filter
   * @param gameId
   * @param options see in the function
   * @param callback
   */
  async list(gameId, options, callback) {
    if (callback) {
      logger.info('>>>>>>> Callback is not supported anymore in list');
      return callback(new Error('Callback is not supported anymore in list'));
    }
    let filter = {gameId: gameId};

    // Not providing a teamId in the options returns ALL teams
    let teamId = _.get(options, 'teamId', null);
    if (teamId && teamId.length > 0) {
      filter.teamId = teamId;
    }

    // Not setting the uploaded filter does return ALL elements
    let uploaded = _.get(options, 'uploaded', undefined);
    if (!_.isUndefined(uploaded)) {
      filter.uploaded = uploaded;
    }

    const docs = await picBucketModel.findPicsByFilter(filter);

    if (docs) {
      logger.info(`${gameId}: got ${_.get(docs, 'length', -1)} pics in picBucket`, {gameId, filter});
    } else {
      logger.info('${gameId}: docs is empty!', {gameId, filter});
    }
    return docs;
  }

  /**
   * Deletes the pics in the DB ONLY. The pics on the server will be cleaned
   * up automatically using a server rule there.
   * @param gameId
   * @param callback
   * @returns {*}
   */
  async deleteAllPics(gameId, callback) {
    if (callback) {
      logger.info('>>>>>>> Callback is not supported anymore in deleteAllPics');
      return callback(new Error('Callback is not supported anymore in deleteAllPics'));
    }
    if (!gameId) {
      logger.info('No gameId provided, so nothing to delete');
      return;
    }
    logger.info(`${gameId}: deleting all pics`);
    await picBucketModel.deletePicBucket(gameId);
  }

  /**
   * Tests the connectivity to Google storage, emit an error if this fails
   * @param callback
   */
  testConnectivity(callback) {
    let self = this;
    storage.bucket(this.bucketName).getFiles({maxResults: 2}, (err, files) => {
      if (err) {
        self.emit('error', err);
        logger.info('Google Storage Accessibility Test was NEGATIVE!!');
        return callback(err);
      }
      logger.info(`Google Storage Accessibility Test was positive, found ${files.length} files`);
      return callback();
    });
  }


  async assignProperty(id, propertyId, callback) {
    if (callback) {
      logger.info('>>>>>>> Callback is not supported anymore in assignProperty');
      return callback(new Error('Callback is not supported anymore in assignProperty'));
    }
    return await picBucketModel.Model.findOneAndUpdate({_id: id}, {propertyId: propertyId});
  }
}


/// Now exporting the whole thing: there is only one single picBucket object
let picBucketObject = undefined;
/**
 * @param settings is the picBucket part of the settings
 * @returns {{confirmUpload: confirmUpload, announceUpload: announceUpload, list: list}}
 */
module.exports = function (settings) {
  if (!picBucketObject) {
    if (!settings) {
      throw (new Error('settings must be supplied in first call'))
    }
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw (new Error('GOOGLE_APPLICATION_CREDENTIALS must be defined and point to a valid json file'));
    }
    picBucketObject = new PicBucket(settings);
  }
  return picBucketObject;
}
