<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { StatisticsApi } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElCard, ElCol, ElRadio, ElRadioGroup, ElRow } from 'element-plus';

import {
  getCaseAmountRanking,
  getCaseCrossAnalysis,
  getCaseStatistics,
  getCaseTrend,
  getCreditorClaimAmountRanking,
} from '#/api';

const chartType1 = ref('line');
const chartType2 = ref('pie');
const chartType3 = ref('bar');

const chartRef1 = ref<EchartsUIType>();
const chartRef2 = ref<EchartsUIType>();
const chartRef3 = ref<EchartsUIType>();
const chartRef4 = ref<EchartsUIType>();
const chartRef5 = ref<EchartsUIType>();

const { renderEcharts: renderEcharts1 } = useEcharts(chartRef1);
const { renderEcharts: renderEcharts2 } = useEcharts(chartRef2);
const { renderEcharts: renderEcharts3 } = useEcharts(chartRef3);
const { renderEcharts: renderEcharts4 } = useEcharts(chartRef4);
const { renderEcharts: renderEcharts5 } = useEcharts(chartRef5);

const loading = ref(false);
const caseStatistics = ref<null | StatisticsApi.CaseStatisticsData>(null);
const caseTrend = ref<null | StatisticsApi.TrendResponse>(null);
const caseCrossAnalysis = ref<null | StatisticsApi.CrossAnalysisData>(null);
const caseRanking = ref<null | StatisticsApi.RankingResponse>(null);
const creditorClaimRanking = ref<null | StatisticsApi.RankingResponse>(null);

// 权限状态标志
const hasCaseTrendPermission = ref(true);
const hasCaseStatisticsPermission = ref(true);
const hasCaseRankingPermission = ref(true);
const hasCreditorClaimRankingPermission = ref(true);

const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    COMPLETED: '已完成',
    ONGOING: '进行中',
    PENDING: '待处理',
    AWAITING: '等待中',
  };
  return statusMap[status] || status;
};

const translateProgress = (progress: string): string => {
  const progressMap: Record<string, string> = {
    FIRST: '第一阶段',
    SECOND: '第二阶段',
    THIRD: '第三阶段',
    FOURTH: '第四阶段',
    第一阶段: '第一阶段',
    第二阶段: '第二阶段',
    第五阶段: '第五阶段',
  };
  return progressMap[progress] || progress;
};

const caseTrendData = computed(() => {
  if (!caseTrend.value || !caseTrend.value.trendData) {
    return { categories: [], values: [] };
  }
  return {
    categories: caseTrend.value.trendData.map((item) => item.period),
    values: caseTrend.value.trendData.map((item) => item.count),
  };
});

const caseTypeData = computed(() => {
  if (!caseStatistics.value || !caseStatistics.value.statusDistribution) {
    return [];
  }
  return Object.entries(caseStatistics.value.statusDistribution).map(
    ([name, value]) => ({ name: translateStatus(name), value }),
  );
});

const caseProgressData = computed(() => {
  if (!caseStatistics.value || !caseStatistics.value.progressDistribution) {
    return [];
  }
  return Object.entries(caseStatistics.value.progressDistribution).map(
    ([name, value]) => ({ name: translateProgress(name), value }),
  );
});

const creditorAmountData = computed(() => {
  if (!creditorClaimRanking.value || !creditorClaimRanking.value.rankings) {
    return [];
  }
  return creditorClaimRanking.value.rankings.map((item) => ({
    name: item.name,
    creditors: 0,
    amount: item.amount,
  }));
});

const assetRatioData = computed(() => {
  if (!caseRanking.value || !caseRanking.value.rankings) {
    return [];
  }
  return caseRanking.value.rankings.map((item) => ({
    name: item.name,
    assets: item.amount,
    ratio: item.percentage,
  }));
});

const renderAllCharts = () => {
  renderCaseTrendChart();
  renderCaseTypeChart();
  renderCaseProgressChart();
  renderCreditorAmountChart();
  renderAssetRatioChart();
};

const renderCaseTrendChart = () => {
  const data = caseTrendData.value;
  const series: any = {
    data: data.values,
    type: chartType1.value as 'bar' | 'line',
    itemStyle: {
      color: '#4f69fd',
    },
  };

  if (chartType1.value === 'line') {
    series.smooth = true;
    series.areaStyle = {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: 'rgba(79, 105, 253, 0.3)',
          },
          {
            offset: 1,
            color: 'rgba(79, 105, 253, 0.05)',
          },
        ],
      },
    };
  }

  renderEcharts1({
    grid: {
      bottom: 30,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '10%',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      data: data.categories,
      type: 'category',
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '案件数量',
    },
    series: [series],
  });
};

const renderCaseTypeChart = () => {
  const data = caseTypeData.value;
  renderEcharts2({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        data,
        radius: chartType2.value === 'pie' ? '60%' : ['40%', '70%'],
        type: 'pie',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {d}%',
        },
      },
    ],
  });
};

const renderCaseProgressChart = () => {
  const data = caseProgressData.value;
  console.log('[renderCaseProgressChart] 开始渲染，数据:', data);
  const isHorizontal = chartType3.value === 'horizontal-bar';

  const chartOption = {
    grid: {
      bottom: 30,
      containLabel: true,
      left: isHorizontal ? '15%' : '3%',
      right: isHorizontal ? '4%' : '4%',
      top: '10%',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: isHorizontal
      ? {
          type: 'value',
          name: '案件数量',
        }
      : {
          data: data.map((item) => item.name),
          type: 'category',
          axisLabel: {
            rotate: 45,
          },
        },
    yAxis: isHorizontal
      ? {
          data: data.map((item) => item.name),
          type: 'category',
        }
      : {
          type: 'value',
          name: '案件数量',
        },
    series: [
      {
        data: isHorizontal ? data.map((item) => item.value) : data,
        type: 'bar',
        barMaxWidth: 50,
        itemStyle: {
          color: '#4f69fd',
        },
      },
    ],
  };
  console.log('[renderCaseProgressChart] 图表配置:', chartOption);
  renderEcharts3(chartOption);
};

const renderCreditorAmountChart = () => {
  const data = creditorAmountData.value;
  console.log('[renderCreditorAmountChart] 开始渲染，数据:', data);
  const chartOption = {
    grid: {
      bottom: 30,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '10%',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      data: data.map((item) => item.name),
      type: 'category',
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '债权金额(万元)',
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
    series: [
      {
        name: '债权金额(万元)',
        data: data.map((item) => Math.round((item.amount || 0) / 10_000)),
        type: 'bar',
        itemStyle: {
          color: '#f56c6c',
        },
      },
    ],
    legend: {
      data: ['债权金额(万元)'],
      top: 0,
    },
  };
  console.log('[renderCreditorAmountChart] 图表配置:', chartOption);
  renderEcharts4(chartOption);
};

const renderAssetRatioChart = () => {
  const data = assetRatioData.value;
  renderEcharts5({
    grid: {
      bottom: 30,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '10%',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      data: data.map((item) => item.name),
      type: 'category',
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '案件金额(万元)',
        axisLabel: {
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: '占比(%)',
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '案件金额(万元)',
        data: data.map((item) => Math.round((item.assets || 0) / 10_000)),
        type: 'bar',
        itemStyle: {
          color: '#67c23a',
        },
      },
      {
        name: '占比(%)',
        data: data.map((item) => item.ratio),
        type: 'line',
        yAxisIndex: 1,
        itemStyle: {
          color: '#e6a23c',
        },
      },
    ],
    legend: {
      data: ['案件金额(万元)', '占比(%)'],
      top: 0,
    },
  });
};

const loadStatisticsData = async () => {
  try {
    loading.value = true;

    // 重置权限状态
    hasCaseTrendPermission.value = true;
    hasCaseStatisticsPermission.value = true;
    hasCaseRankingPermission.value = true;
    hasCreditorClaimRankingPermission.value = true;

    const [trendRes, statsRes, crossRes, rankingRes, creditorRes] =
      await Promise.all([
        getCaseTrend({ period: 'month' }).catch((error) => {
          console.error('案件趋势API调用失败:', error);
          if (error?.code === 403) {
            hasCaseTrendPermission.value = false;
          }
          return null;
        }),
        getCaseStatistics().catch((error) => {
          console.error('案件统计API调用失败:', error);
          if (error?.code === 403) {
            hasCaseStatisticsPermission.value = false;
          }
          return null;
        }),
        getCaseCrossAnalysis().catch((error) => {
          console.error('案件交叉分析API调用失败:', error);
          // 交叉分析API失败不影响其他图表显示
          return null;
        }),
        getCaseAmountRanking({ topN: 10 }).catch((error) => {
          console.error('案件金额排名API调用失败:', error);
          if (error?.code === 403) {
            hasCaseRankingPermission.value = false;
          }
          return null;
        }),
        getCreditorClaimAmountRanking({ topN: 10 }).catch((error) => {
          console.error('债权申报金额排名API调用失败:', error);
          if (error?.code === 403) {
            hasCreditorClaimRankingPermission.value = false;
          }
          return null;
        }),
      ]);

    caseTrend.value = trendRes;
    caseStatistics.value = statsRes;
    caseCrossAnalysis.value = crossRes;
    caseRanking.value = rankingRes;
    creditorClaimRanking.value = creditorRes;

    renderAllCharts();
  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    loading.value = false;
  }
};

watch(caseStatistics, () => {
  renderAllCharts();
});

watch(chartType1, () => renderCaseTrendChart());
watch(chartType2, () => renderCaseTypeChart());
watch(chartType3, () => renderCaseProgressChart());

onMounted(() => {
  loadStatisticsData();
});
</script>

<template>
  <div class="p-5">
    <!-- 案件管理图表 -->
    <div class="mt-5">
      <h3 class="mb-4 text-lg font-semibold">案件管理分析</h3>

      <!-- 第一行：案件数量趋势 -->
      <ElRow :gutter="20" class="mb-5" v-if="hasCaseTrendPermission">
        <ElCol :span="24">
          <ElCard header="案件数量趋势" size="small">
            <template #header>
              <div class="flex items-center justify-between">
                <span>案件数量趋势</span>
                <ElRadioGroup v-model="chartType1" size="small">
                  <ElRadio value="line">折线图</ElRadio>
                  <ElRadio value="bar">柱状图</ElRadio>
                </ElRadioGroup>
              </div>
            </template>
            <div class="h-[300px]">
              <EchartsUI ref="chartRef1" />
            </div>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 第二行：案件类型分布、案件处理进度 -->
      <ElRow :gutter="20" class="mb-5" v-if="hasCaseStatisticsPermission">
        <!-- 案件类型分布图表 -->
        <ElCol :span="12">
          <ElCard header="案件类型分布" size="small">
            <template #header>
              <div class="flex items-center justify-between">
                <span>案件类型分布</span>
                <ElRadioGroup v-model="chartType2" size="small">
                  <ElRadio value="pie">饼图</ElRadio>
                  <ElRadio value="donut">环形图</ElRadio>
                </ElRadioGroup>
              </div>
            </template>
            <div class="h-[300px]">
              <EchartsUI ref="chartRef2" />
            </div>
          </ElCard>
        </ElCol>
        <!-- 案件处理进度图表 -->
        <ElCol :span="12">
          <ElCard header="案件处理进度" size="small">
            <template #header>
              <div class="flex items-center justify-between">
                <span>案件处理进度</span>
                <ElRadioGroup v-model="chartType3" size="small">
                  <ElRadio value="bar">柱状图</ElRadio>
                  <ElRadio value="horizontal-bar">横向柱状图</ElRadio>
                </ElRadioGroup>
              </div>
            </template>
            <div class="h-[300px]">
              <EchartsUI ref="chartRef3" />
            </div>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 第三行：债权申报金额排名、案件金额排名 -->
      <ElRow :gutter="20" class="mb-5">
        <!-- 债权申报金额排名图表 -->
        <ElCol :span="12" v-if="hasCreditorClaimRankingPermission">
          <ElCard header="债权申报金额排名" size="small">
            <div class="h-[300px]">
              <EchartsUI ref="chartRef4" />
            </div>
          </ElCard>
        </ElCol>
        <!-- 案件金额排名图表 -->
        <ElCol :span="12" v-if="hasCaseRankingPermission">
          <ElCard header="案件金额排名" size="small">
            <div class="h-[300px]">
              <EchartsUI ref="chartRef5" />
            </div>
          </ElCard>
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>
