<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElEmpty,
  ElMessage,
  ElProgress,
  ElRow,
  ElSkeleton,
  ElTag,
} from 'element-plus';

import { getCaseDetailApi } from '#/api/core/case';

import StageOneProcess from './components/StageOneProcess.vue';
import StageThreeProcess from './components/StageThreeProcess.vue';
import StageTwoProcess from './components/StageTwoProcess.vue';
import StageFourProcess from './components/StageFourProcess.vue';
import StageFiveProcess from './components/StageFiveProcess.vue';

// 路由和状态管理
const route = useRoute();
const router = useRouter();
const caseId = ref(route.params.id as string);
const loading = ref(false);
const caseDetail = ref<any>(null);

// 当前选中的阶段索引
const currentStageIndex = ref(0);

// 破产流程阶段数据
const processStages = ref([
  {
    id: 1,
    title: '法院指定管理人至管理人接管破产企业前的工作',
    description: '阶段一',
    component: 'StageOneProcess',
    tasks: [
      {
        id: 'workTeam',
        name: '工作团队确认',
        completed: false,
        dueDate: '2023-01-20',
        apiId: 'workTeam',
      },
      {
        id: 'workPlan',
        name: '工作计划确认',
        completed: false,
        dueDate: '2023-01-25',
        apiId: 'workPlan',
      },
      {
        id: 'management',
        name: '管理制度确认',
        completed: false,
        dueDate: '2023-02-01',
        apiId: 'management',
      },
      {
        id: 'sealManagement',
        name: '印章确认',
        completed: false,
        dueDate: '2023-02-05',
        apiId: 'sealManagement',
      },
      {
        id: 'legalProcedure',
        name: '法律程序确认',
        completed: false,
        dueDate: '2023-01-30',
        apiId: 'legalProcedure',
      },
    ],
  },
  {
    id: 2,
    title: '管理人接管破产企业至调查审查破产企业前的工作',
    description: '阶段二',
    component: 'StageTwoProcess',
    tasks: [
      {
        id: 'propertyReceipt',
        name: '企业资产接管',
        completed: false,
        dueDate: '2023-02-10',
        apiId: 'propertyReceipt',
      },
      {
        id: 'emergency',
        name: '应急事项处理',
        completed: false,
        dueDate: '2023-02-15',
        apiId: 'emergency',
      },
      {
        id: 'propertyPlan',
        name: '财产管理方案',
        completed: false,
        dueDate: '2023-02-20',
        apiId: 'propertyPlan',
      },
      {
        id: 'personnelEmp',
        name: '员工安置方案',
        completed: false,
        dueDate: '2023-02-25',
        apiId: 'personnelEmp',
      },
      {
        id: 'internalAffairs',
        name: '内部事务管理',
        completed: false,
        dueDate: '2023-03-01',
        apiId: 'internalAffairs',
      },
      {
        id: 'businessManagement',
        name: '业务经营管理',
        completed: false,
        dueDate: '2023-03-05',
        apiId: 'businessManagement',
      },
    ],
  },
  {
    id: 3,
    title: '管理人调查审查破产企业至第一次债权人会议前工作',
    description: '阶段三',
    component: 'StageThreeProcess',
    tasks: [
      {
        id: 9,
        name: '财产调查',
        completed: false,
        dueDate: '2023-03-01',
        apiId: 'propertyInvestigation',
      },
      {
        id: 10,
        name: '银行费用',
        completed: false,
        dueDate: '2023-03-05',
        apiId: 'bankExpenses',
      },
      {
        id: 11,
        name: '权利主张',
        completed: false,
        dueDate: '2023-03-10',
        apiId: 'rightsClaim',
      },
      {
        id: 12,
        name: '回收审核',
        completed: false,
        dueDate: '2023-03-15',
        apiId: 'reclaimReview',
      },
      {
        id: 13,
        name: '诉讼仲裁',
        completed: false,
        dueDate: '2023-03-20',
        apiId: 'litigationArbitration',
      },
      {
        id: 14,
        name: '债权人申报',
        completed: false,
        dueDate: '2023-03-25',
        apiId: 'creditorClaim',
      },
      {
        id: 15,
        name: '职工债权',
        completed: false,
        dueDate: '2023-03-30',
        apiId: 'employeeClaims',
      },
      {
        id: 16,
        name: '社保费用表',
        completed: false,
        dueDate: '2023-04-05',
        apiId: 'socialSF',
      },
      {
        id: 17,
        name: '税收核定表',
        completed: false,
        dueDate: '2023-04-10',
        apiId: 'taxVerification',
      },
    ],
  },
  {
    id: 4,
    title: '第一次债权人会议至第二次债权人会议前工作',
    description: '阶段四',
    component: 'StageFourProcess',
    tasks: [
      {
        id: 18,
        name: '第一次债权人会议',
        completed: false,
        dueDate: '2023-03-20',
        apiId: 'session',
      },
      {
        id: 19,
        name: '会议文件',
        completed: false,
        dueDate: '2023-03-25',
        apiId: 'meetingDocuments',
      },
      {
        id: 20,
        name: '债权确认',
        completed: false,
        dueDate: '2023-03-30',
        apiId: 'claimConfirmation',
      },
      {
        id: 21,
        name: '重要行为',
        completed: false,
        dueDate: '2023-04-05',
        apiId: 'importantActions',
      },
      {
        id: 22,
        name: '抵销审核',
        completed: false,
        dueDate: '2023-04-10',
        apiId: 'setoffReview',
      },
      {
        id: 23,
        name: '审计报告',
        completed: false,
        dueDate: '2023-04-15',
        apiId: 'auditReport',
      },
    ],
  },
  {
    id: 5,
    title: '第二次债权人会议至破产程序终结工作',
    description: '阶段五',
    component: 'StageFiveProcess',
    tasks: [
      {
        id: 24,
        name: '资产价值评估',
        completed: false,
        dueDate: '2023-04-20',
        apiId: 'assetValuation',
      },
      {
        id: 25,
        name: '财产变价方案',
        completed: false,
        dueDate: '2023-04-25',
        apiId: 'propertyVPlan',
      },
      {
        id: 26,
        name: '破产宣告',
        completed: false,
        dueDate: '2023-04-30',
        apiId: 'bankruptcyDeclaration',
      },
      {
        id: 27,
        name: '财产分配方案',
        completed: false,
        dueDate: '2023-05-05',
        apiId: 'propertyVIM',
      },
    ],
  },
  {
    id: 6,
    title: '破产分配至终结前的工作',
    description: '阶段六',
    component: 'StageSixProcess',
    tasks: [
      { id: 18, name: '财产分配执行', completed: false, dueDate: '2023-04-20' },
      { id: 19, name: '分配报告编制', completed: false, dueDate: '2023-04-25' },
      { id: 20, name: '终结申请', completed: false, dueDate: '2023-04-30' },
    ],
  },
  {
    id: 7,
    title: '破产终结的工作',
    description: '阶段七',
    component: 'StageSevenProcess',
    tasks: [
      { id: 21, name: '终结裁定执行', completed: false, dueDate: '2023-05-05' },
      { id: 22, name: '档案整理归档', completed: false, dueDate: '2023-05-10' },
      { id: 23, name: '工作总结报告', completed: false, dueDate: '2023-05-15' },
    ],
  },
]);

// 计算属性
const currentStage = computed(() => {
  const stage = processStages.value[currentStageIndex.value];
  if (!stage) {
    console.warn(`阶段索引 ${currentStageIndex.value} 无效`);
    return processStages.value[0]; // 默认返回第一个阶段
  }
  return stage;
});

const currentStageProgress = computed(() => {
  if (!currentStage.value) return 0;
  const tasks = currentStage.value.tasks;
  const completedCount = tasks.filter((task) => task.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
});

// 方法
const getCaseStatusType = (status: string) => {
  const statusMap: Record<string, any> = {
    破产申请与受理: 'primary',
    债权申报核查与债权人会议: 'warning',
    资产处理: 'info',
    财产处置: 'warning',
    破产财产分配: 'success',
    程序终结与注销: 'success',
    复权程序: 'info',
    已结案: 'success',
  };
  return statusMap[status] || 'info';
};

// 同步StageTwoProcess组件中的任务状态
const syncTaskStatusFromStageTwo = async () => {
  try {
    // 导入StageTwoProcess组件使用的API
    const {
      getPropertyReceiptApi,
      getEmergencyApi,
      getPropertyPlanApi,
      getPersonnelEmpApi,
      getInternalAffairsApi,
      getBusinessManagementApi,
    } = await import('#/api/core/case-process');

    // 调用所有API获取任务状态
    const [
      propertyReceiptRes,
      emergencyRes,
      propertyPlanRes,
      personnelEmpRes,
      internalAffairsRes,
      businessManagementRes,
    ] = await Promise.allSettled([
      getPropertyReceiptApi(caseId.value),
      getEmergencyApi(caseId.value),
      getPropertyPlanApi(caseId.value),
      getPersonnelEmpApi(caseId.value),
      getInternalAffairsApi(caseId.value),
      getBusinessManagementApi(caseId.value),
    ]);

    // 更新阶段二的任务状态
    const stageTwo = processStages.value[1];
    if (stageTwo && stageTwo.tasks) {
      stageTwo.tasks.forEach((task) => {
        let apiResponse: any = null;

        // 根据任务ID获取对应的API响应
        switch ((task as any).apiId) {
          case 'businessManagement': {
            apiResponse =
              businessManagementRes.status === 'fulfilled'
                ? businessManagementRes.value
                : null;
            break;
          }
          case 'emergency': {
            apiResponse =
              emergencyRes.status === 'fulfilled' ? emergencyRes.value : null;
            break;
          }
          case 'internalAffairs': {
            apiResponse =
              internalAffairsRes.status === 'fulfilled'
                ? internalAffairsRes.value
                : null;
            break;
          }
          case 'personnelEmp': {
            apiResponse =
              personnelEmpRes.status === 'fulfilled'
                ? personnelEmpRes.value
                : null;
            break;
          }
          case 'propertyPlan': {
            apiResponse =
              propertyPlanRes.status === 'fulfilled'
                ? propertyPlanRes.value
                : null;
            break;
          }
          case 'propertyReceipt': {
            apiResponse =
              propertyReceiptRes.status === 'fulfilled'
                ? propertyReceiptRes.value
                : null;
            break;
          }
        }

        // 根据DQZT字段更新任务完成状态
        if (apiResponse && apiResponse.status === '1' && apiResponse.data) {
          const dqzt = apiResponse.data.DQZT;
          // 如果DQZT为'完成'或'跳过'，则标记任务为已完成
          task.completed = dqzt === '完成' || dqzt === '跳过';
        }
      });
    }
  } catch (error) {
    console.error('同步第二阶段任务状态失败:', error);
  }
};

// 同步StageOneProcess组件中的任务状态
const syncTaskStatusFromStageOne = async () => {
  try {
    // 导入StageOneProcess组件使用的API
    const {
      getWorkTeamApi,
      getWorkPlanApi,
      getManagementApi,
      getSealManagementApi,
      getLegalProcedureApi,
    } = await import('#/api/core/case-process');

    // 调用所有API获取任务状态
    const [
      workTeamRes,
      workPlanRes,
      managementRes,
      sealManagementRes,
      legalProcedureRes,
    ] = await Promise.allSettled([
      getWorkTeamApi(caseId.value),
      getWorkPlanApi(caseId.value),
      getManagementApi(caseId.value),
      getSealManagementApi(caseId.value),
      getLegalProcedureApi(caseId.value),
    ]);

    // 更新阶段一的任务状态
    const stageOne = processStages.value[0];
    if (stageOne && stageOne.tasks) {
      stageOne.tasks.forEach((task) => {
        let apiResponse: any = null;

        // 根据任务ID获取对应的API响应
        switch ((task as any).apiId) {
          case 'legalProcedure': {
            apiResponse =
              legalProcedureRes.status === 'fulfilled'
                ? legalProcedureRes.value
                : null;
            break;
          }
          case 'management': {
            apiResponse =
              managementRes.status === 'fulfilled' ? managementRes.value : null;
            break;
          }
          case 'sealManagement': {
            apiResponse =
              sealManagementRes.status === 'fulfilled'
                ? sealManagementRes.value
                : null;
            break;
          }
          case 'workPlan': {
            apiResponse =
              workPlanRes.status === 'fulfilled' ? workPlanRes.value : null;
            break;
          }
          case 'workTeam': {
            apiResponse =
              workTeamRes.status === 'fulfilled' ? workTeamRes.value : null;
            break;
          }
        }

        // 根据DQZT字段更新任务完成状态
        if (apiResponse && apiResponse.status === '1' && apiResponse.data) {
          const dqzt = apiResponse.data.DQZT;
          // 如果DQZT为'完成'或'跳过'，则标记任务为已完成
          task.completed = dqzt === '完成' || dqzt === '跳过';
        }
      });
    }
  } catch (error) {
    console.error('同步任务状态失败:', error);
  }
};

// 同步StageThreeProcess组件中的任务状态
const syncTaskStatusFromStageThree = async () => {
  try {
    // 定义API调用函数
    const callApi = async (apiUrl: string, token: string, caseId: string) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_GLOB_API_URL}${apiUrl}?token=${token}&GLAJBH=${caseId}&page=1&size=10`,
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`API调用失败 ${apiUrl}:`, error);
        return null;
      }
    };

    // 调用所有API获取任务状态
    const [
      propertyInvestigationRes,
      bankExpensesRes,
      rightsClaimRes,
      reclaimReviewRes,
      litigationArbitrationRes,
      creditorClaimRes,
      employeeClaimsRes,
      socialSFRes,
      taxVerificationRes,
    ] = await Promise.allSettled([
      callApi(
        '/api/web/getAllPropertyInvestigation',
        '17fce65ebabe3088ab45b97f77f91b5a',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllBankExpenses',
        'ff7185ba1adffaa6630ec57062ae6473',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllRightsClaim',
        '0ce8909084c3cd60a2e2f8ba450df13a',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllReclaimReview',
        'dcdc3c95faccd88d495c94923f8e2148',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllLitigationArbitration',
        '7adbf35a9986045cb55ce9e1d8d8b90c',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllCreditorClaim',
        '7fb219c01b0107dc5cb58d173ce87664',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllEmployeeClaims',
        '328c37a28705fdbc976bea5b128e68b4',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllSociaSF',
        'a8990ffa15ebbd2bff6aed37db08cadf',
        caseId.value,
      ),
      callApi(
        '/api/web/getAllTaxVerification',
        '59a21e973cc5a522c63b11c19a988d0b',
        caseId.value,
      ),
    ]);

    // 更新阶段三的任务状态
    const stageThree = processStages.value[2];
    if (stageThree && stageThree.tasks) {
      stageThree.tasks.forEach((task) => {
        let apiResponse: any = null;

        // 根据任务ID获取对应的API响应
        switch ((task as any).apiId) {
          case 'bankExpenses': {
            apiResponse =
              bankExpensesRes.status === 'fulfilled'
                ? bankExpensesRes.value
                : null;
            break;
          }
          case 'creditorClaim': {
            apiResponse =
              creditorClaimRes.status === 'fulfilled'
                ? creditorClaimRes.value
                : null;
            break;
          }
          case 'employeeClaims': {
            apiResponse =
              employeeClaimsRes.status === 'fulfilled'
                ? employeeClaimsRes.value
                : null;
            break;
          }
          case 'litigationArbitration': {
            apiResponse =
              litigationArbitrationRes.status === 'fulfilled'
                ? litigationArbitrationRes.value
                : null;
            break;
          }
          case 'propertyInvestigation': {
            apiResponse =
              propertyInvestigationRes.status === 'fulfilled'
                ? propertyInvestigationRes.value
                : null;
            break;
          }
          case 'reclaimReview': {
            apiResponse =
              reclaimReviewRes.status === 'fulfilled'
                ? reclaimReviewRes.value
                : null;
            break;
          }
          case 'rightsClaim': {
            apiResponse =
              rightsClaimRes.status === 'fulfilled'
                ? rightsClaimRes.value
                : null;
            break;
          }
          case 'socialSF': {
            apiResponse =
              socialSFRes.status === 'fulfilled' ? socialSFRes.value : null;
            break;
          }
          case 'taxVerification': {
            apiResponse =
              taxVerificationRes.status === 'fulfilled'
                ? taxVerificationRes.value
                : null;
            break;
          }
        }

        // 根据DQZT字段更新任务完成状态
        if (
          apiResponse &&
          apiResponse.status === '1' &&
          apiResponse.data?.records?.length > 0
        ) {
          const dqzt = apiResponse.data.records[0].DQZT;
          // 如果DQZT为'完成'或'跳过'，则标记任务为已完成
          task.completed = dqzt === '完成' || dqzt === '跳过';
        }
      });
    }
  } catch (error) {
    console.error('同步第三阶段任务状态失败:', error);
  }
};

// 处理StageOneProcess和StageTwoProcess组件状态变更事件
const handleTaskStatusChanged = (taskId: number | string, status: string) => {
  // 检查阶段一的任务
  const stageOne = processStages.value[0];
  if (stageOne && stageOne.tasks) {
    const taskOne = stageOne.tasks.find((t) => (t as any).apiId === taskId);
    if (taskOne) {
      // 根据状态更新完成状态
      taskOne.completed = status === '完成' || status === '跳过';

      // 显示状态变更提示
      const statusText = status === '跳过' ? '已跳过' : '已重置';
      ElMessage.success(`任务"${taskOne.name}"${statusText}`);
      return;
    }
  }

  // 检查阶段二的任务
  const stageTwo = processStages.value[1];
  if (stageTwo && stageTwo.tasks) {
    const taskTwo = stageTwo.tasks.find((t) => (t as any).apiId === taskId);
    if (taskTwo) {
      // 根据状态更新完成状态
      taskTwo.completed = status === '完成' || status === '跳过';

      // 显示状态变更提示
      const statusText = status === '跳过' ? '已跳过' : '已重置';
      ElMessage.success(`任务"${taskTwo.name}"${statusText}`);
      return;
    }
  }

  // 检查阶段三的任务
  const stageThree = processStages.value[2];
  if (stageThree && stageThree.tasks) {
    const taskThree = stageThree.tasks.find((t) => (t as any).apiId === taskId);
    if (taskThree) {
      // 根据状态更新完成状态
      taskThree.completed = status === '完成' || status === '跳过';

      // 显示状态变更提示
      let statusText = '已重置';
      if (status === '跳过') {
        statusText = '已跳过';
      } else if (status === '完成') {
        statusText = '已完成';
      }
      ElMessage.success(`任务"${taskThree.name}"${statusText}`);
      return;
    }
  }

  // 检查阶段四的任务
  const stageFour = processStages.value[3];
  if (stageFour && stageFour.tasks) {
    const taskFour = stageFour.tasks.find((t) => (t as any).apiId === taskId);
    if (taskFour) {
      // 根据状态更新完成状态
      taskFour.completed = status === '完成' || status === '跳过';

      // 显示状态变更提示
      let statusText = '已重置';
      if (status === '跳过') {
        statusText = '已跳过';
      } else if (status === '完成') {
        statusText = '已完成';
      }
      ElMessage.success(`任务"${taskFour.name}"${statusText}`);
      return;
    }
  }

  // 检查阶段五的任务
  const stageFive = processStages.value[4];
  if (stageFive && stageFive.tasks) {
    const taskFive = stageFive.tasks.find((t) => (t as any).apiId === taskId);
    if (taskFive) {
      // 根据状态更新完成状态
      taskFive.completed = status === '完成' || status === '跳过';

      // 显示状态变更提示
      let statusText = '已重置';
      if (status === '跳过') {
        statusText = '已跳过';
      } else if (status === '完成') {
        statusText = '已完成';
      }
      ElMessage.success(`任务"${taskFive.name}"${statusText}`);
    }
  }
};

// 阶段二到阶段七的任务状态同步方法
const syncStageTasks = (stageIndex: number) => {
  const stage = processStages.value[stageIndex];
  if (!stage || !stage.tasks) return;

  // 对于阶段二到阶段七，使用本地存储来同步状态
  const storageKey = `case_${caseId.value}_stage_${stageIndex}_tasks`;

  try {
    // 尝试从localStorage读取已保存的任务状态
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);

      // 更新任务状态
      stage.tasks.forEach((task, index) => {
        if (parsedTasks[index]) {
          task.completed = parsedTasks[index].completed;
        }
      });
    }
  } catch (error) {
    console.warn(`读取阶段${stageIndex + 1}任务状态失败:`, error);
  }
};

// 保存阶段二到阶段七的任务状态
const saveStageTasks = (stageIndex: number) => {
  const stage = processStages.value[stageIndex];
  if (!stage || !stage.tasks) return;

  const storageKey = `case_${caseId.value}_stage_${stageIndex}_tasks`;

  try {
    // 保存任务状态到localStorage
    const tasksToSave = stage.tasks.map((task) => ({
      id: task.id,
      name: task.name,
      completed: task.completed,
      dueDate: task.dueDate,
    }));

    localStorage.setItem(storageKey, JSON.stringify(tasksToSave));
  } catch (error) {
    console.warn(`保存阶段${stageIndex + 1}任务状态失败:`, error);
  }
};

// 处理阶段二到阶段七的任务状态变更
const handleStageTaskChange = (
  stageIndex: number,
  taskId: number | string,
  completed: boolean,
) => {
  if (stageIndex === 0) {
    // 阶段一已经通过事件机制处理
    return;
  }

  const stage = processStages.value[stageIndex];
  if (!stage || !stage.tasks) return;

  const task = stage.tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = completed;

    // 保存状态到本地存储
    saveStageTasks(stageIndex);

    // 显示状态变更提示
    const statusText = completed ? '已完成' : '未完成';
    ElMessage.success(`任务"${task.name}"${statusText}`);
  }
};

const getProgressStatus = (percentage: number) => {
  if (percentage >= 100) return 'success';
  if (percentage >= 80) return 'warning';
  return 'exception';
};

const switchStage = async (index: number) => {
  currentStageIndex.value = index;

  // 根据不同的阶段调用相应的同步函数
  switch (index) {
    case 0: {
      // 切换到阶段一，同步任务状态
      await syncTaskStatusFromStageOne();

      break;
    }
    case 1: {
      // 切换到阶段二，同步任务状态
      await syncTaskStatusFromStageTwo();

      break;
    }
    case 2: {
      // 切换到阶段三，同步任务状态
      await syncTaskStatusFromStageThree();

      break;
    }
    default: {
      // 如果切换到阶段四到阶段七，同步本地存储的任务状态
      syncStageTasks(index);
    }
  }
};

// 删除未使用的updateTaskProgress函数
// const updateTaskProgress = (task: any) => {
//   if (!task) {
//     console.warn('任务对象为空');
//     return;
//   }
//
//   ElMessage.success(`任务"${task.name || '未知任务'}"状态已更新`);
// };

// 删除未使用的handleCheckboxChange函数
// const handleCheckboxChange = (task: any) => {
//   if (!task) {
//     console.warn('任务对象为空');
//     return;
//   }
//
//   // 切换任务完成状态
//   task.completed = !task.completed;
//   updateTaskProgress(task);
// };

const goBack = () => {
  router.back();
};

// 生命周期
onMounted(async () => {
  loading.value = true;
  try {
    // 调用真实API获取案件详情
    const response = await getCaseDetailApi(caseId.value);

    // 使用类型断言处理响应数据
    const responseData = response as any;

    // 检查API响应结构
    // API响应数据: responseData

    if (responseData.status === '1' || responseData.data?.status === '1') {
      // 根据不同的响应结构获取数据
      const caseData = responseData.data?.data || responseData.data;

      if (caseData) {
        caseDetail.value = caseData;
        ElMessage.success('案件详情加载成功');
      } else {
        throw new Error('API返回的数据结构异常');
      }
    } else {
      const errorMsg =
        responseData.error || responseData.data?.error || '未知错误';
      ElMessage.error(`获取案件详情失败：${errorMsg}`);

      // 如果API调用失败，使用虚拟数据作为备用
      caseDetail.value = {
        案件ID: caseId.value || 'AJ2023001',
        案号: '(2023)破字第001号',
        案件名称: '某某公司破产清算案',
        受理日期: '2023-01-15',
        案件来源: '债权人申请',
        受理法院: '某某市中级人民法院',
        管理人负责人: '李经理',
        承办法官: '张法官',
        案由: '破产清算',
        债权申报截止时间: '2023-03-15',
        是否简化审: '否',
        案件进度: '审理中',
        // 新增债务人信息
        债务人: '某某公司',
        法定代表人: '王某某',
        注册地址: '某某市某某区某某路123号',
        注册资本: '1000万',
        // 新增债权人信息
        债权人名称: '某某银行股份有限公司',
        债权人类型: '金融机构',
        // 新增法院相关信息
        会议庭成员: '张法官、李法官、王法官',
        受理庭室: '破产审判庭',
        // 新增案件状态信息
        立案日期: '2023-01-10',
        破产时间: '2023-01-20',
        归档时间: '',
        注销时间: '',
        // 新增管理人信息
        管理人类型: '律师事务所',
        管理人联系方式: '13800138000',
      };
    }
  } catch (error) {
    console.error('获取案件详情失败:', error);
    ElMessage.error('获取案件详情失败，使用虚拟数据');

    // 如果API调用失败，使用虚拟数据作为备用
    caseDetail.value = {
      案件ID: caseId.value || 'AJ2023001',
      案号: '(2023)破字第001号',
      案件名称: '某某公司破产清算案',
      受理日期: '2023-01-15',
      案件来源: '债权人申请',
      受理法院: '某某市中级人民法院',
      管理人负责人: '李经理',
      承办法官: '张法官',
      案由: '破产清算',
      债权申报截止时间: '2023-03-15',
      是否简化审: '否',
      案件进度: '审理中',
      // 新增债务人信息
      债务人: '某某公司',
      法定代表人: '王某某',
      注册地址: '某某市某某区某某路123号',
      注册资本: '1000万',
      // 新增债权人信息
      债权人名称: '某某银行股份有限公司',
      债权人类型: '金融机构',
      // 新增法院相关信息
      会议庭成员: '张法官、李法官、王法官',
      受理庭室: '破产审判庭',
      // 新增案件状态信息
      立案日期: '2023-01-10',
      破产时间: '2023-01-20',
      归档时间: '',
      注销时间: '',
      // 新增管理人信息
      管理人类型: '律师事务所',
      管理人联系方式: '13800138000',
    };
  } finally {
    loading.value = false;

    // 加载完成后同步阶段一的任务状态
    if (currentStageIndex.value === 0) {
      await syncTaskStatusFromStageOne();
    }
  }
});
</script>

<template>
  <div class="case-detail-container">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <ElButton type="primary" link @click="goBack">
        <Icon icon="lucide:arrow-left" class="mr-2" />
        返回案件列表
      </ElButton>
      <h1 class="page-title">案件详情</h1>
    </div>

    <!-- 案件基本信息卡片 -->
    <ElCard class="case-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:file-text" class="mr-2 text-blue-500" />
          <span class="text-lg font-semibold">案件基本信息</span>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <ElSkeleton :rows="5" animated />
      </div>

      <div v-else-if="caseDetail" class="case-info-content">
        <!-- 关键信息概览 -->
        <div class="key-info-overview mb-6">
          <ElRow :gutter="20">
            <ElCol :xs="24" :sm="8" :md="6">
              <div class="key-info-item rounded-lg bg-blue-50 p-4 text-center">
                <div class="key-info-label mb-1 text-sm text-gray-500">
                  案件ID
                </div>
                <div class="key-info-value text-xl font-bold text-blue-600">
                  {{ caseDetail.案件ID }}
                </div>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="8" :md="6">
              <div class="key-info-item rounded-lg bg-green-50 p-4 text-center">
                <div class="key-info-label mb-1 text-sm text-gray-500">
                  案号
                </div>
                <div class="key-info-value text-xl font-bold text-green-600">
                  {{ caseDetail.案号 }}
                </div>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="8" :md="6">
              <div
                class="key-info-item rounded-lg bg-purple-50 p-4 text-center"
              >
                <div class="key-info-label mb-1 text-sm text-gray-500">
                  案件进度
                </div>
                <div class="key-info-value">
                  <ElTag
                    :type="getCaseStatusType(caseDetail.案件进度)"
                    size="large"
                    class="text-black"
                  >
                    {{ caseDetail.案件进度 }}
                  </ElTag>
                </div>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="8" :md="6">
              <div
                class="key-info-item rounded-lg bg-orange-50 p-4 text-center"
              >
                <div class="key-info-label mb-1 text-sm text-gray-500">
                  受理法院
                </div>
                <div
                  class="key-info-value text-lg font-semibold text-orange-600"
                >
                  {{ caseDetail.受理法院 }}
                </div>
              </div>
            </ElCol>
          </ElRow>
        </div>

        <!-- 详细信息网格 -->
        <div class="detail-info-grid">
          <ElRow :gutter="20">
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  案件名称：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.案件名称 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  受理日期：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.受理日期 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  案件来源：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.案件来源 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  管理人负责人：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.管理人负责人 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  承办法官：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.承办法官 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  案由：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.案由 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  债权申报截止时间：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.债权申报截止时间 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  是否简化审：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.是否简化审 }}
                </span>
              </div>
            </ElCol>
            <!-- 新增债务人信息 -->
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  债务人：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.债务人 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  法定代表人：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.法定代表人 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  注册地址：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.注册地址 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  注册资本：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.注册资本 }}
                </span>
              </div>
            </ElCol>
            <!-- 新增债权人信息 -->
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  债权人名称：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.债权人名称 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  债权人类型：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.债权人类型 }}
                </span>
              </div>
            </ElCol>
            <!-- 新增法院相关信息 -->
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  会议庭成员：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.会议庭成员 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  受理庭室：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.受理庭室 }}
                </span>
              </div>
            </ElCol>
            <!-- 新增案件状态信息 -->
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  立案日期：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.立案日期 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  破产时间：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.破产时间 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  归档时间：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.归档时间 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  注销时间：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.注销时间 }}
                </span>
              </div>
            </ElCol>
            <!-- 新增管理人信息 -->
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  管理人类型：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.管理人类型 }}
                </span>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="12" :md="8" :lg="6">
              <div
                class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
              >
                <span class="detail-info-label font-medium text-gray-600">
                  管理人联系方式：
                </span>
                <span class="detail-info-value text-gray-900">
                  {{ caseDetail.管理人联系方式 }}
                </span>
              </div>
            </ElCol>
          </ElRow>
        </div>
      </div>

      <div v-else class="error-container">
        <ElEmpty description="案件信息加载失败" />
      </div>
    </ElCard>

    <!-- 破产流程阶段视图 -->
    <ElCard class="process-stage-card" shadow="never">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>破产流程阶段</span>
        </div>
      </template>

      <!-- 阶段导航 -->
      <div class="stage-navigation mb-6">
        <!-- 阶段标题和进度 -->
        <div class="stage-header mb-4">
          <h3 class="mb-2 text-xl font-semibold text-gray-800">
            {{ currentStage?.description }}：{{ currentStage?.title }}
          </h3>
          <div class="stage-progress-info flex items-center justify-between">
            <span class="text-sm text-gray-600">
              当前阶段：{{ currentStageIndex + 1 }}/{{ processStages.length }}
            </span>
            <span class="text-sm text-gray-600">
              任务完成：{{
                currentStage?.tasks?.filter((t) => t.completed).length || 0
              }}/{{ currentStage?.tasks?.length || 0 }}
            </span>
          </div>
        </div>

        <!-- 导航控制 -->
        <div class="navigation-controls flex items-center justify-between">
          <ElButton
            :disabled="currentStageIndex === 0"
            @click="switchStage(currentStageIndex - 1)"
            type="primary"
            :icon="Icon"
          >
            <Icon icon="lucide:chevron-left" class="mr-1" />
            上一阶段
          </ElButton>

          <!-- 阶段指示器 -->
          <div class="stage-indicators flex space-x-3">
            <div
              v-for="(stage, index) in processStages"
              :key="stage.id"
              @click="switchStage(index)"
              class="stage-indicator-item cursor-pointer text-center transition-all"
              :class="[
                index === currentStageIndex
                  ? 'font-semibold text-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              <div
                class="stage-dot mx-auto mb-1 h-3 w-3 rounded-full transition-all"
                :class="[
                  index === currentStageIndex
                    ? 'scale-125 bg-blue-500'
                    : 'bg-gray-300 hover:bg-gray-400',
                ]"
              ></div>
              <span class="text-xs">{{ stage.description }}</span>
            </div>
          </div>

          <ElButton
            :disabled="currentStageIndex === processStages.length - 1"
            @click="switchStage(currentStageIndex + 1)"
            type="primary"
            :icon="Icon"
          >
            下一阶段
            <Icon icon="lucide:chevron-right" class="ml-1" />
          </ElButton>
        </div>
      </div>

      <!-- 当前阶段进度 -->
      <div class="current-stage-progress">
        <div class="progress-header">
          <h3>{{ currentStage?.title }}</h3>
          <ElProgress
            :percentage="currentStageProgress"
            :status="getProgressStatus(currentStageProgress)"
            :stroke-width="8"
          />
          <div class="progress-text">
            当前阶段完成度：{{ currentStageProgress }}%
          </div>
        </div>

        <!-- 阶段任务列表 - 简化版 -->
        <div class="stage-tasks-simple">
          <h4 class="mb-3 text-sm font-medium text-gray-700">阶段任务状态</h4>
          <div class="task-list-simple">
            <div
              v-for="task in currentStage?.tasks || []"
              :key="task.id"
              class="task-item-simple"
              :class="task.completed ? 'completed' : 'pending'"
            >
              <div class="task-checkbox">
                <Icon
                  :icon="
                    task.completed ? 'lucide:check-circle' : 'lucide:circle'
                  "
                  :class="task.completed ? 'text-green-500' : 'text-gray-400'"
                  class="text-lg"
                />
              </div>
              <div class="task-info-simple">
                <span class="task-name-simple">{{ task.name }}</span>
                <span
                  class="task-status-simple"
                  :class="task.completed ? 'text-green-600' : 'text-gray-500'"
                >
                  {{ task.completed ? '已完成' : '未完成' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 动态阶段流程组件 -->
    <StageOneProcess
      :case-id="caseId"
      v-if="currentStageIndex === 0"
      @task-status-changed="handleTaskStatusChanged"
    />

    <StageTwoProcess
      :case-id="caseId"
      v-else-if="currentStageIndex === 1"
      @task-status-changed="handleTaskStatusChanged"
    />

    <StageThreeProcess
      :case-id="caseId"
      v-else-if="currentStageIndex === 2"
      @task-status-changed="handleTaskStatusChanged"
    />

    <StageFourProcess
      :case-id="caseId"
      v-else-if="currentStageIndex === 3"
      @task-status-changed="handleTaskStatusChanged"
    />

    <StageFiveProcess
      :case-id="caseId"
      v-else-if="currentStageIndex === 4"
      @task-status-changed="handleTaskStatusChanged"
    />

    <!-- 其他阶段占位组件（待创建） -->
    <div v-else class="stage-placeholder">
      <ElCard shadow="hover">
        <template #header>
          <div class="card-header">
            <Icon icon="lucide:construction" class="mr-2" />
            <span>{{ currentStage?.title || '未知阶段' }}</span>
          </div>
        </template>
        <div class="placeholder-content">
          <Icon icon="lucide:wrench" class="mb-4 text-4xl text-gray-400" />
          <h3 class="mb-2 text-lg font-semibold text-gray-600">
            阶段组件开发中
          </h3>
          <p class="text-gray-500">该阶段的详细功能组件正在开发中...</p>

          <!-- 显示当前阶段的静态任务列表 -->
          <div class="static-tasks mt-6" v-if="currentStage?.tasks">
            <h4 class="text-md mb-3 font-semibold text-gray-700">
              阶段任务列表
            </h4>
            <div class="task-grid">
              <div
                v-for="task in currentStage.tasks"
                :key="task.id"
                class="task-item mb-2 rounded-md border border-gray-200 p-3"
                :class="
                  task.completed ? 'border-green-200 bg-green-50' : 'bg-white'
                "
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <!-- 任务完成状态切换按钮 -->
                    <button
                      @click="
                        handleStageTaskChange(
                          currentStageIndex,
                          task.id,
                          !task.completed,
                        )
                      "
                      class="mr-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all"
                      :class="
                        task.completed
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 hover:border-green-400'
                      "
                    >
                      <Icon
                        v-if="task.completed"
                        icon="lucide:check"
                        class="h-3 w-3 text-white"
                      />
                    </button>
                    <span class="font-medium">{{ task.name }}</span>
                  </div>
                  <ElTag
                    :type="task.completed ? 'success' : 'info'"
                    size="small"
                  >
                    {{ task.completed ? '已完成' : '未完成' }}
                  </ElTag>
                </div>
                <div class="mt-1 text-sm text-gray-500">
                  截止日期：{{ task.dueDate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.case-detail-container {
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

.case-info-card,
.process-stage-card {
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

.key-info-overview {
  margin-bottom: 24px;
}

.key-info-item {
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background: #ffffff;
}

.key-info-item:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
  background: #f9fafb;
}

.detail-info-grid {
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.detail-info-item {
  transition: background-color 0.2s ease;
  background: #ffffff;
}

.detail-info-item:hover {
  background-color: #f8fafc;
}

.detail-info-label {
  min-width: 120px;
  color: #6b7280;
  font-weight: 500;
}

.detail-info-value {
  text-align: right;
  word-break: break-all;
  color: #1f2937;
  font-weight: 400;
}

.loading-container {
  padding: 20px;
  background: #ffffff;
}

.error-container {
  padding: 40px 20px;
  background: #ffffff;
}

.stage-navigation {
  margin-bottom: 32px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stage-header {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 16px;
}

.navigation-controls {
  margin-top: 16px;
}

.stage-indicators {
  flex: 1;
  justify-content: center;
  margin: 0 20px;
}

.stage-indicator-item {
  min-width: 60px;
  transition: all 0.3s ease;
}

.stage-indicator-item:hover {
  transform: translateY(-2px);
}

.stage-dot {
  transition: all 0.3s ease;
}

.current-stage-progress {
  background: #f8fafc;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.progress-header {
  margin-bottom: 24px;
}

.progress-header h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
}

.stage-tasks h4 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.task-table {
  background: transparent;
}

.task-table :deep(.el-table__row) {
  background: transparent;
}

.task-table :deep(.el-table__cell) {
  background: transparent;
  color: #1f2937;
}

.task-due-date {
  color: #6b7280;
  font-size: 12px;
  font-weight: 400;
}

/* 简化版阶段任务样式 */
.stage-tasks-simple {
  margin-top: 16px;
}

.task-list-simple {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item-simple {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.task-item-simple:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-item-simple.completed {
  background: #f0fdf4;
  border-color: #10b981;
}

.task-item-simple.pending {
  background: #f8fafc;
}

.task-checkbox {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

.task-info-simple {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-name-simple {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.task-status-simple {
  font-size: 12px;
  font-weight: 500;
}

/* 阶段占位组件样式 */
.stage-placeholder {
  margin-top: 24px;
}

.stage-placeholder .placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

/* 确保所有文本都有足够的对比度 */
:deep(.el-card__body) {
  color: #1f2937;
}

:deep(.el-table) {
  color: #1f2937;
}

:deep(.el-tag) {
  color: #ffffff;
}

@media (max-width: 768px) {
  .case-detail-container {
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
}
</style>
