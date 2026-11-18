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
import {useTeamAccountStore} from '../../store/TeamAccountStore';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useExportChart} from '../../composables/useExportChart';

use([CanvasRenderer, BarChart, GridComponent, LegendComponent, TitleComponent, TooltipComponent]);

const teamsStore       = useTeamsStore();
const teamAccountStore = useTeamAccountStore();

const chartRef      = ref(null);
const {exportChart} = useExportChart(chartRef, {title: 'Erfolgsrechnung'});


const chartOptions = computed(() => {
  const teams  = teamsStore.teams;
  const series = [
    {name: 'Startgeld', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#147025'}},
    {name: 'Stündlicher Ortszins', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#717fd5'}},
    {name: 'Chance/Kanzlei', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#f10d00'}},
    {name: 'Gambling', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#fff200'}},
    {name: 'Kauf Orte', type: 'bar', stack: 'income', data: [], itemStyle: {color: 'rgba(145,60,234,0.99)'}},
    {name: 'Kauf Häuser', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#4b039b'}},
    {name: 'Miete', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#574c06'}},
    {name: 'Strafzins', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#050505'}},
    {name: 'Diverses', type: 'bar', stack: 'income', data: [], itemStyle: {color: '#c798e8'}},
  ];
  const labels = [];
  for (const team of teams || []) {
    labels.push(team.name);
    const info = teamAccountStore.accountSummaryForTeam(team.uuid);
    series[0].data.push(info.hourlyFee);
    series[1].data.push(info.interest);
    series[2].data.push(info.chancellery);
    series[3].data.push(info.gambling);
    series[4].data.push(info.propertyPurchase);
    series[5].data.push(info.housePurchase);
    series[6].data.push(info.rent);
    series[7].data.push(info.penalty);
    series[8].data.push(info.various);
  }

  return {
    backgroundColor: '#fff',
    title:           {
      text:      'Erfolgsrechnung',
      textStyle: {color: 'black', fontSize: 18}
    },
    legend:          {bottom: 0, textStyle: {color: 'black'}},
    tooltip:         {trigger: 'axis', axisPointer: {type: 'shadow'}},
    grid:            {top: 55, left: 10, right: 20, bottom: 95, containLabel: true},
    xAxis:           {type: 'category', data: labels},
    yAxis:           {type: 'value', interval: 10000, splitLine: {lineStyle: {color: 'rgba(0, 0, 0, 0.1)'}}},
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
