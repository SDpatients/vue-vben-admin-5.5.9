<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElEmpty,
  ElInput,
  ElMessage,
  ElRow,
  ElSkeleton,
} from 'element-plus';

import { getCaseDetailApi, updateCaseApi } from '#/api/core/case';
import {
  deleteAnnouncementApi,
  getAnnouncementListApi,
  publishAnnouncementApi,
  revokeAnnouncementApi,
  updateAnnouncementApi,
} from '#/api/core/case-announcement';

import FileUploader from '../../../components/FileUploader.vue';
import RichTextEditor from '../../../components/RichTextEditor.vue';
import StageFiveProcess from './components/StageFiveProcess.vue';
import StageFourProcess from './components/StageFourProcess.vue';
import StageOneProcess from './components/StageOneProcess.vue';
import StageSevenProcess from './components/StageSevenProcess.vue';
import StageSixProcess from './components/StageSixProcess.vue';
import StageThreeProcess from './components/StageThreeProcess.vue';
import StageTwoProcess from './components/StageTwoProcess.vue';

// 路由和状态管理
const route = useRoute();
const router = useRouter();
const caseId = ref(route.params.id as string);
const loading = ref(false);
const caseDetail = ref<any>(null);
const isInfoCollapsed = ref(true);
const isEditing = ref(false);
const editedData = reactive<any>({});
const saveLoading = ref(false);

// 当前选中的阶段索引
const currentStageIndex = ref(0);

// 页面内容类型切换
const activeTab = ref('caseInfo'); // caseInfo: 案件基本信息, process: 流程处理, announcement: 公告管理

// 公告管理相关
const announcementData = reactive({
  title: '',
  content: '',
  announcement_type: 'NORMAL',
  is_top: false,
  top_expire_time: '',
  attachments: [],
});

const announcements = ref<any[]>([]);
const totalAnnouncements = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loadingAnnouncements = ref(false);
const showAnnouncementDialog = ref(false);
const isEditingAnnouncement = ref(false);
const currentAnnouncementId = ref<null | string>(null);
const dialogTitle = ref('发布新公告');

// 从后端获取公告列表
const fetchAnnouncements = async () => {
  loadingAnnouncements.value = true;
  try {
    const response = await getAnnouncementListApi(
      caseId.value,
      currentPage.value,
      pageSize.value,
    );
    if (response.status === '1') {
      announcements.value = response.data.records || [];
      totalAnnouncements.value = response.data.count || 0;
    } else {
      ElMessage.error(`获取公告列表失败：${response.error || '未知错误'}`);
      announcements.value = [];
      totalAnnouncements.value = 0;
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
    announcements.value = [];
    totalAnnouncements.value = 0;
  } finally {
    loadingAnnouncements.value = false;
  }
};

// 保存公告
const saveAnnouncement = async () => {
  try {
    let response;

    // 添加调试日志
    console.log('=== 保存公告调试信息 ===');
    console.log('1. 函数开始，响应式变量值:');
    console.log('   isEditingAnnouncement.value:', isEditingAnnouncement.value);
    console.log('   currentAnnouncementId.value:', currentAnnouncementId.value);
    console.log('   announcementData:', announcementData);

    // 在条件判断之前保存编辑状态和当前公告ID
    const isEditing = isEditingAnnouncement.value;
    const announcementId = currentAnnouncementId.value;

    console.log('2. 保存到本地变量后的值:');
    console.log('   isEditing:', isEditing);
    console.log('   announcementId:', announcementId);

    console.log('3. 条件判断结果:');
    console.log('   isEditing && announcementId:', isEditing && announcementId);

    if (isEditing && announcementId) {
      console.log('4. 进入更新公告分支');
      // 更新现有公告
      response = await updateAnnouncementApi(announcementId, announcementData);
      console.log('5. updateAnnouncementApi 响应:', response);
      if (response.status === '1') {
        ElMessage.success('公告更新成功');
        await fetchAnnouncements();
        closeAnnouncementDialog();
      } else {
        ElMessage.error(`公告更新失败：${response.error || '未知错误'}`);
      }
    } else {
      console.log('4. 进入发布新公告分支');
      // 发布新公告
      response = await publishAnnouncementApi(caseId.value, announcementData);
      console.log('5. publishAnnouncementApi 响应:', response);
      if (response.status === '1') {
        ElMessage.success('公告发布成功');
        await fetchAnnouncements();
        closeAnnouncementDialog();
      } else {
        ElMessage.error(`公告发布失败：${response.error || '未知错误'}`);
      }
    }
  } catch (error) {
    console.error('保存公告失败:', error);
    ElMessage.error('保存公告失败');
  }
};

// 发布公告
const publishAnnouncement = async (announcementId: string) => {
  try {
    // 由于我们没有直接的发布API，我们可以跳转到编辑页面让用户修改状态
    // 或者使用updateAnnouncementApi更新状态
    ElMessage.info('请使用编辑功能修改公告状态');
  } catch (error) {
    console.error('发布公告失败:', error);
    ElMessage.error('发布公告失败');
  }
};

// 撤销公告
const revokeAnnouncement = async (announcementId: string) => {
  try {
    const response = await revokeAnnouncementApi(announcementId);
    if (response.status === '1') {
      ElMessage.success('公告撤销成功');
      await fetchAnnouncements();
    } else {
      ElMessage.error(`公告撤销失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('撤销公告失败:', error);
    ElMessage.error('撤销公告失败');
  }
};

// 删除公告
const deleteAnnouncement = async (announcementId: string) => {
  try {
    const response = await deleteAnnouncementApi(announcementId);
    if (response.status === '1') {
      ElMessage.success('公告删除成功');
      await fetchAnnouncements();
    } else {
      ElMessage.error(`公告删除失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除公告失败:', error);
    ElMessage.error('删除公告失败');
  }
};

// 编辑公告
const editAnnouncement = (announcement: any) => {
  console.log('=== 编辑公告调试信息 ===');
  console.log('公告对象:', announcement);

  isEditingAnnouncement.value = true;

  // 检查公告对象的ID字段，可能是id或announcement_id
  const announcementId =
    announcement.id ||
    announcement.announcement_id ||
    announcement.announcementId;
  console.log('提取到的公告ID:', announcementId);

  currentAnnouncementId.value = announcementId;
  dialogTitle.value = '编辑公告';
  announcementData.title = announcement.title;
  announcementData.content = announcement.content;
  announcementData.announcement_type =
    announcement.announcement_type || 'NORMAL';
  announcementData.is_top = Boolean(announcement.is_top);
  announcementData.top_expire_time = announcement.top_expire_time || '';
  announcementData.attachments = announcement.attachments || [];
  showAnnouncementDialog.value = true;
};

// 打开新增公告对话框
const openNewAnnouncementDialog = () => {
  isEditingAnnouncement.value = false;
  currentAnnouncementId.value = null;
  dialogTitle.value = '发布新公告';
  resetAnnouncement();
  showAnnouncementDialog.value = true;
};

// 关闭公告对话框
const closeAnnouncementDialog = () => {
  showAnnouncementDialog.value = false;
  resetAnnouncement();
};

// 重置公告表单
const resetAnnouncement = () => {
  // 重置表单数据
  announcementData.title = '';
  announcementData.content = '';
  announcementData.announcement_type = 'NORMAL';
  announcementData.is_top = false;
  announcementData.top_expire_time = '';
  announcementData.attachments = [];
  // 重置编辑状态
  isEditingAnnouncement.value = false;
  currentAnnouncementId.value = null;
};

// 监听分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchAnnouncements();
};

// 监听页面大小变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchAnnouncements();
};

// 当切换到公告管理标签页时，自动加载公告列表
watch(activeTab, (newTab) => {
  if (newTab === 'announcement') {
    fetchAnnouncements();
  }
});

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
    title: '破产财产分配方案等相关工作',
    description: '阶段六',
    component: 'StageSixProcess',
    tasks: [
      {
        id: 18,
        name: '破产财产分配方案',
        completed: false,
        dueDate: '2023-04-20',
        apiId: 'bankruptcyDistPlan',
      },
      {
        id: 19,
        name: '员工安置方案',
        completed: false,
        dueDate: '2023-04-25',
        apiId: 'employeeSPlan',
      },
      {
        id: 20,
        name: '优先受偿权',
        completed: false,
        dueDate: '2023-04-30',
        apiId: 'priorityPayment',
      },
      {
        id: 21,
        name: '财产状况说明',
        completed: false,
        dueDate: '2023-05-05',
        apiId: 'propertyDEC',
      },
      {
        id: 22,
        name: '存款管理',
        completed: false,
        dueDate: '2023-05-10',
        apiId: 'depositManagement',
      },
    ],
  },
  {
    id: 7,
    title: '债权人会议决议等相关工作',
    description: '阶段七',
    component: 'StageSevenProcess',
    tasks: [
      {
        id: 23,
        name: '债权人会议决议',
        completed: false,
        dueDate: '2023-05-15',
        apiId: 'canRR',
      },
      {
        id: 24,
        name: '终止诉讼',
        completed: false,
        dueDate: '2023-05-20',
        apiId: 'terminationLiti',
      },
      {
        id: 25,
        name: '追加分配',
        completed: false,
        dueDate: '2023-05-25',
        apiId: 'additionalDisiribution',
      },
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

// 方法
const getCaseStatusStyle = (status: string) => {
  const colorMap: Record<string, any> = {
    破产申请与受理: { backgroundColor: '#409EFF', color: '#000000' },
    债权申报核查与债权人会议: { backgroundColor: '#E6A23C', color: '#000000' },
    资产处理: { backgroundColor: '#909399', color: '#000000' },
    财产处置: { backgroundColor: '#F56C6C', color: '#000000' },
    破产财产分配: { backgroundColor: '#67C23A', color: '#000000' },
    程序终结与注销: { backgroundColor: '#8590A6', color: '#000000' },
    复权程序: { backgroundColor: '#722ED1', color: '#000000' },
    已结案: { backgroundColor: '#13C2C2', color: '#000000' },
  };
  return colorMap[status] || { backgroundColor: '#909399', color: '#000000' };
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

        if (apiResponse && apiResponse.status === '1' && apiResponse.data) {
          const paras = apiResponse.data.paras;
          const zt0Count = Number.parseInt(paras?.zt0_count || '0', 10);
          const zt1Count = Number.parseInt(paras?.zt1_count || '0', 10);
          const zt2Count = Number.parseInt(paras?.zt2_count || '0', 10);

          if (zt0Count === 0 && zt1Count > 0 && zt2Count === 0) {
            task.completed = true;
          } else if (zt0Count === 0 && zt2Count > 0) {
            task.completed = true;
          }
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

    // 调用所有API获取任务状态，传递page和size参数
    const [
      workTeamRes,
      workPlanRes,
      managementRes,
      sealManagementRes,
      legalProcedureRes,
    ] = await Promise.allSettled([
      getWorkTeamApi(caseId.value, 1, 10),
      getWorkPlanApi(caseId.value, 1, 10),
      getManagementApi(caseId.value, 1, 10),
      getSealManagementApi(caseId.value, 1, 10),
      getLegalProcedureApi(caseId.value, 1, 10),
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

        if (apiResponse && apiResponse.status === '1' && apiResponse.data) {
          const paras = apiResponse.data.paras;
          const zt0Count = Number.parseInt(paras?.zt0_count || '0', 10);
          const zt1Count = Number.parseInt(paras?.zt1_count || '0', 10);
          const zt2Count = Number.parseInt(paras?.zt2_count || '0', 10);

          if (zt0Count === 0 && zt1Count > 0 && zt2Count === 0) {
            task.completed = true;
          } else if (zt0Count === 0 && zt2Count > 0) {
            task.completed = true;
          }
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
          `${import.meta.env.VITE_GLOB_API_URL}${apiUrl}?token=${token}&SEP_ID=${caseId}&page=1&size=10`,
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

        if (
          apiResponse &&
          apiResponse.status === '1' &&
          apiResponse.data?.records?.length > 0
        ) {
          const paras = apiResponse.data.paras;
          const zt0Count = Number.parseInt(paras?.zt0_count || '0', 10);
          const zt1Count = Number.parseInt(paras?.zt1_count || '0', 10);
          const zt2Count = Number.parseInt(paras?.zt2_count || '0', 10);

          if (zt0Count === 0 && zt1Count > 0 && zt2Count === 0) {
            task.completed = true;
          } else if (zt0Count === 0 && zt2Count > 0) {
            task.completed = true;
          }
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
    case 5: {
      // 切换到阶段六，同步任务状态
      await syncTaskStatusFromStageSix();

      break;
    }
    case 6: {
      // 切换到阶段七，同步任务状态
      await syncTaskStatusFromStageSeven();

      break;
    }
    default: {
      // 如果切换到阶段四到阶段五，同步本地存储的任务状态
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

// 同步StageSixProcess组件中的任务状态
const syncTaskStatusFromStageSix = async () => {
  try {
    // 导入StageSixProcess组件使用的API
    const {
      getBankruptcyDistPlanApi,
      getEmployeeSPlanApi,
      getPriorityPaymentApi,
      getPropertyDECApi,
      getDepositManagementApi,
    } = await import('#/api/core/case-process');

    // 调用所有API获取任务状态
    const [
      bankruptcyDistPlanRes,
      employeeSPlanRes,
      priorityPaymentRes,
      propertyDECRes,
      depositManagementRes,
    ] = await Promise.allSettled([
      getBankruptcyDistPlanApi(caseId.value),
      getEmployeeSPlanApi(caseId.value),
      getPriorityPaymentApi(caseId.value),
      getPropertyDECApi(caseId.value),
      getDepositManagementApi(caseId.value),
    ]);

    // 更新阶段六的任务状态
    const stageSix = processStages.value[5];
    if (stageSix && stageSix.tasks) {
      stageSix.tasks.forEach((task) => {
        let apiResponse: any = null;

        // 根据任务ID获取对应的API响应
        switch ((task as any).apiId) {
          case 'bankruptcyDistPlan': {
            apiResponse =
              bankruptcyDistPlanRes.status === 'fulfilled'
                ? bankruptcyDistPlanRes.value
                : null;
            break;
          }
          case 'depositManagement': {
            apiResponse =
              depositManagementRes.status === 'fulfilled'
                ? depositManagementRes.value
                : null;
            break;
          }
          case 'employeeSPlan': {
            apiResponse =
              employeeSPlanRes.status === 'fulfilled'
                ? employeeSPlanRes.value
                : null;
            break;
          }
          case 'priorityPayment': {
            apiResponse =
              priorityPaymentRes.status === 'fulfilled'
                ? priorityPaymentRes.value
                : null;
            break;
          }
          case 'propertyDEC': {
            apiResponse =
              propertyDECRes.status === 'fulfilled'
                ? propertyDECRes.value
                : null;
            break;
          }
        }

        if (apiResponse && apiResponse.status === '1' && apiResponse.data) {
          const paras = apiResponse.data.paras;
          const zt0Count = Number.parseInt(paras?.zt0_count || '0', 10);
          const zt1Count = Number.parseInt(paras?.zt1_count || '0', 10);
          const zt2Count = Number.parseInt(paras?.zt2_count || '0', 10);

          if (zt0Count === 0 && zt1Count > 0 && zt2Count === 0) {
            task.completed = true;
          } else if (zt0Count === 0 && zt2Count > 0) {
            task.completed = true;
          }
        }
      });
    }
  } catch (error) {
    console.error('同步第六阶段任务状态失败:', error);
  }
};

// 同步StageSevenProcess组件中的任务状态
const syncTaskStatusFromStageSeven = async () => {
  try {
    // 导入StageSevenProcess组件使用的API
    const {
      getCanRRInfoApi,
      getTerminationLitiApi,
      getAdditionalDisiributionApi,
    } = await import('#/api/core/case-process');

    // 调用所有API获取任务状态
    const [canRRRes, terminationLitiRes, additionalDisiributionRes] =
      await Promise.allSettled([
        getCanRRInfoApi(caseId.value),
        getTerminationLitiApi(caseId.value),
        getAdditionalDisiributionApi(caseId.value),
      ]);

    // 更新阶段七的任务状态
    const stageSeven = processStages.value[6];
    if (stageSeven && stageSeven.tasks) {
      stageSeven.tasks.forEach((task) => {
        let apiResponse: any = null;

        // 根据任务ID获取对应的API响应
        switch ((task as any).apiId) {
          case 'additionalDisiribution': {
            apiResponse =
              additionalDisiributionRes.status === 'fulfilled'
                ? additionalDisiributionRes.value
                : null;
            break;
          }
          case 'canRR': {
            apiResponse =
              canRRRes.status === 'fulfilled' ? canRRRes.value : null;
            break;
          }
          case 'terminationLiti': {
            apiResponse =
              terminationLitiRes.status === 'fulfilled'
                ? terminationLitiRes.value
                : null;
            break;
          }
        }

        if (apiResponse && apiResponse.status === '1' && apiResponse.data) {
          const paras = apiResponse.data.paras;
          const zt0Count = Number.parseInt(paras?.zt0_count || '0', 10);
          const zt1Count = Number.parseInt(paras?.zt1_count || '0', 10);
          const zt2Count = Number.parseInt(paras?.zt2_count || '0', 10);

          if (zt0Count === 0 && zt1Count > 0 && zt2Count === 0) {
            task.completed = true;
          } else if (zt0Count === 0 && zt2Count > 0) {
            task.completed = true;
          }
        }
      });
    }
  } catch (error) {
    console.error('同步第七阶段任务状态失败:', error);
  }
};

const goBack = () => {
  router.back();
};

// 开始编辑
const startEditing = () => {
  isEditing.value = true;
  // 复制当前数据到编辑对象
  Object.assign(editedData, caseDetail.value);
};

// 保存编辑
const saveEditing = async () => {
  saveLoading.value = true;
  try {
    const currentDate = new Date().toISOString().split('T')[0];

    const updateData = {
      AJID: caseId.value,
      AH: editedData.案号 || '',
      AJMC: editedData.案件名称 || '',
      SLRQ: formatDate(editedData.受理日期),
      AJLY: editedData.案件来源 || '',
      SLFY: editedData.受理法院 || '',
      ZDJG: editedData.指定机构 || '',
      GLRFZR: editedData.管理人负责人 || '',
      SFJHS: editedData.是否简化审 || '',
      AY: editedData.案由 || '',
      AJJD: editedData.案件进度 || '',
      ZQSBJZSJ: formatDate(editedData.债权申报截止时间),
      LARQ: formatDate(editedData.立案日期),
      JARQ: formatDate(editedData.结案日期),
      PCSJ: formatDate(editedData.破产时间),
      ZJSJ: formatDate(editedData.终结时间),
      ZXSJ: formatDate(editedData.注销时间),
      GDSJ: formatDate(editedData.归档时间),
      BEIZHU: editedData.备注 || '',
      SEP_EUSER: editedData.修改者 || '',
      SEP_EDATE: formatDate(editedData.修改时间) || currentDate,
      GLRID: caseId.value,
      GLRLX: editedData.管理人类型 || '',
      FZRID: editedData.负责人 || '',
      LXDH: editedData.联系电话 || '',
      LXYX: editedData.联系邮箱 || '',
      BGDZ: editedData.办公地址 || '',
      ZT: editedData.管理人状态 || '',
      ZQRID: caseId.value,
      ZQR: editedData.债权人名称 || '',
      ZQRFL: editedData.债权人类型 || '',
      ZJHM: editedData.证件号码 || '',
      FDDBRQY: editedData.法定代表人 || '',
      ZCDZ: editedData.注册地址 || '',
      JYFWQY: editedData.经营范围 || '',
      HYFL: editedData.行业分类 || '',
      CLRQQY: formatDate(editedData.成立日期),
      ZCZBQY: editedData.注册资本 || '',
      ZQSBID: caseId.value,
      ZQRMC: editedData.申报债权人名称 || '',
      ZQRLX: editedData.申报债权人类型 || '',
      SBJE: editedData.申报金额 || '',
      SBYJ: editedData.申报依据 || '',
      JSR: editedData.接收人 || '',
      SBLX: editedData.申报类型 || '',
      BZ: editedData.申报备注 || '',
      ZQQRID: caseId.value,
      FYCDRQ: formatDate(editedData.法院裁定日期),
      CDWH: editedData.裁定文号 || '',
      ZZJE: editedData.最终金额 || '',
    };

    const response = await updateCaseApi(updateData);

    if (response.status === '1') {
      Object.assign(caseDetail.value, editedData);
      isEditing.value = false;
      ElMessage.success('案件信息已保存');
    } else {
      ElMessage.error(`保存失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('保存案件信息失败:', error);
    ElMessage.error('保存案件信息失败');
  } finally {
    saveLoading.value = false;
  }
};

const formatDate = (date: any): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return undefined;
};

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false;
  // 清空编辑数据
  Object.keys(editedData).forEach((key) => {
    delete editedData[key];
  });
  ElMessage.info('已取消编辑');
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

    <!-- 内容类型切换 -->
    <div class="content-tabs mb-6">
      <ElRadioGroup v-model="activeTab" size="large" class="tabs-container">
        <ElRadioButton value="caseInfo" class="tab-button">
          案件基本信息
        </ElRadioButton>
        <ElRadioButton value="process" class="tab-button">
          流程处理
        </ElRadioButton>
        <ElRadioButton value="announcement" class="tab-button">
          公告管理
        </ElRadioButton>
      </ElRadioGroup>
    </div>

    <!-- 案件基本信息卡片 -->
    <div v-if="activeTab === 'caseInfo'">
      <ElCard class="case-info-card" shadow="hover">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <div class="flex items-center">
              <Icon icon="lucide:file-text" class="mr-2 text-blue-500" />
              <span class="text-lg font-semibold">案件基本信息</span>
            </div>
            <div class="flex space-x-2">
              <template v-if="!isEditing">
                <ElButton type="primary" @click="startEditing">
                  <Icon icon="lucide:pencil" class="mr-1" />
                  编辑
                </ElButton>
              </template>
              <template v-else>
                <ElButton
                  type="success"
                  @click="saveEditing"
                  :loading="saveLoading"
                >
                  <Icon icon="lucide:save" class="mr-1" />
                  保存
                </ElButton>
                <ElButton @click="cancelEditing" :disabled="saveLoading">
                  <Icon icon="lucide:x" class="mr-1" />
                  取消
                </ElButton>
              </template>
              <ElButton
                link
                @click="isInfoCollapsed = !isInfoCollapsed"
                :icon="Icon"
              >
                <Icon
                  :icon="
                    isInfoCollapsed
                      ? 'lucide:chevron-down'
                      : 'lucide:chevron-up'
                  "
                  class="ml-1"
                />
                {{ isInfoCollapsed ? '展开详情' : '收起详情' }}
              </ElButton>
            </div>
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
                <div
                  class="key-info-item rounded-lg bg-green-50 p-4 text-center"
                >
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
                    <div
                      :style="getCaseStatusStyle(caseDetail.案件进度)"
                      class="inline-block rounded-full px-4 py-1 text-base font-semibold"
                    >
                      {{ caseDetail.案件进度 }}
                    </div>
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

          <!-- 按类别分组展示详细信息 - 可折叠 -->
          <div
            v-show="!isInfoCollapsed"
            class="category-sections transition-all duration-300 ease-in-out"
          >
            <!-- 案件基本信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:file-text" class="mr-2 text-blue-500" />
                  <span class="text-md font-semibold">案件基本信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案件名称：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件名称"
                          size="small"
                          placeholder="请输入案件名称"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案件名称
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >受理日期：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.受理日期"
                          type="date"
                          size="small"
                          placeholder="请选择受理日期"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.受理日期
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案件来源：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件来源"
                          size="small"
                          placeholder="请输入案件来源"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案件来源
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >受理法院：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.受理法院"
                          size="small"
                          placeholder="请输入受理法院"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.受理法院
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案由：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案由"
                          size="small"
                          placeholder="请输入案由"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案由
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案件进度：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件进度"
                          size="small"
                          placeholder="请输入案件进度"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案件进度
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >是否简化审：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.是否简化审"
                          size="small"
                          placeholder="请输入是否简化审"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.是否简化审
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>

            <!-- 时间相关信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:calendar" class="mr-2 text-green-500" />
                  <span class="text-md font-semibold">时间相关信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >立案日期：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.立案日期"
                          type="date"
                          size="small"
                          placeholder="请选择立案日期"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.立案日期
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >结案日期：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.结案日期"
                          type="date"
                          size="small"
                          placeholder="请选择结案日期"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.结案日期
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >破产时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.破产时间"
                          type="date"
                          size="small"
                          placeholder="请选择破产时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.破产时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >终结时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.终结时间"
                          type="date"
                          size="small"
                          placeholder="请选择终结时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.终结时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >注销时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.注销时间"
                          type="date"
                          size="small"
                          placeholder="请选择注销时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.注销时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >归档时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.归档时间"
                          type="date"
                          size="small"
                          placeholder="请选择归档时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.归档时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >债权申报截止时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.债权申报截止时间"
                          type="date"
                          size="small"
                          placeholder="请选择债权申报截止时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.债权申报截止时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>

            <!-- 管理人信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:users" class="mr-2 text-purple-500" />
                  <span class="text-md font-semibold">管理人信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >管理人负责人：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.管理人负责人"
                          size="small"
                          placeholder="请输入管理人负责人"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.管理人负责人
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >管理人类型：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.管理人类型"
                          size="small"
                          placeholder="请输入管理人类型"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.管理人类型
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >管理人状态：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.管理人状态"
                          size="small"
                          placeholder="请输入管理人状态"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.管理人状态
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >律师事务所：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.律师事务所"
                          size="small"
                          placeholder="请输入律师事务所"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.律师事务所
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>

            <!-- 债权人信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:handshake" class="mr-2 text-orange-500" />
                  <span class="text-md font-semibold">债权人信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >债权人名称：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.债权人名称"
                          size="small"
                          placeholder="请输入债权人名称"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.债权人名称
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >债权人类型：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.债权人类型"
                          size="small"
                          placeholder="请输入债权人类型"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.债权人类型
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >联系电话：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.联系电话"
                          size="small"
                          placeholder="请输入联系电话"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.联系电话
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >联系邮箱：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.联系邮箱"
                          size="small"
                          placeholder="请输入联系邮箱"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.联系邮箱
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="24" :md="16" :lg="12">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >办公地址：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.办公地址"
                          size="small"
                          placeholder="请输入办公地址"
                          style="width: 300px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.办公地址
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>
          </div>
        </div>

        <div v-else class="error-container">
          <ElEmpty description="案件信息加载失败" />
        </div>
      </ElCard>

      <!-- 文件上传组件 -->
      <FileUploader :case-id="caseId" multiple />
    </div>

    <!-- 公告管理 -->
    <div v-if="activeTab === 'announcement'">
      <ElCard class="case-info-card" shadow="hover">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <div class="flex items-center">
              <Icon icon="lucide:bullhorn" class="mr-2 text-blue-500" />
              <span class="text-lg font-semibold">公告管理</span>
            </div>
            <div class="flex space-x-2">
              <ElButton type="primary" @click="openNewAnnouncementDialog">
                <Icon icon="lucide:plus" class="mr-1" />
                发布新公告
              </ElButton>
            </div>
          </div>
        </template>

        <!-- 公告列表 -->
        <div class="announcement-list-container">
          <ElTable
            v-loading="loadingAnnouncements"
            :data="announcements"
            border
            stripe
            style="width: 100%"
            class="mb-4"
          >
            <ElTableColumn prop="title" label="公告标题" min-width="200" />
            <ElTableColumn prop="publishDate" label="发布日期" width="180" />
            <ElTableColumn prop="author" label="发布人" width="120" />
            <ElTableColumn prop="status" label="状态" width="120">
              <template #default="scope">
                <ElTag
                  :type="
                    scope.row.status === 'published' ? 'success' : 'warning'
                  "
                >
                  {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="250" fixed="right">
              <template #default="scope">
                <ElButton
                  v-if="scope.row.status === 'draft'"
                  type="primary"
                  size="small"
                  @click="publishAnnouncement(scope.row.id)"
                >
                  发布
                </ElButton>
                <ElButton
                  v-else
                  type="warning"
                  size="small"
                  @click="revokeAnnouncement(scope.row.id)"
                >
                  撤销
                </ElButton>
                <ElButton
                  type="info"
                  size="small"
                  @click="editAnnouncement(scope.row)"
                  style="margin-left: 8px"
                >
                  编辑
                </ElButton>
                <ElPopconfirm
                  title="确定要删除这条公告吗？"
                  @confirm="deleteAnnouncement(scope.row.id)"
                >
                  <ElButton type="danger" size="small" style="margin-left: 8px">
                    删除
                  </ElButton>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 分页 -->
          <div class="pagination-container flex justify-end">
            <ElPagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalAnnouncements"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </ElCard>

      <!-- 公告编辑对话框 -->
      <ElDialog
        v-model="showAnnouncementDialog"
        :title="dialogTitle"
        width="80%"
        destroy-on-close
      >
        <div class="announcement-editor-container">
          <div class="mb-4">
            <ElForm label-width="80px">
              <ElFormItem label="公告标题" required>
                <ElInput
                  v-model="announcementData.title"
                  placeholder="请输入公告标题"
                  size="large"
                />
              </ElFormItem>
              <ElFormItem label="公告内容" required>
                <RichTextEditor
                  v-model="announcementData.content"
                  placeholder="请输入公告内容"
                  height="400px"
                />
              </ElFormItem>
              <ElFormItem label="公告类型">
                <ElSelect
                  v-model="announcementData.announcement_type"
                  size="large"
                >
                  <ElOption label="普通" value="NORMAL" />
                  <ElOption label="紧急" value="URGENT" />
                  <ElOption label="重要" value="IMPORTANT" />
                </ElSelect>
              </ElFormItem>
              <ElRow :gutter="20">
                <ElCol :span="12">
                  <ElFormItem label="是否置顶">
                    <ElSwitch v-model="announcementData.is_top" size="large" />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem
                    label="置顶过期时间"
                    v-if="announcementData.is_top"
                  >
                    <ElDatePicker
                      v-model="announcementData.top_expire_time"
                      type="datetime"
                      placeholder="选择置顶过期时间"
                      size="large"
                      value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </ElForm>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="closeAnnouncementDialog">取消</ElButton>
            <ElButton type="primary" @click="saveAnnouncement">确定</ElButton>
          </span>
        </template>
      </ElDialog>
    </div>

    <!-- 破产流程阶段视图 -->
    <div v-if="activeTab === 'process'">
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
            >
              下一阶段
              <Icon icon="lucide:chevron-right" class="ml-1" />
            </ElButton>
          </div>
        </div>

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

        <StageSixProcess
          :case-id="caseId"
          v-else-if="currentStageIndex === 5"
          @task-status-changed="handleTaskStatusChanged"
        />

        <StageSevenProcess
          :case-id="caseId"
          v-else-if="currentStageIndex === 6"
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
            <div class="placeholder-content py-8 text-center">
              <Icon
                icon="lucide:file-text"
                class="mb-3 text-4xl text-gray-300"
              />
              <p class="mb-4 text-gray-500">该阶段流程组件尚未创建</p>
              <ElButton type="primary" disabled> 组件开发中 </ElButton>
            </div>
          </ElCard>
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

.content-tabs {
  margin-bottom: 20px;
}

.tabs-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tabs-container :deep(.el-radio-button) {
  margin: 0 !important;
}

.tab-button {
  min-width: 120px;
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

.announcement-editor-container {
  padding: 20px;
}

.editor-wrapper {
  width: 100%;
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
