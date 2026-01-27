<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElDatePicker,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElUpload,
} from 'element-plus';

// 文件上传相关API
import {
  deleteProcessFileApi,
  downloadProcessFileApi,
  getProcessFileListApi,
  update2Api,
  update3Api,
  update4Api,
  update6Api,
  uploadProcessFileApi,
} from '#/api/core/case-process';
import {
  addAccountClosingApi,
  addAccountSealManagementPhase7Api,
  addAdditionalDistributionApi,
  addArchivingManagementApi,
  addCancellationRegistrationApi,
  addDocumentTransferApi,
  addDutyReportApi,
  addSealDestructionApi,
  addTerminationLitigationApi,
} from '#/api/core/case-process';
import {
  addBankExpensesApi,
  addBankruptcyDistPlanApi,
  addBankruptcyProcedureTerminationApi,
  addBusinessManagementApi,
  addContractManagementApi,
  addCreditorClaimApi,
  addDepositManagementApi,
  addEmergencyApi,
  addEmployeeSettlementPlanApi,
  addInternalAffairsApi,
  addLegalProcedureApi,
  addLitigationArbitrationApi,
  addManagementApi,
  addPersonnelEmploymentApi,
  addPriorityPaymentApi,
  addPropertyDistributionExecutionApi,
  addPropertyInvestigationApi,
  addPropertyPlanApi,
  addPropertyReceiptApi,
  addReclaimReviewApi,
  addRightsClaimApi,
  addSealManagementApi,
  addSocialSecurtyFeesApi,
  addTaxVerificationApi,
  unifiedTaskOperationApi,
} from '#/api/core/case-process';

defineOptions({
  name: 'TaskEdit',
});

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

// 第二阶段任务类型到OperateType的映射
const secondStageOperateTypeMap: Record<string, number> = {
  propertyReceipt: 0,
  emergency: 1,
  propertyPlan: 2,
  personnelEmp: 3,
  internalAffairs: 4,
  contractManagement: 5,
  businessManagement: 6,
};

interface Props {
  caseId: string;
  taskType: string;
  taskData?: any;
  mode: 'add' | 'complete' | 'edit' | 'revoke' | 'skip' | 'view';
}

interface Emits {
  (e: 'close'): void;
  (e: 'saved'): void;
}

const loading = ref(false);
const formRef = ref();
const formData = reactive<any>({});
const activeTab = ref('upload');
const fileList = ref<any[]>([]);
const uploadLoading = ref(false);
const fileListLoading = ref(false);
const uploadProgress = ref(0);

const taskFormConfig: Record<string, any> = {
  management: {
    title: '管理制度',
    operateType: 7,
    addApi: addManagementApi,
    updateApi: async (data: any) => {
      const { updateManagementApi } = await import('#/api/core/case-process');
      return updateManagementApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteManagementApi } = await import('#/api/core/case-process');
      return deleteManagementApi(id);
    },
    fields: [
      {
        label: '制度类型',
        prop: 'zdlx',
        type: 'select',
        options: [
          '人事管理制度',
          '财务管理制度',
          '行政管理制度',
          '业务管理制度',
          '安保维护制度',
        ],
      },
      { label: '制度名称', prop: 'zdmc', type: 'input', required: true },
      { label: '制度内容', prop: 'zdnr', type: 'textarea', required: true },
      { label: '生效日期', prop: 'sxrq', type: 'date' },
    ],
  },
  sealManagement: {
    title: '印章管理',
    operateType: 8,
    addApi: addSealManagementApi,
    updateApi: async (data: any) => {
      const { updateSealManagementApi } =
        await import('#/api/core/case-process');
      return updateSealManagementApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteSealManagementApi } =
        await import('#/api/core/case-process');
      return deleteSealManagementApi(id);
    },
    fields: [
      {
        label: '管理类型',
        prop: 'gllx',
        type: 'select',
        options: ['账户管理', '印章管理'],
      },
      { label: '项目名称', prop: 'xmmc', type: 'input', required: true },
      { label: '处理日期', prop: 'clrq', type: 'date' },
      { label: '处理方式', prop: 'clfs', type: 'input' },
      { label: '处理结果', prop: 'cljg', type: 'textarea' },
      { label: '证明文件路径', prop: 'zmwjlj', type: 'input' },
    ],
  },
  legalProcedure: {
    title: '法律程序',
    operateType: 9,
    addApi: addLegalProcedureApi,
    updateApi: async (data: any) => {
      const { updateLegalProcedureApi } =
        await import('#/api/core/case-process');
      return updateLegalProcedureApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteLegalProcedureApi } =
        await import('#/api/core/case-process');
      return deleteLegalProcedureApi(id);
    },
    fields: [
      {
        label: '程序类型',
        prop: 'cxlx',
        type: 'select',
        options: ['诉讼程序', '仲裁程序', '行政复议', '其他'],
      },
      { label: '程序内容', prop: 'cxnr', type: 'textarea', required: true },
      { label: '执行日期', prop: 'zhrq', type: 'date' },
      { label: '负责人', prop: 'fzr', type: 'input', required: true },
    ],
  },
  propertyReceipt: {
    title: '财产接收',
    operateType: 0,
    addApi: addPropertyReceiptApi,
    fields: [
      { label: '交接会议日期', prop: 'JJHYRQ', type: 'date' },
      { label: '参会人员', prop: 'CHRY', type: 'input' },
      { label: '财产状况说明', prop: 'CCZKSM', type: 'textarea' },
      { label: '交接日期', prop: 'JJRQ', type: 'date' },
      { label: '交接人', prop: 'JJR', type: 'input' },
      { label: '接收人', prop: 'JSR', type: 'input' },
      { label: '接收状态', prop: 'JSZT', type: 'input' },
      { label: '财产类型', prop: 'CCLX', type: 'input' },
      { label: '财产名称', prop: 'CCMC', type: 'input' },
      { label: '财产金额', prop: 'CCJE', type: 'input' },
      { label: '存放地点', prop: 'CFDD', type: 'input' },
    ],
  },
  emergency: {
    title: '应急管理',
    operateType: 1,
    addApi: addEmergencyApi,
    fields: [
      { label: '负责人', prop: 'FZR', type: 'input' },
      { label: '安保措施', prop: 'ABCS', type: 'textarea' },
      { label: '保险信息', prop: 'BXXX', type: 'textarea' },
      { label: '贬值财产处理', prop: 'BZCCCL', type: 'textarea' },
      { label: '权利时效与期间', prop: 'QLSXYQJ', type: 'textarea' },
    ],
  },
  propertyPlan: {
    title: '财产方案管理',
    operateType: 2,
    addApi: addPropertyPlanApi,
    fields: [
      { label: '方案名称', prop: 'FAMC', type: 'input' },
      { label: '不动产管理措施', prop: 'BDCGLCS', type: 'textarea' },
      { label: '动产管理措施', prop: 'DCGLCS', type: 'textarea' },
      { label: '货币财产管理措施', prop: 'HBCCGLCS', type: 'textarea' },
      { label: '无形财产管理措施', prop: 'WXCCGLCS', type: 'textarea' },
      { label: '对外投资管理措施', prop: 'DWTZGLCS', type: 'textarea' },
    ],
  },
  personnelEmp: {
    title: '人员聘用',
    operateType: 3,
    addApi: addPersonnelEmploymentApi,
    fields: [
      { label: '员工姓名', prop: 'YGXM', type: 'input', required: true },
      { label: '员工类型', prop: 'YGLX', type: 'input' },
      { label: '职位', prop: 'ZW', type: 'input' },
      { label: '聘用日期', prop: 'PYRQ', type: 'date' },
      { label: '薪酬信息', prop: 'XCXX', type: 'textarea' },
      { label: '法院批准情况', prop: 'FYPZQK', type: 'textarea' },
      { label: '聘用状态', prop: 'PYZT', type: 'input' },
    ],
  },
  internalAffairs: {
    title: '内部事务管理',
    operateType: 4,
    addApi: addInternalAffairsApi,
    fields: [
      { label: '事务类型', prop: 'SWLX', type: 'input', required: true },
      { label: '事务内容', prop: 'SWNR', type: 'textarea', required: true },
      { label: '决定日期', prop: 'JDRQ', type: 'date' },
      { label: '决定人', prop: 'JDR', type: 'input' },
      { label: '开支金额', prop: 'KZJE', type: 'input' },
      { label: '开支说明', prop: 'KZSM', type: 'textarea' },
      { label: '处理状态', prop: 'CLZT', type: 'input' },
    ],
  },
  contractManagement: {
    title: '合同管理',
    operateType: 5,
    addApi: addContractManagementApi,
    fields: [
      { label: '合同类型', prop: 'HTLX', type: 'input', required: true },
      { label: '合同名称', prop: 'HTMC', type: 'input', required: true },
      { label: '合同相对方', prop: 'HTXDF', type: 'input' },
      { label: '合同内容', prop: 'HTNR', type: 'textarea' },
      { label: '履行状态', prop: 'LHZT', type: 'input' },
      { label: '审查日期', prop: 'SCRQ', type: 'date' },
      { label: '审查人', prop: 'SCR', type: 'input' },
    ],
  },
  businessManagement: {
    title: '营业管理',
    operateType: 6,
    addApi: addBusinessManagementApi,
    fields: [
      {
        label: '营业情况调查',
        prop: 'YYQKTC',
        type: 'textarea',
        required: true,
      },
      { label: '分析论证报告', prop: 'FXLZBG', type: 'textarea' },
      { label: '决定内容', prop: 'JDNR', type: 'textarea', required: true },
      { label: '法院批准日期', prop: 'FYPZRQ', type: 'date' },
      { label: '实施状态', prop: 'SSZT', type: 'input' },
      { label: '负责人', prop: 'FZR', type: 'input', required: true },
    ],
  },
  propertyInvestigation: {
    title: '财产调查',
    operateType: 0,
    addApi: addPropertyInvestigationApi,
    fields: [
      { label: '调查类型', prop: 'tclx', type: 'input', required: true },
      { label: '调查内容', prop: 'tcnr', type: 'textarea', required: true },
      { label: '调查日期', prop: 'tcrq', type: 'date', required: true },
      { label: '调查人', prop: 'tcr', type: 'input', required: true },
      { label: '调查发现', prop: 'tcfx', type: 'textarea' },
      { label: '调查状态', prop: 'tczt', type: 'input' },
    ],
  },
  bankExpenses: {
    title: '破产费用管理',
    operateType: 1,
    addApi: addBankExpensesApi,
    fields: [
      { label: '费用类型', prop: 'fylx', type: 'input', required: true },
      { label: '费用名称', prop: 'fymc', type: 'input', required: true },
      { label: '金额', prop: 'je', type: 'input', required: true },
      { label: '支付日期', prop: 'zfrq', type: 'date' },
      { label: '支付状态', prop: 'zfzt', type: 'input' },
    ],
  },
  rightsClaim: {
    title: '权利主张',
    operateType: 2,
    addApi: addRightsClaimApi,
    fields: [
      { label: '主张类型', prop: 'zzlxcx', type: 'input', required: true },
      { label: '主张内容', prop: 'zznr', type: 'textarea', required: true },
      { label: '主张日期', prop: 'zzrq', type: 'date', required: true },
      { label: '主张人', prop: 'zzr', type: 'input', required: true },
      { label: '法院回应', prop: 'fyhy', type: 'textarea' },
      { label: '主张状态', prop: 'zzzt', type: 'input' },
    ],
  },
  reclaimReview: {
    title: '取回权审查',
    operateType: 3,
    addApi: addReclaimReviewApi,
    fields: [
      { label: '权利人名称', prop: 'qlrmc', type: 'input', required: true },
      { label: '取回权基础', prop: 'qhqjc', type: 'textarea', required: true },
      { label: '财产是否存在', prop: 'ccsfcz', type: 'input' },
      { label: '对待给付义务', prop: 'ddgfyw', type: 'textarea' },
      { label: '审查日期', prop: 'scrq', type: 'date' },
      { label: '审查人', prop: 'scr', type: 'input' },
      { label: '审查决定', prop: 'scjd', type: 'input' },
    ],
  },
  litigationArbitration: {
    title: '诉讼仲裁',
    operateType: 4,
    addApi: addLitigationArbitrationApi,
    fields: [
      { label: '类型', prop: 'lx', type: 'input', required: true },
      { label: '相对方', prop: 'xdf', type: 'input' },
      { label: '法院', prop: 'fy', type: 'input' },
      { label: '诉讼内容', prop: 'ssnr', type: 'textarea', required: true },
      { label: '诉讼状态', prop: 'sszt', type: 'input' },
    ],
  },
  creditorClaim: {
    title: '债权申报',
    operateType: 5,
    addApi: addCreditorClaimApi,
    fields: [
      { label: '债权人名称', prop: 'zqzqrmc', type: 'input', required: true },
      { label: '债权人类型', prop: 'zqzqrlx', type: 'input' },
      { label: '债权人身份证号', prop: 'zqzqrsfzh', type: 'input' },
      { label: '债权人电话', prop: 'zqzqrdh', type: 'input' },
      { label: '债权人地址', prop: 'zqzqrdz', type: 'textarea' },
      { label: '债权金额', prop: 'zqzqjje', type: 'input', required: true },
      { label: '债权金额币种', prop: 'zqzqjjebz', type: 'input' },
      { label: '债权时间', prop: 'zqzqjzqsj', type: 'date' },
      { label: '债权时间备注', prop: 'zqzqjzqsjbz', type: 'textarea' },
      { label: '债权时间证据', prop: 'zqzqjzqsjzdy', type: 'textarea' },
      { label: '债权时间证据地址', prop: 'zqzqjzqsjzdydz', type: 'textarea' },
      {
        label: '债权时间证据地址备注',
        prop: 'zqzqjzqsjzdydzbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话',
        prop: 'zqzqjzqsjzdydzlxdh',
        type: 'input',
      },
      {
        label: '债权时间证据地址联系电话备注',
        prop: 'zqzqjzqsjzdydzlxdhbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话邮箱',
        prop: 'zqzqjzqsjzdydzlxdhyx',
        type: 'input',
      },
      {
        label: '债权时间证据地址联系电话邮箱备注',
        prop: 'zqzqjzqsjzdydzlxdhyxbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话证件',
        prop: 'zqzqjzqsjzdydzlxdhzj',
        type: 'input',
      },
      {
        label: '债权时间证据地址联系电话证件备注',
        prop: 'zqzqjzqsjzdydzlxdhzjbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话证件类型',
        prop: 'zqzqjzqsjzdydzlxdhzjlx',
        type: 'input',
      },
      {
        label: '债权时间证据地址联系电话证件类型备注',
        prop: 'zqzqjzqsjzdydzlxdhzjlxbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmc',
        type: 'input',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称备注',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmcbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称地址',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmcdz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称地址备注',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmcdzbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称地址电话',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmcdzdh',
        type: 'input',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称地址电话备注',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmcdzdhbz',
        type: 'textarea',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称地址电话邮箱',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmcdzdhyx',
        type: 'input',
      },
      {
        label: '债权时间证据地址联系电话证件类型名称地址电话邮箱备注',
        prop: 'zqzqjzqsjzdydzlxdhzjlxmcdzdhyxbz',
        type: 'textarea',
      },
    ],
  },
  socialSecurityFees: {
    title: '社保费用',
    operateType: 6,
    addApi: addSocialSecurtyFeesApi,
    fields: [
      { label: '费用类型', prop: 'fylx', type: 'input', required: true },
      { label: '费用金额', prop: 'fyje', type: 'input', required: true },
      { label: '社保机构', prop: 'sbjg', type: 'input' },
      { label: '核定日期', prop: 'hdrq', type: 'date' },
      { label: '核定人', prop: 'hdr', type: 'input' },
      { label: '核定状态', prop: 'hdzt', type: 'input' },
    ],
  },
  taxVerification: {
    title: '税收核定',
    operateType: 7,
    addApi: addTaxVerificationApi,
    fields: [
      { label: '税种', prop: 'sz', type: 'input', required: true },
      { label: '税款金额', prop: 'skje', type: 'input', required: true },
      { label: '税务机关', prop: 'swjg', type: 'input' },
      { label: '核定日期', prop: 'hdrq', type: 'date' },
      { label: '核定人', prop: 'hdr', type: 'input' },
      { label: '核定状态', prop: 'hdzt', type: 'input' },
    ],
  },
  session: {
    title: '债权人会议',
    operateType: 0,
    addApi: async (data: any) => {
      const { addSessionApi } = await import('#/api/core/case-process');
      return addSessionApi(data);
    },
    fields: [
      { label: '会议名称', prop: 'hymc', type: 'input', required: true },
      { label: '会议开始时间', prop: 'hykssj', type: 'date', required: true },
      { label: '会议主题', prop: 'hyzt', type: 'input' },
      { label: '会议地点', prop: 'hydd', type: 'input' },
      { label: '参会人员', prop: 'chry', type: 'input' },
      { label: '会议议程', prop: 'hycj', type: 'textarea' },
      { label: '会议结果', prop: 'hyjg', type: 'textarea' },
    ],
  },
  meetingDocuments: {
    title: '债权人会议文件管理',
    operateType: 1,
    addApi: async (data: any) => {
      const { addMeetingDocumentsApi } =
        await import('#/api/core/case-process');
      return addMeetingDocumentsApi(data);
    },
    fields: [
      { label: '文件类型', prop: 'wjlx', type: 'input', required: true },
      { label: '文件名称', prop: 'wjmc', type: 'input', required: true },
      { label: '文件内容', prop: 'wjnr', type: 'textarea' },
      { label: '提交日期', prop: 'tjrq', type: 'date' },
      { label: '审批状态', prop: 'spzt', type: 'input' },
      { label: '会议名称', prop: 'hymc', type: 'input' },
    ],
  },
  claimConfirmation: {
    title: '债权确认',
    operateType: 2,
    addApi: async (data: any) => {
      const { addClaimConfirmationApi } =
        await import('#/api/core/case-process');
      return addClaimConfirmationApi(data);
    },
    fields: [
      { label: '法院裁定日期', prop: 'fycdrq', type: 'date' },
      { label: '裁定文号', prop: 'cdwh', type: 'input' },
      { label: '最终金额', prop: 'zzje', type: 'input' },
      { label: '申报金额', prop: 'sbje', type: 'input' },
      { label: '申报ID', prop: 'sbid', type: 'input' },
    ],
  },
  remunerationPlan: {
    title: '报酬方案',
    operateType: 3,
    addApi: async (data: any) => {
      const { addRemunerationPlanApi } =
        await import('#/api/core/case-process');
      return addRemunerationPlanApi(data);
    },
    fields: [
      { label: '方案内容', prop: 'fanr', type: 'textarea', required: true },
      { label: '报酬金额', prop: 'bcje', type: 'input' },
      { label: '计算依据', prop: 'jsyj', type: 'textarea' },
      { label: '会议表决结果', prop: 'hybjjg', type: 'input' },
      { label: '异议处理情况', prop: 'yyclqk', type: 'textarea' },
      { label: '法院批准日期', prop: 'fypzrq', type: 'date' },
      { label: '方案状态', prop: 'fazt', type: 'input' },
    ],
  },
  importantActions: {
    title: '重要行为报告',
    operateType: 4,
    addApi: async (data: any) => {
      const { addImporantActionsApi } = await import('#/api/core/case-process');
      return addImporantActionsApi(data);
    },
    fields: [
      { label: '行为类型', prop: 'hwlx', type: 'input', required: true },
      { label: '行为内容', prop: 'hwnr', type: 'textarea', required: true },
      { label: '行为日期', prop: 'hwrq', type: 'date' },
      { label: '报告日期', prop: 'bgrq', type: 'date' },
      { label: '报告接收方', prop: 'bgjsf', type: 'input' },
      { label: '批准状态', prop: 'pzzt', type: 'input' },
      { label: '影响评估', prop: 'yxpg', type: 'textarea' },
    ],
  },
  setoffReview: {
    title: '抵消权审查',
    operateType: 5,
    addApi: async (data: any) => {
      const { addSetoffReviewApi } = await import('#/api/core/case-process');
      return addSetoffReviewApi(data);
    },
    fields: [
      { label: '债权人名称', prop: 'zqrmc', type: 'input', required: true },
      { label: '抵消金额', prop: 'dxje', type: 'input' },
      { label: '抵消依据', prop: 'dxyj', type: 'textarea' },
      { label: '审查日期', prop: 'scrq', type: 'date' },
      { label: '审查人', prop: 'scr', type: 'input' },
      { label: '审查决定', prop: 'scjd', type: 'input' },
      { label: '差额金额', prop: 'ceje', type: 'input' },
    ],
  },
  auditReport: {
    title: '审计报告',
    operateType: 6,
    addApi: async (data: any) => {
      const { addAuditReportApi } = await import('#/api/core/case-process');
      return addAuditReportApi(data);
    },
    fields: [
      { label: '审计机构', prop: 'sjjg', type: 'input', required: true },
      { label: '审计日期', prop: 'sjrq', type: 'date' },
      { label: '审计内容', prop: 'sjnr', type: 'textarea' },
      { label: '破产条件认定', prop: 'pctjrd', type: 'textarea' },
      { label: '提交日期', prop: 'tjrq', type: 'date' },
      { label: '提交人', prop: 'tjr', type: 'input' },
      { label: '法院回应', prop: 'fyhy', type: 'textarea' },
    ],
  },
  assetValuation: {
    title: '资产评估',
    operateType: 7,
    addApi: async (data: any) => {
      const { addAssetValuationApi } = await import('#/api/core/case-process');
      return addAssetValuationApi(data);
    },
    fields: [
      { label: '评估机构', prop: 'pgjg', type: 'input', required: true },
      { label: '评估日期', prop: 'pgrq', type: 'date' },
      { label: '评估内容', prop: 'pgnr', type: 'textarea' },
      { label: '评估总值', prop: 'pgzz', type: 'input' },
      { label: '评估报告路径', prop: 'pgbglj', type: 'input' },
      { label: '审批状态', prop: 'spzt', type: 'input' },
    ],
  },
  propertyVPlan: {
    title: '财产变价方案',
    operateType: 8,
    addApi: async (data: any) => {
      const { addPropertyVPlanApi } = await import('#/api/core/case-process');
      return addPropertyVPlanApi(data);
    },
    fields: [
      { label: '方案名称', prop: 'famc', type: 'input', required: true },
      { label: '方案内容', prop: 'fanr', type: 'textarea', required: true },
      { label: '变价方式', prop: 'bjfs', type: 'input' },
      { label: '预期金额', prop: 'yqje', type: 'input' },
      { label: '会议表决结果', prop: 'hybjjg', type: 'input' },
      { label: '法院批准日期', prop: 'fypzrq', type: 'date' },
      { label: '方案状态', prop: 'fazt', type: 'input' },
    ],
  },
  auctionAgency: {
    title: '拍卖机构',
    operateType: 9,
    addApi: async (data: any) => {
      const { addAuctionAgencyApi } = await import('#/api/core/case-process');
      return addAuctionAgencyApi(data);
    },
    fields: [
      { label: '机构名称', prop: 'jgmc', type: 'input', required: true },
      { label: '机构类型', prop: 'jglx', type: 'input' },
      { label: '合同签订日期', prop: 'htqdrq', type: 'date' },
      { label: '合同内容', prop: 'htnr', type: 'textarea' },
      { label: '佣金比例', prop: 'yjbl', type: 'input' },
      { label: '合作状态', prop: 'hzzt', type: 'input' },
    ],
  },
  bankruptcyDeclaration: {
    title: '破产宣告',
    operateType: 10,
    addApi: async (data: any) => {
      const { addBankruptcyDeclarationApi } =
        await import('#/api/core/case-process');
      return addBankruptcyDeclarationApi(data);
    },
    fields: [
      { label: '宣告日期', prop: 'xgrq', type: 'date', required: true },
      { label: '法院裁定文号', prop: 'fycdwh', type: 'input' },
      { label: '宣告依据', prop: 'xgyj', type: 'textarea' },
      { label: '财产核查记录', prop: 'cchcjl', type: 'textarea' },
      { label: '破产费用总额', prop: 'pcfyze', type: 'input' },
    ],
  },
  propertyVImpl: {
    title: '财产变价实施',
    operateType: 11,
    addApi: async (data: any) => {
      const { addPropertyVImplApi } = await import('#/api/core/case-process');
      return addPropertyVImplApi(data);
    },
    fields: [
      { label: '财产名称', prop: 'ccmc', type: 'input', required: true },
      { label: '财产类型', prop: 'cclx', type: 'input' },
      { label: '变价金额', prop: 'bjje', type: 'input' },
      { label: '实施日期', prop: 'ssrq', type: 'date' },
      { label: '实施方式', prop: 'ssfs', type: 'input' },
      { label: '买方信息', prop: 'mfxx', type: 'textarea' },
      { label: '实施状态', prop: 'sszt', type: 'input' },
      { label: '参考方案', prop: 'ckfa', type: 'input' },
    ],
  },
  bankruptcyDistPlan: {
    title: '破产财产分配方案',
    operateType: 0,
    addApi: addBankruptcyDistPlanApi,
    fields: [
      { label: '方案名称', prop: 'famc', type: 'input', required: true },
      { label: '方案内容', prop: 'fanr', type: 'textarea', required: true },
      { label: '可分配总额', prop: 'kfpze', type: 'input', required: true },
      { label: '会议表决结果', prop: 'hybjjg', type: 'input' },
      { label: '法院批准日期', prop: 'fypzrq', type: 'date' },
      { label: '实施日期', prop: 'ssrq', type: 'date' },
      { label: '方案状态', prop: 'fazt', type: 'input' },
    ],
  },
  employeeSettlementPlan: {
    title: '职工安置方案',
    operateType: 1,
    addApi: addEmployeeSettlementPlanApi,
    fields: [
      {
        label: '安置方案内容',
        prop: 'azfanr',
        type: 'textarea',
        required: true,
      },
      { label: '安置总金额', prop: 'azzje', type: 'input', required: true },
      { label: '涉及职工人数', prop: 'sjzgrs', type: 'input' },
      { label: '批准日期', prop: 'pzrq', type: 'date' },
      { label: '实施状态', prop: 'sszt', type: 'input' },
      { label: '负责人', prop: 'fzr', type: 'input' },
      { label: '安置类型', prop: 'azlx', type: 'input' },
    ],
  },
  priorityPayment: {
    title: '优先受偿管理',
    operateType: 2,
    addApi: addPriorityPaymentApi,
    fields: [
      { label: '债权人类型', prop: 'zqrlx', type: 'input', required: true },
      { label: '债权人名称', prop: 'zqrmc', type: 'input', required: true },
      { label: '支付金额', prop: 'zfje', type: 'input', required: true },
      { label: '支付日期', prop: 'zfrq', type: 'date' },
      { label: '支付方式', prop: 'zffs', type: 'input' },
      { label: '支付依据', prop: 'zfyj', type: 'textarea' },
      { label: '支付状态', prop: 'zfzt', type: 'input' },
    ],
  },
  propertyDistributionExecution: {
    title: '财产分配执行',
    operateType: 3,
    addApi: addPropertyDistributionExecutionApi,
    fields: [
      { label: '分配类型', prop: 'fplx', type: 'input', required: true },
      { label: '债权人名称', prop: 'zqrmc', type: 'input', required: true },
      { label: '分配金额', prop: 'fpje', type: 'input', required: true },
      { label: '分配日期', prop: 'fprq', type: 'date' },
      { label: '分配方式', prop: 'fpfs', type: 'input' },
      { label: '收据确认', prop: 'sjqr', type: 'input' },
      { label: '执行状态', prop: 'zhzt', type: 'input' },
      { label: '优先级别', prop: 'yxjb', type: 'input' },
    ],
  },
  depositManagement: {
    title: '提存管理',
    operateType: 4,
    addApi: addDepositManagementApi,
    fields: [
      { label: '提存类型', prop: 'tclx', type: 'input', required: true },
      { label: '债权人名称', prop: 'zqrmc', type: 'input', required: true },
      { label: '提存金额', prop: 'tcje', type: 'input', required: true },
      { label: '提存日期', prop: 'tcrq', type: 'date' },
      { label: '提存机构', prop: 'tcjg', type: 'input' },
      { label: '提存原因', prop: 'tcyy', type: 'textarea' },
      { label: '提存状态', prop: 'tczt', type: 'input' },
    ],
  },
  bankruptcyProcedureTermination: {
    title: '破产程序终结',
    operateType: 5,
    addApi: addBankruptcyProcedureTerminationApi,
    fields: [
      { label: '终结原因', prop: 'zjyy', type: 'textarea', required: true },
      { label: '终结日期', prop: 'zjrq', type: 'date' },
      { label: '法院裁定文号', prop: 'fycdwh', type: 'input' },
      { label: '分配报告', prop: 'fpbg', type: 'textarea' },
      { label: '提交日期', prop: 'tjrq', type: 'date' },
      { label: '法院批准日期', prop: 'fypzrq', type: 'date' },
      { label: '终结状态', prop: 'zjzt', type: 'input' },
    ],
  },
  cancellationRegistration: {
    title: '注销登记',
    operateType: 0,
    addApi: addCancellationRegistrationApi,
    updateApi: async (data: any) => {
      const { updateCancellationRegistrationApi } =
        await import('#/api/core/case-process');
      return updateCancellationRegistrationApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteCancellationRegistrationApi } =
        await import('#/api/core/case-process');
      return deleteCancellationRegistrationApi(id);
    },
    fields: [
      {
        label: '注销类型',
        prop: 'zxlx',
        type: 'select',
        options: ['简易注销', '一般注销', '吊销转注销'],
      },
      { label: '登记机关', prop: 'djjg', type: 'input', required: true },
      { label: '申请日期', prop: 'sqrq', type: 'date' },
      { label: '注销日期', prop: 'zxrq', type: 'date' },
      { label: '注销文号', prop: 'zxwh', type: 'input' },
      {
        label: '注销状态',
        prop: 'zxzt',
        type: 'select',
        options: ['待审核', '已注销', '已驳回'],
      },
      { label: '登记事项', prop: 'djsx', type: 'textarea' },
      { label: '登记号码', prop: 'djhm', type: 'input' },
      { label: '注销原因', prop: 'zxyy', type: 'textarea' },
      { label: '处理人', prop: 'clr', type: 'input' },
    ],
  },
  terminationLitigation: {
    title: '终结诉讼仲裁',
    operateType: 1,
    addApi: addTerminationLitigationApi,
    updateApi: async (data: any) => {
      const { updateTerminationLitigationApi } =
        await import('#/api/core/case-process');
      return updateTerminationLitigationApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteTerminationLitigationApi } =
        await import('#/api/core/case-process');
      return deleteTerminationLitigationApi(id);
    },
    fields: [
      {
        label: '诉讼类型',
        prop: 'sslx',
        type: 'select',
        options: ['诉讼', '仲裁'],
      },
      { label: '相对方', prop: 'xdf', type: 'input', required: true },
      { label: '法院/仲裁机构', prop: 'fyzcjg', type: 'input' },
      {
        label: '诉讼状态',
        prop: 'sszt',
        type: 'select',
        options: ['进行中', '已终结', '已撤诉'],
      },
      { label: '处理结果', prop: 'cljg', type: 'textarea' },
    ],
  },
  additionalDistribution: {
    title: '追加分配',
    operateType: 2,
    addApi: addAdditionalDistributionApi,
    updateApi: async (data: any) => {
      const { updateAdditionalDistributionApi } =
        await import('#/api/core/case-process');
      return updateAdditionalDistributionApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteAdditionalDistributionApi } =
        await import('#/api/core/case-process');
      return deleteAdditionalDistributionApi(id);
    },
    fields: [
      {
        label: '分配类型',
        prop: 'fplx',
        type: 'select',
        options: ['追加分配', '补充分配'],
      },
      { label: '分配金额', prop: 'fpje', type: 'input', required: true },
      { label: '分配日期', prop: 'fprq', type: 'date' },
      { label: '债权人名称', prop: 'zqrmc', type: 'input', required: true },
      { label: '分配依据', prop: 'fpyj', type: 'textarea' },
      {
        label: '分配状态',
        prop: 'fpzt',
        type: 'select',
        options: ['待分配', '已分配', '已完成'],
      },
    ],
  },
  accountSealManagement: {
    title: '账户印章管理',
    operateType: 3,
    addApi: addAccountSealManagementPhase7Api,
    updateApi: async (data: any) => {
      const { updateAccountSealManagementPhase7Api } =
        await import('#/api/core/case-process');
      return updateAccountSealManagementPhase7Api(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteAccountSealManagementPhase7Api } =
        await import('#/api/core/case-process');
      return deleteAccountSealManagementPhase7Api(id);
    },
    fields: [
      {
        label: '管理类型',
        prop: 'gllx',
        type: 'select',
        options: ['账户管理', '印章管理'],
      },
      { label: '项目名称', prop: 'xmmc', type: 'input', required: true },
      { label: '处理日期', prop: 'clrq', type: 'date' },
      { label: '处理方式', prop: 'clfs', type: 'input' },
      { label: '处理结果', prop: 'cljg', type: 'textarea' },
      { label: '证明文件路径', prop: 'zmwjlj', type: 'input' },
    ],
  },
  dutyReport: {
    title: '职务报告',
    operateType: 4,
    addApi: addDutyReportApi,
    updateApi: async (data: any) => {
      const { updateDutyReportApi } = await import('#/api/core/case-process');
      return updateDutyReportApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteDutyReportApi } = await import('#/api/core/case-process');
      return deleteDutyReportApi(id);
    },
    fields: [
      {
        label: '报告类型',
        prop: 'bglx',
        type: 'select',
        options: ['职务变动报告', '履职报告', '离任审计报告'],
      },
      { label: '报告内容', prop: 'bgnr', type: 'textarea', required: true },
      { label: '提交日期', prop: 'tjrq', type: 'date' },
      { label: '提交人', prop: 'tjr', type: 'input' },
      { label: '接收方', prop: 'jsf', type: 'input' },
      {
        label: '审批状态',
        prop: 'spzt',
        type: 'select',
        options: ['待审批', '已审批', '已驳回'],
      },
    ],
  },
  documentTransfer: {
    title: '资料移交',
    operateType: 5,
    addApi: addDocumentTransferApi,
    updateApi: async (data: any) => {
      const { updateDocumentTransferApi } =
        await import('#/api/core/case-process');
      return updateDocumentTransferApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteDocumentTransferApi } =
        await import('#/api/core/case-process');
      return deleteDocumentTransferApi(id);
    },
    fields: [
      {
        label: '移交类型',
        prop: 'yjlx',
        type: 'select',
        options: ['档案移交', '财务移交', '资产移交', '印章移交'],
      },
      { label: '资料名称', prop: 'zlmc', type: 'input', required: true },
      { label: '移交日期', prop: 'yjrq', type: 'date' },
      { label: '移交方', prop: 'yjf', type: 'input' },
      { label: '接收方', prop: 'jsf', type: 'input' },
      { label: '移交内容', prop: 'yjnr', type: 'textarea' },
    ],
  },
  archivingManagement: {
    title: '归档管理',
    operateType: 6,
    addApi: addArchivingManagementApi,
    updateApi: async (data: any) => {
      const { updateArchivingManagementApi } =
        await import('#/api/core/case-process');
      return updateArchivingManagementApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteArchivingManagementApi } =
        await import('#/api/core/case-process');
      return deleteArchivingManagementApi(id);
    },
    fields: [
      {
        label: '归档类型',
        prop: 'gdlx',
        type: 'select',
        options: ['案件归档', '财务归档', '文书归档'],
      },
      { label: '归档内容', prop: 'gdnr', type: 'textarea', required: true },
      { label: '归档日期', prop: 'gdrq', type: 'date' },
      { label: '归档位置', prop: 'gdwz', type: 'input' },
      { label: '负责人', prop: 'fzr', type: 'input' },
      {
        label: '归档状态',
        prop: 'gdzt',
        type: 'select',
        options: ['待归档', '已归档'],
      },
      { label: '档案号', prop: 'dah', type: 'input' },
    ],
  },
  sealDestruction: {
    title: '印章销毁',
    operateType: 7,
    addApi: addSealDestructionApi,
    updateApi: async (data: any) => {
      const { updateSealDestructionApi } =
        await import('#/api/core/case-process');
      return updateSealDestructionApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteSealDestructionApi } =
        await import('#/api/core/case-process');
      return deleteSealDestructionApi(id);
    },
    fields: [
      {
        label: '印章类型',
        prop: 'yzlx',
        type: 'select',
        options: ['公章', '财务章', '合同章', '法人章', '其他印章'],
      },
      { label: '印章编号', prop: 'yzbh', type: 'input', required: true },
      { label: '销毁日期', prop: 'xhrq', type: 'date' },
      { label: '销毁方式', prop: 'xhfs', type: 'input' },
      { label: '销毁见证人', prop: 'xhjzr', type: 'input' },
      { label: '证明文件', prop: 'zmwj', type: 'input' },
      { label: '印章', prop: 'yz', type: 'textarea' },
    ],
  },
  accountClosing: {
    title: '账户销户',
    operateType: 8,
    addApi: addAccountClosingApi,
    updateApi: async (data: any) => {
      const { updateAccountClosingApi } =
        await import('#/api/core/case-process');
      return updateAccountClosingApi(data);
    },
    deleteApi: async (id: number | string) => {
      const { deleteAccountClosingApi } =
        await import('#/api/core/case-process');
      return deleteAccountClosingApi(id);
    },
    fields: [
      { label: '账户', prop: 'zh', type: 'input', required: true },
      { label: '销户日期', prop: 'xhrq', type: 'date' },
      { label: '销户原因', prop: 'xhyy', type: 'textarea' },
      { label: '余额金额', prop: 'yeje', type: 'input' },
      {
        label: '销户状态',
        prop: 'xhzt',
        type: 'select',
        options: ['待销户', '已销户', '已驳回'],
      },
    ],
  },
};

const currentConfig = computed(() => {
  const config = taskFormConfig[props.taskType] || taskFormConfig.management;
  return {
    ...config,
    fields: config.fields || [],
  };
});

const dialogTitle = computed(() => {
  const modeText: Record<string, string> = {
    add: '新增',
    edit: '编辑',
    view: '查看',
    complete: '完成',
    skip: '跳过',
    revoke: '撤回',
  };
  const config = currentConfig.value;
  if (!config) {
    return modeText[props.mode] || '';
  }
  return `${modeText[props.mode]}${config.title}`;
});

const isReadOnly = computed(() => props.mode === 'view');

const fieldNameMap: Record<string, Record<string, string>> = {
  management: {
    ZDLX: 'zdlx',
    ZDMC: 'zdmc',
    ZDNR: 'zdnr',
    SXRQ: 'sxrq',
  },
  sealManagement: {
    GLLX: 'yzlx',
    XMMC: 'yzmc',
    CLRQ: 'barq',
  },
  legalProcedure: {
    CXLX: 'cxlx',
    CXNR: 'cxnr',
    ZHRQ: 'zhrq',
    FZR: 'fzr',
  },
  propertyReceipt: {
    JJHYRQ: 'JJHYRQ',
    CHRY: 'CHRY',
    CCZKSM: 'CCZKSM',
    JJRQ: 'JJRQ',
    JJR: 'JJR',
    JSR: 'JSR',
    JSZT: 'JSZT',
    CCLX: 'CCLX',
    CCMC: 'CCMC',
    CCJE: 'CCJE',
    CFDD: 'CFDD',
  },
  emergency: {
    FZR: 'FZR',
    ABCS: 'ABCS',
    BXXX: 'BXXX',
    BZCCCL: 'BZCCCL',
    QLSXYQJ: 'QLSXYQJ',
  },
  propertyPlan: {
    FAMC: 'FAMC',
    BDCGLCS: 'BDCGLCS',
    DCGLCS: 'DCGLCS',
    HBCCGLCS: 'HBCCGLCS',
    WXCCGLCS: 'WXCCGLCS',
    DWTZGLCS: 'DWTZGLCS',
  },
  personnelEmp: {
    YGXM: 'YGXM',
    YGLX: 'YGLX',
    ZW: 'ZW',
    PYRQ: 'PYRQ',
    XCXX: 'XCXX',
    FYPZQK: 'FYPZQK',
    PYZT: 'PYZT',
  },
  internalAffairs: {
    SWLX: 'SWLX',
    SWNR: 'SWNR',
    JDRQ: 'JDRQ',
    JDR: 'JDR',
    KZJE: 'KZJE',
    KZSM: 'KZSM',
    CLZT: 'CLZT',
  },
  contractManagement: {
    HTLX: 'HTLX',
    HTMC: 'HTMC',
    HTXDF: 'HTXDF',
    HTNR: 'HTNR',
    LHZT: 'LHZT',
    SCRQ: 'SCRQ',
    SCR: 'SCR',
  },
  businessManagement: {
    YYQKTC: 'YYQKTC',
    FXLZBG: 'FXLZBG',
    JDNR: 'JDNR',
    FYPZRQ: 'FYPZRQ',
    SSZT: 'SSZT',
    FZR: 'FZR',
  },
  propertyInvestigation: {
    investigationType: 'tclx',
    investigationContent: 'tcnr',
    investigationDate: 'tcrq',
    investigator: 'tcr',
    investigationFindings: 'tcfx',
    investigationStatus: 'tczt',
  },
  bankExpenses: {
    expenseType: 'fylx',
    expenseName: 'fymc',
    amount: 'je',
    paymentDate: 'zfrq',
    paymentStatus: 'zfzt',
  },
  rightsClaim: {
    claimType: 'zzlxcx',
    claimContent: 'zznr',
    claimDate: 'zzrq',
    claimant: 'zzr',
    courtResponse: 'fyhy',
    claimStatus: 'zzzt',
  },
  reclaimReview: {
    claimantName: 'qlrmc',
    reclaimRightBasis: 'qhqjc',
    propertyExists: 'ccsfcz',
    reciprocalObligation: 'ddgfyw',
    reviewDate: 'scrq',
    reviewer: 'scr',
    reviewDecision: 'scjd',
  },
  litigationArbitration: {
    type: 'lx',
    oppositeParty: 'xdf',
    court: 'fy',
    litigationContent: 'ssnr',
    litigationStatus: 'sszt',
  },
  creditorClaim: {
    creditorName: 'zqzqrmc',
    creditorType: 'zqzqrlx',
    creditorIdCard: 'zqzqrsfzh',
    creditorPhone: 'zqzqrdh',
    creditorAddress: 'zqzqrdz',
    claimAmount: 'zqzqjje',
    claimCurrency: 'zqzqjjebz',
    claimDate: 'zqzqjzqsj',
    claimDateRemark: 'zqzqjzqsjbz',
    claimEvidence: 'zqzqjzqsjzdy',
    claimEvidenceAddress: 'zqzqjzqsjzdydz',
    claimEvidenceAddressRemark: 'zqzqjzqsjzdydzbz',
    claimEvidenceAddressPhone: 'zqzqjzqsjzdydzlxdh',
    claimEvidenceAddressPhoneRemark: 'zqzqjzqsjzdydzlxdhbz',
    claimEvidenceAddressPhoneEmail: 'zqzqjzqsjzdydzlxdhyx',
    claimEvidenceAddressPhoneEmailRemark: 'zqzqjzqsjzdydzlxdhyxbz',
    claimEvidenceAddressPhoneId: 'zqzqjzqsjzdydzlxdhzj',
    claimEvidenceAddressPhoneIdRemark: 'zqzqjzqsjzdydzlxdhzjbz',
    claimEvidenceAddressPhoneIdType: 'zqzqjzqsjzdydzlxdhzjlx',
    claimEvidenceAddressPhoneIdTypeRemark: 'zqzqjzqsjzdydzlxdhzjlxbz',
    claimEvidenceAddressPhoneIdTypeName: 'zqzqjzqsjzdydzlxdhzjlxmc',
    claimEvidenceAddressPhoneIdTypeNameRemark: 'zqzqjzqsjzdydzlxdhzjlxmcbz',
    claimEvidenceAddressPhoneIdTypeNameAddress: 'zqzqjzqsjzdydzlxdhzjlxmcdz',
    claimEvidenceAddressPhoneIdTypeNameAddressRemark:
      'zqzqjzqsjzdydzlxdhzjlxmcdzbz',
    claimEvidenceAddressPhoneIdTypeNameAddressPhone:
      'zqzqjzqsjzdydzlxdhzjlxmcdzdh',
    claimEvidenceAddressPhoneIdTypeNameAddressPhoneRemark:
      'zqzqjzqsjzdydzlxdhzjlxmcdzdhbz',
    claimEvidenceAddressPhoneIdTypeNameAddressPhoneEmail:
      'zqzqjzqsjzdydzlxdhzjlxmcdzdhyx',
    claimEvidenceAddressPhoneIdTypeNameAddressPhoneEmailRemark:
      'zqzqjzqsjzdydzlxdhzjlxmcdzdhyxbz',
    status: 'zt',
  },
  socialSecurityFees: {
    feeType: 'fylx',
    feeAmount: 'fyje',
    socialSecurityAgency: 'sbjg',
    verificationDate: 'hdrq',
    verifier: 'hdr',
    verificationStatus: 'hdzt',
  },
  taxVerification: {
    taxType: 'sz',
    taxAmount: 'skje',
    taxAuthority: 'swjg',
    verificationDate: 'hdrq',
    verifier: 'hdr',
    verificationStatus: 'hdzt',
  },
  bankruptcyDistPlan: {
    FAMC: 'famc',
    FANR: 'fanr',
    KFPZE: 'kfpze',
    HYBJJG: 'hybjjg',
    FYPZRQ: 'fypzrq',
    SSRQ: 'ssrq',
    FAZT: 'fazt',
    ZT: 'zt',
  },
  employeeSettlementPlan: {
    AZFANR: 'azfanr',
    AZZJE: 'azzje',
    SJZGRS: 'sjzgrs',
    PZRQ: 'pzrq',
    SSZT: 'sszt',
    FZR: 'fzr',
    AZLX: 'azlx',
    ZT: 'zt',
  },
  priorityPayment: {
    ZQRLX: 'zqrlx',
    ZQRMC: 'zqrmc',
    ZFJE: 'zfje',
    ZFRQ: 'zfrq',
    ZFFS: 'zffs',
    ZFYJ: 'zfyj',
    ZFZT: 'zfzt',
    ZT: 'zt',
  },
  propertyDistributionExecution: {
    FPLX: 'fplx',
    ZQRMC: 'zqrmc',
    FPJE: 'fpje',
    FPRQ: 'fprq',
    FPFS: 'fpfs',
    SJQR: 'sjqr',
    ZHZT: 'zhzt',
    YXJB: 'yxjb',
    ZT: 'zt',
  },
  depositManagement: {
    TCLX: 'tclx',
    ZQRMC: 'zqrmc',
    TCJE: 'tcje',
    TCRQ: 'tcrq',
    TCJG: 'tcjg',
    TCYY: 'tcyy',
    TCZT: 'tclzt',
    ZT: 'zt',
  },
  bankruptcyProcedureTermination: {
    ZJYY: 'zjyy',
    ZJRQ: 'zjrq',
    FYCDWH: 'fycdwh',
    FPBG: 'fpbg',
    TJRQ: 'tjrq',
    FYPZRQ: 'fypzrq',
    ZJZT: 'zjzt',
    ZT: 'zt',
  },
  cancellationRegistration: {
    ZXLX: 'zxlx',
    DJJG: 'djjg',
    SQRQ: 'sqrq',
    ZXRQ: 'zxrq',
    ZXWH: 'zxwh',
    ZXZT: 'zxzt',
    DJSX: 'djsx',
    DJHM: 'djhm',
    ZXYY: 'zxyy',
    CLR: 'clr',
    ZT: 'zt',
  },
  terminationLitigation: {
    SSLX: 'sslx',
    XDF: 'xdf',
    FYZCJG: 'fyzcjg',
    SSZT: 'sszt',
    CLJG: 'cljg',
    ZT: 'zt',
  },
  additionalDistribution: {
    FPLX: 'fplx',
    FPJE: 'fpje',
    FPRQ: 'fprq',
    ZQRMC: 'zqrmc',
    FPYJ: 'fpyj',
    FPZT: 'fpzt',
    ZT: 'zt',
  },
  accountSealManagement: {
    GLLX: 'gllx',
    XMMC: 'xmmc',
    CLRQ: 'clrq',
    CLFS: 'clfs',
    CLJG: 'cljg',
    ZMWJLJ: 'zmwjlj',
    ZT: 'zt',
  },
  dutyReport: {
    BGLX: 'bglx',
    BGNR: 'bgnr',
    TJRQ: 'tjrq',
    TJR: 'tjr',
    JSF: 'jsf',
    SPZT: 'spzt',
    ZT: 'zt',
  },
  documentTransfer: {
    YJLX: 'yjlx',
    ZLMC: 'zlmc',
    YJRQ: 'yjrq',
    YJF: 'yjf',
    JSF: 'jsf',
    YJNR: 'yjnr',
    ZT: 'zt',
  },
  archivingManagement: {
    GDLX: 'gdlx',
    GDNR: 'gdnr',
    GDRQ: 'gdrq',
    GDWZ: 'gdwz',
    FZR: 'fzr',
    GDZT: 'gdzt',
    DAH: 'dah',
    ZT: 'zt',
  },
  sealDestruction: {
    YZLX: 'yzlx',
    YZBH: 'yzbh',
    XHRQ: 'xhrq',
    XHFS: 'xhfs',
    XHJZR: 'xhjzr',
    ZMWJ: 'zmwj',
    YZ: 'yz',
    ZT: 'zt',
  },
  accountClosing: {
    ZH: 'zh',
    XHRQ: 'xhrq',
    XHYY: 'xhyy',
    YEJE: 'yeje',
    XHZT: 'xhzt',
    ZT: 'zt',
  },
};

// 第三阶段：驼峰命名到小写的映射（用于处理API响应）
const camelCaseToLowerCaseMap: Record<string, Record<string, string>> = {
  propertyInvestigation: {
    investigationType: 'tclx',
    investigationContent: 'tcnr',
    investigationDate: 'tcrq',
    investigator: 'tcr',
    investigationFindings: 'tcfx',
    investigationStatus: 'tczt',
    status: 'zt',
  },
  bankExpenses: {
    expenseType: 'fylx',
    expenseName: 'fymc',
    amount: 'je',
    paymentDate: 'zfrq',
    paymentStatus: 'zfzt',
    status: 'zt',
  },
  rightsClaim: {
    claimType: 'zzlxcx',
    claimContent: 'zznr',
    claimDate: 'zzrq',
    claimant: 'zzr',
    courtResponse: 'fyhy',
    claimStatus: 'zzzt',
    status: 'zt',
  },
  reclaimReview: {
    claimantName: 'qlrmc',
    reclaimRightBasis: 'qhqjc',
    propertyExists: 'ccsfcz',
    reciprocalObligation: 'ddgfyw',
    reviewDate: 'scrq',
    reviewer: 'scr',
    reviewDecision: 'scjd',
    status: 'zt',
  },
  litigationArbitration: {
    type: 'lx',
    oppositeParty: 'xdf',
    court: 'fy',
    litigationContent: 'ssnr',
    litigationStatus: 'sszt',
    status: 'zt',
  },
  creditorClaim: {
    ZQZQRMC: 'zqzqrmc',
    ZQZQRLX: 'zqzqrlx',
    ZQZQRSFZH: 'zqzqrsfzh',
    ZQZQRDH: 'zqzqrdh',
    ZQZQRDZ: 'zqzqrdz',
    ZQZQJJE: 'zqzqjje',
    ZQZQJJEBZ: 'zqzqjjebz',
    ZQZQJZQSJ: 'zqzqjzqsj',
    ZQZQJZQSJBZ: 'zqzqjzqsjbz',
    ZQZQJZQSJZDY: 'zqzqjzqsjzdy',
    ZQZQJZQSJZDYDZ: 'zqzqjzqsjzdydz',
    ZQZQJZQSJZDYDZBZ: 'zqzqjzqsjzdydzbz',
    ZQZQJZQSJZDYDZLXDH: 'zqzqjzqsjzdydzlxdh',
    ZQZQJZQSJZDYDZLXDHBZ: 'zqzqjzqsjzdydzlxdhbz',
    ZQZQJZQSJZDYDZLXDHYX: 'zqzqjzqsjzdydzlxdhyx',
    ZQZQJZQSJZDYDZLXDHYXBZ: 'zqzqjzqsjzdydzlxdhyxbz',
    ZQZQJZQSJZDYDZLXDHZJ: 'zqzqjzqsjzdydzlxdhzj',
    ZQZQJZQSJZDYDZLXDHZJBZ: 'zqzqjzqsjzdydzlxdhzjbz',
    ZQZQJZQSJZDYDZLXDHZJLX: 'zqzqjzqsjzdydzlxdhzjlx',
    ZQZQJZQSJZDYDZLXDHZJLXBZ: 'zqzqjzqsjzdydzlxdhzjlxbz',
    ZQZQJZQSJZDYDZLXDHZJLXMC: 'zqzqjzqsjzdydzlxdhzjlxmc',
    ZQZQJZQSJZDYDZLXDHZJLXMCBZ: 'zqzqjzqsjzdydzlxdhzjlxmcbz',
    ZQZQJZQSJZDYDZLXDHZJLXMCDZ: 'zqzqjzqsjzdydzlxdhzjlxmcdz',
    ZQZQJZQSJZDYDZLXDHZJLXMCDZBZ: 'zqzqjzqsjzdydzlxdhzjlxmcdzbz',
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDH: 'zqzqjzqsjzdydzlxdhzjlxmcdzdh',
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDHBZ: 'zqzqjzqsjzdydzlxdhzjlxmcdzdhbz',
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDHYX: 'zqzqjzqsjzdydzlxdhzjlxmcdzdhyx',
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDHYXBZ: 'zqzqjzqsjzdydzlxdhzjlxmcdzdhyxbz',
    ZT: 'zt',
  },
  socialSecurityFees: {
    feeType: 'fylx',
    feeAmount: 'fyje',
    socialSecurityAgency: 'sbjg',
    verificationDate: 'hdrq',
    verifier: 'hdr',
    verificationStatus: 'hdzt',
    status: 'zt',
  },
  taxVerification: {
    taxType: 'sz',
    taxAmount: 'skje',
    taxAuthority: 'swjg',
    verificationDate: 'hdrq',
    verifier: 'hdr',
    verificationStatus: 'hdzt',
    status: 'zt',
  },
};

const loadFileList = async () => {
  fileListLoading.value = true;

  const sepId = props.taskData?.sepId || props.taskData?.SEP_ID;

  if (!sepId) {
    return;
  }

  try {
    const response = await getProcessFileListApi({
      taskType: props.taskType,
      taskId: sepId,
      caseId: props.caseId,
    });

    fileList.value =
      response.status === '1' && Array.isArray(response.data)
        ? response.data.map((record: any) => ({
            uid: record.id,
            name: record.originalFileName || '未知文件名',
            fileId: record.id,
            fileName: record.originalFileName || '未知文件名',
            fileSize: record.fileSize || 0,
            fileType: record.mimeType || '',
            uploadUser: record.uploadUser || '未知用户',
            uploadDate: record.uploadTime
              ? new Date(record.uploadTime)
              : new Date(),
            status: 'success',
            response: record,
          }))
        : [];
  } catch (error) {
    console.error('加载文件列表失败:', error);
    ElMessage.error('加载文件列表失败');
    fileList.value = [];
  } finally {
    fileListLoading.value = false;
  }
};

const initFormData = () => {
  // 清空表单数据
  Object.keys(formData).forEach((key) => delete formData[key]);

  // 重置文件列表和激活标签
  activeTab.value = 'upload';
  fileList.value = [];

  // 只有当taskData存在时才进行数据映射
  if (props.taskData && typeof props.taskData === 'object') {
    const mappedData: any = {};

    // 安全遍历taskData的键
    Object.keys(props.taskData).forEach((key) => {
      // 获取当前任务类型的字段映射
      const fieldMap = fieldNameMap[props.taskType] || {};
      const camelCaseMap = camelCaseToLowerCaseMap[props.taskType] || {};

      if (fieldMap[key]) {
        // 第一、二、四、五、六、七阶段：大写字段名 → 小写字段名
        mappedData[fieldMap[key]] = props.taskData[key];
      } else if (camelCaseMap[key]) {
        // 第三阶段：驼峰字段名 → 小写字段名
        mappedData[camelCaseMap[key]] = props.taskData[key];
      } else if (key === 'sepId' || key === 'SEP_ID' || key === 'row') {
        // 特殊处理sepId字段
        mappedData.sepId = props.taskData[key];
      } else {
        // 否则直接使用原字段名（驼峰命名）
        mappedData[key] = props.taskData[key];
      }
    });

    Object.assign(formData, mappedData);
    loadFileList();
  } else if (props.mode === 'add') {
    // 新增任务时，为所有日期类型的字段设置默认值为当前时间
    const currentDate = new Date().toISOString().split('T')[0];
    const fields = currentConfig.value.fields || [];
    fields.forEach((field: any) => {
      if (field.type === 'date') {
        formData[field.prop] = currentDate;
      }
    });
  }
};

watch(() => props.taskData, initFormData, { immediate: true });

const handleClose = () => {
  emit('close');
};

const handleUpload = async (options: any) => {
  let rawFile: File | undefined;
  let fileName = '';

  if (options instanceof File) {
    rawFile = options;
    fileName = options.name;
  } else if (options.raw && options.raw instanceof File) {
    rawFile = options.raw;
    fileName = options.name || options.raw.name;
  } else if (options.file && options.file instanceof File) {
    rawFile = options.file;
    fileName = options.name || options.file.name;
  }

  if (!rawFile) {
    console.error('[上传] 文件对象无效:', options);
    ElMessage.error('文件对象无效');
    return false;
  }

  uploadLoading.value = true;
  uploadProgress.value = 0;

  if (!props.taskData?.sepId) {
    ElMessage.warning('请先保存任务信息，再上传文件');
    uploadLoading.value = false;
    return false;
  }

  try {
    const response = await uploadProcessFileApi({
      taskId: props.taskData.sepId,
      file: rawFile,
      caseId: props.caseId,
      taskType: props.taskType,
    });

    if (response.status === '1') {
      const fileData = response.data;
      fileList.value.push({
        uid: fileData.id,
        name: fileData.originalFileName,
        fileId: fileData.id,
        fileName: fileData.originalFileName,
        fileSize: fileData.fileSize || 0,
        fileType: fileData.mimeType || '',
        uploadUser: fileData.uploadUser || '未知用户',
        uploadDate: fileData.uploadTime
          ? new Date(fileData.uploadTime)
          : new Date(),
        status: 'success',
        response: fileData,
      });
      ElMessage.success('文件上传成功');
    } else {
      ElMessage.error(response.error || response.msg || '文件上传失败');
      return false;
    }
  } catch (error: any) {
    console.error('文件上传失败:', error);
    const errorMsg =
      error?.response?.data?.error ||
      error?.error ||
      error?.msg ||
      '文件上传失败';
    ElMessage.error(errorMsg);
    return false;
  } finally {
    uploadLoading.value = false;
    uploadProgress.value = 100;
  }
  return false; // 阻止默认上传行为，使用自定义上传
};

const handleFileChange = async (fileObj: any) => {
  if (fileObj.status === 'ready' && fileObj.raw) {
    await handleUpload({
      raw: fileObj.raw,
      name: fileObj.name,
    });
  }
};

const handleRemove = async (file: any) => {
  try {
    const response = await deleteProcessFileApi({
      fileId: file.fileId,
      caseId: props.caseId,
    });
    if (response.status === '1') {
      fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
      ElMessage.success('文件删除成功');
    } else {
      ElMessage.error(`文件删除失败：${response.msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('文件删除失败:', error);
    ElMessage.error('文件删除失败');
  }
};

const handleDownload = async (file: any) => {
  try {
    const blob = await downloadProcessFileApi(file.fileId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载成功');
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

const handleSave = async () => {
  if (isReadOnly.value) {
    handleClose();
    return;
  }

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const chatUserInfo = localStorage.getItem('chat_user_info');
    let sep_auser = 'admin';
    try {
      if (chatUserInfo) {
        const userInfo = JSON.parse(chatUserInfo);
        sep_auser =
          userInfo.user?.uName || userInfo.U_USER || userInfo.U_NAME || 'admin';
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }

    const sep_adate = new Date().toISOString().split('T')[0];

    const isFirstStage = [
      'legalProcedure',
      'management',
      'sealManagement',
    ].includes(props.taskType);

    const isSecondStage = [
      'businessManagement',
      'contractManagement',
      'emergency',
      'internalAffairs',
      'personnelEmp',
      'propertyPlan',
      'propertyReceipt',
    ].includes(props.taskType);

    const isThirdStage = [
      'bankExpenses',
      'creditorClaim',
      'litigationArbitration',
      'propertyInvestigation',
      'reclaimReview',
      'rightsClaim',
      'socialSecurityFees',
      'taxVerification',
    ].includes(props.taskType);

    const isFourthFifthStage = [
      'assetValuation',
      'auctionAgency',
      'auditReport',
      'bankruptcyDeclaration',
      'claimConfirmation',
      'importantActions',
      'meetingDocuments',
      'propertyVImpl',
      'propertyVPlan',
      'remunerationPlan',
      'session',
      'setoffReview',
    ].includes(props.taskType);

    const isSixthStage = [
      'bankruptcyDistPlan',
      'bankruptcyProcedureTermination',
      'depositManagement',
      'employeeSettlementPlan',
      'priorityPayment',
      'propertyDistributionExecution',
    ].includes(props.taskType);

    // 第二阶段任务单独处理（非新增操作）
    if (isSecondStage && props.mode !== 'add') {
      let zt: string;
      switch (props.mode) {
        case 'complete': {
          zt = '1';
          break;
        }
        case 'revoke': {
          zt = '0';
          break;
        }
        case 'skip': {
          zt = '2';
          break;
        }
        default: {
          zt = props.taskData?.zt || props.taskData?.ZT || '0';
        }
      }

      const secondStageData = {
        SEP_ID: props.taskData?.sepId || props.taskData?.SEP_ID,
        SEP_LD: props.caseId,
        ZT: zt,
        OperateType: secondStageOperateTypeMap[props.taskType] as number,
        ...(props.mode === 'edit' && formData),
      };

      const response = await update2Api(secondStageData);

      const isSuccess = response.code === 200 || response.status === '1';
      if (isSuccess) {
        ElMessage.success(
          `${props.mode === 'complete' ? '标记完成' : props.mode === 'skip' ? '标记跳过' : '更新'}成功`,
        );
        emit('saved');
      } else {
        ElMessage.error(
          `${props.mode === 'complete' ? '标记完成' : props.mode === 'skip' ? '标记跳过' : '更新'}失败：${response.message || response.error}`,
        );
      }

      loading.value = false;
      return;
    }

    switch (props.mode) {
      case 'add': {
        const isSeventhStage = [
          'accountClosing',
          'accountSealManagement',
          'additionalDistribution',
          'archivingManagement',
          'cancellationRegistration',
          'documentTransfer',
          'dutyReport',
          'sealDestruction',
          'terminationLitigation',
        ].includes(props.taskType);

        // 准备所有字段数据
        const allFields: any = {
          sepId: 0,
          sepLd: props.caseId,
          sepMd: 0,
          sepNd: 0,
          sepAuser: sep_auser,
          sepAdate: new Date().toISOString().split('T')[0],
          sepEuser: '',
          sepEdate: '',
          zt: '0',
        };

        // 获取当前配置的字段列表，添加默认值避免undefined错误
        const fields = currentConfig.value.fields || [];

        if (isSeventhStage) {
          // 第七阶段任务：直接使用小写字段名
          fields.forEach((field: any) => {
            const value = formData[field.prop];
            allFields[field.prop] =
              value === '' || value === null || value === undefined
                ? ''
                : value;
          });
        } else {
          // 其他阶段任务：使用大写字段名
          // 获取当前任务类型的字段映射（小写到大写）
          const fieldMap = fieldNameMap[props.taskType];
          const reverseMap: Record<string, string> = {};
          if (fieldMap) {
            Object.keys(fieldMap).forEach((upperKey) => {
              reverseMap[fieldMap[upperKey]] = upperKey;
            });
          }

          fields.forEach((field: any) => {
            const value = formData[field.prop];
            // 使用反向映射将小写字段名转换为大写字段名
            const fieldName =
              reverseMap[field.prop] || field.prop.toUpperCase();

            if (value === '' || value === null || value === undefined) {
              allFields[fieldName] = [
                'AZZJE',
                'CCJE',
                'FPJE',
                'FPJE',
                'KFPZE',
                'KZJE',
                'TCJE',
                'YEJE',
                'ZFJE',
              ].includes(fieldName)
                ? '0'
                : '';
            } else {
              allFields[fieldName] = value;
            }
          });
        }

        const response = await currentConfig.value.addApi(allFields);

        const isSuccess = response.code === 200 || response.status === '1';
        if (isSuccess) {
          emit('saved');
        } else {
          ElMessage.error(`添加失败：${response.message || response.error}`);
        }

        break;
      }
      case 'complete': {
        const updateData = {
          sepEuser: sep_auser,
          sepEdate: sep_adate,
          sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
          sepLd: props.caseId,
          zt: '1',
          // 添加第二阶段所需的OperateType
          ...(isSecondStage && {
            OperateType: secondStageOperateTypeMap[props.taskType] as number,
            SEP_ID: props.taskData?.sepId || props.taskData?.SEP_ID,
            SEP_LD: props.caseId,
            ZT: '1',
          }),
        };

        const response = isSixthStage
          ? await update6Api(updateData)
          : isFourthFifthStage
            ? await update4Api(updateData)
            : isThirdStage
              ? await update3Api(updateData)
              : isSecondStage
                ? await update2Api(updateData)
                : isFirstStage && currentConfig.value.updateApi
                  ? await currentConfig.value.updateApi(updateData)
                  : await unifiedTaskOperationApi(updateData);

        const isSuccess = response.code === 200 || response.status === '1';
        if (isSuccess) {
          ElMessage.success('标记完成成功');
          emit('saved');
        } else {
          ElMessage.error(`操作失败：${response.message || response.error}`);
        }

        break;
      }
      case 'edit': {
        const fieldMap = fieldNameMap[props.taskType];
        const reverseMap: Record<string, string> = {};
        if (fieldMap) {
          Object.keys(fieldMap).forEach((upperKey) => {
            reverseMap[fieldMap[upperKey]] = upperKey;
          });
        }

        // 转换formData中的小写字段名为大写字段名
        const transformedFormData: any = {};
        Object.keys(formData).forEach((key) => {
          const fieldName = reverseMap[key] || key.toUpperCase();
          transformedFormData[fieldName] = formData[key];
        });

        const updateData = {
          sepEuser: sep_auser,
          sepEdate: sep_adate,
          sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
          sepLd: props.caseId,
          zt: props.taskData?.zt || props.taskData?.ZT || '0',
          ...transformedFormData,
          // 添加第二阶段所需的OperateType
          ...(isSecondStage && {
            OperateType: secondStageOperateTypeMap[props.taskType] as number,
            SEP_ID: props.taskData?.sepId || props.taskData?.SEP_ID,
            SEP_LD: props.caseId,
            ZT: props.taskData?.zt || props.taskData?.ZT || '0',
          }),
        };

        const response = isSixthStage
          ? await update6Api(updateData)
          : isFourthFifthStage
            ? await update4Api(updateData)
            : isThirdStage
              ? await update3Api(updateData)
              : isSecondStage
                ? await update2Api(updateData)
                : isFirstStage && currentConfig.value.updateApi
                  ? await currentConfig.value.updateApi(updateData)
                  : await unifiedTaskOperationApi(updateData);

        const isSuccess = response.code === 200 || response.status === '1';
        if (isSuccess) {
          ElMessage.success('更新成功');
          emit('saved');
        } else {
          ElMessage.error(`更新失败：${response.message || response.error}`);
        }

        break;
      }
      case 'skip': {
        const updateData = {
          sepEuser: sep_auser,
          sepEdate: sep_adate,
          sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
          sepLd: props.caseId,
          zt: '2',
          // 添加第二阶段所需的OperateType
          ...(isSecondStage && {
            OperateType: secondStageOperateTypeMap[props.taskType] as number,
            SEP_ID: props.taskData?.sepId || props.taskData?.SEP_ID,
            SEP_LD: props.caseId,
            ZT: '2',
          }),
        };

        const response = isSixthStage
          ? await update6Api(updateData)
          : isFourthFifthStage
            ? await update4Api(updateData)
            : isThirdStage
              ? await update3Api(updateData)
              : isSecondStage
                ? await update2Api(updateData)
                : isFirstStage && currentConfig.value.updateApi
                  ? await currentConfig.value.updateApi(updateData)
                  : await unifiedTaskOperationApi(updateData);

        const isSuccess = response.code === 200 || response.status === '1';
        if (isSuccess) {
          ElMessage.success('标记跳过成功');
          emit('saved');
        } else {
          ElMessage.error(`操作失败：${response.message || response.error}`);
        }

        break;
      }
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    loading.value = false;
  }
};

const handleRevoke = async () => {
  loading.value = true;
  try {
    const chatUserInfo = localStorage.getItem('chat_user_info');
    let sep_auser = 'admin';
    try {
      if (chatUserInfo) {
        const userInfo = JSON.parse(chatUserInfo);
        sep_auser =
          userInfo.user?.uName || userInfo.U_USER || userInfo.U_NAME || 'admin';
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }

    const sep_adate = new Date().toISOString().split('T')[0];

    // 先定义所有阶段判断变量
    const isFirstStage = [
      'legalProcedure',
      'management',
      'sealManagement',
    ].includes(props.taskType);

    const isSecondStage = [
      'businessManagement',
      'contractManagement',
      'emergency',
      'internalAffairs',
      'personnelEmp',
      'propertyPlan',
      'propertyReceipt',
    ].includes(props.taskType);

    const isThirdStage = [
      'bankExpenses',
      'creditorClaim',
      'litigationArbitration',
      'propertyInvestigation',
      'reclaimReview',
      'rightsClaim',
      'socialSecurityFees',
      'taxVerification',
    ].includes(props.taskType);

    const isFourthFifthStage = [
      'assetValuation',
      'auctionAgency',
      'auditReport',
      'bankruptcyDeclaration',
      'claimConfirmation',
      'importantActions',
      'meetingDocuments',
      'propertyVImpl',
      'propertyVPlan',
      'remunerationPlan',
      'session',
      'setoffReview',
    ].includes(props.taskType);

    const isSixthStage = [
      'bankruptcyDistPlan',
      'bankruptcyProcedureTermination',
      'depositManagement',
      'employeeSettlementPlan',
      'priorityPayment',
      'propertyDistributionExecution',
    ].includes(props.taskType);

    const updateData = {
      sepEuser: sep_auser,
      sepEdate: sep_adate,
      sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
      sepLd: props.caseId,
      zt: '0',
      // 添加第二阶段所需的OperateType
      ...(isSecondStage && {
        OperateType: secondStageOperateTypeMap[props.taskType] as number,
        SEP_ID: props.taskData?.sepId || props.taskData?.SEP_ID,
        SEP_LD: props.caseId,
        ZT: '0',
      }),
    };

    const response = isSixthStage
      ? await update6Api(updateData)
      : isFourthFifthStage
        ? await update4Api(updateData)
        : isThirdStage
          ? await update3Api(updateData)
          : isSecondStage
            ? await update2Api(updateData)
            : isFirstStage && currentConfig.value.updateApi
              ? await currentConfig.value.updateApi(updateData)
              : await unifiedTaskOperationApi(updateData);

    const isSuccess = response.code === 200 || response.status === '1';
    if (isSuccess) {
      ElMessage.success('撤回成功');
      emit('saved');
    } else {
      ElMessage.error(`撤回失败：${response.message || response.error}`);
    }
  } catch (error) {
    console.error('撤回失败:', error);
    ElMessage.error('撤回失败');
  } finally {
    loading.value = false;
  }
};

const formRules = computed(() => {
  const rules: any = {};
  const fields = currentConfig.value.fields || [];

  if (Array.isArray(fields)) {
    fields.forEach((field: any) => {
      if (field && field.required && field.prop && field.label) {
        rules[field.prop] = [
          { required: true, message: `请输入${field.label}`, trigger: 'blur' },
        ];
      }
    });
  }

  return rules;
});
</script>

<template>
  <div class="task-edit-container">
    <ElRadioGroup v-model="activeTab" class="tab-group">
      <ElRadioButton value="upload">
        <Icon icon="lucide:upload" class="mr-1" />上传文件
      </ElRadioButton>
      <ElRadioButton value="data">
        <Icon icon="lucide:database" class="mr-1" />自定义数据
      </ElRadioButton>
    </ElRadioGroup>

    <div v-if="activeTab === 'upload'" class="upload-section">
      <div class="upload-header">
        <h3>上传文件</h3>
        <span class="tip-text"
          >支持上传文档、图片等文件，单个文件不超过50MB</span
        >
      </div>

      <ElUpload
        v-if="!isReadOnly"
        :before-upload="handleUpload"
        :on-change="handleFileChange"
        :file-list="fileList"
        :auto-upload="false"
        :show-file-list="true"
        :multiple="true"
        :disabled="uploadLoading"
        :on-remove="handleRemove"
        class="upload-component"
      >
        <ElButton type="primary" :loading="uploadLoading">
          <Icon icon="lucide:upload" class="mr-1" />
          选择文件
        </ElButton>
        <template #tip>
          <div class="el-upload__tip">
            支持上传 doc, docx, pdf, txt, jpg, jpeg, png, gif 等格式文件
          </div>
        </template>
      </ElUpload>

      <div v-if="fileListLoading" class="file-list-loading">
        <ElSkeleton :rows="3" animated />
      </div>

      <div v-else-if="fileList.length > 0" class="file-list">
        <h4>已上传文件 ({{ fileList.length }})</h4>
        <div v-for="file in fileList" :key="file.uid" class="file-item">
          <div class="file-info">
            <Icon
              :icon="
                {
                  doc: 'lucide:file-text',
                  docx: 'lucide:file-text',
                  pdf: 'lucide:file-pdf',
                  txt: 'lucide:file-text',
                  jpg: 'lucide:image',
                  jpeg: 'lucide:image',
                  png: 'lucide:image',
                  gif: 'lucide:image',
                }[file.fileType] || 'lucide:file'
              "
              class="file-icon"
            />
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size"
                  >{{
                    ((file.fileSize || 0) / 1024 / 1024).toFixed(2)
                  }}
                  MB</span
                >
                <span class="file-uploader">上传者: {{ file.uploadUser }}</span>
                <span class="file-date">{{
                  new Date(file.uploadDate).toLocaleString('zh-CN')
                }}</span>
                <ElTag size="small" type="success" v-if="file.version > 1">
                  V{{ file.version }}
                </ElTag>
              </div>
            </div>
          </div>
          <div class="file-actions">
            <span
              style="
                color: #409eff;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                margin-right: 12px;
              "
              @click="handleDownload(file)"
            >
              <Icon icon="lucide:download" class="mr-1" />
              下载
            </span>
            <ElButton
              v-if="!isReadOnly"
              type="danger"
              size="small"
              @click="handleRemove(file)"
            >
              <Icon icon="lucide:trash-2" class="mr-1" />
              删除
            </ElButton>
          </div>
        </div>
      </div>

      <ElEmpty v-else description="暂无上传文件" :image-size="80">
        <ElButton v-if="!isReadOnly" type="primary" @click="() => {}">
          <Icon icon="lucide:upload" class="mr-1" />
          选择文件
        </ElButton>
      </ElEmpty>
    </div>

    <div v-else class="data-section">
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="right"
        :disabled="isReadOnly"
      >
        <ElFormItem
          v-for="field in currentConfig.fields"
          :key="field.prop"
          :label="field.label"
          :prop="field.prop"
        >
          <ElInput
            v-if="field.type === 'input'"
            v-model="formData[field.prop]"
            :placeholder="`请输入${field.label}`"
            :disabled="isReadOnly"
          />
          <ElInput
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.prop]"
            type="textarea"
            :rows="4"
            :placeholder="`请输入${field.label}`"
            :disabled="isReadOnly"
          />
          <ElSelect
            v-else-if="field.type === 'select'"
            v-model="formData[field.prop]"
            :placeholder="`请选择${field.label}`"
            style="width: 100%"
            :disabled="isReadOnly"
          >
            <ElOption
              v-for="option in field.options"
              :key="option"
              :label="option"
              :value="option"
            />
          </ElSelect>
          <ElDatePicker
            v-else-if="field.type === 'date'"
            v-model="formData[field.prop]"
            type="date"
            :placeholder="`请选择${field.label}`"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled="isReadOnly"
          />
        </ElFormItem>
      </ElForm>
    </div>

    <div
      class="dialog-footer"
      style="
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      "
    >
      <ElButton @click="handleClose" :disabled="loading">
        <Icon icon="lucide:x" class="mr-1" />
        取消
      </ElButton>
      <ElButton
        v-if="props.mode === 'edit' || props.mode === 'add'"
        type="primary"
        @click="handleSave"
        :loading="loading"
      >
        <Icon icon="lucide:save" class="mr-1" />
        保存
      </ElButton>
      <ElButton
        v-if="props.mode === 'view'"
        type="primary"
        @click="handleClose"
      >
        <Icon icon="lucide:x" class="mr-1" />
        关闭
      </ElButton>
      <ElButton
        v-if="props.mode === 'complete'"
        type="success"
        @click="handleSave"
        :loading="loading"
      >
        <Icon icon="lucide:check" class="mr-1" />
        确认完成
      </ElButton>
      <ElButton
        v-if="props.mode === 'skip'"
        type="warning"
        @click="handleSave"
        :loading="loading"
      >
        <Icon icon="lucide:skip-forward" class="mr-1" />
        确认跳过
      </ElButton>
      <ElButton
        v-if="props.mode === 'revoke'"
        type="danger"
        @click="handleRevoke"
        :loading="loading"
      >
        <Icon icon="lucide:rotate-ccw" class="mr-1" />
        确认撤回
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.task-edit-container {
  padding: 20px 0;
}

.tab-group {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.tab-group :deep(.el-radio-button) {
  flex: 1;
}

.tab-group :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.upload-section {
  min-height: 300px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.upload-header {
  margin-bottom: 20px;
}

.upload-header h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.tip-text {
  font-size: 12px;
  color: #6b7280;
}

.upload-component {
  margin-bottom: 20px;
}

.file-list-loading {
  padding: 20px 0;
}

.file-list {
  margin-top: 20px;
}

.file-list h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.file-info {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
}

.file-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.file-size,
.file-uploader,
.file-date {
  display: flex;
  align-items: center;
}

.file-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.file-actions .el-button {
  padding: 4px 10px;
  font-size: 12px;
}

.data-section {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
