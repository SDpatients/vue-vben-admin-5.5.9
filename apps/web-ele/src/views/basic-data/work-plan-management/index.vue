<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getAllWorkPlanApi } from '#/api/core/case-process';

// 定义新的工作计划类型
interface WorkPlanInfo {
  id: number;
  status: string;
  isDeleted: boolean;
  createTime: string;
  updateTime: string;
  createUserId: number | null;
  updateUserId: number | null;
  planNumber: string;
  planType: string;
  planContent: string;
  startDate: string;
  endDate: string;
  responsibleUserId: number;
  executionStatus: string;
  caseId: number;
}

// 响应式数据
const workPlanList = ref<WorkPlanInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

const accessStore = useAccessStore();

// 获取工作计划列表
const fetchWorkPlanList = async () => {
  loading.value = true;
  try {
    const response = await getAllWorkPlanApi(
      undefined, // caseId 可选
      pagination.value.page,
      pagination.value.pageSize,
      undefined, // planType 可选
      undefined, // executionStatus 可选
      undefined, // status 可选
    );

    if (response.code === 200) {
      workPlanList.value = response.data.list || [];
      pagination.value.itemCount = response.data.total || 0;
      pagination.value.pages = Math.ceil((response.data.total || 0) / pagination.value.pageSize);
      ElMessage.success(`成功加载 ${workPlanList.value.length} 条工作计划记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.message || '未知错误'}`);
      workPlanList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch (error) {
    console.error('获取工作计划列表失败:', error);
    ElMessage.error('获取工作计划列表失败，请检查网络连接或API服务');
    workPlanList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchWorkPlanList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchWorkPlanList();
};

// 刷新工作计划列表
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchWorkPlanList();
};

// 页面加载时获取数据
onMounted(() => {
  fetchWorkPlanList();
});

// 格式化日期显示
const formatDate = (dateString: null | string | undefined) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('zh-CN');
  } catch {
    return '-';
  }
};

// 根据执行状态值获取状态文本
const getExecutionStatusText = (status: string | undefined) => {
  if (!status) return '-';
  switch (status) {
    case 'NOT_STARTED': {
      return '未开始';
    }
    case 'IN_PROGRESS': {
      return '进行中';
    }
    case 'COMPLETED': {
      return '已完成';
    }
    default: {
      return status;
    }
  }
};

// 获取执行状态标签类型
const getExecutionStatusType = (status: string | undefined) => {
  if (!status) return 'info';
  switch (status) {
    case 'NOT_STARTED': {
      return 'warning';
    }
    case 'IN_PROGRESS': {
      return 'primary';
    }
    case 'COMPLETED': {
      return 'success';
    }
    default: {
      return 'info';
    }
  }
};

// 根据状态值获取状态文本
const getStatusText = (status: string | undefined) => {
  if (!status) return '-';
  switch (status) {
    case 'ACTIVE': {
      return '激活';
    }
    case 'INACTIVE': {
      return ' inactive';
    }
    default: {
      return status;
    }
  }
};
</script>

<template>
  <div class="p-6">
    <ElCard header="工作计划管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">工作计划管理</span>
          <div class="flex items-center space-x-2">
            <ElButton type="primary" @click="handleRefresh" :loading="loading">
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <ElTable
        v-loading="loading"
        :data="workPlanList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn prop="planType" label="计划类型" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.planType">{{ row.planType }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="planContent"
          label="计划内容"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.planContent">{{ row.planContent }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="startDate" label="开始日期" width="150" align="center">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="endDate" label="结束日期" width="150" align="center">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="responsibleUserId" label="负责人ID" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.responsibleUserId">{{ row.responsibleUserId }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="executionStatus" label="执行状态" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="getExecutionStatusType(row.executionStatus)">
              {{ getExecutionStatusText(row.executionStatus) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.status">{{ getStatusText(row.status) }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="planNumber" label="计划编号" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.planNumber">{{ row.planNumber }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="createTime"
          label="创建时间"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="updateTime"
          label="修改时间"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.itemCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>
  </div>
</template>
