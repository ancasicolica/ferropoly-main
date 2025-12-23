<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div
      ref="chartContainer"
      class="chart-container"
  >
    <Chart
        :key="containerKey"
        type="bar"
        :data="chartData"
        :options="chartOptions"
        :height="containerHeight"
        :width="containerWidth"
        :plugins="[zoomPlugin]"
    />
  </div>
</template>

<script setup>
import Chart from 'primevue/chart';
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';
import 'chartjs-adapter-luxon';
import zoomPlugin from 'chartjs-plugin-zoom';
import {useContainerResize} from '../../../../lib/composables/useContainerResize';
import {evaluatePropertyValueForTeam} from '../../../../lib/propertyLib';

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

const chartData = computed(() => {
  const teams = teamsStore.teams;

  const datasets = [{label: 'Aktueller Wert Liegenschaften', data: [], backgroundColor: '#34A6F4'},
                    {label: 'Zusätzlicher Wert Liegenschaften mit Hotels', data: [], backgroundColor: '#96F7E4'}];
  const labels   = [];
  for (const team of teams) {
    labels.push(team.name);
    const info = evaluatePropertyValueForTeam(team.uuid);
    datasets[0].data.push(info.sum);
    datasets[1].data.push(info.max - info.sum);
  }

  console.log('incoming dataset', datasets)
  return {
    labels:   labels,
    datasets: datasets
  };
});

const chartOptions = computed(() => {
  return {
    maintainAspectRatio: true,
    responsive:          false,
    plugins:             {
      legend: {
        display: true,
        labels:  {
          color: 'black'
        }
      },

    },
    scales:              {
      x: {
        stacked: true
      },
      y: {
        stacked: true
      }
    }
  };
});

// SIZE HANDLING
const chartContainer                                  = ref(null);
const {containerHeight, containerWidth, containerKey} = useContainerResize(chartContainer);
/// END SIZE HANDLING

</script>

<style scoped lang="scss">

</style>
