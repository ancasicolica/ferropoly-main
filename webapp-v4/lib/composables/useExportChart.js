/**
 * Composable for exporting charts
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 29.03.2026
 **/


export function useExportChart(chartRef, options) {

  const title = options.title || 'Chart';

  const exportChart = () => {
    if (chartRef.value) {
      const base64Image = chartRef.value.getDataURL
        ? chartRef.value.getDataURL({type: 'png'})
        : chartRef.value.chart.toBase64Image();
      const link        = document.createElement('a');
      link.href         = base64Image;
      link.download     = `${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}_${title}.png`;
      link.click();
    }
  };
  return {
    exportChart
  }
}
