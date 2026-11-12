const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/apps/check-in/components/upload/CheckInUpload.vue'), 'utf8');
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\s*$/gm, '');

function createUpload(failures = {}, tokenFailures = 0, state = {pictures: [], online: true}) {
  const calls = [];
  const delays = [];
  const toasts = [];
  const statuses = [];
  const error = new Error('Netzwerkfehler');
  const remainingFailures = {...failures};
  let upload;
  const mounted = [];
  const events = {};
  const announcements = [];
  const request = (step, result, callback) => {
    calls.push(step);
    statuses.push(upload.retryStatus.value);
    if (remainingFailures[step] > 0) {
      remainingFailures[step]--;
      callback(error);
    } else {
      callback(null, result);
    }
  };
  const dependencies = {
    ref: value => ({value}),
    computed: fn => ({get value() { return fn(); }}),
    onMounted: callback => mounted.push(callback),
    onUnmounted() {},
    useGameplayStore: () => ({gameActive: true}),
    useCheckInStore: () => ({gameId: 'game', team: {uuid: 'team'}}),
    usePicBucketStore: () => ({fetchPictures: () => calls.push('refresh')}),
    usePropertyStore: () => ({properties: new Map()}),
    useToast: () => ({add: toast => toasts.push(toast)}),
    getAuthToken: async () => {
      calls.push('token');
      if (tokenFailures-- > 0) {
        throw error;
      }
      return `token-${calls.filter(call => call === 'token').length}`;
    },
    geograph: {getLastLocation: () => null, on() {}, removeListener() {}},
    window: {addEventListener: (name, callback) => { events[name] = callback; }, removeEventListener() {}},
    navigator: {get onLine() { return state.online; }},
    FileReader: class {
      readAsDataURL(file) {
        this.result = file;
        queueMicrotask(() => this.onload());
      }
    },
    Image: class {
      set src(value) {
        this.width = 100;
        this.height = 100;
        queueMicrotask(() => this.onload());
      }
    },
    document: {createElement: () => ({getContext: () => ({drawImage() {}}), toBlob: callback => callback('image blob')})},
    savePendingPicture: async picture => {
      if (state.failSave) {
        throw error;
      }
      const id = state.pictures.length + 1;
      state.pictures.push({...picture, id});
      return id;
    },
    listPendingPictures: async () => [...state.pictures],
    removePendingPicture: async id => { state.pictures.splice(state.pictures.findIndex(picture => picture.id === id), 1); },
    announcePicture: (gameId, teamId, options, callback) => {
      announcements.push(options);
      calls.push(options.authToken);
      request('announce', {id: 'picture', uploadUrl: 'large', thumbnailUrl: 'thumb'}, callback);
    },
    uploadPicture: (url, blob, callback) => request(url, null, callback),
    confirmPicture: (id, options, callback) => request('confirm', {thumbnail: 'image'}, callback),
    setTimeout: (callback, delay) => {
      delays.push(delay);
      statuses.push(upload.retryStatus.value);
      queueMicrotask(callback);
    }
  };
  upload = new Function('deps', `const {${Object.keys(dependencies).join(',')}} = deps; ${script}\nreturn {performUpload, onFileSelect, uploadPendingPictures, isUploading, uploadSuccess, uploadedThumbnailUrl, retryStatus, pendingPictures, selectedProperty};`)(dependencies);
  return {...upload, calls, delays, toasts, statuses, state, events, mounted, announcements};
}

test('retries only the failed step with the configured delays', async () => {
  const upload = createUpload({thumb: 3});
  upload.isUploading.value = true;

  await upload.performUpload('large blob', 'thumb blob', new Date());

  assert.deepEqual(upload.calls, ['token', 'token-1', 'announce', 'large', 'thumb', 'thumb', 'thumb', 'thumb', 'confirm', 'refresh']);
  assert.deepEqual(upload.delays, [1000, 2000, 6000]);
  assert.deepEqual(upload.statuses.filter(status => status.startsWith('Problem')), [
    'Problem beim Schritt „Upload des Thumbnails“. Wiederholung 1 von 5 in 1 s.',
    'Problem beim Schritt „Upload des Thumbnails“. Wiederholung 2 von 5 in 2 s.',
    'Problem beim Schritt „Upload des Thumbnails“. Wiederholung 3 von 5 in 6 s.'
  ]);
  assert.deepEqual(upload.statuses.filter(status => status.startsWith('Wiederhole')), [
    'Wiederhole Schritt „Upload des Thumbnails“ (1 von 5)...',
    'Wiederhole Schritt „Upload des Thumbnails“ (2 von 5)...',
    'Wiederhole Schritt „Upload des Thumbnails“ (3 von 5)...'
  ]);
  assert.equal(upload.uploadSuccess.value, true);
  assert.equal(upload.uploadedThumbnailUrl.value, 'image');
  assert.equal(upload.retryStatus.value, '');
  assert.equal(upload.toasts.at(-1).severity, 'success');
});

test('retries announcement, main upload and confirmation individually', async () => {
  for (const step of ['announce', 'large', 'confirm']) {
    const upload = createUpload({[step]: 1});
    upload.isUploading.value = true;

    await upload.performUpload('large blob', 'thumb blob', new Date());

    assert.equal(upload.calls.filter(call => call === step).length, 2, step);
    assert.equal(upload.calls.filter(call => call === 'refresh').length, 1, step);
    assert.deepEqual(upload.delays, [1000], step);
    assert.equal(upload.uploadSuccess.value, true, step);
  }
});

test('reports final failure after all retries without continuing to the next step', async () => {
  const upload = createUpload({large: 6});
  upload.isUploading.value = true;

  await upload.performUpload('large blob', 'thumb blob', new Date());

  assert.deepEqual(upload.calls, ['token', 'token-1', 'announce', 'large', 'large', 'large', 'large', 'large', 'large']);
  assert.deepEqual(upload.delays, [1000, 2000, 6000, 8000, 12000]);
  assert.equal(upload.uploadSuccess.value, false);
  assert.equal(upload.retryStatus.value, '');
  assert.equal(upload.toasts.at(-1).severity, 'error');
});

test('uploads without retries when every step succeeds', async () => {
  const upload = createUpload();
  upload.isUploading.value = true;

  await upload.performUpload('large blob', 'thumb blob', new Date());

  assert.deepEqual(upload.calls, ['token', 'token-1', 'announce', 'large', 'thumb', 'confirm', 'refresh']);
  assert.deepEqual(upload.delays, []);
  assert.equal(upload.retryStatus.value, '');
  assert.match(source, /v-if="isUploading && retryStatus" role="status"/);
});

test('retrieves a new auth token when announcement fails', async () => {
  const upload = createUpload({announce: 1});

  await upload.performUpload('large blob', 'thumb blob', new Date());

  assert.deepEqual(upload.calls, ['token', 'token-1', 'announce', 'token', 'token-2', 'announce', 'large', 'thumb', 'confirm', 'refresh']);
  assert.deepEqual(upload.delays, [1000]);
  assert.equal(upload.uploadSuccess.value, true);
});

test('retries failed auth token retrieval before announcing the picture', async () => {
  const upload = createUpload({}, 1);

  await upload.performUpload('large blob', 'thumb blob', new Date());

  assert.deepEqual(upload.calls, ['token', 'token', 'token-2', 'announce', 'large', 'thumb', 'confirm', 'refresh']);
  assert.deepEqual(upload.delays, [1000]);
  assert.equal(upload.uploadSuccess.value, true);
});

test('stops without announcing when auth token retrieval repeatedly fails', async () => {
  const upload = createUpload({}, 6);

  await upload.performUpload('large blob', 'thumb blob', new Date());

  assert.deepEqual(upload.calls, Array(6).fill('token'));
  assert.deepEqual(upload.delays, [1000, 2000, 6000, 8000, 12000]);
  assert.equal(upload.uploadSuccess.value, false);
  assert.equal(upload.toasts.at(-1).severity, 'error');
});

test('stores a camera picture offline and resumes it after returning online', async () => {
  const state = {pictures: [], online: false};
  const upload = createUpload({}, 0, state);
  upload.selectedProperty.value = 'property-one';
  await upload.onFileSelect({files: [{lastModified: 12345}]});

  assert.equal(state.pictures.length, 1);
  assert.equal(state.pictures[0].propertyId, 'property-one');
  assert.equal(state.pictures[0].lastModifiedDate, new Date(12345).toISOString());
  assert.equal(upload.pendingPictures.value.length, 1);
  assert.deepEqual(upload.calls, []);
  assert.equal(upload.isUploading.value, false);

  const reopened = createUpload({}, 0, state);
  reopened.selectedProperty.value = 'property-two';
  reopened.mounted[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(reopened.pendingPictures.value.length, 1);
  state.online = true;
  await reopened.events.online();

  assert.equal(state.pictures.length, 0);
  assert.equal(reopened.pendingPictures.value.length, 0);
  assert.equal(reopened.uploadSuccess.value, true);
  assert.equal(reopened.isUploading.value, false);
  assert.equal(reopened.announcements[0].propertyId, 'property-one');
  assert.equal(reopened.announcements[0].lastModifiedDate, new Date(12345).toISOString());
  assert.deepEqual(reopened.calls, ['token', 'token-1', 'announce', 'large', 'thumb', 'confirm', 'refresh']);
});

test('check-in keeps the upload queue mounted while another page is displayed', () => {
  const root = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/apps/check-in/components/CheckInRoot.vue'), 'utf8');
  assert.match(root, /import CheckInUpload from '\.\/upload\/CheckInUpload\.vue';/);
  assert.match(root, /<CheckInUpload\s+v-show="\$route\.name === 'upload'"\s*\/>/);
  assert.match(root, /<router-view v-if="\$route\.name !== 'upload'"\s*\/>/);
});

test('keeps an image after exhausted retries for manual upload later', async () => {
  const state = {pictures: [], online: true};
  const upload = createUpload({large: 6}, 0, state);
  await upload.onFileSelect({files: [{lastModified: 12345}]});

  assert.equal(state.pictures.length, 1);
  assert.equal(upload.pendingPictures.value.length, 1);
  assert.equal(upload.isUploading.value, false);
  assert.equal(upload.toasts.at(-1).severity, 'error');

  await upload.uploadPendingPictures();
  assert.equal(state.pictures.length, 0);
  assert.equal(upload.uploadSuccess.value, true);
});

test('only resumes pictures belonging to the current game and team', async () => {
  const state = {pictures: [{id: 1, gameId: 'another-game', teamId: 'team', file: {}, lastModifiedDate: 12345}], online: true};
  const upload = createUpload({}, 0, state);

  await upload.uploadPendingPictures();

  assert.equal(state.pictures.length, 1);
  assert.equal(upload.pendingPictures.value.length, 0);
  assert.deepEqual(upload.calls, []);
});

test('does not upload or claim a backup when local storage fails', async () => {
  const state = {pictures: [], online: true, failSave: true};
  const upload = createUpload({}, 0, state);

  await upload.onFileSelect({files: [{lastModified: 12345}]});

  assert.deepEqual(upload.calls, []);
  assert.equal(upload.isUploading.value, false);
  assert.equal(upload.toasts.at(-1).severity, 'error');
  assert.match(upload.toasts.at(-1).detail, /nicht lokal gespeichert/);
  assert.doesNotMatch(upload.toasts.at(-1).detail, /bleibt lokal gespeichert/);
});