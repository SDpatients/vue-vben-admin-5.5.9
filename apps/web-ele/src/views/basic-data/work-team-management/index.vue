<script lang="ts" setup>
import type { WorkTeamApi } from '#/api/core';

import { onMounted, reactive, ref } from 'vue';

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
} from 'element-plus';

import { getCaseListApi } from '#/api/core/case';
import { createWorkTeamApi, getWorkTeamListApi } from '#/api/core/work-team';

const router = useRouter();

const workTeamList = ref<WorkTeamApi.WorkTeamInfo[]>([]);

// 加载状态
const loading = ref(false);

// 搜索表单
const searchForm = reactive({
  caseId: undefined,
  status: '',
  teamName: '',
  teamLeaderId: undefined,
});

// 分页配置
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 获取工作团队列表
const fetchWorkTeamList = async () => {
  loading.value = true;
  try {
    const params: WorkTeamApi.WorkTeamQueryParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm,
    };

    const response = await getWorkTeamListApi(params);

    if (response.code === 200 && response.data) {
      workTeamList.value = response.data.list || [];
      pagination.total = response.data.total || 0;
      ElMessage.success('工作团队列表加载成功');
    } else {
      ElMessage.error(response.message || '获取工作团队列表失败');
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
      id: 1,
      teamName: '案件处理团队A',
      teamLeaderId: 1,
      teamLeaderName: '张三',
      caseId: 100,
      caseName: '案件A',
      teamDescription: '负责案件A的处理工作',
      status: 'ACTIVE',
      createTime: '2026-01-09T10:00:00',
      memberCount: 5,
      caseNumber: '（2023）测试案件1',
      teamMembers: '李律师、王律师、赵律师、刘律师、陈律师',
      creator: '管理员',
    },
    {
      id: 2,
      teamName: '财产管理团队',
      teamLeaderId: 2,
      teamLeaderName: '李四',
      caseId: 200,
      caseName: '案件B',
      teamDescription: '负责财产管理相关工作',
      status: 'ACTIVE',
      createTime: '2026-01-09T14:30:00',
      memberCount: 3,
      caseNumber: '（2023）测试案件2',
      teamMembers: '张律师、王律师、赵律师',
      creator: '管理员',
    },
  ];
  pagination.total = 2;
};

// 处理分页变化
const handlePageChange = (pageNum: number) => {
  pagination.pageNum = pageNum;
  fetchWorkTeamList();
};

// 处理页面大小变化
const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.pageNum = 1;
  fetchWorkTeamList();
};

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1;
  fetchWorkTeamList();
};

// 重置搜索
const handleReset = () => {
  searchForm.caseId = undefined;
  searchForm.status = '';
  pagination.pageNum = 1;
  fetchWorkTeamList();
};

// 刷新
const handleRefresh = () => {
  pagination.pageNum = 1;
  fetchWorkTeamList();
};

// 新增工作团队弹窗相关
const addDialogVisible = ref(false);

// 新增表单数据
const addFormData = reactive({
  caseId: '', // 案件ID
  teamName: '', // 团队名称
  teamLeader: '', // 团队负责人
  teamDescription: '', // 团队描述
  teamMembers: [], // 团队成员（多选）
  status: 'ACTIVE', // 状态
});

// 表单验证规则
const addFormRules = {
  caseId: [{ required: true, message: '请选择案号', trigger: 'change' }],
  teamName: [{ required: true, message: '请输入团队名称', trigger: 'blur' }],
  teamLeader: [
    { required: true, message: '请输入团队负责人', trigger: 'blur' },
  ],
  teamMembers: [
    { required: true, message: '请选择团队成员', trigger: 'change' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 案件列表数据（案号列表）
const caseList = ref<{ label: string; value: string }[]>([]);

// 案号搜索加载状态
const caseSearchLoading = ref(false);

// 远程搜索案号
const remoteSearchCase = async (query: string) => {
  if (query === '') {
    caseList.value = [];
    return;
  }

  caseSearchLoading.value = true;
  try {
    const response = await getCaseListApi({
      page: 1,
      size: 10,
      caseNumber: query,
    });

    caseList.value =
      response.code === 200 && response.data
        ? response.data.list.map((caseItem) => ({
            label: caseItem.caseNumber,
            value: caseItem.id.toString(),
          }))
        : [];
  } catch {
    caseList.value = [];
    ElMessage.error('获取案号列表失败');
  } finally {
    caseSearchLoading.value = false;
  }
};

// 获取初始案号列表
const fetchCaseList = async () => {
  caseSearchLoading.value = true;
  try {
    const response = await getCaseListApi({
      page: 1,
      size: 10,
    });

    if (response.code === 200 && response.data) {
      caseList.value = response.data.list.map((caseItem) => ({
        label: caseItem.caseNumber,
        value: caseItem.id.toString(),
      }));
    }
  } catch {
    ElMessage.error('获取案号列表失败');
  } finally {
    caseSearchLoading.value = false;
  }
};

// 团队成员列表数据（支持模糊查询）
const memberList = ref([
  { label: '张律师', value: '1' },
  { label: '李律师', value: '2' },
  { label: '王律师', value: '3' },
  { label: '赵律师', value: '4' },
  { label: '刘律师', value: '5' },
  { label: '陈律师', value: '6' },
  { label: '杨律师', value: '7' },
  { label: '黄律师', value: '8' },
  { label: '周律师', value: '9' },
  { label: '吴律师', value: '10' },
]);

// 状态选项
const statusOptions = ref([
  { label: '正常', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
]);

// 打开新增工作团队弹窗
const handleAddWorkTeam = async () => {
  addDialogVisible.value = true;
  // 重置表单
  Object.assign(addFormData, {
    caseId: '',
    teamName: '',
    teamLeader: '',
    teamDescription: '',
    teamMembers: [],
    status: 'ACTIVE',
  });

  // 获取初始案号列表
  await fetchCaseList();
};

// 关闭新增工作团队弹窗
const handleCloseAddDialog = () => {
  addDialogVisible.value = false;
};

// 保存新增工作团队
const handleSaveAddWorkTeam = async () => {
  try {
    // 表单验证
    await (ElForm as any).validate();

    // 转换表单数据为API所需格式
    const apiData: WorkTeamApi.CreateWorkTeamRequest = {
      teamName: addFormData.teamName,
      teamLeaderId: Number.parseInt(addFormData.teamLeader) || 1, // 这里假设团队负责人输入的是ID，实际项目中可能需要从用户列表中选择
      caseId: Number.parseInt(addFormData.caseId),
      teamDescription: addFormData.teamDescription,
    };

    // 调用API创建工作团队
    const response = await createWorkTeamApi(apiData);

    if (response.code === 200) {
      ElMessage.success('工作团队保存成功');
      handleCloseAddDialog();
      // 刷新工作团队列表
      fetchWorkTeamList();
    } else {
      ElMessage.error(response.message || '创建工作团队失败');
    }
  } catch {
    ElMessage.error('表单验证失败或API调用出错');
  }
};

// 编辑工作团队
const handleEdit = (row: WorkTeamApi.WorkTeamInfo) => {
  router.push(`/basic-data/work-team-management/edit/${row.id}`);
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
            v-model="searchForm.teamName"
            placeholder="团队名称"
            clearable
            style="width: 200px"
          />
          <ElSelect
            v-model="searchForm.status"
            placeholder="状态"
            clearable
            style="width: 200px"
          >
            <ElOption label="正常" value="ACTIVE" />
            <ElOption label="停用" value="INACTIVE" />
            <ElOption label="已删除" value="DELETED" />
          </ElSelect>
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
          prop="caseNumber"
          label="案号"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.caseNumber">{{ row.caseNumber }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="caseName"
          label="案件名称"
          width="200"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.caseName">{{ row.caseName }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="teamLeaderName"
          label="团队负责人"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.teamLeaderName">{{ row.teamLeaderName }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="memberCount"
          label="成员数量"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span>{{ row.memberCount || 0 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="teamMembers"
          label="团队成员"
          width="200"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.teamMembers">{{ row.teamMembers }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="teamDescription"
          label="团队描述"
          width="200"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.teamDescription">{{ row.teamDescription }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="creator"
          label="创建者"
          width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.creator">{{ row.creator }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="createTime"
          label="创建时间"
          width="180"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.createTime">{{ row.createTime }}</span>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.status === 'ACTIVE' ? '活跃' : '停用' }}</span>
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
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
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
        <ElForm
          :model="addFormData"
          :rules="addFormRules"
          label-width="120px"
          class="mb-4"
        >
          <ElFormItem label="案号" prop="caseId">
            <ElSelect
              v-model="addFormData.caseId"
              placeholder="请选择案号"
              style="width: 100%"
              filterable
              remote
              :loading="caseSearchLoading"
              :remote-method="remoteSearchCase"
              clearable
            >
              <ElOption
                v-for="caseItem in caseList"
                :key="caseItem.value"
                :label="caseItem.label"
                :value="caseItem.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="团队名称" prop="teamName">
            <ElInput
              v-model="addFormData.teamName"
              placeholder="请输入团队名称"
            />
          </ElFormItem>
          <ElFormItem label="团队负责人" prop="teamLeader">
            <ElInput
              v-model="addFormData.teamLeader"
              placeholder="请输入团队负责人"
            />
          </ElFormItem>
          <ElFormItem label="团队描述" prop="teamDescription">
            <ElInput
              v-model="addFormData.teamDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入团队描述"
            />
          </ElFormItem>
          <ElFormItem label="团队成员" prop="teamMembers">
            <ElSelect
              v-model="addFormData.teamMembers"
              multiple
              filterable
              allow-create
              placeholder="请选择团队成员（可多选，支持模糊查询）"
              style="width: 100%"
            >
              <ElOption
                v-for="member in memberList"
                :key="member.value"
                :label="member.label"
                :value="member.value"
              />
            </ElSelect>
            <div class="mt-1 text-sm text-gray-500">
              提示：可输入关键词快速搜索成员，支持多选
            </div>
          </ElFormItem>
          <ElFormItem label="状态" prop="status">
            <ElSelect
              v-model="addFormData.status"
              placeholder="请选择状态"
              style="width: 100%"
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
