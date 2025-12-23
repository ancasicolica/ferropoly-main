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
        type="line"
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
import {computed} from 'vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';
import 'chartjs-adapter-luxon';
import zoomPlugin from 'chartjs-plugin-zoom';
import {useContainerResize} from '../../../../lib/composables/useContainerResize';

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

const chartData = computed(() => {
  const teams = teamsStore.teams;

  const datasets = [];
  for (const team of teams) {
    const records   = teamAccountStore.accountForTeam(team.uuid);
    const teamEntry = [];
    for (const record of records) {
      teamEntry.push({x: record.timestamp.toISO(), y: record.balance});
    }
    datasets.push({data: teamEntry, label: team.name, backgroundColor: team.color, borderColor: team.color});
  }

  console.log('dataset', datasets)
  return {
    label:    'Einkommensverlauf',
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
      zoom:   {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          //mode: 'xy',
          scaleMode: 'xy'
        },
        pan:  {
          enabled: true,
          mode:    'xy'
        }
      }
    },
    scales:              {
      x: {
        type: 'time',
        time: {
          unit: 'minute'
        }
      },
      y: {}
    }
  };
});

// SIZE HANDLING
const chartContainer = ref(null);
const {containerHeight, containerWidth, containerKey} = useContainerResize(chartContainer);
/// END SIZE HANDLING

</script>

<style scoped lang="scss">

</style>
