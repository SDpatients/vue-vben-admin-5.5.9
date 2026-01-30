<script setup lang="ts">
import type { ClaimRegistrationApi } from '#/api/core/claim-registration';

import { computed, onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElAlert,
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElPopconfirm,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCurrentUserApi } from '#/api/core/auth';
import { getCaseReviewStatusApi } from '#/api/core/case';
import { getCreditorListApi } from '#/api/core/creditor';
import { getDebtorListApi } from '#/api/core/debtor';

import { useClaimForm } from './composables/useClaimForm';
import { useClaimPagination } from './composables/useClaimPagination';
import { ClaimService } from './services/claimService';
import {
  getMaterialCompletenessTag,
  getRegistrationStatusTag,
} from './utils/claimStatusMapper';
import { claimFormRules } from './utils/claimFormRules';
import { parseExcelApi } from '#/api/core/claim-registration';

const props = defineProps<{
  caseId: string;
}>();

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);

const showAddDialog = ref(false);
const showDetailDialog = ref(false);
const showMaterialDialog = ref(false);
const showImportDialog = ref(false);
const showEditDialog = ref(false);
const editLoading = ref(false);
const currentEditClaim = ref<any>(null);
const statusFilter = ref<string>('PENDING');
const showImportErrorDialog = ref(false);
const addLoading = ref(false);
const materialLoading = ref(false);
const importLoading = ref(false);
const currentClaim = ref<ClaimRegistrationApi.ClaimRegistrationInfo | null>(
  null,
);
const importResult = ref<any>(null);

const materialForm = reactive({
  receiver: '',
  completeness: 'COMPLETE' as ClaimRegistrationApi.MaterialCompleteness,
});

const { claimForm, totalAmount, resetClaimForm } = useClaimForm();
const { currentPage, pageSize, total, handlePageChange, handlePageSizeChange } =
  useClaimPagination();

const fileList = ref<any[]>([]);
const debtorList = ref<any[]>([]);
const creditorList = ref<any[]>([]);
const debtorListLoading = ref(false);
const creditorListLoading = ref(false);

// 文件导入相关变量
const selectedFile = ref<any>(null);
const importing = ref(false);
const uploadRef = ref<any>(null);

const hasRegisteredClaims = computed(() => {
  return claims.value.some(
    (claim: any) => claim.registration_status === 'REGISTERED',
  );
});

const fetchClaims = async () => {
  loading.value = true;
  const result = await ClaimService.fetchClaims(
    Number(props.caseId),
    currentPage.value,
    pageSize.value,
    statusFilter.value,
  );
  if (result.success) {
    claims.value = result.data;
    total.value = result.total;
  } else {
    claims.value = [];
    total.value = 0;
  }
  loading.value = false;
};

const fetchDebtorList = async () => {
  debtorListLoading.value = true;
  try {
    const response = await getDebtorListApi({
      caseId: Number(props.caseId),
      pageNum: 1,
      pageSize: 100,
    });
    if (response.code === 200 && response.data?.list) {
      debtorList.value = response.data.list.map((debtor: any) => ({
        label: debtor.enterpriseName,
        value: debtor.id,
        caseNumber: debtor.caseNumber,
        caseName: debtor.caseName,
      }));
    }
  } catch (error) {
    console.error('获取债务人列表失败:', error);
  } finally {
    debtorListLoading.value = false;
  }
};

const creditorTypeMap: Record<string, string> = {
  ENTERPRISE: '企业',
  INDIVIDUAL: '个人',
  FINANCIAL_INSTITUTION: '金融机构',
  GOVERNMENT: '政府机构',
  OTHER: '其他',
  金融机构: '金融机构',
  企业: '企业',
  个人: '个人',
  政府机构: '政府机构',
  其他: '其他',
};

const convertCreditorType = (type: string): string => {
  return creditorTypeMap[type] || type;
};

const fetchCreditorList = async (keyword: string = '') => {
  creditorListLoading.value = true;
  try {
    const response = await getCreditorListApi({
      caseId: Number(props.caseId),
      creditorName: keyword || undefined,
      pageNum: 1,
      pageSize: 100,
    });
    if (response.code === 200 && response.data?.list) {
      creditorList.value = response.data.list.map((creditor: any) => ({
        label: creditor.creditorName,
        value: creditor.id,
        creditorType: convertCreditorType(creditor.creditorType),
        caseNumber: creditor.caseNumber,
        caseName: creditor.caseName,
      }));
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
  } finally {
    creditorListLoading.value = false;
  }
};

const openDetailDialog = async (row: any) => {
  const result = await ClaimService.getClaimDetail(row.id);
  if (result.success) {
    currentClaim.value = result.data;
    showDetailDialog.value = true;
  }
};

const openMaterialDialog = async (row: any) => {
  const result = await ClaimService.getClaimDetail(row.id);
  if (result.success) {
    currentClaim.value = result.data;
    try {
      const userResponse = await getCurrentUserApi();
      materialForm.receiver =
        userResponse.code === 200 && userResponse.data
          ? userResponse.data.realName || '当前用户'
          : '当前用户';
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      materialForm.receiver = '当前用户';
    }
    materialForm.completeness = 'COMPLETE';
    showMaterialDialog.value = true;
  }
};

const closeMaterialDialog = () => {
  showMaterialDialog.value = false;
  currentClaim.value = null;
  materialForm.receiver = '';
  materialForm.completeness = 'COMPLETE';
};

const handleReceiveMaterial = async () => {
  if (!currentClaim.value) {
    ElMessage.warning('请先选择债权');
    return;
  }

  if (!materialForm.receiver) {
    ElMessage.warning('请输入接收人');
    return;
  }

  materialLoading.value = true;
  const result = await ClaimService.receiveMaterial(currentClaim.value.id, {
    receiver: materialForm.receiver,
    completeness: materialForm.completeness,
  });
  if (result.success) {
    await fetchClaims();
    closeMaterialDialog();
  }
  materialLoading.value = false;
};

const handleRegisterClaim = async (row: any) => {
  ElMessageBox.confirm('确定要完成债权申报登记吗？', '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const receiveResult = await ClaimService.receiveMaterial(row.id, {
        receiver: '当前用户',
        completeness: 'COMPLETE',
      });
      if (receiveResult.success) {
        const statusResult = await ClaimService.updateClaimStatus(row.id, 'REGISTERED');
        if (statusResult.success) {
          await fetchClaims();
        }
      }
    })
    .catch(() => {
      ElMessage.info('已取消债权申报登记');
    });
};

const handleRejectClaim = async (row: any) => {
  ElMessageBox.confirm('确定要驳回这条债权申报吗？', '驳回确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const result = await ClaimService.updateClaimStatus(row.id, 'REJECTED');
      if (result.success) {
        await fetchClaims();
      }
    })
    .catch(() => {
      ElMessage.info('已取消驳回操作');
    });
};

const handleDeleteClaim = async (row: any) => {
  const result = await ClaimService.deleteClaim(row.id);
  if (result.success) {
    await fetchClaims();
  }
};

const handleEditClaim = async (row: any) => {
  try {
    const result = await ClaimService.getClaimDetail(row.id);
    if (result.success) {
      currentEditClaim.value = result.data;
      // 填充表单数据
      claimForm.caseNumber = result.data.caseNumber || '';
      claimForm.debtor = result.data.debtor || '';
      claimForm.creditorName = result.data.creditorName || '';
      claimForm.creditorType = result.data.creditorType || '';
      claimForm.creditCode = result.data.creditCode || '';
      claimForm.legalRepresentative = result.data.legalRepresentative || '';
      claimForm.serviceAddress = result.data.serviceAddress || '';
      claimForm.agentName = result.data.agentName || '';
      claimForm.agentPhone = result.data.agentPhone || '';
      claimForm.agentIdCard = result.data.agentIdCard || '';
      claimForm.agentAddress = result.data.agentAddress || '';
      claimForm.accountName = result.data.accountName || '';
      claimForm.bankAccount = result.data.creditorBankAccount || '';
      claimForm.bankName = result.data.bankName || '';
      claimForm.principal = result.data.principal?.toString() || '';
      claimForm.interest = result.data.interest?.toString() || '';
      claimForm.penalty = result.data.penalty?.toString() || '';
      claimForm.otherLosses = result.data.otherLosses?.toString() || '';
      claimForm.claimNature = result.data.claimNature || '';
      claimForm.claimType = result.data.claimType || '';
      claimForm.hasCourtJudgment = result.data.hasCourtJudgment === 1;
      claimForm.courtJudgmentNo = result.data.courtJudgmentNo || '';
      claimForm.judgmentDate = result.data.judgmentDate || '';
      claimForm.judgmentAmount = result.data.judgmentAmount?.toString() || '';
      claimForm.claimFacts = result.data.claimFacts || '';
      claimForm.claimIdentifier = result.data.claimIdentifier || '';
      claimForm.remarks = result.data.remarks || '';
      
      // 打开修改对话框
      showEditDialog.value = true;
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const handleSaveEdit = async () => {
  if (!currentEditClaim.value) {
    ElMessage.warning('请先选择债权');
    return;
  }

  // 验证表单数据
  if (!claimForm.creditorName) {
    ElMessage.warning('请输入债权人姓名或名称');
    return;
  }
  if (!claimForm.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }
  if (!claimForm.claimType) {
    ElMessage.warning('请选择债权种类');
    return;
  }

  const calculatedTotalAmount = Number.parseFloat(totalAmount.value) || 0;
  if (calculatedTotalAmount === 0) {
    ElMessage.warning('申报总金额不能为0，请输入有效的金额信息');
    return;
  }

  editLoading.value = true;
  try {
    const requestData = {
      caseId: Number(props.caseId),
      caseNumber: claimForm.caseNumber || undefined,
      debtor: claimForm.debtor || undefined,
      creditorName: claimForm.creditorName,
      creditorType: claimForm.creditorType,
      creditCode: claimForm.creditCode || undefined,
      legalRepresentative: claimForm.legalRepresentative || undefined,
      serviceAddress: claimForm.serviceAddress || undefined,
      agentName: claimForm.agentName || undefined,
      agentPhone: claimForm.agentPhone || undefined,
      agentIdCard: claimForm.agentIdCard || undefined,
      agentAddress: claimForm.agentAddress || undefined,
      accountName: claimForm.accountName || undefined,
      creditorBankAccount: claimForm.bankAccount || undefined,
      bankName: claimForm.bankName || undefined,
      principal: Number.parseFloat(claimForm.principal) || 0,
      interest: Number.parseFloat(claimForm.interest) || 0,
      penalty: Number.parseFloat(claimForm.penalty) || 0,
      otherLosses: Number.parseFloat(claimForm.otherLosses) || 0,
      totalAmount: Number.parseFloat(totalAmount.value) || 0,
      hasCourtJudgment: claimForm.hasCourtJudgment ? 1 : 0,
      courtJudgmentNo: claimForm.courtJudgmentNo || undefined,
      judgmentDate: claimForm.judgmentDate || undefined,
      judgmentAmount: Number.parseFloat(claimForm.judgmentAmount) || undefined,
      claimNature: claimForm.claimNature || undefined,
      claimType: claimForm.claimType,
      claimFacts: claimForm.claimFacts || undefined,
      claimIdentifier: claimForm.claimIdentifier || undefined,
      remarks: claimForm.remarks || undefined,
    };

    const result = await ClaimService.updateClaim(currentEditClaim.value.id, requestData);
    if (result.success) {
      await fetchClaims();
      closeEditDialog();
    }
  } catch (error) {
    console.error('修改债权失败:', error);
    ElMessage.error('修改债权失败');
  } finally {
    editLoading.value = false;
  }
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  currentEditClaim.value = null;
  resetClaimForm();
};

const handleCreditorChange = (value: string) => {
  const selectedCreditor = creditorList.value.find(
    (creditor) => creditor.label === value,
  );
  if (selectedCreditor) {
    claimForm.creditorType = selectedCreditor.creditorType;
  }
};

const openAddDialog = async () => {
  showAddDialog.value = true;
  await fetchDebtorList();
  await fetchCreditorList();
  try {
    const caseResponse = await getCaseReviewStatusApi(Number(props.caseId));
    if (caseResponse.code === 200 && caseResponse.data?.caseNumber) {
      claimForm.caseNumber = caseResponse.data.caseNumber;
    }
  } catch (error) {
    console.error('获取案件详情失败:', error);
  }
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  resetClaimForm();
  fileList.value = [];
  selectedFile.value = null;
};

const handleAddClaim = async () => {
  if (!claimForm.creditorName) {
    ElMessage.warning('请输入债权人姓名或名称');
    return;
  }
  if (!claimForm.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }
  if (!claimForm.claimType) {
    ElMessage.warning('请选择债权种类');
    return;
  }

  const calculatedTotalAmount = Number.parseFloat(totalAmount.value) || 0;
  if (calculatedTotalAmount === 0) {
    ElMessage.warning('申报总金额不能为0，请输入有效的金额信息');
    return;
  }

  addLoading.value = true;
  const requestData = {
    caseId: Number(props.caseId),
    caseNumber: claimForm.caseNumber || undefined,
    debtor: claimForm.debtor || undefined,
    creditorName: claimForm.creditorName,
    creditorType: claimForm.creditorType,
    creditCode: claimForm.creditCode || undefined,
    legalRepresentative: claimForm.legalRepresentative || undefined,
    serviceAddress: claimForm.serviceAddress || undefined,
    agentName: claimForm.agentName || undefined,
    agentPhone: claimForm.agentPhone || undefined,
    agentIdCard: claimForm.agentIdCard || undefined,
    agentAddress: claimForm.agentAddress || undefined,
    accountName: claimForm.accountName || undefined,
    creditorBankAccount: claimForm.bankAccount || undefined,
    bankName: claimForm.bankName || undefined,
    principal: Number.parseFloat(claimForm.principal) || 0,
    interest: Number.parseFloat(claimForm.interest) || 0,
    penalty: Number.parseFloat(claimForm.penalty) || 0,
    otherLosses: Number.parseFloat(claimForm.otherLosses) || 0,
    totalAmount: Number.parseFloat(totalAmount.value) || 0,
    hasCourtJudgment: claimForm.hasCourtJudgment ? 1 : 0,
    courtJudgmentNo: claimForm.courtJudgmentNo || undefined,
    judgmentDate: claimForm.judgmentDate || undefined,
    judgmentAmount: Number.parseFloat(claimForm.judgmentAmount) || undefined,
    claimNature: claimForm.claimNature || undefined,
    claimType: claimForm.claimType,
    claimFacts: claimForm.claimFacts || undefined,
    claimIdentifier: claimForm.claimIdentifier || undefined,
    evidenceList: claimForm.evidenceList || undefined,
    evidenceMaterials: claimForm.evidenceMaterials || undefined,
    evidenceAttachments:
      claimForm.evidenceAttachments && claimForm.evidenceAttachments.length > 0
        ? claimForm.evidenceAttachments
        : null,
    registrationDate: claimForm.registrationDate || null,
    registrationDeadline: claimForm.registrationDeadline || null,
    materialReceiver: claimForm.materialReceiver || undefined,
    materialReceiveDate: claimForm.materialReceiveDate || null,
    materialCompleteness: claimForm.materialCompleteness,
    remarks: claimForm.remarks || undefined,
  };

  const result = await ClaimService.createClaim(requestData);
  if (result.success) {
    await fetchClaims();
    closeAddDialog();
  }
  addLoading.value = false;
};

const getRegistrationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待登记' },
    REGISTERED: { type: 'success', text: '已登记' },
    REJECTED: { type: 'danger', text: '已驳回' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

const getMaterialCompletenessTag = (completeness: string) => {
  const statusMap: Record<string, any> = {
    COMPLETE: { type: 'success', text: '完整' },
    INCOMPLETE: { type: 'warning', text: '不完整' },
    PENDING: { type: 'info', text: '待补充' },
  };
  return statusMap[completeness] || { type: 'info', text: completeness };
};

// Excel导入相关变量
const currentImportFile = ref<any>(null);

// Excel导入相关方法
const handleImportFileChange = (file: any, fileList: any[]) => {
  if (fileList.length > 1) {
    fileList.shift();
  }
  // 存储当前选择的文件
  currentImportFile.value = fileList[0];
};

const handleImportFileRemove = (file: any, fileList: any[]) => { currentImportFile.value = null; };

const handleImportSubmit = async () => {
  const file = currentImportFile.value;
  if (!file) {
    ElMessage.warning('请选择Excel文件');
    return;
  }

  importLoading.value = true;
  const formData = new FormData();
  formData.append('file', file.raw);
  formData.append('caseId', props.caseId);

  const result = await ClaimService.importClaims(formData);
  if (result.success) {
    importResult.value = result.data;
    if (result.data.failCount > 0) {
      showImportErrorDialog.value = true;
    }
    await fetchClaims();
    showImportDialog.value = false;
  }
  importLoading.value = false;
};

const openImportDialog = () => {
  showImportDialog.value = true;
};

// 文件选择处理（支持原生input和Element Plus Upload）
const handleFileChange = (event: any) => {
  let file: File | null = null;
  
  // 判断是原生input事件还是Element Plus Upload事件
  if (event.target && event.target.files) {
    // 原生input事件
    file = event.target.files[0];
  } else if (event.raw) {
    // Element Plus Upload事件
    file = event.raw;
  } else if (event.name) {
    // Element Plus Upload事件（另一种格式）
    file = event;
  }
  
  if (!file) {
    selectedFile.value = null;
    return;
  }
  
  // 检查文件选择
  console.log('选择的文件:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  });
  
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
    ElMessage.error('请选择Excel文件（.xls或.xlsx格式）');
    selectedFile.value = null;
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    ElMessage.error('文件大小不能超过10MB');
    selectedFile.value = null;
    return;
  }
  
  selectedFile.value = file;
};

// 导入Excel并自动填充
const handleImportExcel = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择Excel文件');
    return;
  }
  
  importing.value = true;
  
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('sheetIndex', '0'); // 默认解析第一个Sheet
    
    // 检查FormData内容
    console.log('FormData内容:');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0] + ': File(' + pair[1].name + ')');
      } else {
        console.log(pair[0] + ': ' + pair[1]);
      }
    }
    
    console.log('发送请求到: /api/v1/claim-registration/parse-excel');
    
    const response = await parseExcelApi(formData);
    
    console.log('响应状态:', response.code);
    console.log('响应数据:', response);
    
    if (response.code === 200) {
      // 自动填充表单
      fillForm(response.data);
      
      // 高亮填充的字段
      highlightFilledFields(response.data);
      
      ElMessage.success('导入成功，已自动填充匹配字段');
    } else {
      ElMessage.error('导入失败：' + response.message);
    }
  } catch (error: any) {
    console.error('导入Excel失败', error);
    ElMessage.error('导入失败：' + (error.message || '网络错误'));
  } finally {
    importing.value = false;
  }
};

// 填充表单
const fillForm = (data: any) => {
  // 字段映射：API返回字段 -> 表单字段
  const fieldMapping: Record<string, string> = {
    receiptNumber: 'caseNumber',
    creditorName: 'creditorName',
    declarationTime: 'registrationDate',
    addressAndPostalCode: 'serviceAddress',
    contactPhone: 'agentPhone',
    declaredAmount: 'principal',
    nature: 'claimNature',
    legalRepresentative: 'legalRepresentative',
    agentName: 'agentName',
    agentPhone: 'agentPhone',
    claimNature: 'claimNature',
    claimType: 'claimType',
    accountName: 'accountName',
    bankName: 'bankName',
    bankAccount: 'bankAccount',
    litigationStatus: 'claimFacts',
    remarks: 'remarks',
    principal: 'principal',
    interest: 'interest',
    penalty: 'penalty',
    otherLosses: 'otherLosses',
    totalAmount: 'totalAmount',
  };
  
  console.log('开始填充表单，API返回数据:', data);
  const filledFields: any[] = [];
  
  // 遍历返回的字段，填充对应表单
  Object.keys(data).forEach(key => {
    if (!data[key]) return;
    
    const formField = fieldMapping[key] || key;
    
    // 特殊处理金额字段
    if (['principal', 'interest', 'penalty', 'otherLosses', 'totalAmount'].includes(formField)) {
      const amountStr = String(data[key]).replace(/,/g, '');
      const formattedAmount = parseFloat(amountStr).toString();
      (claimForm as any)[formField] = formattedAmount;
      filledFields.push({ apiField: key, formField, originalValue: data[key], formattedValue: formattedAmount });
    } 
    // 特殊处理日期字段
    else if (formField === 'registrationDate' && data[key]) {
      const dateStr = data[key];
      let formattedDate: string;
      if (dateStr.includes('/')) {
        const [year, month, day] = dateStr.split('/');
        formattedDate = `${year}-${month}-${day}`;
      } else if (dateStr.includes('-')) {
        formattedDate = dateStr;
      } else {
        formattedDate = dateStr;
      }
      (claimForm as any)[formField] = formattedDate;
      filledFields.push({ apiField: key, formField, originalValue: data[key], formattedValue: formattedDate });
    }
    // 其他字段直接赋值
    else {
      (claimForm as any)[formField] = data[key];
      filledFields.push({ apiField: key, formField, originalValue: data[key], formattedValue: data[key] });
    }
  });
  
  console.log('表单填充完成，填充的字段:', filledFields);
  console.log('填充后表单数据:', claimForm);
};

// 高亮填充的字段
const highlightFilledFields = (data: any) => {
  const filledFields = Object.keys(data);
  
  console.log('开始高亮填充的字段:', filledFields);
  
  // 字段映射：API返回字段 -> 表单字段
  const fieldMapping: Record<string, string> = {
    receiptNumber: 'caseNumber',
    creditorName: 'creditorName',
    declarationTime: 'registrationDate',
    addressAndPostalCode: 'serviceAddress',
    contactPhone: 'agentPhone',
    declaredAmount: 'principal',
    nature: 'claimNature',
    legalRepresentative: 'legalRepresentative',
    agentName: 'agentName',
    agentPhone: 'agentPhone',
    claimNature: 'claimNature',
    claimType: 'claimType',
    accountName: 'accountName',
    bankName: 'bankName',
    bankAccount: 'bankAccount',
    litigationStatus: 'claimFacts',
    remarks: 'remarks',
    principal: 'principal',
    interest: 'interest',
    penalty: 'penalty',
    otherLosses: 'otherLosses',
    totalAmount: 'totalAmount',
  };
  
  // 高亮填充的字段
  filledFields.forEach(apiField => {
    const formField = fieldMapping[apiField] || apiField;
    console.log(`高亮字段: API字段=${apiField}, 表单字段=${formField}`);
    
    // 尝试通过不同方式查找元素
    const selectors = [
      `[name="${formField}"]`,
      `[prop="${formField}"]`,
      `[v-model="claimForm.${formField}"]`,
      `input[placeholder*="${formField}"]`,
      `.el-form-item__label:contains("${getFieldLabel(formField)}") + .el-form-item__content input`
    ];
    
    let elementFound = false;
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        element.classList.add('field-filled');
        console.log(`找到并高亮元素: ${selector}`);
        elementFound = true;
        break;
      }
    }
    
    if (!elementFound) {
      console.log(`未找到字段对应的元素: ${formField}`);
    }
  });
};

// 获取字段标签
const getFieldLabel = (field: string) => {
  const labelMapping: Record<string, string> = {
    caseNumber: '案件编号',
    creditorName: '债权人姓名或名称',
    registrationDate: '申报时间',
    serviceAddress: '送达地址',
    agentPhone: '代理人电话',
    principal: '本金',
    legalRepresentative: '法定代表人',
    agentName: '代理人姓名',
    claimNature: '债权性质',
    claimType: '债权种类',
    accountName: '账户名称',
    bankName: '开户银行',
    bankAccount: '银行账号',
    claimFacts: '债权事实',
    remarks: '备注',
    interest: '利息',
    penalty: '违约金',
    otherLosses: '其他损失',
    totalAmount: '申报总金额'
  };
  return labelMapping[field] || field;
};

defineExpose({
  hasRegisteredClaims,
  openAddDialog,
  openImportDialog,
});

onMounted(() => {
  fetchClaims();
});
</script>

<template>
  <div class="claim-registration-page">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-text" class="text-primary mr-2" />
            <span class="text-lg font-semibold">债权申报登记</span>
          </div>
          <div class="flex space-x-2">
            <ElSelect v-model="statusFilter" placeholder="选择状态" style="width: 200px" @change="fetchClaims">
              <ElOption label="待处理" value="PENDING" />
              <ElOption label="审查中" value="REVIEWING" />
              <ElOption label="审查完成" value="REVIEW_COMPLETED" />
              <ElOption label="确认中" value="CONFIRMING" />
              <ElOption label="确认完成" value="CONFIRMED" />
              <ElOption label="已登记" value="REGISTERED" />
              <ElOption label="已驳回" value="REJECTED" />
            </ElSelect>
            <ElButton type="primary" @click="openAddDialog">
              <Icon icon="lucide:plus" class="mr-1" />
              新增债权
            </ElButton>
            <ElButton type="success" @click="openImportDialog">
              <Icon icon="lucide:file-spreadsheet" class="mr-1" />
              Excel导入
            </ElButton>
            <ElButton type="primary" @click="fetchClaims">
              <Icon icon="lucide:refresh-cw" class="mr-1" />
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <ElAlert title="说明" type="info" :closable="false" class="mb-4">
        <div>
          <p>本页面展示所有债权申报记录。</p>
          <p>点击"查看详情"可查看债权详细信息。</p>
          <p>点击"接收材料"可记录材料接收情况。</p>
          <p>点击"登记"可将债权状态更新为"已登记"。</p>
          <p>点击"修改"可修改未进入审查的债权申报数据。</p>
        </div>
      </ElAlert>

      <div v-loading="loading" class="claim-list-container">
        <ElTable :data="claims" border stripe style="width: 100%" class="mb-4">
          <ElTableColumn
            label="登记状态"
            width="150"
          >
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ElTag
                  :type="{
                    'PENDING': 'warning',
                    'REVIEWING': 'primary',
                    'REVIEW_COMPLETED': 'success',
                    'CONFIRMING': 'info',
                    'CONFIRMED': 'success',
                    'REGISTERED': 'success',
                    'REJECTED': 'danger',
                    'pending': 'warning',
                    'reviewing': 'primary',
                    'review_completed': 'success',
                    'confirming': 'info',
                    'confirmed': 'success',
                    'registered': 'success',
                    'rejected': 'danger'
                  }[scope.row?.registration_status] || 'info'"
                  size="small"
                >
                  {{ 
                    {
                      'PENDING': '待处理',
                      'REVIEWING': '审查中',
                      'REVIEW_COMPLETED': '审查完成',
                      'CONFIRMING': '确认中',
                      'CONFIRMED': '确认完成',
                      'REGISTERED': '已登记',
                      'REJECTED': '已驳回',
                      'pending': '待处理',
                      'reviewing': '审查中',
                      'review_completed': '审查完成',
                      'confirming': '确认中',
                      'confirmed': '确认完成',
                      'registered': '已登记',
                      'rejected': '已驳回'
                    }[scope.row?.registration_status] || '未知'
                  }}
                </ElTag>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="material_completeness"
            label="材料完整性"
            width="100"
          >
            <template #default="scope">
              <ElTag
                :type="
                  getMaterialCompletenessTag(scope.row.material_completeness)
                    .type
                "
                size="small"
              >
                {{
                  getMaterialCompletenessTag(scope.row.material_completeness)
                    .text
                }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="creditor_name"
            label="债权人姓名或名称"
            min-width="180"
          />
          <ElTableColumn prop="creditor_type" label="债权人类型" width="120" />
          <ElTableColumn
            prop="credit_code"
            label="统一社会信用代码"
            width="180"
          />
          <ElTableColumn prop="principal" label="申报本金" width="120" />
          <ElTableColumn prop="interest" label="申报利息" width="120" />
          <ElTableColumn prop="total_amount" label="申报总金额" width="120" />
          <ElTableColumn prop="claim_nature" label="债权性质" width="120" />
          <ElTableColumn prop="claim_type" label="债权种类" width="120" />
          <ElTableColumn label="操作" width="450" fixed="right">
            <template #default="scope">
              <ElButton link size="small" @click="openDetailDialog(scope.row)">
                查看详情
              </ElButton>
              <ElButton
                v-if="scope.row.registration_status === 'PENDING'"
                link
                size="small"
                @click="handleRegisterClaim(scope.row)"
              >
                登记
              </ElButton>
              <ElButton
                v-if="scope.row.registration_status === 'PENDING'"
                link
                size="small"
                type="primary"
                @click="handleEditClaim(scope.row)"
              >
                修改
              </ElButton>
              <ElButton
                v-if="scope.row.registration_status === 'PENDING'"
                link
                size="small"
                type="danger"
                @click="handleRejectClaim(scope.row)"
              >
                驳回
              </ElButton>
              <ElPopconfirm
                title="确定要删除这条债权登记吗？"
                @confirm="handleDeleteClaim(scope.row)"
              >
                <template #reference>
                  <ElButton link size="small"> 删除 </ElButton>
                </template>
              </ElPopconfirm>
            </template>
          </ElTableColumn>
        </ElTable>

        <div v-if="total > 0" class="pagination-container flex justify-end">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>

        <div v-if="claims.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无债权申报信息" />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="showDetailDialog"
      title="债权申报详情"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="detail-dialog-container">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="债权编号">
            {{ currentClaim.claimNo }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="案件名称">
            {{ currentClaim.caseName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债务人">
            {{ currentClaim.debtor }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权人">
            {{ currentClaim.creditorName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权人类型">
            {{ currentClaim.creditorType }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="统一社会信用代码">
            {{ currentClaim.creditCode }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报本金">
            {{ currentClaim.principal }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报利息">
            {{ currentClaim.interest }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报罚金">
            {{ currentClaim.penalty }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报其他损失">
            {{ currentClaim.otherLosses }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权类型">
            {{ currentClaim.claimType }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权性质">
            {{ currentClaim.claimNature || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权标识">
            {{ currentClaim.claimIdentifier || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权事实" :span="2">
            {{ currentClaim.claimFacts || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有法院判决">
            <ElTag :type="currentClaim.hasCourtJudgment ? 'success' : 'info'">
              {{ currentClaim.hasCourtJudgment ? '是' : '否' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记状态">
            <ElTag
              :type="
                getRegistrationStatusTag(currentClaim.registrationStatus).type
              "
            >
              {{
                getRegistrationStatusTag(currentClaim.registrationStatus).text
              }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记日期">
            {{ currentClaim.registrationDate }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记截止日期">
            {{ currentClaim.registrationDeadline || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="材料接收人">
            {{ currentClaim.materialReceiver }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="材料接收日期">
            {{ currentClaim.materialReceiveDate }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="材料完整性">
            <ElTag
              :type="
                currentClaim.materialCompleteness === 'COMPLETE'
                  ? 'success'
                  : 'warning'
              "
            >
              {{
                currentClaim.materialCompleteness === 'COMPLETE'
                  ? '完整'
                  : currentClaim.materialCompleteness === 'INCOMPLETE'
                    ? '不完整'
                    : '待补充'
              }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-divider mb-4 mt-4">
          <h4 class="section-title">代理人信息</h4>
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="代理人姓名">
            {{ currentClaim.agentName || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="代理人电话">
            {{ currentClaim.agentPhone || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="代理人身份证">
            {{ currentClaim.agentIdCard || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="代理人地址">
            {{ currentClaim.agentAddress || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-divider mb-4 mt-4">
          <h4 class="section-title">银行账户信息</h4>
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="账户名称">
            {{ currentClaim.accountName || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="银行账户">
            {{ currentClaim.creditorBankAccount || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="开户银行">
            {{ currentClaim.bankName || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-divider mb-4 mt-4">
          <h4 class="section-title">其他信息</h4>
        </div>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="创建时间">
            {{ currentClaim.createTime }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">
            {{ currentClaim.updateTime }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="备注">
            {{ currentClaim.remarks || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showDetailDialog = false">关闭</ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showMaterialDialog"
      title="接收申报材料"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentClaim" class="material-dialog-container">
        <ElDescriptions :column="1" border class="mb-4">
          <ElDescriptionsItem label="债权人">
            {{ currentClaim.creditorName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
        </ElDescriptions>
        <ElForm label-width="120px">
          <ElFormItem label="接收人" required>
            <ElInput
              v-model="materialForm.receiver"
              placeholder="请输入接收人姓名"
            />
          </ElFormItem>
          <ElFormItem label="材料完整性" required>
            <ElSelect
              v-model="materialForm.completeness"
              placeholder="请选择材料完整性"
              style="width: 100%"
            >
              <ElOption label="完整" value="COMPLETE" />
              <ElOption label="不完整" value="INCOMPLETE" />
              <ElOption label="待补充" value="PENDING" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeMaterialDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleReceiveMaterial"
            :loading="materialLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showImportDialog"
      title="Excel导入债权登记"
      width="600px"
      destroy-on-close
    >
      <div class="import-dialog-container">
        <ElAlert title="导入说明" type="info" :closable="false" class="mb-4">
          <div>
            <p>请上传符合格式要求的Excel文件。</p>
            <p>Excel文件需包含以下必填列：债权人名称、债权人类型、债权类型、总金额。</p>
            <p>支持的文件格式：.xlsx 或 .xls</p>
            <p>文件大小限制：不超过10MB</p>
          </div>
        </ElAlert>

        <ElUpload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleImportFileChange"
          accept=".xls,.xlsx"
          :limit="1">
          <ElButton type="primary" icon="el-icon-upload">选择Excel文件</ElButton>
        </ElUpload>

        <ElAlert 
          v-if="selectedFile" 
          :message="`已选择文件: ${selectedFile.name}`" 
          type="success" 
          :closable="false" 
          class="mt-2" 
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showImportDialog = false">关闭</ElButton>
          <ElButton 
            type="success" 
            icon="el-icon-magic-stick" 
            @click="handleImportExcel"
            :loading="importing"
            :disabled="!selectedFile"
            class="ml-2">
            导入并自动填充
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showImportErrorDialog"
      title="导入错误详情"
      width="80%"
      destroy-on-close
    >
      <div v-if="importResult && importResult.errors" class="import-error-container">
        <ElTable :data="importResult.errors" border style="width: 100%">
          <ElTableColumn prop="row" label="行号" width="80" />
          <ElTableColumn prop="creditorName" label="债权人名称" width="150" />
          <ElTableColumn prop="message" label="错误信息" />
        </ElTable>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showImportErrorDialog = false">关闭</ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 修改债权对话框 -->
    <ElDialog
      v-model="showEditDialog"
      title="修改债权申报"
      width="800px"
      destroy-on-close
    >
      <div class="add-claim-dialog">
        <ElForm label-width="120px" :model="claimForm">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="案件编号">
                <ElInput
                  v-model="claimForm.caseNumber"
                  placeholder="请输入案件编号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债务人">
                <ElSelect
                  v-model="claimForm.debtor"
                  placeholder="请选择债务人"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="debtor in debtorList"
                    :key="debtor.value"
                    :label="debtor.label"
                    :value="debtor.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人姓名或名称" required>
                <ElInput
                  v-model="claimForm.creditorName"
                  placeholder="请输入债权人姓名或名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权人类型" required>
                <ElSelect
                  v-model="claimForm.creditorType"
                  placeholder="请选择债权人类型"
                  style="width: 100%"
                >
                  <ElOption label="自然人" value="自然人" />
                  <ElOption label="法人" value="法人" />
                  <ElOption label="其他组织" value="其他组织" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="统一社会信用代码">
                <ElInput
                  v-model="claimForm.creditCode"
                  placeholder="请输入统一社会信用代码"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="法定代表人">
                <ElInput
                  v-model="claimForm.legalRepresentative"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="送达地址">
                <ElInput
                  v-model="claimForm.serviceAddress"
                  placeholder="请输入送达地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">代理人信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人姓名">
                <ElInput
                  v-model="claimForm.agentName"
                  placeholder="请输入代理人姓名"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人电话">
                <ElInput
                  v-model="claimForm.agentPhone"
                  placeholder="请输入代理人电话"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人身份证号">
                <ElInput
                  v-model="claimForm.agentIdCard"
                  placeholder="请输入代理人身份证号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人地址">
                <ElInput
                  v-model="claimForm.agentAddress"
                  placeholder="请输入代理人地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">银行账户信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账户名称">
                <ElInput
                  v-model="claimForm.accountName"
                  placeholder="请输入账户名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="银行账号">
                <ElInput
                  v-model="claimForm.bankAccount"
                  placeholder="请输入银行账号"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="开户银行">
                <ElInput
                  v-model="claimForm.bankName"
                  placeholder="请输入开户银行"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="6">
              <ElFormItem label="本金">
                <ElInput
                  v-model="claimForm.principal"
                  type="number"
                  placeholder="请输入本金"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="利息">
                <ElInput
                  v-model="claimForm.interest"
                  type="number"
                  placeholder="请输入利息"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="违约金">
                <ElInput
                  v-model="claimForm.penalty"
                  type="number"
                  placeholder="请输入违约金"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="其他损失">
                <ElInput
                  v-model="claimForm.otherLosses"
                  type="number"
                  placeholder="请输入其他损失"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报总金额">
                <ElInput
                  :model-value="totalAmount"
                  placeholder="自动计算"
                  disabled
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权性质">
                <ElInput
                  v-model="claimForm.claimNature"
                  placeholder="请输入债权性质"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权种类" required>
                <ElSelect
                  v-model="claimForm.claimType"
                  placeholder="请选择债权种类"
                  style="width: 100%"
                >
                  <ElOption label="普通债权" value="普通债权" />
                  <ElOption label="担保债权" value="担保债权" />
                  <ElOption label="优先债权" value="优先债权" />
                  <ElOption label="其他债权" value="其他债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="债权事实">
                <ElInput
                  v-model="claimForm.claimFacts"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入债权事实"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权标识">
                <ElInput
                  v-model="claimForm.claimIdentifier"
                  placeholder="请输入债权标识"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="是否有判决书">
                <ElCheckbox v-model="claimForm.hasCourtJudgment">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow v-if="claimForm.hasCourtJudgment" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="判决书编号">
                <ElInput
                  v-model="claimForm.courtJudgmentNo"
                  placeholder="请输入判决书编号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="判决日期">
                <ElInput
                  v-model="claimForm.judgmentDate"
                  type="datetime-local"
                  placeholder="请选择判决日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow v-if="claimForm.hasCourtJudgment" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="判决金额">
                <ElInput
                  v-model="claimForm.judgmentAmount"
                  type="number"
                  placeholder="请输入判决金额"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput
                  v-model="claimForm.remarks"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeEditDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleSaveEdit"
            :loading="editLoading"
          >
            保存修改
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 新增债权对话框 -->
    <ElDialog
      v-model="showAddDialog"
      title="新增债权申报"
      width="800px"
      destroy-on-close
    >
      <div class="add-claim-dialog">
        <div class="excel-upload-section mb-4">
          <ElAlert title="文件导入" type="info" :closable="false" class="mb-2">
            <p>上传Excel文件可自动填充表单字段</p>
          </ElAlert>
          <div class="flex items-center gap-2">
            <input
              ref="uploadRef"
              type="file"
              accept=".xls,.xlsx"
              @change="handleFileChange"
              style="display: none"
            />
            <ElButton @click="uploadRef?.click()">
              <Icon icon="lucide:upload" class="mr-1" />
              选择Excel文件
            </ElButton>
            <ElButton
              type="success"
              @click="handleImportExcel"
              :loading="importing"
              :disabled="!selectedFile"
            >
              <Icon icon="lucide:magic-wand" class="mr-1" />
              导入并自动填充
            </ElButton>
            <span v-if="selectedFile" class="text-sm text-gray-600">
              已选择: {{ selectedFile.name }}
            </span>
          </div>
        </div>

        <ElForm label-width="120px" :model="claimForm">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="案件编号">
                <ElInput
                  v-model="claimForm.caseNumber"
                  placeholder="请输入案件编号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债务人">
                <ElSelect
                  v-model="claimForm.debtor"
                  placeholder="请选择债务人"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="debtor in debtorList"
                    :key="debtor.value"
                    :label="debtor.label"
                    :value="debtor.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人姓名或名称" required>
                <ElInput
                  v-model="claimForm.creditorName"
                  placeholder="请输入债权人姓名或名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权人类型" required>
                <ElSelect
                  v-model="claimForm.creditorType"
                  placeholder="请选择债权人类型"
                  style="width: 100%"
                >
                  <ElOption label="自然人" value="自然人" />
                  <ElOption label="法人" value="法人" />
                  <ElOption label="其他组织" value="其他组织" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="统一社会信用代码">
                <ElInput
                  v-model="claimForm.creditCode"
                  placeholder="请输入统一社会信用代码"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="法定代表人">
                <ElInput
                  v-model="claimForm.legalRepresentative"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="送达地址">
                <ElInput
                  v-model="claimForm.serviceAddress"
                  placeholder="请输入送达地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">代理人信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人姓名">
                <ElInput
                  v-model="claimForm.agentName"
                  placeholder="请输入代理人姓名"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人电话">
                <ElInput
                  v-model="claimForm.agentPhone"
                  placeholder="请输入代理人电话"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人身份证号">
                <ElInput
                  v-model="claimForm.agentIdCard"
                  placeholder="请输入代理人身份证号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人地址">
                <ElInput
                  v-model="claimForm.agentAddress"
                  placeholder="请输入代理人地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">银行账户信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账户名称">
                <ElInput
                  v-model="claimForm.accountName"
                  placeholder="请输入账户名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="银行账号">
                <ElInput
                  v-model="claimForm.bankAccount"
                  placeholder="请输入银行账号"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="开户银行">
                <ElInput
                  v-model="claimForm.bankName"
                  placeholder="请输入开户银行"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="6">
              <ElFormItem label="本金">
                <ElInput
                  v-model="claimForm.principal"
                  type="number"
                  placeholder="请输入本金"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="利息">
                <ElInput
                  v-model="claimForm.interest"
                  type="number"
                  placeholder="请输入利息"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="违约金">
                <ElInput
                  v-model="claimForm.penalty"
                  type="number"
                  placeholder="请输入违约金"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="其他损失">
                <ElInput
                  v-model="claimForm.otherLosses"
                  type="number"
                  placeholder="请输入其他损失"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报总金额">
                <ElInput
                  :model-value="totalAmount"
                  placeholder="自动计算"
                  disabled
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权性质">
                <ElInput
                  v-model="claimForm.claimNature"
                  placeholder="请输入债权性质"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权种类" required>
                <ElSelect
                  v-model="claimForm.claimType"
                  placeholder="请选择债权种类"
                  style="width: 100%"
                >
                  <ElOption label="普通债权" value="普通债权" />
                  <ElOption label="担保债权" value="担保债权" />
                  <ElOption label="优先债权" value="优先债权" />
                  <ElOption label="其他债权" value="其他债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="债权事实">
                <ElInput
                  v-model="claimForm.claimFacts"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入债权事实"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权标识">
                <ElInput
                  v-model="claimForm.claimIdentifier"
                  placeholder="请输入债权标识"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="是否有判决书">
                <ElCheckbox v-model="claimForm.hasCourtJudgment">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow v-if="claimForm.hasCourtJudgment" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="判决书编号">
                <ElInput
                  v-model="claimForm.courtJudgmentNo"
                  placeholder="请输入判决书编号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="判决日期">
                <ElInput
                  v-model="claimForm.judgmentDate"
                  type="datetime-local"
                  placeholder="请选择判决日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow v-if="claimForm.hasCourtJudgment" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="判决金额">
                <ElInput
                  v-model="claimForm.judgmentAmount"
                  type="number"
                  placeholder="请输入判决金额"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput
                  v-model="claimForm.remarks"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeAddDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleAddClaim"
            :loading="addLoading"
          >
            提交
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-registration-page {
  padding: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.claim-list-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 40px 0;
}

.detail-dialog-container,
.material-dialog-container,
.add-dialog-container {
  max-height: 600px;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-divider {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  margin-bottom: 16px;
}

.excel-upload-section {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.field-filled {
  border-color: #67c23a !important;
  background-color: #f0f9eb;
}

.gap-2 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.import-dialog-container,
.import-error-container {
  max-height: 400px;
  overflow-y: auto;
}

.excel-upload-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.field-filled {
  animation: highlight 1s ease-in-out;
}

@keyframes highlight {
  0% {
    background-color: #fff3cd;
  }
  100% {
    background-color: transparent;
  }
}

.bg-light {
  background-color: #f5f7fa;
}

.ml-2 {
  margin-left: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.p-4 {
  padding: 16px;
}
</style>
