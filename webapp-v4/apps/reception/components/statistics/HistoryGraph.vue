<!---
  Graph with all bookings
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div
      ref="chartContainer"
      class="chart-container"
  >
    <Chart
        type="line"
        :data="chartData"
        :options="chartOptions"
        :height="chartHeight"
        :width="chartWidth"
        :plugins="[zoomPlugin]"
    />
  </div>
</template>

<script setup>
import Chart from 'primevue/chart';
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';
import 'chartjs-adapter-luxon';
import zoomPlugin from 'chartjs-plugin-zoom';

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
let resizeObserver   = null;
const chartContainer = ref(null);
const chartHeight    = ref(200);
const chartWidth     = ref(400);

const adjustSize = () => {
  if (chartContainer.value) {
    const rect                        = chartContainer.value.getBoundingClientRect();
    const remainingHeight             = window.innerHeight - rect.top - 180;
    chartContainer.value.style.height = `${Math.max(0, remainingHeight)}px`;
    chartHeight.value                 = remainingHeight;
    const remainingWidth              = window.innerWidth - rect.left - 80;
    chartContainer.value.style.width  = `${Math.max(0, remainingWidth)}px`;
    chartWidth.value                  = remainingWidth;
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
</script>

<style scoped lang="scss">

</style>
