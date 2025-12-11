<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { EchartsUIType } from '@vben/plugins/echarts';
import type { TabOption } from '@vben/types';

import type { CaseApi } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElCard, ElCol, ElRadio, ElRadioGroup, ElRow } from 'element-plus';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

// 案件管理相关代码
const caseList = ref<CaseApi.CaseInfo[]>([]);
const chartType1 = ref('line');
const chartType2 = ref('pie');
const chartType3 = ref('bar');

// 图表引用 - 必须先声明再使用
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

// 统计数据计算已删除，因为未使用

// 案件类型分布数据
const caseTypeData = computed(() => {
  const typeMap = new Map<string, number>();
  caseList.value.forEach((item) => {
    const type = item['案由'] || '其他';
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });
  return [...typeMap.entries()].map(([name, value]) => ({
    name,
    value,
  }));
});

// 案件数量趋势数据（按月份）
const caseTrendData = computed(() => {
  const monthMap = new Map<string, number>();
  // 初始化过去12个月
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(monthKey, 0);
  }

  // 统计各月份案件数
  caseList.value.forEach((item) => {
    if (item['立案时间']) {
      const date = new Date(item['立案时间']);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(monthKey)) {
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
      }
    }
  });

  return {
    categories: [...monthMap.keys()],
    values: [...monthMap.values()],
  };
});

// 案件处理进度数据
const caseProgressData = computed(() => {
  const progressMap = new Map<string, number>();
  caseList.value.forEach((item) => {
    // 根据案件状态或时间计算进度
    const status = item['会计账簿'] || '其他';
    progressMap.set(status, (progressMap.get(status) || 0) + 1);
  });
  return [...progressMap.entries()].map(([name, value]) => ({
    name,
    value,
  }));
});

// 债权人数与金额分布数据
const creditorAmountData = computed(() => {
  return caseList.value.slice(0, 10).map((item) => ({
    name: item['案号'],
    creditors: item['债权人数'] || 0,
    amount: item['债权总额'] || 0,
  }));
});

// 财产金额与比例分布数据
const assetRatioData = computed(() => {
  return caseList.value.slice(0, 10).map((item) => ({
    name: item['案号'],
    assets: item['财产金额'] || 0,
    ratio: (item['财产比例'] || 0) * 100,
  }));
});

// 渲染所有图表
const renderAllCharts = () => {
  renderCaseTrendChart();
  renderCaseTypeChart();
  renderCaseProgressChart();
  renderCreditorAmountChart();
  renderAssetRatioChart();
};

// 渲染案件数量趋势图表
const renderCaseTrendChart = () => {
  const data = caseTrendData.value;
  const series: any = {
    data: data.values,
    type: chartType1.value as 'bar' | 'line',
    itemStyle: {
      color: '#4f69fd',
    },
  };

  // 只有折线图才添加平滑和面积样式
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

// 渲染案件类型分布图表
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

// 渲染案件处理进度图表
const renderCaseProgressChart = () => {
  const data = caseProgressData.value;
  const isHorizontal = chartType3.value === 'horizontal-bar';

  renderEcharts3({
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
  });
};

// 渲染债权人数与金额分布图表
const renderCreditorAmountChart = () => {
  const data = creditorAmountData.value;
  renderEcharts4({
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
        name: '债权人数',
        axisLabel: {
          formatter: '{value}',
        },
      },
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
        name: '债权人数',
        data: data.map((item) => item.creditors),
        type: 'bar',
        itemStyle: {
          color: '#4f69fd',
        },
      },
      {
        name: '债权金额(万元)',
        data: data.map((item) => Math.round((item.amount || 0) / 10_000)),
        type: 'line',
        yAxisIndex: 1,
        itemStyle: {
          color: '#f56c6c',
        },
      },
    ],
    legend: {
      data: ['债权人数', '债权金额(万元)'],
      top: 0,
    },
  });
};

// 渲染财产金额与比例分布图表
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
        name: '财产金额(万元)',
        axisLabel: {
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: '财产比例(%)',
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '财产金额(万元)',
        data: data.map((item) => Math.round((item.assets || 0) / 10_000)),
        type: 'bar',
        itemStyle: {
          color: '#67c23a',
        },
      },
      {
        name: '财产比例(%)',
        data: data.map((item) => item.ratio),
        type: 'line',
        yAxisIndex: 1,
        itemStyle: {
          color: '#e6a23c',
        },
      },
    ],
    legend: {
      data: ['财产金额(万元)', '财产比例(%)'],
      top: 0,
    },
  });
};

// 监听案件列表变化，重新渲染图表
watch(
  caseList,
  () => {
    renderAllCharts();
  },
  { deep: true },
);

// 监听图表类型变化，重新渲染对应图表
watch(chartType1, () => renderCaseTrendChart());
watch(chartType2, () => renderCaseTypeChart());
watch(chartType3, () => renderCaseProgressChart());

// 生成模拟数据
const generateMockData = () => {
  const mockCases: CaseApi.CaseInfo[] = [
    {
      row: 1,
      案件ID: 'CASE2024001',
      序号: 1,
      年度: '2024',
      案号: '(2024)沪01破1号',
      申请人: '上海银行',
      债务人: '上海某科技公司',
      案由: '破产清算',
      立案时间: '2024-01-15',
      破产时间: '2024-01-20',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '已移交',
      办理期限: '2024-12-31',
      承办人: '张三',
      法院: '上海市第一中级人民法院',
      管理人: '李四律师事务所',
      债权人数: 25,
      债权总额: 15_000_000,
      财产金额: 8_000_000,
      财产比例: 0.53,
      银行账户数: 3,
      银行账户总余额: 1_200_000,
      有效账户数: 2,
    } as CaseApi.CaseInfo,
    {
      row: 2,
      案件ID: 'CASE2024002',
      序号: 2,
      年度: '2024',
      案号: '(2024)京02破5号',
      申请人: '建设银行',
      债务人: '北京某房地产公司',
      案由: '破产重整',
      立案时间: '2024-02-10',
      破产时间: '2024-02-15',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '未移交',
      办理期限: '2025-02-28',
      承办人: '王五',
      法院: '北京市第二中级人民法院',
      管理人: '赵六会计师事务所',
      债权人数: 48,
      债权总额: 28_000_000,
      财产金额: 15_000_000,
      财产比例: 0.54,
      银行账户数: 5,
      银行账户总余额: 3_500_000,
      有效账户数: 4,
    } as CaseApi.CaseInfo,
    {
      row: 3,
      案件ID: 'CASE2024003',
      序号: 3,
      年度: '2024',
      案号: '(2024)深03破8号',
      申请人: '招商银行',
      债务人: '深圳某电子公司',
      案由: '破产清算',
      立案时间: '2024-03-05',
      破产时间: '2024-03-10',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '部分移交',
      办理期限: '2024-09-30',
      承办人: '孙七',
      法院: '深圳市中级人民法院',
      管理人: '钱八律师事务所',
      债权人数: 32,
      债权总额: 9_500_000,
      财产金额: 5_200_000,
      财产比例: 0.55,
      银行账户数: 2,
      银行账户总余额: 850_000,
      有效账户数: 1,
    } as CaseApi.CaseInfo,
  ];

  caseList.value = mockCases;
};

// 初始化数据
onMounted(() => {
  generateMockData();
  renderAllCharts();
});

const overviewItems: AnalysisOverviewItem[] = [
  {
    icon: SvgCardIcon,
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: 120_000,
    value: 2000,
  },
  {
    icon: SvgCakeIcon,
    title: '访问量',
    totalTitle: '总访问量',
    totalValue: 500_000,
    value: 20_000,
  },
  {
    icon: SvgDownloadIcon,
    title: '下载量',
    totalTitle: '总下载量',
    totalValue: 120_000,
    value: 8000,
  },
  {
    icon: SvgBellIcon,
    title: '使用量',
    totalTitle: '总使用量',
    totalValue: 50_000,
    value: 5000,
  },
];

const chartTabs: TabOption[] = [
  {
    label: '流量趋势',
    value: 'trends',
  },
  {
    label: '月访问量',
    value: 'visits',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />

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
                  <ElRadio label="line">折线图</ElRadio>
                  <ElRadio label="bar">柱状图</ElRadio>
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
                  <ElRadio label="pie">饼图</ElRadio>
                  <ElRadio label="donut">环形图</ElRadio>
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
                  <ElRadio label="bar">柱状图</ElRadio>
                  <ElRadio label="horizontal-bar">横向柱状图</ElRadio>
                </ElRadioGroup>
              </div>
            </template>
            <div class="h-[300px]">
              <EchartsUI ref="chartRef3" />
            </div>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 第三行：债权人数与金额分布、财产金额与比例分布 -->
      <ElRow :gutter="20" class="mb-5">
        <!-- 债权人数与金额分布图表 -->
        <ElCol :span="12">
          <ElCard header="债权人数与金额分布" size="small">
            <div class="h-[300px]">
              <EchartsUI ref="chartRef4" />
            </div>
          </ElCard>
        </ElCol>
        <!-- 财产金额与比例分布图表 -->
        <ElCol :span="12">
          <ElCard header="财产金额与比例分布" size="small">
            <div class="h-[300px]">
              <EchartsUI ref="chartRef5" />
            </div>
          </ElCard>
        </ElCol>
      </ElRow>
    </div>

    <!-- 原有分析页内容 -->
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
