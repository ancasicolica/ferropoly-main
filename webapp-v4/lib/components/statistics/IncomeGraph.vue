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
import {BarChart} from 'echarts/charts';
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent} from 'echarts/components';
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../store/TeamsStore';
import {useContainerResize} from '../../composables/useContainerResize';
import {evaluatePropertyValueForTeam} from '../../propertyLib';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useExportChart} from '../../composables/useExportChart';

use([CanvasRenderer, BarChart, GridComponent, LegendComponent, TitleComponent, TooltipComponent]);

const teamsStore    = useTeamsStore();
const chartRef      = ref(null);
const {exportChart} = useExportChart(chartRef, {title: 'Einkommen'});


const chartOptions = computed(() => {
  const teams            = teamsStore.teams;
  const labels           = [];
  const currentValues    = [];
  const additionalValues = [];
  for (const team of teams || []) {
    labels.push(team.name);
    const info = evaluatePropertyValueForTeam(team.uuid);
    currentValues.push(info.sum);
    additionalValues.push(info.max - info.sum);
  }

  return {
    backgroundColor: '#fff',
    title:           {
      text:      'Einkommen',
      textStyle: {color: 'black', fontSize: 18}
    },
    legend:          {bottom: 0, textStyle: {color: 'black'}},
    tooltip:         {trigger: 'axis', axisPointer: {type: 'shadow'}},
    grid:            {top: 55, left: 10, right: 20, bottom: 75, containLabel: true},
    xAxis:           {type: 'category', data: labels},
    yAxis:           {
      type:      'value',
      interval:  10000,
      splitLine: {lineStyle: {color: 'rgba(0, 0, 0, 0.1)'}}
    },
    series:          [
      {name:       'Aktueller Wert Liegenschaften',
        type:      'bar',
        stack:     'income',
        data:      currentValues,
        itemStyle: {color: '#34A6F4'}
      },
      {name:       'Zusätzlicher Wert Liegenschaften mit Hotels',
        type:      'bar',
        stack:     'income',
        data:      additionalValues,
        itemStyle: {color: '#96F7E4'}
      }
    ]
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
