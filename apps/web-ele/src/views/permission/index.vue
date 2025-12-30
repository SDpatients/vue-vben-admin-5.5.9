<script setup lang="ts">
import type { PermissionApi } from '#/api/core/permission';

import { onMounted, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTabs,
  ElTabPane,
} from 'element-plus';

import {
  assignRoleApi,
  checkUserRoleApi,
  getAllRolesApi,
  getRolesByUserIdApi,
  getUsersByRoleCodeApi,
  removeRoleApi,
  setUserRolesApi,
} from '#/api/core/permission';

const activeTab = ref('userRoles');

const loading = ref(false);
const roles = ref<PermissionApi.Role[]>([]);
const userRoles = ref<PermissionApi.UserRole[]>([]);
const roleUsers = ref<Array<{ userId: number; username: string; realName?: string }>>([]);

const currentUserId = ref<number>(1);
const currentRoleCode = ref<string>('LAWYER');

const assignDialogVisible = ref(false);
const assignForm = ref({
  userId: 1,
  roleId: 0,
});

const setUserRolesDialogVisible = ref(false);
const setUserRolesForm = ref({
  userId: 1,
  roleIds: [] as number[],
});

const checkRoleDialogVisible = ref(false);
const checkRoleForm = ref({
  userId: 1,
  roleCode: 'ADMIN',
});
const checkResult = ref<PermissionApi.CheckRoleResponse['data'] | null>(null);

const loadRoles = async () => {
  loading.value = true;
  try {
    const response = await getAllRolesApi();
    if (response.status === '1') {
      roles.value = response.data || [];
      ElMessage.success('角色列表加载成功');
    } else {
      ElMessage.error(response.error || '加载角色列表失败');
    }
  } catch (error) {
    ElMessage.error('加载角色列表失败');
  } finally {
    loading.value = false;
  }
};

const loadUserRoles = async () => {
  loading.value = true;
  try {
    const response = await getRolesByUserIdApi(currentUserId.value);
    if (response.status === '1') {
      userRoles.value = response.data || [];
      ElMessage.success('用户角色加载成功');
    } else {
      ElMessage.error(response.error || '加载用户角色失败');
    }
  } catch (error) {
    ElMessage.error('加载用户角色失败');
  } finally {
    loading.value = false;
  }
};

const loadRoleUsers = async () => {
  loading.value = true;
  try {
    const response = await getUsersByRoleCodeApi(currentRoleCode.value);
    if (response.status === '1') {
      roleUsers.value = response.data || [];
      ElMessage.success('角色用户列表加载成功');
    } else {
      ElMessage.error(response.error || '加载角色用户列表失败');
    }
  } catch (error) {
    ElMessage.error('加载角色用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleAssignRole = async () => {
  if (!assignForm.value.roleId) {
    ElMessage.warning('请选择角色');
    return;
  }

  loading.value = true;
  try {
    const response = await assignRoleApi(assignForm.value.userId, assignForm.value.roleId);
    if (response.status === '1') {
      ElMessage.success('角色分配成功');
      assignDialogVisible.value = false;
      loadUserRoles();
    } else {
      ElMessage.error(response.error || '角色分配失败');
    }
  } catch (error) {
    ElMessage.error('角色分配失败');
  } finally {
    loading.value = false;
  }
};

const handleRemoveRole = async (roleId: number) => {
  try {
    const response = await removeRoleApi(currentUserId.value, roleId);
    if (response.status === '1') {
      ElMessage.success('角色移除成功');
      loadUserRoles();
    } else {
      ElMessage.error(response.error || '角色移除失败');
    }
  } catch (error) {
    ElMessage.error('角色移除失败');
  }
};

const handleSetUserRoles = async () => {
  if (setUserRolesForm.value.roleIds.length === 0) {
    ElMessage.warning('请至少选择一个角色');
    return;
  }

  loading.value = true;
  try {
    const response = await setUserRolesApi(setUserRolesForm.value.userId, setUserRolesForm.value.roleIds);
    if (response.status === '1') {
      ElMessage.success('用户角色设置成功');
      setUserRolesDialogVisible.value = false;
      loadUserRoles();
    } else {
      ElMessage.error(response.error || '用户角色设置失败');
    }
  } catch (error) {
    ElMessage.error('用户角色设置失败');
  } finally {
    loading.value = false;
  }
};

const handleCheckRole = async () => {
  loading.value = true;
  try {
    const response = await checkUserRoleApi(checkRoleForm.value.userId, checkRoleForm.value.roleCode);
    if (response.status === '1') {
      checkResult.value = response.data;
      ElMessage.success('角色检查完成');
    } else {
      ElMessage.error(response.error || '角色检查失败');
    }
  } catch (error) {
    ElMessage.error('角色检查失败');
  } finally {
    loading.value = false;
  }
};

const getRoleTagType = (roleCode: string) => {
  const typeMap: Record<string, string> = {
    ADMIN: 'danger',
    REVIEWER: 'warning',
    LAWYER: 'success',
  };
  return typeMap[roleCode] || 'info';
};

const getRoleName = (roleCode: string) => {
  const nameMap: Record<string, string> = {
    ADMIN: '管理员',
    REVIEWER: '审核员',
    LAWYER: '律师',
  };
  return nameMap[roleCode] || roleCode;
};

onMounted(() => {
  loadRoles();
  loadUserRoles();
  loadRoleUsers();
});
</script>

<template>
  <div class="permission-page p-6">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">权限管理</span>
          <ElButton type="primary" @click="loadRoles">
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <ElTabs v-model="activeTab">
        <ElTabPane label="用户角色管理" name="userRoles">
          <div class="tab-content">
            <div class="mb-4 flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">用户ID：</span>
                <ElInput
                  v-model.number="currentUserId"
                  type="number"
                  placeholder="输入用户ID"
                  style="width: 150px"
                />
              </div>
              <ElButton type="primary" @click="loadUserRoles">
                查询用户角色
              </ElButton>
              <ElButton type="success" @click="setUserRolesDialogVisible = true">
                <i class="i-lucide-settings mr-1"></i>
                设置用户角色
              </ElButton>
              <ElButton type="warning" @click="assignDialogVisible = true">
                <i class="i-lucide-plus mr-1"></i>
                分配角色
              </ElButton>
            </div>

            <ElCard>
              <template #header>
                <span>用户 {{ currentUserId }} 的角色列表</span>
              </template>
              <div v-if="userRoles.length > 0" class="role-list">
                <div
                  v-for="role in userRoles"
                  :key="role.roleId"
                  class="role-item"
                >
                  <div class="role-info">
                    <ElTag :type="getRoleTagType(role.roleCode)" size="large">
                      {{ getRoleName(role.roleCode) }}
                    </ElTag>
                    <span class="ml-2 text-sm text-gray-600">
                      {{ role.roleName }}
                    </span>
                  </div>
                  <ElButton
                    type="danger"
                    size="small"
                    @click="handleRemoveRole(role.roleId)"
                  >
                    移除
                  </ElButton>
                </div>
              </div>
              <ElEmpty v-else description="该用户暂无角色" />
            </ElCard>
          </div>
        </ElTabPane>

        <ElTabPane label="角色列表" name="roles">
          <div class="tab-content">
            <ElTable
              :data="roles"
              v-loading="loading"
              stripe
              border
            >
              <ElTableColumn prop="roleId" label="角色ID" width="100" />
              <ElTableColumn prop="roleCode" label="角色编码" width="150" />
              <ElTableColumn prop="roleName" label="角色名称" width="150" />
              <ElTableColumn prop="roleDesc" label="角色描述" />
              <ElTableColumn label="角色类型" width="120">
                <template #default="{ row }">
                  <ElTag :type="getRoleTagType(row.roleCode)">
                    {{ getRoleName(row.roleCode) }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="系统角色" width="100" align="center">
                <template #default="{ row }">
                  <ElTag :type="row.isSystem === '1' ? 'warning' : 'info'" size="small">
                    {{ row.isSystem === '1' ? '是' : '否' }}
                  </ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElTabPane>

        <ElTabPane label="角色用户" name="roleUsers">
          <div class="tab-content">
            <div class="mb-4 flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">角色编码：</span>
                <ElSelect
                  v-model="currentRoleCode"
                  placeholder="选择角色"
                  style="width: 200px"
                  @change="loadRoleUsers"
                >
                  <ElOption
                    v-for="role in roles"
                    :key="role.roleId"
                    :label="role.roleCode"
                    :value="role.roleCode"
                  >
                    {{ role.roleName }} ({{ role.roleCode }})
                  </ElOption>
                </ElSelect>
              </div>
            </div>

            <ElCard>
              <template #header>
                <span>角色 {{ getRoleName(currentRoleCode) }} 的用户列表</span>
              </template>
              <ElTable
                :data="roleUsers"
                v-loading="loading"
                stripe
                border
              >
                <ElTableColumn prop="userId" label="用户ID" width="100" />
                <ElTableColumn prop="username" label="用户名" width="200" />
                <ElTableColumn prop="realName" label="真实姓名" />
              </ElTable>
            </ElCard>
          </div>
        </ElTabPane>

        <ElTabPane label="角色检查" name="checkRole">
          <div class="tab-content">
            <ElCard>
              <template #header>
                <span>检查用户角色</span>
              </template>
              <ElForm :model="checkRoleForm" label-width="120px">
                <ElFormItem label="用户ID">
                  <ElInput
                    v-model.number="checkRoleForm.userId"
                    type="number"
                    placeholder="输入用户ID"
                  />
                </ElFormItem>
                <ElFormItem label="角色编码">
                  <ElSelect
                    v-model="checkRoleForm.roleCode"
                    placeholder="选择角色"
                    style="width: 100%"
                  >
                    <ElOption
                      v-for="role in roles"
                      :key="role.roleId"
                      :label="role.roleCode"
                      :value="role.roleCode"
                    >
                      {{ role.roleName }} ({{ role.roleCode }})
                    </ElOption>
                  </ElSelect>
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleCheckRole" :loading="loading">
                    检查角色
                  </ElButton>
                </ElFormItem>
              </ElForm>

              <div v-if="checkResult" class="check-result mt-6">
                <div class="result-header">
                  <span class="text-lg font-semibold">检查结果</span>
                </div>
                <div class="result-content">
                  <div class="result-item">
                    <span class="label">用户ID：</span>
                    <span class="value">{{ checkResult.userId }}</span>
                  </div>
                  <div class="result-item">
                    <span class="label">角色编码：</span>
                    <span class="value">{{ checkResult.roleCode }}</span>
                  </div>
                  <div class="result-item">
                    <span class="label">是否拥有角色：</span>
                    <ElTag
                      :type="checkResult.hasRole ? 'success' : 'danger'"
                      size="large"
                    >
                      {{ checkResult.hasRole ? '是' : '否' }}
                    </ElTag>
                  </div>
                </div>
              </div>
            </ElCard>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <ElDialog
      v-model="assignDialogVisible"
      title="分配角色"
      width="500px"
    >
      <ElForm :model="assignForm" label-width="100px">
        <ElFormItem label="用户ID">
          <ElInput v-model.number="assignForm.userId" type="number" disabled />
        </ElFormItem>
        <ElFormItem label="选择角色">
          <ElSelect v-model="assignForm.roleId" placeholder="请选择角色" style="width: 100%">
            <ElOption
              v-for="role in roles"
              :key="role.roleId"
              :label="role.roleId"
              :value="role.roleId"
            >
              {{ role.roleName }} ({{ role.roleCode }})
            </ElOption>
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="assignDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAssignRole" :loading="loading">
          确定
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="setUserRolesDialogVisible"
      title="设置用户角色（覆盖模式）"
      width="500px"
    >
      <ElForm :model="setUserRolesForm" label-width="100px">
        <ElFormItem label="用户ID">
          <ElInput v-model.number="setUserRolesForm.userId" type="number" />
        </ElFormItem>
        <ElFormItem label="选择角色">
          <ElCheckboxGroup v-model="setUserRolesForm.roleIds">
            <div class="checkbox-group">
              <ElCheckbox
                v-for="role in roles"
                :key="role.roleId"
                :label="role.roleId"
              >
                <ElTag :type="getRoleTagType(role.roleCode)" size="small">
                  {{ role.roleName }}
                </ElTag>
              </ElCheckbox>
            </div>
          </ElCheckboxGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="setUserRolesDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSetUserRoles" :loading="loading">
          确定
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.permission-page {
  .tab-content {
    padding: 20px 0;
  }

  .role-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .role-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background-color: #fafafa;
    transition: all 0.3s ease;
  }

  .role-item:hover {
    background-color: #f5f7fa;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .role-info {
    display: flex;
    align-items: center;
  }

  .check-result {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background-color: #fafafa;
  }

  .result-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .result-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .result-item .label {
    font-weight: 500;
    color: #606266;
    min-width: 120px;
  }

  .result-item .value {
    color: #303133;
    font-weight: 600;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-group :deep(.el-checkbox) {
    margin-right: 0;
  }

  .checkbox-group :deep(.el-checkbox__label) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

:deep(.el-tabs__content) {
  padding: 0;
}
</style>
