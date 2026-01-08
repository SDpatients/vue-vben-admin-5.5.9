<script setup lang="ts">
import type { WorkTeamApi } from '#/api';

import { onMounted, ref } from 'vue';

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
  ElPopconfirm,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElTag,
} from 'element-plus';

import {
  addOneCaseApi,
  deleteCaseApi,
  getAllCasesApi,
  updateCaseApi,
} from '#/api/core/case';
import {
  addTeamMemberApi,
  canAccessCaseApi,
  checkCasePermissionApi,
  getAllTeamRolesApi,
  getMemberPermissionsApi,
  getMyAccessibleCasesApi,
  getTeamMembersApi,
  removeTeamMemberApi,
  saveMemberPermissionsApi,
  selectMyCasesApi,
  selectTeamCasesApi,
  setTeamMembersApi,
  updateTeamMemberApi,
} from '#/api/core/work-team';

const activeTab = ref('cases');
const loading = ref(false);

interface CaseItem {
  案件单据号?: number;
  sepId?: number;
  案号?: string;
  ah?: string;
  案件名称?: string;
  ajmc?: string;
  案由?: string;
  ay?: string;
  受理法院?: string;
  slfy?: string;
  案件进度?: string;
  创建者?: string;
  creatorId?: number;
  reviewStatus?: string;
  [key: string]: any;
}

const cases = ref<CaseItem[]>([]);
const teamMembers = ref<WorkTeamApi.TeamMemberInfo[]>([]);
const teamRoles = ref<WorkTeamApi.TeamRoleInfo[]>([]);
const accessibleCases = ref<WorkTeamApi.AccessibleCaseInfo[]>([]);
const memberPermissions = ref<WorkTeamApi.MemberPermissionInfo[]>([]);

const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

const caseQueryTab = ref('all');

const selectedCase = ref<CaseItem | null>(null);
const selectedMember = ref<null | WorkTeamApi.TeamMemberInfo>(null);

const addCaseDialogVisible = ref(false);
const editCaseDialogVisible = ref(false);
const addMemberDialogVisible = ref(false);
const editMemberDialogVisible = ref(false);
const permissionsDialogVisible = ref(false);
const checkPermissionDialogVisible = ref(false);

const addCaseForm = ref({
  ah: '',
  ajmc: '',
  ay: '',
  slfy: '',
  larq: '',
});

const editCaseForm = ref({
  sepId: 0,
  ah: '',
  ajmc: '',
  ay: '',
  slfy: '',
  larq: '',
});

const addMemberForm = ref({
  caseId: 0,
  userId: 0,
  roleId: 0,
  permissionLevel: 'VIEW',
  isActive: true,
});

const editMemberForm = ref({
  id: 0,
  caseId: 0,
  userId: 0,
  roleId: 0,
  permissionLevel: 'VIEW',
  isActive: true,
});

const permissionForm = ref({
  memberId: 0,
  permissions: [] as Array<{
    isAllowed: boolean;
    moduleType: string;
    permissionType: string;
  }>,
});

const checkPermissionForm = ref({
  caseId: 0,
  permission: 'VIEW',
});

const checkPermissionResult = ref<boolean | null>(null);

const moduleTypes = [
  { value: 'DEBTOR', label: '债务人' },
  { value: 'CREDITOR', label: '债权人' },
  { value: 'DOCUMENT', label: '文档' },
  { value: 'CLAIM', label: '债权' },
  { value: 'FUND', label: '资金' },
  { value: 'TASK', label: '任务' },
];

const permissionTypes = [
  { value: 'VIEW', label: '查看' },
  { value: 'EDIT', label: '编辑' },
  { value: 'DELETE', label: '删除' },
  { value: 'FULL', label: '完全' },
];

const fetchCases = async () => {
  loading.value = true;
  try {
    let response;
    if (caseQueryTab.value === 'my') {
      response = await selectMyCasesApi(
        pagination.value.page,
        pagination.value.pageSize,
      );
    } else if (caseQueryTab.value === 'team') {
      response = await selectTeamCasesApi(
        pagination.value.page,
        pagination.value.pageSize,
      );
    } else {
      response = await getAllCasesApi({
        page: pagination.value.page,
        size: pagination.value.pageSize,
      });
    }

    if (response.status === '1' && response.data) {
      cases.value = response.data.records || [];
      pagination.value.itemCount = response.data.count || 0;
      pagination.value.pages = response.data.pages || 0;
      ElMessage.success('案件列表加载成功');
    } else {
      ElMessage.error(response.msg || '加载案件列表失败');
    }
  } catch (error) {
    console.error('加载案件列表失败:', error);
    ElMessage.error('加载案件列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchTeamMembers = async (caseId: number) => {
  loading.value = true;
  try {
    const response = await getTeamMembersApi(caseId);
    if (response.code === 200) {
      teamMembers.value = response.data || [];
      ElMessage.success('团队成员加载成功');
    } else {
      ElMessage.error(response.message || '加载团队成员失败');
    }
  } catch {
    ElMessage.error('加载团队成员失败');
  } finally {
    loading.value = false;
  }
};

const fetchTeamRoles = async () => {
  try {
    const response = await getAllTeamRolesApi();
    if (response.code === 200) {
      teamRoles.value = response.data || [];
    }
  } catch {
    ElMessage.error('加载团队角色失败');
  }
};

const fetchAccessibleCases = async () => {
  try {
    const response = await getMyAccessibleCasesApi();
    if (response.code === 200) {
      accessibleCases.value = response.data || [];
    }
  } catch {
    ElMessage.error('加载可访问案件失败');
  }
};

const fetchMemberPermissions = async (memberId: number) => {
  try {
    const response = await getMemberPermissionsApi(memberId);
    if (response.code === 200) {
      memberPermissions.value = response.data || [];
      return response.data;
    }
    return [];
  } catch {
    ElMessage.error('加载成员权限失败');
    return [];
  }
};

const handleCaseTabChange = (tab: string) => {
  caseQueryTab.value = tab;
  pagination.value.page = 1;
  fetchCases();
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchCases();
};

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchCases();
};

const openAddCaseDialog = () => {
  addCaseForm.value = { ah: '', ajmc: '', ay: '', slfy: '', larq: '' };
  addCaseDialogVisible.value = true;
};

const openEditCaseDialog = (row: CaseItem) => {
  const caseId = row.案件单据号 || row.sepId || 0;
  editCaseForm.value = {
    sepId: caseId,
    ah: row.案号 || row.ah || '',
    ajmc: row.案件名称 || row.ajmc || '',
    ay: row.案由 || row.ay || '',
    slfy: row.受理法院 || row.slfy || '',
    larq: '',
  };
  editCaseDialogVisible.value = true;
};

const handleAddCase = async () => {
  if (!addCaseForm.value.ah || !addCaseForm.value.ajmc) {
    ElMessage.warning('请填写案号和案件名称');
    return;
  }

  loading.value = true;
  try {
    const response = await addOneCaseApi(addCaseForm.value);
    if (response.status === '1') {
      ElMessage.success('案件添加成功');
      addCaseDialogVisible.value = false;
      fetchCases();
    } else {
      ElMessage.error(response.error || '添加案件失败');
    }
  } catch {
    ElMessage.error('添加案件失败');
  } finally {
    loading.value = false;
  }
};

const handleUpdateCase = async () => {
  if (!editCaseForm.value.sepId) {
    ElMessage.warning('案件ID不存在');
    return;
  }

  loading.value = true;
  try {
    const response = await updateCaseApi({
      AJID: String(editCaseForm.value.sepId),
      AH: editCaseForm.value.ah,
      AJMC: editCaseForm.value.ajmc,
      AY: editCaseForm.value.ay,
      SLFY: editCaseForm.value.slfy,
      LARQ: editCaseForm.value.larq,
    });
    if (response.status === '1') {
      ElMessage.success('案件更新成功');
      editCaseDialogVisible.value = false;
      fetchCases();
    } else {
      ElMessage.error(response.error || '更新案件失败');
    }
  } catch {
    ElMessage.error('更新案件失败');
  } finally {
    loading.value = false;
  }
};

const handleDeleteCase = async (caseId: number) => {
  loading.value = true;
  try {
    const response = await deleteCaseApi(caseId);
    if (response.status === '1') {
      ElMessage.success('案件删除成功');
      fetchCases();
    } else {
      ElMessage.error(response.error || '删除案件失败');
    }
  } catch {
    ElMessage.error('删除案件失败');
  } finally {
    loading.value = false;
  }
};

const openAddMemberDialog = () => {
  if (!selectedCase.value) {
    ElMessage.warning('请先选择一个案件');
    return;
  }
  const caseId = selectedCase.value.案件单据号 || selectedCase.value.sepId || 0;
  addMemberForm.value = {
    caseId,
    userId: 0,
    roleId: 0,
    permissionLevel: 'VIEW',
    isActive: true,
  };
  addMemberDialogVisible.value = true;
};

const openEditMemberDialog = (member: WorkTeamApi.TeamMemberInfo) => {
  const role = teamRoles.value.find((r) => r.roleCode === member.teamRole);
  editMemberForm.value = {
    id: member.id,
    caseId: member.caseId,
    userId: member.userId,
    roleId: role?.roleId || 0,
    permissionLevel: member.permissionLevel,
    isActive: member.isActive,
  };
  editMemberDialogVisible.value = true;
};

const handleAddMember = async () => {
  if (!addMemberForm.value.caseId || !addMemberForm.value.userId) {
    ElMessage.warning('请选择案件和用户');
    return;
  }

  loading.value = true;
  try {
    const response = await addTeamMemberApi(addMemberForm.value);
    if (response.code === 200) {
      ElMessage.success('团队成员添加成功');
      addMemberDialogVisible.value = false;
      fetchTeamMembers(addMemberForm.value.caseId);
    } else {
      ElMessage.error(response.message || '添加团队成员失败');
    }
  } catch {
    ElMessage.error('添加团队成员失败');
  } finally {
    loading.value = false;
  }
};

const handleUpdateMember = async () => {
  if (!editMemberForm.value.id) {
    ElMessage.warning('成员ID不存在');
    return;
  }

  loading.value = true;
  try {
    const response = await updateTeamMemberApi(editMemberForm.value);
    if (response.code === 200) {
      ElMessage.success('团队成员更新成功');
      editMemberDialogVisible.value = false;
      fetchTeamMembers(editMemberForm.value.caseId);
    } else {
      ElMessage.error(response.message || '更新团队成员失败');
    }
  } catch {
    ElMessage.error('更新团队成员失败');
  } finally {
    loading.value = false;
  }
};

const handleRemoveMember = async (memberId: number, caseId: number) => {
  loading.value = true;
  try {
    const response = await removeTeamMemberApi(memberId);
    if (response.code === 200) {
      ElMessage.success('团队成员移除成功');
      fetchTeamMembers(caseId);
    } else {
      ElMessage.error(response.message || '移除团队成员失败');
    }
  } catch {
    ElMessage.error('移除团队成员失败');
  } finally {
    loading.value = false;
  }
};

const handleSetTeamMembers = async (caseId: number) => {
  if (teamMembers.value.length === 0) {
    ElMessage.warning('请先添加团队成员');
    return;
  }

  loading.value = true;
  try {
    const members = teamMembers.value.map((m) => ({
      userId: m.userId,
      roleId:
        teamRoles.value.find((r) => r.roleCode === m.teamRole)?.roleId || 0,
    }));

    const response = await setTeamMembersApi({ caseId, members });
    if (response.code === 200) {
      ElMessage.success('团队成员设置成功');
    } else {
      ElMessage.error(response.message || '设置团队成员失败');
    }
  } catch {
    ElMessage.error('设置团队成员失败');
  } finally {
    loading.value = false;
  }
};

const openPermissionsDialog = async (member: WorkTeamApi.TeamMemberInfo) => {
  selectedMember.value = member;
  const existingPermissions = await fetchMemberPermissions(member.id);
  permissionForm.value = {
    memberId: member.id,
    permissions:
      existingPermissions.length > 0
        ? existingPermissions.map((p: any) => ({
            moduleType: p.moduleType,
            permissionType: p.permissionType,
            isAllowed: p.isAllowed,
          }))
        : [
            { moduleType: 'DEBTOR', permissionType: 'VIEW', isAllowed: true },
            { moduleType: 'CREDITOR', permissionType: 'VIEW', isAllowed: true },
          ],
  };
  permissionsDialogVisible.value = true;
};

const addPermissionItem = () => {
  permissionForm.value.permissions.push({
    moduleType: 'DEBTOR',
    permissionType: 'VIEW',
    isAllowed: true,
  });
};

const removePermissionItem = (index: number) => {
  permissionForm.value.permissions.splice(index, 1);
};

const handleSavePermissions = async () => {
  if (!permissionForm.value.memberId) {
    ElMessage.warning('成员ID不存在');
    return;
  }

  loading.value = true;
  try {
    const response = await saveMemberPermissionsApi(permissionForm.value);
    if (response.code === 200) {
      ElMessage.success('权限保存成功');
      permissionsDialogVisible.value = false;
    } else {
      ElMessage.error(response.message || '保存权限失败');
    }
  } catch {
    ElMessage.error('保存权限失败');
  } finally {
    loading.value = false;
  }
};

const openCheckPermissionDialog = () => {
  checkPermissionForm.value = { caseId: 0, permission: 'VIEW' };
  checkPermissionResult.value = null;
  checkPermissionDialogVisible.value = true;
};

const handleCheckPermission = async () => {
  if (!checkPermissionForm.value.caseId) {
    ElMessage.warning('请选择案件');
    return;
  }

  loading.value = true;
  try {
    const response = await checkCasePermissionApi(
      checkPermissionForm.value.caseId,
      checkPermissionForm.value.permission,
    );
    if (response.code === 200) {
      checkPermissionResult.value = response.data;
    } else {
      ElMessage.error(response.message || '检查权限失败');
    }
  } catch {
    ElMessage.error('检查权限失败');
  } finally {
    loading.value = false;
  }
};

const handleCanAccessCase = async () => {
  if (!checkPermissionForm.value.caseId) {
    ElMessage.warning('请选择案件');
    return;
  }

  loading.value = true;
  try {
    const response = await canAccessCaseApi(
      checkPermissionForm.value.caseId,
      checkPermissionForm.value.permission,
    );
    if (response.code === 200) {
      checkPermissionResult.value = response.data;
    } else {
      ElMessage.error(response.message || '检查访问权限失败');
    }
  } catch {
    ElMessage.error('检查访问权限失败');
  } finally {
    loading.value = false;
  }
};

const selectCaseForMember = (row: CaseItem) => {
  selectedCase.value = row;
  const caseId = row.案件单据号 || row.sepId;
  if (caseId) {
    fetchTeamMembers(caseId);
  }
};

const getCaseId = (row: CaseItem) => row.案件单据号 || row.sepId || 0;
const getCaseAh = (row: CaseItem) => row.案号 || row.ah || '';
const getCaseAjmc = (row: CaseItem) => row.案件名称 || row.ajmc || '';

const getCaseProgressType = (
  progress: string,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' => {
  if (!progress) return 'info';
  if (['完成', '已结案', '结束'].includes(progress)) return 'success';
  if (['待启动', '待处理', '待审核'].includes(progress)) return 'warning';
  if (['取消', '失败', '已驳回'].includes(progress)) return 'danger';
  return 'primary';
};

const getPermissionLevelTagType = (
  level: string,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' => {
  const typeMap: Record<
    string,
    'danger' | 'info' | 'primary' | 'success' | 'warning'
  > = {
    VIEW: 'info',
    EDIT: 'warning',
    DELETE: 'danger',
    FULL: 'success',
  };
  return typeMap[level] || 'info';
};

const getPermissionLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    VIEW: '查看',
    EDIT: '编辑',
    DELETE: '删除',
    FULL: '完全',
  };
  return textMap[level] || level;
};

const getTeamRoleName = (roleCode: string) => {
  const role = teamRoles.value.find((r) => r.roleCode === roleCode);
  return role?.roleName || roleCode;
};

onMounted(() => {
  fetchCases();
  fetchTeamRoles();
  fetchAccessibleCases();
});
</script>

<template>
  <div class="case-permission-page p-6">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">案件权限管理</span>
          <ElButton type="primary" @click="fetchCases" :loading="loading">
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <ElTabs v-model="activeTab">
        <ElTabPane label="案件管理" name="cases">
          <div class="tab-content">
            <div class="mb-4 flex items-center justify-between">
              <ElTabs
                v-model="caseQueryTab"
                @tab-change="handleCaseTabChange"
                size="small"
              >
                <ElTabPane label="全部案件" name="all" />
                <ElTabPane label="我的案件" name="my" />
                <ElTabPane label="团队案件" name="team" />
              </ElTabs>
              <ElButton type="primary" size="small" @click="openAddCaseDialog">
                <i class="i-lucide-plus mr-1"></i>
                添加案件
              </ElButton>
            </div>

            <ElTable :data="cases" v-loading="loading" stripe border>
              <ElTableColumn prop="案件单据号" label="案件ID" width="80" />
              <ElTableColumn
                prop="案号"
                label="案号"
                min-width="180"
                show-overflow-tooltip
              />
              <ElTableColumn
                prop="案件名称"
                label="案件名称"
                min-width="200"
                show-overflow-tooltip
              />
              <ElTableColumn
                prop="案由"
                label="案由"
                min-width="150"
                show-overflow-tooltip
              />
              <ElTableColumn prop="案件进度" label="案件进度" width="120">
                <template #default="{ row }">
                  <ElTag :type="getCaseProgressType(row.案件进度)" size="small">
                    {{ row.案件进度 || '未设置' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="创建者" label="创建者" width="120" />
              <ElTableColumn label="操作" min-width="200" fixed="right">
                <template #default="{ row }">
                  <ElButton
                    type="primary"
                    size="small"
                    @click="openEditCaseDialog(row)"
                  >
                    编辑
                  </ElButton>
                  <ElButton
                    type="danger"
                    size="small"
                    @click="handleDeleteCase(getCaseId(row))"
                  >
                    删除
                  </ElButton>
                  <ElButton
                    type="success"
                    size="small"
                    @click="selectCaseForMember(row)"
                  >
                    管理团队
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>

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
          </div>
        </ElTabPane>

        <ElTabPane label="团队成员" name="teamMembers">
          <div class="tab-content">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-sm text-gray-600">
                {{
                  selectedCase
                    ? `当前案件: ${selectedCase.ah || selectedCase.案号 || selectedCase.案件名称}`
                    : '请在案件管理中选择一个案件来管理团队成员'
                }}
              </span>
              <div class="flex space-x-2">
                <ElButton
                  type="primary"
                  size="small"
                  :disabled="!selectedCase"
                  @click="openAddMemberDialog"
                >
                  <i class="i-lucide-plus mr-1"></i>
                  添加成员
                </ElButton>
                <ElButton
                  type="success"
                  size="small"
                  :disabled="!selectedCase"
                  @click="
                    handleSetTeamMembers(
                      selectedCase?.sepId || selectedCase?.案件单据号,
                    )
                  "
                >
                  <i class="i-lucide-save mr-1"></i>
                  保存团队
                </ElButton>
              </div>
            </div>

            <ElTable :data="teamMembers" v-loading="loading" stripe border>
              <ElTableColumn prop="id" label="成员ID" width="80" />
              <ElTableColumn prop="userId" label="用户ID" width="100" />
              <ElTableColumn prop="userName" label="用户名" width="150" />
              <ElTableColumn prop="teamRole" label="团队角色" width="120">
                <template #default="{ row }">
                  {{ getTeamRoleName(row.teamRole) }}
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="permissionLevel"
                label="权限级别"
                width="120"
              >
                <template #default="{ row }">
                  <ElTag
                    :type="getPermissionLevelTagType(row.permissionLevel)"
                    size="small"
                  >
                    {{ getPermissionLevelText(row.permissionLevel) }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="isActive"
                label="是否活跃"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <ElTag :type="row.isActive ? 'success' : 'info'" size="small">
                    {{ row.isActive ? '是' : '否' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" min-width="200" fixed="right">
                <template #default="{ row }">
                  <ElButton
                    type="primary"
                    size="small"
                    @click="openEditMemberDialog(row)"
                  >
                    编辑
                  </ElButton>
                  <ElButton
                    type="warning"
                    size="small"
                    @click="openPermissionsDialog(row)"
                  >
                    权限
                  </ElButton>
                  <ElPopconfirm
                    title="确定要移除此成员吗?"
                    @confirm="handleRemoveMember(row.id, row.caseId)"
                  >
                    <template #reference>
                      <ElButton type="danger" size="small">移除</ElButton>
                    </template>
                  </ElPopconfirm>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElTabPane>

        <ElTabPane label="权限检查" name="permissionCheck">
          <div class="tab-content">
            <ElCard header="权限检查工具" size="small">
              <ElForm :model="checkPermissionForm" label-width="120px">
                <ElFormItem label="选择案件">
                  <ElSelect
                    v-model="checkPermissionForm.caseId"
                    placeholder="选择案件"
                    style="width: 300px"
                  >
                    <ElOption
                      v-for="caseItem in accessibleCases"
                      :key="caseItem.sepId"
                      :label="`${caseItem.ah} - ${caseItem.ajmc}`"
                      :value="caseItem.sepId"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="权限类型">
                  <ElSelect
                    v-model="checkPermissionForm.permission"
                    placeholder="选择权限"
                    style="width: 200px"
                  >
                    <ElOption
                      v-for="perm in permissionTypes"
                      :key="perm.value"
                      :label="perm.label"
                      :value="perm.value"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem>
                  <ElButton
                    type="primary"
                    @click="handleCheckPermission"
                    :loading="loading"
                  >
                    检查案件权限
                  </ElButton>
                  <ElButton
                    type="success"
                    @click="handleCanAccessCase"
                    :loading="loading"
                    style="margin-left: 10px"
                  >
                    检查访问权限
                  </ElButton>
                </ElFormItem>
              </ElForm>

              <div
                v-if="checkPermissionResult !== null"
                class="mt-4 rounded bg-gray-100 p-4"
              >
                <span class="font-semibold">检查结果: </span>
                <ElTag
                  :type="checkPermissionResult ? 'success' : 'danger'"
                  size="large"
                >
                  {{ checkPermissionResult ? '有权限' : '无权限' }}
                </ElTag>
              </div>
            </ElCard>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <!-- 添加案件弹窗 -->
    <ElDialog v-model="addCaseDialogVisible" title="添加案件" width="500px">
      <ElForm :model="addCaseForm" label-width="100px">
        <ElFormItem label="案号" required>
          <ElInput v-model="addCaseForm.ah" placeholder="请输入案号" />
        </ElFormItem>
        <ElFormItem label="案件名称" required>
          <ElInput v-model="addCaseForm.ajmc" placeholder="请输入案件名称" />
        </ElFormItem>
        <ElFormItem label="案由">
          <ElInput v-model="addCaseForm.ay" placeholder="请输入案由" />
        </ElFormItem>
        <ElFormItem label="受理法院">
          <ElInput v-model="addCaseForm.slfy" placeholder="请输入受理法院" />
        </ElFormItem>
        <ElFormItem label="立案日期">
          <ElInput v-model="addCaseForm.larq" placeholder="请输入立案日期" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="addCaseDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddCase" :loading="loading">
          确定
        </ElButton>
      </template>
    </ElDialog>

    <!-- 编辑案件弹窗 -->
    <ElDialog v-model="editCaseDialogVisible" title="编辑案件" width="500px">
      <ElForm :model="editCaseForm" label-width="100px">
        <ElFormItem label="案件ID">
          <ElInput v-model="editCaseForm.sepId" disabled />
        </ElFormItem>
        <ElFormItem label="案号" required>
          <ElInput v-model="editCaseForm.ah" placeholder="请输入案号" />
        </ElFormItem>
        <ElFormItem label="案件名称" required>
          <ElInput v-model="editCaseForm.ajmc" placeholder="请输入案件名称" />
        </ElFormItem>
        <ElFormItem label="案由">
          <ElInput v-model="editCaseForm.ay" placeholder="请输入案由" />
        </ElFormItem>
        <ElFormItem label="受理法院">
          <ElInput v-model="editCaseForm.slfy" placeholder="请输入受理法院" />
        </ElFormItem>
        <ElFormItem label="立案日期">
          <ElInput v-model="editCaseForm.larq" placeholder="请输入立案日期" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editCaseDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleUpdateCase" :loading="loading">
          确定
        </ElButton>
      </template>
    </ElDialog>

    <!-- 添加团队成员弹窗 -->
    <ElDialog
      v-model="addMemberDialogVisible"
      title="添加团队成员"
      width="500px"
    >
      <ElForm :model="addMemberForm" label-width="100px">
        <ElFormItem label="案件ID">
          <ElInput v-model="addMemberForm.caseId" disabled />
        </ElFormItem>
        <ElFormItem label="用户ID" required>
          <ElInput
            v-model.number="addMemberForm.userId"
            type="number"
            placeholder="请输入用户ID"
          />
        </ElFormItem>
        <ElFormItem label="团队角色" required>
          <ElSelect
            v-model="addMemberForm.roleId"
            placeholder="选择角色"
            style="width: 100%"
          >
            <ElOption
              v-for="role in teamRoles"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限级别">
          <ElSelect
            v-model="addMemberForm.permissionLevel"
            placeholder="选择权限级别"
            style="width: 100%"
          >
            <ElOption
              v-for="perm in permissionTypes"
              :key="perm.value"
              :label="perm.label"
              :value="perm.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="是否活跃">
          <ElSwitch v-model="addMemberForm.isActive" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="addMemberDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddMember" :loading="loading">
          确定
        </ElButton>
      </template>
    </ElDialog>

    <!-- 编辑团队成员弹窗 -->
    <ElDialog
      v-model="editMemberDialogVisible"
      title="编辑团队成员"
      width="500px"
    >
      <ElForm :model="editMemberForm" label-width="100px">
        <ElFormItem label="成员ID">
          <ElInput v-model="editMemberForm.id" disabled />
        </ElFormItem>
        <ElFormItem label="案件ID">
          <ElInput v-model="editMemberForm.caseId" disabled />
        </ElFormItem>
        <ElFormItem label="用户ID" required>
          <ElInput
            v-model.number="editMemberForm.userId"
            type="number"
            placeholder="请输入用户ID"
          />
        </ElFormItem>
        <ElFormItem label="团队角色" required>
          <ElSelect
            v-model="editMemberForm.roleId"
            placeholder="选择角色"
            style="width: 100%"
          >
            <ElOption
              v-for="role in teamRoles"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限级别">
          <ElSelect
            v-model="editMemberForm.permissionLevel"
            placeholder="选择权限级别"
            style="width: 100%"
          >
            <ElOption
              v-for="perm in permissionTypes"
              :key="perm.value"
              :label="perm.label"
              :value="perm.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="是否活跃">
          <ElSwitch v-model="editMemberForm.isActive" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editMemberDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleUpdateMember" :loading="loading">
          确定
        </ElButton>
      </template>
    </ElDialog>

    <!-- 权限设置弹窗 -->
    <ElDialog
      v-model="permissionsDialogVisible"
      title="设置成员权限"
      width="700px"
    >
      <div class="mb-4">
        <ElButton type="primary" size="small" @click="addPermissionItem">
          <i class="i-lucide-plus mr-1"></i>
          添加权限
        </ElButton>
      </div>
      <ElForm :model="permissionForm" label-width="100px">
        <div
          v-for="(perm, index) in permissionForm.permissions"
          :key="index"
          class="mb-4 flex items-center gap-4 rounded bg-gray-50 p-4"
        >
          <ElFormItem label="模块类型">
            <ElSelect
              v-model="perm.moduleType"
              placeholder="选择模块"
              style="width: 150px"
            >
              <ElOption
                v-for="mod in moduleTypes"
                :key="mod.value"
                :label="mod.label"
                :value="mod.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="权限类型">
            <ElSelect
              v-model="perm.permissionType"
              placeholder="选择权限"
              style="width: 150px"
            >
              <ElOption
                v-for="p in permissionTypes"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="是否允许">
            <ElSwitch v-model="perm.isAllowed" />
          </ElFormItem>
          <ElButton
            type="danger"
            size="small"
            @click="removePermissionItem(index)"
          >
            移除
          </ElButton>
        </div>
      </ElForm>
      <template #footer>
        <ElButton @click="permissionsDialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          @click="handleSavePermissions"
          :loading="loading"
        >
          保存权限
        </ElButton>
      </template>
    </ElDialog>

    <!-- 权限检查弹窗 -->
    <ElDialog
      v-model="checkPermissionDialogVisible"
      title="权限检查"
      width="500px"
    >
      <ElForm :model="checkPermissionForm" label-width="120px">
        <ElFormItem label="选择案件">
          <ElSelect
            v-model="checkPermissionForm.caseId"
            placeholder="选择案件"
            style="width: 100%"
          >
            <ElOption
              v-for="caseItem in accessibleCases"
              :key="caseItem.sepId"
              :label="`${caseItem.ah} - ${caseItem.ajmc}`"
              :value="caseItem.sepId"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限类型">
          <ElSelect
            v-model="checkPermissionForm.permission"
            placeholder="选择权限"
            style="width: 100%"
          >
            <ElOption
              v-for="perm in permissionTypes"
              :key="perm.value"
              :label="perm.label"
              :value="perm.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="checkPermissionDialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          @click="handleCheckPermission"
          :loading="loading"
        >
          检查权限
        </ElButton>
        <ElButton
          type="success"
          @click="handleCanAccessCase"
          :loading="loading"
        >
          检查访问
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.case-permission-page {
  .tab-content {
    padding: 20px 0;
  }
}

:deep(.el-tabs__content) {
  padding: 0;
}
</style>
