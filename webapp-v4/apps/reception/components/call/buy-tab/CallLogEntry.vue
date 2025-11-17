<!---
  An Entry for the call log
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.11.2025
-->

<template>
  <div>
    <Message :severity="severity">
      {{ timestamp }}
      <span
          v-if="entry.title"
          class="title"
      > {{ entry.title }}
      </span>
      <span v-if="entry.title && entry.message">:&nbsp;</span>
      <span>
        {{ entry.message }}
      </span>
      <span
          v-if="entry.amount"
      >; Betrag: {{ entry.amount }} CHF </span>
    </Message>
  </div>
</template>

<script setup>

import Message from 'primevue/message';
import {computed} from 'vue';
import {LOG_TYPE_FAIL, LOG_TYPE_INFO, LOG_TYPE_SUCCESS} from '../../../lib/ReceptionLogEntry';
import {formatTime} from '../../../../../common/lib/formatters';

const props = defineProps({
  entry: {
    type:     Object,
    required: true,
    default:  () => {
    }
  }
});

const severity = computed(() => {
  switch (props.entry.type) {
    case LOG_TYPE_INFO:
      return 'info';
    case LOG_TYPE_FAIL:
      return 'error';
    case LOG_TYPE_SUCCESS:
      return 'success';
    default:
      return 'secondary';
  }
})

const timestamp = computed(() => {
  return formatTime(props.entry.timestamp);
})
</script>

<style scoped lang="scss">
.title {
  font-weight: bold;
}
</style>
