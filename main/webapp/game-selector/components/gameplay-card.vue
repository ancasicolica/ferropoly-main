<!---
  A single card with infos about a game
-->
<template lang="pug">
div
  ferro-card(:title="getGpProperty('gamename')")
    b-row
      b-col Spieldatum
      b-col {{getGpProperty('scheduling.gameDate') | formatDate}}
    b-row
      b-col Start
      b-col {{getGpProperty('scheduling.gameStart')}}
    b-row
      b-col Ende
      b-col {{getGpProperty('scheduling.gameEnd')}}
    b-row
      b-col Karte
      b-col {{getMapName()}}
    b-row
      b-col Löschdatum
      b-col {{getGpProperty('scheduling.deleteTs') | formatDate}}
    b-row
      b-col.id Id: {{getGpProperty('internal.gameId')}}
    b-row(v-if="!getGpProperty('internal.finalized')")
      b-alert(variant="warning" show) Das Spiel wurde im Editor noch nicht finalisiert und kann deshalb nicht gespielt werden!
    b-row
      b-col
        b-button.btn-gameplay(size="sm" variant="primary" v-if="gameRunning" :href="url.play") Spielen
        b-button.btn-gameplay(size="sm" v-if="gameOver" :href="url.play") Spiel ansehen
        b-button.btn-gameplay(size="sm" v-if="getGpProperty('internal.finalized')" :href="url.viewPricelist") Preisliste
        b-button.btn-gameplay(size="sm" variant="info" v-if="gameOver" :href="url.summary") Zusammenfassung

</template>

<script>
import {BIconTrash, BIconPerson, BIconPeople, BIconEye, BIconPencil} from 'bootstrap-vue';
import {get} from 'lodash';
import {getMapName} from '../../common/lib/mapTypes';
import FerroCard from '../../common/components/ferro-card/ferro-card.vue';
import {DateTime} from 'luxon';

export default {
  name      : 'GameplayCard',
  components: {FerroCard, BIconTrash, BIconPerson, BIconPeople, BIconEye, BIconPencil},
  model     : {},
  props     : {
    gameplay: {
      type   : Object,
      default: function () {
        return {};
      }
    }
  },
  data      : function () {
    return {
      url: {
        play         : `/reception/${this.gameplay.internal.gameId}`,
        viewPricelist: `/info/${this.gameplay.internal.gameId}`,
        summary      : `/summary/${this.gameplay.internal.gameId}`,
      }
    };
  },
  computed  : {
    /**
     * Is the game running?
     */
    gameRunning() {
      if (!this.getGpProperty('internal.finalized')) {
        // A game can't be running if it is not finalized
        return false;
      }
      let gameDate = DateTime.fromJSDate(this.getGpProperty('scheduling.gameDate'));
      return gameDate.hasSame(DateTime.now(), 'day');
    },
    /**
     * Is the game already over?
     */
    gameOver() {
      if (!this.getGpProperty('internal.finalized')) {
        // A game can't be over if it is not finalized
        return false;
      }
      let endOfGame = DateTime.fromJSDate(this.getGpProperty('scheduling.gameDate')).set({hour: 23, minute: 59});
      return DateTime.now() >= endOfGame;
    }
  },
  methods   : {
    /**
     * Get the property of the gameplay object
     * @param id
     */
    getGpProperty(id) {
      return get(this.gameplay, id, '');
    },
    /**
     * Returns the name of the map
     * @returns {string|string}
     */
    getMapName() {
      return getMapName(this.getGpProperty('internal.map'));
    }
  }
}
</script>

<style scoped>

.btn-gameplay {
  margin-top: 8px;
  margin-right: 8px;
}

.id {
  color: rgba(115, 115, 115, 0.73);
  font-size: x-small;
}

</style>
