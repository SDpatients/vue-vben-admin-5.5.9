<script lang="ts" setup>
import type { CreditorApi } from '#/api/core/creditor';

import { onMounted, reactive, ref } from 'vue';

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

import {
  addCreditorApi,
  deleteCreditorApi,
  editCreditorApi,
  getCreditorListApi,
} from '#/api/core/creditor';

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

// 债权人分类选项
const creditorTypeOptions = [
  { label: '个人', value: '个人' },
  { label: '企业', value: '企业' },
  { label: '金融机构', value: '金融机构' },
  { label: '政府机构', value: '政府机构' },
  { label: '其他', value: '其他' },
];

// 新增债权人表单数据
const formData = reactive<CreditorApi.SingleCreditorRequest>({
  case_id: '', // 案件ID需要从上下文获取或设置
  creditor_name: '',
  creditor_type: '',
  contact_phone: '',
  contact_email: '',
  address: '',
  id_number: '',
  legal_representative: '',
  registered_capital: '',
  status: 'ACTIVE',
  created_by: 'admin', // 应该从登录信息中获取
});

// 新增表单验证规则
const addRules = {
  creditor_name: [
    { required: true, message: '请输入债权人名称', trigger: 'blur' },
  ],
  creditor_type: [
    { required: true, message: '请选择债权人分类', trigger: 'change' },
  ],
  id_number: [{ required: true, message: '请输入证件号码', trigger: 'blur' }],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
  ],
  contact_email: [
    {
      required: true,
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: 'blur',
    },
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  legal_representative: [
    {
      validator: (
        _rule: any,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        // 只有当债权人分类不是个人时，才验证法定代表人
        if (formData.creditor_type !== '个人' && !value) {
          callback(new Error('请输入法定代表人'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  registered_capital: [
    {
      validator: (
        _rule: any,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        // 只有当债权人分类不是个人时，才验证注册资本
        if (formData.creditor_type === '个人') {
          callback();
        } else {
          if (value) {
            callback();
          } else {
            callback(new Error('请输入注册资本'));
          }
        }
      },
      trigger: 'blur',
    },
  ],
};

// 编辑表单验证规则
const editRules = {
  creditor_name: [
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
};

// 关闭新增债权人模态框
const handleCloseDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
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
      page: pagination.value.page,
      size: pagination.value.pageSize,
      creditor_name: searchZqr.value,
      id_number: searchZjhm.value,
      legal_representative: searchFddbr.value,
    };

    const response = await getCreditorListApi(params);

    if (response.status === '1') {
      creditorList.value = response.data;
      pagination.value.itemCount = response.data.length;
      pagination.value.pages = 1;
      ElMessage.success(`成功加载 ${creditorList.value.length} 条债权人记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.error}`);
      creditorList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
    ElMessage.error('获取债权人列表失败，请检查网络连接或API服务');
    creditorList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
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

    const response = await addCreditorApi(formData);

    if (response.code === 200) {
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
  id: 0,
  case_id: '',
  creditor_name: '',
  creditor_type: '',
  contact_phone: '',
  contact_email: '',
  address: '',
  id_number: '',
  legal_representative: '',
  registered_capital: '',
  status: 'ACTIVE',
  updated_by: 'admin', // 应该从登录信息中获取
});
const editFormLoading = ref(false);

// 打开编辑债权人弹窗
const handleEditCreditor = (row: CreditorApi.CreditorInfo) => {
  // 填充编辑表单数据
  editFormData.id = row.id;
  editFormData.case_id = row.case_id;
  editFormData.creditor_name = row.creditor_name;
  editFormData.creditor_type = row.creditor_type;
  editFormData.contact_phone = row.contact_phone;
  editFormData.contact_email = row.contact_email;
  editFormData.address = row.address;
  editFormData.id_number = row.id_number;
  editFormData.legal_representative = row.legal_representative || '';
  editFormData.registered_capital = row.registered_capital || '';
  editFormData.status = row.status;
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
    const response = await editCreditorApi(editFormData);

    if (response.code === 200) {
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
    const response = await deleteCreditorApi({ id });

    if (response.code === 200) {
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
        :data="creditorList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="zqr"
          label="债权人名称"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="zqrfl"
          label="债权人分类"
          width="100"
          align="center"
        >
          <template #default="scope">
            <ElTag :type="getCreditorType(scope.row.zqrfl)" size="small">
              {{ scope.row.zqrfl }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="zjhm"
          label="证件号码"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="fddbrqy"
          label="法定代表人"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="zcdz"
          label="注册地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="jyfwqy"
          label="经营范围"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="hyfl"
          label="行业分类"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn prop="zczbqy" label="注册资本" width="120" align="right">
          <template #default="scope">
            {{ scope.row.zczbqy }}
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
                <ElFormItem label="债权人名称" prop="creditor_name">
                  <ElInput
                    v-model="formData.creditor_name"
                    placeholder="请输入债权人名称"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="债权人分类" prop="creditor_type">
                  <ElSelect
                    v-model="formData.creditor_type"
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
                <ElFormItem label="证件号码" prop="id_number">
                  <ElInput
                    v-model="formData.id_number"
                    placeholder="请输入证件号码"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="联系电话" prop="contact_phone">
                  <ElInput
                    v-model="formData.contact_phone"
                    placeholder="请输入联系电话"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="联系邮箱" prop="contact_email">
                  <ElInput
                    v-model="formData.contact_email"
                    placeholder="请输入联系邮箱"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="地址" prop="address">
                  <ElInput
                    v-model="formData.address"
                    placeholder="请输入地址"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem
                  label="法定代表人（企业）"
                  prop="legal_representative"
                  v-if="formData.creditor_type !== '个人'"
                >
                  <ElInput
                    v-model="formData.legal_representative"
                    placeholder="请输入法定代表人"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  label="注册资本（企业）"
                  prop="registered_capital"
                  v-if="formData.creditor_type !== '个人'"
                >
                  <ElInput
                    v-model="formData.registered_capital"
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
                <ElFormItem label="债权人名称" prop="zqr">
                  <ElInput
                    v-model="editFormData.ZQR"
                    placeholder="请输入债权人名称"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="债权人分类">
                  <ElSelect
                    v-model="editFormData.ZQRFL"
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
                <ElFormItem label="证件号码">
                  <ElInput
                    v-model="editFormData.ZJHM"
                    placeholder="请输入证件号码"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  label="法定代表人（企业）"
                  v-if="editFormData.ZQRFL !== '个人'"
                >
                  <ElInput
                    v-model="editFormData.FDDBRQY"
                    placeholder="请输入法定代表人"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElCard>

          <!-- 企业信息 -->
          <ElCard
            size="small"
            class="form-section mt-4"
            v-if="editFormData.ZQRFL !== '个人'"
          >
            <template #header>
              <div class="text-primary text-lg font-semibold">企业信息</div>
            </template>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="注册地址">
                  <ElInput
                    v-model="editFormData.ZCDZ"
                    placeholder="请输入注册地址"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="经营范围（企业）">
                  <ElInput
                    v-model="editFormData.JYFWQY"
                    placeholder="请输入经营范围"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="行业分类">
                  <ElInput
                    v-model="editFormData.HYFL"
                    placeholder="请输入行业分类"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="成立日期">
                  <ElDatePicker
                    v-model="editFormData.CLRQQY"
                    type="datetime"
                    placeholder="请选择成立日期"
                    style="width: 100%"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="注册资本">
                  <ElInput
                    v-model.number="editFormData.ZCZBQY"
                    placeholder="请输入注册资本"
                    size="large"
                    type="number"
                  />
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
