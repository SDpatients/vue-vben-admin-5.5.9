<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  getIntegrityReportApi,
  verifyAllAuditLogsIntegrityApi,
} from '#/api/core/audit-log';

const verifying = ref(false);
const reportLoading = ref(false);

const integrityReport = ref<any>(null);
const tamperedLogs = ref<any[]>([]);

const fetchReport = async () => {
  reportLoading.value = true;
  try {
    const response = await getIntegrityReportApi();
    integrityReport.value = response.data;
  } catch (error) {
    ElMessage.error('获取完整性报告失败');
    console.error('获取完整性报告失败:', error);
    integrityReport.value = null;
  } finally {
    reportLoading.value = false;
  }
};

const handleVerifyAll = async () => {
  try {
    await ElMessageBox.confirm(
      '验证所有审计日志的完整性可能需要一些时间，确定继续吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
  } catch {
    return;
  }

  verifying.value = true;
  try {
    const response = await verifyAllAuditLogsIntegrityApi();
    tamperedLogs.value = response.data;
    if (tamperedLogs.value.length === 0) {
      ElMessage.success('所有审计日志记录完整，未被篡改');
    } else {
      ElMessage.warning(`发现 ${tamperedLogs.value.length} 条被篡改的日志记录！`);
    }
    await fetchReport();
  } catch (error) {
    ElMessage.error('完整性验证失败');
    console.error('完整性验证失败:', error);
  } finally {
    verifying.value = false;
  }
};

const handleRefreshReport = () => {
  fetchReport();
};

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  fetchReport();
});
</script>

<template>
  <div class="audit-log-integrity-page">
    <div class="page-header">
      <h1>审计日志完整性验证</h1>
    </div>

    <div class="integrity-content">
      <el-card shadow="hover" class="report-card" v-loading="reportLoading">
        <template #header>
          <div class="card-header">
            <span>完整性统计报告</span>
            <el-button
              type="primary"
              size="small"
              :loading="reportLoading"
              @click="handleRefreshReport"
            >
              刷新报告
            </el-button>
          </div>
        </template>
        <el-empty v-if="!integrityReport" description="暂无报告数据" />
        <div v-else class="report-cards">
          <div class="stat-card">
            <div class="stat-value">{{ integrityReport.totalCount }}</div>
            <div class="stat-label">日志总数</div>
          </div>
          <div class="stat-card verified">
            <div class="stat-value">{{ integrityReport.verifiedCount }}</div>
            <div class="stat-label">已验证完整</div>
          </div>
          <div v-if="integrityReport.tamperedCount > 0" class="stat-card tampered">
            <div class="stat-value">{{ integrityReport.tamperedCount }}</div>
            <div class="stat-label">被篡改</div>
          </div>
          <div class="stat-card pending" v-if="integrityReport.pendingCount > 0">
            <div class="stat-value">{{ integrityReport.pendingCount }}</div>
            <div class="stat-label">待验证</div>
          </div>
          <div class="stat-card rate">
            <div class="stat-value">{{ integrityReport.integrityRate }}%</div>
            <div class="stat-label">完整性比率</div>
          </div>
        </div>
        <div v-if="integrityReport" class="report-footer">
          <span class="last-verify">
            最后验证时间：{{ formatDateTime(integrityReport.lastVerificationTime) }}
          </span>
        </div>
      </el-card>

      <el-card shadow="hover" class="action-card">
        <div class="verify-all-action">
          <div class="action-info">
            <h3>批量完整性校验</h3>
            <p>验证所有审计日志记录的完整性，检测是否存在被篡改的记录。此操作需要 <code>system:audit:integrity</code> 权限。</p>
          </div>
          <el-button
            type="danger"
            :loading="verifying"
            size="large"
            @click="handleVerifyAll"
          >
            验证所有日志完整性
          </el-button>
        </div>
      </el-card>

      <el-card
        shadow="hover"
        class="tampered-card"
        v-if="tamperedLogs.length > 0"
      >
        <template #header>
          <div class="card-header warning">
            <span>被篡改的日志记录</span>
            <el-tag type="danger" size="large">
              {{ tamperedLogs.length }} 条异常
            </el-tag>
          </div>
        </template>
        <el-table :data="tamperedLogs" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="id" label="日志ID" width="100" />
          <el-table-column prop="userAccount" label="操作用户" width="120" />
          <el-table-column prop="operationName" label="操作名称" min-width="150" />
          <el-table-column prop="integrityStatus" label="完整性状态" width="120">
            <template #default="scope">
              <el-tag type="danger" size="small">
                {{ scope.row.integrityStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card
        shadow="hover"
        class="tampered-card success"
        v-else-if="tamperedLogs.length === 0 && !verifying && integrityReport"
      >
        <div class="all-verified">
          <span class="verified-icon">&#10003;</span>
          <h3>所有日志记录完整性验证通过</h3>
          <p>当前所有审计日志记录均完整且未被篡改</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.audit-log-integrity-page {
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

.integrity-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.report-card,
.action-card,
.tampered-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header.warning {
  color: #e6a23c;
}

.report-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 120px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.verified {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.stat-card.tampered {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.stat-card.pending {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.stat-card.rate {
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-card.verified .stat-value {
  color: #67c23a;
}

.stat-card.tampered .stat-value {
  color: #f56c6c;
}

.stat-card.pending .stat-value {
  color: #e6a23c;
}

.stat-card.rate .stat-value {
  color: #409eff;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}

.report-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.last-verify {
  font-size: 13px;
  color: #909399;
}

.verify-all-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.action-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.action-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

.action-info code {
  background-color: #f5f7fa;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #e6a23c;
}

.tampered-card.success {
  text-align: center;
}

.all-verified {
  padding: 40px 20px;
}

.verified-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: #f0f9eb;
  color: #67c23a;
  border-radius: 50%;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.all-verified h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #67c23a;
}

.all-verified p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}
</style>