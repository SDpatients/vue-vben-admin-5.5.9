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
  ElMessageBox,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  getDocumentListApi,
  getRecentDocumentsApi,
  getPopularDocumentsApi,
  getDashboardStatisticsApi,
  downloadDocumentApi,
  formatFileSize,
  getDocumentTypeIcon,
  getDocumentTypeColor,
  normalizeDocumentType,
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

const recentDocOffset = ref(0);
const popularDocOffset = ref(0);

const recentVisibleDocs = computed(() => {
  return recentDocuments.value.slice(recentDocOffset.value, recentDocOffset.value + 5);
});

const popularVisibleDocs = computed(() => {
  return recentViewedDocuments.value.slice(popularDocOffset.value, popularDocOffset.value + 5);
});

const canSlideLeft = (type: 'recent' | 'popular') => {
  if (type === 'recent') {
    return recentDocOffset.value > 0;
  }
  return popularDocOffset.value > 0;
};

const canSlideRight = (type: 'recent' | 'popular') => {
  const totalDocs = type === 'recent' ? recentDocuments.value.length : recentViewedDocuments.value.length;
  const offset = type === 'recent' ? recentDocOffset.value : popularDocOffset.value;
  return offset + 5 < totalDocs;
};

// 计算轮播轨道的总宽度百分比
const getTrackWidth = (type: 'recent' | 'popular') => {
  const totalDocs = type === 'recent' ? recentDocuments.value.length : recentViewedDocuments.value.length;
  return totalDocs * 20; // 每个文档占 20% 宽度
};

const slideLeft = (type: 'recent' | 'popular') => {
  if (type === 'recent' && canSlideLeft('recent')) {
    recentDocOffset.value--;
  } else if (type === 'popular' && canSlideLeft('popular')) {
    popularDocOffset.value--;
  }
};

const slideRight = (type: 'recent' | 'popular') => {
  if (type === 'recent' && canSlideRight('recent')) {
    recentDocOffset.value++;
  } else if (type === 'popular' && canSlideRight('popular')) {
    popularDocOffset.value++;
  }
};

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
    const normalized = normalizeDocumentType(doc.documentType || '');
    if (stats[normalized] !== undefined) {
      stats[normalized]++;
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
    const normalized = normalizeDocumentType(doc.documentType || '');
    if (stats[normalized] !== undefined) {
      stats[normalized] += doc.fileSize || 0;
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

const recentDocuments = ref<DocumentLibraryApi.Document[]>([]);
const recentViewedDocuments = ref<DocumentLibraryApi.Document[]>([]);

const fetchRecentDocuments = async () => {
  try {
    const response = await getRecentDocumentsApi(1, 10); // 获取最新的10个文档
    recentDocuments.value = response.documents || [];
  } catch (error) {
    console.error('获取最近上传文档失败:', error);
    ElMessage.error('获取最近上传文档失败');
  }
};

const fetchPopularDocuments = async () => {
  try {
    const response = await getPopularDocumentsApi(1, 10, 'all'); // 获取热门的 10 个文档
    recentViewedDocuments.value = response.documents || [];
  } catch (error) {
    console.error('获取热门文档失败:', error);
    ElMessage.error('获取热门文档失败');
  }
};

const handleDownload = async (doc: DocumentLibraryApi.Document) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要下载文档"${doc.documentName}"吗？`,
      '下载确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    );

    if (confirm) {
      const result = await downloadDocumentApi(doc.id);
      const blob = result.blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename || doc.fileName || `${doc.documentName}.${doc.fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      ElMessage.success('下载成功');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('下载失败:', error);
      ElMessage.error('下载失败');
    }
  }
};

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
  const normalized = normalizeDocumentType(type);
  const typeMap: Record<string, { label: string; type: string }> = {
    WORD: { label: 'Word', type: 'primary' },
    EXCEL: { label: 'Excel', type: 'success' },
    PDF: { label: 'PDF', type: 'danger' },
    OTHER: { label: '其他', type: 'info' },
  };
  return typeMap[normalized] || typeMap.OTHER;
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
  await fetchRecentDocuments();
  await fetchPopularDocuments();
  renderCharts();
});
</script>

<template>
  <div class="dashboard p-4">
    <div class="mb-6 text-center">
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
      <ElCol :span="24">
        <div class="section-header">
          <div class="flex justify-center items-center gap-2 mb-1">
            <Icon icon="lucide:clock" class="text-primary" />
            <h3 class="section-title">最近上传的文档</h3>
          </div>
          <p class="section-subtitle">最新上传到文档库的公开文件</p>
        </div>
      </ElCol>
    </ElRow>

    <div class="carousel-container mb-6">
      <button 
        class="carousel-btn carousel-btn-left" 
        :class="{ disabled: !canSlideLeft('recent') }"
        @click="slideLeft('recent')"
      >
        <Icon icon="lucide:chevron-left" />
      </button>
      
      <div class="carousel-wrapper">
        <div class="carousel-track" :style="{ transform: `translateX(-${recentDocOffset * 20}%)` }">
          <div v-for="doc in recentDocuments" :key="`recent-${doc.id}`" class="carousel-item">
            <div class="document-card" @click="handleDownload(doc)">
              <div class="document-card-icon">
                <Icon
                  :icon="getDocumentTypeIcon(doc.documentType)"
                  :style="{ color: getDocumentTypeColor(doc.documentType) }"
                />
              </div>
              <div class="document-card-content">
                <h4 class="document-card-title" :title="doc.documentName">
                  {{ doc.documentName }}
                </h4>
                <div class="document-card-meta">
                  <ElTag :type="getDocumentTypeTag(doc.documentType).type" size="small">
                    {{ getDocumentTypeTag(doc.documentType).label }}
                  </ElTag>
                  <span class="document-card-date">{{ formatDate(doc.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        class="carousel-btn carousel-btn-right" 
        :class="{ disabled: !canSlideRight('recent') }"
        @click="slideRight('recent')"
      >
        <Icon icon="lucide:chevron-right" />
      </button>
    </div>

    <ElEmpty v-if="recentDocuments.length === 0" description="暂无文档" :image-size="80" />

    <ElRow :gutter="20" class="mb-6">
      <ElCol :span="24">
        <div class="section-header">
          <div class="flex justify-center items-center gap-2 mb-1">
            <Icon icon="lucide:fire" class="text-red-500" />
            <h3 class="section-title">热门文档</h3>
          </div>
          <p class="section-subtitle">查看次数最多的公开文档</p>
        </div>
      </ElCol>
    </ElRow>

    <div class="carousel-container mb-6">
      <button 
        class="carousel-btn carousel-btn-left" 
        :class="{ disabled: !canSlideLeft('popular') }"
        @click="slideLeft('popular')"
      >
        <Icon icon="lucide:chevron-left" />
      </button>
      
      <div class="carousel-wrapper">
        <div class="carousel-track" :style="{ transform: `translateX(-${popularDocOffset * 20}%)` }">
          <div v-for="doc in recentViewedDocuments" :key="`popular-${doc.id}`" class="carousel-item">
            <div class="document-card" @click="handleDownload(doc)">
              <div class="document-card-icon">
                <Icon
                  :icon="getDocumentTypeIcon(doc.documentType)"
                  :style="{ color: getDocumentTypeColor(doc.documentType) }"
                />
              </div>
              <div class="document-card-content">
                <h4 class="document-card-title" :title="doc.documentName">
                  {{ doc.documentName }}
                </h4>
                <div class="document-card-meta">
                  <ElTag :type="getDocumentTypeTag(doc.documentType).type" size="small">
                    {{ getDocumentTypeTag(doc.documentType).label }}
                  </ElTag>
                  <span class="document-card-views">
                    <Icon icon="lucide:eye" class="inline text-xs" />
                    {{ doc.viewCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        class="carousel-btn carousel-btn-right" 
        :class="{ disabled: !canSlideRight('popular') }"
        @click="slideRight('popular')"
      >
        <Icon icon="lucide:chevron-right" />
      </button>
    </div>

    <ElEmpty v-if="recentViewedDocuments.length === 0" description="暂无数据" :image-size="80" />

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

.section-header {
  margin-bottom: 24px;
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 8px 0 0 0;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.carousel-wrapper {
  flex: 1;
  overflow: visible;
  margin: 0 40px;
}

.carousel-track {
  display: flex;
  transition: transform 0.4s ease-in-out;
}

.carousel-item {
  width: 20%;
  flex-shrink: 0;
  padding: 0 8px;
  box-sizing: border-box;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #6b7280;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-btn:hover:not(.disabled) {
  background: #f3f4f6;
  color: #409eff;
  border-color: #409eff;
}

.carousel-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-btn-left {
  left: 0;
}

.carousel-btn-right {
  right: 0;
}

.document-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.document-card-icon {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 64px;
  overflow: hidden;
}

.document-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 42px;
}

.document-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.document-card-date {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.document-card-views {
  font-size: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.empty-state {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 1200px) {
  .carousel-item {
    width: 25%;
  }
}

@media (max-width: 992px) {
  .carousel-item {
    width: 33.333%;
  }
}

@media (max-width: 768px) {
  .carousel-item {
    width: 50%;
  }
  
  .carousel-wrapper {
    margin: 0 30px;
  }
  
  .document-card-icon {
    height: 200px;
    font-size: 48px;
  }
  
  .document-card-title {
    font-size: 13px;
    min-height: 39px;
  }
}
</style>
