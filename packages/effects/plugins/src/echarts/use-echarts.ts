import type { EChartsOption } from 'echarts';

import type { Ref } from 'vue';

import type { Nullable } from '@vben/types';

import type EchartsUI from './echarts-ui.vue';

import { computed, nextTick, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import {
  tryOnUnmounted,
  useDebounceFn,
  useResizeObserver,
  useTimeoutFn,
  useWindowSize,
} from '@vueuse/core';

import echarts from './echarts';

type EchartsUIType = typeof EchartsUI | undefined;

type EchartsThemeType = 'dark' | 'light' | null;

function useEcharts(chartRef: Ref<EchartsUIType>) {
  let chartInstance: echarts.ECharts | null = null;
  let cacheOptions: EChartsOption = {};

  const { isDark } = usePreferences();
  const { height, width } = useWindowSize();
  const resizeHandler: () => void = useDebounceFn(resize, 200);

  const getOptions = computed((): EChartsOption => {
    if (!isDark.value) {
      return {};
    }

    return {
      backgroundColor: 'transparent',
    };
  });

  const initCharts = (t?: EchartsThemeType): echarts.ECharts | null => {
    const el = chartRef?.value?.$el;
    if (!el) {
      return null;
    }
    // 检查 DOM 是否有有效的宽高
    const clientWidth = el.clientWidth;
    const clientHeight = el.clientHeight;
    if (clientWidth === 0 || clientHeight === 0) {
      console.warn('ECharts DOM 元素宽高为 0，稍后重试');
      return null;
    }
    chartInstance = echarts.init(el, t || isDark.value ? 'dark' : null);
    return chartInstance;
  };

  const renderEcharts = (
    options: EChartsOption,
    clear = true,
  ): Promise<Nullable<echarts.ECharts>> => {
    cacheOptions = options;
    const currentOptions = {
      ...options,
      ...getOptions.value,
    };
    return new Promise((resolve) => {
      if (!chartRef.value || chartRef.value.offsetHeight === 0) {
        useTimeoutFn(async () => {
          const el = chartRef?.value?.$el;
          if (!el || el.clientWidth === 0 || el.clientHeight === 0) {
            // 如果 DOM 仍然不可见，继续延迟尝试
            resolve(await renderEcharts(currentOptions));
          } else {
            resolve(await renderEcharts(currentOptions));
          }
        }, 50);
        return;
      }
      nextTick(() => {
        useTimeoutFn(() => {
          if (!chartInstance) {
            const instance = initCharts();
            if (!instance) return;
          }
          clear && chartInstance?.clear();
          chartInstance?.setOption(currentOptions);
          resolve(chartInstance);
        }, 50);
      });
    });
  };

  function resize() {
    chartInstance?.resize({
      animation: {
        duration: 300,
        easing: 'quadraticIn',
      },
    });
  }

  watch([width, height], () => {
    resizeHandler?.();
  });

  useResizeObserver(chartRef as never, resizeHandler);

  watch(isDark, () => {
    if (chartInstance) {
      chartInstance.dispose();
      initCharts();
      renderEcharts(cacheOptions);
      resize();
    }
  });

  tryOnUnmounted(() => {
    // 销毁实例，释放资源
    chartInstance?.dispose();
  });
  return {
    renderEcharts,
    resize,
    getChartInstance: () => chartInstance,
  };
}

export { useEcharts };

export type { EchartsUIType };
