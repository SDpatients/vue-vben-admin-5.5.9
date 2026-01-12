<script lang="ts" setup>
import type { ManagerApi } from '#/api/core';

import { onMounted, reactive, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElSelect,
  ElOption,
} from 'element-plus';

import {
  addManagerApi,
  deleteManagerApi,
  getManagerListApi,
  updateManagerApi,
} from '#/api/core/manager';

const userStore = useUserStore();

// 管理人列表数据
const managerList = ref<ManagerApi.ManagerInfo[]>([]);

// 加载状态
const loading = ref(false);

// 搜索表单
const searchForm = reactive({
  LSSWSID: '',
  GLRLX: '',
  FZRID: '',
});

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 获取管理人列表
const fetchManagerList = async () => {
  loading.value = true;
  try {
    const params: ManagerApi.ManagerQueryParams = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      // 注意：新API只支持caseId查询，不支持之前的搜索条件
    };

    const response = await getManagerListApi(params);

    if (response.code === 200 && response.data) {
      managerList.value = response.data.list || [];
      pagination.itemCount = response.data.total || 0;
      pagination.pages = Math.ceil(pagination.itemCount / pagination.pageSize);
      ElMessage.success('管理人列表加载成功');
    } else {
      ElMessage.error(response.message || '获取管理人列表失败');
      // 清空列表数据
      managerList.value = [];
      pagination.itemCount = 0;
      pagination.pages = 0;
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 清空列表数据
    managerList.value = [];
    pagination.itemCount = 0;
    pagination.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchManagerList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchManagerList();
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchManagerList();
};

// 重置搜索
const handleReset = () => {
  searchForm.LSSWSID = '';
  searchForm.GLRLX = '';
  searchForm.FZRID = '';
  pagination.page = 1;
  fetchManagerList();
};

// 刷新
const handleRefresh = () => {
  pagination.page = 1;
  fetchManagerList();
};

// 新增管理人弹窗状态
const dialogVisible = ref(false);

// 管理人类型选项
const managerTypeOptions = [
  { label: '律师事务所', value: '律师事务所' },
  { label: '法人', value: '法人' },
  { label: '自然人', value: '自然人' },
];

// 新增管理人表单数据
const addManagerForm = reactive({
  caseId: 1, // 默认案件ID，实际使用时可能需要从案件列表中选择
  administratorName: '',
  contactPhone: '',
  contactEmail: '',
  officeAddress: '',
  responsiblePersonId: 1, // 默认负责人ID，实际使用时可能需要从用户列表中选择
});

// 编辑管理人弹窗状态
const editDialogVisible = ref(false);

// 编辑管理人表单数据
const editManagerForm = reactive({
  id: '', // 用于存储管理人ID，用于更新请求的路径参数
  contactPhone: '',
  contactEmail: '',
  officeAddress: '',
});

// 表单验证规则
const rules = reactive({
  administratorName: [
    {
      required: true,
      message: '请输入管理人名称',
      trigger: 'blur',
    },
  ],
});

// 打开新增弹窗
const handleAdd = () => {
  dialogVisible.value = true;
};

// 关闭新增弹窗
const handleCloseDialog = () => {
  // 重置表单
  Object.assign(addManagerForm, {
    caseId: 1,
    administratorName: '',
    contactPhone: '',
    contactEmail: '',
    officeAddress: '',
    responsiblePersonId: 1,
  });
};

// 提交新增表单
const handleAddSubmit = async () => {
  loading.value = true;
  try {
    const response = await addManagerApi(addManagerForm);
    if (response.code === 200) {
      ElMessage.success('添加管理人成功');
      dialogVisible.value = false;
      fetchManagerList();
    } else {
      ElMessage.error(response.message || '添加管理人失败');
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 打开编辑弹窗
const handleEdit = (row: ManagerApi.ManagerInfo) => {
  Object.assign(editManagerForm, {
    id: row.id,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    officeAddress: row.officeAddress,
  });
  editDialogVisible.value = true;
};

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  // 重置表单
  Object.assign(editManagerForm, {
    id: '',
    contactPhone: '',
    contactEmail: '',
    officeAddress: '',
  });
};

// 提交编辑表单
const handleEditSubmit = async () => {
  loading.value = true;
  try {
    // 从表单中提取管理人ID
    const { id, ...updateData } = editManagerForm;
    
    const response = await updateManagerApi(id, updateData);
    if (response.code === 200) {
      ElMessage.success('更新管理人成功');
      editDialogVisible.value = false;
      fetchManagerList();
    } else {
      ElMessage.error(response.message || '更新管理人失败');
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 删除管理人
const handleDelete = async (row: ManagerApi.ManagerInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该管理人吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    loading.value = true;
    const response = await deleteManagerApi(row.id);
    if (response.code === 200) {
      ElMessage.success('删除管理人成功');
      fetchManagerList();
    } else {
      ElMessage.error(response.message || '删除管理人失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('后端API暂时不可用，请稍后再试');
    }
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 状态选项
const statusOptions = [
  { label: '正常', value: '正常' },
  { label: '禁止', value: '禁止' },
];

// 页面加载时获取数据
onMounted(() => {
  fetchManagerList();
});
</script>

<template>
  <div class="manager-management-container">
    <ElCard>
      <template #header>
        <div class="card-header">
          <h2 class="card-title">管理人信息管理</h2>
          <div class="card-actions">
            <ElButton type="primary" @click="handleAdd">
              <i class="i-lucide-plus mr-1"></i>
              新增
            </ElButton>
            <ElButton @click="handleRefresh">
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
            v-model="searchForm.LSSWSID"
            placeholder="管理人"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElSelect
            v-model="searchForm.GLRLX"
            placeholder="管理人类型"
            clearable
            style="width: 200px"
            @change="handleSearch"
          >
            <ElOption
              v-for="option in managerTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
          <ElInput
            v-model="searchForm.FZRID"
            placeholder="负责人"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElButton type="primary" @click="handleSearch">
            <i class="i-lucide-search mr-1"></i>
            搜索
          </ElButton>
          <ElButton @click="handleReset">
            <i class="i-lucide-refresh-cw mr-1"></i>
            重置
          </ElButton>
        </div>
      </div>

      <!-- 数据表格 -->
      <ElTable
        v-loading="loading"
        :data="managerList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="administratorName"
          label="管理人名称"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="contactPhone"
          label="联系电话"
          width="130"
          align="center"
        />
        <ElTableColumn
          prop="contactEmail"
          label="联系邮箱"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="officeAddress"
          label="办公地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="createTime"
          label="创建时间"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="updateTime"
          label="更新时间"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" size="small" @click="handleEdit(row)">
              <i class="i-lucide-pencil mr-1"></i>
              编辑
            </ElButton>
            <ElButton type="danger" size="small" @click="handleDelete(row)">
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
    </ElCard>

    <!-- 新增管理人弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      title="新增管理人"
      width="500px"
      @close="handleCloseDialog"
    >
      <ElForm :model="addManagerForm" label-width="100px" :rules="rules">
        <ElFormItem label="案件ID">
          <ElInput v-model="addManagerForm.caseId" placeholder="请输入案件ID" type="number" />
        </ElFormItem>
        <ElFormItem label="管理人名称" prop="administratorName">
          <ElInput v-model="addManagerForm.administratorName" placeholder="请输入管理人名称" />
        </ElFormItem>
        <ElFormItem label="联系电话">
          <ElInput v-model="addManagerForm.contactPhone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="联系邮箱">
          <ElInput v-model="addManagerForm.contactEmail" placeholder="请输入联系邮箱" type="email" />
        </ElFormItem>
        <ElFormItem label="办公地址">
          <ElInput v-model="addManagerForm.officeAddress" placeholder="请输入办公地址" />
        </ElFormItem>
        <ElFormItem label="负责人ID">
          <ElInput v-model="addManagerForm.responsiblePersonId" placeholder="请输入负责人ID" type="number" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleAddSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 编辑管理人弹窗 -->
    <ElDialog
      v-model="editDialogVisible"
      title="编辑管理人"
      width="500px"
      @close="handleCloseEditDialog"
    >
      <ElForm :model="editManagerForm" label-width="100px">
        <ElFormItem label="联系电话">
          <ElInput v-model="editManagerForm.contactPhone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="联系邮箱">
          <ElInput v-model="editManagerForm.contactEmail" placeholder="请输入联系邮箱" type="email" />
        </ElFormItem>
        <ElFormItem label="办公地址">
          <ElInput v-model="editManagerForm.officeAddress" placeholder="请输入办公地址" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="editDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleEditSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.manager-management-container {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 8px;
}
</style>
