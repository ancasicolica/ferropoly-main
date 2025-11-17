<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.11.2025
-->

<template>
  <div>
    <Panel
        :pt="{header:{style:{'padding-top': '4px','padding-bottom': '4px'}}}"
        style="height: 100%"
    >
      <template #header>
        <h3> Gambling </h3>
      </template>
      <InputGroup>
      <InputNumber
          v-model="gamblingAmount"
          locale="de-CH"
          :min="min"
          :max="max"
          show-buttons
          :step="1000"
          :allow-empty="allowEmpty"
      />
      <InputGroupAddon>
        <Button
            label="Gewinn"
            severity="success"
            @click="onWin"
        />
      </InputGroupAddon>
      <InputGroupAddon>
        <Button
            label="Verlust"
            severity="danger"
            @click="onLose"
        />
      </InputGroupAddon>
      </InputGroup>
      <div>Gültiger Bereich: {{ formatPrice(min) }} - {{ formatPrice(max) }}</div>
    </Panel>
  </div>
</template>

<script setup>
import Panel from 'primevue/panel';
import Button from 'primevue/button';

import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

import InputNumber from 'primevue/inputnumber';
import {computed, ref} from 'vue';
import {useGameplayStore} from '../../../../../lib/store/GameplayStore';
import {formatPrice} from '../../../../../common/lib/formatters';
import {getItem, setInt} from '../../../../../common/lib/sessionStorage';
import {useReceptionStore} from '../../../store/ReceptionStore';

const gameplayStore  = useGameplayStore();
const receptionStore = useReceptionStore();
const gamblingAmount = ref(getItem('GamblingValue', gameplayStore.gameplay.gameParams.chancellery.minGambling));

const min = computed(() => gameplayStore.gameplay.gameParams.chancellery.minGambling);
const max = computed(() => gameplayStore.gameplay.gameParams.chancellery.maxGambling);
const allowEmpty = ref(false);

const onWin = function() {
  console.log('The winner takes it all');
  setInt('GamblingValue', gamblingAmount.value);
  receptionStore.gamble(gamblingAmount.value);
}

const onLose = function() {
  console.log('The Loser\'s standing small')
  setInt('GamblingValue', gamblingAmount.value);
  receptionStore.gamble(gamblingAmount.value * -1);
}

</script>

<style scoped lang="scss">

</style>
