<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div>
    <div v-if="picture">
      <h4>Bildinfos</h4>
      <compact-info title="Team">
        {{ picture.teamName }}
      </compact-info>
      <compact-info title="Upload-Zeitpunkt">
        {{ formatDateTime(picture.timestamp) }}
      </compact-info>
      <compact-info title="Aufnahmedatum">
        {{ formatDateTime(picture.lastModifiedDate) }}
      </compact-info>
      <compact-info title="Position bei Upload (GPS)">
        <a
            :href="mapUrl"
            target="_blank"
        >
          <FontAwesomeIcon :icon="faArrowUpRightFromSquare" />
          {{ formatPosition(picture.position) }}
        </a>
      </compact-info>
      <compact-info
          v-if="!readOnly"
          title="Bild einem Ort zuweisen"
      >
        <Select
            v-model="picBucketStore.activePicturePropertyId"
            :options="selectOptions"
            show-clear
            fluid
            option-label="location.name"
            option-value="uuid"
            editable
            @update:model-value="onLocationChange"
           />
        <div> {{ assignedProperty }}</div>
      </compact-info>
      <compact-info
          v-else
          title="Dem Bild zugewiesenes Ort"
      >
        {{ picture.locationName }}
      </compact-info>
    </div>
    <div v-else>
      Um Infos zu einem Bild zu erhalten, clicke auf den Titel des Bildes (Zeitpunkt und Teamname).gg
    </div>
  </div>
</template>

<script setup>
import CompactInfo from './CompactInfo.vue';
import Select from 'primevue/select';
import {formatDateTime, formatPosition} from '../../common/lib/formatters';
import {computed, ref} from 'vue';
import {usePropertyStore} from '../store/PropertyStore';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons';
import {usePicBucketStore} from '../store/PicBucketStore';

const props = defineProps({
  picture:  {
    type:     [Object, null],
    required: true,
    default:  null
  },
  readOnly: {
    type:     Boolean,
    required: false,
    default:  true
  }
});

const propertyStore    = usePropertyStore();
const picBucketStore = usePicBucketStore();
const assignedProperty = ref(null);

const mapUrl = computed(() => {
  return `https://maps.google.com?q=${props.picture.position.lat},${props.picture.position.lng}`;
});

const selectOptions = computed(() => {
  return [...propertyStore.properties.values()].sort((a, b) => a.searchText < b.searchText ? -1 : 1);
});

const onLocationChange = async function () {
  await picBucketStore.assignProperty(props.picture, picBucketStore.activePicturePropertyId);
}
</script>

<style scoped lang="scss">

</style>
