<script setup lang="ts">
import type { UploadUserFile } from 'element-plus';

import { computed, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElDrawer,
  ElEmpty,
  ElMessage,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElTree,
  ElUpload,
} from 'element-plus';

import {
  deleteFileApi,
  downloadFileApi,
  getFileListApi,
} from '#/api/core/file';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  bizType?: string;
  bizId?: number;
  category?: string;
}

interface FileRecord {
  id: number;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  fileHash: string;
  bizType: string;
  bizId: number;
  uploadTime: string;
  uploadUser: string;
  fileStatus: number;
  isDeleted: boolean;
}

const props = defineProps<{
  caseId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const drawerVisible = ref(false);
const selectedNode = ref<null | TreeNode>(null);
const fileList = ref<FileRecord[]>([]);
const fileListLoading = ref(false);
const uploadDialogVisible = ref(false);
const uploadFileList = ref<UploadUserFile[]>([]);
const uploadLoading = ref(false);

const archiveTreeData = computed<TreeNode[]>(() => [
  {
    id: '0',
    label: '零、预重整/庭外重组阶段文件（若适用）',
    children: [
      {
        id: '0-1',
        label: '1. 启动与协调',
        children: [
          {
            id: '0-1-1',
            label: '1.1 预重整/庭外重组启动文件',
            category: 'pre_restructuring_start',
          },
          {
            id: '0-1-2',
            label: '1.2 临时管理人/辅助机构选任文件',
            category: 'temporary_manager',
          },
          {
            id: '0-1-3',
            label: '1.3 预重整工作方案/计划',
            category: 'pre_restructuring_plan',
          },
        ],
      },
      {
        id: '0-2',
        label: '2. 程序推进',
        children: [
          {
            id: '0-2-1',
            label: '2.1 预重整期间财产保全/暂缓执行相关申请及法院文书',
            category: 'property_preservation',
          },
          {
            id: '0-2-2',
            label: '2.2 意向投资人招募及接洽文件',
            category: 'investor_recruitment',
          },
          {
            id: '0-2-3',
            label: '2.3 预重整期间的债权初步统计/沟通记录',
            category: 'preliminary_credit_statistics',
          },
          {
            id: '0-2-4',
            label: '2.4 预重整协议/重组方案草案及协商记录',
            category: 'restructuring_agreement',
          },
          {
            id: '0-2-5',
            label: '2.5 预重整工作报告',
            category: 'pre_restructuring_report',
          },
        ],
      },
    ],
  },
  {
    id: '1',
    label: '一、法院程序文件',
    children: [
      {
        id: '1-1',
        label: '1. 立案受理阶段',
        category: 'filing_acceptance',
      },
      {
        id: '1-2',
        label: '2. 债权申报与确认',
        children: [
          {
            id: '1-2-1',
            label: '2.1 确认无异议债权裁定书',
            category: 'no_dispute_credit_ruling',
          },
          {
            id: '1-2-2',
            label: '2.2 （若有）确认有异议债权或待定债权的裁定/判决',
            category: 'disputed_credit_ruling',
          },
        ],
      },
      {
        id: '1-3',
        label: '3. 财产处置与分配',
        children: [
          {
            id: '1-3-1',
            label: '3.1 批准财产管理/变价方案的决定/裁定',
            category: 'property_management_plan',
          },
          {
            id: '1-3-2',
            label: '3.2 协助执行通知书/裁定书（不动产、股权等）',
            category: 'execution_notice',
          },
          {
            id: '1-3-3',
            label: '3.3 认可财产分配方案裁定书',
            category: 'property_distribution_ruling',
          },
          {
            id: '1-3-4',
            label: '3.4 批准破产费用/管理人报酬的裁定',
            category: 'bankruptcy_expenses_ruling',
          },
        ],
      },
      {
        id: '1-4',
        label: '4. 程序转换与宣告破产',
        children: [
          {
            id: '1-4-1',
            label: '4.1 宣告破产裁定书',
            category: 'bankruptcy_declaration',
          },
          {
            id: '1-4-2',
            label: '4.2 （若有）程序转换相关裁定书',
            category: 'procedure_conversion',
          },
        ],
      },
      {
        id: '1-5',
        label: '5. 重整/和解程序（若适用）',
        children: [
          {
            id: '1-5-1',
            label: '5.1 批准重整计划/认可和解协议并终止程序的裁定书',
            category: 'reorganization_plan',
          },
          {
            id: '1-5-2',
            label: '5.2 批准重整计划/认可和解协议公告',
            category: 'reorganization_announcement',
          },
          {
            id: '1-5-3',
            label: '5.3 （若有）监督期相关法院文书',
            category: 'supervision_documents',
          },
        ],
      },
      {
        id: '1-6',
        label: '6. 程序终结',
        children: [
          {
            id: '1-6-1',
            label: '6.1 终结破产程序裁定书',
            category: 'termination_ruling',
          },
        ],
      },
      {
        id: '1-7',
        label: '7. 其他法院文书',
        children: [
          {
            id: '1-7-1',
            label: '7.1 许可管理人特定行为的决定/裁定',
            category: 'permission_decision',
          },
          {
            id: '1-7-2',
            label: '7.2 涉及破产程序的各类通知书、决定书、裁定书等',
            category: 'court_documents',
          },
          {
            id: '1-7-3',
            label: '7.3 许可/不许可特定行为的决定/裁定',
            category: 'permission_ruling',
          },
          {
            id: '1-7-4',
            label: '7.4 法律文书生效证明',
            category: 'legal_effectiveness_proof',
          },
          {
            id: '1-7-5',
            label: '7.5 强制清算转破产清算相关文书',
            category: 'liquidation_conversion',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    label: '二、管理人工作文件',
    children: [
      {
        id: '2-1',
        label: '1. 管理人档案',
        children: [
          {
            id: '2-1-1',
            label: '1.1 管理人资质文件',
            category: 'manager_qualification',
          },
          {
            id: '2-1-2',
            label: '1.2 管理人团队组成报告及成员信息',
            category: 'manager_team_info',
          },
          {
            id: '2-1-3',
            label: '1.3 利益冲突审查与披露声明',
            category: 'conflict_interest_disclosure',
          },
          {
            id: '2-1-4',
            label: '1.4 管理人内部议事规则',
            category: 'internal_rules',
          },
          {
            id: '2-1-5',
            label: '1.5 财务管理制度',
            category: 'financial_management',
          },
          {
            id: '2-1-6',
            label: '1.6 印章管理制度（备案函、保管交接记录）',
            category: 'seal_management',
          },
          {
            id: '2-1-7',
            label: '1.7 收发文管理制度',
            category: 'document_management',
          },
          {
            id: '2-1-8',
            label: '1.8 档案管理制度',
            category: 'archive_management',
          },
          {
            id: '2-1-9',
            label: '1.9 管理人责任保险文件',
            category: 'liability_insurance',
          },
        ],
      },
      {
        id: '2-2',
        label: '2. 接管工作',
        children: [
          { id: '2-2-1', label: '2.1 接管方案', category: 'takeover_plan' },
          {
            id: '2-2-2',
            label: '2.2 接管清单（印章证照、财务账册、实物资产、电子数据等）',
            category: 'takeover_inventory',
          },
          {
            id: '2-2-3',
            label: '2.3 与债务人及相关人员的谈话笔录',
            category: 'interview_records',
          },
          {
            id: '2-2-4',
            label: '2.4 现场接收照片/视频记录',
            category: 'site_photos',
          },
          {
            id: '2-2-5',
            label: '2.5 债务人（或相关人员）移交资料及确认清单',
            category: 'handover_checklist',
          },
        ],
      },
      {
        id: '2-3',
        label: '3. 调查工作',
        children: [
          {
            id: '2-3-1',
            label: '3.1 尽职调查计划',
            category: 'due_diligence_plan',
          },
          {
            id: '2-3-2',
            label: '3.2 尽职调查报告',
            category: 'due_diligence_report',
          },
          {
            id: '2-3-3',
            label: '3.3 财产状况调查报告',
            category: 'property_status_report',
          },
          {
            id: '2-3-4',
            label: '3.4 债务人基本情况调查（工商档案、股东出资等）',
            category: 'debtor_basic_info',
          },
          {
            id: '2-3-5',
            label: '3.5 资产调查底稿（不动产、动产、银行账户等）',
            category: 'asset_investigation',
          },
          {
            id: '2-3-6',
            label: '3.6 负债情况调查底稿（合同、诉讼、担保等）',
            category: 'liability_investigation',
          },
          {
            id: '2-3-7',
            label: '3.7 关联交易调查记录',
            category: 'related_party_transaction',
          },
          {
            id: '2-3-8',
            label:
              '3.8 追回财产相关调查记录（含可撤销/无效行为、股东出资不实、损害赔偿等）及法律意见',
            category: 'property_recovery_investigation',
          },
        ],
      },
      {
        id: '2-4',
        label: '4. 财产管理与处置',
        children: [
          {
            id: '2-4-1',
            label: '4.1 财产管理与变价方案',
            category: 'property_management_plan',
          },
          {
            id: '2-4-2',
            label: '4.2 请求法院解除财产保全/协助执行的申请书/报告',
            category: 'property_preservation_release',
          },
          {
            id: '2-4-3',
            label: '4.3 财产维护、保管记录',
            category: 'property_maintenance',
          },
          {
            id: '2-4-4',
            label: '4.4 资产处置公告/拍卖/变卖记录',
            category: 'asset_disposal',
          },
          {
            id: '2-4-5',
            label: '4.5 资产过户/交付记录',
            category: 'asset_transfer',
          },
          {
            id: '2-4-6',
            label: '4.6 未履行合同处理（解除/继续履行通知书等）',
            category: 'contract_handling',
          },
          {
            id: '2-4-7',
            label: '4.7 取回权/抵销权/在途标的物处理记录及通知书',
            category: 'right_handling',
          },
        ],
      },
      {
        id: '2-5',
        label: '5. 债权事务管理',
        children: [
          {
            id: '2-5-1',
            label: '5.1 债权申报公告、通知书、申报须知',
            category: 'credit_claim_notice',
          },
          {
            id: '2-5-2',
            label: '5.2 债权申报登记册',
            category: 'credit_claim_register',
          },
          {
            id: '2-5-3',
            label: '5.3 债权审查规则',
            category: 'credit_review_rules',
          },
          {
            id: '2-5-4',
            label: '5.4 债权审查工作底稿',
            category: 'credit_review_working_papers',
          },
          {
            id: '2-5-5',
            label: '5.5 职工债权调查报告、公示表',
            category: 'employee_credit_report',
          },
          {
            id: '2-5-6',
            label: '5.6 债权确认/不予确认通知书',
            category: 'credit_confirmation_notice',
          },
          {
            id: '2-5-7',
            label: '5.7 债权异议处理记录（异议书、复函等）',
            category: 'credit_objection_handling',
          },
          {
            id: '2-5-8',
            label: '5.8 债权表编制及异议更正记录',
            category: 'credit_list_compilation',
          },
        ],
      },
      {
        id: '2-6',
        label: '6. 债权人会议事务',
        children: [
          {
            id: '2-6-1',
            label: '6.1 债权人会议通知、议程、签到册',
            category: 'creditor_meeting_notice',
          },
          {
            id: '2-6-2',
            label: '6.2 会议资料（管理人工作报告、财产状况报告等）',
            category: 'meeting_materials',
          },
          {
            id: '2-6-3',
            label: '6.3 表决票、表决结果统计报告',
            category: 'voting_records',
          },
          {
            id: '2-6-4',
            label: '6.4 （若有）债权人委员会文件（成立决议、会议纪要等）',
            category: 'creditor_committee',
          },
          {
            id: '2-6-5',
            label: '6.5 （若有）债权人委员会工作规则',
            category: 'committee_rules',
          },
          {
            id: '2-6-6',
            label: '6.6 （若有）债权人委员会履职记录/报告',
            category: 'committee_performance_report',
          },
        ],
      },
      {
        id: '2-7',
        label: '7. 财务管理与分配',
        children: [
          {
            id: '2-7-1',
            label: '7.1 管理人账户开户许可证',
            category: 'manager_account_permit',
          },
          {
            id: '2-7-2',
            label: '7.2 破产费用预算及执行报告',
            category: 'bankruptcy_expenses_report',
          },
          {
            id: '2-7-3',
            label: '7.3 财产分配方案（草案及定稿）',
            category: 'property_distribution_plan',
          },
          {
            id: '2-7-4',
            label: '7.4 财产分配公告',
            category: 'property_distribution_announcement',
          },
          {
            id: '2-7-5',
            label: '7.5 分配执行记录（分配表、支付凭证）',
            category: 'distribution_execution',
          },
          {
            id: '2-7-6',
            label: '7.6 管理人报酬方案及申请报告',
            category: 'manager_remuneration',
          },
          {
            id: '2-7-7',
            label: '7.7 税务申报与处理记录',
            category: 'tax_declaration',
          },
        ],
      },
      {
        id: '2-8',
        label: '8. 对外报告与沟通',
        children: [
          {
            id: '2-8-1',
            label: '8.1 向法院提交的各类报告',
            category: 'court_reports',
          },
          {
            id: '2-8-2',
            label: '8.2 与法院、债权人等重要沟通函件/邮件记录',
            category: 'communication_records',
          },
          {
            id: '2-8-3',
            label: '8.3 （若有）向政府部门报告的文件',
            category: 'government_reports',
          },
          {
            id: '2-8-4',
            label: '8.4 新闻发布/公告上网等信息披露记录',
            category: 'information_disclosure',
          },
        ],
      },
      {
        id: '2-9',
        label: '9. 衍生诉讼/仲裁管理',
        children: [
          {
            id: '2-9-1',
            label: '9.1 诉讼/仲裁案件清单',
            category: 'litigation_list',
          },
          {
            id: '2-9-2',
            label: '9.2 法律文书（起诉状、答辩状等）',
            category: 'legal_documents',
          },
          {
            id: '2-9-3',
            label: '9.3 证据材料',
            category: 'evidence_materials',
          },
          {
            id: '2-9-4',
            label: '9.4 法院/仲裁机构的裁定、判决书',
            category: 'court_arbitration_rulings',
          },
        ],
      },
      {
        id: '2-10',
        label: '10. 专项工作',
        children: [
          {
            id: '2-10-1',
            label: '10.1 股东出资催缴通知及处理记录',
            category: 'shareholder_capital_call',
          },
          {
            id: '2-10-2',
            label: '10.2 安全生产、环保等特殊事项处理记录',
            category: 'safety_environmental_handling',
          },
          {
            id: '2-10-3',
            label: '10.3 职工安置方案及执行记录',
            category: 'employee_settlement',
          },
          {
            id: '2-10-4',
            label: '10.4 税务注销专项报告',
            category: 'tax_cancellation_report',
          },
          {
            id: '2-10-5',
            label: '10.5 环保问题处理记录',
            category: 'environmental_handling',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    label: '三、对外委托文件',
    children: [
      {
        id: '3-1',
        label: '1. 中介机构选聘',
        children: [
          {
            id: '3-1-1',
            label: '1.1 选聘公告/邀请函',
            category: 'intermediary_selection_notice',
          },
          {
            id: '3-1-2',
            label: '1.2 标书、评审规则',
            category: 'bidding_rules',
          },
          {
            id: '3-1-3',
            label: '1.3 评审会议记录（签到表、决议等）',
            category: 'review_meeting_records',
          },
          {
            id: '3-1-4',
            label: '1.4 中选通知书',
            category: 'selection_notice',
          },
        ],
      },
      {
        id: '3-2',
        label: '2. 委托合同与管理',
        children: [
          {
            id: '3-2-1',
            label: '2.1 审计/评估委托合同',
            category: 'audit_evaluation_contract',
          },
          {
            id: '3-2-2',
            label: '2.2 与中介机构的沟通记录、工作指令',
            category: 'intermediary_communication',
          },
          {
            id: '3-2-3',
            label: '2.3 中介机构资质文件、承诺函',
            category: 'intermediary_qualification',
          },
        ],
      },
      {
        id: '3-3',
        label: '3. 中介机构工作成果',
        children: [
          {
            id: '3-3-1',
            label: '3.1 审计报告及附件',
            category: 'audit_report',
          },
          {
            id: '3-3-2',
            label: '3.2 评估报告及附件',
            category: 'evaluation_report',
          },
          { id: '3-3-3', label: '3.3 法律意见书', category: 'legal_opinion' },
          {
            id: '3-3-4',
            label: '3.4 其他专项报告及附件',
            category: 'special_report',
          },
          {
            id: '3-3-5',
            label: '3.5 中介机构工作底稿（根据需要归档关键部分）',
            category: 'intermediary_working_papers',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    label: '四、债务人文件',
    children: [
      {
        id: '4-1',
        label: '1. 基础信息',
        children: [
          {
            id: '4-1-1',
            label: '1.1 营业执照、公司章程',
            category: 'business_license',
          },
          {
            id: '4-1-2',
            label: '1.2 股东名册、出资证明',
            category: 'shareholder_list',
          },
          {
            id: '4-1-3',
            label: '1.3 董事、监事、高管名单',
            category: 'director_list',
          },
        ],
      },
      {
        id: '4-2',
        label: '2. 财务会计资料',
        children: [
          {
            id: '4-2-1',
            label: '2.1 历年财务报表',
            category: 'financial_statements',
          },
          {
            id: '4-2-2',
            label: '2.2 会计账簿、凭证',
            category: 'accounting_records',
          },
          {
            id: '4-2-3',
            label: '2.3 银行账户信息、对账单',
            category: 'bank_account_info',
          },
        ],
      },
      {
        id: '4-3',
        label: '3. 业务经营资料',
        children: [
          {
            id: '4-3-1',
            label: '3.1 主要经营合同（采购、销售等）',
            category: 'business_contracts',
          },
          {
            id: '4-3-2',
            label: '3.2 知识产权证书（专利、商标等）',
            category: 'intellectual_property',
          },
          {
            id: '4-3-3',
            label: '3.3 诉讼/仲裁案件材料',
            category: 'litigation_materials',
          },
          {
            id: '4-3-4',
            label: '3.4 行政许可/资质证书',
            category: 'administrative_licenses',
          },
          {
            id: '4-3-5',
            label: '3.5 重大资产清单及权属证明',
            category: 'major_assets_list',
          },
        ],
      },
      {
        id: '4-4',
        label: '4. 人力资源资料',
        children: [
          { id: '4-4-1', label: '4.1 职工名册', category: 'employee_list' },
          { id: '4-4-2', label: '4.2 劳动合同', category: 'labor_contracts' },
          {
            id: '4-4-3',
            label: '4.3 工资发放记录、社保公积金缴纳记录',
            category: 'salary_records',
          },
          {
            id: '4-4-4',
            label: '4.4 职工安置相关文件（如经济补偿金计算依据）',
            category: 'employee_settlement_files',
          },
        ],
      },
    ],
  },
  {
    id: '5',
    label: '五、债权人文件',
    children: [
      {
        id: '5-1',
        label: '1. 债权申报材料',
        children: [
          {
            id: '5-1-1',
            label: '1.1 债权申报表',
            category: 'credit_claim_form',
          },
          {
            id: '5-1-2',
            label: '1.2 债权人主体资格证明',
            category: 'creditor_qualification_proof',
          },
          {
            id: '5-1-3',
            label: '1.3 债权证据材料（合同、判决书等）',
            category: 'credit_evidence',
          },
          {
            id: '5-1-4',
            label: '1.4 担保情况说明',
            category: 'guarantee_explanation',
          },
        ],
      },
    ],
  },
  {
    id: '6',
    label: '六、案件终结与归档',
    children: [
      {
        id: '6-1',
        label: '1. 终结程序文件',
        children: [
          {
            id: '6-1-1',
            label: '1.1 工商、税务注销凭证',
            category: 'business_tax_cancellation',
          },
          {
            id: '6-1-2',
            label: '1.2 管理人履职报告/工作总结',
            category: 'manager_performance_report',
          },
          {
            id: '6-1-3',
            label: '1.3 档案整理清单',
            category: 'archive_inventory',
          },
          {
            id: '6-1-4',
            label: '1.4 档案移交确认书',
            category: 'archive_handover_confirmation',
          },
        ],
      },
    ],
  },
]);

const openDrawer = () => {
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  selectedNode.value = null;
  fileList.value = [];
  emit('close');
};

const handleNodeClick = async (data: TreeNode) => {
  if (!data.category) {
    ElMessage.info('请选择具体的文件分类');
    return;
  }

  selectedNode.value = data;
  await loadFileList(data.category);
};

const loadFileList = async (category: string) => {
  fileListLoading.value = true;
  try {
    const response = await getFileListApi('archive', Number(props.caseId));
<<<<<<< Updated upstream
    if (response.status === '1') {
      fileList.value = (response.data || []).filter((file: FileRecord) => {
        const fileCategory = file.filePath?.split('/')[2];
        return fileCategory === category;
      });
=======
    if (response.code === 200) {
      fileList.value = (response.data?.list || []).filter(
        (file: FileRecord) => {
          const fileCategory = file.filePath?.split('/')[2];
          return fileCategory === category;
        },
      );
>>>>>>> Stashed changes
    } else {
      ElMessage.error('获取文件列表失败');
      fileList.value = [];
    }
  } catch (error) {
    console.error('获取文件列表失败:', error);
    ElMessage.error('获取文件列表失败');
    fileList.value = [];
  } finally {
    fileListLoading.value = false;
  }
};

const openUploadDialog = () => {
  if (!selectedNode.value?.category) {
    ElMessage.warning('请先选择一个文件分类');
    return;
  }
  uploadDialogVisible.value = true;
};

const uploadFiles = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  uploadLoading.value = true;
  try {
    const category = selectedNode.value?.category || 'default';
    for (const file of uploadFileList.value) {
      if (file.raw) {
        const formData = new FormData();
        formData.append('file', file.raw);
        formData.append('bizType', 'archive');
        formData.append('bizId', props.caseId);
        formData.append('category', category);

        const response = await fetch(
          'http://192.168.0.120:8080/api/file/upload',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
            body: formData,
          },
        );

        const result = await response.json();
        if (result.status !== '1') {
          throw new Error(`文件${file.name}上传失败`);
        }
      }
    }
    ElMessage.success('所有文件上传成功');
    uploadDialogVisible.value = false;
    uploadFileList.value = [];
    if (selectedNode.value?.category) {
      await loadFileList(selectedNode.value.category);
    }
  } catch (error) {
    console.error('上传文件失败:', error);
    ElMessage.error('上传文件失败');
  } finally {
    uploadLoading.value = false;
  }
};

const downloadFile = async (file: FileRecord) => {
  try {
    const response = await downloadFileApi(file.id);
    const blob = new Blob([response], { type: file.mimeType });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = file.originalFileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载开始');
  } catch (error) {
    console.error('下载文件失败:', error);
    ElMessage.error('下载文件失败');
  }
};

const previewFile = async (file: FileRecord) => {
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  if (previewableExtensions.includes(file.fileExtension.toLowerCase())) {
    window.open(
      `http://192.168.0.120:8080/api/file/view/${file.id}?token=${localStorage.getItem('token') || ''}`,
      '_blank',
    );
  } else {
    ElMessage.info('该文件类型不支持在线预览，建议下载后查看');
  }
};

const deleteFile = async (file: FileRecord) => {
  try {
    const response = await deleteFileApi(file.id);
    if (response.status === '1') {
      ElMessage.success('文件删除成功');
      if (selectedNode.value?.category) {
        await loadFileList(selectedNode.value.category);
      }
    } else {
      ElMessage.error(`文件删除失败：${response.msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除文件失败:', error);
    ElMessage.error('删除文件失败');
  }
};

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileIcon = (extension: string) => {
  const iconMap: Record<string, string> = {
    pdf: 'lucide:file-text',
    doc: 'lucide:file',
    docx: 'lucide:file',
    xls: 'lucide:file-spreadsheet',
    xlsx: 'lucide:file-spreadsheet',
    jpg: 'lucide:image',
    jpeg: 'lucide:image',
    png: 'lucide:image',
    gif: 'lucide:image',
  };
  return iconMap[extension.toLowerCase()] || 'lucide:file';
};

const uploadAction = computed(() => {
  return '';
});

const uploadHeaders = computed(() => {
  return {};
});

const uploadData = computed(() => {
  return {};
});

defineExpose({
  openDrawer,
});
</script>

<template>
  <ElDrawer
    v-model="drawerVisible"
    title="案件卷宗归档"
    direction="rtl"
    size="80%"
    @close="closeDrawer"
  >
    <div class="archive-container">
      <div class="archive-sidebar">
        <ElCard shadow="never" class="tree-card">
          <template #header>
            <div class="tree-header">
              <Icon icon="lucide:folder-tree" class="mr-2" />
              <span>归档目录</span>
            </div>
          </template>
          <ElTree
            :data="archiveTreeData"
            :props="{ label: 'label', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
            class="archive-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <Icon
                  :icon="data.children ? 'lucide:folder' : 'lucide:file'"
                  class="node-icon"
                />
                <span class="node-label">{{ node.label }}</span>
              </div>
            </template>
          </ElTree>
        </ElCard>
      </div>

      <div class="archive-content">
        <ElCard shadow="never" class="content-card">
          <template #header>
            <div class="content-header">
              <div class="header-left">
                <Icon icon="lucide:folder-open" class="mr-2" />
                <span class="current-path">
                  {{ selectedNode?.label || '请选择归档目录' }}
                </span>
              </div>
              <div class="header-right">
                <ElButton
                  type="primary"
                  :disabled="!selectedNode?.category"
                  @click="openUploadDialog"
                >
                  <Icon icon="lucide:upload" class="mr-1" />
                  上传文件
                </ElButton>
              </div>
            </div>
          </template>

          <div v-if="!selectedNode?.category" class="empty-state">
            <ElEmpty description="请从左侧选择一个归档目录" />
          </div>

          <div v-else-if="fileListLoading" class="loading-state">
            <ElEmpty description="加载中..." />
          </div>

          <div v-else-if="fileList.length === 0" class="empty-state">
            <ElEmpty description="暂无文件" />
          </div>

          <div v-else class="file-list">
            <ElTable :data="fileList" border stripe style="width: 100%">
              <ElTableColumn type="index" label="序号" width="60" />
              <ElTableColumn label="文件名" min-width="200">
                <template #default="{ row }">
                  <div class="file-name-cell">
                    <Icon
                      :icon="getFileIcon(row.fileExtension)"
                      class="file-icon"
                    />
                    <span>{{ row.originalFileName }}</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="fileSize"
                label="文件大小"
                width="120"
                :formatter="(row) => formatFileSize(row.fileSize)"
              />
              <ElTableColumn
                prop="uploadTime"
                label="上传时间"
                width="180"
                :formatter="(row) => formatDate(row.uploadTime)"
              />
              <ElTableColumn label="操作" width="280" fixed="right">
                <template #default="{ row }">
                  <ElButton
                    size="small"
                    @click="downloadFile(row)"
                    style="margin-right: 8px"
                  >
                    <Icon icon="lucide:download" class="mr-1" />
                    下载
                  </ElButton>
                  <ElButton
                    size="small"
                    @click="previewFile(row)"
                    style="margin-right: 8px"
                  >
                    <Icon icon="lucide:eye" class="mr-1" />
                    预览
                  </ElButton>
                  <ElPopconfirm
                    title="确定要删除这个文件吗？"
                    @confirm="deleteFile(row)"
                  >
                    <ElButton size="small" type="danger">
                      <Icon icon="lucide:trash-2" class="mr-1" />
                      删除
                    </ElButton>
                  </ElPopconfirm>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElCard>
      </div>
    </div>

    <ElDialog
      v-model="uploadDialogVisible"
      title="上传文件"
      width="600px"
      destroy-on-close
    >
      <ElUpload
        v-model:file-list="uploadFileList"
        :auto-upload="false"
        multiple
        drag
        class="upload-area"
      >
        <Icon icon="lucide:upload-cloud" class="upload-icon" />
        <div class="upload-text">
          <p>将文件拖到此处，或点击上传</p>
          <p class="upload-tip">支持上传文档、图片等文件，单个文件不超过50MB</p>
        </div>
      </ElUpload>
      <template #footer>
        <ElButton @click="uploadDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="uploadLoading" @click="uploadFiles">
          开始上传
        </ElButton>
      </template>
    </ElDialog>
  </ElDrawer>
</template>

<style scoped>
.archive-container {
  display: flex;
  height: 100%;
  gap: 20px;
}

.archive-sidebar {
  width: 350px;
  flex-shrink: 0;
}

.tree-card {
  height: 100%;
}

.tree-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.tree-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.archive-tree {
  background: transparent;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-icon {
  font-size: 16px;
  color: #6b7280;
}

.node-label {
  font-size: 14px;
  color: #374151;
}

.archive-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-card {
  height: 100%;
}

.content-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  color: #1f2937;
  font-weight: 600;
}

.current-path {
  font-size: 16px;
}

.empty-state,
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.file-list {
  height: 100%;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 18px;
  color: #6b7280;
}

.upload-area {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-text p {
  margin: 8px 0;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}
</style>
