<script lang="ts" setup>
import type { ManagerApi } from '#/api/core/manager';
import type { UserApi } from '#/api/core/user';
import type { WorkTeamApi } from '#/api/core/work-team';

import { onMounted, ref, watch } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getManagerListApi } from '#/api/core/manager';
import { getUserByDeptIdApi } from '#/api/core/user';
import {
  addTeamMemberApi,
  getActiveTeamRolesApi,
  getTeamMembersApi,
  removeTeamMemberApi,
  updateTeamMemberApi,
} from '#/api/core/work-team';

const props = defineProps<Props>();
// 新增的响应式数据
const administrators = ref<ManagerApi.ManagerInfo[]>([]);
const users = ref<UserApi.UserInfo[]>([]);
const loadingAdministrators = ref(false);
const loadingUsers = ref(false);
const selectedDeptId = ref<null | number>(null);
const selectedUser = ref<null | UserApi.UserInfo>(null);

interface Props {
  caseId: number;
  isCreator: boolean;
}

const teamMembers = ref<WorkTeamApi.TeamMemberInfo[]>([]);
const teamRoles = ref<WorkTeamApi.TeamRoleInfo[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('添加成员');
const memberForm = ref({
  id: null as null | number,
  userId: null as null | number,
  roleId: null as null | number,
});

const loading = ref(false);

// 加载管理员机构列表
const loadAdministrators = async () => {
  loadingAdministrators.value = true;
  try {
    const response = await getManagerListApi({});
    if (response.data) {
      administrators.value = response.data;
    }
  } catch {
    ElMessage.error('获取管理员机构失败');
  } finally {
    loadingAdministrators.value = false;
  }
};

// 加载部门下的用户列表
const loadUsersByDeptId = async (deptId: number) => {
  if (!deptId) {
    users.value = [];
    return;
  }

  loadingUsers.value = true;
  try {
    const response = await getUserByDeptIdApi(deptId);
    if (response.data) {
      users.value = response.data;
    }
  } catch {
    ElMessage.error('获取用户列表失败');
    users.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

// 监听部门ID变化，加载对应用户
watch(selectedDeptId, (newVal) => {
  if (newVal) {
    loadUsersByDeptId(newVal);
    selectedUser.value = null;
    memberForm.value.userId = null;
  }
});

// 监听用户变化，更新表单中的userId
watch(selectedUser, (newVal) => {
  if (newVal) {
    memberForm.value.userId = newVal.uPid;
  }
});

// 重置选择状态
const resetSelections = () => {
  selectedDeptId.value = null;
  selectedUser.value = null;
  users.value = [];
  memberForm.value.userId = null;
};

const loadTeamMembers = async () => {
  loading.value = true;
  try {
    const response = await getTeamMembersApi(props.caseId);
    if (response.code === 200) {
      teamMembers.value = response.data || [];
    }
  } catch {
    ElMessage.error('获取团队成员失败');
  } finally {
    loading.value = false;
  }
};

const loadTeamRoles = async () => {
  try {
    const response = await getActiveTeamRolesApi();
    if (response.code === 200) {
      teamRoles.value = response.data || [];
    }
  } catch {
    ElMessage.error('获取团队角色失败');
  }
};

const handleAddMember = () => {
  dialogTitle.value = '添加成员';
  memberForm.value = {
    id: null,
    userId: null,
    roleId: null,
  };
  resetSelections();
  dialogVisible.value = true;
};

const handleEditMember = (row: WorkTeamApi.TeamMemberInfo) => {
  dialogTitle.value = '编辑成员';
  memberForm.value = {
    id: row.id,
    userId: row.userId,
    roleId: Number(row.teamRole),
  };
  // 编辑模式下，我们需要根据userId找到对应的部门和用户信息
  // 但由于当前没有提供通过userId获取用户详细信息的接口，暂时只设置userId
  selectedDeptId.value = null;
  selectedUser.value = null;
  users.value = [];
  dialogVisible.value = true;
};

// 在组件挂载时加载管理员机构列表
onMounted(() => {
  loadTeamMembers();
  loadTeamRoles();
  loadAdministrators();
});

const handleSaveMember = async () => {
  if (!memberForm.value.userId) {
    ElMessage.warning('请选择成员');
    return;
  }
  if (!memberForm.value.roleId) {
    ElMessage.warning('请选择团队角色');
    return;
  }

  try {
    const data = {
      caseId: props.caseId,
      userId: memberForm.value.userId,
      roleId: memberForm.value.roleId,
    };

    await (memberForm.value.id
      ? updateTeamMemberApi({
          id: memberForm.value.id,
          ...data,
        })
      : addTeamMemberApi(data));

    dialogVisible.value = false;
    loadTeamMembers();
    ElMessage.success('保存成功');
  } catch {
    ElMessage.error('保存失败');
  }
};

const handleRemoveMember = async (row: WorkTeamApi.TeamMemberInfo) => {
  try {
    await ElMessageBox.confirm(`确定要移除成员"${row.userName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await removeTeamMemberApi(row.id);
    loadTeamMembers();
    ElMessage.success('移除成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败');
    }
  }
};

defineExpose({
  loadTeamMembers,
});
</script>

<template>
  <ElCard header="团队成员管理" size="small">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-lg font-semibold">团队成员管理</span>
        <ElButton
          v-if="isCreator"
          type="primary"
          size="small"
          @click="handleAddMember"
        >
          添加成员
        </ElButton>
      </div>
    </template>

    <ElTable
      :data="teamMembers"
      v-loading="loading"
      stripe
      border
      size="small"
      :style="{ width: '100%' }"
    >
      <ElTableColumn prop="userName" label="成员姓名" min-width="120" />
      <ElTableColumn prop="userCode" label="用户代码" min-width="120" />
      <ElTableColumn prop="teamRoleName" label="团队角色" min-width="120" />
      <ElTableColumn prop="isActive" label="状态" min-width="80" align="center">
        <template #default="{ row }">
          <ElTag :type="row.isActive ? 'success' : 'danger'" size="small">
            {{ row.isActive ? '激活' : '禁用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="isCreator"
        label="操作"
        min-width="150"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="flex gap-2">
            <ElButton size="small" @click="handleEditMember(row)">
              编辑
            </ElButton>
            <ElButton
              size="small"
              type="danger"
              @click="handleRemoveMember(row)"
            >
              移除
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 添加/编辑成员对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <ElForm :model="memberForm" label-width="100px">
        <ElFormItem label="管理员机构" required>
          <ElSelect
            v-model="selectedDeptId"
            placeholder="请选择管理员机构"
            style="width: 100%"
            filterable
            :loading="loadingAdministrators"
          >
            <ElOption
              v-for="admin in administrators"
              :key="admin.sepId"
              :label="admin.lsswsid"
              :value="admin.sepId"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="成员" required>
          <ElSelect
            v-model="selectedUser"
            placeholder="请选择成员"
            style="width: 100%"
            filterable
            :loading="loadingUsers"
            :disabled="!selectedDeptId"
            value-key="uPid"
          >
            <ElOption
              v-for="user in users"
              :key="user.uPid"
              :label="user.uName"
              :value="user"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="团队角色" required>
          <ElSelect
            v-model="memberForm.roleId"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <ElOption
              v-for="role in teamRoles"
              :key="role.roleCode"
              :label="role.roleName"
              :value="Number(role.roleCode)"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSaveMember"> 确定 </ElButton>
        </div>
      </template>
    </ElDialog>
  </ElCard>
</template>

<style scoped>
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

:deep(.el-table) {
  overflow: hidden;
  border-radius: 6px;
}

:deep(.el-table__header-wrapper th) {
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background-color: #fafafa;
}

:deep(.el-table__body-wrapper tr) {
  font-size: 13px;
  transition: all 0.2s ease;
}

:deep(.el-table__body-wrapper tr:hover > td) {
  background-color: #f5f7fa !important;
}

:deep(.el-table__body-wrapper td) {
  padding: 12px 0;
  color: #606266;
}

:deep(.el-tag) {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}
</style>
