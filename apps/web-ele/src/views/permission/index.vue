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
  checkUserRoleApi,
  getAllRolesApi,
  getUsersByRoleCodeApi,
  updateTBUserRoleApi,
} from '#/api/core/permission';

const activeTab = ref('roles');

const loading = ref(false);
const roles = ref<PermissionApi.Role[]>([]);
const userRoles = ref<PermissionApi.UserRole[]>([]);
const roleUsers = ref<Array<any>>([]);

const currentRoleCode = ref<string>('LAWYER');

// 修改权限弹窗相关
const editPermissionDialogVisible = ref(false);
const editPermissionForm = ref({
  u_pid: 0,
  u_user: '',
  u_name: '',
  role_id: 0,
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

const handleEditPermission = (user: any) => {
  // 填充表单数据
  editPermissionForm.value = {
    u_pid: user.uPid,
    u_user: user.uUser,
    u_name: user.uName,
    role_id: 0, // 默认值，需要根据用户当前角色设置
  };
  // 打开弹窗
  editPermissionDialogVisible.value = true;
};

const handleDeleteUser = async (user: any) => {
  // 这里可以添加删除用户的逻辑，例如调用API删除用户
  ElMessage.info(`删除用户 ${user.uUser}`);
};

const handleUpdatePermission = async () => {
  if (!editPermissionForm.value.role_id) {
    ElMessage.warning('请选择角色');
    return;
  }

  loading.value = true;
  try {
    const response = await updateTBUserRoleApi(editPermissionForm.value);
    if (response.status === '1') {
      ElMessage.success('权限修改成功');
      editPermissionDialogVisible.value = false;
      loadRoleUsers(); // 刷新角色用户列表
    } else {
      ElMessage.error(response.error || '权限修改失败');
    }
  } catch (error) {
    ElMessage.error('权限修改失败');
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
  // 先从roles数组中查找角色名称
  const role = roles.value.find(r => r.roleCode === roleCode);
  if (role && role.roleName) {
    return role.roleName;
  }
  
  // 保留原有映射作为 fallback
  const nameMap: Record<string, string> = {
    ADMIN: '管理员',
    REVIEWER: '审核员',
    LAWYER: '律师',
    SUPER_ADMIN: '超级管理员',
    VIEWER: '只读用户'
  };
  return nameMap[roleCode] || roleCode;
};

onMounted(() => {
  loadRoles();
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


        <ElTabPane label="角色列表" name="roles">
          <div class="tab-content">
            <ElTable
              :data="roles"
              v-loading="loading"
              stripe
              border
            >
              <ElTableColumn prop="roleId" label="角色ID" width="100" />
              <ElTableColumn prop="roleCode" label="角色" width="150" />
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
                  <span class="text-sm text-gray-600">角色：</span>
                  <ElSelect
                    v-model="currentRoleCode"
                    placeholder="选择角色"
                    style="width: 200px"
                    @change="loadRoleUsers"
                  >
                    <ElOption
                      v-for="role in roles"
                      :key="role.roleId"
                      :label="role.roleName"
                      :value="role.roleCode"
                    >
                      {{ role.roleName }}
                    </ElOption>
                  </ElSelect>
                </div>
            </div>

            <ElCard>
              <template #header>
                <span>{{ getRoleName(currentRoleCode) }} 列表</span>
              </template>
              <ElTable
                :data="roleUsers"
                v-loading="loading"
                stripe
                border
              >
                <ElTableColumn label="序号" width="100">
                  <template #default="scope">
                    {{ scope.$index + 1 }}
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="uUser" label="用户名" width="200" />
                <ElTableColumn prop="uName" label="真实姓名" />
                <ElTableColumn label="操作" width="200">
                  <template #default="scope">
                    <span
                      class="cursor-pointer text-primary mr-4"
                      @click="handleEditPermission(scope.row)"
                    >
                      修改权限
                    </span>
                    <span
                      class="cursor-pointer"
                      style="color: red;"
                      @click="handleDeleteUser(scope.row)"
                    >
                      删除
                    </span>
                  </template>
                </ElTableColumn>
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
                <ElFormItem label="角色">
                  <ElSelect
                    v-model="checkRoleForm.roleCode"
                    placeholder="选择角色"
                    style="width: 100%"
                  >
                    <ElOption
                    v-for="role in roles"
                    :key="role.roleId"
                    :label="role.roleName"
                    :value="role.roleCode"
                  >
                    {{ role.roleName }}
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
                    <span class="label">角色：</span>
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

    <!-- 修改权限弹窗 -->
    <ElDialog
      v-model="editPermissionDialogVisible"
      title="修改权限"
      width="500px"
    >
      <ElForm :model="editPermissionForm" label-width="120px">
        <ElFormItem label="用户名">
          <ElInput v-model="editPermissionForm.u_user" disabled />
        </ElFormItem>
        <ElFormItem label="真实姓名">
          <ElInput v-model="editPermissionForm.u_name" disabled />
        </ElFormItem>
        <ElFormItem label="角色">
          <ElSelect
            v-model="editPermissionForm.role_id"
            placeholder="选择角色"
            style="width: 100%"
          >
            <ElOption
              v-for="role in roles"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            >
              {{ role.roleName }}
            </ElOption>
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editPermissionDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleUpdatePermission" :loading="loading">
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
