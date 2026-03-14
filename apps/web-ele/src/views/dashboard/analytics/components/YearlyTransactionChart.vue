<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import type { YearlyStatisticsApi } from '#/api/core/statistics';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElCard, ElSelect, ElOption, ElEmpty, ElStatistic, ElRow, ElCol } from 'element-plus';

import { getYearlyTransactionStatistics } from '#/api';

const props = defineProps<{
  defaultYear?: number;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<YearlyStatisticsApi.YearlyTransactionStatistics | null>(null);

const currentYear = new Date().getFullYear();
const selectedYear = ref(props.defaultYear || currentYear);

const yearOptions = computed(() => {
  const years = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }
  return years;
});

const chartData = computed(() => {
  if (!data.value?.monthlyData || data.value.monthlyData.length === 0) {
    return { months: [], incomeAmounts: [], expenseAmounts: [], netAmounts: [] };
  }

  const sortedData = [...data.value.monthlyData].sort((a, b) => a.month - b.month);
  
  return {
    months: sortedData.map((item) => `${item.month}月`),
    incomeAmounts: sortedData.map((item) => item.incomeAmount / 10000),
    expenseAmounts: sortedData.map((item) => item.expenseAmount / 10000),
    netAmounts: sortedData.map((item) => item.netAmount / 10000),
  };
});

const renderChart = () => {
  if (!chartData.value.months.length) {
    return;
  }

  renderEcharts({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params: any[]) => {
        let str = `${params[0].axisValue}<br />`;
        params.forEach((item) => {
          str += `${item.marker} ${item.seriesName}: ${item.value.toFixed(2)}万元<br />`;
        });
        return str;
      },
    },
    legend: {
      data: ['流入金额', '流出金额', '净额'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '50px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.value.months,
    },
    yAxis: {
      type: 'value',
      name: '金额(万元)',
    },
    series: [
      {
        name: '流入金额',
        type: 'bar',
        data: chartData.value.incomeAmounts,
        itemStyle: {
          color: '#67c23a',
        },
        barMaxWidth: 30,
      },
      {
        name: '流出金额',
        type: 'bar',
        data: chartData.value.expenseAmounts,
        itemStyle: {
          color: '#f56c6c',
        },
        barMaxWidth: 30,
      },
      {
        name: '净额',
        type: 'line',
        data: chartData.value.netAmounts,
        itemStyle: {
          color: '#409eff',
        },
        smooth: true,
      },
    ],
  });
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getYearlyTransactionStatistics({ year: selectedYear.value });
    data.value = response;
  } catch (err: any) {
    console.error('获取年度交易金额统计失败:', err);
    error.value = err?.message || '获取数据失败';
    data.value = null;
  } finally {
    loading.value = false;
    await nextTick();
    nextTick(() => {
      renderChart();
    });
  }
};

watch(selectedYear, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <ElCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-semibold">年度交易金额统计</span>
        <ElSelect v-model="selectedYear" size="small" style="width: 100px">
          <ElOption
            v-for="year in yearOptions"
            :key="year"
            :label="`${year}年`"
            :value="year"
          />
        </ElSelect>
      </div>
    </template>

    <div class="relative">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10 min-h-[400px]">
        <span class="text-gray-400">加载中...</span>
      </div>
      
      <div v-if="error && !loading" class="min-h-[400px] flex items-center justify-center">
        <ElEmpty :description="error" />
      </div>
      
      <div v-else-if="!loading && !data" class="min-h-[400px] flex items-center justify-center">
        <ElEmpty description="暂无数据" />
      </div>
      
      <template v-else-if="data">
        <ElRow :gutter="20" class="mb-4">
          <ElCol :span="6">
            <ElStatistic title="总流入金额" :value="data.totalIncomeAmount" :precision="2">
              <template #suffix>元</template>
            </ElStatistic>
          </ElCol>
          <ElCol :span="6">
            <ElStatistic title="总流出金额" :value="data.totalExpenseAmount" :precision="2">
              <template #suffix>元</template>
            </ElStatistic>
          </ElCol>
          <ElCol :span="6">
            <ElStatistic title="净额" :value="data.netAmount" :precision="2">
              <template #suffix>元</template>
            </ElStatistic>
          </ElCol>
          <ElCol :span="6">
            <ElStatistic title="总交易笔数" :value="data.totalTransactionCount">
              <template #suffix>笔</template>
            </ElStatistic>
          </ElCol>
        </ElRow>
        <div class="h-[300px]">
          <EchartsUI ref="chartRef" />
        </div>
      </template>
    </div>
  </ElCard>
</template>
