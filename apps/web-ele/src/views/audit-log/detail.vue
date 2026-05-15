<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import {
  getAuditLogDetailApi,
  verifyAuditLogIntegrityApi,
} from '#/api/core/audit-log';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const verifying = ref(false);
const detail = ref<any>(null);
const integrityResult = ref<boolean | null>(null);

const getStatusTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    SUCCESS: { type: 'success', text: '成功' },
    FAIL: { type: 'danger', text: '失败' },
  };
  return map[status] || { type: 'info', text: status };
};

const getIntegrityTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    VERIFIED: { type: 'success', text: '已验证' },
    TAMPERED: { type: 'danger', text: '被篡改' },
    PENDING: { type: 'warning', text: '待验证' },
  };
  return map[status] || { type: 'info', text: status || '未知' };
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

const formatJson = (jsonStr: string): string => {
  if (!jsonStr) return '-';
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
};

const fetchDetail = async (id: number) => {
  loading.value = true;
  try {
    const response = await getAuditLogDetailApi(id);
    detail.value = response.data;
  } catch (error) {
    ElMessage.error('获取审计日志详情失败');
    console.error('获取审计日志详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleVerifyIntegrity = async () => {
  if (!detail.value) return;
  verifying.value = true;
  try {
    const response = await verifyAuditLogIntegrityApi(detail.value.id);
    integrityResult.value = response.data;
    if (response.data) {
      ElMessage.success('该审计日志记录完整，未被篡改');
    } else {
      ElMessage.error('警告：该审计日志记录可能已被篡改！');
    }
  } catch (error) {
    ElMessage.error('完整性验证失败');
    console.error('完整性验证失败:', error);
  } finally {
    verifying.value = false;
  }
};

const handleBack = () => {
  router.push('/expense-system/audit-log/list');
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchDetail(id);
  }
});
</script>

<template>
  <div class="audit-log-detail-page">
    <div class="page-header">
      <h1>审计日志详情</h1>
      <el-button @click="handleBack">返回列表</el-button>
    </div>

    <div class="audit-log-detail-content" v-loading="loading">
      <el-card shadow="hover" class="info-card" v-if="detail">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <div class="header-tags">
              <el-tag
                :type="getStatusTag(detail.status).type"
                effect="dark"
                size="large"
              >
                {{ getStatusTag(detail.status).text }}
              </el-tag>
              <el-tag
                :type="getIntegrityTag(detail.integrityStatus).type"
                effect="dark"
                size="large"
                style="margin-left: 8px"
              >
                完整性: {{ getIntegrityTag(detail.integrityStatus).text }}
              </el-tag>
            </div>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="日志ID">
            {{ detail.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户账号">
            {{ detail.userAccount }}
          </el-descriptions-item>
          <el-descriptions-item label="用户姓名">
            {{ detail.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="模块">
            {{ detail.moduleName }} ({{ detail.module }})
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            {{ detail.operationName || detail.operationType }}
          </el-descriptions-item>
          <el-descriptions-item label="业务类型">
            {{ detail.businessType || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="业务名称">
            {{ detail.businessName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="业务ID">
            {{ detail.businessId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="请求方法">
            <el-tag size="small">{{ detail.requestMethod }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="请求URL" :span="2">
            {{ detail.requestUrl }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ detail.ipAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="浏览器">
            {{ detail.browser || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作系统">
            {{ detail.os || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="链序号">
            {{ detail.chainSequence ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作时间" :span="2">
            {{ formatDateTime(detail.createTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="hover" class="request-card" v-if="detail && detail.requestParams">
        <template #header>
          <span>请求参数</span>
        </template>
        <pre class="json-block">{{ formatJson(detail.requestParams) }}</pre>
      </el-card>

      <el-card shadow="hover" class="data-card" v-if="detail">
        <template #header>
          <span>数据变更对比</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12" v-if="detail.dataBefore">
            <div class="data-section">
              <h4 class="data-section-title">变更前数据</h4>
              <pre class="json-block">{{ formatJson(detail.dataBefore) }}</pre>
            </div>
          </el-col>
          <el-col :span="12" v-if="detail.dataAfter">
            <div class="data-section">
              <h4 class="data-section-title">变更后数据</h4>
              <pre class="json-block">{{ formatJson(detail.dataAfter) }}</pre>
            </div>
          </el-col>
        </el-row>
        <el-empty v-if="!detail.dataBefore && !detail.dataAfter" description="无数据变更记录" />
      </el-card>

      <el-card shadow="hover" class="hash-card" v-if="detail">
        <template #header>
          <div class="card-header">
            <span>哈希链信息</span>
            <el-tag size="small" type="info">防篡改机制</el-tag>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="当前哈希值">
            <code>{{ detail.hashValue || '-' }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="前一条哈希值">
            <code>{{ detail.previousHash || '-' }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="链序列号">
            {{ detail.chainSequence ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="完整性状态">
            <el-tag
              :type="getIntegrityTag(detail.integrityStatus).type"
            >
              {{ getIntegrityTag(detail.integrityStatus).text }}
            </el-tag>
            <span v-if="integrityResult !== null" style="margin-left: 10px">
              最近验证结果：
              <el-tag :type="integrityResult ? 'success' : 'danger'" size="small">
                {{ integrityResult ? '完整 ✓' : '被篡改 ✗' }}
              </el-tag>
            </span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="verify-action">
          <el-button
            type="warning"
            :loading="verifying"
            @click="handleVerifyIntegrity"
          >
            验证本条日志完整性
          </el-button>
        </div>
      </el-card>

      <div class="action-buttons">
        <el-button @click="handleBack">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audit-log-detail-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.audit-log-detail-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.info-card,
.request-card,
.data-card,
.hash-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-tags {
  display: flex;
  align-items: center;
}

.json-block {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}

.data-section-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.verify-action {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>