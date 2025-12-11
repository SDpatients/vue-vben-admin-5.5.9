<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  ElAlert,
  ElButton,
  ElCard,
  ElMessage,
  ElPagination,
  ElSpace,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

import { operationTracker } from '#/api/operation-tracker';

// 操作记录数据
const operationRecords = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pages: 0,
});

// 获取操作类型对应的标签颜色
const getTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    新增: 'success',
    更新: 'warning',
    删除: 'danger',
    查询: 'info',
    处理: 'primary',
  };
  return typeMap[type] || 'info';
};

// 从后端API加载操作记录
const loadRecords = async (page: number = 1) => {
  loading.value = true;
  try {
    const result = await operationTracker.getRecordsFromBackend(
      page,
      pagination.value.pageSize,
    );

    // 转换后端数据格式为前端需要的格式
    operationRecords.value = result.records.map((record: any) => ({
      id: record.SEP_ID?.toString() || record.row?.toString(),
      operator: record.CZR,
      operationTime: record.CZSJ,
      operationContent: record.CZNR,
      operationModule: record.CZMK,
      operationType: getOperationTypeFromContent(record.CZNR),
    }));

    pagination.value.total = result.count;
    pagination.value.pages = result.pages;
    pagination.value.currentPage = page;

    ElMessage.success('操作记录加载成功');
  } catch (error) {
    console.error('加载操作记录失败:', error);
    ElMessage.error('加载操作记录失败');
  } finally {
    loading.value = false;
  }
};

// 从操作内容推断操作类型
const getOperationTypeFromContent = (
  content: string,
): '删除' | '处理' | '新增' | '更新' | '查询' => {
  if (content.includes('新增操作') || content.includes('POST')) return '新增';
  if (
    content.includes('更新操作') ||
    content.includes('PUT') ||
    content.includes('PATCH')
  )
    return '更新';
  if (content.includes('删除操作') || content.includes('DELETE')) return '删除';
  if (content.includes('查询操作') || content.includes('GET')) return '查询';
  return '处理';
};

// 刷新操作记录
const handleRefresh = async () => {
  await loadRecords(pagination.value.currentPage);
};

// 处理分页变化
const handlePageChange = (page: number) => {
  loadRecords(page);
};

// 组件挂载时初始化
onMounted(() => {
  // 加载初始数据
  loadRecords();
});
</script>

<template>
  <div class="operation-record">
    <ElCard class="box-card">
      <template #header>
        <div class="card-header">
          <span>操作记录</span>
          <ElSpace>
            <ElButton type="primary" @click="handleRefresh" :loading="loading">
              刷新
            </ElButton>
            <span v-if="pagination.total > 0" class="total-text">
              共 {{ pagination.total }} 条记录
            </span>
          </ElSpace>
        </div>
      </template>

      <ElAlert
        title="最近操作记录"
        type="info"
        :closable="false"
        show-icon
        class="mb-4"
      />

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <p>正在加载操作记录...</p>
      </div>

      <!-- 操作记录列表 -->
      <ElTimeline v-else>
        <ElTimelineItem
          v-for="record in operationRecords"
          :key="record.id"
          :timestamp="record.operationTime"
          placement="top"
        >
          <ElCard>
            <h4>{{ record.operationContent }}</h4>
            <p>
              <ElTag :type="getTagType(record.operationType)" size="small">
                {{ record.operationType }}
              </ElTag>
              <span class="ml-2">操作人：{{ record.operator }}</span>
              <span class="ml-2">模块：{{ record.operationModule }}</span>
            </p>
          </ElCard>
        </ElTimelineItem>
      </ElTimeline>

      <!-- 分页组件 -->
      <div v-if="!loading && pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="
            (size: number) => {
              pagination.pageSize = size;
              loadRecords(1);
            }
          "
        />
      </div>

      <div v-if="!loading && operationRecords.length === 0" class="empty-state">
        <p>暂无操作记录</p>
      </div>
    </ElCard>

    <!-- API跟踪配置信息 -->
    <ElCard class="box-card mt-4">
      <template #header>
        <div class="card-header">
          <span>API跟踪配置</span>
        </div>
      </template>

      <div class="api-info">
        <p>
          <strong>数据来源接口：</strong>
          http://192.168.0.108:8081/api/web/SelectAllAFollow
        </p>
        <p>
          <strong>参数：</strong>token=46f6aecb8e27d95780f18459be9c4807,
          page=页码, size=每页大小
        </p>
        <p><strong>功能：</strong>从真实数据库获取操作记录，支持分页查询</p>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
/* 自定义样式 */
:deep(.vben-card) {
  border-radius: 8px;
}

.el-timeline-item {
  padding-bottom: 16px;
}

.el-timeline-item:last-child {
  padding-bottom: 0;
}

.operation-record {
  padding: 0;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-text {
  color: #666;
  font-size: 14px;
}

.api-info {
  line-height: 1.8;
}

.api-info p {
  margin: 0;
  padding: 4px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
