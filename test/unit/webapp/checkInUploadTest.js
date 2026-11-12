const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/apps/check-in/components/upload/CheckInUpload.vue'), 'utf8');
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\s*$/gm, '');

function createUpload(failures = {}, tokenFailures = 0) {
  const calls = [];
  const delays = [];
  const toasts = [];
  const statuses = [];
  const error = new Error('Netzwerkfehler');
  const remainingFailures = {...failures};
  let upload;
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
    onMounted() {},
    onUnmounted() {},
    useGameplayStore: () => ({}),
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
    geograph: {getLastLocation: () => null},
    announcePicture: (gameId, teamId, options, callback) => {
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
  upload = new Function('deps', `const {${Object.keys(dependencies).join(',')}} = deps; ${script}\nreturn {performUpload, isUploading, uploadSuccess, uploadedThumbnailUrl, retryStatus};`)(dependencies);
  return {...upload, calls, delays, toasts, statuses};
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
  assert.equal(upload.isUploading.value, false);
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
  assert.equal(upload.isUploading.value, false);
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