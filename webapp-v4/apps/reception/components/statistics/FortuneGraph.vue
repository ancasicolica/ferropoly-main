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
        type="bar"
        :data="chartData"
        :options="chartOptions"
        :height="chartHeight"
        :width="chartWidth"
    />
  </div>
</template>

<script setup>

import Chart from 'primevue/chart';
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

// SIZE HANDLING
let resizeObserver     = null;
const chartContainer   = ref(null);
const chartHeight      = ref(200);
const chartWidth       = ref(400);

const adjustSize = () => {
  if (chartContainer.value) {
    const rect                        = chartContainer.value.getBoundingClientRect();
    const remainingHeight             = window.innerHeight - rect.top - 180;
    chartContainer.value.style.height = `${Math.max(0, remainingHeight)}px`;
    chartHeight.value                 = remainingHeight;
    const remainingWidth             = window.innerWidth - rect.left - 20;
    chartContainer.value.style.width = `${Math.max(0, remainingWidth)}px`;
    chartWidth.value                 = remainingWidth;
    //console.log('resize', remainingHeight, chartHeight.value, chartWidth.value, chartContainer.value.style.width)
  }
}

onMounted(() => {
  adjustSize();
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustSize);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
})
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
    labels.push(info.teamName);
    dataValues.push(info.balance);
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
