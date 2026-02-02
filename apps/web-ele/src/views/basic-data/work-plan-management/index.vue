<script lang="ts" setup>
import type { ExportColumnConfig } from '#/utils/export-excel';

import { onMounted, reactive, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCaseSimpleListApi } from '#/api/core/case';
import {
  createWorkPlanApi,
  deleteWorkPlanApi,
  getWorkPlanDetailApi,
} from '#/api/core/work-plan';
import { getWorkPlanListByTimeApi } from '#/api/core/work-plan';
import { exportToExcel } from '#/utils/export-excel';

// 定义新的工作计划类型
interface WorkPlanInfo {
  id: number;
  status: string;
  isDeleted: boolean;
  createTime: string;
  updateTime: string;
  createUserId: null | number;
  updateUserId: null | number;
  planNumber: string;
  planType: string;
  planContent: string;
  startDate: string;
  endDate: string;
  responsibleUserId: number;
  responsibleUserName: string;
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

// 详情弹窗相关
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const currentWorkPlan = ref<null | WorkPlanInfo>(null);

// 新增工作计划弹窗相关
const addDialogVisible = ref(false);
const addFormLoading = ref(false);
const addFormRef = ref();

// 案件列表
const caseList = ref<any[]>([]);
const caseLoading = ref(false);

// 新增工作计划表单数据
const addFormData = reactive({
  caseId: 0,
  caseNumber: '',
  planType: '',
  planContent: '',
  startDate: '',
  endDate: '',
  responsibleUserId: 1,
  responsibleUserName: '',
});

// 计划类型选项
const planTypeOptions = [
  { label: '案件审理计划', value: '案件审理计划' },
  { label: '财产处置计划', value: '财产处置计划' },
  { label: '债权人会议计划', value: '债权人会议计划' },
  { label: '其他计划', value: '其他计划' },
];

// 执行状态选项
const executionStatusOptions = [
  { label: '未开始', value: 'NOT_STARTED' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
];

// 表单验证规则
const addFormRules = {
  caseNumber: [{ required: true, message: '请选择案件', trigger: 'change' }],
  planType: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
  planContent: [{ required: true, message: '请输入计划内容', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
};

// 获取案件列表
const getCaseList = async (query = '') => {
  caseLoading.value = true;
  try {
    const response = await getCaseSimpleListApi({
      page: 1,
      size: 10000,
      caseNumber: query,
    });

    caseList.value =
      response.code === 200 && response.data?.list ? response.data.list : [];
  } catch (error) {
    console.error('获取案件列表失败:', error);
    caseList.value = [];
  } finally {
    caseLoading.value = false;
  }
};

// 处理案件选择
const handleCaseSelect = (value: string) => {
  addFormData.caseNumber = value;
  const selectedCase = caseList.value.find((item) => item.caseNumber === value);
  if (selectedCase) {
    addFormData.caseId = selectedCase.id;
  }
};

// 打开详情弹窗
const handleViewDetail = async (row: WorkPlanInfo) => {
  detailDialogVisible.value = true;
  detailLoading.value = true;
  try {
    const response = await getWorkPlanDetailApi(row.id);
    if (response.code === 200) {
      currentWorkPlan.value = response.data;
    } else {
      ElMessage.error('获取工作计划详情失败');
    }
  } catch (error) {
    console.error('获取工作计划详情失败:', error);
    ElMessage.error('获取工作计划详情失败');
  } finally {
    detailLoading.value = false;
  }
};

// 打开新增弹窗
const handleAddWorkPlan = () => {
  // 从本地存储获取用户信息
  const chatUserInfoStr = localStorage.getItem('chat_user_info');
  if (chatUserInfoStr) {
    try {
      const chatUserInfo = JSON.parse(chatUserInfoStr);
      addFormData.responsibleUserName = chatUserInfo.realName || '';
      addFormData.responsibleUserId = chatUserInfo.userId || 1;
    } catch (error) {
      console.error('解析本地存储用户信息失败:', error);
    }
  }
  addDialogVisible.value = true;
  getCaseList();
};

// 提交新增工作计划
const handleSubmitAdd = async () => {
  if (!addFormRef.value) return;
  await addFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    addFormLoading.value = true;
    try {
      const response = await createWorkPlanApi({
        caseId: addFormData.caseId,
        planType: addFormData.planType,
        planContent: addFormData.planContent,
        startDate: addFormData.startDate,
        endDate: addFormData.endDate,
        responsibleUserId: addFormData.responsibleUserId,
      });
      if (response.code === 200) {
        ElMessage.success('新增工作计划成功');
        addDialogVisible.value = false;
        resetAddForm();
        fetchWorkPlanList();
      } else {
        ElMessage.error(response.message || '新增工作计划失败');
      }
    } catch (error) {
      console.error('新增工作计划失败:', error);
      ElMessage.error('新增工作计划失败');
    } finally {
      addFormLoading.value = false;
    }
  });
};

// 重置新增表单
const resetAddForm = () => {
  addFormData.caseId = 0;
  addFormData.caseNumber = '';
  addFormData.planType = '';
  addFormData.planContent = '';
  addFormData.startDate = '';
  addFormData.endDate = '';
  addFormData.responsibleUserId = 1;
  addFormData.responsibleUserName = '';
  addFormRef.value?.clearValidate();
};

// 取消新增
const handleCancelAdd = () => {
  addDialogVisible.value = false;
  resetAddForm();
};

// 删除工作计划
const handleDeleteWorkPlan = async (row: WorkPlanInfo) => {
  try {
    await ElMessageBox.confirm(`确定要删除该工作计划吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await deleteWorkPlanApi(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      fetchWorkPlanList();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除工作计划失败:', error);
      ElMessage.error('删除工作计划失败');
    }
  }
};

// 获取工作计划列表
const fetchWorkPlanList = async () => {
  loading.value = true;
  try {
    const response = await getWorkPlanListByTimeApi(
      undefined, // caseId
      undefined, // planType
      undefined, // executionStatus
      undefined, // status
      pagination.value.page,
      pagination.value.pageSize,
    );

    if (response.code === 200) {
      workPlanList.value = response.data.list || [];
      pagination.value.itemCount = response.data.total || 0;
      pagination.value.pages = Math.ceil(
        (response.data.total || 0) / pagination.value.pageSize,
      );
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
    case 'COMPLETED': {
      return '已完成';
    }
    case 'IN_PROGRESS': {
      return '进行中';
    }
    case 'NOT_STARTED': {
      return '未开始';
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
    case 'COMPLETED': {
      return 'success';
    }
    case 'IN_PROGRESS': {
      return 'primary';
    }
    case 'NOT_STARTED': {
      return 'warning';
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

// 导出工作计划数据为Excel
const exportWorkPlanData = () => {
  if (workPlanList.value.length === 0) {
    ElMessage.warning('当前没有数据可导出');
    return;
  }

  const exportColumns: ExportColumnConfig[] = [
    { field: 'planType', title: '计划类型', width: 12 },
    { field: 'planContent', title: '计划内容', width: 20 },
    {
      field: 'startDate',
      title: '开始日期',
      width: 12,
      formatter: (value) => formatDate(value),
    },
    {
      field: 'endDate',
      title: '结束日期',
      width: 12,
      formatter: (value) => formatDate(value),
    },
    { field: 'responsibleUserName', title: '负责人', width: 12 },
    { field: 'responsibleUserId', title: '负责人ID', width: 10 },
    {
      field: 'executionStatus',
      title: '执行状态',
      width: 10,
      formatter: (value) => getExecutionStatusText(value),
    },
    {
      field: 'status',
      title: '状态',
      width: 8,
      formatter: (value) => getStatusText(value),
    },
    { field: 'planNumber', title: '计划编号', width: 12 },
    {
      field: 'createTime',
      title: '创建时间',
      width: 15,
      formatter: (value) => formatDate(value),
    },
    {
      field: 'updateTime',
      title: '修改时间',
      width: 15,
      formatter: (value) => formatDate(value),
    },
  ];

  try {
    exportToExcel({
      data: workPlanList.value,
      fileName: '工作计划管理数据',
      sheetName: '工作计划',
      columns: exportColumns,
    });
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('数据导出失败，请重试');
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
            <ElButton type="primary" @click="handleAddWorkPlan">
              <i class="i-lucide-plus mr-1"></i>
              新增工作计划
            </ElButton>
            <ElButton type="success" @click="exportWorkPlanData">
              <i class="i-lucide-download mr-1"></i>
              导出数据
            </ElButton>
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
        @row-click="handleViewDetail"
        style="cursor: pointer"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="planType"
          label="计划类型"
          width="120"
          align="center"
        >
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
        <ElTableColumn
          prop="startDate"
          label="开始日期"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="endDate"
          label="结束日期"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="负责人"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.responsibleUserName">{{
              row.responsibleUserName
            }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="executionStatus"
          label="执行状态"
          width="120"
          align="center"
        >
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
        <ElTableColumn
          prop="planNumber"
          label="计划编号"
          width="120"
          align="center"
        >
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
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <ElButton
                type="primary"
                size="small"
                @click.stop="handleViewDetail(row)"
              >
                查看详情
              </ElButton>
              <ElButton
                type="danger"
                size="small"
                @click.stop="handleDeleteWorkPlan(row)"
              >
                删除
              </ElButton>
            </div>
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

    <!-- 详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="工作计划详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading">
        <ElDescriptions v-if="currentWorkPlan" :column="1" border>
          <ElDescriptionsItem label="计划ID">
            {{ currentWorkPlan.id }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="案件ID">
            {{ currentWorkPlan.caseId }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="计划类型">
            {{ currentWorkPlan.planType }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="计划内容">
            {{ currentWorkPlan.planContent }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="开始日期">
            {{ formatDate(currentWorkPlan.startDate) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="结束日期">
            {{ formatDate(currentWorkPlan.endDate) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="负责人">
            {{ currentWorkPlan.responsibleUserName || currentWorkPlan.responsibleUserId || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="执行状态">
            <ElTag
              :type="getExecutionStatusType(currentWorkPlan.executionStatus)"
            >
              {{ getExecutionStatusText(currentWorkPlan.executionStatus) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag
              :type="currentWorkPlan.status === 'ACTIVE' ? 'success' : 'info'"
            >
              {{ getStatusText(currentWorkPlan.status) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">
            {{ formatDate(currentWorkPlan.createTime) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="修改时间">
            {{ formatDate(currentWorkPlan.updateTime) }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
      <template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 新增工作计划弹窗 -->
    <ElDialog
      v-model="addDialogVisible"
      title="新增工作计划"
      width="600px"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="addFormRef"
        :model="addFormData"
        :rules="addFormRules"
        label-width="120px"
      >
        <ElFormItem label="案件" prop="caseNumber">
          <ElSelect
            v-model="addFormData.caseNumber"
            placeholder="请选择或搜索案号"
            filterable
            remote
            reserve-keyword
            :remote-method="getCaseList"
            :loading="caseLoading"
            @change="handleCaseSelect"
            style="width: 100%"
          >
            <ElOption
              v-for="item in caseList"
              :key="item.id"
              :label="item.caseNumber"
              :value="item.caseNumber"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="计划类型" prop="planType">
          <ElSelect
            v-model="addFormData.planType"
            placeholder="请选择计划类型"
            style="width: 100%"
          >
            <ElOption
              v-for="item in planTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="计划内容" prop="planContent">
          <ElInput
            v-model="addFormData.planContent"
            type="textarea"
            :rows="4"
            placeholder="请输入计划内容"
          />
        </ElFormItem>
        <ElFormItem label="开始日期" prop="startDate">
          <ElDatePicker
            v-model="addFormData.startDate"
            type="date"
            placeholder="请选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="结束日期" prop="endDate">
          <ElDatePicker
            v-model="addFormData.endDate"
            type="date"
            placeholder="请选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="负责人">
          <ElInput
            v-model="addFormData.responsibleUserName"
            placeholder="请输入负责人"
            readonly
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="handleCancelAdd">取消</ElButton>
        <ElButton
          type="primary"
          :loading="addFormLoading"
          @click="handleSubmitAdd"
        >
          确定
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>
