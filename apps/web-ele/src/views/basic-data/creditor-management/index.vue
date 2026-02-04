<script lang="ts" setup>
import type { CreditorApi } from '#/api/core/creditor';
import type { ExportColumnConfig } from '#/utils/export-excel';

import { computed, onMounted, reactive, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCol,
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
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTabPane,
  ElTag,
} from 'element-plus';

import { getCaseSimpleListApi } from '#/api/core/case';
import {
  createCreditorApi,
  deleteCreditorApi,
  getCreditorClaimStagesApi,
  getCreditorListApi,
  updateCreditorApi,
} from '#/api/core/creditor';
import { exportToExcel } from '#/utils/export-excel';
import { UploadFilled } from '@element-plus/icons-vue';
import type { UploadFile, UploadInstance } from 'element-plus';

// 响应式数据
const creditorList = ref<CreditorApi.CreditorInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 新增债权人模态框
const dialogVisible = ref(false);
const formLoading = ref(false);

// 查看详情模态框
const detailDialogVisible = ref(false);
const currentCreditor = ref<CreditorApi.CreditorInfo | null>(null);

// 债权人债权详情对话框
const showCreditorDetailDialog = ref(false);
const creditorDetailLoading = ref(false);
const creditorDetailData = ref<any>(null);
const activeTab = ref('registration');

// 导入功能相关
const importDialogVisible = ref(false);
const importLoading = ref(false);
const selectedFile = ref<File | null>(null);
const uploadRef = ref<UploadInstance>();
const importCaseId = ref('');
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

// 确保表格数据始终为数组
const safeCreditorList = computed(() =>
  Array.isArray(creditorList.value) ? creditorList.value : [],
);

// 债权人分类选项
const creditorTypeOptions = [
  { label: '个人', value: '个人' },
  { label: '企业', value: '企业' },
  { label: '金融机构', value: '金融机构' },
  { label: '政府机构', value: '政府机构' },
  { label: '其他', value: '其他' },
];

// 状态选项
const statusOptions = [
  { label: '已知债权人', value: 'KNOWN' },
  { label: '确认债权人', value: 'CONFIRMED' },
];

// 新增债权人表单数据
const formData = reactive({
  caseId: 0, // 案件ID
  caseNumber: '', // 案号，用于表单显示
  creditorName: '',
  creditorType: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  idNumber: '',
  legalRepresentative: '',
  registeredCapital: 0,
  status: '',
});

// 案件相关数据
const caseList = ref<any[]>([]);
const caseLoading = ref(false);

// 获取案件列表
const getCaseList = async (query = '') => {
  caseLoading.value = true;
  try {
    const response = await getCaseSimpleListApi({
      page: 1,
      size: 10_000,
      caseNumber: query,
    });

    caseList.value =
      response.code === 200 && response.data?.list ? response.data.list : [];
  } catch (error) {
    console.error('获取案件列表失败:', error);
    caseList.value = [];
  } finally {
    caseLoading.value = false;
  }
};

// 处理案号选择
const handleCaseSelect = (value: string) => {
  formData.caseNumber = value;
  // 根据选中的caseNumber值在caseList中找到对应的项，获取其id
  const selectedCase = caseList.value.find((item) => item.caseNumber === value);
  if (selectedCase) {
    formData.caseId = selectedCase.id;
  }
};

// 新增表单验证规则
const addRules = {
  caseNumber: [{ required: true, message: '请选择案号', trigger: 'change' }],
  creditorName: [
    { required: true, message: '请输入债权人名称', trigger: 'blur' },
  ],
  creditorType: [
    { required: true, message: '请选择债权人分类', trigger: 'change' },
  ],
};

// 编辑表单验证规则
const editRules = {
  creditorName: [
    { required: true, message: '请输入债权人名称', trigger: 'blur' },
  ],
};

// 表单引用
const formRef = ref();

// 搜索相关数据
const searchZqr = ref(''); // 债权人名称
const searchZjhm = ref(''); // 证件号码
const searchFddbr = ref(''); // 法定代表人
const searchStatus = ref(''); // 状态

// 搜索功能
const handleSearch = () => {
  pagination.value.page = 1;
  fetchCreditorList();
};

// 重置搜索
const resetSearch = () => {
  searchZqr.value = '';
  searchZjhm.value = '';
  searchFddbr.value = '';
  searchStatus.value = '';
  pagination.value.page = 1;
  fetchCreditorList();
};

// 显示全部债权人
const showAllCreditors = () => {
  searchStatus.value = '';
  pagination.value.page = 1;
  fetchCreditorList();
};

// 显示确认债权人
const showConfirmedCreditors = () => {
  searchStatus.value = 'CONFIRMED';
  pagination.value.page = 1;
  fetchCreditorList();
};

// 格式化货币显示
const formatCurrency = (amount: number) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
  }).format(amount);
};

// 格式化日期显示
const formatDate = (dateString: null | string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 格式化日期时间显示
const formatDateTime = (dateStr: string | undefined | null) => {
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

// 获取债权人类型标签
const getCreditorType = (type: string) => {
  switch (type) {
    case '个人': {
      return 'primary';
    }
    case '企业': {
      return 'success';
    }
    default: {
      return 'info';
    }
  }
};

// 打开新增债权人模态框
const handleAddCreditor = () => {
  dialogVisible.value = true;
  // 打开弹窗时加载案号列表
  getCaseList();
};

// 关闭新增债权人模态框
const handleCloseDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 重置案号相关字段
  formData.caseId = 0;
  formData.caseNumber = '';
};

// 关闭详情模态框
const handleCloseDetailDialog = () => {
  detailDialogVisible.value = false;
  currentCreditor.value = null;
};

const accessStore = useAccessStore();

// 获取债权人列表
const fetchCreditorList = async () => {
  loading.value = true;
  try {
    const params: CreditorApi.CreditorQueryParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.pageSize,
      creditorName: searchZqr.value,
      idNumber: searchZjhm.value,
      legalRepresentative: searchFddbr.value,
      status: searchStatus.value,
    };

    const response = await getCreditorListApi(params);
    console.log('API响应:', response);

    if (response.code === 200 && response.data) {
      creditorList.value = Array.isArray(response.data.list)
        ? response.data.list
        : [];
      pagination.value.itemCount =
        response.data.total || creditorList.value.length;
      ElMessage.success(`成功加载 ${creditorList.value.length} 条债权人记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.message}`);
      creditorList.value = [];
      pagination.value.itemCount = 0;
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
    ElMessage.error('获取债权人列表失败，请检查网络连接或API服务');
    creditorList.value = [];
    pagination.value.itemCount = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchCreditorList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchCreditorList();
};

// 刷新债权人列表
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchCreditorList();
};

// 页面加载时获取数据
onMounted(() => {
  fetchCreditorList();
});

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
  importCaseId.value = '';
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
  
  if (!importCaseId.value) {
    ElMessage.warning('请输入案件ID');
    return;
  }

  importLoading.value = true;
  try {
    const { excelTemplatesApi } = await import('#/api/core/excel-templates');
    const response = await excelTemplatesApi.importExcel(
      selectedFile.value,
      selectedTemplateForImport.value || undefined,
      importCaseId.value
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
  fetchCreditorList(); // 刷新列表
};

// 提交新增债权人表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    formLoading.value = true;

    const response = await createCreditorApi(formData);

    // 检查响应状态，兼容不同的响应格式
    if (response.code === 200 || response.status === '1') {
      ElMessage.success('债权人添加成功');
      dialogVisible.value = false;
      // 刷新债权人列表
      fetchCreditorList();
    } else {
      ElMessage.error(response.message || '债权人添加失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      // 表单验证失败，已经有提示
      return;
    }
    ElMessage.error('债权人添加失败，请稍后重试');
    console.error('添加债权人失败:', error);
  } finally {
    formLoading.value = false;
  }
};

// 编辑债权人相关
const editDialogVisible = ref(false);
const editFormRef = ref();
const editFormData = reactive<CreditorApi.UpdateCreditorRequest>({
  creditorId: 0,
  creditorName: '',
  creditorType: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  idNumber: '',
  legalRepresentative: '',
  registeredCapital: 0,
  status: '',
});
const editFormLoading = ref(false);

// 打开编辑债权人弹窗
const handleEditCreditor = (row: CreditorApi.CreditorInfo) => {
  // 填充编辑表单数据
  editFormData.creditorId = row.id;
  editFormData.creditorName = row.creditorName;
  editFormData.creditorType = row.creditorType;
  editFormData.contactPhone = row.contactPhone;
  editFormData.contactEmail = row.contactEmail;
  editFormData.address = row.address;
  editFormData.idNumber = row.idNumber;
  editFormData.legalRepresentative = row.legalRepresentative || '';
  editFormData.registeredCapital = row.registeredCapital || 0;
  editFormData.status = row.status || 'KNOWN';
  editDialogVisible.value = true;
};

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  editDialogVisible.value = false;
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
};

// 提交编辑债权人表单
const handleEditSubmit = async () => {
  if (!editFormRef.value) return;

  try {
    await editFormRef.value.validate();
    editFormLoading.value = true;

    // 调用编辑API
    const creditorId = editFormData.creditorId;
    const response = await updateCreditorApi(creditorId, editFormData);

    // 检查响应状态，兼容不同的响应格式
    if (response.code === 200 || response.status === '1') {
      ElMessage.success('债权人编辑成功');
      editDialogVisible.value = false;
      // 刷新债权人列表
      fetchCreditorList();
    } else {
      ElMessage.error(response.message || '债权人编辑失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      // 表单验证失败，已经有提示
      return;
    }
    ElMessage.error('债权人编辑失败，请稍后重试');
    console.error('编辑债权人失败:', error);
  } finally {
    editFormLoading.value = false;
  }
};

// 导出债权人数据为Excel
const exportCreditorData = () => {
  if (safeCreditorList.value.length === 0) {
    ElMessage.warning('当前没有数据可导出');
    return;
  }

  const exportColumns: ExportColumnConfig[] = [
    { field: 'caseNumber', title: '案号', width: 15 },
    { field: 'caseName', title: '案件名称', width: 20 },
    { field: 'creditorName', title: '债权人名称', width: 18 },
    { field: 'creditorType', title: '债权人分类', width: 12 },
    { field: 'idNumber', title: '证件号码', width: 15 },
    { field: 'legalRepresentative', title: '法定代表人', width: 12 },
    { field: 'address', title: '注册地址', width: 20 },
    { field: 'contactPhone', title: '联系电话', width: 12 },
    { field: 'contactEmail', title: '邮箱', width: 15 },
    { field: 'registeredCapital', title: '注册资本', width: 10 },
    { field: 'createdBy', title: '创建者', width: 10 },
    {
      field: 'createdTime',
      title: '创建时间',
      width: 15,
      formatter: (value) => formatDate(value),
    },
    {
      field: 'status',
      title: '状态',
      width: 12,
      formatter: (value) =>
        value === 'CONFIRMED' ? '确认债权人' : '已知债权人',
    },
  ];

  try {
    exportToExcel({
      data: safeCreditorList.value,
      fileName: '债权人管理数据',
      sheetName: '债权人',
      columns: exportColumns,
    });
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('数据导出失败，请重试');
  }
};

// 删除债权人相关
const deleteFormLoading = ref(false);

// 打开删除债权人确认弹窗
const handleDeleteCreditor = (row: CreditorApi.CreditorInfo) => {
  ElMessageBox.confirm('确定要删除该债权人吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      handleDeleteSubmit(row.id);
    })
    .catch(() => {
      // 用户取消删除
      ElMessage.info('已取消删除');
    });
};

// 提交删除债权人请求
const handleDeleteSubmit = async (id: number) => {
  try {
    deleteFormLoading.value = true;
    const response = await deleteCreditorApi(id);

    // 检查响应状态，兼容不同的响应格式
    if (response.code === 200 || response.status === '1') {
      ElMessage.success('债权人删除成功');
      // 刷新债权人列表
      fetchCreditorList();
    } else {
      ElMessage.error(response.message || '债权人删除失败');
    }
  } catch (error: any) {
    ElMessage.error('债权人删除失败，请稍后重试');
    console.error('删除债权人失败:', error);
  } finally {
    deleteFormLoading.value = false;
  }
};

// 打开债权人债权详情对话框
const openCreditorDetailDialog = async (row: CreditorApi.CreditorInfo) => {
  try {
    creditorDetailLoading.value = true;
    
    // 调用接口获取债权人债权详情
    const response = await getCreditorClaimStagesApi(row.id);
    if (response.code === 200 && response.data) {
      creditorDetailData.value = response.data;
      showCreditorDetailDialog.value = true;
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
</script>

<template>
  <div class="p-6">
    <ElCard header="债权人管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">债权人管理</span>
          <div class="flex items-center space-x-2">
            <ElButton type="primary" @click="handleAddCreditor">
              <i class="i-lucide-plus mr-1"></i>
              新增债权人
            </ElButton>
            <ElButton type="success" @click="exportCreditorData">
              <i class="i-lucide-download mr-1"></i>
              导出数据
            </ElButton>
            <ElButton type="warning" @click="handleOpenImportDialog">
              <i class="i-lucide-upload mr-1"></i>
              导入数据
            </ElButton>
            <ElButton type="primary" @click="handleRefresh" :loading="loading">
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="mb-4 rounded-lg bg-gray-50 p-4">
        <div class="flex flex-wrap gap-4">
          <ElInput
            v-model="searchZqr"
            placeholder="债权人名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElInput
            v-model="searchZjhm"
            placeholder="证件号码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElInput
            v-model="searchFddbr"
            placeholder="法定代表人"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElSelect
            v-model="searchStatus"
            placeholder="状态"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <ElOption
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
          <ElButton type="primary" @click="handleSearch">
            <i class="i-lucide-search mr-1"></i>
            搜索
          </ElButton>
          <ElButton @click="resetSearch">
            <i class="i-lucide-refresh-cw mr-1"></i>
            重置
          </ElButton>
          <ElButton type="info" @click="showAllCreditors">
            <i class="i-lucide-users mr-1"></i>
            已知债权人（全部）
          </ElButton>
          <ElButton type="success" @click="showConfirmedCreditors">
            <i class="i-lucide-check-circle mr-1"></i>
            确认债权人
          </ElButton>
        </div>
      </div>

      <!-- 数据表格 -->
      <ElTable
        v-loading="loading"
        :data="safeCreditorList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
        @row-click="openCreditorDetailDialog"
        style="cursor: pointer"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <ElTag
              :type="scope.row.status === 'CONFIRMED' ? 'success' : 'warning'"
              size="small"
            >
              {{ 
                scope.row.status === 'CONFIRMED' ? '确认债权人' : '已知债权人'
              }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="caseNumber"
          label="案号"
          min-width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="caseName"
          label="案件名称"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="creditorName"
          label="债权人名称"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="creditorType"
          label="债权人分类"
          width="100"
          align="center"
        >
          <template #default="scope">
            <ElTag :type="getCreditorType(scope.row.creditorType)" size="small">
              {{ scope.row.creditorType }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="idNumber"
          label="证件号码"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="legalRepresentative"
          label="法定代表人"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="address"
          label="注册地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="contactPhone"
          label="联系电话"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="contactEmail"
          label="邮箱"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="registeredCapital"
          label="注册资本"
          width="120"
          align="right"
        >
          <template #default="scope">
            {{ scope.row.registeredCapital }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="createdBy"
          label="创建者"
          width="100"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="createdTime"
          label="创建时间"
          width="150"
          align="center"
        >
          <template #default="scope">
            {{ formatDate(scope.row.createdTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              size="small"
              text
              @click="handleEditCreditor(row)"
              class="text-primary"
            >
              <i class="i-lucide-edit mr-1"></i>
              编辑
            </ElButton>
            <ElButton
              size="small"
              text
              @click="handleDeleteCreditor(row)"
              :loading="deleteFormLoading"
              class="text-danger ml-2"
            >
              <i class="i-lucide-trash-2 mr-1"></i>
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.itemCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <!-- 新增债权人模态框 -->
      <ElDialog
        v-model="dialogVisible"
        title="新增债权人"
        width="800px"
        :before-close="handleCloseDialog"
        class="creditor-dialog"
      >
        <ElForm
          ref="formRef"
          :model="formData"
          :rules="addRules"
          label-width="120px"
          label-position="top"
          class="creditor-form"
        >
          <!-- 基础信息 -->
          <ElCard size="small" class="form-section">
            <template #header>
              <div class="text-primary text-lg font-semibold">基础信息</div>
            </template>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="案号" prop="caseNumber">
                  <ElSelect
                    v-model="formData.caseNumber"
                    placeholder="请选择或搜索案号"
                    filterable
                    remote
                    reserve-keyword
                    :remote-method="getCaseList"
                    :loading="caseLoading"
                    @change="handleCaseSelect"
                    style="width: 100%"
                    size="large"
                  >
                    <ElOption
                      v-for="item in caseList"
                      :key="item.id"
                      :label="item.caseNumber"
                      :value="item.caseNumber"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="债权人名称" prop="creditorName">
                  <ElInput
                    v-model="formData.creditorName"
                    placeholder="请输入债权人名称"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="债权人分类" prop="creditorType">
                  <ElSelect
                    v-model="formData.creditorType"
                    placeholder="请选择债权人分类"
                    style="width: 100%"
                    size="large"
                  >
                    <ElOption
                      v-for="option in creditorTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="证件号码" prop="idNumber">
                  <ElInput
                    v-model="formData.idNumber"
                    placeholder="请输入证件号码"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="联系电话" prop="contactPhone">
                  <ElInput
                    v-model="formData.contactPhone"
                    placeholder="请输入联系电话"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="联系邮箱" prop="contactEmail">
                  <ElInput
                    v-model="formData.contactEmail"
                    placeholder="请输入联系邮箱"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="地址" prop="address">
                  <ElInput
                    v-model="formData.address"
                    placeholder="请输入地址"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="状态" prop="status">
                  <ElSelect
                    v-model="formData.status"
                    placeholder="请选择状态"
                    style="width: 100%"
                    size="large"
                  >
                    <ElOption
                      v-for="option in statusOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem
                  label="法定代表人（企业）"
                  v-if="formData.creditorType !== '个人'"
                  prop="legalRepresentative"
                >
                  <ElInput
                    v-model="formData.legalRepresentative"
                    placeholder="请输入法定代表人"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  label="注册资本（企业）"
                  v-if="formData.creditorType !== '个人'"
                  prop="registeredCapital"
                >
                  <ElInput
                    v-model="formData.registeredCapital"
                    placeholder="请输入注册资本"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElCard>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseDialog">取消</ElButton>
            <ElButton
              type="primary"
              @click="handleSubmit"
              :loading="formLoading"
            >
              确定
            </ElButton>
          </span>
        </template>
      </ElDialog>

      <!-- 查看债权人详情模态框 -->
      <ElDialog
        v-model="detailDialogVisible"
        title="债权人详情"
        width="700px"
        :before-close="handleCloseDetailDialog"
        class="creditor-dialog"
      >
        <div v-if="currentCreditor" class="creditor-detail">
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">债权人名称：</span>
                <span class="detail-value">{{ currentCreditor.ZQR }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">债权人分类：</span>
                <span class="detail-value">
                  <ElTag
                    :type="getCreditorType(currentCreditor.ZQRFL)"
                    size="small"
                  >
                    {{ currentCreditor.ZQRFL }}
                  </ElTag>
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">证件号码：</span>
                <span class="detail-value">{{ currentCreditor.ZJHM || '-' }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">法定代表人（企业）：</span>
                <span class="detail-value">{{ currentCreditor.FDDBRQY || '-' }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">注册地址：</span>
                <span class="detail-value">{{ currentCreditor.ZCDZ || '-' }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">经营范围（企业）：</span>
                <span class="detail-value">{{ currentCreditor.JYFWQY || '-' }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">行业分类：</span>
                <span class="detail-value">{{ currentCreditor.HYFL || '-' }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">成立日期：</span>
                <span class="detail-value">{{ formatDate(currentCreditor.CLRQQY) }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">注册资本：</span>
                <span class="detail-value">{{ formatCurrency(currentCreditor.ZCZBQY) }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">关联案件ID：</span>
                <span class="detail-value">{{ currentCreditor.GLAJID || '-' }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">案号：</span>
                <span class="detail-value">{{ currentCreditor.AH || '-' }}
                </span>
              </div>
            </ElCol>
          </ElRow>
        </div>

        <template #footer>
          <ElButton @click="handleCloseDetailDialog">关闭</ElButton>
        </template>
      </ElDialog>

      <!-- 编辑债权人模态框 -->
      <ElDialog
        v-model="editDialogVisible"
        title="编辑债权人"
        width="800px"
        :before-close="handleCloseEditDialog"
        class="creditor-dialog"
      >
        <ElForm
          ref="editFormRef"
          :model="editFormData"
          :rules="editRules"
          label-width="120px"
          label-position="top"
          class="creditor-form"
        >
          <!-- 基础信息 -->
          <ElCard size="small" class="form-section">
            <template #header>
              <div class="text-primary text-lg font-semibold">基础信息</div>
            </template>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="债权人名称" prop="creditorName">
                  <ElInput
                    v-model="editFormData.creditorName"
                    placeholder="请输入债权人名称"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="债权人分类" prop="creditorType">
                  <ElSelect
                    v-model="editFormData.creditorType"
                    placeholder="请选择债权人分类"
                    style="width: 100%"
                    size="large"
                  >
                    <ElOption
                      v-for="option in creditorTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="证件号码" prop="idNumber">
                  <ElInput
                    v-model="editFormData.idNumber"
                    placeholder="请输入证件号码"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  label="法定代表人（企业）"
                  v-if="editFormData.creditorType !== '个人'"
                  prop="legalRepresentative"
                >
                  <ElInput
                    v-model="editFormData.legalRepresentative"
                    placeholder="请输入法定代表人"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="联系电话" prop="contactPhone">
                  <ElInput
                    v-model="editFormData.contactPhone"
                    placeholder="请输入联系电话"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="邮箱" prop="contactEmail">
                  <ElInput
                    v-model="editFormData.contactEmail"
                    placeholder="请输入邮箱"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="注册地址" prop="address">
                  <ElInput
                    v-model="editFormData.address"
                    placeholder="请输入注册地址"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  label="注册资本（企业）"
                  v-if="editFormData.creditorType !== '个人'"
                  prop="registeredCapital"
                >
                  <ElInput
                    v-model="editFormData.registeredCapital"
                    placeholder="请输入注册资本"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="状态" prop="status">
                  <ElSelect
                    v-model="editFormData.status"
                    placeholder="请选择状态"
                    style="width: 100%"
                    size="large"
                  >
                    <ElOption
                      v-for="option in statusOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElCard>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseEditDialog">取消</ElButton>
            <ElButton
              type="primary"
              @click="handleEditSubmit"
              :loading="editFormLoading"
            >
              确定
            </ElButton>
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
            <ElFormItem label="案件ID" required>
              <ElInput
                v-model="importCaseId"
                placeholder="请输入案件ID"
                type="number"
              />
              <div class="text-xs text-gray-500 mt-1">
                如果Excel文件中没有指定案件ID，将使用此案件ID
              </div>
            </ElFormItem>
            
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
          <ElButton @click="handleCloseImportDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleImport"
            :loading="importLoading"
            :disabled="!selectedFile"
          >
            开始导入
          </ElButton>
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

      <!-- 债权人债权详情对话框 -->
      <ElDialog
        v-model="showCreditorDetailDialog"
        title="债权人债权详情"
        width="95%"
        destroy-on-close
      >
        <div v-loading="creditorDetailLoading" class="creditor-detail-container">
          <div v-if="creditorDetailData" class="creditor-detail-content">
            <div class="creditor-header mb-6">
              <div class="creditor-info-card">
                <div class="creditor-name">
                  {{ creditorDetailData.creditorName }}
                </div>

              </div>
            </div>

            <ElTabs v-model="activeTab" type="border-card">
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
                      <ElDescriptionsItem label="登记日期">{{ formatDateTime(claim.registrationDate) }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="登记截止日期">{{ formatDateTime(claim.registrationDeadline) }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="材料接收人">{{ claim.materialReceiver }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="材料接收日期">{{ formatDateTime(claim.materialReceiveDate) }}</ElDescriptionsItem>
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
                      <ElDescriptionsItem label="审查日期">{{ formatDateTime(review.reviewDate) }}</ElDescriptionsItem>
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
                      <ElTag :type="confirmation.confirmationStatus === 'CONFIRMED' ? 'success' : 'warning'" size="small">
                        {{ confirmation.confirmationStatus === 'CONFIRMED' ? '已确认' : '待确认' }}
                      </ElTag>
                    </div>
                    <ElDescriptions :column="2" border class="mt-3">
                      <ElDescriptionsItem label="会议类型">{{ confirmation.meetingType }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="会议日期">{{ formatDateTime(confirmation.meetingDate) }}</ElDescriptionsItem>
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
                      <ElDescriptionsItem label="异议日期">{{ formatDateTime(confirmation.objectionDate) }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="协商结果" :span="2">{{ confirmation.negotiationResult }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="协商日期">{{ formatDateTime(confirmation.negotiationDate) }}</ElDescriptionsItem>
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
                      <ElDescriptionsItem label="法院裁定日期">{{ formatDateTime(confirmation.courtRulingDate) }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="法院裁定书号">{{ confirmation.courtRulingNo }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="法院裁定结果">{{ confirmation.courtRulingResult }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="法院裁定金额">{{ formatCurrency(confirmation.courtRulingAmount) }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="最终确认金额">{{ formatCurrency(confirmation.finalConfirmedAmount) }}</ElDescriptionsItem>
                      <ElDescriptionsItem label="最终确认日期">{{ formatDateTime(confirmation.finalConfirmationDate) }}</ElDescriptionsItem>
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
            <ElButton @click="showCreditorDetailDialog = false">关闭</ElButton>
          </span>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<style scoped>
/* 响应式表格样式 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    font-size: 11px;
  }

  :deep(.el-table .cell) {
    padding: 2px 4px;
  }
}

:deep(.vben-card) {
  border-radius: 8px;
}

:deep(.el-table) {
  font-size: 12px;
  border-radius: 8px;
}

:deep(.el-table .cell) {
  padding: 4px 8px;
  line-height: 1.4;
}

:deep(.el-table__header-wrapper) {
  font-weight: 600;
}

:deep(.el-table--scrollable-x .el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table--scrollable-y .el-table__body-wrapper) {
  max-height: 500px;
  overflow-y: auto;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}

.number-value {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 新增债权人模态框样式 */
.creditor-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  :deep(.el-dialog__header) {
    background-color: #fff;
    border-bottom: 1px solid #e9ecef;
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  :deep(.el-dialog__footer) {
    padding: 15px 20px;
    background-color: #fff;
    border-top: 1px solid #e9ecef;
    border-radius: 0 0 8px 8px;
  }
}

/* 表单样式 */
.creditor-form {
  :deep(.el-form-item__label) {
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
  }

  :deep(.el-input__wrapper) {
    border-radius: 6px;
  }

  :deep(.el-select__wrapper) {
    border-radius: 6px;
  }
}

/* 表单区块样式 */
.form-section {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  }

  :deep(.el-card__header) {
    padding: 12px 16px;
    background-color: #f0f9ff;
    border-bottom: 1px solid #e0f2fe;
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

/* 详情模态框样式 */
.creditor-detail {
  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .detail-label {
    min-width: 120px;
    font-weight: 600;
    color: #555;
  }

  .detail-value {
    flex: 1;
    color: #333;
  }
}

/* 债权人债权详情弹窗样式 */
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
