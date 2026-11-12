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
                &nbsp;{{ Math.round(slotProps.option.distance) }} km
              </span>
            </div>
          </template>
        </Select>
      </div>

      <FileUpload
          mode="basic"
          name="demo[]"
          accept="image/*"
          :pt="{input: {capture: 'environment'}}"
          :max-file-size="10000000"
          :disabled="isUploading"
          auto
          custom-upload
          choose-label="Foto aufnehmen"
          class="w-full"
          @select="onFileSelect"
      >
        <template #chooseicon>
          <FontAwesomeIcon :icon="faCamera" />
        </template>
      </FileUpload>

      <FileUpload
          mode="basic"
          name="demo[]"
          accept="image/*"
          :max-file-size="10000000"
          :disabled="isUploading"
          auto
          custom-upload
          choose-label="Bild auswählen"
          class="w-full"
          @select="onFileSelect"
      >
        <template #chooseicon>
          <FontAwesomeIcon :icon="faImage" />
        </template>
      </FileUpload>

      <div
          v-if="isUploading"
          class="flex items-center gap-2 text-primary font-medium"
      >
        <i class="pi pi-spin pi-spinner"></i>
        <span>Bild wird verarbeitet und hochgeladen...</span>
      </div>

      <p v-if="isUploading && retryStatus" role="status" class="text-sm text-primary">
        {{ retryStatus }}
      </p>

      <div
          v-if="uploadSuccess"
          class="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex flex-col gap-2"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-check-circle"></i>
          <span>Das Bild wurde erfolgreich hochgeladen!</span>
        </div>
        <img
            v-if="uploadedThumbnailUrl"
            :src="uploadedThumbnailUrl"
            alt="Hochgeladenes Bild"
            class="w-full rounded-lg mt-2"
        />
      </div>
    </div>

    <div
        v-else
        class="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg"
    >
      <p>Bilder können nur während dem Spiel hochgeladen werden.</p>
    </div>

    <div v-if="pendingPictures.length" class="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex flex-col gap-2" role="status">
      <p>{{ pendingPictures.length }} Bild(er) auf diesem Gerät für dieses Team gespeichert und noch nicht bestätigt.</p>
      <p class="text-sm">Die Bilder bleiben nur in diesem Browser erhalten. Bei geöffneter App und aktivem Spiel werden sie automatisch hochgeladen, sobald die Verbindung wieder besteht. Bitte Browserdaten nicht löschen.</p>
      <button type="button" class="font-medium text-primary underline" :disabled="isUploading || !gameplayStore.gameActive" @click="uploadPendingPictures">
        Gespeicherte Bilder jetzt hochladen
      </button>
      <p v-if="!gameplayStore.gameActive" class="text-sm">Ein Upload ist erst während eines aktiven Spiels möglich.</p>
    </div>

    <!-- Hidden canvas for resizing -->
    <canvas
        ref="canvasRef"
        style="display: none;"
    ></canvas>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed} from 'vue';
import FileUpload from 'primevue/fileupload';
import Select from 'primevue/select';
import {useGameplayStore} from '../../../../lib/store/GameplayStore';
import {useCheckInStore} from '../../store/CheckInStore';
import {usePicBucketStore} from '../../../../lib/store/PicBucketStore';
import {useToast} from 'primevue/usetoast';
import {getAuthToken} from '../../../../common/adapters/authToken';
import {announcePicture, uploadPicture, confirmPicture} from '../../lib/picUploader';
import {savePendingPicture, listPendingPictures, removePendingPicture} from '../../lib/pendingPictures';
import geograph from '../../lib/geograph';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faCamera, faImage} from '@fortawesome/free-solid-svg-icons';

const gameplayStore  = useGameplayStore();
const checkInStore   = useCheckInStore();
const picBucketStore = usePicBucketStore();
const propertyStore  = usePropertyStore();
const toast          = useToast();

const isUploading           = ref(false);
const uploadSuccess         = ref(false);
const uploadedThumbnailUrl = ref(null);
const retryStatus           = ref('');
const canvasRef             = ref(null);
const selectedProperty      = ref(null);
const positionUpdateTrigger = ref(0);
const pendingPictures       = ref([]);

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
  return R * c; // Distance in kilometers
};

const handlePositionUpdate = () => {
  positionUpdateTrigger.value++;
};

onMounted(() => {
  // Listen for position updates
  geograph.on('player-position-update', handlePositionUpdate);
  window.addEventListener('online', uploadPendingPictures);
  loadPendingPictures().then(() => uploadPendingPictures());
});

onUnmounted(() => {
  geograph.removeListener('player-position-update', handlePositionUpdate);
  window.removeEventListener('online', uploadPendingPictures);
});

const loadPendingPictures = async () => {
  try {
    pendingPictures.value = (await listPendingPictures()).filter(picture =>
      picture.gameId === checkInStore.gameId && picture.teamId === checkInStore.team?.uuid);
  }
  catch (err) {
    console.error('Could not read locally saved pictures', err);
    toast.add({severity: 'error', summary: 'Lokaler Speicher', detail: 'Gespeicherte Bilder konnten nicht gelesen werden.', life: 5000});
  }
};

const readImage = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const uploadPendingPictures = async () => {
  if (isUploading.value || !gameplayStore.gameActive || !navigator.onLine || !checkInStore.gameId || !checkInStore.team?.uuid) {
    return;
  }
  isUploading.value = true;
  try {
    await loadPendingPictures();
    for (const picture of pendingPictures.value) {
      if (!gameplayStore.gameActive || !navigator.onLine) {
        break;
      }
      await uploadPendingPicture(picture);
    }
  }
  catch (err) {
    handleError('Gespeicherte Bilder konnten nicht hochgeladen werden', err);
  }
  finally {
    isUploading.value = false;
    retryStatus.value = '';
  }
};

const uploadPendingPicture = async picture => {
  try {
    const dataURL = await readImage(picture.file);
    const largeBlob = await processImage(dataURL, {thumbnail: false});
    const thumbBlob = await processImage(dataURL, {thumbnail: true});
    const success = await performUpload(largeBlob, thumbBlob, picture.lastModifiedDate, picture);
    if (success) {
      await removePendingPicture(picture.id);
      await loadPendingPictures();
      return true;
    }
    return false;
  }
  catch (err) {
    handleError('Gespeichertes Bild konnte nicht verarbeitet oder entfernt werden', err);
    return false;
  }
};

const onFileSelect = async (event) => {
  const file = event.files[0];
  if (!file || isUploading.value) {
    return;
  }

  isUploading.value   = true;
  uploadSuccess.value = false;
  retryStatus.value   = '';

  let saved = false;
  try {
    const position = geograph.getLastLocation();
    const picture = {
      file,
      gameId: checkInStore.gameId,
      teamId: checkInStore.team.uuid,
      propertyId: selectedProperty.value,
      lastModifiedDate: new Date(file.lastModified || Date.now()).toISOString(),
      position: position ? {lat: position.lat, lng: position.lng, accuracy: position.accuracy} : null
    };
    picture.id = await savePendingPicture(picture);
    saved = true;
    await loadPendingPictures();
    if (navigator.onLine) {
      await uploadPendingPicture(picture);
    }
    else {
      toast.add({severity: 'info', summary: 'Bild gespeichert', detail: 'Das Bild wird bei der nächsten Verbindung hochgeladen.', life: 5000});
    }
  }
  catch (error) {
    handleError(saved ? 'Bild bleibt lokal gespeichert' : 'Bild konnte nicht lokal gespeichert werden', error, saved);
  }
  finally {
    isUploading.value = false;
  }
};

/**
 * Resizes and crops image using canvas
 */
const processImage = (dataURL, options) => {
  return new Promise((resolve, reject) => {
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

      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Bild konnte nicht verarbeitet werden')), 'image/jpeg', 0.8);
    };
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
  });
};

/**
 * Handles the multi-step upload process
 */
const retryStep = async (step, operation) => {
  const delays = [1000, 2000, 6000, 8000, 12000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
        Promise.resolve(operation((err, data) => err ? reject(err) : resolve(data))).catch(reject);
      });
      retryStatus.value = '';
      return result;
    }
    catch (err) {
      if (attempt === delays.length) {
        retryStatus.value = '';
        throw err;
      }

      const seconds = delays[attempt] / 1000;
      retryStatus.value = `Problem beim Schritt „${step}“. Wiederholung ${attempt + 1} von ${delays.length} in ${seconds} s.`;
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      retryStatus.value = `Wiederhole Schritt „${step}“ (${attempt + 1} von ${delays.length})...`;
    }
  }
};

const performUpload = async (largeBlob, thumbBlob, lastModifiedDate, picture = {}) => {
  const gameId  = picture.gameId || checkInStore.gameId;
  const teamId  = picture.teamId || checkInStore.team.uuid;
  uploadSuccess.value = false;

  let step = 'Bild-Ankündigung';
  try {
    const info = await retryStep(step, async callback => {
      const authToken = await getAuthToken();
      announcePicture(gameId, teamId, {
        authToken,
        lastModifiedDate,
        propertyId: picture.propertyId !== undefined ? picture.propertyId : selectedProperty.value,
        position: picture.position
      }, callback);
    });

    step = 'Upload des Hauptbildes';
    await retryStep(step, callback => uploadPicture(info.uploadUrl, largeBlob, callback));

    step = 'Upload des Thumbnails';
    await retryStep(step, callback => uploadPicture(info.thumbnailUrl, thumbBlob, callback));

    step = 'Abschluss des Uploads';
    const data = await retryStep(step, callback => confirmPicture(info.id, {position: picture.position}, callback));

    console.log('Upload complete', data);
    uploadSuccess.value        = true;
    uploadedThumbnailUrl.value = data.thumbnail;
    toast.add({severity: 'success', summary: 'Erfolg', detail: 'Bild erfolgreich hochgeladen', life: 5000});

    // Refresh pictures in store
    picBucketStore.fetchPictures({gameId, teamId});
    return true;
  }
  catch (err) {
    handleError(`Problem beim Schritt „${step}“`, err);
    return false;
  }
};

const handleError = (infoText, err, saved = true) => {
  console.error(infoText, err);
  toast.add({
    severity: 'error',
    summary:  'Upload fehlgeschlagen',
    detail:   `${infoText}: ${err.message || err}.${saved ? ' Das Bild bleibt lokal gespeichert und kann später erneut hochgeladen werden.' : ' Bitte versuche es erneut oder sichere das Foto auf Deinem Gerät.'}`,
    life:     5000
  });
};
</script>

<style scoped lang="scss">
</style>
