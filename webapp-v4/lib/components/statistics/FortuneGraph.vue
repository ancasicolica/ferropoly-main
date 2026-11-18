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
    <button
        class="export-button"
        @click="exportChart"
    >
      <FontAwesomeIcon :icon="faDownload" />
    </button>
    <div
        v-if="containerHeight > 0"
        class="chart-wrapper"
    >
      <VChart
          :key="containerKey"
          ref="chartRef"
          :option="chartOptions"
          :style="{height: `${containerHeight}px`, width: `${containerWidth}px`}"
      />
    </div>
  </div>
</template>

<script setup>

import VChart from 'vue-echarts';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {BarChart} from 'echarts/charts';
import {GridComponent, TitleComponent, TooltipComponent} from 'echarts/components';
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../store/TeamsStore';
import {useTeamAccountStore} from '../../store/TeamAccountStore';
import {useContainerResize} from '../../composables/useContainerResize';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useExportChart} from '../../composables/useExportChart';

use([CanvasRenderer, BarChart, GridComponent, TitleComponent, TooltipComponent]);

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

// SIZE HANDLING
const chartContainer                                  = ref(null);
const {containerHeight, containerWidth, containerKey} = useContainerResize(chartContainer);
/// END SIZE HANDLING

const chartRef      = ref(null);
const {exportChart} = useExportChart(chartRef, {title: 'Vermögen'});


const chartOptions = computed(() => {
  const teams      = teamsStore.teams;
  const labels     = [];
  const dataValues = [];
  for (const team of teams || []) {
    const info = teamAccountStore.balances.get(team.uuid);
    if (info) {
      labels.push(info.teamName);
      dataValues.push({value: info.balance, itemStyle: {color: teamsStore.idToColor(team.uuid)}});
    }
  }

  return {
    backgroundColor: '#fff',
    title:           {
      text:      'Vermögen',
      textStyle: {color: 'black', fontSize: 18}
    },
    tooltip:         {trigger: 'axis', axisPointer: {type: 'shadow'}},
    grid:            {top: 55, left: 10, right: 20, bottom: 20, containLabel: true},
    xAxis:           {
      type:      'category',
      data:      labels,
      axisLabel: {color: 'black'},
      splitLine: {lineStyle: {color: 'darkgrey'}}
    },
    yAxis:           {
      type:      'value',
      interval:  50000,
      axisLabel: {color: 'black'},
      splitLine: {lineStyle: {color: 'rgba(0, 0, 0, 0.1)'}}
    },
    series:          [{name: 'Vermögen', type: 'bar', data: dataValues}]
  };
});


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

.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
