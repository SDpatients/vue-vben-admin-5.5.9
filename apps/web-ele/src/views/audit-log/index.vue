<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import { getAuditLogListApi } from '#/api/core/audit-log';

const router = useRouter();

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const logs = ref<any[]>([]);

const searchForm = reactive({
  userId: undefined as number | undefined,
  module: undefined as string | undefined,
  operationType: undefined as string | undefined,
  status: undefined as string | undefined,
  startTime: '',
  endTime: '',
  keyword: '',
});

const moduleOptions = [
  { label: '案件管理', value: 'case' },
  { label: '债权管理', value: 'claim' },
  { label: '资金管理', value: 'fund' },
  { label: '用户管理', value: 'user' },
  { label: '系统配置', value: 'system' },
  { label: '费用报销', value: 'expense' },
  { label: '文件管理', value: 'file' },
  { label: '审批管理', value: 'approval' },
];

const operationTypeOptions = [
  { label: '创建', value: 'CREATE' },
  { label: '更新', value: 'UPDATE' },
  { label: '删除', value: 'DELETE' },
  { label: '查询', value: 'QUERY' },
  { label: '导出', value: 'EXPORT' },
  { label: '导入', value: 'IMPORT' },
  { label: '登录', value: 'LOGIN' },
  { label: '其他', value: 'OTHER' },
];

const statusOptions = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAIL' },
];

const fetchLogs = async () => {
  loading.value = true;
  try {
    const response = await getAuditLogListApi({
      page: currentPage.value,
      size: pageSize.value,
      userId: searchForm.userId,
      module: searchForm.module,
      operationType: searchForm.operationType,
      status: searchForm.status,
      startTime: searchForm.startTime || undefined,
      endTime: searchForm.endTime || undefined,
      keyword: searchForm.keyword || undefined,
    });
    logs.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取审计日志列表失败');
    console.error('获取审计日志列表失败:', error);
    logs.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchLogs();
};

const handleReset = () => {
  searchForm.userId = undefined;
  searchForm.module = undefined;
  searchForm.operationType = undefined;
  searchForm.status = undefined;
  searchForm.startTime = '';
  searchForm.endTime = '';
  searchForm.keyword = '';
  currentPage.value = 1;
  fetchLogs();
};

const handleViewDetail = (row: any) => {
  router.push(`/expense-system/audit-log/detail/${row.id}`);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchLogs();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchLogs();
};

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

const getOperationTypeTag = (type: string) => {
  const map: Record<string, string> = {
    CREATE: '',
    UPDATE: 'warning',
    DELETE: 'danger',
    QUERY: 'info',
    EXPORT: 'success',
    IMPORT: 'success',
    LOGIN: '',
    OTHER: 'info',
  };
  return map[type] || 'info';
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
  fetchLogs();
});
</script>

<template>
  <div class="audit-log-page">
    <div class="page-header">
      <h1>审计日志</h1>
    </div>

    <div class="audit-log-content">
      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="80px">
          <el-form-item label="用户ID">
            <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID"
              clearable
              style="width: 150px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="模块">
            <el-select
              v-model="searchForm.module"
              placeholder="请选择模块"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="item in moduleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select
              v-model="searchForm.operationType"
              placeholder="请选择操作类型"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="item in operationTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="searchForm.startTime"
              type="datetime"
              placeholder="开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="searchForm.endTime"
              type="datetime"
              placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索关键词"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="hover" class="list-card">
        <el-table v-loading="loading" :data="logs" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="userAccount" label="操作用户" width="120" />
          <el-table-column prop="moduleName" label="模块" width="100" />
          <el-table-column prop="operationType" label="操作类型" width="100">
            <template #default="scope">
              <el-tag
                :type="getOperationTypeTag(scope.row.operationType)"
                size="small"
              >
                {{ scope.row.operationName || scope.row.operationType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="businessName" label="业务对象" min-width="150" show-overflow-tooltip />
          <el-table-column prop="requestUrl" label="请求URL" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status).type" size="small">
                {{ getStatusTag(scope.row.status).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ipAddress" label="IP地址" width="140" />
          <el-table-column prop="integrityStatus" label="完整性" width="90">
            <template #default="scope">
              <el-tag
                :type="getIntegrityTag(scope.row.integrityStatus).type"
                size="small"
              >
                {{ getIntegrityTag(scope.row.integrityStatus).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作时间" width="170">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleViewDetail(scope.row)"
              >
                详情
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
.audit-log-page {
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

.audit-log-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>