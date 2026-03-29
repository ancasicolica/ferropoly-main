<!---

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
import {useTeamsStore} from '../../store/TeamsStore';
import 'chartjs-adapter-luxon';
import zoomPlugin from 'chartjs-plugin-zoom';
import {useContainerResize} from '../../composables/useContainerResize';
import {evaluatePropertyValueForTeam} from '../../propertyLib';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

const teamsStore = useTeamsStore();
const chartRef   = ref(null);

const exportChart = () => {
  if (chartRef.value) {
    // chartRef.value.chart gives access to the underlying Chart.js instance
    const base64Image = chartRef.value.chart.toBase64Image();
    const link        = document.createElement('a');
    link.href         = base64Image;
    link.download     = `${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}_Einkommen.png`;
    link.click();
  }
};

const chartData = computed(() => {
  const teams = teamsStore.teams;
  if (!teams || teams.length === 0 || containerHeight.value === 0) {
    return {labels: [], datasets: []};
  }

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
      title:  {
        display: true,
        text:    'Einkommen',
        color:   'black',
        font:    {size: 18}
      },
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
        ticks:   {
          stepSize: 10000,
        },
        grid:    {
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
.chart-container {
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
