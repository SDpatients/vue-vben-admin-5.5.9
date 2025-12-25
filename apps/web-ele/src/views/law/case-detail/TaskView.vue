<script setup lang="ts">
import type { CaseProcessApi } from '#/api/core/case-process';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElMessage,
  ElTag,
} from 'element-plus';

import { getCaseDetailApi, getCaseFilesApi } from '#/api/core/case';
import {
  getBusinessManagementApi,
  getEmergencyApi,
  getInternalAffairsApi,
  getLegalProcedureApi,
  getManagementApi,
  getPersonnelEmpApi,
  getPropertyPlanApi,
  getPropertyReceiptApi,
  getSealManagementApi,
  getWorkPlanApi,
  getWorkTeamApi,
} from '#/api/core/case-process';

import { taskConfigs } from '../config/task-config';
import {
  extractDataList,
  formatFileSize,
  getStatusType,
} from '../utils/task-utils';

const route = useRoute();
const router = useRouter();

const caseId = ref(
  (route.params.caseId as string) || (route.params.id as string),
);
const taskId = ref(
  (route.params.taskId as string) || (route.params.taskType as string),
);

const currentTask = computed(
  () => taskConfigs[taskId.value as keyof typeof taskConfigs],
);

const formDataList = ref<Array<Record<string, any>>>([]);
const currentIndex = ref(0);
const loading = ref(false);
const caseDetail = ref<any>(null);
const taskStatus = ref<CaseProcessApi.TaskStatus>('未确认');
const fileList = ref<Array<any>>([]);

const formData = computed(() => formDataList.value[currentIndex.value] || {});

const pageTitle = computed(() => {
  if (
    taskId.value === 'workTeam' &&
    caseDetail.value &&
    caseDetail.value.案号
  ) {
    return `${caseDetail.value.案号} 查看 ${currentTask.value.name}`;
  }
  return `查看 ${currentTask.value.name}`;
});

const loadTaskData = async () => {
  loading.value = true;
  try {
    const apiMap: Record<string, () => Promise<any>> = {
      businessManagement: () => getBusinessManagementApi(caseId.value),
      emergency: () => getEmergencyApi(caseId.value),
      internalAffairs: () => getInternalAffairsApi(caseId.value),
      legalProcedure: () => getLegalProcedureApi(caseId.value),
      management: () => getManagementApi(caseId.value),
      personnelEmp: () => getPersonnelEmpApi(caseId.value),
      propertyPlan: () => getPropertyPlanApi(caseId.value),
      propertyReceipt: () => getPropertyReceiptApi(caseId.value),
      sealManagement: () => getSealManagementApi(caseId.value),
      workPlan: () => getWorkPlanApi(caseId.value),
      workTeam: () => getWorkTeamApi(caseId.value),
    };

    const apiFunction = apiMap[taskId.value];
    if (!apiFunction) {
      throw new Error('未知的任务类型');
    }

    const apiResponse = await apiFunction();

    if (apiResponse.status === '1') {
      const dataList = extractDataList(apiResponse);
      formDataList.value = dataList.map((item) => ({ ...item }));
      taskStatus.value =
        (dataList[0]?.DQZT as CaseProcessApi.TaskStatus) || '未确认';

      loadFileList();
    } else {
      formDataList.value = [{}];
      currentIndex.value = 0;
      taskStatus.value = '未确认';

      ElMessage.warning('获取任务数据失败');
    }
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');

    formDataList.value = [{}];
    currentIndex.value = 0;
    taskStatus.value = '未确认';
  } finally {
    loading.value = false;
  }
};

const prevTableData = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const nextTableData = () => {
  if (currentIndex.value < formDataList.value.length - 1) {
    currentIndex.value++;
  }
};

const goBack = () => {
  router.back();
};

const loadFileList = async () => {
  try {
    const SEP_ID =
      (formData.value || {}).SEP_ID ||
      (formData.value || {}).sep_id ||
      caseId.value;
    const response = await getCaseFilesApi(SEP_ID, 1, 100);
    if (response.status === '1' && response.data) {
      fileList.value = response.data.records || response.data || [];
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
  }
};

const downloadFile = (file: any) => {
  const url = file.url || file.filePath;
  if (url) {
    window.open(url, '_blank');
  }
};

onMounted(async () => {
  if (!currentTask.value) {
    ElMessage.error('无效的任务类型');
    router.back();
    return;
  }

  try {
    const caseResponse = await getCaseDetailApi(caseId.value);
    if (caseResponse.status === '1') {
      caseDetail.value = caseResponse.data;
    }
  } catch (error) {
    console.error('获取案件详情失败:', error);
  }

  loadTaskData();
});
</script>

<template>
  <div class="task-view-container">
    <div class="page-header">
      <ElButton type="primary" link @click="goBack">
        <Icon icon="lucide:arrow-left" class="mr-2" />
        返回案件详情
      </ElButton>
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="status-display">
        <ElTag :type="getStatusType(taskStatus)" size="large">
          {{ taskStatus }}
        </ElTag>
      </div>
    </div>

    <ElCard class="task-view-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:eye" class="mr-2 text-blue-500" />
          <span class="text-lg font-semibold">
            {{ pageTitle }} - 只读模式
          </span>
        </div>
      </template>

      <div v-if="currentTask" class="task-view">
        <div v-if="formDataList.length > 1" class="table-switch-buttons">
          <ElButton
            type="primary"
            :disabled="currentIndex === 0"
            @click="prevTableData"
            size="small"
          >
            <Icon icon="lucide:chevron-left" />
            上一个
          </ElButton>
          <span class="table-index-info">
            第 {{ currentIndex + 1 }} / {{ formDataList.length }} 个表数据
          </span>
          <ElButton
            type="primary"
            :disabled="currentIndex === formDataList.length - 1"
            @click="nextTableData"
            size="small"
          >
            下一个
            <Icon icon="lucide:chevron-right" />
          </ElButton>
        </div>

        <div class="data-view-section">
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem
              v-for="field in currentTask.fields"
              :key="field.key"
              :label="field.label"
              :span="field.type === 'textarea' ? 2 : 1"
            >
              <template v-if="formData[field.key]">
                {{ formData[field.key] }}
              </template>
              <span v-else class="empty-value">-</span>
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="file-list-section">
          <div class="section-title">
            <Icon icon="lucide:paperclip" class="mr-2" />
            <span>相关文件</span>
          </div>
          <div v-if="fileList.length > 0" class="file-list">
            <div
              v-for="file in fileList"
              :key="file.id || file.uid"
              class="file-item"
            >
              <Icon icon="lucide:file" class="file-icon" />
              <div class="file-info">
                <div class="file-name">{{ file.name || file.fileName }}</div>
                <div class="file-meta">
                  <span v-if="file.uploadTime || file.createTime">
                    {{ file.uploadTime || file.createTime }}
                  </span>
                  <span v-if="file.fileSize" class="file-size">
                    {{ formatFileSize(file.fileSize) }}
                  </span>
                </div>
              </div>
              <ElButton
                v-if="file.url || file.filePath"
                type="primary"
                size="small"
                link
                @click="downloadFile(file)"
              >
                <Icon icon="lucide:download" class="mr-1" />
                下载
              </ElButton>
            </div>
          </div>
          <ElEmpty v-else description="暂无文件" />
        </div>
      </div>

      <div v-else class="error-container">
        <div class="error-message">
          <Icon icon="lucide:alert-circle" class="mr-2 text-red-500" />
          <span>无效的任务类型</span>
        </div>
      </div>
    </ElCard>

    <ElCard class="task-info-card">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:info" class="mr-2 text-green-500" />
          <span class="text-lg font-semibold">任务说明</span>
        </div>
      </template>

      <div class="task-info-content">
        <p class="task-description">
          当前任务：<strong>{{ currentTask?.name }}</strong>
        </p>
        <p class="task-status-info">
          当前状态：<ElTag :type="getStatusType(taskStatus)">
            {{ taskStatus }}
          </ElTag>
        </p>
        <p class="task-instruction">• 当前页面为只读模式，无法进行编辑操作</p>
        <p class="task-instruction">
          • 如需编辑任务数据，请返回案件详情页面点击"编辑"按钮
        </p>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.task-view-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.status-display {
  margin-left: auto;
}

.task-view-card,
.task-info-card {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.task-view {
  padding: 20px;
}

.table-switch-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  justify-content: center;
}

.table-index-info {
  font-weight: 600;
  color: #374151;
  min-width: 150px;
  text-align: center;
}

.data-view-section {
  padding: 20px 0;
}

.empty-value {
  color: #9ca3af;
  font-style: italic;
}

.file-list-section {
  padding: 20px 0;
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.file-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.file-icon {
  font-size: 20px;
  color: #6b7280;
  margin-right: 12px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.file-size {
  color: #9ca3af;
}

.error-container {
  padding: 40px 20px;
  text-align: center;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #dc2626;
}

.task-info-content {
  padding: 16px;
}

.task-description,
.task-status-info,
.task-instruction {
  margin-bottom: 12px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.task-instruction {
  color: #6b7280;
}

@media (max-width: 768px) {
  .task-view-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .status-display {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }
}
</style>
