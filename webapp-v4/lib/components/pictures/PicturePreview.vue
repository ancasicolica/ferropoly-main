<!---
  Picture Preview, created by GPT-6 Sol
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.11.2026
-->
<template>
  <Dialog
      :visible="visible"
      modal
      :style="{width: '100vw', height: '100dvh', maxHeight: '100dvh', margin: 0, borderRadius: 0}"
      :content-style="{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden'}"
      @update:visible="emit('update:visible', $event)"
      @hide="resetZoom"
  >
    <div class="zoom-controls">
      <button
          type="button"
          aria-label="Bild verkleinern"
          :disabled="zoom <= 1"
          @click="changeZoom(-0.5)"
      >−
      </button>
      <span>{{ Math.round(zoom * 100) }} %</span>
      <button
          type="button"
          aria-label="Bild vergrössern"
          :disabled="zoom >= 4"
          @click="changeZoom(0.5)"
      >+
      </button>
      <button
          type="button"
              :disabled="zoom === 1"
          @click="resetZoom">
        Zurücksetzen
      </button>
    </div>
    <div
        class="picture-viewport"
        :class="{'can-drag': zoom > 1, dragging}"
        @wheel.prevent="onWheel"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
        @lostpointercapture="stopDrag"
    >
      <img
          :key="src"
          ref="image"
          :src="src"
          :alt="alt"
          draggable="false"
          :style="zoom > 1 ? {width: `${imageWidth * zoom}px`, height: `${imageHeight * zoom}px`, maxWidth: 'none', maxHeight: 'none'} : {}"
          class="picture-preview"
          @load="measureImage"
      />
    </div>
  </Dialog>
</template>

<script setup>

import Dialog from 'primevue/dialog';
import {nextTick, ref, watch} from 'vue';

const props = defineProps({
  visible: Boolean,
  src:     String,
  alt:     String
});

const emit        = defineEmits(['update:visible']);
const image       = ref(null);
const imageWidth  = ref(0);
const imageHeight = ref(0);
const zoom        = ref(1);
const dragging    = ref(false);
let dragTarget    = null;
let dragPointerId = null;
let lastX         = 0;
let lastY         = 0;

const stopDrag = event => {
  if (!dragging.value || (event && event.pointerId !== dragPointerId)) {
    return;
  }
  dragging.value = false;
  if (dragTarget.hasPointerCapture(dragPointerId)) {
    dragTarget.releasePointerCapture(dragPointerId);
  }
  dragTarget    = null;
  dragPointerId = null;
};

const resetZoom = () => {
  stopDrag();
  zoom.value = 1;
};

const measureImage = () => {
  imageWidth.value  = image.value.clientWidth;
  imageHeight.value = image.value.clientHeight;
};

const changeZoom = amount => {
  if (!imageWidth.value || !imageHeight.value) {
    return;
  }
  zoom.value = Math.max(1, Math.min(4, zoom.value + amount));
  if (zoom.value === 1) {
    stopDrag();
  }
};

const onWheel = async event => {
  if (!image.value || !imageWidth.value || !imageHeight.value) {
    return;
  }
  const viewport     = event.currentTarget;
  const bounds       = image.value.getBoundingClientRect();
  const x            = (event.clientX - bounds.left) / bounds.width;
  const y            = (event.clientY - bounds.top) / bounds.height;
  const previousZoom = zoom.value;
  changeZoom(event.deltaY < 0 ? 0.5 : -0.5);
  if (zoom.value === previousZoom) {
    return;
  }
  await nextTick();
  const newBounds = image.value.getBoundingClientRect();
  viewport.scrollLeft += newBounds.left + x * newBounds.width - event.clientX;
  viewport.scrollTop += newBounds.top + y * newBounds.height - event.clientY;
};

const onPointerDown = event => {
  if (zoom.value <= 1 || dragging.value || event.pointerType === 'touch' || event.button !== 0) {
    return;
  }
  event.preventDefault();
  dragTarget    = event.currentTarget;
  dragPointerId = event.pointerId;
  lastX         = event.clientX;
  lastY         = event.clientY;
  dragTarget.setPointerCapture(dragPointerId);
  dragging.value = true;
};

const onPointerMove = event => {
  if (!dragging.value || event.pointerId !== dragPointerId) {
    return;
  }
  event.preventDefault();
  dragTarget.scrollLeft -= event.clientX - lastX;
  dragTarget.scrollTop -= event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
};

watch(() => props.visible, resetZoom);
watch(() => props.src, () => {
  resetZoom();
  imageWidth.value  = 0;
  imageHeight.value = 0;
});

</script>

<style scoped lang="scss">
.zoom-controls {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  button {
    padding: 0.25rem 0.5rem;
    cursor: pointer;

    &:disabled {
      cursor: default;
    }
  }
}

.picture-viewport {
  flex: 1;
  min-height: 0;
  overflow: auto;

  &.can-drag {
    cursor: grab;
  }

  &.dragging {
    cursor: grabbing;
  }
}

.picture-preview {
  display: block;
  max-width: 100%;
  max-height: calc(100dvh - 10rem);
  object-fit: contain;
  margin: auto;
  user-select: none;
}
</style>
