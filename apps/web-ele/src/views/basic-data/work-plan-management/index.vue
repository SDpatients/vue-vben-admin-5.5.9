<script lang="ts" setup>
import type { WorkPlanApi } from '#/api/core/work-plan';

import { onMounted, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElMessage,
  ElPagination,
  ElPopover,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getWorkPlanListApi } from '#/api/core/work-plan';

// 响应式数据
const workPlanList = ref<WorkPlanApi.WorkPlanInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '行号',
  '计划ID',
  '计划编号',
  '关联案件编号',
  '计划类型',
  '计划内容',
  '开始日期',
  '结束日期',
  '负责人',
  '综合状态',
  '案号',
  '当前状态',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '关联案件编号',
  '开始日期',
  '结束日期',
  '综合状态',
  '计划内容',
  '计划类型',
  '计划编号',
  '负责人',
]);

// 检查列是否可见（用于表格列的 v-if）
const isColumnVisible = (columnName: string) => {
  return columnVisible.value.includes(columnName);
};

// 初始化列显示状态
const initColumnVisibility = () => {
  columnVisible.value = availableColumns.filter((column) =>
    defaultColumns.has(column),
  );
};

const accessStore = useAccessStore();

// 获取工作计划列表
const fetchWorkPlanList = async () => {
  loading.value = true;
  try {
    const token = accessStore.accessToken || '3a4ba2bad1d89f5483940004de8bc922';
    const params: WorkPlanApi.WorkPlanQueryParams = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
    };

    const response = await getWorkPlanListApi(params);

    if (response.status === '1') {
      workPlanList.value = response.data.records;
      pagination.value.itemCount = response.data.count;
      pagination.value.pages = response.data.pages;
      ElMessage.success(`成功加载 ${workPlanList.value.length} 条工作计划记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.error}`);
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
  initColumnVisibility();
  fetchWorkPlanList();
});

// 重置列显示状态
const resetColumns = () => {
  initColumnVisibility();
  ElMessage.success('已重置为默认列显示');
};

// 显示所有列
const showAllColumns = () => {
  columnVisible.value = [...availableColumns];
  ElMessage.success('已显示所有列');
};

// 隐藏所有非核心列
const hideNonCoreColumns = () => {
  columnVisible.value = availableColumns.filter((column) =>
    defaultColumns.has(column),
  );
  ElMessage.success('已隐藏非核心列');
};

// 格式化日期显示
const formatDate = (dateString: null | string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 获取计划状态标签类型
const getStatusType = (status: null | string) => {
  if (!status) return 'info';

  switch (status) {
    case '已取消': {
      return 'danger';
    }
    case '已完成': {
      return 'success';
    }
    case '进行中': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

// 获取计划类型标签
const getPlanType = (type: null | string) => {
  if (!type) return '-';

  switch (type) {
    case '和解类计划': {
      return '和解类';
    }
    case '清算类计划': {
      return '清算类';
    }
    case '重整类计划': {
      return '重整类';
    }
    default: {
      return type;
    }
  }
};
</script>

<template>
  <div class="work-plan-management">
    <!-- 页面标题和操作栏 -->
    <ElCard class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">工作计划管理</h2>
          <ElSpace>
            <!-- 列显示控制 -->
            <ElPopover placement="bottom-end" width="200" trigger="click">
              <template #reference>
                <ElButton type="primary" plain>列显示控制</ElButton>
              </template>
              <div class="p-2">
                <div class="mb-2">
                  <ElCheckboxGroup v-model="columnVisible">
                    <div class="grid grid-cols-2 gap-2">
                      <ElCheckbox
                        v-for="column in availableColumns"
                        :key="column"
                        :label="column"
                      >
                        {{ column }}
                      </ElCheckbox>
                    </div>
                  </ElCheckboxGroup>
                </div>
                <div class="flex justify-between">
                  <ElButton size="small" @click="resetColumns">重置</ElButton>
                  <ElButton size="small" @click="showAllColumns">
                    显示全部
                  </ElButton>
                  <ElButton size="small" @click="hideNonCoreColumns">
                    隐藏非核心
                  </ElButton>
                </div>
              </div>
            </ElPopover>

            <!-- 刷新按钮 -->
            <ElButton type="primary" :loading="loading" @click="handleRefresh">
              刷新
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 工作计划列表表格 -->
      <div class="work-plan-table">
        <ElTable
          :data="workPlanList"
          v-loading="loading"
          :stripe="true"
          :border="true"
          :style="{ width: '100%' }"
        >
          <!-- 计划编号 -->
          <ElTableColumn
            v-if="isColumnVisible('计划编号')"
            prop="JHID"
            label="计划编号"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <span v-if="row.JHID">{{ row.JHID }}</span>
              <ElTag v-else type="info">未设置</ElTag>
            </template>
          </ElTableColumn>

          <!-- 关联案件编号 -->
          <ElTableColumn
            v-if="isColumnVisible('关联案件编号')"
            prop="GLAJBH"
            label="关联案件编号"
            width="150"
            align="center"
          />

          <!-- 计划类型 -->
          <ElTableColumn
            v-if="isColumnVisible('计划类型')"
            prop="JHLX"
            label="计划类型"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <ElTag v-if="row.JHLX" type="primary">
                {{ getPlanType(row.JHLX) }}
              </ElTag>
              <ElTag v-else type="info">未设置</ElTag>
            </template>
          </ElTableColumn>

          <!-- 计划内容 -->
          <ElTableColumn
            v-if="isColumnVisible('计划内容')"
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

          <!-- 开始日期 -->
          <ElTableColumn
            v-if="isColumnVisible('开始日期')"
            prop="KSRQ"
            label="开始日期"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDate(row.KSRQ) }}
            </template>
          </ElTableColumn>

          <!-- 结束日期 -->
          <ElTableColumn
            v-if="isColumnVisible('结束日期')"
            prop="JSRQ"
            label="结束日期"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDate(row.JSRQ) }}
            </template>
          </ElTableColumn>

          <!-- 负责人 -->
          <ElTableColumn
            v-if="isColumnVisible('负责人')"
            prop="FZR"
            label="负责人"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span v-if="row.FZR">{{ row.FZR }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>

          <!-- 综合状态 -->
          <ElTableColumn
            v-if="isColumnVisible('综合状态')"
            prop="ZHZT"
            label="综合状态"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <ElTag v-if="row.ZHZT" :type="getStatusType(row.ZHZT)">
                {{ row.ZHZT }}
              </ElTag>
              <ElTag v-else type="info">未设置</ElTag>
            </template>
          </ElTableColumn>

          <!-- 行号 -->
          <ElTableColumn
            v-if="isColumnVisible('行号')"
            prop="row"
            label="行号"
            width="80"
            align="center"
          />

          <!-- 计划ID -->
          <ElTableColumn
            v-if="isColumnVisible('计划ID')"
            prop="SEP_ID"
            label="计划ID"
            width="100"
            align="center"
          />

          <!-- 案号 -->
          <ElTableColumn
            v-if="isColumnVisible('案号')"
            prop="AH"
            label="案号"
            width="150"
            align="center"
          />

          <!-- 当前状态 -->
          <ElTableColumn
            v-if="isColumnVisible('当前状态')"
            prop="DQZT"
            label="当前状态"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span v-if="row.DQZT">{{ row.DQZT }}</span>
              <span v-else class="text-gray-400">-</span>
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
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.work-plan-management {
  padding: 0;
}

.work-plan-table {
  margin-top: 0;
}
</style>
