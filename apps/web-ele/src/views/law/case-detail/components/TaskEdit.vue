<script setup lang="ts">
import type { CaseProcessApi } from '#/api/core/case-process';

import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElRow,
  ElSelect,
  ElTag,
} from 'element-plus';

// 导入API函数和类型
import {
  getLegalProcedureApi,
  getManagementApi,
  getSealManagementApi,
  getWorkPlanApi,
  getWorkTeamApi,
  unifiedTaskOperationApi,
} from '#/api/core/case-process';

// 路由参数
const route = useRoute();
const router = useRouter();
const caseId = route.params.id as string;
const taskType = route.params.taskType as string;

// 任务数据
const taskData = ref<any>({});
const loading = ref(false);
const saving = ref(false);

// 跳过状态管理
const isSkipped = ref(false);

// 任务类型映射
const taskTypeMap: Record<string, any> = {
  workTeam: {
    name: '工作团队确认',
    api: 'getWorkTeamApi',
    fields: [
      { label: '团队负责人', prop: 'TDFZR', type: 'input' },
      { label: '综合组成员', prop: 'ZHZCY', type: 'input' },
      { label: '程序组成员', prop: 'CXZCY', type: 'input' },
      { label: '财产管理组成员', prop: 'CCGLZCY', type: 'input' },
      { label: '债权审核组成员', prop: 'ZQSHZCY', type: 'input' },
      { label: '领导审核组成员', prop: 'LDRSZCY', type: 'input' },
      { label: '债权清理组成员', prop: 'ZZQLZCY', type: 'input' },
    ],
  },
  workPlan: {
    name: '工作计划确认',
    api: 'getWorkPlanApi',
    fields: [
      { label: '计划类型', prop: 'JHLX', type: 'input' },
      { label: '计划内容', prop: 'JHNR', type: 'textarea' },
      { label: '开始日期', prop: 'KSRQ', type: 'date' },
      { label: '结束日期', prop: 'JSRQ', type: 'date' },
      { label: '负责人', prop: 'FZR', type: 'input' },
    ],
  },
  management: {
    name: '管理制度确认',
    api: 'getManagementApi',
    fields: [
      { label: '制度名称', prop: 'GLMC', type: 'input' },
      { label: '制度内容', prop: 'GLNR', type: 'textarea' },
      { label: '负责人', prop: 'FZR', type: 'input' },
    ],
  },
  sealManagement: {
    name: '印章确认',
    api: 'getSealManagementApi',
    fields: [
      { label: '印章名称', prop: 'YZMC', type: 'input' },
      { label: '印章类型', prop: 'YZLX', type: 'input' },
      { label: '印章内容', prop: 'YZNR', type: 'textarea' },
      { label: '负责人', prop: 'FZR', type: 'input' },
    ],
  },
  legalProcedure: {
    name: '法律程序确认',
    api: 'getLegalProcedureApi',
    fields: [
      { label: '程序名称', prop: 'FLMC', type: 'input' },
      { label: '程序内容', prop: 'FLNR', type: 'textarea' },
      { label: '负责人', prop: 'FZR', type: 'input' },
    ],
  },
  // 第三阶段任务类型
  propertyInvestigation: {
    name: '财产调查',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  bankExpenses: {
    name: '银行费用',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  rightsClaim: {
    name: '权利主张',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  reclaimReview: {
    name: '回收审核',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  litigationArbitration: {
    name: '诉讼仲裁',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  creditorClaim: {
    name: '债权人申报',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  socialSF: {
    name: '社保费用表',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  taxVerification: {
    name: '税收核定表',
    api: '',
    fields: [
      { label: '调查类型', prop: 'TCLX', type: 'input' },
      { label: '调查内容', prop: 'TCNR', type: 'textarea' },
      { label: '调查日期', prop: 'TCRQ', type: 'date' },
      { label: '调查人', prop: 'TCR', type: 'input' },
      { label: '调查方向', prop: 'TCFX', type: 'input' },
      { label: '调查状态', prop: 'TCZT', type: 'input' },
    ],
  },
  // 第四阶段任务类型
  session: {
    name: '第一次债权人会议',
    api: '',
    fields: [
      { label: '会议类型', prop: 'HYLX', type: 'input' },
      { label: '会议主题', prop: 'HYZT', type: 'input' },
      { label: '会议日期', prop: 'HYRQ', type: 'date' },
      { label: '会议地点', prop: 'HYDD', type: 'input' },
      { label: '主持人', prop: 'ZCR', type: 'input' },
      { label: '参会人数', prop: 'CHRS', type: 'input' },
    ],
  },
  meetingDocuments: {
    name: '会议文件',
    api: '',
    fields: [
      { label: '文件名称', prop: 'WJMC', type: 'input' },
      { label: '文件类型', prop: 'WJLX', type: 'input' },
      { label: '文件内容', prop: 'WJNR', type: 'textarea' },
      { label: '上传日期', prop: 'SCRQ', type: 'date' },
      { label: '上传人', prop: 'SCR', type: 'input' },
    ],
  },
  claimConfirmation: {
    name: '债权确认',
    api: '',
    fields: [
      { label: '债权人名称', prop: 'ZQRM', type: 'input' },
      { label: '债权金额', prop: 'ZQJE', type: 'input' },
      { label: '债权类型', prop: 'ZQLX', type: 'input' },
      { label: '确认日期', prop: 'QRQ', type: 'date' },
      { label: '确认状态', prop: 'QRZT', type: 'input' },
    ],
  },
  importantActions: {
    name: '重要行为',
    api: '',
    fields: [
      { label: '行为名称', prop: 'XWMC', type: 'input' },
      { label: '行为类型', prop: 'XWLX', type: 'input' },
      { label: '行为内容', prop: 'XWNR', type: 'textarea' },
      { label: '发生日期', prop: 'FSRQ', type: 'date' },
      { label: '负责人', prop: 'FZR', type: 'input' },
    ],
  },
  setoffReview: {
    name: '抵销审核',
    api: '',
    fields: [
      { label: '抵销金额', prop: 'DXJE', type: 'input' },
      { label: '抵销类型', prop: 'DXLX', type: 'input' },
      { label: '审核日期', prop: 'SHRQ', type: 'date' },
      { label: '审核状态', prop: 'SHZT', type: 'input' },
      { label: '审核人', prop: 'SHR', type: 'input' },
    ],
  },
  auditReport: {
    name: '审计报告',
    api: '',
    fields: [
      { label: '报告名称', prop: 'BGMC', type: 'input' },
      { label: '报告编号', prop: 'BGBH', type: 'input' },
      { label: '报告内容', prop: 'BGNR', type: 'textarea' },
      { label: '出具日期', prop: 'CJRQ', type: 'date' },
      { label: '出具机构', prop: 'CJJG', type: 'input' },
    ],
  },
  // 第五阶段任务类型
  assetValuation: {
    name: '资产价值评估',
    api: '',
    fields: [
      { label: '评估项目', prop: 'PGXM', type: 'input' },
      { label: '评估价值', prop: 'PGJZ', type: 'input' },
      { label: '评估日期', prop: 'PGRQ', type: 'date' },
      { label: '评估机构', prop: 'PGJG', type: 'input' },
      { label: '评估报告编号', prop: 'PGBGBH', type: 'input' },
    ],
  },
  propertyVPlan: {
    name: '财产变价方案',
    api: '',
    fields: [
      { label: '方案名称', prop: 'FAMC', type: 'input' },
      { label: '变价方式', prop: 'BJFS', type: 'input' },
      { label: '方案内容', prop: 'FANC', type: 'textarea' },
      { label: '制定日期', prop: 'ZDRQ', type: 'date' },
      { label: '负责人', prop: 'FZR', type: 'input' },
    ],
  },
  bankruptcyDeclaration: {
    name: '破产宣告',
    api: '',
    fields: [
      { label: '宣告日期', prop: 'XGRQ', type: 'date' },
      { label: '宣告文号', prop: 'XGH', type: 'input' },
      { label: '宣告法院', prop: 'XGYY', type: 'input' },
      { label: '宣告内容', prop: 'XGNR', type: 'textarea' },
    ],
  },
  propertyVIM: {
    name: '财产分配方案',
    api: '',
    fields: [
      { label: '方案名称', prop: 'FAMC', type: 'input' },
      { label: '分配总额', prop: 'FPZE', type: 'input' },
      { label: '分配方式', prop: 'FPFS', type: 'input' },
      { label: '方案内容', prop: 'FANC', type: 'textarea' },
      { label: '制定日期', prop: 'ZDRQ', type: 'date' },
    ],
  },
};

// 当前任务配置
const currentTask = ref(taskTypeMap[taskType]);

// 加载任务数据
const loadTaskData = async () => {
  if (!currentTask.value) return;

  loading.value = true;
  try {
    let apiResponse;

    // 检查是否为第一阶段任务类型
    const firstStageTaskTypes = [
      'legalProcedure',
      'management',
      'sealManagement',
      'workPlan',
      'workTeam',
    ];

    if (firstStageTaskTypes.includes(taskType)) {
      // 根据任务类型调用对应的API接口
      switch (taskType) {
        case 'legalProcedure': {
          apiResponse = await getLegalProcedureApi(caseId);
          break;
        }
        case 'management': {
          apiResponse = await getManagementApi(caseId);
          break;
        }
        case 'sealManagement': {
          apiResponse = await getSealManagementApi(caseId);
          break;
        }
        case 'workPlan': {
          apiResponse = await getWorkPlanApi(caseId);
          break;
        }
        case 'workTeam': {
          apiResponse = await getWorkTeamApi(caseId);
          break;
        }
        default: {
          throw new Error('未知的任务类型');
        }
      }

      // 处理第一阶段API响应
      if (apiResponse.status === '1' && apiResponse.data) {
        // 使用API返回的数据
        taskData.value = {
          ...apiResponse.data,
          // 确保有默认值
          DQZT:
            (apiResponse.data?.DQZT as CaseProcessApi.TaskStatus) || '未确认',
          // 确保SEP_ID存在
          SEP_ID: apiResponse.data?.SEP_ID || caseId,
        };
      } else {
        // API调用失败或数据为空，使用默认数据
        taskData.value = {
          SEP_ID: caseId,
          DQZT: '未确认',
          ...Object.fromEntries(
            currentTask.value.fields.map((field: any) => [field.prop, '']),
          ),
        };
        ElMessage.warning('API调用失败，使用默认数据');
      }
    } else {
      // 第三阶段任务类型，使用不同的API调用方式
      const apiConfig: Record<string, { token: string; url: string }> = {
        propertyInvestigation: {
          url: '/api/web/getAllPropertyInvestigation',
          token: '17fce65ebabe3088ab45b97f77f91b5a',
        },
        bankExpenses: {
          url: '/api/web/getAllBankExpenses',
          token: 'ff7185ba1adffaa6630ec57062ae6473',
        },
        rightsClaim: {
          url: '/api/web/getAllRightsClaim',
          token: '0ce8909084c3cd60a2e2f8ba450df13a',
        },
        reclaimReview: {
          url: '/api/web/getAllReclaimReview',
          token: 'dcdc3c95faccd88d495c94923f8e2148',
        },
        litigationArbitration: {
          url: '/api/web/getAllLitigationArbitration',
          token: '7adbf35a9986045cb55ce9e1d8d8b90c',
        },
        creditorClaim: {
          url: '/api/web/getAllCreditorClaim',
          token: '7fb219c01b0107dc5cb58d173ce87664',
        },
        socialSF: {
          url: '/api/web/getAllSociaSF',
          token: 'a8990ffa15ebbd2bff6aed37db08cadf',
        },
        taxVerification: {
          url: '/api/web/getAllTaxVerification',
          token: '59a21e973cc5a522c63b11c19a988d0b',
        },
      };

      const config = apiConfig[taskType];
      if (config) {
        // 调用第三阶段API，使用SEP_ID作为参数
        const response = await fetch(
          `${import.meta.env.VITE_GLOB_API_URL}${config.url}?token=${config.token}&SEP_ID=${caseId}&page=1&size=10`,
        );
        const data = await response.json();

        if (data.status === '1' && data.data?.records?.length > 0) {
          // 使用API返回的数据
          const record = data.data.records[0];
          taskData.value = {
            ...record,
            // 确保有默认值
            DQZT: (record?.DQZT as CaseProcessApi.TaskStatus) || '未确认',
          };
        } else {
          // API调用失败或数据为空，使用默认数据
          taskData.value = {
            SEP_ID: '1',
            GLAJBH: caseId,
            AH: caseId,
            DQZT: '未确认',
            ...Object.fromEntries(
              currentTask.value.fields.map((field: any) => [field.prop, '']),
            ),
          };

          // 处理status为"0"的情况
          if (data.status === '0') {
            const errorMsg = data.error || 'API调用失败';
            ElMessage.warning(`${errorMsg}，使用默认数据`);
          } else {
            ElMessage.warning('API调用失败，使用默认数据');
          }
        }
      } else {
        // 未知的任务类型，使用默认数据
        taskData.value = {
          SEP_ID: '1',
          GLAJBH: caseId,
          AH: caseId,
          DQZT: '未确认',
          ...Object.fromEntries(
            currentTask.value.fields.map((field: any) => [field.prop, '']),
          ),
        };
        ElMessage.warning('未知的任务类型，使用默认数据');
      }
    }

    ElMessage.success('任务数据加载成功');
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

// 任务类型映射到OperateType
const taskTypeToOperateType: Record<string, string> = {
  // 第一阶段任务
  workTeam: '0',
  workPlan: '1',
  management: '2',
  sealManagement: '3',
  legalProcedure: '4',
  // 第二阶段任务
  propertyReceipt: '5',
  emergency: '6',
  propertyPlan: '7',
  personnelEmp: '8',
  internalAffairs: '9',
  businessManagement: '10',
};

// 保存任务数据
const saveTask = async (confirmStatus: boolean = false) => {
  if (!currentTask.value) return;

  saving.value = true;
  try {
    // 准备统一API参数
    const params = {
      SEP_LD: caseId,
      SEP_ID: taskData.value.SEP_ID || caseId,
      ZT: confirmStatus ? '1' : '0', // 确认完成则ZT=1，否则ZT=0
      OperateType: taskTypeToOperateType[taskType] || '0',
      ...taskData.value, // 上传所有修改的值
    };

    // 调用统一API (update)
    const apiResponse = await unifiedTaskOperationApi(params);

    // 处理API响应
    if (apiResponse.status === '1') {
      if (confirmStatus) {
        taskData.value.DQZT = '完成';
      }

      ElMessage.success(confirmStatus ? '任务已确认完成' : '任务数据已保存');

      if (confirmStatus) {
        // 返回案件详情页面
        router.back();
      }
    } else {
      ElMessage.error(`保存任务数据失败：${apiResponse.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('保存任务数据失败:', error);
    ElMessage.error('保存任务数据失败');
  } finally {
    saving.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  router.back();
};

// 确认完成对话框
const showConfirmDialog = () => {
  ElMessageBox.confirm('确认完成此任务吗？完成后将无法修改状态。', '确认完成', {
    confirmButtonText: '确认完成',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      saveTask(true);
    })
    .catch(() => {
      // 用户取消
    });
};

// 跳过任务
const skipTask = async () => {
  saving.value = true;
  try {
    // 准备统一API参数
    const params = {
      SEP_LD: caseId,
      SEP_ID: taskData.value.SEP_ID || caseId,
      ZT: '2', // 跳过状态
      OperateType: taskTypeToOperateType[taskType] || '0',
      ...taskData.value,
    };

    // 调用统一API (update)
    const apiResponse = await unifiedTaskOperationApi(params);

    if (apiResponse.status === '1') {
      taskData.value.DQZT = '跳过';
      isSkipped.value = true;
      ElMessage.success('任务已跳过');
    } else {
      ElMessage.error(`跳过任务失败：${apiResponse.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('跳过任务失败:', error);
    ElMessage.error('跳过任务失败');
  } finally {
    saving.value = false;
  }
};

// 撤回跳过或完成操作
const revokeSkip = async () => {
  saving.value = true;
  try {
    // 任务类型映射到OperateType
    const taskTypeToOperateType: Record<string, string> = {
      // 第一阶段任务
      workTeam: '0',
      workPlan: '1',
      management: '2',
      sealManagement: '3',
      legalProcedure: '4',
      // 第二阶段任务
      propertyReceipt: '5',
      emergency: '6',
      propertyPlan: '7',
      personnelEmp: '8',
      internalAffairs: '9',
      businessManagement: '10',
    };

    // 准备统一API参数
    const params = {
      SEP_LD: caseId,
      SEP_ID: taskData.value.SEP_ID || caseId,
      ZT: '0', // 未确认状态
      OperateType: taskTypeToOperateType[taskType] || '0',
      ...taskData.value, // 上传所有修改的值
    };

    // 调用统一API
    const apiResponse = await unifiedTaskOperationApi(params);

    if (apiResponse.status === '1') {
      taskData.value.DQZT = '未确认';
      isSkipped.value = false;
      ElMessage.success('已撤回操作');
    } else {
      ElMessage.error(`撤回操作失败：${apiResponse.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('撤回操作失败:', error);
    ElMessage.error('撤回操作失败');
  } finally {
    saving.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  if (!currentTask.value) {
    ElMessage.error('任务类型不存在');
    router.back();
    return;
  }

  loadTaskData();
});
watch(
  () => taskData.value.DQZT,
  (newStatus) => {
    if (newStatus === '跳过') {
      isSkipped.value = true;
    } else if (newStatus === '未确认') {
      isSkipped.value = false;
    }
  },
);
</script>

<template>
  <div class="task-edit-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <ElButton type="primary" link @click="cancelEdit">
        <Icon icon="lucide:arrow-left" class="mr-2" />
        返回案件详情
      </ElButton>
      <h1 class="page-title">{{ currentTask?.name }} - 编辑</h1>
    </div>

    <!-- 任务编辑表单 -->
    <ElCard class="task-form-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:edit" class="mr-2" />
          <span>任务信息编辑</span>
          <ElTag
            :type="
              taskData.DQZT === '完成'
                ? 'success'
                : taskData.DQZT === '跳过'
                  ? 'warning'
                  : 'info'
            "
            class="ml-2"
          >
            {{ taskData.DQZT || '未确认' }}
          </ElTag>
        </div>
      </template>

      <ElForm :model="taskData" label-width="120px" class="task-form">
        <ElRow :gutter="20">
          <ElCol
            :span="12"
            v-for="field in currentTask?.fields"
            :key="field.prop"
          >
            <ElFormItem :label="field.label">
              <ElInput
                v-model="taskData[field.prop]"
                :type="field.type === 'textarea' ? 'textarea' : 'text'"
                :rows="field.type === 'textarea' ? 4 : 1"
                :placeholder="`请输入${field.label}`"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <!-- 状态字段 -->
        <ElFormItem label="当前状态">
          <ElSelect
            v-model="taskData.DQZT"
            placeholder="请选择状态"
            style="width: 200px"
            :disabled="isSkipped"
          >
            <ElOption label="未确认" value="未确认" />
            <ElOption label="完成" value="完成" />
            <ElOption label="跳过" value="跳过" />
          </ElSelect>
        </ElFormItem>
      </ElForm>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <ElButton @click="cancelEdit">取消</ElButton>
        <ElButton
          type="primary"
          :loading="saving"
          @click="saveTask(false)"
          :disabled="isSkipped"
        >
          保存
        </ElButton>
        <ElButton
          type="success"
          :loading="saving"
          @click="showConfirmDialog"
          :disabled="isSkipped"
        >
          保存并确认
        </ElButton>
        <ElButton
          v-if="!isSkipped"
          type="warning"
          :loading="saving"
          @click="skipTask"
        >
          跳过
        </ElButton>
        <ElButton v-else type="warning" :loading="saving" @click="revokeSkip">
          撤回
        </ElButton>
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
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.task-form-card {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  resize: vertical;
}
</style>
