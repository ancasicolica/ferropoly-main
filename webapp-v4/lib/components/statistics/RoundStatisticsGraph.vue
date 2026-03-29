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
    <button
        class="export-button"
        @click="exportChart"
    >
      <FontAwesomeIcon :icon="faDownload" />
    </button>
    <Chart
        v-if="containerHeight > 0"
        :key="containerKey"
        ref="chartRef"
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
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../store/TeamsStore';
import {useTeamAccountStore} from '../../store/TeamAccountStore';
import 'chartjs-adapter-luxon';
import zoomPlugin from 'chartjs-plugin-zoom';
import {useContainerResize} from '../../composables/useContainerResize';
import {useStatisticStore} from '../../store/StatisticStore';
import {DateTime} from 'luxon';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();
const statisticStore   = useStatisticStore();

const chartRef    = ref(null);
const exportChart = () => {
  if (chartRef.value) {
    // chartRef.value.chart gives access to the underlying Chart.js instance
    const base64Image = chartRef.value.chart.toBase64Image();
    const link        = document.createElement('a');
    link.href         = base64Image;
    link.download     = `${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}_einkomme_pro_runde.png`;
    link.click();
  }
};


const calculateIncome = function (record) {
  let income = 0;
  statisticStore.filter.various ? income += record.various : {};
  statisticStore.filter.gambling ? income += record.gambling : {};
  statisticStore.filter.chancellery ? income += record.chancellery : {};
  statisticStore.filter.penalty ? income += record.penalty : {};
  statisticStore.filter.propertyPurchase ? income += record.propertyPurchase : {};
  statisticStore.filter.housePurchase ? income += record.housePurchase : {};
  statisticStore.filter.rent ? income += record.rent : {};
  statisticStore.filter.hourlyFee ? income += record.hourlyFee : {};
  statisticStore.filter.interest ? income += record.interest : {};

  return income;
}

const chartData = computed(() => {
  const teams = teamsStore.teams;
  if (!teams || teams.length === 0 || containerHeight.value === 0) {
    return {labels: [], datasets: []};
  }

  const datasets = [];
  for (const team of teams) {
    const records = teamAccountStore.incomePerRoundForTeam(team.uuid);

    const teamEntry = [];
    const now       = DateTime.now();
    if (records) {
      for (const record of records) {
        const income = calculateIncome(record);
        if (record.endTimestamp <= now || income > 0) {
          teamEntry.push({x: record.endTimestamp.toISO(), y: income});
        }
      }
      datasets.push({data: teamEntry, label: team.name, backgroundColor: team.color, borderColor: team.color});
    } else {
      datasets.push({data: [], label: team.name, backgroundColor: team.color, borderColor: team.color});
    }
  }

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
      title:  {
        display: true,
        text:    'Einkommen pro Runde',
        color:   'black',
        font:    {size: 18}
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
      y: {
        ticks: {
          stepSize: 10000,
        },
        grid:  {
          // Callback to determine the line width for each tick
          lineWidth: (context) => {
            // Check if the tick value is a multiple of 50,000
            if (context.tick && context.tick.value % 50000 === 0) {
              return 2; // Thicker line for 100k steps
            }
            return 1; // Default line width
          },
          // Optional: You could also change the color for these ticks
          color: (context) => {
            if (context.tick && context.tick.value % 10000 === 0) {
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
.chart-container {
  background-color: white;
  position: relative;
}

.export-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  padding: 5px 10px;
  cursor: pointer;
}

</style>
