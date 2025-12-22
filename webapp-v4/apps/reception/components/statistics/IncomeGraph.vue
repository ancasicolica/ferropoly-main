<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div class="flex w-full gap-2" style="height: 80vh">
    <canvas id="myChart"></canvas>
  </div>
</template>

<script setup>
import {Chart} from 'chart.js';
import {onMounted} from 'vue';
import {useReceptionStore} from '../../store/ReceptionStore';
const receptionStore = useReceptionStore();
onMounted(()=> {
  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: receptionStore.test,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
})
</script>

<style scoped lang="scss">

</style>
