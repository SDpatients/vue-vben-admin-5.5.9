<script setup lang="ts">
import type { CaseProcessApi } from '#/api/core/case-process';

import { computed, onMounted, ref, watch } from 'vue';
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

// 路由和状态管理
const route = useRoute();
const router = useRouter();

// 获取路由参数
const caseId = ref(
  (route.params.caseId as string) || (route.params.id as string),
);
const taskId = ref(
  (route.params.taskId as string) || (route.params.taskType as string),
);
// 判断是新增还是编辑模式
const isAddMode = ref(route.path.endsWith('/add'));

// 任务配置
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
    apiUrl: '/api/web/getWorkTeam',
    token: '4015f285dc41bd1bb931ba8430966c3f',
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
    apiUrl: '/api/web/getWorkPlan',
    token: '8a62e323a84173fd8ec72557e6fc616d',
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
    apiUrl: '/api/web/getManagement',
    token: '6bbdf0bf97117c1bac495072c961e778',
  },
  sealManagement: {
    name: '印章确认',
    fields: [
      { key: 'YZMC', label: '印章名称', type: 'input' },
      {
        key: 'YZZT',
        label: '印章状态',
        type: 'select',
        options: ['正常', '停用', '销毁'],
      },
      { key: 'GLR', label: '管理人', type: 'input' },
      { key: 'GLRQ', label: '管理日期', type: 'date' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getSealManagement',
    token: '203cadf061d22b2aaa2ce1c59b9c4bbb',
  },
  legalProcedure: {
    name: '法律程序确认',
    fields: [
      { key: 'CXMC', label: '程序名称', type: 'input' },
      { key: 'CXNR', label: '程序内容', type: 'textarea' },
      { key: 'KSRQ', label: '开始日期', type: 'date' },
      { key: 'JSRQ', label: '结束日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
      {
        key: 'CXZT',
        label: '程序状态',
        type: 'select',
        options: ['进行中', '已完成', '已终止'],
      },
    ],
    apiUrl: '/api/web/getLegalProcedure',
    token: 'a81a3a18b6d52abb4b6c38132e1198da',
  },
  // 第二阶段任务配置
  propertyReceipt: {
    name: '财产接管确认',
    fields: [
      { key: 'CCJGRQ', label: '接管日期', type: 'date' },
      { key: 'CCJGNR', label: '接管内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'JGZT', label: '接管状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getPropertyReceipt',
    token: '699a11d9338b983ce9eafc5e75f1833f',
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
    apiUrl: '/api/web/getEmergency',
    token: 'c6c85c5e695fec908ded4f05f9e9bfc9',
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
    apiUrl: '/api/web/getPropertyPlan',
    token: '924180f974b81f375d6625ab0fd59f60',
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
    apiUrl: '/api/web/getPersonnelEmp',
    token: 'ae3987ea39249e94edb9bdccf1c859d7',
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
    apiUrl: '/api/web/getInternalAffairs',
    token: 'ba251b8fffee8a47a71b3429ab9cccb5',
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
    apiUrl: '/api/web/getBusinessManagement',
    token: '0611b92b9a4bd76e5fc315d145a90fc2',
  },
  // 第三阶段任务类型
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
    apiUrl: '/api/web/getAllPropertyInvestigation',
    token: '17fce65ebabe3088ab45b97f77f91b5a',
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
    apiUrl: '/api/web/getAllBankExpenses',
    token: 'ff7185ba1adffaa6630ec57062ae6473',
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
    apiUrl: '/api/web/getAllRightsClaim',
    token: '0ce8909084c3cd60a2e2f8ba450df13a',
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
    apiUrl: '/api/web/getAllReclaimReview',
    token: 'dcdc3c95faccd88d495c94923f8e2148',
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
    apiUrl: '/api/web/getAllLitigationArbitration',
    token: '7adbf35a9986045cb55ce9e1d8d8b90c',
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
    apiUrl: '/api/web/getAllCreditorClaim',
    token: '7fb219c01b0107dc5cb58d173ce87664',
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
    apiUrl: '/api/web/getAllSociaSF',
    token: 'a8990ffa15ebbd2bff6aed37db08cadf',
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
    apiUrl: '/api/web/getAllTaxVerification',
    token: '59a21e973cc5a522c63b11c19a988d0b',
  },
  // 第四阶段任务类型
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
    apiUrl: '',
    token: '',
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
    apiUrl: '',
    token: '',
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
    apiUrl: '',
    token: '',
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
    apiUrl: '',
    token: '',
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
    apiUrl: '',
    token: '',
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
    apiUrl: '',
    token: '',
  },
  // 第五阶段任务类型
  assetValuation: {
    name: '资产价值评估',
    fields: [
      { key: 'PGXM', label: '评估项目', type: 'input' },
      { key: 'PGJZ', label: '评估价值', type: 'input' },
      { key: 'PGRQ', label: '评估日期', type: 'date' },
      { key: 'PGJG', label: '评估机构', type: 'input' },
      { key: 'PGBGBH', label: '评估报告编号', type: 'input' },
    ],
    apiUrl: '',
    token: '',
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
    apiUrl: '',
    token: '',
  },
  bankruptcyDeclaration: {
    name: '破产宣告',
    fields: [
      { key: 'XGRQ', label: '宣告日期', type: 'date' },
      { key: 'XGH', label: '宣告文号', type: 'input' },
      { key: 'XGYY', label: '宣告法院', type: 'input' },
      { key: 'XGNR', label: '宣告内容', type: 'textarea' },
    ],
    apiUrl: '',
    token: '',
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
    apiUrl: '',
    token: '',
  },
};

// 当前任务配置
const currentTask = computed(
  () => taskConfigs[taskId.value as keyof typeof taskConfigs],
);

// 表单数据
const formDataList = ref<Array<Record<string, any>>>([]);
const originalDataList = ref<Array<Record<string, any>>>([]);
const currentIndex = ref(0);
const loading = ref(false);
const saving = ref(false);

// 案件详情
const caseDetail = ref<any>(null);

// 状态管理
const taskStatus = ref<CaseProcessApi.TaskStatus>('未确认');

// 跳过状态管理
const isSkipped = ref(false);

// 选项切换状态
const activeOption = ref('file'); // 默认显示文件上传

// 文件上传相关
const fileList = ref<Array<any>>([]);

// 监听任务状态变化
watch(
  () => taskStatus.value,
  (newStatus) => {
    if (newStatus === '跳过') {
      isSkipped.value = true;
    } else if (newStatus === '未确认') {
      isSkipped.value = false;
    }
  },
);

// 当前表单数据
const formData = computed({
  get: (): Record<string, any> => {
    // 确保formDataList中存在当前索引的对象
    if (!formDataList.value[currentIndex.value]) {
      formDataList.value[currentIndex.value] = {};
    }
    // 显式断言返回值不为undefined
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
  1: 'http://192.168.0.107:8085/api/web/update1?token=ff3378dd6264d6a0d4293d322e738a85',
  2: 'http://192.168.0.107:8085/api/web/update2?token=5781352a1e8bd95e5fa74f0ff47074c5',
  3: 'http://192.168.0.107:8085/api/web/update3?token=da90b1901ed746289dd074c1af9dfa55',
};

// 页面标题
const pageTitle = computed(() => {
  if (
    taskId.value === 'workTeam' &&
    caseDetail.value &&
    caseDetail.value.案号
  ) {
    return `${caseDetail.value.案号} 工作团队确认`;
  }
  return currentTask.value.name;
});

// 获取状态标签类型
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

// 加载任务数据
const loadTaskData = async () => {
  loading.value = true;
  try {
    // 新增模式下直接初始化空数据
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

    // 编辑模式下调用API加载现有数据
    // 根据任务类型调用对应的API
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
      // 第二阶段任务类型
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
      // 处理API返回的数据，支持多种数据结构
      let dataList: Array<Record<string, any>> = [];

      // 检查是否是分页数据结构（包含records字段）
      if (apiResponse.data && Array.isArray(apiResponse.data.records)) {
        // 从records字段获取数据列表
        dataList = apiResponse.data.records;
      } else if (Array.isArray(apiResponse.data)) {
        // 直接是数组
        dataList = apiResponse.data;
      } else {
        // 单个对象
        dataList = [apiResponse.data];
      }

      // 使用API返回的数据
      formDataList.value = dataList.map((item) => ({ ...item }));
      originalDataList.value = dataList.map((item) => ({ ...item }));

      // 设置任务状态，DQZT为空时默认为'未确认'
      taskStatus.value =
        (dataList[0]?.DQZT as CaseProcessApi.TaskStatus) || '未确认';
    } else {
      // API调用失败，使用默认数据
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

    // 出错时使用默认数据
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

// 保存数据
const saveData = async (confirm: boolean = false) => {
  saving.value = true;
  try {
    // 从本地存储获取操作人信息，默认使用uName
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const userInfo = chatUserInfo ? JSON.parse(chatUserInfo) : {};
    const sepeuser = userInfo.uName || userInfo.U_USER || 'admin';

    if (taskId.value === 'workTeam') {
      if (isAddMode.value) {
        // 新增模式：调用新增接口
        const { addWorkTeamApi } = await import('#/api/core/work-team');
        const SEP_EDATE = new Date().toISOString();
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
          SEP_EUSER: sepeuser,
          SEP_EDATE,
          ZT: confirm ? '1' : '0',
          // 兼容API所需的其他字段
          sepauser: sepeuser,
          sepadate: SEP_EDATE,
        };

        const result = await addWorkTeamApi(addParams);
        if (result.status !== '1') {
          throw new Error(result.error || '保存数据失败');
        }
      } else {
        // 编辑模式：调用第一阶段的update接口
        const updateUrl = updateApiUrls[1];
        const SEP_EDATE = new Date().toISOString();

        // 准备统一API参数
        const updateParams = {
          OperateType: taskTypeToOperateType[taskId.value] || '0',
          sep_id: String(
            (formData.value || {}).SEP_ID ||
              (formData.value || {}).sep_id ||
              caseId.value,
          ),
          SEP_LD: caseId.value,
          SEP_EUSER: sepeuser,
          SEP_EDATE,
          tdfzr: (formData.value || {}).TDFZR || '',
          zhzcy: (formData.value || {}).ZHZCY || '',
          cxzcy: (formData.value || {}).CXZCY || '',
          ccglzcy: (formData.value || {}).CCGLZCY || '',
          zqshzcy: (formData.value || {}).ZQSHZCY || '',
          ldrszcy: (formData.value || {}).LDRSZCY || '',
          zzqlzcy: (formData.value || {}).ZZQLZCY || '',
          ZT: confirm ? '1' : '0',
        };

        // 调用update1 API，传递单个对象
        const result = await fetch(updateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateParams),
        });

        const resultData = await result.json();
        if (resultData.status !== '1') {
          throw new Error(resultData.error || '保存数据失败');
        }
      }
    } else {
      // 其他任务类型，根据新增/编辑模式调用不同接口
      if (isAddMode.value) {
        // 新增模式：调用对应任务类型的新增接口
        let addResponse: any;
        const SEP_EDATE = new Date().toISOString();

        switch (taskId.value) {
          case 'businessManagement': {
            const { addBusinessManagementApi } =
              await import('#/api/core/case-process');
            addResponse = await addBusinessManagementApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              jyglnr: (formData.value || {}).JYGLNR || '',
              fzr: (formData.value || {}).FZR || '',
              glrq: (formData.value || {}).GLRQ || SEP_EDATE,
              glzt: (formData.value || {}).GLZT || '',
              bz: (formData.value || {}).BZ || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '10',
              ...formData.value,
            });
            break;
          }

          case 'emergency': {
            const { addEmergencyApi } = await import('#/api/core/case-process');
            addResponse = await addEmergencyApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              yjyamc: (formData.value || {}).YJYAMC || '',
              yjyanr: (formData.value || {}).YJYANR || '',
              fzr: (formData.value || {}).FZR || '',
              yjzt: (formData.value || {}).YJZT || '',
              bz: (formData.value || {}).BZ || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '6',
              ...formData.value,
            });
            break;
          }

          case 'internalAffairs': {
            const { addInternalAffairsApi } =
              await import('#/api/core/case-process');
            addResponse = await addInternalAffairsApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              nbswnr: (formData.value || {}).NBSWNR || '',
              fzr: (formData.value || {}).FZR || '',
              clrq: (formData.value || {}).CLRQ || SEP_EDATE,
              swzt: (formData.value || {}).SWZT || '',
              bz: (formData.value || {}).BZ || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '9',
              ...formData.value,
            });
            break;
          }

          case 'legalProcedure': {
            // 调用添加法律程序API
            const { addLegalProcedureApi } =
              await import('#/api/core/case-process');
            addResponse = await addLegalProcedureApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              cxlx: (formData.value || {}).CXLX || '',
              cxnr: (formData.value || {}).CXNR || '',
              zhrq: (formData.value || {}).ZHRQ || SEP_EDATE,
              fzr: (formData.value || {}).FZR || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '4',
              ...formData.value,
            });
            break;
          }

          case 'management': {
            // 调用添加管理制度API
            const { addManagementApi } =
              await import('#/api/core/case-process');
            addResponse = await addManagementApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              zdlx: (formData.value || {}).ZDLX || '',
              zdmc: (formData.value || {}).GLMC || '',
              zdnr: (formData.value || {}).GLNR || '',
              sxrq: (formData.value || {}).FBRQ || SEP_EDATE,
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '2',
              ...formData.value,
            });
            break;
          }

          case 'personnelEmp': {
            const { addPersonnelEmploymentApi } =
              await import('#/api/core/case-process');
            addResponse = await addPersonnelEmploymentApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              rsglnr: (formData.value || {}).RSGLNR || '',
              fzr: (formData.value || {}).FZR || '',
              glrq: (formData.value || {}).GLRQ || SEP_EDATE,
              glzt: (formData.value || {}).GLZT || '',
              bz: (formData.value || {}).BZ || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '8',
              ...formData.value,
            });
            break;
          }

          case 'propertyPlan': {
            const { addPropertyPlanApi } =
              await import('#/api/core/case-process');
            addResponse = await addPropertyPlanApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              ccjhmc: (formData.value || {}).CCJHMC || '',
              ccjhnr: (formData.value || {}).CCJHNR || '',
              ksrq: (formData.value || {}).KSRQ || SEP_EDATE,
              jsrq: (formData.value || {}).JSRQ || SEP_EDATE,
              fzr: (formData.value || {}).FZR || '',
              jhzt: (formData.value || {}).JHZT || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '7',
              ...formData.value,
            });
            break;
          }

          // 第二阶段任务
          case 'propertyReceipt': {
            const { addPropertyReceiptApi } =
              await import('#/api/core/case-process');
            addResponse = await addPropertyReceiptApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              ccjgrq: (formData.value || {}).CCJGRQ || SEP_EDATE,
              ccjgnr: (formData.value || {}).CCJGNR || '',
              fzr: (formData.value || {}).FZR || '',
              jgzt: (formData.value || {}).JGZT || '',
              bz: (formData.value || {}).BZ || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '5',
              ...formData.value,
            });
            break;
          }

          case 'sealManagement': {
            // 调用添加印章管理API
            const { addSealManagementApi } =
              await import('#/api/core/case-process');
            addResponse = await addSealManagementApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              yzlx: (formData.value || {}).YZLX || '',
              yzbh: (formData.value || {}).YZBH || '',
              yzyblj: (formData.value || {}).YZYBLJ || '',
              yzmc: (formData.value || {}).YZMC || '',
              barq: (formData.value || {}).GLRQ || SEP_EDATE,
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '3',
              ...formData.value,
            });
            break;
          }

          case 'workPlan': {
            // 调用添加工作计划API
            const { addWorkPlanApi } = await import('#/api/core/case-process');
            addResponse = await addWorkPlanApi({
              sep_ld: caseId.value,
              SEP_EUSER: sepeuser,
              SEP_EDATE,
              jhlx: (formData.value || {}).JHLX || '',
              jhnr: (formData.value || {}).JHNR || '',
              ksrq: (formData.value || {}).KSRQ || SEP_EDATE,
              jsrq: (formData.value || {}).JSRQ || SEP_EDATE,
              fzr: (formData.value || {}).FZR || '',
              zt: confirm ? '1' : '0',
              OperateType: taskTypeToOperateType[taskId.value] || '1',
              ...formData.value,
            });
            break;
          }

          default: {
            throw new Error(`未知的任务类型: ${taskId.value}`);
          }
        }

        if (addResponse && addResponse.status !== '1') {
          throw new Error(addResponse.error || '保存数据失败');
        }
      } else {
        // 编辑模式：根据任务类型确定所属阶段，调用对应的update接口
        const stage = stageMapping[taskId.value] || 1;
        const updateUrl = updateApiUrls[stage];
        const SEP_EDATE = new Date().toISOString();

        // 准备统一API参数
        const params = {
          SEP_LD: caseId.value,
          SEP_ID:
            (formData.value || {}).SEP_ID ||
            (formData.value || {}).sep_id ||
            caseId.value,
          ZT: confirm ? '1' : '0', // 确认完成则ZT=1，否则ZT=0
          OperateType: taskTypeToOperateType[taskId.value] || '0',
          SEP_EUSER: sepeuser,
          SEP_EDATE,
          ...formData.value, // 上传所有修改的值
        };

        // 调用对应的update接口
        const result = await fetch(updateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        const resultData = await result.json();
        if (resultData.status !== '1') {
          throw new Error(resultData.error || '保存数据失败');
        }
      }
    }

    // 更新任务状态（如果确认完成）
    if (confirm) {
      taskStatus.value = '完成';
      ElMessage.success('数据已保存并确认完成');
    } else {
      ElMessage.success('数据已保存');
    }

    // 更新原始数据
    originalDataList.value[currentIndex.value] = { ...formData.value };
  } catch (error) {
    console.error('保存数据失败:', error);
    ElMessage.error('保存数据失败');
  } finally {
    saving.value = false;
  }
};

// 保存并确认
const saveAndConfirm = async () => {
  await ElMessageBox.confirm('确认保存并完成此任务吗？', '确认完成', {
    confirmButtonText: '确认完成',
    cancelButtonText: '取消',
    type: 'warning',
  });

  await saveData(true);
};

// 跳过任务
const skipTask = async () => {
  saving.value = true;
  try {
    // 从本地存储获取操作人信息，默认使用uName
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const userInfo = chatUserInfo ? JSON.parse(chatUserInfo) : {};
    const SEP_EUSER = userInfo.uName || userInfo.U_USER || 'admin';
    const SEP_EDATE = new Date().toISOString();

    let apiResponse;
    let resultData;

    // 特殊处理工作团队任务（忽略大小写比较）
    if (taskId.value.toLowerCase() === 'workteam') {
      // 导入工作团队API
      const { addWorkTeamApi } = await import('#/api/core/work-team');

      // 准备工作团队API参数
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
        SEP_EUSER,
        SEP_EDATE,
        ZT: '2', // 跳过状态
        // 兼容API所需的其他字段
        sepauser: SEP_EUSER,
        sepadate: SEP_EDATE,
      };
      apiResponse = await addWorkTeamApi(addParams);
      resultData = apiResponse;
    } else {
      // 非工作团队任务，根据任务类型确定所属阶段，调用对应的update接口
      const stage = stageMapping[taskId.value] || 1;
      const updateUrl = updateApiUrls[stage];

      // 准备统一API参数
      const params = {
        SEP_LD: caseId.value,
        SEP_ID:
          (formData.value || {}).SEP_ID ||
          (formData.value || {}).sep_id ||
          caseId.value,
        ZT: '2', // 跳过状态
        OperateType: taskTypeToOperateType[taskId.value] || '0',
        SEP_EDATE,
        SEP_EUSER,
        ...formData.value, // 上传所有修改的值
      };

      // 调用对应的update接口
      const result = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      resultData = await result.json();
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

// 撤回跳过或完成操作
const revokeSkip = async () => {
  saving.value = true;
  try {
    // 从本地存储获取操作人信息，默认使用uName
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const userInfo = chatUserInfo ? JSON.parse(chatUserInfo) : {};
    const SEP_EUSER = userInfo.uName || userInfo.U_USER || 'admin';
    const SEP_EDATE = new Date().toISOString();

    let apiResponse;
    let resultData;

    // 特殊处理工作团队任务（忽略大小写比较）
    if (taskId.value.toLowerCase() === 'workteam') {
      // 准备工作团队API参数，直接创建对象
      const workTeamParams = {
        OperateType: 0,
        sep_id:
          (formData.value || {}).SEP_ID ||
          (formData.value || {}).sep_id ||
          caseId.value,
        SEP_LD: caseId.value,
        SEP_EUSER,
        SEP_EDATE,
        tdfzr: (formData.value || {}).TDFZR || '',
        zhzcy: (formData.value || {}).ZHZCY || '',
        cxzcy: (formData.value || {}).CXZCY || '',
        ccglzcy: (formData.value || {}).CCGLZCY || '',
        zqshzcy: (formData.value || {}).ZQSHZCY || '',
        ldrszcy: (formData.value || {}).LDRSZCY || '',
        zzqlzcy: (formData.value || {}).ZZQLZCY || '',
        ZT: '0', // 未确认状态
      };

      // 调用第一阶段的update接口
      const updateUrl = updateApiUrls[1];
      const result = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workTeamParams),
      });

      resultData = await result.json();
    } else {
      // 非工作团队任务，根据任务类型确定所属阶段，调用对应的update接口
      const stage = stageMapping[taskId.value] || 1;
      const updateUrl = updateApiUrls[stage];

      // 准备统一API参数
      const params = {
        SEP_LD: caseId.value,
        SEP_ID:
          (formData.value || {}).SEP_ID ||
          (formData.value || {}).sep_id ||
          caseId.value,
        ZT: '0', // 未确认状态
        OperateType: taskTypeToOperateType[taskId.value] || '0',
        SEP_EDATE,
        SEP_EUSER,
        ...formData.value, // 上传所有修改的值
      };

      // 调用对应的update接口
      const result = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      resultData = await result.json();
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

// 切换到上一个表数据
const prevTableData = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// 切换到下一个表数据
const nextTableData = () => {
  if (currentIndex.value < formDataList.value.length - 1) {
    currentIndex.value++;
  }
};

// 取消编辑
const cancelEdit = () => {
  // 检查是否有未保存的更改
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
      .catch(() => {
        // 用户选择继续编辑
      });
  } else {
    router.back();
  }
};

// 文件上传相关方法
const handleFileUpload = async (options: any) => {
  try {
    const file = options.file;
    const SEP_ID =
      (formData.value || {}).SEP_ID ||
      (formData.value || {}).sep_id ||
      caseId.value;

    // 调用文件上传API
    const result = await uploadCaseFileApi(file, SEP_ID);

    if (result.status === '1') {
      ElMessage.success('文件上传成功');
      // 添加到文件列表，兼容不同的API响应格式
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
  // 这里可以添加移除文件的API调用
};

const beforeUpload = (file: File) => {
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB');
    return false;
  }
  return true;
};

// 渲染表单字段函数已移除，直接在模板中渲染

// 页面加载时获取数据
onMounted(async () => {
  if (!currentTask.value) {
    ElMessage.error('无效的任务类型');
    router.back();
    return;
  }

  // 获取案件详情，用于显示案号
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
    <!-- 页面标题和返回按钮 -->
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
        <!-- 表数据切换按钮 -->
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

        <!-- 选项切换按钮 -->
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

        <!-- 文件上传选项 -->
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

        <!-- 自定义数据选项 -->
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
                  <!-- 使用v-for循环中的单个字段渲染，避免多次调用renderFormField -->
                  <ElInput
                    v-if="field.type !== 'select' && field.type !== 'date'"
                    :type="field.type === 'textarea' ? 'textarea' : 'text'"
                    :rows="field.type === 'textarea' ? 4 : 1"
                    :placeholder="`请输入${field.label}`"
                    v-model="formData[field.key]"
                  />
                  <!-- 选择器 -->
                  <ElSelect
                    v-else-if="field.type === 'select'"
                    :placeholder="`请选择${field.label}`"
                    v-model="formData[field.key]"
                  >
                    <!-- 使用类型断言来安全访问options属性 -->
                    <ElOption
                      v-for="option in (field as any).options || []"
                      :key="option"
                      :label="option"
                      :value="option"
                    />
                  </ElSelect>
                  <!-- 日期选择器 -->
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

        <!-- 操作按钮 -->
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

          <ElButton
            v-if="!isSkipped"
            type="warning"
            :loading="saving"
            @click="skipTask"
          >
            <Icon icon="lucide:skip-forward" class="mr-1" />
            跳过
          </ElButton>

          <ElButton v-else type="warning" :loading="saving" @click="revokeSkip">
            <Icon icon="lucide:undo" class="mr-1" />
            撤回
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

    <!-- 任务信息卡片 -->
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

/* 响应式设计 */
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
