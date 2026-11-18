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
    <VChart
        v-if="containerHeight > 0"
        :key="containerKey"
        ref="chartRef"
        :option="chartOptions"
        :style="{height: `${containerHeight}px`, width: `${containerWidth}px`}"
    />
  </div>
</template>

<script setup>
import VChart from 'vue-echarts';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {LineChart} from 'echarts/charts';
import {DataZoomComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent} from 'echarts/components';
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../store/TeamsStore';
import {useTeamAccountStore} from '../../store/TeamAccountStore';
import {useContainerResize} from '../../composables/useContainerResize';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useExportChart} from '../../composables/useExportChart';

use([CanvasRenderer, LineChart, DataZoomComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent]);

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

const chartRef      = ref(null);
const {exportChart} = useExportChart(chartRef, {title: 'Vermögensverlauf'});


const chartOptions = computed(() => {
  const teams  = teamsStore.teams;
  const series = [];
  for (const team of teams || []) {
    const records   = teamAccountStore.accountForTeam(team.uuid);
    const teamEntry = [];
    if (records) {
      for (const record of records) {
        teamEntry.push([record.timestamp.toMillis(), record.balance]);
      }
    }
    series.push({
      name:      team.name,
      type:      'line',
      data:      teamEntry,
      itemStyle: {color: team.color},
      lineStyle: {color: team.color}
    });
  }

  return {
    title:           {
      text:      'Vermögensverlauf',
      textStyle: {color: 'black', fontSize: 18}
    },
    backgroundColor: '#fff',
    legend:          {bottom: 0, textStyle: {color: 'black'}},
    tooltip:         {trigger: 'axis'},
    grid:            {top: 55, left: 10, right: 20, bottom: 55, containLabel: true},
    xAxis:           {type: 'time'},
    yAxis:           {type: 'value', interval: 50000, splitLine: {lineStyle: {color: 'rgba(0, 0, 0, 0.1)'}}},
    dataZoom:        [{type: 'inside', xAxisIndex: 0}, {type: 'inside', yAxisIndex: 0}],
    series
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
