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

import { getCaseDetailApi } from '#/api/core/case';
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

const route = useRoute();
const router = useRouter();

const caseId = ref(
  (route.params.caseId as string) || (route.params.id as string),
);
const taskId = ref(
  (route.params.taskId as string) || (route.params.taskType as string),
);

const taskConfigs = {
  workTeam: {
    name: '工作团队确认',
    fields: [
      { key: 'TDFZR', label: '团队负责人', type: 'input' },
      { key: 'ZHZCY', label: '综合组成员', type: 'input' },
      { key: 'CXZCY', label: '程序组成员', type: 'input' },
      { key: 'CCGLZCY', label: '财产管理组成员', type: 'input' },
      { key: 'ZQSHZCY', label: '债权审核组成员', type: 'input' },
      { key: 'LDRSZCY', label: '劳动人事组成员', type: 'input' },
      { key: 'ZZQLZCY', label: '债权确认组成员', type: 'input' },
    ],
  },
  workPlan: {
    name: '工作计划确认',
    fields: [
      { key: 'JHLX', label: '计划类型', type: 'input' },
      { key: 'JHNR', label: '计划内容', type: 'textarea' },
      { key: 'KSRQ', label: '开始日期', type: 'date' },
      { key: 'JSRQ', label: '结束日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'ZHZT', label: '综合状态', type: 'input' },
    ],
  },
  management: {
    name: '管理制度确认',
    fields: [
      { key: 'GLMC', label: '管理制度名称', type: 'input' },
      { key: 'GLNR', label: '管理制度内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'FBRQ', label: '发布日期', type: 'date' },
      { key: 'SYFW', label: '适用范围', type: 'input' },
    ],
  },
  sealManagement: {
    name: '印章确认',
    fields: [
      { key: 'YZMC', label: '印章名称', type: 'input' },
      { key: 'YZZT', label: '印章状态', type: 'input' },
      { key: 'GLR', label: '管理人', type: 'input' },
      { key: 'GLRQ', label: '管理日期', type: 'date' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
  },
  legalProcedure: {
    name: '法律程序确认',
    fields: [
      { key: 'CXMC', label: '程序名称', type: 'input' },
      { key: 'CXNR', label: '程序内容', type: 'textarea' },
      { key: 'KSRQ', label: '开始日期', type: 'date' },
      { key: 'JSRQ', label: '结束日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'CXZT', label: '程序状态', type: 'input' },
    ],
  },
  propertyReceipt: {
    name: '财产接管确认',
    fields: [
      { key: 'CCJGRQ', label: '接管日期', type: 'date' },
      { key: 'CCJGNR', label: '接管内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'JGZT', label: '接管状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
  },
  emergency: {
    name: '应急预案确认',
    fields: [
      { key: 'YJYAMC', label: '应急预案名称', type: 'input' },
      { key: 'YJYANR', label: '应急预案内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'YJZT', label: '应急状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
  },
  propertyPlan: {
    name: '财产处置计划确认',
    fields: [
      { key: 'CCJHMC', label: '财产计划名称', type: 'input' },
      { key: 'CCJHNR', label: '财产计划内容', type: 'textarea' },
      { key: 'KSRQ', label: '开始日期', type: 'date' },
      { key: 'JSRQ', label: '结束日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'JHZT', label: '计划状态', type: 'input' },
    ],
  },
  personnelEmp: {
    name: '人事管理确认',
    fields: [
      { key: 'RSGLNR', label: '人事管理内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'GLRQ', label: '管理日期', type: 'date' },
      { key: 'GLZT', label: '管理状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
  },
  internalAffairs: {
    name: '内部事务确认',
    fields: [
      { key: 'NBSWNR', label: '内部事务内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'CLRQ', label: '处理日期', type: 'date' },
      { key: 'SWZT', label: '事务状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
  },
  businessManagement: {
    name: '经营管理确认',
    fields: [
      { key: 'JYGLNR', label: '经营管理内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'GLRQ', label: '管理日期', type: 'date' },
      { key: 'GLZT', label: '管理状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
  },
  propertyInvestigation: {
    name: '财产调查',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  bankExpenses: {
    name: '银行费用',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  rightsClaim: {
    name: '权利主张',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  reclaimReview: {
    name: '回收审核',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  litigationArbitration: {
    name: '诉讼仲裁',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  creditorClaim: {
    name: '债权人申报',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  socialSF: {
    name: '社保费用表',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  taxVerification: {
    name: '税收核定表',
    fields: [
      { key: 'TCLX', label: '调查类型', type: 'input' },
      { key: 'TCNR', label: '调查内容', type: 'textarea' },
      { key: 'TCRQ', label: '调查日期', type: 'date' },
      { key: 'TCR', label: '调查人', type: 'input' },
      { key: 'TCFX', label: '调查方向', type: 'input' },
      { key: 'TCZT', label: '调查状态', type: 'input' },
    ],
  },
  session: {
    name: '第一次债权人会议',
    fields: [
      { key: 'HYLX', label: '会议类型', type: 'input' },
      { key: 'HYZT', label: '会议主题', type: 'input' },
      { key: 'HYRQ', label: '会议日期', type: 'date' },
      { key: 'HYDD', label: '会议地点', type: 'input' },
      { key: 'ZCR', label: '主持人', type: 'input' },
      { key: 'CHRS', label: '参会人数', type: 'input' },
    ],
  },
  meetingDocuments: {
    name: '会议文件',
    fields: [
      { key: 'WJMC', label: '文件名称', type: 'input' },
      { key: 'WJLX', label: '文件类型', type: 'input' },
      { key: 'WJNR', label: '文件内容', type: 'textarea' },
      { key: 'SCRQ', label: '上传日期', type: 'date' },
      { key: 'SCR', label: '上传人', type: 'input' },
    ],
  },
  claimConfirmation: {
    name: '债权确认',
    fields: [
      { key: 'ZQRM', label: '债权人名称', type: 'input' },
      { key: 'ZQJE', label: '债权金额', type: 'input' },
      { key: 'ZQLX', label: '债权类型', type: 'input' },
      { key: 'QRQ', label: '确认日期', type: 'date' },
      { key: 'QRZT', label: '确认状态', type: 'input' },
    ],
  },
  importantActions: {
    name: '重要行为',
    fields: [
      { key: 'XWMC', label: '行为名称', type: 'input' },
      { key: 'XWLX', label: '行为类型', type: 'input' },
      { key: 'XWNR', label: '行为内容', type: 'textarea' },
      { key: 'FSRQ', label: '发生日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
    ],
  },
  setoffReview: {
    name: '抵销审核',
    fields: [
      { key: 'DXJE', label: '抵销金额', type: 'input' },
      { key: 'DXLX', label: '抵销类型', type: 'input' },
      { key: 'SHRQ', label: '审核日期', type: 'date' },
      { key: 'SHZT', label: '审核状态', type: 'input' },
      { key: 'SHR', label: '审核人', type: 'input' },
    ],
  },
  auditReport: {
    name: '审计报告',
    fields: [
      { key: 'BGMC', label: '报告名称', type: 'input' },
      { key: 'BGBH', label: '报告编号', type: 'input' },
      { key: 'BGNR', label: '报告内容', type: 'textarea' },
      { key: 'CJRQ', label: '出具日期', type: 'date' },
      { key: 'CJJG', label: '出具机构', type: 'input' },
    ],
  },
  assetValuation: {
    name: '资产价值评估',
    fields: [
      { key: 'PGXM', label: '评估项目', type: 'input' },
      { key: 'PGJZ', label: '评估价值', type: 'input' },
      { key: 'PGRQ', label: '评估日期', type: 'date' },
      { key: 'PGJG', label: '评估机构', type: 'input' },
      { key: 'PGBGBH', label: '评估报告编号', type: 'input' },
    ],
  },
  propertyVPlan: {
    name: '财产变价方案',
    fields: [
      { key: 'FAMC', label: '方案名称', type: 'input' },
      { key: 'BJFS', label: '变价方式', type: 'input' },
      { key: 'FANC', label: '方案内容', type: 'textarea' },
      { key: 'ZDRQ', label: '制定日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
    ],
  },
  bankruptcyDeclaration: {
    name: '破产宣告',
    fields: [
      { key: 'XGRQ', label: '宣告日期', type: 'date' },
      { key: 'XGH', label: '宣告文号', type: 'input' },
      { key: 'XGYY', label: '宣告法院', type: 'input' },
      { key: 'XGNR', label: '宣告内容', type: 'textarea' },
    ],
  },
  propertyVIM: {
    name: '财产分配方案',
    fields: [
      { key: 'FAMC', label: '方案名称', type: 'input' },
      { key: 'FPZE', label: '分配总额', type: 'input' },
      { key: 'FPFS', label: '分配方式', type: 'input' },
      { key: 'FANC', label: '方案内容', type: 'textarea' },
      { key: 'ZDRQ', label: '制定日期', type: 'date' },
    ],
  },
};

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

const getStatusType = (status: CaseProcessApi.TaskStatus) => {
  switch (status) {
    case '完成': {
      return 'success';
    }
    case '跳过': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

const loadTaskData = async () => {
  loading.value = true;
  try {
    let apiResponse: any;

    switch (taskId.value) {
      case 'businessManagement': {
        apiResponse = await getBusinessManagementApi(caseId.value);
        break;
      }
      case 'emergency': {
        apiResponse = await getEmergencyApi(caseId.value);
        break;
      }
      case 'internalAffairs': {
        apiResponse = await getInternalAffairsApi(caseId.value);
        break;
      }
      case 'legalProcedure': {
        apiResponse = await getLegalProcedureApi(caseId.value);
        break;
      }
      case 'management': {
        apiResponse = await getManagementApi(caseId.value);
        break;
      }
      case 'personnelEmp': {
        apiResponse = await getPersonnelEmpApi(caseId.value);
        break;
      }
      case 'propertyPlan': {
        apiResponse = await getPropertyPlanApi(caseId.value);
        break;
      }
      case 'propertyReceipt': {
        apiResponse = await getPropertyReceiptApi(caseId.value);
        break;
      }
      case 'sealManagement': {
        apiResponse = await getSealManagementApi(caseId.value);
        break;
      }
      case 'workPlan': {
        apiResponse = await getWorkPlanApi(caseId.value);
        break;
      }
      case 'workTeam': {
        apiResponse = await getWorkTeamApi(caseId.value);
        break;
      }
      default: {
        throw new Error('未知的任务类型');
      }
    }

    if (apiResponse.status === '1') {
      let dataList: Array<Record<string, any>> = [];

      if (apiResponse.data && Array.isArray(apiResponse.data.records)) {
        dataList = apiResponse.data.records;
      } else if (Array.isArray(apiResponse.data)) {
        dataList = apiResponse.data;
      } else {
        dataList = [apiResponse.data];
      }

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

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
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
