<!---
  Complete picture handling, not only for reception as the name suggest (but as was intended in the beginning).
  Suitable only where a full screen display is possible as enlargement of the pictures takes place in the
  parent container.

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.03.23
-->
<template lang="pug">
  b-container(fluid)
    div(v-if="pictures.length === 0")
      b-jumbotron(header="Bilder Gallerie" :lead="noPicLead")
        p {{noPicText}}
    div(v-if="pictureInfo === null && pictures.length > 0")
      b-row.mt-1(v-if="!filterDisabled")
        b-col
          b-form(inline)
            label.mr-2(for="filter") Team-Filter:
            b-form-select#filter(v-model="selectedFilter" :options="selectOptions")
            label.mr-2.ml-4(for="text") Text-Filter:
            b-form-input#text(v-model="textFilter" type="text")
            b-form-checkbox.mr-2.ml-4(v-model="reverseOrder" @change="onOrderChanged") Absteigende Reihenfolge
      picture-list.mt-2(:pictures="pictures"
        :team-id="selectedFilter"
        :extended="extended"
        :admin="admin"
        :text-filter="textFilter"
        :get-property-by-id="getPropertyById"
        :get-team-name-by-id="getTeamNameById"
        :reverse-order="reverseOrder"
        @zoom="onZoom")
    div(v-if="pictureInfo")
      picture-viewer(:picture="pictureInfo"
        :properties="properties"
        :extended="extended"
        :admin="admin"
        :edit-allowed="editAllowed"
        :get-property-by-id="getPropertyById"
        :get-team-name-by-id="getTeamNameById"
        @property-assigned="onPropertyAssigned"
        @close="onClose")
</template>

<script>

import PictureList from './PictureList.vue';
import PictureViewer from './PictureViewer.vue';
import {setBoolean, getItem} from '../../common/lib/localStorage';

export default {
  name      : 'ReceptionPictures',
  components: {PictureList, PictureViewer},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    /**
     * Filter section enabled?
     */
    filterDisabled: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    /**
     * Lead / title of the jumbotron when no pictures are available
     */
    noPicLead: {
      type   : String,
      default: () => {
        return 'Leider hat noch kein Team Bilder hochgeladen!'
      }
    },
    /**
     * Basic text when no pictures are available.
     */
    noPicText: {
      type   : String,
      default: () => {
        return 'Sobald Bilder verfügbar sind, findest Du diese hier.'
      }
    },
    /**
     * Function for returning the property object for a given ID
     */
    getPropertyById: {
      type   : Function,
      default: (p) => {
        console.warn('getPropertyById not implemented!', p);
        return null;
      }
    },
    /**
     * Extended true: shows more details, otherwise very basic
     */
    extended: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    /**
     * Admin true: shows infos for admins only
     */
    admin: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    /**
     * editAllowed true: basic edit functionality is available
     */
    editAllowed: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    /**
     * Function for returning the team name for a given ID
     */
    getTeamNameById: {
      type   : Function,
      default: (p) => {
        console.log('dummy only!', p);
        return null;
      }
    },
    /**
     * Pictures to show
     */
    pictures: {
      type   : Array,
      default: () => {
        return [];
      }
    },
    /**
     * Teams
     */
    teams: {
      type   : Array,
      default: () => {
        return [];
      }
    },
    /**
     * Array from Property Register from the store
     */
    properties: {
      type   : Array,
      default: () => {
        return [];
      }
    },

  },
  data      : function () {
    return {
      pictureInfo   : null,
      reverseOrder  : false,
      selectOptions : [
        {value: null, text: 'Alle'}
      ],
      selectedFilter: null,
      textFilter    : null
    };
  },
  computed  : {},
  created   : function () {
    let self = this;
    this.teams.forEach(t => {
      self.selectOptions.push({value: t.uuid, text: t.data.name});
    })
    this.reverseOrder = getItem('pictureReverseOrder', true);
  },
  methods   : {
    onZoom(info) {
      console.info('zoom', info);
      this.pictureInfo = info;
    },
    onClose() {
      this.pictureInfo = null;
    },
    /**
     * A property was assigned to a picture
     * @param obj
     */
    onPropertyAssigned(obj) {
      // obj has "picture" and "propertyId"
      console.log('property assigned', obj)
      this.$emit('property-assigned', obj);
    },
    onOrderChanged(e) {
      if (typeof e == 'boolean') {
        setBoolean('pictureReverseOrder', e);
        return;
      }
      setBoolean('pictureReverseOrder', true);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
