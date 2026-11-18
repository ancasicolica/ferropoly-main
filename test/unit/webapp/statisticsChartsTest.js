const assert     = require('node:assert/strict');
const fs         = require('node:fs');
const path       = require('node:path');
const vm         = require('node:vm');
const {test}     = require('node:test');
const {DateTime} = require('luxon');

const chartDirectory = path.resolve(__dirname, '../../../webapp-v4/lib/components/statistics');

function chartOptions(name, teams, account, filter = {}) {
  const component = fs.readFileSync(path.join(chartDirectory, `${name}.vue`), 'utf8');
  const script = component.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\s*$/gm, '');
  const context = {
    DateTime,
    use: () => {},
    computed: fn => ({get value() { return fn(); }}),
    ref: value => ({value}),
    useTeamsStore: () => ({teams, idToColor: id => teams.find(team => team.uuid === id).color}),
    useTeamAccountStore: () => account,
    useStatisticStore: () => ({filter}),
    useContainerResize: () => ({}),
    useExportChart: () => ({}),
    ...Object.fromEntries(['CanvasRenderer', 'BarChart', 'LineChart', 'DataZoomComponent', 'GridComponent', 'LegendComponent', 'TitleComponent', 'TooltipComponent'].map(key => [key, {}]))
  };
  vm.runInNewContext(`${script}\nglobalThis.options = chartOptions;`, context, {filename: name});
  return context.options.value;
}

const teams = [{uuid: 'a', name: 'Alpha', color: '#123456'}, {uuid: 'b', name: 'Beta', color: '#abcdef'}];

test('Vermögensdiagramm zeigt nur vorhandene Kontostände mit Teamfarben und negativen Werten', () => {
  const account = {balances: new Map([['b', {teamName: 'Beta', balance: -1000}]])};
  const options = chartOptions('FortuneGraph', teams, account);
  assert.deepEqual(Array.from(options.xAxis.data), ['Beta']);
  assert.equal(options.series[0].data[0].value, -1000);
  assert.equal(options.series[0].data[0].itemStyle.color, '#abcdef');
  assert.equal(options.yAxis.min, undefined);
  assert.equal(chartOptions('FortuneGraph', [], account).series[0].data.length, 0);
});

test('Erfolgsrechnung stapelt alle neun Kategorien einschließlich Ausgaben', () => {
  const account = {accountSummaryForTeam: id => ({hourlyFee: id === 'a' ? 100 : 0, interest: 20, chancellery: 0, gambling: 0, propertyPurchase: -50, housePurchase: 0, rent: 0, penalty: 0, various: 0})};
  const options = chartOptions('IncomeStatementGraph', teams, account);
  assert.equal(options.series.length, 9);
  assert.deepEqual(Array.from(options.series[4].data), [-50, -50]);
  assert.ok(options.series.every(series => series.stack === 'income'));
  assert.deepEqual(Array.from(options.xAxis.data), ['Alpha', 'Beta']);
  assert.ok(chartOptions('IncomeStatementGraph', [], account).series.every(series => series.data.length === 0));
});

test('Kontoverlauf behält Zeitstempel, Farben und Zoomachsen', () => {
  const timestamp = DateTime.fromISO('2026-01-02T12:05:00');
  const account = {accountForTeam: id => id === 'a' ? [{timestamp, balance: 123}] : null};
  const options = chartOptions('HistoryGraph', teams, account);
  assert.equal(options.series[0].data[0][0], timestamp.toMillis());
  assert.equal(options.series[0].data[0][1], 123);
  assert.equal(options.series[1].data.length, 0);
  assert.equal(options.series[0].lineStyle.color, '#123456');
  assert.deepEqual(Array.from(options.dataZoom, zoom => zoom.type), ['inside', 'inside']);
  assert.equal(chartOptions('HistoryGraph', [], account).series.length, 0);
});

test('Rundenstatistik berücksichtigt Filter und blendet zukünftige leere Runden aus', () => {
  const now = DateTime.now();
  const record = (date, values = {}) => ({endTimestamp: date, various: 0, gambling: 0, chancellery: 0, penalty: 0, propertyPurchase: 0, housePurchase: 0, rent: 0, hourlyFee: 0, interest: 0, ...values});
  const account = {incomePerRoundForTeam: id => id === 'a' ? [record(now.minus({minutes: 5}), {rent: 30, various: -10}), record(now.plus({minutes: 5})), record(now.plus({minutes: 10}), {rent: 40})] : null};
  const filter = Object.fromEntries(['various', 'gambling', 'chancellery', 'penalty', 'propertyPurchase', 'housePurchase', 'rent', 'hourlyFee', 'interest'].map(key => [key, true]));
  const options = chartOptions('RoundStatisticsGraph', teams, account, filter);
  assert.deepEqual(Array.from(options.series[0].data, point => point[1]), [20, 40]);
  assert.equal(options.series[0].data[0][0], now.minus({minutes: 5}).toMillis());
  assert.equal(options.series[1].data.length, 0);
  assert.equal(options.dataZoom.length, 2);
  filter.rent = false;
  assert.deepEqual(Array.from(chartOptions('RoundStatisticsGraph', teams, account, filter).series[0].data, point => point[1]), [-10]);
  assert.equal(chartOptions('RoundStatisticsGraph', [], account, filter).series.length, 0);
});