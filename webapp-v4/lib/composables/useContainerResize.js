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
  const containerHeight = ref(0);
  const containerWidth  = ref(0);
  const containerKey    = ref(0);
  const offset      = options.offset || 20;

  const handleResize = () => adjustSize(true);

  let resizeObserver = null;

  const adjustSize = (forceKeyUpdate = true) => {
    if (container.value) {
      // If the rect has no width or height, it might not be fully rendered in the DOM yet.
      // We skip measurement to avoid setting invalid dimensions that might trigger
      // Chart.js initialization before the canvas is ready.
      const rect = container.value.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        return;
      }

      // Calculate remaining space
      const remainingHeight        = window.innerHeight - rect.top - offset;
      const heightVal              = Math.max(0, remainingHeight);

      const remainingWidth        = window.innerWidth - rect.left - offset;
      const widthVal              = Math.max(0, remainingWidth);

      // If we already have a height > 0, we can update immediately.
      // If it's the first time we set a height > 0, we use nextTick to ensure
      // that the Chart component (which depends on this height via v-if)
      // finds a fully settled DOM when it starts its internal initialization.
      if (containerHeight.value > 0 || heightVal === 0) {
        container.value.style.height = `${heightVal}px`;
        containerHeight.value        = heightVal;
        container.value.style.width  = `${widthVal}px`;
        containerWidth.value         = widthVal;

        if (forceKeyUpdate) {
          containerKey.value++;
        }
      } else {
        // First initialization to a non-zero height
        // Defer to the next two animation frames AND a small timeout to ensure the DOM/layout 
        // is fully stable and the browser has had a chance to commit all layout changes
        // before mounting the Chart component (which depends on containerHeight > 0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (!container.value) return;
              const rect2 = container.value.getBoundingClientRect();
              if (rect2.width === 0 && rect2.height === 0) return; // still not ready
              container.value.style.height = `${heightVal}px`;
              containerHeight.value        = heightVal;
              container.value.style.width  = `${widthVal}px`;
              containerWidth.value         = widthVal;
              // Note: Initial mount usually doesn't need forceKeyUpdate as v-if will trigger it
            }, 100);
          });
        });
      }
    }
  };

  onMounted(() => {
    // Use double requestAnimationFrame and a timeout to sync with the browser's paint cycle
    // ensuring layout is fully applied before the first measurement
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          adjustSize(false); // Initial size adjustment without incrementing the key
        }, 150);
      });
    });

    window.addEventListener('resize', handleResize);

    resizeObserver = new ResizeObserver(() => {
      adjustSize(true);
    });

    if (container.value) {
      resizeObserver.observe(container.value);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
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
