/**
 * Postbox Controller
 * Created by kc on 09.08.18
 * Credits to Jacob Lee for the photo uploader, http://code.hootsuite.com/html5/
 */

'use strict';

function postboxController($scope, $http) {
  var exifinfo = {};

  // Send file to server
  function sendFile(fileData) {
    console.log('Uploading image data');
    var formData = new FormData();

    formData.append('imageData', fileData);
    formData.append('exif', exifinfo);
    formData.append('authToken', ferropoly.authToken);

    $.post('/postbox/uploadimage/' + ferropoly.gameplay._id + '/' + ferropoly.team.uuid, {
      authToken: ferropoly.authToken,
      imageData: fileData,
      exif     : exifinfo
    }, null, 'json').done(function (data) {
      console.log(data);

    }).fail(function (data, status) {

      console.log(data);
    });
    return;
    $.ajax({
      type       : 'POST',
      url        : '/postbox/uploadimage/' + ferropoly.gameplay._id + '/' + ferropoly.team.uuid,
      data       : formData,
      contentType: false,
      processData: false,
      success    : function (data) {
        console.log(data);
        if (data.success) {
          alert('Your file was successfully uploaded!');
        } else {
          alert('There was an error uploading your file!');
        }
      },
      error      : function (data) {
        console.error('Upload error', data);
        alert('There was an error uploading your file!');
      }
    });
  }

  // Process (compress) the image
  function processFile(dataURL, fileType) {
    var maxWidth  = 800;
    var maxHeight = 800;

    var image = new Image();
    image.src = dataURL;

    image.onload = function () {
      var width        = image.width;
      var height       = image.height;
      var shouldResize = (width > maxWidth) || (height > maxHeight);

      if (!shouldResize) {
        sendFile(dataURL);
        return;
      }

      var newWidth;
      var newHeight;

      if (width > height) {
        newHeight = height * (maxWidth / width);
        newWidth  = maxWidth;
      } else {
        newWidth  = width * (maxHeight / height);
        newHeight = maxHeight;
      }

      var canvas    = document.createElement('canvas');
      canvas.width  = newWidth;
      canvas.height = newHeight;

      var context = canvas.getContext('2d');
      context.drawImage(this, 0, 0, newWidth, newHeight);
      dataURL = canvas.toDataURL(fileType);
      sendFile(dataURL);
    };

    image.onerror = function () {
      alert('There was an error processing your file!');
    };
  }

  // Read the pic
  function readFile(file) {
    var reader = new FileReader();

    reader.onloadend = function () {
      processFile(reader.result, file.type);
    };

    reader.onerror = function () {
      alert('There was an error reading the file!');
    };

    reader.readAsDataURL(file);
  }

  // When ready, init handler for the image uploader
  $(document).ready(function () {
    console.log('ferrocam ready');

    var $inputField = $('#image-upload');

    $inputField.on('change', function (e) {
      var file = e.target.files[0];
      if (file) {
        if (/^image\//i.test(file.type)) {
          EXIF.getData(file, function () {
            exifinfo = {
              make            : EXIF.getTag(this, "Make"),
              model           : EXIF.getTag(this, "Model"),
              dateTimeOriginal: EXIF.getTag(this, "DateTimeOriginal")
            };
            console.warn(exifinfo);
            readFile(file);
          });
        } else {
          alert('Not a valid image!');
        }
      }
    });
  });
}

checkinApp.controller('postboxCtrl', postboxController);
postboxController.$inject = ['$scope', '$http'];

