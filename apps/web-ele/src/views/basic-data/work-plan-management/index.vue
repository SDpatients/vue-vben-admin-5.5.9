<script lang="ts" setup>
import type { WorkPlanApi } from '#/api/core/work-plan';

import { onMounted, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElPagination,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getWorkPlanListApi, updateWorkPlanApi } from '#/api/core/work-plan';

// 响应式数据
const workPlanList = ref<WorkPlanApi.WorkPlanInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 编辑工作计划相关
const editDialogVisible = ref(false);
const editFormRef = ref();
const editFormLoading = ref(false);
const editingRow = ref<WorkPlanApi.WorkPlanInfo | null>(null);

// 编辑表单数据
const editFormData = ref({
  WP_SEP_ID: 0,
  SEP_EUSER: '',
  SEP_EDATE: '',
  plan_type: '',
  plan_content: '',
  start_date: null as string | null,
  end_date: null as string | null,
  responsible_person: '',
  plan_status: '',
  case_number: null as string | null,
  case_name: null as string | null,
});

// 表单验证规则
const rules = {
  plan_type: [{ required: true, message: '请输入计划类型', trigger: 'blur' }],
  plan_content: [{ required: true, message: '请输入计划内容', trigger: 'blur' }],
  responsible_person: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  plan_status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
};

// 状态选项
const statusOptions = [
  { label: '待执行', value: '0' },
  { label: '已执行', value: '1' },
  { label: '完成', value: '2' },
];

// 获取当前登录用户名
const getCurrentUserName = () => {
  const chatUserInfoStr = localStorage.getItem('chat_user_info');
  if (chatUserInfoStr) {
    try {
      const chatUserInfo = JSON.parse(chatUserInfoStr);
      return chatUserInfo.user?.uName || chatUserInfo.uName || chatUserInfo.U_NAME || '';
    } catch (error) {
      console.error('解析chat_user_info失败:', error);
    }
  }
  return '';
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
  fetchWorkPlanList();
});

// 格式化日期显示
const formatDate = (dateString: null | string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 根据状态值获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case '0':
      return '待执行';
    case '1':
      return '已执行';
    case '2':
      return '完成';
    default:
      return '待执行';
  }
};

// 获取计划状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
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

// 打开编辑工作计划弹窗
const handleEditWorkPlan = (row: WorkPlanApi.WorkPlanInfo) => {
  editingRow.value = row;
  // 填充编辑表单数据
  editFormData.value = {
    WP_SEP_ID: row.WP_SEP_ID,
    SEP_EUSER: '',
    SEP_EDATE: '',
    plan_type: row.plan_type || '',
    plan_content: row.plan_content || '',
    start_date: row.start_date,
    end_date: row.end_date,
    responsible_person: row.responsible_person || '',
    plan_status: row.plan_status || '0',
    case_number: row.case_number,
    case_name: row.case_name,
  };
  // 显示编辑弹窗
  editDialogVisible.value = true;
};

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  editDialogVisible.value = false;
  editingRow.value = null;
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
};

// 提交编辑工作计划表单
const handleEditSubmit = async () => {
  if (!editFormRef.value) return;

  try {
    // 自动填写SEP_EUSER：从本地存储获取chat_user_info.user.uName
    editFormData.value.SEP_EUSER = getCurrentUserName();

    // 自动填写SEP_EDATE：使用ISO格式的日期时间字符串
    editFormData.value.SEP_EDATE = new Date().toISOString().slice(0, 19);

    await editFormRef.value.validate();
    editFormLoading.value = true;

    // 调用更新工作计划API
    const response = await updateWorkPlanApi(editFormData.value);

    if (response.status === '1') {
      ElMessage.success('工作计划更新成功');
      handleCloseEditDialog();
      // 刷新工作计划列表
      fetchWorkPlanList();
    } else {
      ElMessage.error(response.error || '工作计划更新失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      // 表单验证失败，已经有提示
      return;
    }
    ElMessage.error('工作计划更新失败，请稍后重试');
    console.error('更新工作计划失败:', error);
  } finally {
    editFormLoading.value = false;
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
        <ElTableColumn
          prop="plan_type"
          label="计划类型"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.plan_type">{{ row.plan_type }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="plan_content"
          label="计划内容"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.plan_content">{{ row.plan_content }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="start_date"
          label="开始日期"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.start_date) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="end_date"
          label="结束日期"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.end_date) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="responsible_person"
          label="负责人"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.responsible_person">{{ row.responsible_person }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="plan_status"
          label="计划状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.plan_status)">
              {{ getStatusText(row.plan_status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="case_number"
          label="案号"
          width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.case_number">{{ row.case_number }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="case_name"
          label="案件名称"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.case_name">{{ row.case_name }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              @click="handleEditWorkPlan(row)"
            >
              <i class="i-lucide-edit mr-1"></i>
              编辑
            </ElButton>
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

      <!-- 编辑工作计划模态框 -->
      <ElDialog
        v-model="editDialogVisible"
        title="编辑工作计划"
        width="800px"
        :before-close="handleCloseEditDialog"
        class="work-plan-dialog"
      >
        <ElForm
          ref="editFormRef"
          :model="editFormData"
          :rules="rules"
          label-width="120px"
          label-position="top"
          class="work-plan-form"
        >
          <ElFormItem label="计划类型" prop="plan_type">
            <ElInput
              v-model="editFormData.plan_type"
              placeholder="请输入计划类型"
              size="large"
            />
          </ElFormItem>
          <ElFormItem label="计划内容" prop="plan_content">
            <ElInput
              v-model="editFormData.plan_content"
              type="textarea"
              placeholder="请输入计划内容"
              rows="4"
              size="large"
            />
          </ElFormItem>
          <ElFormItem label="开始日期">
            <ElDatePicker
              v-model="editFormData.start_date"
              type="datetime"
              placeholder="请选择开始日期"
              style="width: 100%"
              size="large"
            />
          </ElFormItem>
          <ElFormItem label="结束日期">
            <ElDatePicker
              v-model="editFormData.end_date"
              type="datetime"
              placeholder="请选择结束日期"
              style="width: 100%"
              size="large"
            />
          </ElFormItem>
          <ElFormItem label="负责人" prop="responsible_person">
            <ElInput
              v-model="editFormData.responsible_person"
              placeholder="请输入负责人"
              size="large"
            />
          </ElFormItem>
          <ElFormItem label="状态" prop="plan_status">
            <ElSelect
              v-model="editFormData.plan_status"
              placeholder="请选择状态"
              style="width: 100%"
              size="large"
            >
              <ElOption
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseEditDialog">取消</ElButton>
            <ElButton
              type="primary"
              @click="handleEditSubmit"
              :loading="editFormLoading"
            >
              确定
            </ElButton>
          </span>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>


