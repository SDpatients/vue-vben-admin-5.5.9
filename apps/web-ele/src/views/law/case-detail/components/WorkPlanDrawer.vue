<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDrawer,
  ElEmpty,
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

import {
  createWorkPlanApi,
  deleteWorkPlanApi,
  getWorkPlanDetailApi,
  getWorkPlanListByCaseIdApi,
} from '#/api/core/work-plan';

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
  responsibleUserName?: string;
  executionStatus: string;
  caseId: number;
}

const props = defineProps<{
  caseId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const drawerVisible = ref(false);
const workPlanList = ref<WorkPlanInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const currentWorkPlan = ref<null | WorkPlanInfo>(null);

const addDialogVisible = ref(false);
const addFormLoading = ref(false);
const addFormRef = ref();

const addFormData = reactive({
  caseId: 0,
  planType: '',
  planContent: '',
  startDate: '',
  endDate: '',
  responsibleUserId: 1,
  responsibleUserName: '',
});

const planTypeOptions = [
  { label: '案件审理计划', value: '案件审理计划' },
  { label: '财产处置计划', value: '财产处置计划' },
  { label: '债权人会议计划', value: '债权人会议计划' },
  { label: '其他计划', value: '其他计划' },
];

const addFormRules = {
  planType: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
  planContent: [{ required: true, message: '请输入计划内容', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
};

const openDrawer = async () => {
  drawerVisible.value = true;
  await fetchWorkPlanList();
};

const closeDrawer = () => {
  drawerVisible.value = false;
  workPlanList.value = [];
  emit('close');
};

const fetchWorkPlanList = async () => {
  loading.value = true;
  try {
    const response = await getWorkPlanListByCaseIdApi(
      Number(props.caseId),
      pagination.value.page,
      pagination.value.pageSize,
    );

    if (response.code === 200) {
      workPlanList.value = response.data.list || [];
      pagination.value.itemCount = response.data.total || 0;
      pagination.value.pages = Math.ceil(
        (response.data.total || 0) / pagination.value.pageSize,
      );
    } else {
      ElMessage.error(`API返回错误: ${response.message || '未知错误'}`);
      workPlanList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch (error) {
    console.error('获取工作计划列表失败:', error);
    ElMessage.error('获取工作计划列表失败');
    workPlanList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchWorkPlanList();
};

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchWorkPlanList();
};

const handleRefresh = () => {
  pagination.value.page = 1;
  fetchWorkPlanList();
};

const formatDate = (dateString: null | string | undefined) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('zh-CN');
  } catch {
    return '-';
  }
};

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

const handleAddWorkPlan = () => {
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
  addFormData.caseId = Number(props.caseId);
  addDialogVisible.value = true;
};

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

const resetAddForm = () => {
  addFormData.caseId = 0;
  addFormData.planType = '';
  addFormData.planContent = '';
  addFormData.startDate = '';
  addFormData.endDate = '';
  addFormData.responsibleUserId = 1;
  addFormData.responsibleUserName = '';
  addFormRef.value?.clearValidate();
};

const handleCancelAdd = () => {
  addDialogVisible.value = false;
  resetAddForm();
};

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

defineExpose({
  openDrawer,
});
</script>

<template>
  <ElDrawer
    v-model="drawerVisible"
    title="工作计划"
    direction="rtl"
    size="80%"
    @close="closeDrawer"
  >
    <div class="work-plan-container">
      <ElCard shadow="never" class="content-card">
        <template #header>
          <div class="content-header">
            <div class="header-left">
              <Icon icon="lucide:calendar" class="mr-2" />
              <span class="title">工作计划管理</span>
            </div>
            <div class="header-right">
              <ElButton type="primary" @click="handleAddWorkPlan">
                <Icon icon="lucide:plus" class="mr-1" />
                新增工作计划
              </ElButton>
              <ElButton type="primary" @click="handleRefresh" :loading="loading">
                <Icon icon="lucide:refresh-cw" class="mr-1" />
                刷新
              </ElButton>
            </div>
          </div>
        </template>

        <div v-if="loading" class="loading-state">
          <ElEmpty description="加载中..." />
        </div>

        <div v-else-if="workPlanList.length === 0" class="empty-state">
          <ElEmpty description="暂无工作计划" />
        </div>

        <div v-else class="table-container">
          <ElTable
            :data="workPlanList"
            :border="true"
            :stripe="true"
            style="width: 100%"
            @row-click="handleViewDetail"
            class="data-table"
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
            <ElTableColumn label="负责人" width="120" align="center">
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
  </ElDrawer>
</template>

<style scoped>
.work-plan-container {
  height: 100%;
  overflow: hidden;
}

.content-card {
  height: 100%;
}

.content-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow: auto;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.title {
  font-size: 16px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.empty-state,
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.table-container {
  height: 100%;
  overflow-x: auto;
}

.data-table {
  cursor: pointer;
}
</style>
