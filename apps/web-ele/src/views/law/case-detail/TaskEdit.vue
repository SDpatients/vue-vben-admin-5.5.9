<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
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
  update7Api,
  uploadProcessFileApi,
} from '#/api/core/case-process';
import {
  addAccountClosingApi,
  addAccountSealManagementApi,
  addAdditionalDistributionApi,
  addArchivingManagementApi,
  addBankExpensesApi,
  addBankruptcyDistPlanApi,
  addBankruptcyProcedureTerminationApi,
  addBusinessManagementApi,
  addCancellationRegistrationApi,
  addContractManagementApi,
  addCreditorClaimApi,
  addDepositManagementApi,
  addDocumentTransferApi,
  addDutyReportApi,
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
  addSealDestructionApi,
  addSealManagementApi,
  addSocialSecurtyFeesApi,
  addTaxVerificationApi,
  addTerminationLitigationApi,
  unifiedTaskOperationApi,
} from '#/api/core/case-process';

defineOptions({
  name: 'TaskEdit',
});

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

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

console.log('[组件] TaskEdit组件已加载');
console.log('[组件] caseId:', props.caseId);
console.log('[组件] taskType:', props.taskType);
console.log('[组件] mode:', props.mode);
console.log('[组件] taskData:', props.taskData);

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
    operateType: '2',
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
    title: '账户印章管理',
    operateType: '3',
    addApi: addSealManagementApi,
    updateApi: async (data: any) => {
      const { updateSealManagementApi } =
        await import('#/api/core/case-process');
      return updateSealManagementApi(data);
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
    operateType: '4',
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
      { label: '债权人名称', prop: 'zqrmc', type: 'input', required: true },
      { label: '债权人类型', prop: 'zqrlx', type: 'input' },
      { label: '申报金额', prop: 'sbje', type: 'input', required: true },
      { label: '申报依据', prop: 'sbyj', type: 'textarea' },
      { label: '接收人', prop: 'jsr', type: 'input' },
      { label: '申报类型', prop: 'sblx', type: 'input' },
      { label: '备注', prop: 'bz', type: 'textarea' },
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
    fields: [
      { label: '注销类型', prop: 'zxlx', type: 'input', required: true },
      { label: '登记机关', prop: 'djjg', type: 'input' },
      { label: '申请日期', prop: 'sqrq', type: 'date' },
      { label: '注销日期', prop: 'zxrq', type: 'date' },
      { label: '注销文号', prop: 'zxwh', type: 'input' },
      { label: '注销状态', prop: 'zxzt', type: 'input' },
      { label: '登记事项', prop: 'djsx', type: 'input' },
      { label: '登记号码', prop: 'djhm', type: 'input' },
      { label: '注销原因', prop: 'zxyy', type: 'textarea' },
      { label: '处理人', prop: 'clr', type: 'input' },
    ],
  },
  terminationLitigation: {
    title: '终结诉讼仲裁',
    operateType: 1,
    addApi: addTerminationLitigationApi,
    fields: [
      { label: '诉讼类型', prop: 'sslx', type: 'input', required: true },
      { label: '相对方', prop: 'xdf', type: 'input', required: true },
      { label: '法院/仲裁机构', prop: 'fyzcjg', type: 'input' },
      { label: '诉讼状态', prop: 'sszt', type: 'input' },
      { label: '处理结果', prop: 'cljg', type: 'textarea' },
    ],
  },
  additionalDistribution: {
    title: '追加分配',
    operateType: 2,
    addApi: addAdditionalDistributionApi,
    fields: [
      { label: '分配类型', prop: 'fplx', type: 'input', required: true },
      { label: '分配金额', prop: 'fpje', type: 'input', required: true },
      { label: '分配日期', prop: 'fprq', type: 'date' },
      { label: '债权人名称', prop: 'zqrmc', type: 'input', required: true },
      { label: '分配依据', prop: 'fpyj', type: 'textarea' },
      { label: '分配状态', prop: 'fpzt', type: 'input' },
    ],
  },
  accountSealManagement: {
    title: '账户印章管理',
    operateType: 3,
    addApi: addAccountSealManagementApi,
    fields: [
      { label: '管理类型', prop: 'gllx', type: 'input', required: true },
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
    fields: [
      { label: '报告类型', prop: 'bglx', type: 'input', required: true },
      { label: '报告内容', prop: 'bgnr', type: 'textarea', required: true },
      { label: '提交日期', prop: 'tjrq', type: 'date' },
      { label: '提交人', prop: 'tjr', type: 'input' },
      { label: '接收方', prop: 'jsf', type: 'input' },
      { label: '审批状态', prop: 'spzt', type: 'input' },
    ],
  },
  documentTransfer: {
    title: '资料移交',
    operateType: 5,
    addApi: addDocumentTransferApi,
    fields: [
      { label: '移交类型', prop: 'yjlx', type: 'input', required: true },
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
    fields: [
      { label: '归档类型', prop: 'gdlx', type: 'input', required: true },
      { label: '归档内容', prop: 'gdnr', type: 'textarea', required: true },
      { label: '归档日期', prop: 'gdrq', type: 'date' },
      { label: '归档位置', prop: 'gdwz', type: 'input' },
      { label: '负责人', prop: 'fzr', type: 'input' },
      { label: '归档状态', prop: 'gdzt', type: 'input' },
      { label: '档案号', prop: 'dah', type: 'input' },
    ],
  },
  sealDestruction: {
    title: '印章销毁',
    operateType: 7,
    addApi: addSealDestructionApi,
    fields: [
      { label: '印章类型', prop: 'yzlx', type: 'input', required: true },
      { label: '印章编号', prop: 'yzbh', type: 'input', required: true },
      { label: '销毁日期', prop: 'xhrq', type: 'date' },
      { label: '销毁方式', prop: 'xhfs', type: 'input' },
      { label: '销毁见证人', prop: 'xhjzr', type: 'input' },
      { label: '证明文件', prop: 'zmwj', type: 'input' },
      { label: '印章', prop: 'yz', type: 'input' },
    ],
  },
  accountClosing: {
    title: '账户销户',
    operateType: 8,
    addApi: addAccountClosingApi,
    fields: [
      { label: '账户', prop: 'zh', type: 'input', required: true },
      { label: '销户日期', prop: 'xhrq', type: 'date' },
      { label: '销户原因', prop: 'xhyy', type: 'textarea' },
      { label: '余额金额', prop: 'yeje', type: 'input' },
      { label: '销户状态', prop: 'xhzt', type: 'input' },
    ],
  },
};

const currentConfig = computed(
  () => taskFormConfig[props.taskType] || taskFormConfig.workTeam,
);

const dialogTitle = computed(() => {
  const modeText: Record<string, string> = {
    add: '新增',
    edit: '编辑',
    view: '查看',
    complete: '完成',
    skip: '跳过',
    revoke: '撤回',
  };
  return `${modeText[props.mode]}${currentConfig.value.title}`;
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
    TCLX: 'tclx',
    TCNR: 'tcnr',
    TCRQ: 'tcrq',
    TCR: 'tcr',
    TCFX: 'tcfx',
    TCZT: 'tczt',
  },
  bankExpenses: {
    FYLX: 'fylx',
    FYMC: 'fymc',
    JE: 'je',
    ZFRQ: 'zfrq',
    ZFZT: 'zfzt',
  },
  rightsClaim: {
    ZZLXCX: 'zzlxcx',
    ZZNR: 'zznr',
    ZZRQ: 'zzrq',
    ZZR: 'zzr',
    FYHY: 'fyhy',
    ZZZT: 'zzzt',
  },
  reclaimReview: {
    QLRMC: 'qlrmc',
    QHQJC: 'qhqjc',
    CCSFCZ: 'ccsfcz',
    DDGFYW: 'ddgfyw',
    SCRQ: 'scrq',
    SCR: 'scr',
    SCJD: 'scjd',
  },
  litigationArbitration: {
    LX: 'lx',
    XDF: 'xdf',
    FY: 'fy',
    SSNR: 'ssnr',
    SSZT: 'sszt',
  },
  creditorClaim: {
    ZQRMC: 'zqrmc',
    ZQRLX: 'zqrlx',
    SBJE: 'sbje',
    SBYJ: 'sbyj',
    JSR: 'jsr',
    SBLX: 'sblx',
    BZ: 'bz',
  },
  socialSecurityFees: {
    FYLX: 'fylx',
    FYJE: 'fyje',
    SBJG: 'sbjg',
    HDRQ: 'hdrq',
    HDR: 'hdr',
    HDZT: 'hdzt',
  },
  taxVerification: {
    SZ: 'sz',
    SKJE: 'skje',
    SWJG: 'swjg',
    HDRQ: 'hdrq',
    HDR: 'hdr',
    HDZT: 'hdzt',
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

const loadFileList = async () => {
  console.log('[文件列表] loadFileList开始执行');
  console.log('[文件列表] taskData:', props.taskData);
  console.log('[文件列表] taskData?.sepId:', props.taskData?.sepId);

  if (!props.taskData?.sepId) {
    console.log('[文件列表] sepId不存在，跳过加载');
    return;
  }

  fileListLoading.value = true;
  console.log('[文件列表] 调用getProcessFileListApi...');
  console.log('[文件列表] 参数:', {
    taskType: props.taskType,
    taskId: props.taskData.sepId,
    caseId: props.caseId,
  });

  try {
    const response = await getProcessFileListApi({
      taskType: props.taskType,
      taskId: props.taskData.sepId,
      caseId: props.caseId,
    });
    console.log('[文件列表] API响应:', response);

    if (response.status === '1') {
      console.log('[文件列表] 响应数据:', response.data);
      console.log('[文件列表] 文件数量:', response.data?.length || 0);
      fileList.value = response.data.map((record: any) => ({
        uid: record.id,
        name: record.originalFileName,
        fileId: record.id,
        fileName: record.originalFileName,
        fileSize: record.fileSize || 0,
        fileType: record.mimeType || '',
        uploadUser: record.uploadUser || '未知用户',
        uploadDate: record.uploadTime
          ? new Date(record.uploadTime)
          : new Date(),
        status: 'success',
        response: record,
      }));
      console.log('[文件列表] 加载后的fileList:', fileList.value);
    } else {
      console.log('[文件列表] API返回失败状态:', response.msg);
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
    ElMessage.error('加载文件列表失败');
  } finally {
    fileListLoading.value = false;
    console.log('[文件列表] loadFileList执行完成');
  }
};

const initFormData = () => {
  Object.keys(formData).forEach((key) => delete formData[key]);
  if (props.taskData) {
    const mappedData: any = {};
    Object.keys(props.taskData).forEach((key) => {
      // 直接使用小写字段名，不再需要映射
      const mappedKey = key.toLowerCase();
      mappedData[mappedKey] = props.taskData[key];
    });
    Object.assign(formData, mappedData);
    loadFileList();
  }
  activeTab.value = 'upload';
  fileList.value = [];
  console.log('[初始化] 弹窗已打开，任务数据:', props.taskData);
  console.log('[初始化] 任务ID (sepId):', props.taskData?.sepId);
  console.log('[初始化] 业务类型 (taskType):', props.taskType);
  console.log('[初始化] 案件ID (caseId):', props.caseId);
};

watch(() => props.taskData, initFormData, { immediate: true });

const handleClose = () => {
  console.log('[关闭] 弹窗已关闭');
  emit('close');
};

const handleUpload = async (options: any) => {
  console.log('[上传] handleUpload收到参数:', options);
  console.log('[上传] 参数类型:', typeof options);
  console.log('[上传] 是否为File对象:', options instanceof File);

  // 判断传入的是File对象还是包含raw属性的对象
  let rawFile: File | undefined;
  let fileName = '';

  if (options instanceof File) {
    // 从 :before-upload 调用，传入的是直接的 File 对象
    rawFile = options;
    fileName = options.name;
    console.log('[上传] 从:before-upload调用，rawFile:', rawFile);
  } else if (options.raw && options.raw instanceof File) {
    // 从 :on-change 调用，传入的是包含 raw 属性的对象
    rawFile = options.raw;
    fileName = options.name || options.raw.name;
    console.log('[上传] 从:on-change调用，rawFile:', rawFile);
  } else if (options.file && options.file instanceof File) {
    // 另一种可能的调用方式
    rawFile = options.file;
    fileName = options.name || options.file.name;
    console.log('[上传] 从其他方式调用，rawFile:', rawFile);
  }

  if (!rawFile) {
    console.error('[上传] 文件对象无效:', options);
    ElMessage.error('文件对象无效');
    return false;
  }

  uploadLoading.value = true;
  uploadProgress.value = 0;
  console.log('[上传] 开始上传文件:', fileName);
  console.log('[上传] 任务ID (sepId):', props.taskData?.sepId);

  if (!props.taskData?.sepId) {
    ElMessage.warning('请先保存任务信息，再上传文件');
    uploadLoading.value = false;
    return false;
  }

  try {
    console.log('[上传] 调用上传API...');
    const response = await uploadProcessFileApi({
      taskId: props.taskData.sepId,
      file: rawFile,
      caseId: props.caseId,
      taskType: props.taskType,
    });
    console.log('[上传] API响应:', response);

    if (response.status === '1') {
      const fileData = response.data;
      console.log('[上传] 文件数据:', fileData);
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
      console.log('[上传] 文件列表:', fileList.value);
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

// 处理文件选择后的变化（auto-upload="false"时使用）
const handleFileChange = async (fileObj: any) => {
  console.log('[上传] 文件选择变化:', fileObj);
  console.log('[上传] fileObj.status:', fileObj.status);
  console.log('[上传] fileObj.raw:', fileObj.raw);
  if (fileObj.status === 'ready' && fileObj.raw) {
    console.log('[上传] 开始上传文件:', fileObj.name);
    // 传入包含 raw 属性的对象
    await handleUpload({
      raw: fileObj.raw,
      name: fileObj.name,
    });
  }
};

const handleRemove = async (file: any) => {
  console.log('[删除] 开始删除文件:', file);
  try {
    const response = await deleteProcessFileApi({
      fileId: file.fileId,
      caseId: props.caseId,
    });
    console.log('[删除] API响应:', response);
    if (response.status === '1') {
      fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
      ElMessage.success('文件删除成功');
      console.log('[删除] 文件删除成功');
    } else {
      ElMessage.error(`文件删除失败：${response.msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('文件删除失败:', error);
    ElMessage.error('文件删除失败');
  }
};

const handleDownload = async (file: any) => {
  console.log('[下载] 开始下载文件:', file);
  try {
    const blob = await downloadProcessFileApi(file.fileId);
    console.log('[下载] 获取文件Blob成功');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载成功');
    console.log('[下载] 文件下载成功');
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

const handleSave = async () => {
  console.log('========== 任务保存开始 ==========');
  console.log('[保存] 模式:', props.mode);
  console.log('[保存] 任务数据:', props.taskData);
  console.log('[保存] 文件列表:', fileList.value);
  console.log(
    '[保存] 待上传文件数:',
    fileList.value.filter(
      (f: any) => f.status === 'pending' || f.response?.id === undefined,
    ).length,
  );

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

    // 第一阶段任务类型
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

    switch (props.mode) {
      case 'add': {
        console.log('[保存] 开始新增任务...');

        // 准备所有字段数据
        const allFields: any = {
          sepLd: props.caseId,
          sepMd: 1, // 模块ID
          sepNd: new Date().getFullYear().toString(), // 年度
          sepAuser: sep_auser,
        };

        currentConfig.value.fields.forEach((field: any) => {
          const value = formData[field.prop];
          if (value === '' || value === null || value === undefined) {
            allFields[field.prop] = [
              'AZZJE',
              'CCJE',
              'FPJE',
              'FPJE',
              'KFPZE',
              'KZJE',
              'TCJE',
              'YEJE',
              'ZFJE',
            ].includes(field.prop)
              ? '0'
              : '';
          } else {
            allFields[field.prop] = value;
          }
        });

        console.log('[保存] 调用新增API，参数:', allFields);
        const response = await currentConfig.value.addApi(allFields);
        console.log('[保存] 新增API响应:', response);

        // 适配新的API响应格式
        const isSuccess = response.code === 200 || response.status === '1';
        if (isSuccess) {
          console.log('[保存] 新增成功');
          emit('saved');
        } else {
          ElMessage.error(`添加失败：${response.message || response.error}`);
        }

        break;
      }
      case 'complete': {
        console.log('[保存] 开始标记完成...');
        const updateData = {
          sepEuser: sep_auser,
          sepEdate: sep_adate,
          sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
          sepLd: props.caseId,
          zt: '1',
        };

        console.log('[保存] 调用完成API，参数:', updateData);
        const response = isSeventhStage
          ? await update7Api(updateData)
          : isSixthStage
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
        console.log('[保存] 完成任务API响应:', response);

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
        console.log('[保存] 开始编辑任务...');
        const updateData = {
          sepEuser: sep_auser,
          sepEdate: sep_adate,
          sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
          sepLd: props.caseId,
          zt: props.taskData?.zt || props.taskData?.ZT || '0',
          ...formData,
        };

        console.log('[保存] 调用编辑API，参数:', updateData);
        const response = isSeventhStage
          ? await update7Api(updateData)
          : isSixthStage
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
        console.log('[保存] 编辑API响应:', response);

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
        console.log('[保存] 开始标记跳过...');
        const updateData = {
          sepEuser: sep_auser,
          sepEdate: sep_adate,
          sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
          sepLd: props.caseId,
          zt: '2',
        };

        console.log('[保存] 调用跳过API，参数:', updateData);
        const response = isSeventhStage
          ? await update7Api(updateData)
          : isSixthStage
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
        console.log('[保存] 跳过API响应:', response);

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
    console.log('========== 任务保存结束 ==========');
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

    const updateData = {
      sepEuser: sep_auser,
      sepEdate: sep_adate,
      sepId: props.taskData?.sepId || props.taskData?.SEP_ID,
      sepLd: props.caseId,
      zt: '0',
    };

    // 第一阶段任务类型
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

    const response = isSeventhStage
      ? await update7Api(updateData)
      : isSixthStage
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
  currentConfig.value.fields.forEach((field: any) => {
    if (field.required) {
      rules[field.prop] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' },
      ];
    }
  });
  return rules;
});
</script>

<template>
  <ElDialog
    :title="dialogTitle"
    model-value
    width="800px"
    destroy-on-close
    @close="handleClose"
  >
    <div class="task-edit-container">
      <ElRadioGroup v-model="activeTab" class="tab-group">
        <ElRadioButton value="upload">
          <Icon icon="lucide:upload" class="mr-1" />
          上传文件
        </ElRadioButton>
        <ElRadioButton value="data">
          <Icon icon="lucide:database" class="mr-1" />
          自定义数据
        </ElRadioButton>
      </ElRadioGroup>

      <div v-if="activeTab === 'upload'" class="upload-section">
        <div class="upload-header">
          <h3>上传文件</h3>
          <span class="tip-text">支持上传文档、图片等文件，单个文件不超过50MB</span>
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
                  <span class="file-size">{{
                      ((file.fileSize || 0) / 1024 / 1024).toFixed(2)
                    }}
                    MB</span>
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
              <ElButton
                type="primary"
                size="small"
                @click="handleDownload(file)"
              >
                <Icon icon="lucide:download" class="mr-1" />
                下载
              </ElButton>
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
    </div>

    <template #footer>
      <div class="dialog-footer">
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
    </template>
  </ElDialog>
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
