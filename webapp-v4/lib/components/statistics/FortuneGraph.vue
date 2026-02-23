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
    <div v-if="containerHeight > 0" class="chart-wrapper">
      <Chart
          :key="containerKey"
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :height="containerHeight"
          :width="containerWidth"
      />
    </div>
  </div>
</template>

<script setup>

import Chart from 'primevue/chart';
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../store/TeamsStore';
import {useTeamAccountStore} from '../../store/TeamAccountStore';
import {useContainerResize} from '../../composables/useContainerResize';

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

// SIZE HANDLING
const chartContainer = ref(null);
const {containerHeight, containerWidth, containerKey} = useContainerResize(chartContainer);
/// END SIZE HANDLING

const chartData = computed(() => {
  const teams = teamsStore.teams;
  if (!teams || teams.length === 0 || containerHeight.value === 0) {
    return { labels: [], datasets: [] };
  }
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
    maintainAspectRatio: false,
    responsive:          true,
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
          color: 'black',
          stepSize: 50000,
        },
        grid: {
          // Callback to determine the line width for each tick
          lineWidth: (context) => {
            // Check if the tick value is a multiple of 100,000
            if (context.tick && (context.tick.value % 100000 === 0 || context.tick.value % 100000 === 0)) {
              return 2; // Thicker line for 100k steps
            }
            return 1; // Default line width
          },
          // Optional: You could also change the color for these ticks
          color: (context) => {
            if (context.tick && context.tick.value % 100000 === 0) {
              return 'rgba(0, 0, 0, 0.3)'; // Darker color for 100k steps
            }
            return 'rgba(0, 0, 0, 0.1)'; // Fainter color
          }
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

.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
