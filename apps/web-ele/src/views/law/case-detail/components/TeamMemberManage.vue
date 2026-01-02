<script lang="ts" setup>
import type { WorkTeamApi } from '#/api';

import { computed, onMounted, ref } from 'vue';

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
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  addTeamMemberApi,
  getActiveTeamRolesApi,
  getTeamMembersApi,
  removeTeamMemberApi,
  updateTeamMemberApi,
} from '#/api/core/work-team';

interface Props {
  caseId: number;
  isCreator: boolean;
}

const props = defineProps<Props>();

const teamMembers = ref<WorkTeamApi.TeamMemberInfo[]>([]);
const teamRoles = ref<WorkTeamApi.TeamRoleInfo[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('添加成员');
const memberForm = ref({
  id: null as number | null,
  userId: null as number | null,
  userName: '',
  teamRole: '',
  permissionLevel: 'VIEW',
});

const loading = ref(false);

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

const getPermissionTagType = (level: string) => {
  const types: Record<string, any> = {
    VIEW: 'info',
    EDIT: 'warning',
    FULL: 'danger',
  };
  return types[level] || 'info';
};

const getPermissionLabel = (level: string) => {
  const labels: Record<string, string> = {
    VIEW: '查看',
    EDIT: '编辑',
    FULL: '完全控制',
  };
  return labels[level] || level;
};

const handleAddMember = () => {
  dialogTitle.value = '添加成员';
  memberForm.value = {
    id: null,
    userId: null,
    userName: '',
    teamRole: '',
    permissionLevel: 'VIEW',
  };
  dialogVisible.value = true;
};

const handleEditMember = (row: WorkTeamApi.TeamMemberInfo) => {
  dialogTitle.value = '编辑成员';
  memberForm.value = {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    teamRole: row.teamRole,
    permissionLevel: row.permissionLevel,
  };
  dialogVisible.value = true;
};

const handleSaveMember = async () => {
  if (!memberForm.value.userId) {
    ElMessage.warning('请选择成员');
    return;
  }
  if (!memberForm.value.teamRole) {
    ElMessage.warning('请选择团队角色');
    return;
  }
  if (!memberForm.value.permissionLevel) {
    ElMessage.warning('请选择权限级别');
    return;
  }

  try {
    const data = {
      caseId: props.caseId,
      userId: memberForm.value.userId,
      teamRole: memberForm.value.teamRole,
      permissionLevel: memberForm.value.permissionLevel,
    };

    if (memberForm.value.id) {
      await updateTeamMemberApi({
        id: memberForm.value.id,
        ...data,
      });
    } else {
      await addTeamMemberApi(data);
    }

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

const handleUserSearch = async (query: string) => {
  if (!query) return;
};

onMounted(() => {
  loadTeamMembers();
  loadTeamRoles();
});

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
      <ElTableColumn prop="permissionLevel" label="权限级别" min-width="120">
        <template #default="{ row }">
          <ElTag :type="getPermissionTagType(row.permissionLevel)" size="small">
            {{ getPermissionLabel(row.permissionLevel) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="isActive" label="状态" min-width="80" align="center">
        <template #default="{ row }">
          <ElTag :type="row.isActive ? 'success' : 'danger'" size="small">
            {{ row.isActive ? '激活' : '禁用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn v-if="isCreator" label="操作" min-width="150" fixed="right">
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
        <ElFormItem label="成员姓名" required>
          <ElInput
            v-model="memberForm.userName"
            placeholder="请输入成员姓名"
            @input="handleUserSearch"
          />
        </ElFormItem>
        <ElFormItem label="团队角色" required>
          <ElSelect
            v-model="memberForm.teamRole"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <ElOption
              v-for="role in teamRoles"
              :key="role.roleCode"
              :label="role.roleName"
              :value="role.roleCode"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限级别" required>
          <ElSelect
            v-model="memberForm.permissionLevel"
            placeholder="请选择权限"
            style="width: 100%"
          >
            <ElOption label="查看" value="VIEW" />
            <ElOption label="编辑" value="EDIT" />
            <ElOption label="完全控制" value="FULL" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSaveMember">
            确定
          </ElButton>
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
