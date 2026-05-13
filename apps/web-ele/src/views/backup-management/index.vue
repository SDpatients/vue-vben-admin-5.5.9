<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  getBackupListApi,
  executeBackupApi,
  getBackupStatusApi,
  downloadBackupApi,
  deleteBackupApi,
  cleanupBackupApi,
  getBackupStatisticsApi,
} from '#/api/core/backup';

const loading = ref(false);
const executing = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const backups = ref<any[]>([]);

const searchForm = reactive({
  status: undefined as string | undefined,
  backupType: undefined as string | undefined,
  startDate: '',
  endDate: '',
});

const statistics = ref({
  totalCount: 0,
  successCount: 0,
  failedCount: 0,
  runningCount: 0,
  totalFileSizeDisplay: '0 B',
  lastBackupTime: null as string | null,
  lastSuccessBackupTime: null as string | null,
  lastSuccessFileName: null as string | null,
  backupPath: '',
  retentionDays: 0,
  backupEnabled: false,
  cronExpression: '',
});

const statusOptions = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
];

const backupTypeOptions = [
  { label: '定时备份', value: 'FULL' },
  { label: '手动备份', value: 'MANUAL' },
];

let statusPollingTimer: ReturnType<typeof setInterval> | null = null;

const fetchStatistics = async () => {
  try {
    const response = await getBackupStatisticsApi();
    statistics.value = response.data;
  } catch (error) {
    console.error('获取备份统计信息失败:', error);
  }
};

const fetchBackupList = async () => {
  loading.value = true;
  try {
    const response = await getBackupListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      status: searchForm.status as any,
      backupType: searchForm.backupType as any,
      startDate: searchForm.startDate || undefined,
      endDate: searchForm.endDate || undefined,
    });
    backups.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取备份列表失败');
    console.error('获取备份列表失败:', error);
    backups.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchBackupList();
};

const handleReset = () => {
  searchForm.status = undefined;
  searchForm.backupType = undefined;
  searchForm.startDate = '';
  searchForm.endDate = '';
  currentPage.value = 1;
  fetchBackupList();
};

const handleExecuteBackup = async () => {
  try {
    await ElMessageBox.confirm('确定要立即执行数据库备份吗？', '执行备份', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });

    executing.value = true;
    const response = await executeBackupApi();
    if (response.code === 200) {
      ElMessage.success('备份执行成功');
      fetchBackupList();
      fetchStatistics();
      startStatusPolling();
    } else {
      ElMessage.error(response.message || '备份执行失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      const errorMsg = error?.response?.data?.message || error?.message || '备份执行失败';
      ElMessage.error(errorMsg);
      console.error('执行备份失败:', error);
    }
  } finally {
    executing.value = false;
  }
};

const startStatusPolling = () => {
  stopStatusPolling();
  statusPollingTimer = setInterval(async () => {
    try {
      const response = await getBackupStatusApi();
      if (!response.data.isRunning) {
        stopStatusPolling();
        fetchBackupList();
        fetchStatistics();
      }
    } catch {
      stopStatusPolling();
    }
  }, 3000);
};

const stopStatusPolling = () => {
  if (statusPollingTimer) {
    clearInterval(statusPollingTimer);
    statusPollingTimer = null;
  }
};

const handleDownload = async (row: any) => {
  try {
    const blob = await downloadBackupApi(row.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = row.fileName.replace('.gz', '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    ElMessage.success('下载已开始');
  } catch (error) {
    ElMessage.error('下载失败');
    console.error('下载备份文件失败:', error);
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份记录"${row.fileName}"吗？删除后文件将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    const { value: password } = await ElMessageBox.prompt(
      `请输入当前登录管理员密码以确认删除"${row.fileName}"`,
      '管理员密码验证',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '请输入登录密码',
        inputValidator: (value: string) => {
          if (!value || value.trim() === '') {
            return '密码不能为空';
          }
          return true;
        },
      },
    );

    if (!password) return;

    loading.value = true;
    await deleteBackupApi(row.id, password);
    ElMessage.success('删除成功');
    fetchBackupList();
    fetchStatistics();
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      const errorMsg = error?.response?.data?.message || error?.message || '删除失败';
      ElMessage.error(errorMsg);
      console.error('删除备份失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleCleanup = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要清理过期的备份文件吗？（保留期限：${statistics.value.retentionDays}天）`,
      '清理过期备份',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    loading.value = true;
    await cleanupBackupApi();
    ElMessage.success('清理完成');
    fetchBackupList();
    fetchStatistics();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('清理失败');
      console.error('清理过期备份失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchBackupList();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchBackupList();
};

const getStatusTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    PENDING: { type: 'info', text: '待执行' },
    RUNNING: { type: 'warning', text: '执行中' },
    SUCCESS: { type: 'success', text: '成功' },
    FAILED: { type: 'danger', text: '失败' },
  };
  return map[status] || { type: 'info', text: status };
};

const getBackupTypeTag = (type: string) => {
  const map: Record<string, { type: string; text: string }> = {
    FULL: { type: 'primary', text: '定时备份' },
    MANUAL: { type: 'warning', text: '手动备份' },
  };
  return map[type] || { type: 'info', text: type };
};

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${units[i]}`;
};

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDuration = (ms: number): string => {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}min`;
};

onMounted(() => {
  fetchStatistics();
  fetchBackupList();
});

onUnmounted(() => {
  stopStatusPolling();
});
</script>

<template>
  <div class="backup-management-page">
    <div class="page-header">
      <h1>备份管理</h1>
    </div>

    <div class="backup-management-content">
      <el-row :gutter="16" class="statistics-row">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ statistics.totalCount }}</div>
            <div class="stat-label">备份总次数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value stat-success">{{ statistics.successCount }}</div>
            <div class="stat-label">成功次数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value stat-danger">{{ statistics.failedCount }}</div>
            <div class="stat-label">失败次数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ statistics.totalFileSizeDisplay }}</div>
            <div class="stat-label">存储总量</div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="hover" class="info-card">
        <el-row :gutter="20">
          <el-col :span="6">
            <span class="info-label">备份路径：</span>
            <span class="info-value">{{ statistics.backupPath || '-' }}</span>
          </el-col>
          <el-col :span="6">
            <span class="info-label">保留天数：</span>
            <span class="info-value">{{ statistics.retentionDays }} 天</span>
          </el-col>
          <el-col :span="6">
            <span class="info-label">自动备份：</span>
            <el-tag
              :type="statistics.backupEnabled ? 'success' : 'danger'"
              size="small"
            >
              {{ statistics.backupEnabled ? '已启用' : '已禁用' }}
            </el-tag>
          </el-col>
          <el-col :span="6">
            <span class="info-label">Cron表达式：</span>
            <span class="info-value">{{ statistics.cronExpression || '-' }}</span>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 8px">
          <el-col :span="12">
            <span class="info-label">最近备份时间：</span>
            <span class="info-value">{{ formatDateTime(statistics.lastBackupTime) }}</span>
          </el-col>
          <el-col :span="12">
            <span class="info-label">最近成功备份：</span>
            <span class="info-value">{{ statistics.lastSuccessFileName || '-' }}</span>
          </el-col>
        </el-row>
      </el-card>

      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="80px">
          <el-form-item label="备份状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备份类型">
            <el-select
              v-model="searchForm.backupType"
              placeholder="请选择类型"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="item in backupTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="searchForm.startDate"
              type="datetime"
              placeholder="开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="searchForm.endDate"
              type="datetime"
              placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="hover" class="list-card">
        <div class="list-toolbar">
          <el-button
            type="success"
            :loading="executing"
            @click="handleExecuteBackup"
          >
            立即备份
          </el-button>
          <el-button type="warning" @click="handleCleanup">
            清理过期备份
          </el-button>
        </div>

        <el-table v-loading="loading" :data="backups" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="fileName" label="文件名" min-width="280" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status).type" size="small">
                {{ getStatusTag(scope.row.status).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="backupType" label="备份类型" width="110">
            <template #default="scope">
              <el-tag :type="getBackupTypeTag(scope.row.backupType).type" size="small">
                {{ getBackupTypeTag(scope.row.backupType).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="文件大小" width="120" align="right">
            <template #default="scope">
              {{ formatFileSize(scope.row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column label="耗时" width="100">
            <template #default="scope">
              {{ formatDuration(scope.row.duration) }}
            </template>
          </el-table-column>
          <el-table-column prop="databaseName" label="数据库" width="120" />
          <el-table-column label="开始时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column label="结束时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.status === 'SUCCESS'"
                type="primary"
                size="small"
                @click="handleDownload(scope.row)"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="!loading">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.backup-management-page {
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

.backup-management-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.statistics-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-value.stat-success {
  color: #67c23a;
}

.stat-value.stat-danger {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.info-card {
  margin-bottom: 16px;
}

.info-label {
  font-size: 13px;
  color: #909399;
}

.info-value {
  font-size: 13px;
  color: #333;
}

.search-card {
  margin-bottom: 16px;
}

.list-card {
  margin-bottom: 20px;
}

.list-toolbar {
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>