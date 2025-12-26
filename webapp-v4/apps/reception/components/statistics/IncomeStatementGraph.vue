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
import 'chartjs-adapter-luxon';
import zoomPlugin from 'chartjs-plugin-zoom';
import {useContainerResize} from '../../../../lib/composables/useContainerResize';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

const chartData = computed(() => {
  const teams = teamsStore.teams;

  const datasets = [
    {label: 'Startgeld', data: [], backgroundColor: '#147025'},
    {label: 'Stündlicher Ortszins', data: [], backgroundColor: '#717fd5'},
    {label: 'Chance/Kanzlei', data: [], backgroundColor: '#f10d00'},
    {label: 'Gambling', data: [], backgroundColor: '#fff200'},
    {label: 'Kauf Orte', data: [], backgroundColor: 'rgba(145,60,234,0.99)'},
    {label: 'Kauf Häuser', data: [], backgroundColor: '#4b039b'},
    {label: 'Miete', data: [], backgroundColor: '#574c06'},
    {label: 'Strafzins', data: [], backgroundColor: '#050505'},
    {label: 'Diverses', data: [], backgroundColor: '#c798e8'},
  ];
  const labels   = [];
  for (const team of teams) {
    labels.push(team.name);
    const info = teamAccountStore.accountSummaryForTeam(team.uuid);
    datasets[0].data.push(info.hourlyFee);
    datasets[1].data.push(info.interest);
    datasets[2].data.push(info.chancellery);
    datasets[3].data.push(info.gambling);
    datasets[4].data.push(info.propertyPurchase);
    datasets[5].data.push(info.housePurchase);
    datasets[6].data.push(info.rent);
    datasets[7].data.push(info.penalty);
    datasets[8].data.push(info.various);
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
        stacked: true,
        ticks: {
          stepSize: 10000,
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

// SIZE HANDLING
const chartContainer                                  = ref(null);
const {containerHeight, containerWidth, containerKey} = useContainerResize(chartContainer);
/// END SIZE HANDLING

</script>

<style scoped lang="scss">

</style>
