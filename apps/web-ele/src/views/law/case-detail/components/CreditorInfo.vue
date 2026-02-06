<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
  ElSelect,
  ElOption,
  ElUpload,
  ElResult,
} from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import type { UploadFile, UploadInstance } from 'element-plus';

import {
  createCreditorApi,
  deleteCreditorApi,
  getCreditorClaimStagesApi,
  getCreditorListApi,
  updateCreditorApi,
} from '#/api/core/creditor';

import { getConfirmationStatusTag } from './utils/claimStatusMapper';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const creditors = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);



// 单个新增对话框
const showSingleAddDialog = ref(false);
const singleAddLoading = ref(false);
const singleForm = reactive({
  creditorName: '',
  creditorType: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  idNumber: '',
  legalRepresentative: '',
  registeredCapital: '',
  status: '',
});

// 编辑对话框
const showEditDialog = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  creditorId: 0,
  creditorName: '',
  creditorType: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  idNumber: '',
  legalRepresentative: '',
  registeredCapital: '',
  status: '',
});

// 债权人详情对话框
const showCreditorDetailDialog = ref(false);
const creditorDetailLoading = ref(false);
const creditorDetailData = ref<any>(null);
const activeTab = ref('registration');
const tabRef = ref<HTMLElement | null>(null);
const dialogRef = ref<HTMLElement | null>(null);
const isTabFixed = ref(false);
const tabOffsetTop = ref(0);

// 监听滚动事件
const handleScroll = () => {
  if (!tabRef.value || !dialogRef.value) return;
  
  // 获取对话框内容容器的滚动元素
  const contentContainer = dialogRef.value.querySelector('.creditor-detail-container');
  if (!contentContainer || typeof contentContainer.scrollTop === 'undefined') return;
  
  const scrollTop = contentContainer.scrollTop;
  if (scrollTop > 10) {
    isTabFixed.value = true;
  } else {
    isTabFixed.value = false;
  }
};

// 计算标签的初始位置
const calculateTabPosition = () => {
  if (!tabRef.value || !dialogRef.value) return;
  
  // 确保 tabRef.value 有 getBoundingClientRect 方法
  if (typeof tabRef.value.getBoundingClientRect !== 'function') return;
  if (typeof dialogRef.value.getBoundingClientRect !== 'function') return;
  
  const rect = tabRef.value.getBoundingClientRect();
  const dialogRect = dialogRef.value.getBoundingClientRect();
  tabOffsetTop.value = rect.top - dialogRect.top;
};

// 监听窗口大小变化
const handleResize = () => {
  if (isTabFixed.value) {
    calculateTabPosition();
  }
};

// 搜索相关数据
const searchName = ref('');
const searchStatus = ref('');

// 状态选项
const statusOptions = [
  { label: '已知债权人', value: 'KNOWN' },
  { label: '确认债权人', value: 'CONFIRMED' },
];

// 状态映射
const statusMap: Record<string, string> = {
  KNOWN: '已知债权人',
  CONFIRMED: '确认债权人',
};

// 债权人类型映射 (英文转中文)
const creditorTypeMap: Record<string, string> = {
  ENTERPRISE: '企业',
  INDIVIDUAL: '个人',
  FINANCIAL_INSTITUTION: '金融机构',
  GOVERNMENT: '政府机构',
  OTHER: '其他',
  // 保留中文值作为键，处理已有中文数据
  金融机构: '金融机构',
  企业: '企业',
  个人: '个人',
  政府机构: '政府机构',
  其他: '其他',
};

// 债权人类型选项
const creditorTypeOptions = [
  { label: '金融机构', value: '金融机构' },
  { label: '企业', value: '企业' },
  { label: '个人', value: '个人' },
  { label: '其他', value: '其他' },
];

// 转换债权人类型为中文
const convertCreditorType = (type: string): string => {
  return creditorTypeMap[type] || type;
};

// 下划线转驼峰函数
const toCamelCase = (obj: any) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  }
  const camelCaseObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replaceAll(/_([a-z])/g, (g) => g[1].toUpperCase());
      camelCaseObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelCaseObj;
};

const fetchCreditors = async () => {
  loading.value = true;
  try {
    const response = await getCreditorListApi({
      caseId: Number(props.caseId),
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      creditorName: searchName.value,
      status: searchStatus.value,
    });
    if (response.code === 200 && response.data) {
      // 转换债权人类型为中文
      creditors.value = (response.data.list || []).map((creditor: any) => ({
        ...creditor,
        creditorType: convertCreditorType(creditor.creditorType),
      }));
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(`获取债权人列表失败：${response.message || '未知错误'}`);
      creditors.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
    ElMessage.error('获取债权人列表失败');
    creditors.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1;
  fetchCreditors();
};

// 重置搜索
const handleResetSearch = () => {
  searchName.value = '';
  searchStatus.value = '';
  currentPage.value = 1;
  fetchCreditors();
};

// 显示全部债权人
const showAllCreditors = () => {
  searchStatus.value = '';
  currentPage.value = 1;
  fetchCreditors();
};

// 显示确认债权人
const showConfirmedCreditors = () => {
  searchStatus.value = 'CONFIRMED';
  currentPage.value = 1;
  fetchCreditors();
};

// 处理标签切换
const handleTabClick = (tab) => {
  if (tab.props.name === 'all') {
    searchStatus.value = '';
  } else if (tab.props.name === 'confirmed') {
    searchStatus.value = 'CONFIRMED';
  }
  currentPage.value = 1;
  fetchCreditors();
};

// 打开编辑对话框
const openEditDialog = (row: any) => {
  editForm.creditorId = row.id;
  editForm.creditorName = row.creditorName;
  editForm.creditorType = row.creditorType;
  editForm.contactPhone = row.contactPhone || '';
  editForm.contactEmail = row.contactEmail || '';
  editForm.address = row.address || '';
  editForm.idNumber = row.idNumber || '';
  editForm.legalRepresentative = row.legalRepresentative || '';
  editForm.registeredCapital = row.registeredCapital || '';
  editForm.status = row.creditorStatus || '';
  showEditDialog.value = true;
};

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false;
};

// 提交编辑表单
const handleEditSubmit = async () => {
  if (!editForm.creditorName) {
    ElMessage.warning('请输入债权人名称');
    return;
  }
  if (!editForm.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }
  if (!editForm.status) {
    ElMessage.warning('请选择状态');
    return;
  }

  editLoading.value = true;
  try {
    const response = await updateCreditorApi(editForm.creditorId, {
      creditorId: editForm.creditorId,
      creditorName: editForm.creditorName,
      creditorType: editForm.creditorType,
      contactPhone: editForm.contactPhone,
      contactEmail: editForm.contactEmail,
      address: editForm.address,
      idNumber: editForm.idNumber,
      legalRepresentative: editForm.legalRepresentative,
      registeredCapital: editForm.registeredCapital
        ? Number(editForm.registeredCapital)
        : undefined,
      creditorStatus: editForm.status,
    });
    if (response.code === 200) {
      ElMessage.success('成功更新债权人信息');
      await fetchCreditors();
      closeEditDialog();
    } else {
      ElMessage.error(`更新失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('更新债权人失败:', error);
    ElMessage.error('更新债权人失败');
  } finally {
    editLoading.value = false;
  }
};

// 删除债权人
const handleDeleteCreditor = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除债权人 "${row.creditorName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger',
      }
    );
    
    const response = await deleteCreditorApi(row.id);
    if (response.code === 200) {
      ElMessage.success('成功删除债权人');
      await fetchCreditors();
    } else {
      ElMessage.error(`删除失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除债权人失败:', error);
      ElMessage.error('删除债权人失败');
    }
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCreditors();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchCreditors();
};

// 单个新增相关函数
const openSingleAddDialog = () => {
  showSingleAddDialog.value = true;
};

const closeSingleAddDialog = () => {
  showSingleAddDialog.value = false;
  resetSingleForm();
};

const resetSingleForm = () => {
  singleForm.creditorName = '';
  singleForm.creditorType = '';
  singleForm.contactPhone = '';
  singleForm.contactEmail = '';
  singleForm.address = '';
  singleForm.idNumber = '';
  singleForm.legalRepresentative = '';
  singleForm.registeredCapital = '';
  singleForm.status = '';
};

// 单个新增债权人处理函数
const handleSingleAdd = async () => {
  // 表单验证
  if (!singleForm.creditorName) {
    ElMessage.warning('请输入债权人名称');
    return;
  }
  if (!singleForm.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }
  if (!singleForm.status) {
    ElMessage.warning('请选择状态');
    return;
  }

  singleAddLoading.value = true;
  try {
    const requestData = {
      caseId: Number(props.caseId),
      creditorName: singleForm.creditorName,
      creditorType: singleForm.creditorType,
      contactPhone: singleForm.contactPhone,
      contactEmail: singleForm.contactEmail,
      address: singleForm.address,
      idNumber: singleForm.idNumber,
      legalRepresentative: singleForm.legalRepresentative,
      registeredCapital: singleForm.registeredCapital
        ? Number(singleForm.registeredCapital)
        : undefined,
      creditorStatus: singleForm.status,
    };

    const response = await createCreditorApi(requestData);
    if (response.code === 200) {
      ElMessage.success('成功添加债权人');
      await fetchCreditors();
      closeSingleAddDialog();
    } else {
      ElMessage.error(`添加失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('添加债权人失败:', error);
    ElMessage.error('添加债权人失败');
  } finally {
    singleAddLoading.value = false;
  }
};



// 导出债权人信息
const handleExport = () => {
  // 创建CSV内容
  let csvContent =
    '债权人名称,债权人类型,联系电话,联系邮箱,证件号码,法定代表人,地址,注册资本\n';

  creditors.value.forEach((creditor) => {
    const row = [
      creditor.creditorName,
      creditor.creditorType,
      creditor.contactPhone,
      creditor.contactEmail,
      creditor.idNumber,
      creditor.legalRepresentative,
      creditor.address,
      creditor.registeredCapital,
    ]
      .map((field) => `"${field || ''}"`)
      .join(',');
    csvContent += `${row}\n`;
  });

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `债权人信息_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.append(link);
    link.click();
    link.remove();
    ElMessage.success('导出成功');
  }
};

// 导入功能相关
const importDialogVisible = ref(false);
const importLoading = ref(false);
const selectedFile = ref<File | null>(null);
const uploadRef = ref<UploadInstance>();
const selectedTemplateForImport = ref('');
const importResultVisible = ref(false);
const importResult = ref<{
  successCount: number;
  failCount: number;
  totalCount: number;
  message: string;
  errors: Array<{
    row: number;
    message: string;
    data: string;
  }>;
  templateCode: string;
  caseId?: number;
} | null>(null);

// 模板列表
const templates = ref<any[]>([]);
const loadTemplates = async () => {
  try {
    const { excelTemplatesApi } = await import('#/api/core/excel-templates');
    const response = await excelTemplatesApi.getTemplates();
    if (response.code === 200) {
      templates.value = response.data || [];
      // 自动选择债权人相关的模板
      const creditorTemplate = templates.value.find(template => 
        template.templateName.includes('债权人') || 
        template.templateCode.includes('creditor')
      );
      if (creditorTemplate) {
        selectedTemplateForImport.value = creditorTemplate.templateCode;
      }
    }
  } catch (error) {
    console.error('加载模板失败:', error);
  }
};

// 打开导入对话框
const handleOpenImportDialog = async () => {
  await loadTemplates();
  importDialogVisible.value = true;
};

// 关闭导入对话框
const handleCloseImportDialog = () => {
  importDialogVisible.value = false;
  selectedFile.value = null;
  uploadRef.value?.clearFiles();
  selectedTemplateForImport.value = '';
};

// 文件选择变化
const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    selectedFile.value = uploadFile.raw;
  }
};

// 文件移除
const handleFileRemove = () => {
  selectedFile.value = null;
};

// 导入Excel
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择Excel文件');
    return;
  }

  importLoading.value = true;
  try {
    const { excelTemplatesApi } = await import('#/api/core/excel-templates');
    const response = await excelTemplatesApi.importExcel(
      selectedFile.value,
      selectedTemplateForImport.value || undefined,
      props.caseId
    );

    if (response.code === 200) {
      importResult.value = response.data;
      importResultVisible.value = true;

      // 清空文件选择
      selectedFile.value = null;
      uploadRef.value?.clearFiles();

      if (response.data.failCount === 0) {
        ElMessage.success(`成功导入 ${response.data.successCount} 条数据`);
      } else {
        ElMessage.warning(`导入完成，成功 ${response.data.successCount} 条，失败 ${response.data.failCount} 条`);
      }
    } else {
      ElMessage.error(response.message || '导入失败');
    }
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败，请检查文件格式');
  } finally {
    importLoading.value = false;
  }
};

// 关闭导入结果对话框
const handleCloseImportResultDialog = () => {
  importResultVisible.value = false;
  importResult.value = null;
  fetchCreditors(); // 刷新列表
};

const getCreditorTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    金融机构: { type: 'success' },
    企业: { type: 'primary' },
    个人: { type: 'primary' },
    其他: { type: 'info' },
  };
  return typeMap[type] || { type: 'info' };
};

const openCreditorDetailDialog = async (row: any) => {
  try {
    creditorDetailLoading.value = true;
    
    // 调用接口获取债权人债权详情
    const response = await getCreditorClaimStagesApi(row.id);
    if (response.code === 200 && response.data) {
      creditorDetailData.value = response.data;
      showCreditorDetailDialog.value = true;
      // 对话框显示后添加滚动监听器到内容容器
      setTimeout(() => {
        if (dialogRef.value) {
          const contentContainer = dialogRef.value.querySelector('.creditor-detail-container');
          if (contentContainer && typeof contentContainer.addEventListener === 'function') {
            contentContainer.addEventListener('scroll', handleScroll);
          }
        }
      }, 100);
    } else {
      ElMessage.error('获取债权人债权详情失败');
    }
  } catch (error) {
    console.error('获取债权人详情失败:', error);
    ElMessage.error('获取债权人详情失败');
  } finally {
    creditorDetailLoading.value = false;
  }
};

// 关闭债权人详情对话框
const closeCreditorDetailDialog = () => {
  showCreditorDetailDialog.value = false;
  isTabFixed.value = false;
  // 移除滚动监听器
  if (dialogRef.value) {
    const contentContainer = dialogRef.value.querySelector('.creditor-detail-container');
    if (contentContainer && typeof contentContainer.removeEventListener === 'function') {
      contentContainer.removeEventListener('scroll', handleScroll);
    }
  }
};

const formatCurrency = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === '') return '-';
  const num = Number(value);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '-';
  }
};

onMounted(() => {
  fetchCreditors();
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="creditor-info-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="flex flex-col items-start space-y-4 w-full">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center">
              <Icon icon="lucide:users" class="text-primary mr-2" />
              <span class="text-lg font-semibold">债权人信息</span>
            </div>
            <div class="flex space-x-2">
              <ElButton type="primary" @click="openSingleAddDialog">
                <Icon icon="lucide:plus" class="mr-1" />
                单个新增
              </ElButton>

              <ElButton type="warning" @click="handleExport">
                <Icon icon="lucide:download" class="mr-1" />
                导出
              </ElButton>
              <ElButton type="info" @click="handleOpenImportDialog">
                <Icon icon="lucide:upload" class="mr-1" />
                导入
              </ElButton>
            </div>
          </div>
          <ElTabs @tab-click="handleTabClick" class="w-full">
            <ElTabPane label="已知债权人（全部）" name="all"></ElTabPane>
            <ElTabPane label="确认债权人" name="confirmed"></ElTabPane>
          </ElTabs>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="mb-4 rounded-lg bg-gray-50 p-4">
        <div class="flex flex-wrap gap-4">
          <ElInput
            v-model="searchName"
            placeholder="债权人名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElButton type="primary" @click="handleSearch">
            <Icon icon="lucide:search" class="mr-1" />
            搜索
          </ElButton>
          <ElButton @click="handleResetSearch">
            <Icon icon="lucide:refresh-cw" class="mr-1" />
            重置
          </ElButton>
        </div>
      </div>

      <div v-loading="loading" class="creditor-list-container">
        <ElTable :data="creditors" border stripe style="width: 100%" class="mb-4" @row-click="openCreditorDetailDialog">
          <ElTableColumn prop="creditorStatus" label="债权人状态" width="120" align="center">
            <template #default="scope">
              <ElTag
                :type="scope.row.creditorStatus === 'CONFIRMED' ? 'success' : 'primary'"
                size="small"
              >
                {{ statusMap[scope.row.creditorStatus] || scope.row.creditorStatus }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="creditorName"
            label="债权人名称"
            min-width="180"
          />

          <ElTableColumn prop="creditorType" label="债权人类型" width="120">
            <template #default="scope">
              <ElTag
                :type="getCreditorTypeTag(scope.row.creditorType).type"
                size="small"
              >
                {{ scope.row.creditorType }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="contactPhone" label="联系电话" width="140" />
          <ElTableColumn prop="contactEmail" label="联系邮箱" width="180" />
          <ElTableColumn prop="idNumber" label="证件号码" width="180" />
          <ElTableColumn
            prop="legalRepresentative"
            label="法定代表人"
            width="140"
          />
          <ElTableColumn prop="address" label="地址" min-width="200" />
          <ElTableColumn
            prop="registeredCapital"
            label="注册资本"
            width="120"
          />
          <ElTableColumn label="操作" width="150" align="center" fixed="right">
            <template #default="scope">
              <div class="flex items-center justify-center gap-2">
                <ElButton
                  size="small"
                  text
                  @click.stop="openEditDialog(scope.row)"
                  class="text-primary"
                >
                  <Icon icon="lucide:edit" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton
                  size="small"
                  text
                  type="danger"
                  @click.stop="handleDeleteCreditor(scope.row)"
                >
                  <Icon icon="lucide:trash-2" class="mr-1" />
                  删除
                </ElButton>
              </div>
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

        <div v-if="creditors.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无债权人信息" />
        </div>
      </div>
    </ElCard>



    <!-- 单个新增对话框 -->
    <ElDialog
      v-model="showSingleAddDialog"
      title="单个新增债权人"
      width="600px"
      destroy-on-close
    >
      <div class="single-add-dialog-container">
        <ElForm label-width="120px" :model="singleForm">
          <ElFormItem label="债权人名称" required>
            <ElInput
              v-model="singleForm.creditorName"
              placeholder="请输入债权人名称"
            />
          </ElFormItem>
          <ElFormItem label="债权人类型" required>
            <ElSelect
              v-model="singleForm.creditorType"
              placeholder="请选择债权人类型"
            >
              <ElOption
                v-for="option in creditorTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="联系电话">
            <ElInput
              v-model="singleForm.contactPhone"
              placeholder="请输入联系电话"
            />
          </ElFormItem>
          <ElFormItem label="联系邮箱">
            <ElInput
              v-model="singleForm.contactEmail"
              placeholder="请输入联系邮箱"
            />
          </ElFormItem>
          <ElFormItem label="证件号码">
            <ElInput
              v-model="singleForm.idNumber"
              placeholder="请输入证件号码"
            />
          </ElFormItem>
          <ElFormItem label="法定代表人">
            <ElInput
              v-model="singleForm.legalRepresentative"
              placeholder="请输入法定代表人"
            />
          </ElFormItem>
          <ElFormItem label="地址">
            <ElInput v-model="singleForm.address" placeholder="请输入地址" />
          </ElFormItem>
          <ElFormItem label="注册资本">
            <ElInput
              v-model="singleForm.registeredCapital"
              placeholder="请输入注册资本"
            />
          </ElFormItem>
          <ElFormItem label="状态" required>
            <ElSelect
              v-model="singleForm.status"
              placeholder="请选择状态"
            >
              <ElOption
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeSingleAddDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleSingleAdd"
            :loading="singleAddLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 编辑对话框 -->
    <ElDialog
      v-model="showEditDialog"
      title="编辑债权人"
      width="600px"
      destroy-on-close
    >
      <div class="edit-dialog-container">
        <ElForm label-width="120px" :model="editForm">
          <ElFormItem label="债权人名称" required>
            <ElInput
              v-model="editForm.creditorName"
              placeholder="请输入债权人名称"
            />
          </ElFormItem>
          <ElFormItem label="债权人类型" required>
            <ElSelect
              v-model="editForm.creditorType"
              placeholder="请选择债权人类型"
            >
              <ElOption
                v-for="option in creditorTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="联系电话">
            <ElInput
              v-model="editForm.contactPhone"
              placeholder="请输入联系电话"
            />
          </ElFormItem>
          <ElFormItem label="联系邮箱">
            <ElInput
              v-model="editForm.contactEmail"
              placeholder="请输入联系邮箱"
            />
          </ElFormItem>
          <ElFormItem label="证件号码">
            <ElInput
              v-model="editForm.idNumber"
              placeholder="请输入证件号码"
            />
          </ElFormItem>
          <ElFormItem label="法定代表人">
            <ElInput
              v-model="editForm.legalRepresentative"
              placeholder="请输入法定代表人"
            />
          </ElFormItem>
          <ElFormItem label="地址">
            <ElInput v-model="editForm.address" placeholder="请输入地址" />
          </ElFormItem>
          <ElFormItem label="注册资本">
            <ElInput
              v-model="editForm.registeredCapital"
              placeholder="请输入注册资本"
            />
          </ElFormItem>
          <ElFormItem label="状态" required>
            <ElSelect
              v-model="editForm.status"
              placeholder="请选择状态"
            >
              <ElOption
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeEditDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleEditSubmit"
            :loading="editLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 债权人债权详情对话框 -->
    <ElDialog
      v-model="showCreditorDetailDialog"
      :title="`债权人债权详情 - ${creditorDetailData?.creditorName || ''}`"
      width="95%"
      destroy-on-close
      ref="dialogRef"
      class="creditor-detail-dialog"
    >
      <div v-loading="creditorDetailLoading" class="creditor-detail-container" style="max-height: 70vh; overflow-y: auto;">
        <div v-if="creditorDetailData" class="creditor-detail-content">
          <ElTabs 
            ref="tabRef"
            v-model="activeTab" 
            type="border-card"
            :class="{ 'fixed-tab': isTabFixed }"
          >
            <ElTabPane label="债权申报阶段" name="registration">
              <div v-if="creditorDetailData.claimRegistrations && creditorDetailData.claimRegistrations.length > 0">
                <div
                  v-for="(claim, index) in creditorDetailData.claimRegistrations"
                  :key="claim.id"
                  class="claim-card mb-4"
                >
                  <div class="claim-card-header">
                    <span class="claim-index">申报 {{ index + 1 }}</span>
                    <ElTag :type="claim.registrationStatus === 'REGISTERED' ? 'success' : 'warning'" size="small">
                      {{ claim.registrationStatus === 'REGISTERED' ? '已登记' : '待登记' }}
                    </ElTag>
                  </div>
                  <ElDescriptions :column="2" border class="mt-3">
                    <ElDescriptionsItem label="债权编号">{{ claim.claimNo }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="案件名称">{{ claim.caseName }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="债务人">{{ claim.debtor }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="债权人类型">{{ claim.creditorType }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="统一社会信用代码">{{ claim.creditCode }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="法定代表人">{{ claim.legalRepresentative }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报本金">{{ formatCurrency(claim.principal) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报利息">{{ formatCurrency(claim.interest) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报罚金">{{ formatCurrency(claim.penalty) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报其他损失">{{ formatCurrency(claim.otherLosses) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报总金额">{{ formatCurrency(claim.totalAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="债权性质">{{ claim.claimNature }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="债权种类">{{ claim.claimType }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="债权标识">{{ claim.claimIdentifier }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="是否有法院判决">
                      <ElTag :type="claim.hasCourtJudgment ? 'success' : 'info'" size="small">
                        {{ claim.hasCourtJudgment ? '是' : '否' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="是否有执行">
                      <ElTag :type="claim.hasExecution ? 'success' : 'info'" size="small">
                        {{ claim.hasExecution ? '是' : '否' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="是否有担保">
                      <ElTag :type="claim.hasCollateral ? 'success' : 'info'" size="small">
                        {{ claim.hasCollateral ? '是' : '否' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="登记日期">{{ formatDate(claim.registrationDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="登记截止日期">{{ formatDate(claim.registrationDeadline) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="材料接收人">{{ claim.materialReceiver }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="材料接收日期">{{ formatDate(claim.materialReceiveDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="材料完整性">
                      <ElTag :type="claim.materialCompleteness === 'COMPLETE' ? 'success' : 'warning'" size="small">
                        {{ claim.materialCompleteness === 'COMPLETE' ? '完整' : claim.materialCompleteness === 'INCOMPLETE' ? '不完整' : '待补充' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="债权事实" :span="2">{{ claim.claimFacts }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="证据清单" :span="2">{{ claim.evidenceList }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="备注" :span="2">{{ claim.remarks }}</ElDescriptionsItem>
                  </ElDescriptions>
                </div>
              </div>
              <ElEmpty v-else description="暂无债权申报记录" />
            </ElTabPane>

            <ElTabPane label="债权审查阶段" name="review">
              <div v-if="creditorDetailData.claimReviews && creditorDetailData.claimReviews.length > 0">
                <div
                  v-for="(review, index) in creditorDetailData.claimReviews"
                  :key="review.id"
                  class="claim-card mb-4"
                >
                  <div class="claim-card-header">
                    <span class="claim-index">审查 {{ index + 1 }}</span>
                    <ElTag :type="review.reviewStatus === 'COMPLETED' ? 'success' : 'warning'" size="small">
                      {{ review.reviewStatus === 'COMPLETED' ? '已完成' : '进行中' }}
                    </ElTag>
                  </div>
                  <ElDescriptions :column="2" border class="mt-3">
                    <ElDescriptionsItem label="审查日期">{{ formatDate(review.reviewDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="审查人">{{ review.reviewer }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="审查轮次">{{ review.reviewRound }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="审查结论">
                      <ElTag :type="review.reviewConclusion === 'CONFIRMED' ? 'success' : 'danger'" size="small">
                        {{ review.reviewConclusion === 'CONFIRMED' ? '确认' : '不确认' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="申报本金">{{ formatCurrency(review.declaredPrincipal) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报利息">{{ formatCurrency(review.declaredInterest) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报罚金">{{ formatCurrency(review.declaredPenalty) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报其他损失">{{ formatCurrency(review.declaredOtherLosses) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="申报总金额">{{ formatCurrency(review.declaredTotalAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="确认本金">{{ formatCurrency(review.confirmedPrincipal) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="确认利息">{{ formatCurrency(review.confirmedInterest) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="确认罚金">{{ formatCurrency(review.confirmedPenalty) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="确认其他损失">{{ formatCurrency(review.confirmedOtherLosses) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="确认总金额">{{ formatCurrency(review.confirmedTotalAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="未确认本金">{{ formatCurrency(review.unconfirmedPrincipal) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="未确认利息">{{ formatCurrency(review.unconfirmedInterest) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="未确认罚金">{{ formatCurrency(review.unconfirmedPenalty) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="未确认其他损失">{{ formatCurrency(review.unconfirmedOtherLosses) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="未确认总金额">{{ formatCurrency(review.unconfirmedTotalAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="确认债权性质">{{ review.confirmedClaimNature }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="证据真实性">
                      <ElTag :type="review.evidenceAuthenticity === 'VALID' ? 'success' : 'danger'" size="small">
                        {{ review.evidenceAuthenticity === 'VALID' ? '有效' : '无效' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="证据相关性">
                      <ElTag :type="review.evidenceRelevance === 'RELEVANT' ? 'success' : 'danger'" size="small">
                        {{ review.evidenceRelevance === 'RELEVANT' ? '相关' : '不相关' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="证据合法性">
                      <ElTag :type="review.evidenceLegality === 'LEGAL' ? 'success' : 'danger'" size="small">
                        {{ review.evidenceLegality === 'LEGAL' ? '合法' : '不合法' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="担保类型">{{ review.collateralType }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="担保物">{{ review.collateralProperty }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="担保金额">{{ formatCurrency(review.collateralAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="担保期限">{{ review.collateralTerm }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="担保有效性">
                      <ElTag :type="review.collateralValidity === 'VALID' ? 'success' : 'danger'" size="small">
                        {{ review.collateralValidity === 'VALID' ? '有效' : '无效' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="调整原因" :span="2">{{ review.adjustmentReason }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="未确认原因" :span="2">{{ review.unconfirmedReason }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="审查摘要" :span="2">{{ review.reviewSummary }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="备注" :span="2">{{ review.remarks }}</ElDescriptionsItem>
                  </ElDescriptions>
                </div>
              </div>
              <ElEmpty v-else description="暂无债权审查记录" />
            </ElTabPane>

            <ElTabPane label="债权确认阶段" name="confirmation">
              <div v-if="creditorDetailData.claimConfirmations && creditorDetailData.claimConfirmations.length > 0">
                <div
                  v-for="(confirmation, index) in creditorDetailData.claimConfirmations"
                  :key="confirmation.id"
                  class="claim-card mb-4"
                >
                  <div class="claim-card-header">
                    <span class="claim-index">确认 {{ index + 1 }}</span>
                    <ElTag :type="getConfirmationStatusTag(confirmation.confirmationStatus).type" size="small">
                      {{ getConfirmationStatusTag(confirmation.confirmationStatus).text }}
                    </ElTag>
                  </div>
                  <ElDescriptions :column="2" border class="mt-3">
                    <ElDescriptionsItem label="会议类型">{{ confirmation.meetingType }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="会议日期">{{ formatDate(confirmation.meetingDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="会议地点">{{ confirmation.meetingLocation }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="投票结果">
                      <ElTag :type="confirmation.voteResult === 'APPROVED' ? 'success' : 'danger'" size="small">
                        {{ confirmation.voteResult === 'APPROVED' ? '通过' : '未通过' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="是否有异议">
                      <ElTag :type="confirmation.hasObjection ? 'danger' : 'success'" size="small">
                        {{ confirmation.hasObjection ? '是' : '否' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="异议人">{{ confirmation.objector }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="异议原因">{{ confirmation.objectionReason }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="异议金额">{{ formatCurrency(confirmation.objectionAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="异议日期">{{ formatDate(confirmation.objectionDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="协商结果" :span="2">{{ confirmation.negotiationResult }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="协商日期">{{ formatDate(confirmation.negotiationDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="协商参与人">{{ confirmation.negotiationParticipants }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="是否有诉讼">
                      <ElTag :type="confirmation.hasLawsuit ? 'danger' : 'success'" size="small">
                        {{ confirmation.hasLawsuit ? '是' : '否' }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="诉讼案号">{{ confirmation.lawsuitCaseNo }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="诉讼状态">{{ confirmation.lawsuitStatus }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="诉讼结果">{{ confirmation.lawsuitResult }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="诉讼金额">{{ formatCurrency(confirmation.lawsuitAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="法院裁定日期">{{ formatDate(confirmation.courtRulingDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="法院裁定书号">{{ confirmation.courtRulingNo }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="法院裁定结果">{{ confirmation.courtRulingResult }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="法院裁定金额">{{ formatCurrency(confirmation.courtRulingAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="最终确认金额">{{ formatCurrency(confirmation.finalConfirmedAmount) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="最终确认日期">{{ formatDate(confirmation.finalConfirmationDate) }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="最终确认依据">{{ confirmation.finalConfirmationBasis }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="投票备注" :span="2">{{ confirmation.voteNotes }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="法院裁定备注" :span="2">{{ confirmation.courtRulingNotes }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="诉讼备注" :span="2">{{ confirmation.lawsuitNotes }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="备注" :span="2">{{ confirmation.remarks }}</ElDescriptionsItem>
                  </ElDescriptions>
                </div>
              </div>
              <ElEmpty v-else description="暂无债权确认记录" />
            </ElTabPane>
          </ElTabs>
        </div>
        <ElEmpty v-else description="暂无数据" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeCreditorDetailDialog">关闭</ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 导入数据对话框 -->
    <ElDialog
      v-model="importDialogVisible"
      title="导入债权人数据"
      width="600px"
      :before-close="handleCloseImportDialog"
    >
      <div class="import-container">
        <ElForm label-width="120px">
          <ElFormItem label="导入模板">
            <ElSelect
              v-model="selectedTemplateForImport"
              placeholder="选择导入使用的模板（可选）"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="template in templates"
                :key="template.id"
                :label="template.templateName"
                :value="template.templateCode"
              />
            </ElSelect>
          </ElFormItem>
          
          <ElFormItem label="Excel文件" required>
            <ElUpload
              ref="uploadRef"
              action="#"
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              accept=".xlsx,.xls"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
            >
              <ElButton type="success" :icon="UploadFilled">
                选择Excel文件
              </ElButton>
            </ElUpload>
            <div class="text-xs text-gray-500 mt-1">
              支持 .xlsx 和 .xls 格式
            </div>
          </ElFormItem>
        </ElForm>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleCloseImportDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleImport"
            :loading="importLoading"
            :disabled="!selectedFile"
          >
            开始导入
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 导入结果对话框 -->
    <ElDialog
      v-model="importResultVisible"
      title="导入结果"
      width="600px"
    >
      <div v-if="importResult" class="import-result">
        <ElResult
          :icon="importResult.failCount > 0 ? 'warning' : 'success'"
          :title="importResult.failCount > 0 ? '部分导入成功' : '导入成功'"
        >
          <template #sub-title>
            <div class="result-stats">
              <p>总记录数：<strong>{{ importResult.totalCount }}</strong></p>
              <p>成功导入：<strong style="color: #67c23a">{{ importResult.successCount }}</strong></p>
              <p>导入失败：<strong style="color: #f56c6c">{{ importResult.failCount }}</strong></p>
            </div>
            <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
              <p style="color: #f56c6c; margin-top: 10px">错误详情：</p>
              <ElTable :data="importResult.errors" size="small" style="width: 100%; margin-top: 10px" max-height="200">
                <ElTableColumn prop="row" label="行号" width="80" />
                <ElTableColumn prop="message" label="错误信息" />
              </ElTable>
            </div>
          </template>
        </ElResult>
      </div>
      
      <template #footer>
        <ElButton @click="handleCloseImportResultDialog">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.creditor-info-container {
  padding: 5px;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.creditor-list-container {
  min-height: 400px;
}

.pagination-container {
}

/* 固定标签样式 */
.creditor-detail-dialog {
  position: relative;
}

.fixed-tab {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
}

/* 为固定标签添加顶部占位符，防止内容跳动 */
.fixed-tab-placeholder {
  height: 40px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 60px 0;
}

.add-dialog-container {
  padding: 10px 0;
}

.template-description {
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.template-example {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.template-example p {
  margin: 4px 0;
}

/* 债权人详情弹窗样式 */
.creditor-detail-container {
  padding: 10px;
}

.creditor-detail-content {
  max-height: 80vh;
  overflow-y: auto;
}

.creditor-header {
  margin-bottom: 30px;
}

.creditor-info-card {
  background: white;
  color: #374151;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: transform 0.3s ease;
}

.creditor-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.creditor-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}



.claim-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.claim-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.claim-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.claim-index {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

/* 标签页样式 */
:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__nav) {
  padding-left: 10px;
}

:deep(.el-tabs__active-bar) {
  background-color: #4b5563;
}

:deep(.el-tabs__item.is-active) {
  color: #4b5563;
  font-weight: 600;
}

:deep(.el-tabs__item:hover) {
  color: #4b5563;
}

/* 描述列表样式 */
:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #4b5563;
  background-color: #f9fafb;
}

:deep(.el-descriptions__content) {
  color: #111827;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

:deep(.el-descriptions.border .el-descriptions__row:not(:last-child)) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-descriptions.border .el-descriptions__cell:not(:last-child)) {
  border-right: 1px solid #f0f0f0;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 12px;
  padding: 0 10px;
  height: 24px;
  line-height: 22px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .creditor-info-card {
    padding: 20px;
  }
  
  .creditor-name {
    font-size: 20px;
  }
  
  .claim-card {
    padding: 15px;
  }
  
  :deep(.el-descriptions :is(.el-descriptions__label, .el-descriptions__content)) {
    font-size: 14px;
  }
}
</style>
