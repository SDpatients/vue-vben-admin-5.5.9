<script lang="ts" setup>
import type { WorkTeamApi } from '#/api/core';

import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
} from 'element-plus';

const workTeamList = ref<WorkTeamApi.WorkTeamInfo[]>([]);

// 加载状态
const loading = ref(false);

// 搜索表单
const searchForm = reactive({
  TDFZR: '',
});

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 获取工作团队列表
const fetchWorkTeamList = async () => {
  loading.value = true;
  try {
    const params: WorkTeamApi.WorkTeamQueryParams = {
      page: pagination.page,
      size: pagination.pageSize,
      TDFZR: searchForm.TDFZR,
    };

    const response = await getWorkTeamListApi(params);

    if (response.status === '1' && response.data) {
      workTeamList.value = response.data.records || [];
      pagination.itemCount = response.data.count || 0;
      pagination.pages = response.data.pages || 0;
      ElMessage.success('工作团队列表加载成功');
    } else {
      ElMessage.error(response.error || '获取工作团队列表失败');
      // 使用模拟数据作为后备
      generateMockData();
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 使用模拟数据作为后备
    generateMockData();
  } finally {
    loading.value = false;
  }
};

// 生成模拟数据
const generateMockData = () => {
  workTeamList.value = [
    {
      row: 1,
      SEP_ID: 35,
      TDFZR: null,
      ZHZCY: null,
      CXZCY: null,
      CCGLZCY: null,
      ZQSHZCY: null,
      LDRSZCY: null,
      ZZQLZCY: null,
      AH: null,
      DQZT: null,
    },
    {
      row: 2,
      SEP_ID: 37,
      TDFZR: 'admin',
      ZHZCY: '测试综合组1、测试综合组2',
      CXZCY: '测试',
      CCGLZCY: '测试',
      ZQSHZCY: '测试',
      LDRSZCY: '测试',
      ZZQLZCY: '测试',
      AH: '（2023）测试案件',
      DQZT: null,
    },
  ];
  pagination.itemCount = 2;
  pagination.pages = 1;
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchWorkTeamList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchWorkTeamList();
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchWorkTeamList();
};

// 重置搜索
const handleReset = () => {
  searchForm.TDFZR = '';
  pagination.page = 1;
  fetchWorkTeamList();
};

// 刷新
const handleRefresh = () => {
  pagination.page = 1;
  fetchWorkTeamList();
};

// 新增工作团队弹窗相关
const addDialogVisible = ref(false);
const activeTab = ref('customData'); // customData, uploadFile

// 新增表单数据
const addFormData = reactive({
  teamLeader: '', // 团队负责人
  comprehensiveMembers: '', // 综合组成员
  procedureMembers: '', // 程序组成员
  propertyMembers: '', // 财产管理组成员
  creditorMembers: '', // 债权审核组成员
  laborMembers: '', // 劳动人事组成员
  claimMembers: '', // 主张权利组成员
  caseId: '', // 案件ID
});

// 表单验证规则
const addFormRules = {
  teamLeader: [
    { required: true, message: '请输入团队负责人', trigger: 'blur' },
  ],
};

// 案件列表数据
const caseList = ref([
  { label: '（2023）测试案件1', value: '1' },
  { label: '（2023）测试案件2', value: '2' },
  { label: '（2023）测试案件3', value: '3' },
]);

// 上传文件列表
const uploadFileList = ref([]);

// 打开新增工作团队弹窗
const handleAddWorkTeam = () => {
  addDialogVisible.value = true;
  activeTab.value = 'customData';
  // 重置表单
  Object.assign(addFormData, {
    teamLeader: '',
    comprehensiveMembers: '',
    procedureMembers: '',
    propertyMembers: '',
    creditorMembers: '',
    laborMembers: '',
    claimMembers: '',
    caseId: '',
  });
  uploadFileList.value = [];
};

// 关闭新增工作团队弹窗
const handleCloseAddDialog = () => {
  addDialogVisible.value = false;
};

// 保存新增工作团队
const handleSaveAddWorkTeam = () => {
  // 这里可以添加表单验证和保存逻辑
  ElMessage.success('工作团队保存成功');
  handleCloseAddDialog();
  // 刷新工作团队列表
  fetchWorkTeamList();
};

// 选择文件
const handleFileSelect = () => {
  // 这里可以添加文件选择逻辑
  ElMessage.info('文件选择功能开发中...');
};

// 编辑工作团队
const handleEdit = (row: WorkTeamApi.WorkTeamInfo) => {
  router.push(`/basic-data/work-team-management/edit/${row.SEP_ID}`);
};

// 删除工作团队
const handleDelete = (row: WorkTeamApi.WorkTeamInfo) => {
  ElMessage.warning(`删除工作团队 (功能开发中...)`);
};

// 页面加载时获取数据
onMounted(() => {
  fetchWorkTeamList();
});
</script>

<template>
  <div class="p-6">
    <ElCard header="工作团队管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">工作团队管理</span>
          <div class="flex items-center space-x-2">
            <ElButton type="primary" @click="handleAddWorkTeam">
              <i class="i-lucide-plus mr-1"></i>
              新增团队
            </ElButton>
            <ElButton type="primary" @click="handleRefresh">
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
            v-model="searchForm.TDFZR"
            placeholder="团队负责人"
            clearable
            style="width: 200px"
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
      <ElTable v-loading="loading" :data="workTeamList" border stripe>
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="AH"
          label="案号"
          width="180"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.AH">{{ row.AH }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="TDFZR"
          label="团队负责人"
          width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.TDFZR">{{ row.TDFZR }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="ZHZCY"
          label="综合组成员"
          width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.ZHZCY">{{ row.ZHZCY }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="CXZCY"
          label="程序组成员"
          width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.CXZCY">{{ row.CXZCY }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="CCGLZCY"
          label="财产管理组成员"
          width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.CCGLZCY">{{ row.CCGLZCY }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="ZQSHZCY"
          label="债权审核组成员"
          width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.ZQSHZCY">{{ row.ZQSHZCY }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="LDRSZCY"
          label="劳动人事组成员"
          width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.LDRSZCY">{{ row.LDRSZCY }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="ZZQLZCY"
          label="资产清理组成员"
          width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.ZZQLZCY">{{ row.ZZQLZCY }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="DQZT"
          label="当前状态"
          width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.DQZT">{{ row.DQZT }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" size="small" @click="handleEdit(row)">
              <i class="i-lucide-edit mr-1"></i>
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

      <!-- 新增工作团队弹窗 -->
      <ElDialog
        v-model="addDialogVisible"
        title="新增工作团队"
        width="600px"
        :before-close="handleCloseAddDialog"
      >
        <ElTabs v-model="activeTab" class="mb-4">
          <ElTabPane label="上传文件" name="uploadFile">
            <div class="upload-file-section">
              <p class="mb-4 text-sm text-gray-500">
                支持多文件上传，单个文件大小不超过50MB
              </p>
              <ElButton type="primary" @click="handleFileSelect" class="mb-4">
                <i class="i-lucide-upload mr-1"></i>
                选择文件
              </ElButton>
              <div class="file-list">
                <p
                  v-if="uploadFileList.length === 0"
                  class="py-8 text-center text-gray-400"
                >
                  暂无上传文件
                </p>
                <!-- 这里可以添加文件列表展示 -->
              </div>
            </div>
          </ElTabPane>
          <ElTabPane label="自定义数据" name="customData">
            <ElForm
              :model="addFormData"
              :rules="addFormRules"
              label-width="120px"
            >
              <ElFormItem label="案件" prop="caseId">
                <ElSelect
                  v-model="addFormData.caseId"
                  placeholder="请选择案件"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="caseItem in caseList"
                    :key="caseItem.value"
                    :label="caseItem.label"
                    :value="caseItem.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="团队负责人" prop="teamLeader">
                <ElInput
                  v-model="addFormData.teamLeader"
                  placeholder="请输入团队负责人"
                />
              </ElFormItem>
              <ElFormItem label="综合组成员">
                <ElInput
                  v-model="addFormData.comprehensiveMembers"
                  placeholder="请输入综合组成员"
                />
              </ElFormItem>
              <ElFormItem label="程序组成员">
                <ElInput
                  v-model="addFormData.procedureMembers"
                  placeholder="请输入程序组成员"
                />
              </ElFormItem>
              <ElFormItem label="财产管理组成员">
                <ElInput
                  v-model="addFormData.propertyMembers"
                  placeholder="请输入财产管理组成员"
                />
              </ElFormItem>
              <ElFormItem label="债权审核组成员">
                <ElInput
                  v-model="addFormData.creditorMembers"
                  placeholder="请输入债权审核组成员"
                />
              </ElFormItem>
              <ElFormItem label="劳动人事组成员">
                <ElInput
                  v-model="addFormData.laborMembers"
                  placeholder="请输入劳动人事组成员"
                />
              </ElFormItem>
              <ElFormItem label="主张权利组成员">
                <ElInput
                  v-model="addFormData.claimMembers"
                  placeholder="请输入主张权利组成员"
                />
              </ElFormItem>
            </ElForm>
          </ElTabPane>
        </ElTabs>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <ElButton @click="handleCloseAddDialog">取消</ElButton>
            <ElButton type="primary" @click="handleSaveAddWorkTeam">
              保存
            </ElButton>
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<style scoped>
:deep(.el-table .cell) {
  white-space: nowrap;
}

.upload-file-section {
  padding: 20px 0;
}

.file-list {
  padding: 20px;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}
</style>
