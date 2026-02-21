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
      <div class="flex flex-col gap-2">
        <label
            for="property-select"
            class="font-medium"
        >
          Ort auswählen (empfohlen)
        </label>
        <Select
            id="property-select"
            v-model="selectedProperty"
            :options="[{uuid: null, name: 'Kein Ort', distance: null}, ...nearestProperties]"
            option-label="name"
            option-value="uuid"
            placeholder="Wähle einen Ort aus"
            class="w-full mb-8"
            :disabled="isUploading || nearestProperties.length === 0"
        >
          <template #option="slotProps">
            <div class="flex justify-between items-center">
              <span>{{ slotProps.option.name }}</span>
              <span
                  v-if="slotProps.option.distance !== null"
                  class="text-sm text-surface-500"
              >
                &nbsp;{{ Math.round(slotProps.option.distance) }}m
              </span>
            </div>
          </template>
        </Select>
      </div>

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
import {ref, onMounted, onUnmounted, nextTick, computed} from 'vue';
import FileUpload from 'primevue/fileupload';
import Select from 'primevue/select';
import {useGameplayStore} from '../../../../lib/store/GameplayStore';
import {useCheckInStore} from '../../store/CheckInStore';
import {usePicBucketStore} from '../../../../lib/store/PicBucketStore';
import {useToast} from 'primevue/usetoast';
import {getAuthToken} from '../../../../common/adapters/authToken';
import {announcePicture, uploadPicture, confirmPicture} from '../../lib/picUploader';
import geograph from '../../lib/geograph';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';

const gameplayStore  = useGameplayStore();
const checkInStore   = useCheckInStore();
const picBucketStore = usePicBucketStore();
const propertyStore  = usePropertyStore();
const toast          = useToast();

const isUploading           = ref(false);
const uploadSuccess         = ref(false);
const canvasRef             = ref(null);
const selectedProperty      = ref(null);
const positionUpdateTrigger = ref(0);

const nearestProperties = computed(() => {
  // Depend on trigger to recalculate when position updates
  positionUpdateTrigger.value;

  const currentPosition = geograph.getLastLocation();
  if (!currentPosition || !currentPosition.lat || !currentPosition.lng) {
    return [];
  }

  const properties = [...propertyStore.properties.values()];

  // Calculate distance for each property
  const propertiesWithDistance = properties
      .filter(p => p.location && p.location.position && p.location.position.lat && p.location.position.lng)
      .map(property => {
        const distance = calculateDistance(
            currentPosition.lat,
            currentPosition.lng,
            property.location.position.lat,
            property.location.position.lng
        );
        return {
          uuid:     property.uuid,
          name:     property.location.name,
          distance: distance
        };
      });

  // Sort by distance and take top 5
  return propertiesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
});

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R    = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c    = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Distance in meters
};

const handlePositionUpdate = () => {
  positionUpdateTrigger.value++;
};

onMounted(() => {
  // Ensure the input element has capture="environment" for mobile camera access
  nextTick(() => {
    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.setAttribute('capture', 'environment');
    }
  });

  // Listen for position updates
  geograph.on('player-position-update', handlePositionUpdate);
});

onUnmounted(() => {
  geograph.off('player-position-update', handlePositionUpdate);
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
    lastModifiedDate,
    propertyId: selectedProperty.value
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
