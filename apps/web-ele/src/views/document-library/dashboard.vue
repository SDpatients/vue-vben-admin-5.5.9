<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import type { DocumentLibraryApi } from '#/api/core/document-library';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  ElCard,
  ElCol,
  ElRow,
  ElTable,
  ElTableColumn,
  ElTag,
  ElEmpty,
  ElStatistic,
  ElProgress,
  ElRadio,
  ElRadioGroup,
  ElMessage,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  getDocumentListApi,
  getDashboardStatisticsApi,
  formatFileSize,
  getDocumentTypeIcon,
  getDocumentTypeColor,
} from '#/api/core/document-library';

const loading = ref(false);
const statisticsLoading = ref(false);
const documents = ref<DocumentLibraryApi.Document[]>([]);
const statistics = ref<DocumentLibraryApi.DashboardStatistics | null>(null);
const totalDocuments = ref(0);
const totalSize = ref(0);
const weeklyUploads = ref(0);
const totalViews = ref(0);

const chartRef1 = ref<EchartsUIType>();
const chartRef2 = ref<EchartsUIType>();
const chartRef3 = ref<EchartsUIType>();

const { renderEcharts: renderTypeChart } = useEcharts(chartRef1);
const { renderEcharts: renderTrendChart } = useEcharts(chartRef2);
const { renderEcharts: renderSizeChart } = useEcharts(chartRef3);

const chartType1 = ref('pie');
const chartType2 = ref('line');

const totalSizeMB = computed(() => {
  return Math.round(totalSize.value / 1024 / 1024 * 100) / 100;
});

const typeChartData = computed(() => {
  if (statistics.value?.typeDistribution) {
    const typeNames: Record<string, string> = {
      WORD: 'Word文档',
      EXCEL: 'Excel表格',
      PDF: 'PDF文档',
      OTHER: '其他文件',
    };
    return Object.entries(statistics.value.typeDistribution)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        name: typeNames[type] || type,
        value: count,
      }));
  }

  const stats: Record<string, number> = { WORD: 0, EXCEL: 0, PDF: 0, OTHER: 0 };
  documents.value.forEach((doc) => {
    const type = doc.documentType || 'OTHER';
    if (stats[type] !== undefined) {
      stats[type]++;
    }
  });
  const typeNames: Record<string, string> = {
    WORD: 'Word文档',
    EXCEL: 'Excel表格',
    PDF: 'PDF文档',
    OTHER: '其他文件',
  };
  return Object.entries(stats)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: typeNames[type] || type,
      value: count,
    }));
});

const sizeChartData = computed(() => {
  if (statistics.value?.sizeDistribution) {
    const typeNames: Record<string, string> = {
      WORD: 'Word文档',
      EXCEL: 'Excel表格',
      PDF: 'PDF文档',
      OTHER: '其他文件',
    };
    return Object.entries(statistics.value.sizeDistribution)
      .filter(([_, size]) => size > 0)
      .map(([type, size]) => ({
        name: typeNames[type] || type,
        value: Math.round(size / 1024 / 1024 * 100) / 100,
      }));
  }

  const stats: Record<string, number> = { WORD: 0, EXCEL: 0, PDF: 0, OTHER: 0 };
  documents.value.forEach((doc) => {
    const type = doc.documentType || 'OTHER';
    if (stats[type] !== undefined) {
      stats[type] += doc.fileSize || 0;
    }
  });
  const typeNames: Record<string, string> = {
    WORD: 'Word文档',
    EXCEL: 'Excel表格',
    PDF: 'PDF文档',
    OTHER: '其他文件',
  };
  return Object.entries(stats)
    .filter(([_, size]) => size > 0)
    .map(([type, size]) => ({
      name: typeNames[type] || type,
      value: Math.round(size / 1024 / 1024 * 100) / 100,
    }));
});

const trendData = computed(() => {
  if (statistics.value?.monthlyTrend && statistics.value.monthlyTrend.length > 0) {
    return {
      months: statistics.value.monthlyTrend.map((item) => {
        const date = new Date(item.month);
        return `${date.getMonth() + 1}月`;
      }),
      uploadData: statistics.value.monthlyTrend.map((item) => item.uploads),
      viewData: statistics.value.monthlyTrend.map((item) => item.views),
    };
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const currentMonth = new Date().getMonth();
  const uploadData = months.map((_, index) => (index <= currentMonth ? Math.floor(Math.random() * 50) + 10 : 0));
  const viewData = months.map((_, index) => (index <= currentMonth ? Math.floor(Math.random() * 200) + 50 : 0));
  return { months, uploadData, viewData };
});

const recentDocuments = computed(() => {
  return [...documents.value]
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    .slice(0, 10);
});

const recentViewedDocuments = computed(() => {
  return [...documents.value]
    .filter(doc => doc.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10);
});

const fetchStatistics = async () => {
  statisticsLoading.value = true;
  try {
    const response = await getDashboardStatisticsApi();
    if (response) {
      statistics.value = response;
      totalDocuments.value = response.totalDocuments || 0;
      totalSize.value = response.totalSize || 0;
      weeklyUploads.value = response.weeklyUploads || 0;
      totalViews.value = response.totalViews || 0;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  } finally {
    statisticsLoading.value = false;
  }
};

const fetchDocuments = async () => {
  loading.value = true;
  try {
    const response = await getDocumentListApi({
      page: 1,
      size: 100,
    });

    if (response) {
      documents.value = response.documents || [];
      if (!statistics.value) {
        totalDocuments.value = response.total || 0;
        totalSize.value = documents.value.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
        weeklyUploads.value = documents.value.filter(d => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(d.createTime) > weekAgo;
        }).length;
        totalViews.value = documents.value.reduce((sum, d) => sum + (d.viewCount || 0), 0);
      }
    }
  } catch (error) {
    console.error('获取文档列表失败:', error);
    ElMessage.error('获取文档列表失败');
  } finally {
    loading.value = false;
  }
};

const renderCharts = () => {
  renderTypeChartFunc();
  renderTrendChartFunc();
  renderSizeChartFunc();
};

const renderTypeChartFunc = () => {
  const data = typeChartData.value;
  renderTypeChart({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 个 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        data,
        radius: chartType1.value === 'pie' ? '60%' : ['40%', '70%'],
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

const renderTrendChartFunc = () => {
  const { months, uploadData, viewData } = trendData.value;
  
  const series: any = [
    {
      name: '上传数量',
      data: uploadData,
      type: chartType2.value as 'bar' | 'line',
      smooth: true,
      itemStyle: { color: '#409eff' },
      yAxisIndex: 0,
    },
    {
      name: '查看次数',
      data: viewData,
      type: 'line',
      smooth: true,
      itemStyle: { color: '#67c23a' },
      yAxisIndex: 1,
    },
  ];

  if (chartType2.value === 'line') {
    series[0].areaStyle = {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
        ],
      },
    };
  }

  renderTrendChart({
    grid: {
      bottom: 30,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '15%',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['上传数量', '查看次数'],
      top: 0,
    },
    xAxis: {
      data: months,
      type: 'category',
    },
    yAxis: [
      {
        type: 'value',
        name: '上传数量',
        position: 'left',
      },
      {
        type: 'value',
        name: '查看次数',
        position: 'right',
      },
    ],
    series,
  });
};

const renderSizeChartFunc = () => {
  const data = sizeChartData.value;
  
  renderSizeChart({
    grid: {
      bottom: 30,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '10%',
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} MB',
    },
    xAxis: {
      data: data.map((item) => item.name),
      type: 'category',
    },
    yAxis: {
      type: 'value',
      name: '存储空间 (MB)',
    },
    series: [
      {
        data: data.map((item) => item.value),
        type: 'bar',
        barMaxWidth: 60,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#e6a23c' },
              { offset: 1, color: '#f56c6c' },
            ],
          },
        },
      },
    ],
  });
};

const getDocumentTypeTag = (type: string) => {
  const typeMap: Record<string, { label: string; type: string }> = {
    WORD: { label: 'Word', type: 'primary' },
    EXCEL: { label: 'Excel', type: 'success' },
    PDF: { label: 'PDF', type: 'danger' },
    OTHER: { label: '其他', type: 'info' },
  };
  return typeMap[type] || typeMap.OTHER;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

watch(chartType1, () => renderTypeChartFunc());
watch(chartType2, () => renderTrendChartFunc());

watch([documents, statistics], () => {
  renderCharts();
}, { deep: true });

onMounted(async () => {
  // 先获取统计数据，再获取文档列表
  await fetchStatistics();
  await fetchDocuments();
  renderCharts();
});
</script>

<template>
  <div class="dashboard p-4">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">文档库仪表盘</h2>
      <p class="text-gray-500 mt-1">文档统计与分析概览</p>
      <p class="text-gray-400 text-sm mt-1">仅展示公开的文档统计数据</p>
    </div>

    <ElRow :gutter="20" class="mb-6">
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-gray-500 text-sm mb-1">文档总数</div>
              <ElStatistic :value="totalDocuments" suffix="个">
                <template #prefix>
                  <Icon icon="lucide:file-text" class="text-primary text-xl" />
                </template>
              </ElStatistic>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon icon="lucide:files" class="text-2xl text-blue-500" />
            </div>
          </div>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
                <div class="text-gray-500 text-sm mb-1">存储空间</div>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-semibold font-mono">{{ totalSizeMB }}</span>
                  <span class="text-gray-500">MB</span>
                </div>
              </div>
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Icon icon="lucide:database" class="text-2xl text-green-500" />
            </div>
          </div>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-gray-500 text-sm mb-1">本周上传</div>
              <ElStatistic :value="weeklyUploads" suffix="个">
                <template #prefix>
                  <Icon icon="lucide:upload" class="text-orange-500 text-xl" />
                </template>
              </ElStatistic>
            </div>
            <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Icon icon="lucide:trending-up" class="text-2xl text-orange-500" />
            </div>
          </div>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-gray-500 text-sm mb-1">总查看次数</div>
              <ElStatistic :value="totalViews" suffix="次">
                <template #prefix>
                  <Icon icon="lucide:eye" class="text-purple-500 text-xl" />
                </template>
              </ElStatistic>
            </div>
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Icon icon="lucide:activity" class="text-2xl text-purple-500" />
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-6">
      <ElCol :xs="24" :md="12">
        <ElCard shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">文档类型分布</span>
              <ElRadioGroup v-model="chartType1" size="small">
                <ElRadio value="pie">饼图</ElRadio>
                <ElRadio value="donut">环形图</ElRadio>
              </ElRadioGroup>
            </div>
          </template>
          <div class="h-[300px]">
            <EchartsUI ref="chartRef1" />
          </div>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <ElCard shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">存储空间分布</span>
              <span class="text-sm text-gray-500">按文档类型</span>
            </div>
          </template>
          <div class="h-[300px]">
            <EchartsUI ref="chartRef3" />
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-6">
      <ElCol :span="24">
        <ElCard shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">上传与查看趋势</span>
              <ElRadioGroup v-model="chartType2" size="small">
                <ElRadio value="line">折线图</ElRadio>
                <ElRadio value="bar">柱状图</ElRadio>
              </ElRadioGroup>
            </div>
          </template>
          <div class="h-[300px]">
            <EchartsUI ref="chartRef2" />
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :xs="24" :md="12">
        <ElCard shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:clock" class="text-primary" />
              <span class="font-semibold">最近上传的文档</span>
            </div>
          </template>
          <ElTable :data="recentDocuments" size="small" max-height="350">
            <template #empty>
              <ElEmpty description="暂无文档" :image-size="60" />
            </template>
            <ElTableColumn prop="documentName" label="文档名称" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <Icon
                    :icon="getDocumentTypeIcon(row.documentType)"
                    class="text-lg"
                    :style="{ color: getDocumentTypeColor(row.documentType) }"
                  />
                  <span>{{ row.documentName }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="documentType" label="类型" width="80" align="center">
              <template #default="{ row }">
                <ElTag :type="getDocumentTypeTag(row.documentType).type" size="small">
                  {{ getDocumentTypeTag(row.documentType).label }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="createTime" label="上传时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <ElCard shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:eye" class="text-green-500" />
              <span class="font-semibold">热门文档</span>
            </div>
          </template>
          <ElTable :data="recentViewedDocuments" size="small" max-height="350">
            <template #empty>
              <ElEmpty description="暂无数据" :image-size="60" />
            </template>
            <ElTableColumn prop="documentName" label="文档名称" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <Icon
                    :icon="getDocumentTypeIcon(row.documentType)"
                    class="text-lg"
                    :style="{ color: getDocumentTypeColor(row.documentType) }"
                  />
                  <span>{{ row.documentName }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="documentType" label="类型" width="80" align="center">
              <template #default="{ row }">
                <ElTag :type="getDocumentTypeTag(row.documentType).type" size="small">
                  {{ getDocumentTypeTag(row.documentType).label }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="viewCount" label="查看次数" width="100" align="center">
              <template #default="{ row }">
                <span class="text-primary font-semibold">{{ row.viewCount }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: calc(100vh - 100px);
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}
</style>
