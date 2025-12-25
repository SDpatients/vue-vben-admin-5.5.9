<script setup lang="ts">
import type { CaseProcessApi } from '#/api/core/case-process';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElRow,
  ElSelect,
  ElTag,
  ElUpload,
} from 'element-plus';

import { getCaseDetailApi, uploadCaseFileApi } from '#/api/core/case';
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

import {
  stageMapping,
  taskConfigs,
  taskTypeToOperateType,
  updateApiUrls,
} from '../config/task-config';
import {
  buildUpdateParams,
  callUpdateApi,
  extractDataList,
  formatDateTime,
  getStatusType,
  getUserInfo,
} from '../utils/task-utils';

const route = useRoute();
const router = useRouter();

const caseId = ref(
  (route.params.caseId as string) || (route.params.id as string),
);
const taskId = ref(
  (route.params.taskId as string) || (route.params.taskType as string),
);
const isAddMode = ref(route.path.endsWith('/add'));

const currentTask = computed(
  () => taskConfigs[taskId.value as keyof typeof taskConfigs],
);

const formDataList = ref<Array<Record<string, any>>>([]);
const originalDataList = ref<Array<Record<string, any>>>([]);
const currentIndex = ref(0);
const loading = ref(false);
const saving = ref(false);
const caseDetail = ref<any>(null);
const taskStatus = ref<CaseProcessApi.TaskStatus>('未确认');
const isSkipped = ref(false);
const activeOption = ref('file');
const fileList = ref<Array<any>>([]);

const formData = computed({
  get: (): Record<string, any> => {
    if (!formDataList.value[currentIndex.value]) {
      formDataList.value[currentIndex.value] = {};
    }
    return formDataList.value[currentIndex.value] as Record<string, any>;
  },
  set: (value: Record<string, any>) => {
    formDataList.value[currentIndex.value] = value;
  },
});

const originalData = computed(
  () => originalDataList.value[currentIndex.value] || {},
);

// 阶段映射
const stageMapping: Record<string, number> = {
  // 第一阶段任务
  workTeam: 1,
  workPlan: 1,
  management: 1,
  sealManagement: 1,
  legalProcedure: 1,
  // 第二阶段任务
  propertyReceipt: 2,
  emergency: 2,
  propertyPlan: 2,
  personnelEmp: 2,
  internalAffairs: 2,
  businessManagement: 2,
  // 第三阶段任务
  propertyInvestigation: 3,
  bankExpenses: 3,
  rightsClaim: 3,
  reclaimReview: 3,
  litigationArbitration: 3,
  creditorClaim: 3,
  socialSF: 3,
  taxVerification: 3,
};

// 任务类型映射到OperateType（按阶段重新编号，每个阶段从0开始）
const taskTypeToOperateType: Record<string, string> = {
  // 第一阶段任务
  workTeam: '0',
  workPlan: '1',
  management: '2',
  sealManagement: '3',
  legalProcedure: '4',
  // 第二阶段任务
  propertyReceipt: '0',
  emergency: '1',
  propertyPlan: '2',
  personnelEmp: '3',
  internalAffairs: '4',
  businessManagement: '5',
  // 第三阶段任务
  propertyInvestigation: '0',
  bankExpenses: '1',
  rightsClaim: '2',
  reclaimReview: '3',
  litigationArbitration: '4',
  creditorClaim: '5',
  socialSF: '6',
  taxVerification: '7',
};

// 阶段对应的更新接口URL
const updateApiUrls: Record<number, string> = {
  1: 'http://192.168.0.120:8085/api/web/update1?token=ff3378dd6264d6a0d4293d322e738a85',
  2: 'http://192.168.0.120:8085/api/web/update2?token=5781352a1e8bd95e5fa74f0ff47074c5',
  3: 'http://192.168.0.120:8085/api/web/update3?token=da90b1901ed746289dd074c1af9dfa55',
};

// 页面标题
const pageTitle = computed(() => {
  const baseTitle = isAddMode.value ? '新增' : '编辑';
  if (
    taskId.value === 'workTeam' &&
    caseDetail.value &&
    caseDetail.value.案号
  ) {
    return `${caseDetail.value.案号} ${baseTitle} 工作团队确认`;
  }
  return `${baseTitle} ${currentTask.value.name}`;
});

const loadTaskData = async () => {
  loading.value = true;
  try {
    if (isAddMode.value) {
      const mockData: Record<string, any> = {};
      currentTask.value.fields.forEach((field) => {
        mockData[field.key] = '';
      });

      formDataList.value = [mockData];
      originalDataList.value = [mockData];
      currentIndex.value = 0;
      taskStatus.value = '未确认';
      loading.value = false;
      return;
    }

    let apiResponse: any;

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

    apiResponse = await apiFunction();

    if (apiResponse.status === '1') {
      const dataList = extractDataList(apiResponse);
      formDataList.value = dataList.map((item) => ({ ...item }));
      originalDataList.value = dataList.map((item) => ({ ...item }));
      taskStatus.value =
        (dataList[0]?.DQZT as CaseProcessApi.TaskStatus) || '未确认';
    } else {
      const mockData: Record<string, any> = {};
      currentTask.value.fields.forEach((field) => {
        mockData[field.key] = '';
      });

      formDataList.value = [mockData];
      originalDataList.value = [mockData];
      currentIndex.value = 0;
      taskStatus.value = '未确认';

      ElMessage.warning('获取任务数据失败，使用默认数据');
    }
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');

    const mockData: Record<string, any> = {};
    currentTask.value.fields.forEach((field) => {
      mockData[field.key] = '';
    });

    formDataList.value = [mockData];
    originalDataList.value = [mockData];
    currentIndex.value = 0;
    taskStatus.value = '未确认';
  } finally {
    loading.value = false;
  }
};

const saveData = async (confirm: boolean = false) => {
  saving.value = true;
  try {
    const userInfo = getUserInfo();
    const sep_adate = formatDateTime(new Date());

    if (taskId.value === 'workTeam') {
      if (isAddMode.value) {
        const { addWorkTeamApi } = await import('#/api/core/work-team');
        const addParams = {
          sep_ld: caseId.value,
          sep_id:
            (formData.value || {}).SEP_ID ||
            (formData.value || {}).sep_id ||
            caseId.value,
          tdfzr: (formData.value || {}).TDFZR || '',
          zhzcy: (formData.value || {}).ZHZCY || '',
          cxzcy: (formData.value || {}).CXZCY || '',
          ccglzcy: (formData.value || {}).CCGLZCY || '',
          zqshzcy: (formData.value || {}).ZQSHZCY || '',
          ldrszcy: (formData.value || {}).LDRSZCY || '',
          zzqlzcy: (formData.value || {}).ZZQLZCY || '',
          sep_auser: userInfo.uName,
          sep_adate,
          ZT: confirm ? '1' : '0',
        };

        const result = await addWorkTeamApi(addParams);
        if (result.status !== '1') {
          throw new Error(result.error || '保存数据失败');
        }
      } else {
        const updateParams = buildUpdateParams(
          taskId.value,
          caseId.value,
          formData.value,
          taskTypeToOperateType[taskId.value] || '0',
          confirm ? '1' : '0',
        );

        const resultData = await callUpdateApi(1, updateParams, updateApiUrls);
        if (resultData.status !== '1') {
          throw new Error(resultData.error || '保存数据失败');
        }
      }
    } else {
      if (isAddMode.value) {
        const addApiMap: Record<string, (params: any) => Promise<any>> = {
          businessManagement: async (params) => {
            const { addBusinessManagementApi } =
              await import('#/api/core/case-process');
            return addBusinessManagementApi(params);
          },
          emergency: async (params) => {
            const { addEmergencyApi } = await import('#/api/core/case-process');
            return addEmergencyApi(params);
          },
          internalAffairs: async (params) => {
            const { addInternalAffairsApi } =
              await import('#/api/core/case-process');
            return addInternalAffairsApi(params);
          },
          legalProcedure: async (params) => {
            const { addLegalProcedureApi } =
              await import('#/api/core/case-process');
            return addLegalProcedureApi(params);
          },
          management: async (params) => {
            const { addManagementApi } =
              await import('#/api/core/case-process');
            return addManagementApi(params);
          },
          personnelEmp: async (params) => {
            const { addPersonnelEmploymentApi } =
              await import('#/api/core/case-process');
            return addPersonnelEmploymentApi(params);
          },
          propertyPlan: async (params) => {
            const { addPropertyPlanApi } =
              await import('#/api/core/case-process');
            return addPropertyPlanApi(params);
          },
          propertyReceipt: async (params) => {
            const { addPropertyReceiptApi } =
              await import('#/api/core/case-process');
            return addPropertyReceiptApi(params);
          },
          sealManagement: async (params) => {
            const { addSealManagementApi } =
              await import('#/api/core/case-process');
            return addSealManagementApi(params);
          },
          workPlan: async (params) => {
            const { addWorkPlanApi } = await import('#/api/core/case-process');
            return addWorkPlanApi(params);
          },
        };

        const addFunction = addApiMap[taskId.value];
        if (!addFunction) {
          throw new Error(`未知的任务类型: ${taskId.value}`);
        }

        const addParams = {
          sep_ld: caseId.value,
          sep_auser: userInfo.uName,
          sep_adate,
          ...formData.value,
          zt: confirm ? '1' : '0',
        };

        const addResponse = await addFunction(addParams);
        if (addResponse.status !== '1') {
          throw new Error(addResponse.error || '保存数据失败');
        }
      } else {
        const stage = stageMapping[taskId.value] || 1;
        const updateParams = buildUpdateParams(
          taskId.value,
          caseId.value,
          formData.value,
          taskTypeToOperateType[taskId.value] || '0',
          confirm ? '1' : '0',
        );

        const resultData = await callUpdateApi(
          stage,
          updateParams,
          updateApiUrls,
        );
        if (resultData.status !== '1') {
          throw new Error(resultData.error || '保存数据失败');
        }
      }
    }

    if (confirm) {
      taskStatus.value = '完成';
      ElMessage.success('数据已保存并确认完成');
    } else {
      ElMessage.success('数据已保存');
    }

    originalDataList.value[currentIndex.value] = { ...formData.value };
    router.push(`/law/case-detail/${caseId.value}`);
  } catch (error) {
    console.error('保存数据失败:', error);
    ElMessage.error('保存数据失败');
  } finally {
    saving.value = false;
  }
};

const saveAndConfirm = async () => {
  await ElMessageBox.confirm('确认保存并完成此任务吗？', '确认完成', {
    confirmButtonText: '确认完成',
    cancelButtonText: '取消',
    type: 'warning',
  });

  await saveData(true);
};

const skipTask = async () => {
  saving.value = true;
  try {
    const userInfo = getUserInfo();
    const sep_adate = formatDateTime(new Date());

    let resultData;

    if (taskId.value.toLowerCase() === 'workteam') {
      const { addWorkTeamApi } = await import('#/api/core/work-team');
      const addParams = {
        sep_ld: caseId.value,
        sep_id:
          (formData.value || {}).SEP_ID ||
          (formData.value || {}).sep_id ||
          caseId.value,
        tdfzr: (formData.value || {}).TDFZR || '',
        zhzcy: (formData.value || {}).ZHZCY || '',
        cxzcy: (formData.value || {}).CXZCY || '',
        ccglzcy: (formData.value || {}).CCGLZCY || '',
        zqshzcy: (formData.value || {}).ZQSHZCY || '',
        ldrszcy: (formData.value || {}).LDRSZCY || '',
        zzqlzcy: (formData.value || {}).ZZQLZCY || '',
        sep_auser: userInfo.uName,
        sep_adate,
        ZT: '2',
      };
      resultData = await addWorkTeamApi(addParams);
    } else {
      const stage = stageMapping[taskId.value] || 1;
      const updateParams = buildUpdateParams(
        taskId.value,
        caseId.value,
        formData.value,
        taskTypeToOperateType[taskId.value] || '0',
        '2',
      );

      resultData = await callUpdateApi(stage, updateParams, updateApiUrls);
    }

    if (resultData.status === '1') {
      taskStatus.value = '跳过';
      isSkipped.value = true;
      ElMessage.success('任务已跳过');
    } else {
      ElMessage.error(`跳过任务失败：${resultData.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('跳过任务失败:', error);
    ElMessage.error('跳过任务失败');
  } finally {
    saving.value = false;
  }
};

const revokeSkip = async () => {
  saving.value = true;
  try {
    const userInfo = getUserInfo();
    const SEP_EDATE = formatDateTime(new Date());

    let resultData;

    if (taskId.value.toLowerCase() === 'workteam') {
      const workTeamParams = {
        OperateType: 0,
        sep_id:
          (formData.value || {}).SEP_ID ||
          (formData.value || {}).sep_id ||
          caseId.value,
        SEP_LD: caseId.value,
        SEP_EUSER: userInfo.uName,
        SEP_EDATE,
        tdfzr: (formData.value || {}).TDFZR || '',
        zhzcy: (formData.value || {}).ZHZCY || '',
        cxzcy: (formData.value || {}).CXZCY || '',
        ccglzcy: (formData.value || {}).CCGLZCY || '',
        zqshzcy: (formData.value || {}).ZQSHZCY || '',
        ldrszcy: (formData.value || {}).LDRSZCY || '',
        zzqlzcy: (formData.value || {}).ZZQLZCY || '',
        ZT: '0',
      };

      resultData = await callUpdateApi(1, workTeamParams, updateApiUrls);
    } else {
      const stage = stageMapping[taskId.value] || 1;
      const updateParams = buildUpdateParams(
        taskId.value,
        caseId.value,
        formData.value,
        taskTypeToOperateType[taskId.value] || '0',
        '0',
      );

      resultData = await callUpdateApi(stage, updateParams, updateApiUrls);
    }

    if (resultData.status === '1') {
      taskStatus.value = '未确认';
      isSkipped.value = false;
      ElMessage.success('已撤回操作');
    } else {
      ElMessage.error(`撤回操作失败：${resultData.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('撤回操作失败:', error);
    ElMessage.error('撤回操作失败');
  } finally {
    saving.value = false;
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

const cancelEdit = () => {
  const hasChanges =
    JSON.stringify(formData.value) !== JSON.stringify(originalData.value);

  if (hasChanges) {
    ElMessageBox.confirm('有未保存的更改，确定要取消吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '继续编辑',
      type: 'warning',
    })
      .then(() => {
        router.back();
      })
      .catch(() => {});
  } else {
    router.back();
  }
};

const handleFileUpload = async (options: any) => {
  try {
    const file = options.file;
    const SEP_ID =
      (formData.value || {}).SEP_ID ||
      (formData.value || {}).sep_id ||
      caseId.value;

    const result = await uploadCaseFileApi(file, SEP_ID);

    if (result.status === '1') {
      ElMessage.success('文件上传成功');
      fileList.value.push({
        name: file.name,
        url: result.data?.url || result.data?.fileUrl || '',
        uid: file.uid,
      });
    } else {
      throw new Error(result.error || '文件上传失败');
    }
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败');
    options.onError(error);
  }
};

const handleRemove = (file: any) => {
  console.log('移除文件:', file);
};

const beforeUpload = (file: File) => {
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB');
    return false;
  }
  return true;
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
  <div class="task-edit-container">
    <div class="page-header">
      <ElButton type="primary" link @click="cancelEdit">
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

    <ElCard class="task-edit-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:edit-3" class="mr-2 text-blue-500" />
          <span class="text-lg font-semibold"> {{ pageTitle }} - 编辑 </span>
        </div>
      </template>

      <div v-if="currentTask" class="task-form">
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

        <div class="option-switch-buttons">
          <ElButton
            type="primary"
            :plain="activeOption !== 'file'"
            @click="activeOption = 'file'"
          >
            文件上传
          </ElButton>
          <ElButton
            type="primary"
            :plain="activeOption !== 'custom'"
            @click="activeOption = 'custom'"
          >
            自定义数据
          </ElButton>
        </div>

        <div v-if="activeOption === 'file'" class="file-upload-section">
          <ElUpload
            class="upload-demo"
            action="#"
            :http-request="handleFileUpload"
            :file-list="fileList"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            multiple
          >
            <ElButton type="primary">
              <Icon icon="lucide:upload" class="mr-1" />
              点击上传
            </ElButton>
            <template #tip>
              <div class="el-upload__tip">文件大小不超过10MB</div>
            </template>
          </ElUpload>
        </div>

        <div v-else-if="activeOption === 'custom'" class="custom-data-section">
          <ElForm :model="formData" label-width="120px">
            <ElRow :gutter="20">
              <ElCol
                v-for="field in currentTask.fields"
                :key="field.key"
                :xs="24"
                :sm="12"
                :md="8"
              >
                <ElFormItem :label="field.label" :prop="field.key">
                  <ElInput
                    v-if="field.type !== 'select' && field.type !== 'date'"
                    :type="field.type === 'textarea' ? 'textarea' : 'text'"
                    :rows="field.type === 'textarea' ? 4 : 1"
                    :placeholder="`请输入${field.label}`"
                    v-model="formData[field.key]"
                  />
                  <ElSelect
                    v-else-if="field.type === 'select'"
                    :placeholder="`请选择${field.label}`"
                    v-model="formData[field.key]"
                  >
                    <ElOption
                      v-for="option in (field as any).options || []"
                      :key="option"
                      :label="option"
                      :value="option"
                    />
                  </ElSelect>
                  <ElDatePicker
                    v-else-if="field.type === 'date'"
                    type="date"
                    :placeholder="`请选择${field.label}`"
                    v-model="formData[field.key]"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElForm>
        </div>

        <div class="action-buttons">
          <ElButton type="default" @click="cancelEdit" :disabled="saving">
            <Icon icon="lucide:x" class="mr-1" />
            取消
          </ElButton>

          <ElButton
            type="primary"
            @click="saveData(false)"
            :loading="saving"
            :disabled="isSkipped"
          >
            <Icon icon="lucide:save" class="mr-1" />
            保存
          </ElButton>

          <ElButton
            type="success"
            @click="saveAndConfirm"
            :loading="saving"
            :disabled="isSkipped || taskStatus === '完成'"
          >
            <Icon icon="lucide:check-circle" class="mr-1" />
            保存并确认
          </ElButton>
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
        <p class="task-instruction">
          • 点击"保存"按钮仅保存表单数据，不会改变任务状态
        </p>
        <p class="task-instruction">
          • 点击"保存并确认"按钮将保存数据并将任务状态设置为"完成"
        </p>
        <p class="task-instruction">
          • 如需跳过此任务，请在案件详情页面点击"跳过"按钮
        </p>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.task-edit-container {
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

.task-edit-card,
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

.task-form {
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

.option-switch-buttons {
  display: flex;
  gap: 12px;
  margin: 20px 0;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  justify-content: flex-start;
}

.file-upload-section {
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
}

.custom-data-section {
  padding: 20px 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
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
  .task-edit-container {
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

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
