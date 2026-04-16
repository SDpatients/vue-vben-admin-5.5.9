<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { AnalysisChartCard } from '@vben/common-ui';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElDialog,
  ElEmpty,
  ElInput,
  ElMessage,
  ElOption,
  ElProgress,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip,
} from 'element-plus';

import type { ActuatorApi } from '#/api/core/actuator';
import {
  getAppInfoApi,
  getHealthApi,
  getHttpServerRequestsApi,
  getJvmMemoryUsedApi,
  getLoggersApi,
  getMetricDetailApi,
  getMetricsListApi,
  getProcessCpuUsageApi,
  setLogLevelApi,
} from '#/api/core/actuator';

const loading = ref(false);
const refreshInterval = ref<number | null>(null);
const autoRefresh = ref(true);

const healthStatus = ref<ActuatorApi.HealthStatus | null>(null);
const appInfo = ref<ActuatorApi.AppInfo | null>(null);
const metricsList = ref<string[]>([]);
const jvmMemoryUsed = ref<ActuatorApi.MetricInfo | null>(null);
const processCpuUsage = ref<ActuatorApi.MetricInfo | null>(null);
const httpRequests = ref<ActuatorApi.MetricInfo | null>(null);
const loggers = ref<ActuatorApi.LoggerInfo | null>(null);

const showLoggerDialog = ref(false);
const searchLoggerName = ref('');
const selectedLoggerName = ref('');
const selectedLoggerLevel = ref('');

const statusColorMap: Record<string, string> = {
  UP: 'success',
  DOWN: 'danger',
  OUT_OF_SERVICE: 'warning',
  UNKNOWN: 'info',
};

const statusTextMap: Record<string, string> = {
  UP: '正常',
  DOWN: '异常',
  OUT_OF_SERVICE: '服务不可用',
  UNKNOWN: '未知',
};

const filteredLoggers = computed(() => {
  if (!loggers.value?.loggers) return [];
  const entries = Object.entries(loggers.value.loggers);
  if (!searchLoggerName.value) return entries.slice(0, 50);
  return entries
    .filter(([name]) => name.toLowerCase().includes(searchLoggerName.value.toLowerCase()))
    .slice(0, 50);
});

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

const getMetricValue = (metric: ActuatorApi.MetricInfo | null): number => {
  if (!metric?.measurements || metric.measurements.length === 0) return 0;
  return metric.measurements[0].value;
};

// 检查用户是否已登录
const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  console.log('[SystemMonitor] 认证状态检查:', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : '无',
  });
  return !!token;
};

const loadAllData = async () => {
  console.log('[SystemMonitor] loadAllData 开始加载数据...');

  // 检查认证状态
  const isAuthenticated = checkAuthStatus();
  if (!isAuthenticated) {
    console.warn('[SystemMonitor] 用户未登录，无法获取监控数据');
    ElMessage.warning('请先登录后再查看系统监控数据');
    return;
  }

  loading.value = true;
  try {
    // 单独加载每个 API，以便更好地追踪错误
    console.log('[SystemMonitor] 开始调用 getHealthApi...');
    const healthRes = await getHealthApi();
    console.log('[SystemMonitor] getHealthApi 结果:', healthRes);

    console.log('[SystemMonitor] 开始调用 getAppInfoApi...');
    const infoRes = await getAppInfoApi();
    console.log('[SystemMonitor] getAppInfoApi 结果:', infoRes);

    console.log('[SystemMonitor] 开始调用 getMetricsListApi...');
    const metricsRes = await getMetricsListApi();
    console.log('[SystemMonitor] getMetricsListApi 结果:', metricsRes);

    console.log('[SystemMonitor] 开始调用 getJvmMemoryUsedApi...');
    const jvmMemoryRes = await getJvmMemoryUsedApi();
    console.log('[SystemMonitor] getJvmMemoryUsedApi 结果:', jvmMemoryRes);

    console.log('[SystemMonitor] 开始调用 getProcessCpuUsageApi...');
    const cpuRes = await getProcessCpuUsageApi();
    console.log('[SystemMonitor] getProcessCpuUsageApi 结果:', cpuRes);

    console.log('[SystemMonitor] 开始调用 getHttpServerRequestsApi...');
    const httpRes = await getHttpServerRequestsApi();
    console.log('[SystemMonitor] getHttpServerRequestsApi 结果:', httpRes);

    // loggers 是可选的，失败不影响其他数据
    let loggersRes = null;
    try {
      console.log('[SystemMonitor] 开始调用 getLoggersApi...');
      loggersRes = await getLoggersApi();
      console.log('[SystemMonitor] getLoggersApi 结果:', loggersRes);
    } catch (err: any) {
      console.log('[SystemMonitor] getLoggersApi 失败（可选）:', err?.message || err);
    }

    // 赋值给响应式变量
    healthStatus.value = healthRes;
    appInfo.value = infoRes;
    metricsList.value = metricsRes?.names || [];
    jvmMemoryUsed.value = jvmMemoryRes;
    processCpuUsage.value = cpuRes;
    httpRequests.value = httpRes;
    loggers.value = loggersRes;

    console.log('[SystemMonitor] 所有数据赋值完成');
  } catch (error: any) {
    console.error('[SystemMonitor] 加载数据错误:', error);
    console.error('[SystemMonitor] 错误详情:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      code: error?.code,
    });

    if (error?.response?.status === 401) {
      ElMessage.error('未授权访问：请检查是否已登录或 token 是否过期');
    } else {
      ElMessage.error(`加载监控数据失败: ${error?.message || '未知错误'}`);
    }
  } finally {
    loading.value = false;
    console.log('[SystemMonitor] loadAllData 结束');
  }
};

const openLoggerDialog = () => {
  showLoggerDialog.value = true;
};

const handleSetLogLevel = async () => {
  if (!selectedLoggerName.value || !selectedLoggerLevel.value) {
    ElMessage.warning('请选择日志名称和级别');
    return;
  }

  try {
    await setLogLevelApi(selectedLoggerName.value, selectedLoggerLevel.value);
    ElMessage.success('日志级别设置成功');
    const loggersRes = await getLoggersApi();
    loggers.value = loggersRes;
  } catch (error: any) {
    ElMessage.error(`设置日志级别失败: ${error?.message || '未知错误'}`);
  }
};

const selectLogger = (name: string, level: string) => {
  selectedLoggerName.value = name;
  selectedLoggerLevel.value = level || 'INFO';
};

const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
  if (autoRefresh.value) {
    refreshInterval.value = window.setInterval(() => {
      loadAllData();
    }, 30000);
  }
};

const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    startAutoRefresh();
    ElMessage.success('已开启自动刷新（每30秒）');
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
    ElMessage.info('已关闭自动刷新');
  }
};

onMounted(() => {
  loadAllData();
  startAutoRefresh();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="system-monitor-container p-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">系统健康监控</h2>
      <div class="flex items-center gap-4">
        <ElTooltip content="每30秒自动刷新数据">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">自动刷新</span>
            <input
              v-model="autoRefresh"
              type="checkbox"
              class="toggle-checkbox"
              @change="toggleAutoRefresh"
            />
          </div>
        </ElTooltip>
        <ElButton type="primary" :loading="loading" @click="loadAllData">
          <Icon icon="lucide:refresh-cw" class="mr-1" />
          刷新数据
        </ElButton>
        <ElButton @click="openLoggerDialog">
          <Icon icon="lucide:settings" class="mr-1" />
          日志级别管理
        </ElButton>
      </div>
    </div>

    <ElRow :gutter="16" v-loading="loading">
      <ElCol :span="24" class="mb-4">
        <ElCard shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">系统状态概览</span>
              <ElTag
                :type="statusColorMap[healthStatus?.status || 'UNKNOWN']"
                size="large"
              >
                {{ statusTextMap[healthStatus?.status || 'UNKNOWN'] }}
              </ElTag>
            </div>
          </template>
          <ElRow :gutter="16">
            <ElCol :span="6">
              <div class="status-card">
                <div class="status-icon db">
                  <Icon icon="lucide:database" />
                </div>
                <div class="status-info">
                  <div class="status-label">数据库</div>
                  <ElTag
                    :type="statusColorMap[healthStatus?.components?.db?.status || 'UNKNOWN']"
                    size="small"
                  >
                    {{ statusTextMap[healthStatus?.components?.db?.status || '未知'] }}
                  </ElTag>
                  <div v-if="healthStatus?.components?.db?.details" class="status-detail">
                    {{ healthStatus.components.db.details.database }}
                  </div>
                </div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="status-card">
                <div class="status-icon disk">
                  <Icon icon="lucide:hard-drive" />
                </div>
                <div class="status-info">
                  <div class="status-label">磁盘空间</div>
                  <ElTag
                    :type="statusColorMap[healthStatus?.components?.diskSpace?.status || 'UNKNOWN']"
                    size="small"
                  >
                    {{ statusTextMap[healthStatus?.components?.diskSpace?.status || '未知'] }}
                  </ElTag>
                  <div v-if="healthStatus?.components?.diskSpace?.details" class="status-detail">
                    可用: {{ formatBytes(healthStatus.components.diskSpace.details.free) }}
                  </div>
                </div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="status-card">
                <div class="status-icon redis">
                  <Icon icon="lucide:server" />
                </div>
                <div class="status-info">
                  <div class="status-label">Redis</div>
                  <ElTag
                    :type="statusColorMap[healthStatus?.components?.redis?.status || 'UNKNOWN']"
                    size="small"
                  >
                    {{ statusTextMap[healthStatus?.components?.redis?.status || '未知'] }}
                  </ElTag>
                  <div v-if="healthStatus?.components?.redis?.details" class="status-detail">
                    版本: {{ healthStatus.components.redis.details.version }}
                  </div>
                </div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="status-card">
                <div class="status-icon app">
                  <Icon icon="lucide:box" />
                </div>
                <div class="status-info">
                  <div class="status-label">应用信息</div>
                  <div v-if="appInfo?.app" class="status-detail">
                    {{ appInfo.app.name }} v{{ appInfo.app.version }}
                  </div>
                  <div v-if="appInfo?.java" class="status-detail text-xs">
                    Java {{ appInfo.java.version }}
                  </div>
                </div>
              </div>
            </ElCol>
          </ElRow>
        </ElCard>
      </ElCol>

      <ElCol :span="12" class="mb-4">
        <AnalysisChartCard title="JVM 内存使用">
          <div class="metric-card">
            <div class="metric-value">
              {{ formatBytes(getMetricValue(jvmMemoryUsed)) }}
            </div>
            <div class="metric-label">当前使用量</div>
            <ElProgress
              :percentage="Number((Math.min((getMetricValue(jvmMemoryUsed) / (1024 * 1024 * 512)) * 100, 100)).toFixed(2))"
              :stroke-width="10"
              :color="[
                { color: '#67c23a', percentage: 60 },
                { color: '#e6a23c', percentage: 80 },
                { color: '#f56c6c', percentage: 100 },
              ]"
              class="mt-4"
            />
            <div class="metric-description mt-2">
              JVM 堆内存使用情况监控
            </div>
          </div>
        </AnalysisChartCard>
      </ElCol>

      <ElCol :span="12" class="mb-4">
        <AnalysisChartCard title="CPU 使用率">
          <div class="metric-card">
            <div class="metric-value">
              {{ formatPercentage(getMetricValue(processCpuUsage)) }}
            </div>
            <div class="metric-label">当前 CPU 使用率</div>
            <ElProgress
              :percentage="Number((Math.min(getMetricValue(processCpuUsage) * 100, 100)).toFixed(2))"
              :stroke-width="10"
              :color="[
                { color: '#67c23a', percentage: 50 },
                { color: '#e6a23c', percentage: 75 },
                { color: '#f56c6c', percentage: 100 },
              ]"
              class="mt-4"
            />
            <div class="metric-description mt-2">
              进程 CPU 使用率监控
            </div>
          </div>
        </AnalysisChartCard>
      </ElCol>

      <ElCol :span="24" class="mb-4">
        <AnalysisChartCard title="HTTP 请求统计">
          <div v-if="httpRequests?.measurements && httpRequests.measurements.length > 0">
            <ElRow :gutter="16">
              <ElCol
                v-for="measurement in httpRequests.measurements"
                :key="measurement.statistic"
                :span="8"
              >
                <div class="http-stat-card">
                  <div class="http-stat-value">
                    {{ measurement.statistic === 'COUNT' 
                      ? measurement.value 
                      : measurement.value.toFixed(3) }}
                  </div>
                  <div class="http-stat-label">
                    {{ measurement.statistic === 'COUNT' ? '请求总数' 
                      : measurement.statistic === 'TOTAL_TIME' ? '总耗时(秒)' 
                      : '最大耗时(秒)' }}
                  </div>
                </div>
              </ElCol>
            </ElRow>
            <div v-if="httpRequests.availableTags && httpRequests.availableTags.length > 0" class="mt-4">
              <div class="text-sm text-gray-500 mb-2">可用过滤标签:</div>
              <div class="flex flex-wrap gap-2">
                <ElTag
                  v-for="tag in httpRequests.availableTags"
                  :key="tag.tag"
                  type="info"
                  size="small"
                >
                  {{ tag.tag }}: {{ tag.values.slice(0, 3).join(', ') }}{{ tag.values.length > 3 ? '...' : '' }}
                </ElTag>
              </div>
            </div>
          </div>
          <ElEmpty v-else description="暂无 HTTP 请求统计数据" />
        </AnalysisChartCard>
      </ElCol>

      <ElCol :span="24" class="mb-4">
        <AnalysisChartCard title="可用监控指标">
          <div class="metrics-grid">
            <ElTag
              v-for="name in metricsList.slice(0, 30)"
              :key="name"
              class="metric-tag"
              type="info"
            >
              {{ name }}
            </ElTag>
            <ElTag v-if="metricsList.length > 30" type="warning">
              还有 {{ metricsList.length - 30 }} 个指标...
            </ElTag>
          </div>
        </AnalysisChartCard>
      </ElCol>

      <ElCol :span="24">
        <AnalysisChartCard title="系统环境信息">
          <div v-if="appInfo" class="env-info">
            <ElRow :gutter="16">
              <ElCol :span="8">
                <div class="env-card">
                  <div class="env-title">
                    <Icon icon="lucide:package" class="mr-2" />
                    应用信息
                  </div>
                  <div v-if="appInfo.app" class="env-content">
                    <div><span class="label">名称:</span> {{ appInfo.app.name }}</div>
                    <div><span class="label">版本:</span> {{ appInfo.app.version }}</div>
                  </div>
                </div>
              </ElCol>
              <ElCol :span="8">
                <div class="env-card">
                  <div class="env-title">
                    <Icon icon="lucide:coffee" class="mr-2" />
                    Java 环境
                  </div>
                  <div v-if="appInfo.java" class="env-content">
                    <div><span class="label">版本:</span> {{ appInfo.java.version }}</div>
                    <div><span class="label">供应商:</span> {{ appInfo.java.vendor }}</div>
                  </div>
                </div>
              </ElCol>
              <ElCol :span="8">
                <div class="env-card">
                  <div class="env-title">
                    <Icon icon="lucide:monitor" class="mr-2" />
                    操作系统
                  </div>
                  <div v-if="appInfo.os" class="env-content">
                    <div><span class="label">名称:</span> {{ appInfo.os.name }}</div>
                    <div><span class="label">架构:</span> {{ appInfo.os.arch }}</div>
                    <div><span class="label">版本:</span> {{ appInfo.os.version }}</div>
                  </div>
                </div>
              </ElCol>
            </ElRow>
          </div>
          <ElEmpty v-else description="暂无环境信息" />
        </AnalysisChartCard>
      </ElCol>
    </ElRow>

    <ElDialog
      v-model="showLoggerDialog"
      title="日志级别管理"
      width="80%"
      destroy-on-close
    >
      <div class="logger-dialog-content">
        <div class="mb-4 flex items-center gap-4">
          <ElInput
            v-model="searchLoggerName"
            placeholder="搜索日志名称..."
            clearable
            class="w-64"
          >
            <template #prefix>
              <Icon icon="lucide:search" />
            </template>
          </ElInput>
        </div>

        <div class="flex gap-4">
          <div class="w-2/3">
            <ElTable
              :data="filteredLoggers"
              border
              stripe
              max-height="500"
              @row-click="(row: any) => selectLogger(row[0], row[1].configuredLevel || row[1].effectiveLevel)"
            >
              <ElTableColumn prop="0" label="日志名称" min-width="300" show-overflow-tooltip />
              <ElTableColumn label="配置级别" width="120">
                <template #default="{ row }">
                  <ElTag
                    :type="row[1].configuredLevel ? 'success' : 'info'"
                    size="small"
                  >
                    {{ row[1].configuredLevel || '默认' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="有效级别" width="120">
                <template #default="{ row }">
                  <ElTag type="primary" size="small">
                    {{ row[1].effectiveLevel }}
                  </ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>

          <div class="w-1/3">
            <ElCard shadow="hover">
              <template #header>
                <span class="font-semibold">修改日志级别</span>
              </template>
              <div class="space-y-4">
                <div>
                  <div class="text-sm text-gray-500 mb-2">选中的日志名称:</div>
                  <ElInput
                    v-model="selectedLoggerName"
                    placeholder="点击表格选择日志名称"
                    readonly
                  />
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-2">选择日志级别:</div>
                  <ElSelect v-model="selectedLoggerLevel" placeholder="选择级别" class="w-full">
                    <ElOption
                      v-for="level in loggers?.levels || []"
                      :key="level"
                      :label="level"
                      :value="level"
                    />
                  </ElSelect>
                </div>
                <ElButton
                  type="primary"
                  :disabled="!selectedLoggerName"
                  @click="handleSetLogLevel"
                  class="w-full"
                >
                  应用修改
                </ElButton>
              </div>
            </ElCard>
          </div>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.system-monitor-container {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.status-card:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.status-icon.db {
  background: #e3f2fd;
  color: #1976d2;
}

.status-icon.disk {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-icon.redis {
  background: #fff3e0;
  color: #e65100;
}

.status-icon.app {
  background: #e8f5e9;
  color: #388e3c;
}

.status-info {
  flex: 1;
}

.status-label {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.status-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.metric-card {
  text-align: center;
  padding: 20px;
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.metric-description {
  font-size: 12px;
  color: #c0c4cc;
}

.http-stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.http-stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.http-stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.metrics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metric-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.metric-tag:hover {
  transform: scale(1.05);
}

.env-info {
  padding: 8px;
}

.env-card {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  height: 100%;
}

.env-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.env-content {
  font-size: 14px;
  color: #606266;
}

.env-content .label {
  color: #909399;
  margin-right: 8px;
}

.env-content > div {
  margin-bottom: 8px;
}

.logger-dialog-content {
  min-height: 400px;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 16px;
}
</style>
