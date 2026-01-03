<script lang="ts" setup>
import type { CaseProcessApi } from '#/api/core/case-process';

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

// 响应式数据
const workPlanList = ref<CaseProcessApi.WorkPlanInfo[]>([]);
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
    // 注意：getAllWorkPlanApi需要SEP_ID参数，这里暂时使用空字符串作为默认值
    // 实际应用中应该从路由或其他地方获取SEP_ID
    const SEP_ID = '';
    const response = await getAllWorkPlanApi(
      SEP_ID,
      pagination.value.page,
      pagination.value.pageSize,
    );

    if (response.status === '1') {
      workPlanList.value = response.data.records || [];
      pagination.value.itemCount = response.data.count || 0;
      pagination.value.pages = response.data.pages || 0;
      ElMessage.success(`成功加载 ${workPlanList.value.length} 条工作计划记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.error || '未知错误'}`);
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

// 根据状态值获取状态文本
const getStatusText = (status: number | string | undefined) => {
  const statusStr = String(status);
  switch (statusStr) {
    case '0': {
      return '待执行';
    }
    case '1': {
      return '已执行';
    }
    case '2': {
      return '完成';
    }
    default: {
      return '待执行';
    }
  }
};

// 获取计划状态标签类型
const getStatusType = (status: number | string | undefined) => {
  const statusStr = String(status);
  switch (statusStr) {
    case '0': {
      return 'warning';
    }
    case '1': {
      return 'success';
    }
    case '2': {
      return 'success';
    }
    default: {
      return 'info';
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
        <ElTableColumn prop="JHLX" label="计划类型" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.JHLX">{{ row.JHLX }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="JHNR"
          label="计划内容"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.JHNR">{{ row.JHNR }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="KSRQ" label="开始日期" width="150" align="center">
          <template #default="{ row }">
            {{ formatDate(row.KSRQ) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="JSRQ" label="结束日期" width="150" align="center">
          <template #default="{ row }">
            {{ formatDate(row.JSRQ) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="FZR" label="负责人" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.FZR">{{ row.FZR }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="ZT" label="执行状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.ZT)">
              {{ getStatusText(row.ZT) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="SEP_AUSER"
          label="创建者"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.SEP_AUSER">{{ row.SEP_AUSER }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="SEP_ADATE"
          label="创建时间"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.SEP_ADATE) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="SEP_EUSER"
          label="修改者"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.SEP_EUSER">{{ row.SEP_EUSER }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="SEP_EDATE"
          label="修改时间"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.SEP_EDATE) }}
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
