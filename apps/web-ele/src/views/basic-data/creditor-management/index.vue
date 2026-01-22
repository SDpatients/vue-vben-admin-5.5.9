<script lang="ts" setup>
import type { CreditorApi } from '#/api/core/creditor';
import type { ExportColumnConfig } from '#/utils/export-excel';

import { computed, onMounted, reactive, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCol,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCaseSimpleListApi } from '#/api/core/case';
import {
  createCreditorApi,
  deleteCreditorApi,
  getCreditorListApi,
  updateCreditorApi,
} from '#/api/core/creditor';
import { exportToExcel } from '#/utils/export-excel';

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
  { label: '活跃', value: 'ACTIVE' },
  { label: '非活跃', value: 'INACTIVE' },
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
      size: 10000,
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
  pagination.value.page = 1;
  fetchCreditorList();
};

// 格式化日期显示
const formatDate = (dateString: null | string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
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
      width: 8,
      formatter: (value) => (value === 'ACTIVE' ? '活跃' : '非活跃'),
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
          <ElButton type="primary" @click="handleSearch">
            <i class="i-lucide-search mr-1"></i>
            搜索
          </ElButton>
          <ElButton @click="resetSearch">
            <i class="i-lucide-refresh-cw mr-1"></i>
            重置
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
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
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
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <ElTag
              :type="scope.row.status === 'ACTIVE' ? 'success' : 'warning'"
              size="small"
            >
              {{ scope.row.status === 'ACTIVE' ? '活跃' : '非活跃' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              @click="handleEditCreditor(row)"
              class="mr-2"
            >
              <i class="i-lucide-edit mr-1"></i>
              编辑
            </ElButton>
            <ElButton
              type="danger"
              size="small"
              @click="handleDeleteCreditor(row)"
              :loading="deleteFormLoading"
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
                <span class="detail-value"
                  >{{ currentCreditor.ZJHM || '-' }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">法定代表人（企业）：</span>
                <span class="detail-value"
                  >{{ currentCreditor.FDDBRQY || '-' }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">注册地址：</span>
                <span class="detail-value"
                  >{{ currentCreditor.ZCDZ || '-' }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">经营范围（企业）：</span>
                <span class="detail-value"
                  >{{ currentCreditor.JYFWQY || '-' }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">行业分类：</span>
                <span class="detail-value"
                  >{{ currentCreditor.HYFL || '-' }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">成立日期：</span>
                <span class="detail-value"
                  >{{ formatDate(currentCreditor.CLRQQY) }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">注册资本：</span>
                <span class="detail-value"
                  >{{ formatCurrency(currentCreditor.ZCZBQY) }}
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">关联案件ID：</span>
                <span class="detail-value"
                  >{{ currentCreditor.GLAJID || '-' }}
                </span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">案号：</span>
                <span class="detail-value"
                  >{{ currentCreditor.AH || '-' }}
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
              <ElCol :span="12" />
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
</style>
