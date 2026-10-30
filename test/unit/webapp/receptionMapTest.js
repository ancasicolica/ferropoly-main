const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('reception map restores filtered properties before the refresh finishes', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/apps/reception/components/map/MapRoot.vue'), 'utf8');
  const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\s*$/gm, '');
  const maps = new Map();
  const visibleProperties = new Set(['free']);
  let refreshCount = 0;
  let finishRefresh;

  const markers = {
    map: null,
    setMap(map) {
      this.map = map;
    },
    getBounds: () => ({north: 48, south: 47, east: 9, west: 8}),
    getCenter: () => ({lat: 47.5, lng: 8.5})
  };
  const routes = {
    setMap(map) {
      maps.get(map).routes = true;
    },
    applyTeamFilter() {}
  };
  const propertyStore = {
    ready: true,
    filter: {teams: []},
    updateFilter() {
      maps.get(markers.map).properties = new Set(visibleProperties);
    },
    async update() {
      refreshCount++;
      if (refreshCount === 2) {
        await new Promise(resolve => { finishRefresh = resolve; });
      }
      this.updateFilter();
    }
  };
  const dependencies = {
    onMounted() {},
    ref: value => ({value}),
    FerropolyMap: null,
    usePropertyStore: () => propertyStore,
    getMapMarkerInstance: () => markers,
    MARKER_MODE_RECEPTION: 'reception',
    MapFilters: null,
    CallActiveWarningBanner: null,
    getMapRoutesInstance: () => routes,
    useReceptionStore: () => ({setHelpUrl() {}})
  };
  const {onNewMap, mapRef} = new Function('deps', `const {${Object.keys(dependencies).join(',')}} = deps; ${script}\nreturn {onNewMap, mapRef};`)(dependencies);
  mapRef.value = {fitBounds() {}, setCenter() {}};

  const firstMap = {};
  maps.set(firstMap, {});
  await onNewMap(firstMap);
  assert.deepEqual([...maps.get(firstMap).properties], ['free']);

  const secondMap = {};
  maps.set(secondMap, {});
  const refresh = onNewMap(secondMap);
  assert.equal(refreshCount, 2);
  assert.equal(maps.get(secondMap).routes, true);
  assert.deepEqual([...maps.get(secondMap).properties || []], ['free']);
  finishRefresh();
  await refresh;
});

test('existing visible markers move to a new map while filtered-out markers stay hidden', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/lib/MapMarkers.js'), 'utf8');
  const script = source.replace(/^import .*;?\s*$/gm, '').replace(/^export \{MapMarkers, getMapMarkerInstance\}.*$/m, '');
  const MapMarkers = new Function('EventEmitter', 'useTeamsStore', 'toRaw', `
    ${script}
    return MapMarkers;
  `)(class {}, () => ({}), value => value);

  const oldMap = {};
  const newMap = {};
  const visibleMarker = {map: oldMap};
  const hiddenMarker = {map: oldMap};
  const markers = new MapMarkers();
  markers.ready = true;
  markers.propertyStore = {
    properties: new Map([
      ['visible', {visibleOnMap: true}],
      ['hidden', {visibleOnMap: false}]
    ])
  };
  markers.markers.set('visible', visibleMarker);
  markers.markers.set('hidden', hiddenMarker);
  markers.teamMarker = {map: oldMap};
  markers.setMap(newMap);

  assert.equal(visibleMarker.map, newMap);
  assert.equal(hiddenMarker.map, null);
  assert.equal(markers.teamMarker.map, newMap);
});