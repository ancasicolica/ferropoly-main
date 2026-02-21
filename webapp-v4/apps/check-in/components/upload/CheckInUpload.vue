<!---
  Uploading pictures in Check-in
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">Bilder hochladen</h1>
      <p>Während dem Spiel kannst Du Bilder an die Zentrale senden: um zu belegen, dass ihr an einem Ort seid oder
        einfach so zum Spass.</p>
      <p class="text-sm text-surface-500 dark:text-surface-400">Die Bilder sind nach dem Spiel für alle teilnehmenden
        Teams sichtbar und werden 30 Tage nach dem Spiel automatisch gelöscht.</p>
    </div>

    <div
        v-if="gameplayStore.gameActive"
        class="flex flex-col gap-4 mt-4"
    >
      <FileUpload
          mode="basic"
          name="demo[]"
          accept="image/*"
          :max-file-size="10000000"
          :disabled="isUploading"
          auto
          custom-upload
          choose-label="Foto aufnehmen"
          class="w-full"
          @select="onFileSelect"
      />

      <div
          v-if="isUploading"
          class="flex items-center gap-2 text-primary font-medium"
      >
        <i class="pi pi-spin pi-spinner"></i>
        <span>Bild wird verarbeitet und hochgeladen...</span>
      </div>

      <div
          v-if="uploadSuccess"
          class="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2"
      >
        <i class="pi pi-check-circle"></i>
        <span>Das Bild wurde erfolgreich hochgeladen!</span>
      </div>
    </div>

    <div
        v-else
        class="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg"
    >
      <p>Bilder können nur während dem Spiel hochgeladen werden.</p>
    </div>

    <!-- Hidden canvas for resizing -->
    <canvas
        ref="canvasRef"
        style="display: none;"
    ></canvas>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick} from 'vue';
import FileUpload from 'primevue/fileupload';
import {useGameplayStore} from '../../../../lib/store/GameplayStore';
import {useCheckInStore} from '../../store/CheckInStore';
import {usePicBucketStore} from '../../../../lib/store/PicBucketStore';
import {useToast} from 'primevue/usetoast';
import {getAuthToken} from '../../../../common/adapters/authToken';
import {announcePicture, uploadPicture, confirmPicture} from '../../lib/picUploader';

const gameplayStore  = useGameplayStore();
const checkInStore   = useCheckInStore();
const picBucketStore = usePicBucketStore();
const toast          = useToast();

const isUploading   = ref(false);
const uploadSuccess = ref(false);
const canvasRef     = ref(null);

onMounted(() => {
  // Ensure the input element has capture="environment" for mobile camera access
  nextTick(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.setAttribute('capture', 'environment');
    }
  });
});

const onFileSelect = async (event) => {
  const file = event.files[0];
  if (!file) {
    return;
  }

  isUploading.value   = true;
  uploadSuccess.value = false;

  try {
    const reader  = new FileReader();
    reader.onload = async (e) => {
      const dataURL = e.target.result;

      // 1. Process Large Image
      const largeBlob = await processImage(dataURL, {thumbnail: false});

      // 2. Process Thumbnail
      const thumbBlob = await processImage(dataURL, {thumbnail: true});

      // 3. Announce, Upload and Confirm
      await performUpload(largeBlob, thumbBlob, file.lastModifiedDate);
    };
    reader.readAsDataURL(file);
  }
  catch (error) {
    console.error('Error during file processing:', error);
    toast.add({severity: 'error', summary: 'Fehler', detail: 'Bild konnte nicht verarbeitet werden.', life: 5000});
    isUploading.value = false;
  }
};

/**
 * Resizes and crops image using canvas
 */
const processImage = (dataURL, options) => {
  return new Promise((resolve) => {
    const thumbnail = options.thumbnail;
    const maxWidth  = thumbnail ? 480 : 2800;
    const maxHeight = thumbnail ? 320 : 2800;

    const img  = new Image();
    img.src    = dataURL;
    img.onload = () => {
      const width  = img.width;
      const height = img.height;

      let canvas = canvasRef.value;
      if (!canvas) {
        canvas = document.createElement('canvas');
      }
      const ctx = canvas.getContext('2d');

      if (thumbnail) {
        // Thumbnail crop (4:3)
        const sw = width;
        const sh = (width / 4) * 3;
        const sx = 0;
        const sy = (height - sh) / 2;

        canvas.width  = 360;
        canvas.height = 270;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 360, 270);
      } else {
        // Normal resize
        let newWidth  = width;
        let newHeight = height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            newHeight = height * (maxWidth / width);
            newWidth  = maxWidth;
          } else {
            newWidth  = width * (maxHeight / height);
            newHeight = maxHeight;
          }
        }

        canvas.width  = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      }

      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    };
  });
};

/**
 * Handles the multi-step upload process
 */
const performUpload = async (largeBlob, thumbBlob, lastModifiedDate) => {
  const gameId  = checkInStore.gameId;
  const teamId  = checkInStore.team.uuid;
  let authToken = 'none';
  try {
    authToken = await getAuthToken();
  }
  catch (e) {
    console.warn('Could not retrieve authToken', e);
  }

  announcePicture(gameId, teamId, {
    authToken,
    lastModifiedDate
  }, (err, info) => {
    if (err) {
      handleError('Problem bei der Bild-Ankündigung', err);
      return;
    }

    // Upload Large
    uploadPicture(info.uploadUrl, largeBlob, (err) => {
      if (err) {
        handleError('Fehler beim Upload des Hauptbildes', err);
        return;
      }

      // Upload Thumbnail
      uploadPicture(info.thumbnailUrl, thumbBlob, (err) => {
        if (err) {
          handleError('Fehler beim Upload des Thumbnails', err);
          return;
        }

        // Confirm
        confirmPicture(info.id, {}, (err, data) => {
          if (err) {
            handleError('Fehler beim Abschluss des Uploads', err);
            return;
          }

          console.log('Upload complete', data);
          isUploading.value   = false;
          uploadSuccess.value = true;
          toast.add({severity: 'success', summary: 'Erfolg', detail: 'Bild erfolgreich hochgeladen', life: 5000});

          // Refresh pictures in store
          picBucketStore.fetchPictures({gameId, teamId});
        });
      });
    });
  });
};

const handleError = (infoText, err) => {
  console.error(infoText, err);
  isUploading.value = false;
  toast.add({
    severity: 'error',
    summary:  'Upload fehlgeschlagen',
    detail:   `${infoText}: ${err.message || err}`,
    life:     5000
  });
};
</script>

<style scoped lang="scss">
</style>
