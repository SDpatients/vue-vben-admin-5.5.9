<script lang="ts" setup>
import type { WorkTeamApi } from '#/api/core';

import { onMounted, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
} from 'element-plus';

import { getCaseListApi } from '#/api/core/case';
import { getManagerListApi } from '#/api/core/manager';
import { getUserByDeptIdApi } from '#/api/core/user';
import {
  addTeamMemberApi,
  createWorkTeamApi,
  deleteTeamMemberApi,
  deleteWorkTeamApi,
  getWorkTeamDetailWithMembersApi,
  getWorkTeamListApi,
  updateTeamMemberApi,
} from '#/api/core/work-team';

const activeTab = ref('team');

const workTeamList = ref<WorkTeamApi.WorkTeamInfo[]>([]);
const currentTeam = ref<null | WorkTeamApi.WorkTeamDetail>(null);
const teamMembers = ref<WorkTeamApi.TeamMemberInfo[]>([]);

const loading = ref(false);
const membersLoading = ref(false);

const searchForm = reactive({
  caseId: undefined as number | undefined,
  status: '',
  teamName: '',
  teamLeaderId: undefined as number | undefined,
});

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const addTeamDialogVisible = ref(false);
const addMemberDialogVisible = ref(false);
const editMemberDialogVisible = ref(false);

const addTeamFormData = reactive({
  caseId: '',
  teamName: '',
  teamLeaderId: '',
  teamDescription: '',
});

// 团队负责人列表
const teamLeaderList = ref<{ label: string; value: string }[]>([]);
const teamLeaderSearchLoading = ref(false);

const addMemberFormData = reactive({
  teamId: 0,
  caseId: 0,
  userId: '',
  teamRole: '',
  permissionLevel: 'VIEW' as WorkTeamApi.PermissionLevel,
});

const editMemberFormData = reactive({
  memberId: 0,
  userId: '',
  userName: '',
  deptId: '',
  deptName: '',
  teamRole: '',
  permissionLevel: 'VIEW' as WorkTeamApi.PermissionLevel,
});

const administrators = ref<any[]>([]);
const loadingAdministrators = ref(false);
const selectedDeptId = ref<number | undefined>(undefined);
const selectedUser = ref<any>(null);
const availableUsers = ref<any[]>([]);
const loadingUsers = ref(false);

const addTeamFormRules = {
  caseId: [{ required: true, message: '请选择案件', trigger: 'change' }],
  teamName: [{ required: true, message: '请输入团队名称', trigger: 'blur' }],
  teamLeaderId: [
    { required: true, message: '请选择团队负责人', trigger: 'change' },
  ],
};

const addMemberFormRules = {
  userId: [{ required: true, message: '请选择工作人员', trigger: 'change' }],
  teamRole: [{ required: true, message: '请选择团队角色', trigger: 'change' }],
};

const caseList = ref<{ label: string; value: string }[]>([]);
const caseSearchLoading = ref(false);

const memberList = ref<any[]>([]);
const memberSearchLoading = ref(false);

const addTeamFormRef = ref();
const addMemberFormRef = ref();

const fetchWorkTeamList = async () => {
  loading.value = true;
  try {
    const params: WorkTeamApi.WorkTeamQueryParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm,
    };

    const data = await getWorkTeamListApi(params);

    workTeamList.value = data.list || [];
    pagination.total = data.total || 0;
  } catch {
    ElMessage.error('获取工作团队列表失败');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (pageNum: number) => {
  pagination.pageNum = pageNum;
  fetchWorkTeamList();
};

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.pageNum = 1;
  fetchWorkTeamList();
};

const handleSearch = () => {
  pagination.pageNum = 1;
  fetchWorkTeamList();
};

const handleReset = () => {
  searchForm.caseId = undefined;
  searchForm.status = '';
  searchForm.teamName = '';
  searchForm.teamLeaderId = undefined;
  pagination.pageNum = 1;
  fetchWorkTeamList();
};

const remoteSearchCase = async (query: string) => {
  if (query === '') {
    caseList.value = [];
    return;
  }

  caseSearchLoading.value = true;
  try {
    const data = await getCaseListApi({
      page: 1,
      size: 10,
      caseNumber: query,
    });

    caseList.value = data.list.map((caseItem) => ({
      label: caseItem.caseNumber,
      value: caseItem.id.toString(),
    }));
  } catch {
    caseList.value = [];
    ElMessage.error('获取案件列表失败');
  } finally {
    caseSearchLoading.value = false;
  }
};

const fetchCaseList = async () => {
  caseSearchLoading.value = true;
  try {
    const data = await getCaseListApi({
      page: 1,
      size: 10,
    });

    caseList.value = data.list.map((caseItem) => ({
      label: caseItem.caseNumber,
      value: caseItem.id.toString(),
    }));
  } catch {
    ElMessage.error('获取案件列表失败');
  } finally {
    caseSearchLoading.value = false;
  }
};

const fetchMemberList = async (administratorId: number) => {
  memberSearchLoading.value = true;
  try {
    const data = await getUserByDeptIdApi(administratorId);

    if (data.data && Array.isArray(data.data.data)) {
      memberList.value = data.data.data
        .filter((user) => user && user.userId != null)
        .map((user) => ({
          label: user.name,
          value: user.userId.toString(),
        }));
    } else if (data.data && Array.isArray(data.data)) {
      memberList.value = data.data
        .filter((user) => user && user.userId != null)
        .map((user) => ({
          label: user.name,
          value: user.userId.toString(),
        }));
    } else {
      memberList.value = [];
    }
  } catch {
    memberList.value = [];
    ElMessage.error('获取工作人员列表失败');
  } finally {
    memberSearchLoading.value = false;
  }
};

const loadAdministrators = async () => {
  loadingAdministrators.value = true;
  try {
    const response = await getManagerListApi({});
    if (response.data && response.data.list) {
      administrators.value = response.data.list
        .filter((admin: any) => admin && admin.id != null)
        .map((admin: any) => ({
          ...admin,
          sepId: admin.id,
        }));
    }
  } catch (error) {
    console.error('获取管理员机构失败:', error);
    ElMessage.error('获取管理员机构失败');
  } finally {
    loadingAdministrators.value = false;
  }
};

const loadUsersByDeptId = async (deptId: number, includeExisting = false) => {
  if (!deptId || Number.isNaN(deptId)) {
    availableUsers.value = [];
    return;
  }

  loadingUsers.value = true;
  try {
    const response = await getUserByDeptIdApi(deptId);

    let userList = [];
    if (
      response.code === 200 &&
      response.data &&
      Array.isArray(response.data)
    ) {
      userList = response.data;
    } else if (response.data && Array.isArray(response.data)) {
      userList = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      userList = response.data.data;
    }

    let filteredUsers = userList.filter((user) => user && user.userId != null);

    if (!includeExisting) {
      filteredUsers = filteredUsers.filter((user) => {
        const isMemberInTeam = teamMembers.value.some(
          (member) => member.userId === user.userId,
        );
        return !isMemberInTeam;
      });
    }

    availableUsers.value = filteredUsers.map((user) => ({
      ...user,
      uPid: user.userId,
      uName: user.name,
      uUser: user.name,
    }));
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
    availableUsers.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

watch(selectedDeptId, async (newVal) => {
  if (newVal) {
    await loadUsersByDeptId(newVal);
    selectedUser.value = null;
  }
});

watch(selectedUser, (newVal) => {
  addMemberFormData.userId = newVal ? newVal.uPid.toString() : '';
});

// 获取团队负责人列表
const fetchTeamLeaderList = async () => {
  teamLeaderSearchLoading.value = true;
  try {
    // 这里需要根据实际情况获取管理人ID，暂时使用mock数据
    const administratorId = 1; // 实际应用中应该从当前用户或其他地方获取
    const data = await getUserByDeptIdApi(administratorId);

    let staffList = [];
    if (data.data && Array.isArray(data.data)) {
      // 直接返回数组的响应结构
      staffList = data.data;
    } else if (data.data && data.data.list && Array.isArray(data.data.list)) {
      // 包含data.list的响应结构
      staffList = data.data.list;
    }

    teamLeaderList.value = staffList
      .filter((staff) => staff && staff.userId != null)
      .map((staff) => ({
        label: staff.name,
        value: staff.userId.toString(),
      }));
  } catch {
    teamLeaderList.value = [];
    ElMessage.error('获取团队负责人列表失败');
  } finally {
    teamLeaderSearchLoading.value = false;
  }
};

const handleAddTeam = async () => {
  addTeamDialogVisible.value = true;
  Object.assign(addTeamFormData, {
    caseId: '',
    teamName: '',
    teamLeaderId: '',
    teamDescription: '',
  });
  await fetchCaseList();
  await fetchTeamLeaderList();
};

const handleCloseAddTeamDialog = () => {
  addTeamDialogVisible.value = false;
  addTeamFormRef.value?.resetFields();
};

const handleSaveAddTeam = async () => {
  try {
    await addTeamFormRef.value?.validate();

    const apiData: WorkTeamApi.CreateWorkTeamRequest = {
      teamName: addTeamFormData.teamName,
      teamLeaderId: Number.parseInt(addTeamFormData.teamLeaderId),
      caseId: Number.parseInt(addTeamFormData.caseId),
      teamDescription: addTeamFormData.teamDescription,
    };

    await createWorkTeamApi(apiData);
    ElMessage.success('工作团队创建成功');
    handleCloseAddTeamDialog();
    fetchWorkTeamList();
  } catch {
    ElMessage.error('表单验证失败或API调用出错');
  }
};

const handleViewTeam = async (row: WorkTeamApi.WorkTeamInfo) => {
  membersLoading.value = true;
  try {
    const data = await getWorkTeamDetailWithMembersApi(row.id);

    currentTeam.value = data;
    teamMembers.value = data.members || [];
    activeTab.value = 'members';

    if (row.teamLeaderId) {
      await fetchMemberList(row.teamLeaderId);
    }
  } catch {
    ElMessage.error('获取团队详情失败');
  } finally {
    membersLoading.value = false;
  }
};

const handleAddMember = async () => {
  if (!currentTeam.value) {
    ElMessage.warning('请先选择一个工作团队');
    return;
  }

  await loadAdministrators();

  addMemberDialogVisible.value = true;
  Object.assign(addMemberFormData, {
    teamId: currentTeam.value.id,
    caseId: currentTeam.value.caseId,
    userId: '',
    teamRole: '',
    permissionLevel: 'VIEW',
  });

  selectedDeptId.value = undefined;
  selectedUser.value = null;
  availableUsers.value = [];
};

watch(
  () => addMemberFormData.teamRole,
  (newRole) => {
    switch (newRole) {
      case 'GUEST': {
        addMemberFormData.permissionLevel = 'VIEW';

        break;
      }
      case 'LEADER': {
        addMemberFormData.permissionLevel = 'ADMIN';

        break;
      }
      case 'MEMBER': {
        addMemberFormData.permissionLevel = 'ADMIN';

        break;
      }
      // No default
    }
  },
);

watch(
  () => editMemberFormData.teamRole,
  (newRole) => {
    switch (newRole) {
      case 'GUEST': {
        editMemberFormData.permissionLevel = 'VIEW';

        break;
      }
      case 'LEADER': {
        editMemberFormData.permissionLevel = 'ADMIN';

        break;
      }
      case 'MEMBER': {
        editMemberFormData.permissionLevel = 'ADMIN';

        break;
      }
      // No default
    }
  },
);

const handleCloseAddMemberDialog = () => {
  addMemberDialogVisible.value = false;
  addMemberFormRef.value?.resetFields();
};

const handleSaveAddMember = async () => {
  try {
    await addMemberFormRef.value?.validate();

    const apiData: WorkTeamApi.AddTeamMemberRequest = {
      caseId: addMemberFormData.caseId,
      userId: Number.parseInt(addMemberFormData.userId),
      teamRole: addMemberFormData.teamRole,
      permissionLevel: addMemberFormData.permissionLevel,
    };

    await addTeamMemberApi(addMemberFormData.teamId, apiData);
    ElMessage.success('团队成员添加成功');
    handleCloseAddMemberDialog();
    if (currentTeam.value) {
      await handleViewTeam(currentTeam.value as WorkTeamApi.WorkTeamInfo);
    }
  } catch {
    ElMessage.error('表单验证失败或API调用出错');
  }
};

const handleEditMember = async (row: WorkTeamApi.TeamMemberInfo) => {
  await loadAdministrators();

  editMemberDialogVisible.value = true;
  Object.assign(editMemberFormData, {
    memberId: row.id,
    userId: row.userId?.toString() || '',
    userName: row.userRealName || row.userName || '',
    deptId: '',
    deptName: '',
    teamRole: row.teamRole || '',
    permissionLevel: row.permissionLevel || 'VIEW',
  });

  if (administrators.value.length > 0) {
    selectedDeptId.value = administrators.value[0].sepId;
    await loadUsersByDeptId(selectedDeptId.value, true);

    const currentUser = availableUsers.value.find(
      (user) => user.uPid === row.userId,
    );
    if (currentUser) {
      editMemberFormData.deptId = selectedDeptId.value?.toString() || '';
      editMemberFormData.deptName =
        administrators.value[0].administratorName || '';
    }
  }
};

const handleCloseEditMemberDialog = () => {
  editMemberDialogVisible.value = false;
};

const handleSaveEditMember = async () => {
  try {
    await updateTeamMemberApi(editMemberFormData.memberId, {
      teamRole: editMemberFormData.teamRole,
      permissionLevel: editMemberFormData.permissionLevel,
    });
    ElMessage.success('团队成员信息更新成功');
    handleCloseEditMemberDialog();
    if (currentTeam.value) {
      await handleViewTeam(currentTeam.value as WorkTeamApi.WorkTeamInfo);
    }
  } catch {
    ElMessage.error('API调用出错');
  }
};

const handleDeleteMember = async (row: WorkTeamApi.TeamMemberInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该团队成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteTeamMemberApi(row.id);
    ElMessage.success('团队成员删除成功');
    if (currentTeam.value) {
      await handleViewTeam(currentTeam.value as WorkTeamApi.WorkTeamInfo);
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除团队成员失败');
    }
  }
};

const handleDeleteTeam = async (row: WorkTeamApi.WorkTeamInfo) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该工作团队吗？删除后团队成员也将被删除。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    await deleteWorkTeamApi(row.id);
    ElMessage.success('工作团队删除成功');
    fetchWorkTeamList();
    if (currentTeam.value?.id === row.id) {
      currentTeam.value = null;
      teamMembers.value = [];
      activeTab.value = 'team';
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除工作团队失败');
    }
  }
};

const handleTabChange = (tabName: string) => {
  if (tabName === 'members' && !currentTeam.value) {
    ElMessage.warning('请先选择一个工作团队');
    activeTab.value = 'team';
  }
};

onMounted(() => {
  fetchWorkTeamList();
});
</script>

<template>
  <div class="p-6">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">工作团队管理</span>
          <ElButton type="primary" @click="handleAddTeam">
            <i class="i-lucide-plus mr-1"></i>
            新增工作团队
          </ElButton>
        </div>
      </template>

      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="工作团队列表" name="team">
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
                <ElOption label="活跃" value="ACTIVE" />
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

          <ElTable v-loading="loading" :data="workTeamList" border stripe>
            <ElTableColumn
              type="index"
              label="序号"
              width="60"
              align="center"
            />
            <ElTableColumn
              prop="teamName"
              label="团队名称"
              width="150"
              align="center"
            />
            <ElTableColumn
              prop="caseName"
              label="案件名称"
              width="200"
              align="center"
              show-overflow-tooltip
            />
            <ElTableColumn
              prop="teamLeaderName"
              label="团队负责人"
              width="120"
              align="center"
            />
            <ElTableColumn
              prop="memberCount"
              label="成员数量"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span>{{ row.memberCount || 0 }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="teamDescription"
              label="团队描述"
              min-width="200"
              show-overflow-tooltip
            />
            <ElTableColumn
              prop="status"
              label="状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span
                  :class="
                    row.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'
                  "
                >
                  {{ row.status === 'ACTIVE' ? '活跃' : '停用' }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="createTime"
              label="创建时间"
              width="180"
              align="center"
            />
            <ElTableColumn
              label="操作"
              width="200"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <ElButton
                  type="primary"
                  size="small"
                  @click="handleViewTeam(row)"
                >
                  <i class="i-lucide-users mr-1"></i>
                  查看成员
                </ElButton>
                <ElButton
                  type="danger"
                  size="small"
                  @click="handleDeleteTeam(row)"
                >
                  <i class="i-lucide-trash-2 mr-1"></i>
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

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
        </ElTabPane>

        <ElTabPane label="工作人员列表" name="members">
          <div v-if="currentTeam" class="mb-4">
            <div class="rounded-lg bg-blue-50 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ currentTeam.teamName }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    案件：{{ currentTeam.caseName }} | 负责人：{{
                      currentTeam.teamLeaderName
                    }}
                  </p>
                </div>
                <ElButton type="primary" @click="handleAddMember">
                  <i class="i-lucide-plus mr-1"></i>
                  新增工作人员
                </ElButton>
              </div>
            </div>
          </div>

          <div v-else class="mb-4 rounded-lg bg-yellow-50 p-4 text-center">
            <p class="text-yellow-700">
              请先从工作团队列表中选择一个团队查看工作人员
            </p>
          </div>

          <ElTable v-loading="membersLoading" :data="teamMembers" border stripe>
            <ElTableColumn
              type="index"
              label="序号"
              width="60"
              align="center"
            />
            <ElTableColumn
              prop="userName"
              label="用户名"
              width="120"
              align="center"
            />
            <ElTableColumn
              prop="userRealName"
              label="真实姓名"
              width="120"
              align="center"
            />
            <ElTableColumn
              prop="teamRole"
              label="团队角色"
              width="120"
              align="center"
            />
            <ElTableColumn
              prop="permissionLevel"
              label="权限级别"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span>{{ row.permissionLevel || 'VIEW' }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="isActive"
              label="激活状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span
                  :class="
                    row.isActive === 1 ? 'text-green-600' : 'text-gray-600'
                  "
                >
                  {{ row.isActive === 1 ? '已激活' : '未激活' }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="status"
              label="状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span
                  :class="
                    row.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'
                  "
                >
                  {{ row.status === 'ACTIVE' ? '活跃' : '停用' }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="createTime"
              label="加入时间"
              width="180"
              align="center"
            />
            <ElTableColumn
              label="操作"
              width="150"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <ElButton
                  type="primary"
                  size="small"
                  @click="handleEditMember(row)"
                >
                  <i class="i-lucide-edit mr-1"></i>
                  编辑
                </ElButton>
                <ElButton
                  type="danger"
                  size="small"
                  @click="handleDeleteMember(row)"
                >
                  <i class="i-lucide-trash-2 mr-1"></i>
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <ElDialog
      v-model="addTeamDialogVisible"
      title="新增工作团队"
      width="600px"
      :before-close="handleCloseAddTeamDialog"
    >
      <ElForm
        ref="addTeamFormRef"
        :model="addTeamFormData"
        :rules="addTeamFormRules"
        label-width="120px"
      >
        <ElFormItem label="案件" prop="caseId">
          <ElSelect
            v-model="addTeamFormData.caseId"
            placeholder="请选择案件"
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
            v-model="addTeamFormData.teamName"
            placeholder="请输入团队名称"
          />
        </ElFormItem>
        <ElFormItem label="团队负责人" prop="teamLeaderId">
          <ElSelect
            v-model="addTeamFormData.teamLeaderId"
            placeholder="请选择团队负责人"
            style="width: 100%"
            filterable
            clearable
            :loading="teamLeaderSearchLoading"
          >
            <ElOption
              v-for="leader in teamLeaderList"
              :key="leader.value"
              :label="leader.label"
              :value="leader.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="团队描述" prop="teamDescription">
          <ElInput
            v-model="addTeamFormData.teamDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入团队描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <ElButton @click="handleCloseAddTeamDialog">取消</ElButton>
          <ElButton type="primary" @click="handleSaveAddTeam">保存</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="addMemberDialogVisible"
      title="新增工作人员"
      width="600px"
      :before-close="handleCloseAddMemberDialog"
    >
      <ElForm
        ref="addMemberFormRef"
        :model="addMemberFormData"
        :rules="addMemberFormRules"
        label-width="120px"
      >
        <ElFormItem label="管理员机构" prop="deptId">
          <ElSelect
            v-model="selectedDeptId"
            placeholder="请选择管理员机构"
            style="width: 100%"
            :loading="loadingAdministrators"
            clearable
          >
            <ElOption
              v-for="admin in administrators"
              :key="admin.sepId"
              :label="admin.administratorName"
              :value="admin.sepId"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="工作人员" prop="userId">
          <ElSelect
            v-model="selectedUser"
            placeholder="请先选择管理员机构"
            style="width: 100%"
            :loading="loadingUsers"
            clearable
            :disabled="!selectedDeptId"
          >
            <ElOption
              v-for="user in availableUsers"
              :key="user.uPid"
              :label="user.uName"
              :value="user"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="团队角色" prop="teamRole">
          <ElSelect
            v-model="addMemberFormData.teamRole"
            placeholder="请选择团队角色"
            style="width: 100%"
          >
            <ElOption label="负责人" value="LEADER" />
            <ElOption label="成员" value="MEMBER" />
            <ElOption label="访客" value="GUEST" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限级别">
          <ElSelect
            v-model="addMemberFormData.permissionLevel"
            placeholder="权限级别"
            style="width: 100%"
            disabled
          >
            <ElOption label="查看" value="VIEW" />
            <ElOption label="编辑" value="EDIT" />
            <ElOption label="管理" value="ADMIN" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <ElButton @click="handleCloseAddMemberDialog">取消</ElButton>
          <ElButton type="primary" @click="handleSaveAddMember">保存</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="editMemberDialogVisible"
      title="编辑工作人员"
      width="600px"
      :before-close="handleCloseEditMemberDialog"
    >
      <ElForm :model="editMemberFormData" label-width="120px">
        <ElFormItem label="管理员机构">
          <ElInput
            v-model="editMemberFormData.deptName"
            placeholder="管理员机构"
            disabled
          />
        </ElFormItem>
        <ElFormItem label="工作人员">
          <ElInput
            v-model="editMemberFormData.userName"
            placeholder="工作人员"
            disabled
          />
        </ElFormItem>
        <ElFormItem label="团队角色">
          <ElSelect
            v-model="editMemberFormData.teamRole"
            placeholder="请选择团队角色"
            style="width: 100%"
          >
            <ElOption label="负责人" value="LEADER" />
            <ElOption label="成员" value="MEMBER" />
            <ElOption label="访客" value="GUEST" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限级别">
          <ElSelect
            v-model="editMemberFormData.permissionLevel"
            placeholder="权限级别"
            style="width: 100%"
            disabled
          >
            <ElOption label="查看" value="VIEW" />
            <ElOption label="编辑" value="EDIT" />
            <ElOption label="管理" value="ADMIN" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <ElButton @click="handleCloseEditMemberDialog">取消</ElButton>
          <ElButton type="primary" @click="handleSaveEditMember">保存</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
