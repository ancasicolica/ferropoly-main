const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../../../webapp-v4/lib/components/pictures/PicturePreview.vue'), 'utf8');
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;?\s*$/gm, '');

function createPreview() {
  const dependencies = {
    defineProps: () => ({visible: true, src: 'picture.jpg'}),
    defineEmits: () => () => {},
    ref: value => ({value}),
    nextTick: () => Promise.resolve(),
    watch: () => {}
  };
  return new Function('deps', `const {${Object.keys(dependencies).join(',')}} = deps; ${script}\nreturn {image, imageWidth, imageHeight, zoom, dragging, onWheel, onPointerDown, onPointerMove, stopDrag, resetZoom};`)(dependencies);
}

test('dragging a zoomed picture scrolls the viewport and ends on pointer release', () => {
  const preview = createPreview();
  const captured = new Set();
  const viewport = {
    scrollLeft: 100,
    scrollTop: 80,
    setPointerCapture: id => captured.add(id),
    hasPointerCapture: id => captured.has(id),
    releasePointerCapture: id => captured.delete(id)
  };
  preview.zoom.value = 2;
  preview.onPointerDown({pointerId: 1, pointerType: 'mouse', button: 0, clientX: 40, clientY: 30, currentTarget: viewport, preventDefault() {}});
  assert.equal(preview.dragging.value, true);
  preview.onPointerMove({pointerId: 1, clientX: 20, clientY: 15, preventDefault() {}});
  assert.equal(viewport.scrollLeft, 120);
  assert.equal(viewport.scrollTop, 95);

  preview.stopDrag({pointerId: 1});
  assert.equal(preview.dragging.value, false);
  assert.equal(captured.size, 0);
  preview.onPointerMove({pointerId: 1, clientX: 0, clientY: 0, preventDefault() {}});
  assert.equal(viewport.scrollLeft, 120);
});

test('normal size, touch and secondary mouse button do not start dragging', () => {
  const preview = createPreview();
  const viewport = {setPointerCapture: () => assert.fail('drag should not start')};
  const event = {pointerId: 1, pointerType: 'mouse', button: 0, clientX: 0, clientY: 0, currentTarget: viewport, preventDefault() {}};
  preview.onPointerDown(event);
  preview.zoom.value = 2;
  preview.onPointerDown({...event, pointerType: 'touch'});
  preview.onPointerDown({...event, button: 2});
  assert.equal(preview.dragging.value, false);
});

test('resetting zoom releases an active drag', () => {
  const preview = createPreview();
  const captured = new Set();
  const viewport = {
    setPointerCapture: id => captured.add(id),
    hasPointerCapture: id => captured.has(id),
    releasePointerCapture: id => captured.delete(id)
  };
  preview.zoom.value = 2;
  preview.onPointerDown({pointerId: 1, pointerType: 'mouse', button: 0, clientX: 0, clientY: 0, currentTarget: viewport, preventDefault() {}});
  preview.resetZoom();
  assert.equal(preview.zoom.value, 1);
  assert.equal(preview.dragging.value, false);
  assert.equal(captured.size, 0);
});

test('wheel zoom keeps the same image point beneath the mouse, including a centered initial image', async () => {
  const preview = createPreview();
  const viewport = {
    scrollLeft: 0,
    scrollTop: 0,
    getBoundingClientRect: () => ({left: 20, top: 30, width: 500, height: 400})
  };
  preview.imageWidth.value = 400;
  preview.imageHeight.value = 300;
  preview.image.value = {
    getBoundingClientRect: () => ({
      left: 20 + Math.max(0, (500 - 400 * preview.zoom.value) / 2) - viewport.scrollLeft,
      top: 30 - viewport.scrollTop,
      width: 400 * preview.zoom.value,
      height: 300 * preview.zoom.value
    })
  };

  let dispatching = true;
  const wheel = deltaY => {
    dispatching = true;
    const result = preview.onWheel({deltaY, clientX: 320, clientY: 130, get currentTarget() {return dispatching ? viewport : null;}});
    dispatching = false;
    return result;
  };

  await wheel(-1);
  assert.equal(preview.zoom.value, 1.5);
  assert.equal(viewport.scrollLeft, 75);
  assert.equal(viewport.scrollTop, 50);

  await wheel(-1);
  assert.equal(preview.zoom.value, 2);
  assert.equal(viewport.scrollLeft, 200);
  assert.equal(viewport.scrollTop, 100);

  await wheel(1);
  assert.equal(preview.zoom.value, 1.5);
  assert.equal(viewport.scrollLeft, 75);
  assert.equal(viewport.scrollTop, 50);
});

test('wheel zoom respects zoom limits without moving the viewport', async () => {
  const preview = createPreview();
  const viewport = {scrollLeft: 40, scrollTop: 60};
  const event = {deltaY: 1, clientX: 100, clientY: 100, currentTarget: viewport};
  preview.imageWidth.value = 400;
  preview.imageHeight.value = 300;
  preview.image.value = {getBoundingClientRect: () => ({left: 0, top: 0, width: 400, height: 300})};
  await preview.onWheel(event);
  assert.equal(preview.zoom.value, 1);
  assert.equal(viewport.scrollLeft, 40);
  assert.equal(viewport.scrollTop, 60);
  preview.zoom.value = 4;
  await preview.onWheel({...event, deltaY: -1});
  assert.equal(preview.zoom.value, 4);
  assert.equal(viewport.scrollLeft, 40);
  assert.equal(viewport.scrollTop, 60);
});