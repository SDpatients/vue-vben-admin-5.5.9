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

const caseTrendData = computed(() => {
  if (!caseTrend.value || !caseTrend.value.trendData) {
    console.log('[caseTrendData] 数据为空，返回空数组');
    return { categories: [], values: [] };
  }
  console.log('[caseTrendData] 原始数据:', caseTrend.value.trendData);
  const result = {
    categories: caseTrend.value.trendData.map((item) => item.period),
    values: caseTrend.value.trendData.map((item) => item.count),
  };
  console.log('[caseTrendData] 处理后数据:', result);
  return result;
});

const caseTypeData = computed(() => {
  if (!caseStatistics.value || !caseStatistics.value.statusDistribution) {
    console.log('[caseTypeData] 数据为空，返回空数组');
    return [];
  }
  console.log(
    '[caseTypeData] statusDistribution:',
    caseStatistics.value.statusDistribution,
  );
  const result = Object.entries(caseStatistics.value.statusDistribution).map(
    ([name, value]) => ({ name, value }),
  );
  console.log('[caseTypeData] 处理后数据:', result);
  return result;
});

const caseProgressData = computed(() => {
  if (!caseStatistics.value || !caseStatistics.value.progressDistribution) {
    console.log('[caseProgressData] 数据为空，返回空数组');
    return [];
  }
  console.log(
    '[caseProgressData] progressDistribution:',
    caseStatistics.value.progressDistribution,
  );
  const result = Object.entries(caseStatistics.value.progressDistribution).map(
    ([name, value]) => ({ name, value }),
  );
  console.log('[caseProgressData] 处理后数据:', result);
  return result;
});

const creditorAmountData = computed(() => {
  if (!creditorClaimRanking.value || !creditorClaimRanking.value.rankings) {
    console.log('[creditorAmountData] 数据为空，返回空数组');
    return [];
  }
  console.log(
    '[creditorAmountData] rankings:',
    creditorClaimRanking.value.rankings,
  );
  const result = creditorClaimRanking.value.rankings.map((item) => ({
    name: item.name,
    creditors: 0,
    amount: item.amount,
  }));
  console.log('[creditorAmountData] 处理后数据:', result);
  return result;
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
  console.log('[renderAllCharts] 开始渲染所有图表');
  renderCaseTrendChart();
  renderCaseTypeChart();
  renderCaseProgressChart();
  renderCreditorAmountChart();
  renderAssetRatioChart();
  console.log('[renderAllCharts] 所有图表渲染完成');
};

const renderCaseTrendChart = () => {
  const data = caseTrendData.value;
  console.log('[renderCaseTrendChart] 开始渲染，数据:', data);
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
  };
  console.log('[renderCaseTrendChart] 图表配置:', chartOption);
  renderEcharts1(chartOption);
};

const renderCaseTypeChart = () => {
  const data = caseTypeData.value;
  console.log('[renderCaseTypeChart] 开始渲染，数据:', data);
  const chartOption = {
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
  };
  console.log('[renderCaseTypeChart] 图表配置:', chartOption);
  renderEcharts2(chartOption);
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
  console.log('[renderAssetRatioChart] 开始渲染，数据:', data);
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
  };
  console.log('[renderAssetRatioChart] 图表配置:', chartOption);
  renderEcharts5(chartOption);
};

const loadStatisticsData = async () => {
  try {
    loading.value = true;
    console.log('[loadStatisticsData] 开始加载统计数据');

    const [trendRes, statsRes, crossRes, rankingRes, creditorRes] =
      await Promise.all([
        getCaseTrend({ period: 'month' }).catch((error) => {
          console.error('[loadStatisticsData] 案件趋势API调用失败:', error);
          return null;
        }),
        getCaseStatistics().catch((error) => {
          console.error('[loadStatisticsData] 案件统计API调用失败:', error);
          return null;
        }),
        getCaseCrossAnalysis().catch((error) => {
          console.error('[loadStatisticsData] 案件交叉分析API调用失败:', error);
          return null;
        }),
        getCaseAmountRanking({ topN: 10 }).catch((error) => {
          console.error('[loadStatisticsData] 案件金额排名API调用失败:', error);
          return null;
        }),
        getCreditorClaimAmountRanking({ topN: 10 }).catch((error) => {
          console.error(
            '[loadStatisticsData] 债权申报金额排名API调用失败:',
            error,
          );
          return null;
        }),
      ]);

    console.log('[loadStatisticsData] API返回数据:', {
      trendRes,
      statsRes,
      crossRes,
      rankingRes,
      creditorRes,
    });

    console.log('[loadStatisticsData] 详细数据检查:');
    console.log('  trendRes:', JSON.stringify(trendRes, null, 2));
    console.log('  trendRes.trendData:', trendRes?.trendData);
    console.log('  statsRes:', JSON.stringify(statsRes, null, 2));
    console.log('  statsRes.statusDistribution:', statsRes?.statusDistribution);
    console.log(
      '  statsRes.progressDistribution:',
      statsRes?.progressDistribution,
    );
    console.log('  rankingRes:', JSON.stringify(rankingRes, null, 2));
    console.log('  rankingRes.rankings:', rankingRes?.rankings);
    console.log('  creditorRes:', JSON.stringify(creditorRes, null, 2));
    console.log('  creditorRes.rankings:', creditorRes?.rankings);

    caseTrend.value = trendRes;
    caseStatistics.value = statsRes;
    caseCrossAnalysis.value = crossRes;
    caseRanking.value = rankingRes;
    creditorClaimRanking.value = creditorRes;

    console.log('[loadStatisticsData] 数据赋值完成，开始渲染图表');
    renderAllCharts();
  } catch (error) {
    console.error('[loadStatisticsData] 加载统计数据失败:', error);
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
      <ElRow :gutter="20" class="mb-5">
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
      <ElRow :gutter="20" class="mb-5">
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
        <ElCol :span="12">
          <ElCard header="债权申报金额排名" size="small">
            <div class="h-[300px]">
              <EchartsUI ref="chartRef4" />
            </div>
          </ElCard>
        </ElCol>
        <!-- 案件金额排名图表 -->
        <ElCol :span="12">
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
