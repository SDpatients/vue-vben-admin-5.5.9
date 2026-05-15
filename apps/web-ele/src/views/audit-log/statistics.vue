<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

import {
  getModuleStatisticsApi,
  getOperationStatisticsApi,
  getTrendStatisticsApi,
} from '#/api/core/audit-log';

import { Icon } from '@iconify/vue';

const loading = ref(false);
const moduleLoading = ref(false);
const operationLoading = ref(false);
const trendLoading = ref(false);

const moduleStats = ref<Record<string, number>>({});
const operationStats = ref<Record<string, number>>({});
const trendData = ref<{ date: string; count: number }[]>([]);

const dateRange = ref<[string, string]>(['', '']);

const moduleColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
  '#909399', '#36cfc9', '#597ef7', '#9254de',
];

const moduleChartData = computed(() => {
  const entries = Object.entries(moduleStats.value);
  if (entries.length === 0) return [];
  return entries.map(([name, count], index) => ({
    name,
    count,
    color: moduleColors[index % moduleColors.length],
  }));
});

const maxModuleCount = computed(() => {
  const counts = moduleChartData.value.map((item) => item.count);
  return counts.length > 0 ? Math.max(...counts) : 0;
});

const operationChartData = computed(() => {
  const entries = Object.entries(operationStats.value);
  if (entries.length === 0) return [];
  return entries.map(([name, count]) => ({ name, count }));
});

const maxOperationCount = computed(() => {
  const counts = operationChartData.value.map((item) => item.count);
  return counts.length > 0 ? Math.max(...counts) : 0;
});

const maxTrendCount = computed(() => {
  const counts = trendData.value.map((item) => item.count);
  return counts.length > 0 ? Math.max(...counts) : 1;
});

const fetchModuleStats = async () => {
  moduleLoading.value = true;
  try {
    const response = await getModuleStatisticsApi(
      dateRange.value[0] || undefined,
      dateRange.value[1] || undefined,
    );
    moduleStats.value = response.data;
  } catch (error) {
    ElMessage.error('获取模块统计失败');
    console.error('获取模块统计失败:', error);
    moduleStats.value = {};
  } finally {
    moduleLoading.value = false;
  }
};

const fetchOperationStats = async () => {
  operationLoading.value = true;
  try {
    const response = await getOperationStatisticsApi(
      dateRange.value[0] || undefined,
      dateRange.value[1] || undefined,
    );
    operationStats.value = response.data;
  } catch (error) {
    ElMessage.error('获取操作统计失败');
    console.error('获取操作统计失败:', error);
    operationStats.value = {};
  } finally {
    operationLoading.value = false;
  }
};

const fetchTrendStats = async () => {
  trendLoading.value = true;
  try {
    const response = await getTrendStatisticsApi(
      dateRange.value[0] || undefined,
      dateRange.value[1] || undefined,
    );
    trendData.value = response.data;
  } catch (error) {
    ElMessage.error('获取趋势统计失败');
    console.error('获取趋势统计失败:', error);
    trendData.value = [];
  } finally {
    trendLoading.value = false;
  }
};

const fetchAllStats = async () => {
  loading.value = true;
  await Promise.all([fetchModuleStats(), fetchOperationStats(), fetchTrendStats()]);
  loading.value = false;
};

const handleDateChange = () => {
  fetchAllStats();
};

const operationLabelMap: Record<string, string> = {
  CREATE: '创建',
  UPDATE: '更新',
  DELETE: '删除',
  QUERY: '查询',
  EXPORT: '导出',
  IMPORT: '导入',
  LOGIN: '登录',
  OTHER: '其他',
};

const getOperationLabel = (key: string) => {
  return operationLabelMap[key] || key;
};

const getBarWidth = (count: number, maxCount: number): string => {
  if (maxCount === 0) return '0%';
  return `${(count / maxCount) * 100}%`;
};

const getTrendBarHeight = (count: number, maxCount: number): string => {
  if (maxCount === 0) return '0%';
  return `${(count / maxCount) * 100}%`;
};

onMounted(() => {
  fetchAllStats();
});
</script>

<template>
  <div class="audit-log-statistics-page">
    <div class="page-header">
      <h1>审计日志统计分析</h1>
    </div>

    <div class="statistics-content">
      <el-card shadow="hover" class="date-filter-card">
        <el-form inline>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleDateChange">
              查询统计
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div class="chart-grid" v-loading="loading">
        <el-card shadow="hover" class="chart-card" v-loading="moduleLoading">
          <template #header>
            <div class="chart-header">
              <Icon icon="lucide:bar-chart-3" class="chart-icon" />
              <span>按模块统计</span>
            </div>
          </template>
          <el-empty v-if="moduleChartData.length === 0" description="暂无数据" />
          <div v-else class="horizontal-bar-chart">
            <div
              v-for="item in moduleChartData"
              :key="item.name"
              class="bar-row"
            >
              <span class="bar-label">{{ item.name }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    width: getBarWidth(item.count, maxModuleCount),
                    backgroundColor: item.color,
                  }"
                >
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="chart-card" v-loading="operationLoading">
          <template #header>
            <div class="chart-header">
              <Icon icon="lucide:pie-chart" class="chart-icon" />
              <span>按操作类型统计</span>
            </div>
          </template>
          <el-empty v-if="operationChartData.length === 0" description="暂无数据" />
          <div v-else class="horizontal-bar-chart">
            <div
              v-for="(item, opIdx) in operationChartData"
              :key="item.name"
              class="bar-row"
            >
              <span class="bar-label">{{ getOperationLabel(item.name) }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    width: getBarWidth(item.count, maxOperationCount),
                    backgroundColor: moduleColors[opIdx % moduleColors.length],
                  }"
                >
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="chart-card trend-card" v-loading="trendLoading">
          <template #header>
            <div class="chart-header">
              <Icon icon="lucide:trending-up" class="chart-icon" />
              <span>操作趋势统计</span>
            </div>
          </template>
          <el-empty v-if="trendData.length === 0" description="暂无数据" />
          <div v-else class="vertical-bar-chart">
            <div class="chart-bars">
              <div
                v-for="item in trendData"
                :key="item.date"
                class="trend-bar-wrapper"
              >
                <div class="trend-bar-value">{{ item.count }}</div>
                <div class="trend-bar-track">
                  <div
                    class="trend-bar-fill"
                    :style="{ height: getTrendBarHeight(item.count, maxTrendCount) }"
                  ></div>
                </div>
                <div class="trend-bar-date">{{ item.date.slice(5) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audit-log-statistics-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.statistics-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.date-filter-card {
  margin-bottom: 20px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.trend-card {
  grid-column: span 2;
}

.chart-card {
  margin-bottom: 0;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.chart-icon {
  font-size: 18px;
  color: #409eff;
}

.horizontal-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 80px;
  font-size: 13px;
  color: #606266;
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 28px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 40px;
  transition: width 0.6s ease;
}

.bar-value {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding-right: 8px;
}

.vertical-bar-chart {
  padding: 16px 0;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.trend-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.trend-bar-value {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  font-weight: 600;
}

.trend-bar-track {
  width: 30px;
  height: 150px;
  background-color: #f0f2f5;
  border-radius: 4px 4px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.trend-bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #409eff 0%, #79bbff 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.6s ease;
  min-height: 2px;
}

.trend-bar-date {
  font-size: 11px;
  color: #909399;
  margin-top: 6px;
  white-space: nowrap;
}
</style>