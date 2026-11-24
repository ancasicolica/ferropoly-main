<!---
  A single challenge for the Checkin
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.11.2026
-->

<template>
  <div>
    <h2>{{challenge.title}}</h2>
    <div v-html="challenge.description"></div>
    <div> Start: {{formatGameTime(challenge.schedule.start)}}</div>
    <div> Ende: {{formatGameTime(challenge.schedule.end)}}, {{formatTimestampAsAgo(challenge.schedule.end)}}</div>
    <div> Belohnung bei Erfüllung:
    <span v-if="challenge.reward.min === challenge.reward.max"> {{formatPrice(challenge.reward.min)}}</span>
    <span v-else> {{formatPrice(challenge.reward.min)}} - {{formatPrice(challenge.reward.max)}}</span>
    </div>
    <div> Beweis einreichen durch:
    <span v-if="challenge.proof.picture"> Bild oder Video</span>
    <span v-if="challenge.proof.text"> Text</span>
    <span v-if="challenge.proof.call"> Anruf</span>
    </div>

  </div>
</template>

<script setup>
import {Challenge} from '../../../../common/lib/Challenge';
import {formatGameTime, formatPrice, formatTimestampAsAgo} from '../../../../common/lib/formatters';

const props = defineProps({
  challenge: {
    type:     Object,
    required: true,
    default:  () => {
      return new Challenge();
    }
  }
});

</script>

<style scoped lang="scss">

</style>
