<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import type { YearlyStatisticsApi } from '#/api/core/statistics';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElCard, ElSelect, ElOption, ElEmpty, ElTooltip, ElIcon } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';

import { getLawyerCaseStatistics } from '#/api';

const props = defineProps<{
  defaultYear?: number;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<YearlyStatisticsApi.LawyerCaseStatistics[]>([]);

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
  if (!data.value || data.value.length === 0) {
    return { names: [], totalCases: [], leaderCases: [], adminCases: [] };
  }

  const sortedData = [...data.value].sort((a, b) => b.totalCaseCount - a.totalCaseCount);
  
  return {
    names: sortedData.map((item) => item.realName || item.username),
    totalCases: sortedData.map((item) => item.totalCaseCount),
    leaderCases: sortedData.map((item) => item.leaderCaseCount),
    adminCases: sortedData.map((item) => item.adminCaseCount),
  };
});

const renderChart = () => {
  if (!chartData.value.names.length) {
    return;
  }

  renderEcharts({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['总案件数', '负责人案件', '管理人案件'],
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
      data: chartData.value.names,
      axisLabel: {
        rotate: 30,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '案件数量',
    },
    series: [
      {
        name: '总案件数',
        type: 'bar',
        data: chartData.value.totalCases,
        itemStyle: {
          color: '#4f69fd',
        },
        barMaxWidth: 40,
      },
      {
        name: '负责人案件',
        type: 'bar',
        data: chartData.value.leaderCases,
        itemStyle: {
          color: '#67c23a',
        },
        barMaxWidth: 40,
      },
      {
        name: '管理人案件',
        type: 'bar',
        data: chartData.value.adminCases,
        itemStyle: {
          color: '#e6a23c',
        },
        barMaxWidth: 40,
      },
    ],
  });
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getLawyerCaseStatistics({ year: selectedYear.value });
    data.value = response || [];
  } catch (err: any) {
    console.error('获取律师年度案件统计失败:', err);
    error.value = err?.message || '获取数据失败';
    data.value = [];
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
        <div class="flex items-center gap-2">
          <span class="font-semibold">律师年度案件统计</span>
          <el-tooltip
            content="统计每位律师在选定年度内参与的案件数量，按负责人(LEADER)和管理人(ADMIN)角色分别统计"
            placement="top"
          >
            <el-icon class="text-gray-400 cursor-help"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
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

    <div class="mb-3 text-sm text-gray-500 leading-relaxed">
      <p>
        本图表展示各律师在
        <strong>{{ selectedYear }}</strong>
        年度的案件参与情况，数据来源于工作团队成员表。按总案件数降序排列，可直观对比每位律师的工作负荷分布。
      </p>
    </div>

    <div class="h-[350px] relative">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
        <span class="text-gray-400">加载中...</span>
      </div>

      <div v-if="error && !loading" class="absolute inset-0 flex items-center justify-center z-20">
        <ElEmpty :description="error" />
      </div>

      <div v-show="!loading && !error && chartData.names.length === 0" class="absolute inset-0 flex items-center justify-center z-20">
        <ElEmpty description="暂无数据" />
      </div>

      <div v-show="!loading && !error && chartData.names.length > 0" class="h-full w-full">
        <EchartsUI ref="chartRef" />
      </div>
    </div>
  </ElCard>
</template>
