const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/lib/store/PicBucketStore.js'), 'utf8');
const script = source.replace(/^import .*;?\s*$/gm, '').replace('export const usePicBucketStore = ', 'const usePicBucketStore = ');

function createStore(response = []) {
  const dependencies = {
    defineStore: (name, definition) => definition,
    axios: {get: async () => ({data: response})},
    useTeamsStore: () => ({idToTeamName: () => 'Team'}),
    usePropertyStore: () => ({properties: new Map()}),
    DateTime: {fromISO: value => ({toMillis: () => Date.parse(value)})},
    assign: Object.assign,
    get: (object, key, fallback) => object[key] ?? fallback
  };
  const definition = new Function('deps', `const {${Object.keys(dependencies).join(',')}} = deps; ${script}\nreturn usePicBucketStore;`)(dependencies);
  return {...definition.state(), ...definition.actions};
}

test('does not display unconfirmed pictures from the initial load or subsequent socket updates', async () => {
  const store = createStore([
    {_id: 'waiting', uploaded: false, timestamp: '2026-01-01'},
    {_id: 'ready', uploaded: true, timestamp: '2026-01-02'}
  ]);

  await store.fetchPictures({gameId: 'game'});
  assert.deepEqual(store.pictures.map(picture => picture._id), ['ready']);

  store.addPicture({_id: 'socket-waiting', uploaded: false, timestamp: '2026-01-03'});
  assert.deepEqual(store.pictures.map(picture => picture._id), ['ready']);

  store.addPicture({_id: 'socket-waiting', uploaded: true, timestamp: '2026-01-03'});
  assert.deepEqual(store.pictures.map(picture => picture._id), ['ready', 'socket-waiting']);
});

test('removes a previously visible picture when its upload status becomes false', () => {
  const store = createStore();
  store.addPicture({_id: 'ready', uploaded: true, timestamp: '2026-01-01'});

  store.addPicture({_id: 'ready', uploaded: false, timestamp: '2026-01-01'});
  assert.deepEqual(store.pictures, []);
});

test('hides the selected picture details when it is no longer visible', () => {
  const store = createStore();
  store.addPicture({_id: 'ready', uploaded: true, timestamp: '2026-01-01'});

  const gallery = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/lib/components/pictures/PictureGallery.vue'), 'utf8');
  const script = gallery.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;?\s*$/gm, '');
  const dependencies = {
    usePicBucketStore: () => store,
    defineProps: () => ({}),
    computed: fn => ({get value() { return fn(); }}),
    ref: value => ({value}),
    onMounted() {},
    onBeforeUnmount() {}
  };
  const {onPictureSelected, selectedPicture, picturesAvailable} = new Function('deps', `const {${Object.keys(dependencies).join(',')}} = deps; ${script}\nreturn {onPictureSelected, selectedPicture, picturesAvailable};`)(dependencies);
  onPictureSelected(store.pictures[0]);
  assert.equal(selectedPicture.value._id, 'ready');

  store.addPicture({_id: 'ready', uploaded: false, timestamp: '2026-01-01'});
  assert.equal(selectedPicture.value, null);
  assert.equal(picturesAvailable.value, false);
});