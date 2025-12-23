<!---
  Graph with the fortune
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 20.12.2025
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
    />
  </div>
</template>

<script setup>

import Chart from 'primevue/chart';
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';
import {useContainerResize} from '../../../../lib/composables/useContainerResize';

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

// SIZE HANDLING
const chartContainer = ref(null);
const {containerHeight, containerWidth, containerKey} = useContainerResize(chartContainer);
/// END SIZE HANDLING

const chartData = computed(() => {
  const teams = teamsStore.teams;

  // Map store data to Chart.js structure
  const labels           = [];
  const backgroundColors = teams.map(team => teamsStore.idToColor(team.uuid));

  // Note: Replace the static [2, 4, 5, 2] with real data from your store/team objects if available
  const dataValues = [];
  for (const team of teams) {
    const info = teamAccountStore.balances.get(team.uuid);
    if (info) {
      labels.push(info.teamName);
      dataValues.push(info.balance);
    }
  }

  return {
    labels:   labels,
    datasets: [
      {
        label:           'Vermögen',
        data:            dataValues,
        backgroundColor: backgroundColors
      }
    ]
  };
});

const chartOptions = computed(() => {
  return {
    maintainAspectRatio: true,
    responsive:          false,
    plugins:             {
      legend: {
        display: false,
        labels:  {
          color: 'black'
        }
      }
    },
    scales:              {
      x: {
        ticks: {
          color: 'black'
        },
        grid:  {
          color: 'darkgrey'
        }
      },
      y: {
        beginAtZero: true,
        ticks:       {
          color: 'black'
        },
        grid:        {
          color: 'rgba(157,155,155,0.99)'
        }
      }
    }
  };
});


</script>

<style scoped lang="scss">
.chart-container {
  background-color: white;
}


</style>
