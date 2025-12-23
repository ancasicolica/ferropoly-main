/**
 * My first composable, just trying this out and hoping for the best...
 *
 * Usage:
 *
 * 1. Create a div covering your range and create a ref
 *
 * <div ref="myContainer">
 *
 * 2. Sample for the chart: create a Chart with the following elements
 * supplied by this function:
 *
 *     <Chart
 *         :key="containerKey"
 *         :height="containerHeight"
 *         :width="containerWidth"
 *     />
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.12.2025
 **/
import {ref, onMounted, onBeforeUnmount} from 'vue';


/**
 * Hook to manage and update the dimensions of a container dynamically based on window resizing.
 *
 * @param {Ref<HTMLElement>} container - A Vue ref object pointing to the container DOM element.
 * @param {Object} [options] - Configuration options for the behavior of the resize logic.
 * @param {number} [options.offset=20] - The offset (in pixels) to subtract from the calculated height and width.
 * @return {Object} An object containing reactive properties and methods:
 * - `containerHeight` {Ref<number>} Reactive variable for the container's height.
 * - `containerWidth` {Ref<number>} Reactive variable for the container's width.
 * - `containerKey` {Ref<number>} Reactive key to trigger rerendering of dependent components.
 * - `adjustSize` {Function} Method to manually force a size recalculation.
 */
export function useContainerResize(container, options = {}) {
  const containerHeight = ref(200);
  const containerWidth  = ref(400);
  const containerKey    = ref(0);
  const offset      = options.offset || 20;

  let resizeObserver = null;

  const adjustSize = () => {
    if (container.value) {
      const rect = container.value.getBoundingClientRect();

      // Calculate remaining space
      const remainingHeight        = window.innerHeight - rect.top - offset;
      container.value.style.height = `${Math.max(0, remainingHeight)}px`;
      containerHeight.value            = remainingHeight;

      const remainingWidth        = window.innerWidth - rect.left - offset;
      container.value.style.width = `${Math.max(0, remainingWidth)}px`;
      containerWidth.value            = remainingWidth;

      // Force re-render of the chart component
      containerKey.value++;
    }
  };

  onMounted(() => {
    adjustSize();
    window.addEventListener('resize', adjustSize);

    resizeObserver = new ResizeObserver(() => {
      adjustSize();
    });

    if (container.value) {
      resizeObserver.observe(container.value);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', adjustSize);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  return {
    containerHeight,
    containerWidth,
    containerKey,
    adjustSize // exposed in case manual trigger is needed
  };
}
