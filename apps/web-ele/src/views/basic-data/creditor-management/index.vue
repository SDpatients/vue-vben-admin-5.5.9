<script lang="ts" setup>
import type { CreditorApi } from '#/api/core/creditor';

import { onMounted, reactive, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElCol,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElPopover,
  ElRow,
  ElSelect,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { addCreditorApi, getCreditorListApi } from '#/api/core/creditor';

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
const formData = reactive<CreditorApi.AddCreditorRequest>({
  sep_ld: '',
  sep_auser: '',
  sep_adate: new Date().toISOString().slice(0, 19),
  zqr: '',
  zqrfl: '',
  zjhm: '',
  fddbrqy: '',
  zcdz: '',
  jyfwqy: '',
  hyfl: '',
  clrqqy: null, // 成立日期初始值为null
  zczbqy: 0, // 注册资本默认值为0，int类型
  zt: '1', // 状态默认为1
});

// 表单验证规则
const rules = {
  zqr: [{ required: true, message: '请输入债权人名称', trigger: 'blur' }],
  zqrfl: [{ required: true, message: '请选择债权人分类', trigger: 'change' }],
  zjhm: [{ required: true, message: '请输入证件号码', trigger: 'blur' }],
  fddbrqy: [
    {
      validator: (rule, value, callback) => {
        // 只有当债权人分类不是个人时，才验证法定代表人
        if (formData.zqrfl !== '个人' && !value) {
          callback(new Error('请输入法定代表人'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  zcdz: [
    {
      validator: (rule, value, callback) => {
        // 只有当债权人分类不是个人时，才验证注册地址
        if (formData.zqrfl !== '个人' && !value) {
          callback(new Error('请输入注册地址'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  jyfwqy: [
    {
      validator: (rule, value, callback) => {
        // 只有当债权人分类不是个人时，才验证经营范围
        if (formData.zqrfl !== '个人' && !value) {
          callback(new Error('请输入经营范围'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  hyfl: [
    {
      validator: (rule, value, callback) => {
        // 只有当债权人分类不是个人时，才验证行业分类
        if (formData.zqrfl !== '个人' && !value) {
          callback(new Error('请输入行业分类'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  clrqqy: [
    {
      validator: (rule, value, callback) => {
        // 只有当债权人分类不是个人时，才验证成立日期
        if (formData.zqrfl !== '个人' && value === '') {
          callback(new Error('请选择成立日期'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  zczbqy: [
    {
      validator: (rule, value, callback) => {
        // 只有当债权人分类不是个人时，才验证注册资本
        if (formData.zqrfl === '个人') {
          callback();
        } else {
          // 数字类型验证，允许0值
          if (value === null || value === undefined) {
            callback(new Error('请输入注册资本'));
          } else if (typeof value === 'number' && isNaN(value)) {
            callback(new Error('注册资本必须是数字'));
          } else {
            callback();
          }
        }
      },
      trigger: 'blur',
    },
  ],
};

// 表单引用
const formRef = ref();

// 搜索相关数据
const searchKeyword = ref('');
const searchType = ref(''); // 债权人/案号
const searchOptions = [
  { label: '债权人', value: '债权人' },
  { label: '案号', value: '案号' },
];

// 搜索功能
const handleSearch = () => {
  if (!searchType.value) {
    ElMessage.warning('请选择搜索类型');
    return;
  }
  if (!searchKeyword.value) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  pagination.value.page = 1;
  fetchCreditorList();
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  searchType.value = '';
  pagination.value.page = 1;
  fetchCreditorList();
};

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '行号',
  '债权人名称',
  '债权人分类',
  '证件号码',
  '法定代表人',
  '注册地址',
  '经营范围',
  '行业分类',
  '成立日期',
  '注册资本',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '债权人ID',
  '债权人分类',
  '债权人名称',
  '法定代表人',
  '注册资本',
  '行号',
  '证件号码',
]);

// 检查列是否可见（用于表格列的 v-if）
const isColumnVisible = (columnName: string) => {
  return columnVisible.value.includes(columnName);
};

// 初始化列显示状态
const initColumnVisibility = () => {
  columnVisible.value = availableColumns.filter((column) =>
    defaultColumns.has(column),
  );
};

const accessStore = useAccessStore();

// 获取债权人列表
const fetchCreditorList = async () => {
  loading.value = true;
  try {
    const token = accessStore.accessToken || 'ff60b33806869ab08153b1ef4fd75ea3';
    const params: CreditorApi.CreditorQueryParams = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
      SearchKeyword: searchKeyword.value,
      SearchType: searchType.value,
    };

    const response = await getCreditorListApi(params);

    if (response.status === '1') {
      creditorList.value = response.data.records;
      pagination.value.itemCount = response.data.count;
      pagination.value.pages = response.data.pages;
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
  initColumnVisibility();
  fetchCreditorList();
});

// 重置列显示状态
const resetColumns = () => {
  initColumnVisibility();
  ElMessage.success('已重置为默认列显示');
};

// 显示所有列
const showAllColumns = () => {
  columnVisible.value = [...availableColumns];
  ElMessage.success('已显示所有列');
};

// 隐藏所有非核心列
const hideNonCoreColumns = () => {
  columnVisible.value = availableColumns.filter((column) =>
    defaultColumns.has(column),
  );
  ElMessage.success('已隐藏非核心列');
};

// 格式化日期显示
const formatDate = (dateString: string) => {
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

// 查看债权人详情
const viewCreditorDetail = (row: CreditorApi.CreditorInfo) => {
  currentCreditor.value = row;
  detailDialogVisible.value = true;
};

// 关闭详情模态框
const handleCloseDetailDialog = () => {
  detailDialogVisible.value = false;
  currentCreditor.value = null;
};

// 提交新增债权人表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 自动填写sep_auser：从本地存储获取chat_user_info中的U_USER
    const chatUserInfoStr = localStorage.getItem('chat_user_info');
    if (chatUserInfoStr) {
      try {
        const chatUserInfo = JSON.parse(chatUserInfoStr);
        formData.sep_auser = chatUserInfo.U_USER || '';
      } catch (error) {
        console.error('解析chat_user_info失败:', error);
      }
    }

    // 自动填写sep_adate：使用ISO格式的日期字符串，不替换T，让后端自行处理日期转换
    formData.sep_adate = new Date().toISOString().slice(0, 19);

    await formRef.value.validate();
    formLoading.value = true;

    // 处理成立日期，如果没有输入，设置为NULL
    const submitData = { ...formData };
    if (!submitData.clrqqy) {
      submitData.clrqqy = null;
    }
    // 处理注册资本，如果没有输入，确保为0（int类型）
    if (submitData.zczbqy === '' || submitData.zczbqy === undefined) {
      submitData.zczbqy = 0;
    }

    const response = await addCreditorApi(submitData);

    if (response.status === '1') {
      ElMessage.success('债权人添加成功');
      dialogVisible.value = false;
      // 刷新债权人列表
      fetchCreditorList();
    } else {
      ElMessage.error(response.error || '债权人添加失败');
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

// 编辑债权人
const handleEditCreditor = (row: CreditorApi.CreditorInfo) => {
  ElMessage.info(`编辑债权人: ${row.ZQR}`);
};
</script>

<template>
  <div class="p-6">
    <ElCard header="债权人管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">债权人管理</span>
          <div class="flex items-center space-x-2">
            <ElDropdown trigger="click">
              <ElButton type="info" size="small">
                <i class="i-lucide-settings mr-1"></i>
                列设置
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem @click="showAllColumns">
                    显示所有列
                  </ElDropdownItem>
                  <ElDropdownItem @click="hideNonCoreColumns">
                    仅显示核心列
                  </ElDropdownItem>
                  <ElDropdownItem @click="resetColumns">
                    重置为默认
                  </ElDropdownItem>
                  <ElDropdownItem divided>
                    <ElPopover
                      placement="right"
                      width="300"
                      trigger="click"
                      title="自定义列显示"
                    >
                      <template #reference>
                        <span>自定义列显示</span>
                      </template>
                      <div class="space-y-2">
                        <div class="mb-2 text-sm text-gray-500">
                          选择要显示的列：
                        </div>
                        <ElCheckboxGroup v-model="columnVisible">
                          <div class="grid grid-cols-2 gap-2">
                            <ElCheckbox label="行号" name="行号">
                              行号
                            </ElCheckbox>
                            <ElCheckbox label="债权人名称" name="债权人名称">
                              债权人名称
                            </ElCheckbox>
                            <ElCheckbox label="债权人分类" name="债权人分类">
                              债权人分类
                            </ElCheckbox>
                            <ElCheckbox label="证件号码" name="证件号码">
                              证件号码
                            </ElCheckbox>
                            <ElCheckbox label="法定代表人" name="法定代表人">
                              法定代表人
                            </ElCheckbox>
                            <ElCheckbox label="注册地址" name="注册地址">
                              注册地址
                            </ElCheckbox>
                            <ElCheckbox label="经营范围" name="经营范围">
                              经营范围
                            </ElCheckbox>
                            <ElCheckbox label="行业分类" name="行业分类">
                              行业分类
                            </ElCheckbox>
                            <ElCheckbox label="成立日期" name="成立日期">
                              成立日期
                            </ElCheckbox>
                            <ElCheckbox label="注册资本" name="注册资本">
                              注册资本
                            </ElCheckbox>
                          </div>
                        </ElCheckboxGroup>
                      </div>
                    </ElPopover>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
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

      <ElSpace direction="vertical" size="large" class="w-full">
        <!-- 搜索区域 -->
        <ElCard size="small">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">搜索类型：</span>
              <ElSelect
                v-model="searchType"
                placeholder="请选择搜索类型"
                size="small"
                style="width: 150px"
              >
                <ElOption
                  v-for="option in searchOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">搜索关键词：</span>
              <ElInput
                v-model="searchKeyword"
                placeholder="请输入搜索关键词"
                size="small"
                style="width: 200px"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <ElButton size="small" type="primary" @click="handleSearch">
                    搜索
                  </ElButton>
                </template>
              </ElInput>
            </div>
            <ElButton size="small" @click="resetSearch"> 重置 </ElButton>
            <div class="ml-auto text-sm text-gray-500">
              提示：只能选择一种搜索类型进行搜索
            </div>
          </div>
        </ElCard>

        <!-- 债权人统计信息 -->
        <ElCard header="债权人统计概览" size="small">
          <ElRow :gutter="20">
            <ElCol :span="6">
              <div class="stat-card rounded bg-blue-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-blue-600">
                  {{ pagination.itemCount }}
                </div>
                <div class="mt-2 text-sm text-gray-500">总债权人数量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-green-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-green-600">
                  {{
                    creditorList.filter((item) => item.ZQRFL === '个人').length
                  }}
                </div>
                <div class="mt-2 text-sm text-gray-500">个人债权人</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-purple-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-purple-600">
                  {{
                    creditorList.filter((item) => item.ZQRFL === '企业').length
                  }}
                </div>
                <div class="mt-2 text-sm text-gray-500">企业债权人</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-orange-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-orange-600">
                  {{
                    creditorList.filter(
                      (item) => item.GLAJID && item.GLAJID !== '',
                    ).length
                  }}
                </div>
                <div class="mt-2 text-sm text-gray-500">已关联案件</div>
              </div>
            </ElCol>
          </ElRow>
        </ElCard>

        <!-- 债权人列表表格 -->
        <ElCard header="债权人列表" size="small">
          <ElTable
            :data="creditorList"
            v-loading="loading"
            stripe
            border
            size="small"
            :style="{ width: '100%', maxHeight: '600px' }"
            scrollable
          >
            <!-- 行号 -->
            <ElTableColumn
              v-if="isColumnVisible('行号')"
              prop="row"
              label="行号"
              width="60"
              fixed="left"
              align="center"
            />

            <!-- 债权人名称 -->
            <ElTableColumn
              v-if="isColumnVisible('债权人名称')"
              prop="ZQR"
              label="债权人名称"
              width="150"
              show-overflow-tooltip
            />

            <!-- 债权人分类 -->
            <ElTableColumn
              v-if="isColumnVisible('债权人分类')"
              prop="ZQRFL"
              label="债权人分类"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <ElTag :type="getCreditorType(row.ZQRFL)" size="small">
                  {{ row.ZQRFL }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 证件号码 -->
            <ElTableColumn
              v-if="isColumnVisible('证件号码')"
              prop="ZJHM"
              label="证件号码"
              width="150"
              show-overflow-tooltip
            />

            <!-- 法定代表人 -->
            <ElTableColumn
              v-if="isColumnVisible('法定代表人')"
              prop="FDDBRQY"
              label="法定代表人"
              width="120"
              show-overflow-tooltip
            />

            <!-- 注册地址 -->
            <ElTableColumn
              v-if="isColumnVisible('注册地址')"
              prop="ZCDZ"
              label="注册地址"
              width="200"
              show-overflow-tooltip
            />

            <!-- 经营范围 -->
            <ElTableColumn
              v-if="isColumnVisible('经营范围')"
              prop="JYFWQY"
              label="经营范围"
              width="200"
              show-overflow-tooltip
            />

            <!-- 行业分类 -->
            <ElTableColumn
              v-if="isColumnVisible('行业分类')"
              prop="HYFL"
              label="行业分类"
              width="120"
              show-overflow-tooltip
            />

            <!-- 成立日期 -->
            <ElTableColumn
              v-if="isColumnVisible('成立日期')"
              prop="CLRQQY"
              label="成立日期"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                {{ formatDate(row.CLRQQY) }}
              </template>
            </ElTableColumn>

            <!-- 注册资本 -->
            <ElTableColumn
              v-if="isColumnVisible('注册资本')"
              prop="ZCZBQY"
              label="注册资本"
              width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row.ZCZBQY) }}
              </template>
            </ElTableColumn>

            <!-- 关联案件ID -->
            <ElTableColumn
              v-if="isColumnVisible('关联案件ID')"
              prop="GLAJID"
              label="关联案件ID"
              width="120"
              show-overflow-tooltip
            />

            <!-- 案号 -->
            <ElTableColumn
              v-if="isColumnVisible('案号')"
              prop="AH"
              label="案号"
              width="150"
              show-overflow-tooltip
            />

            <!-- 操作列 -->
            <ElTableColumn label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <ElButton
                  type="primary"
                  size="small"
                  link
                  @click="viewCreditorDetail(row)"
                >
                  查看
                </ElButton>
                <ElButton
                  type="info"
                  size="small"
                  link
                  @click="handleEditCreditor(row)"
                >
                  编辑
                </ElButton>
                <ElButton type="danger" size="small" link> 删除 </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 分页组件 -->
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
        </ElCard>
      </ElSpace>

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
          :rules="rules"
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
                    v-model="formData.zqr"
                    placeholder="请输入债权人名称"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="债权人分类" prop="zqrfl">
                  <ElSelect
                    v-model="formData.zqrfl"
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
                <ElFormItem label="证件号码" prop="zjhm">
                  <ElInput
                    v-model="formData.zjhm"
                    placeholder="请输入证件号码"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  label="法定代表人（企业）"
                  prop="fddbrqy"
                  v-if="formData.zqrfl !== '个人'"
                >
                  <ElInput
                    v-model="formData.fddbrqy"
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
            v-if="formData.zqrfl !== '个人'"
          >
            <template #header>
              <div class="text-primary text-lg font-semibold">企业信息</div>
            </template>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="注册地址" prop="zcdz">
                  <ElInput
                    v-model="formData.zcdz"
                    placeholder="请输入注册地址"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="经营范围（企业）" prop="jyfwqy">
                  <ElInput
                    v-model="formData.jyfwqy"
                    placeholder="请输入经营范围"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="30">
              <ElCol :span="12">
                <ElFormItem label="行业分类" prop="hyfl">
                  <ElInput
                    v-model="formData.hyfl"
                    placeholder="请输入行业分类"
                    size="large"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="成立日期" prop="clrqqy">
                  <ElDatePicker
                    v-model="formData.clrqqy"
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
                <ElFormItem label="注册资本" prop="zczbqy">
                  <ElInput
                    v-model.number="formData.zczbqy"
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
                <span class="detail-value">{{
                  currentCreditor.ZJHM || '-'
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">法定代表人（企业）：</span>
                <span class="detail-value">{{
                  currentCreditor.FDDBRQY || '-'
                }}</span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">注册地址：</span>
                <span class="detail-value">{{
                  currentCreditor.ZCDZ || '-'
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">经营范围（企业）：</span>
                <span class="detail-value">{{
                  currentCreditor.JYFWQY || '-'
                }}</span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">行业分类：</span>
                <span class="detail-value">{{
                  currentCreditor.HYFL || '-'
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">成立日期：</span>
                <span class="detail-value">{{
                  formatDate(currentCreditor.CLRQQY)
                }}</span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">注册资本：</span>
                <span class="detail-value">{{
                  formatCurrency(currentCreditor.ZCZBQY)
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">关联案件ID：</span>
                <span class="detail-value">{{
                  currentCreditor.GLAJID || '-'
                }}</span>
              </div>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20" class="mb-4">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="detail-label">案号：</span>
                <span class="detail-value">{{
                  currentCreditor.AH || '-'
                }}</span>
              </div>
            </ElCol>
          </ElRow>
        </div>

        <template #footer>
          <ElButton @click="handleCloseDetailDialog">关闭</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<style scoped>
:deep(.vben-card) {
  border-radius: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
  font-size: 12px;
}

:deep(.el-table .cell) {
  line-height: 1.4;
  padding: 4px 8px;
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

/* 响应式表格样式 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    font-size: 11px;
  }

  :deep(.el-table .cell) {
    padding: 2px 4px;
  }
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    border-bottom: 1px solid #e9ecef;
    background-color: #ffffff;
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #e9ecef;
    background-color: #ffffff;
    border-radius: 0 0 8px 8px;
    padding: 15px 20px;
  }
}

/* 表单样式 */
.creditor-form {
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #555;
    margin-bottom: 8px;
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-card__header) {
    background-color: #f0f9ff;
    border-bottom: 1px solid #e0f2fe;
    border-radius: 8px 8px 0 0;
    padding: 12px 16px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

/* 详情模态框样式 */
.creditor-detail {
  .detail-item {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
  }

  .detail-label {
    font-weight: 600;
    color: #555;
    min-width: 120px;
  }

  .detail-value {
    color: #333;
    flex: 1;
  }
}
</style>
