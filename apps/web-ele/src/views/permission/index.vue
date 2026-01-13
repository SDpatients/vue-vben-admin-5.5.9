<script setup lang="ts">
import type { PermissionApi } from '#/api/core/permission';

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
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElTag,
} from 'element-plus';

import {
  assignRolesToUserPostApi,
  assignRolesToUserPutApi,
  checkUserRoleApi,
  getAllRolesApi,
<<<<<<< Updated upstream
  getUserRoleIdsApi,
  getUsersByRoleCodeApi,
  removeRoleApi,
  updateTBUserRoleApi,
=======
  getUserRolesListApi,
  removeRolesFromUserApi,
>>>>>>> Stashed changes
} from '#/api/core/permission';

const activeTab = ref('roleUsers');

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
const checkResult = ref<null | PermissionApi.CheckRoleResponse['data']>(null);

const loadRoles = async () => {
  loading.value = true;
  try {
    const response = await getAllRolesApi();
<<<<<<< Updated upstream
    if (response.status === '1') {
      // 将API返回的下划线命名字段转换为驼峰命名
      roles.value = (response.data || []).map(role => ({
        roleId: role.role_id,
        roleCode: role.role_code,
        roleName: role.role_name,
        roleDesc: role.role_desc,
        isSystem: role.is_system,
        sortOrder: role.sort_order
=======
    if (response.code === 200) {
      // 新API返回的是驼峰命名，直接映射并将id转换为roleId以适配现有代码
      roles.value = (response.data.roles || []).map((role) => ({
        roleId: role.id,
        roleCode: role.roleCode,
        roleName: role.roleName,
        roleDesc: role.roleDesc,
        isSystem: role.isSystem,
        status: role.status,
        sortOrder: role.sortOrder,
>>>>>>> Stashed changes
      }));
      ElMessage.success('角色列表加载成功');
    } else {
      ElMessage.error(response.error || '加载角色列表失败');
    }
  } catch {
    ElMessage.error('加载角色列表失败');
  } finally {
    loading.value = false;
  }
};

const loadRoleUsers = async () => {
  loading.value = true;
  try {
<<<<<<< Updated upstream
    const response = await getUsersByRoleCodeApi(currentRoleCode.value);
    if (response.status === '1') {
      // 将API返回的下划线命名字段转换为驼峰命名
      roleUsers.value = (response.data || []).map(user => ({
        uPid: user.u_pid,
        uUser: user.u_user,
        uName: user.u_name,
        uPwd: user.u_pwd,
        uDeptid: user.u_deptid,
        uDept: user.u_dept,
        uTel: user.u_tel,
        uMobile: user.u_mobile,
        uEmail: user.u_email,
        uRemark: user.u_remark,
        uValid: user.u_valid,
        uStatus: user.u_status,
        uLoginType: user.u_login_type,
        uBindDevice: user.u_bind_device,
        uLastLoginTime: user.u_last_login_time,
        uLastLoginIp: user.u_last_login_ip,
        uLoginCount: user.u_login_count,
        uPwdErrorCount: user.u_pwd_error_count,
        uPwdErrorTime: user.u_pwd_error_time,
        uPwdExpireTime: user.u_pwd_expire_time,
        sepAuser: user.sep_auser,
        sepAdate: user.sep_adate,
        sepEuser: user.sep_euser,
        sepEdate: user.sep_edate,
        uPur1: user.u_pur1,
        uPur2: user.u_pur2,
        uPur3: user.u_pur3,
        uPur4: user.u_pur4,
        uPur5: user.u_pur5,
        roles: user.roles,
        permissions: user.permissions
=======
    // 调用新的API获取用户角色列表
    const response = await getUserRolesListApi();
    if (response.code === 200) {
      // 处理新的响应格式
      roleUsers.value = (response.data || []).map((user) => ({
        uPid: user.id,
        uUser: user.username,
        uName: user.realName,
        uMobile: user.mobile,
        uEmail: user.email,
        // 处理角色列表，将多个角色名称用顿号分隔
        userRoles: user.roles?.map((role) => role.roleName).join('、') || '',
        // 保留其他必要字段
        isValid: user.isValid,
        status: user.status,
        lastLoginTime: user.lastLoginTime,
        lastLoginIp: user.lastLoginIp,
>>>>>>> Stashed changes
      }));
      ElMessage.success('角色用户列表加载成功');
    } else {
      ElMessage.error(response.error || '加载角色用户列表失败');
    }
<<<<<<< Updated upstream
  } catch (error) {
    ElMessage.error('加载角色用户列表失败');
=======
  } catch {
    ElMessage.error('加载用户角色列表失败');
>>>>>>> Stashed changes
  } finally {
    loading.value = false;
  }
};

const handleCheckRole = async () => {
  loading.value = true;
  try {
    const response = await checkUserRoleApi(
      checkRoleForm.value.userId,
      checkRoleForm.value.roleCode,
    );
    if (response.status === '1') {
      checkResult.value = response.data;
      ElMessage.success('角色检查完成');
    } else {
      ElMessage.error(response.error || '角色检查失败');
    }
  } catch {
    ElMessage.error('角色检查失败');
  } finally {
    loading.value = false;
  }
};

<<<<<<< Updated upstream
const handleEditPermission = async (user: any) => {
=======
const handleEditPermission = (user: any) => {
  // 记录用户是否有原始角色
  const hasOriginalRoles = !!user.userRoles;

>>>>>>> Stashed changes
  // 填充基本用户信息
  editPermissionForm.value = {
    u_pid: user.uPid,
    u_user: user.uUser,
    u_name: user.uName,
    role_id: 0, // 默认值，将通过API获取
  };

<<<<<<< Updated upstream
  try {
    // 调用API获取用户当前角色ID
    const response = await getUserRoleIdsApi(user.uPid);
    if (response.status === '1') {
      // 将获取到的角色ID设置到表单中
      editPermissionForm.value.role_id = Number(response.data) || 0;
    }
  } catch (error) {
    ElMessage.error('获取用户角色ID失败');
=======
  // 从用户信息中提取当前角色，并转换为角色ID数组
  if (user.userRoles) {
    // 将用户角色字符串分割为数组
    const roleNames = user.userRoles.split('、');
    // 从角色列表中查找对应的角色ID
    roleNames.forEach((roleName) => {
      const role = roles.value.find((r) => r.roleName === roleName);
      if (role) {
        editPermissionForm.value.role_ids.push(role.roleId);
      }
    });
>>>>>>> Stashed changes
  }

  // 打开弹窗
  editPermissionDialogVisible.value = true;
};

const handleRemoveUser = async (user: any) => {
  try {
<<<<<<< Updated upstream
    // 从角色列表中找到当前角色对应的roleId
    const currentRole = roles.value.find(role => role.roleCode === currentRoleCode.value);
    if (!currentRole) {
      ElMessage.error('未找到当前角色信息');
=======
    // 显示确认对话框
    await ElMessageBox.confirm('确定要移除该用户的角色吗？', '确认移除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 从用户信息中获取角色ID列表
    // 注意：这里需要根据实际情况获取用户的角色ID列表
    // 由于当前user对象中没有直接的角色ID，我们需要根据角色名称从roles列表中查找
    const userRoleIds = [];
    if (user.userRoles) {
      // 将用户角色字符串分割为数组
      const roleNames = user.userRoles.split('、');
      // 从角色列表中查找对应的角色ID
      roleNames.forEach((roleName) => {
        const role = roles.value.find((r) => r.roleName === roleName);
        if (role) {
          userRoleIds.push(role.roleId);
        }
      });
    }

    if (userRoleIds.length === 0) {
      ElMessage.error('未找到用户的角色信息');
>>>>>>> Stashed changes
      return;
    }

    // 调用移除角色接口
    const response = await removeRoleApi(user.uPid, currentRole.roleId);
    if (response.status === '1') {
      ElMessage.success('角色移除成功');
      loadRoleUsers(); // 刷新角色用户列表
    } else {
      ElMessage.error(response.error || '角色移除失败');
    }
  } catch (error) {
    ElMessage.error('角色移除失败');
  }
};

const handleUpdatePermission = async () => {
<<<<<<< Updated upstream
  if (!editPermissionForm.value.role_id) {
    ElMessage.warning('请选择角色');
=======
  if (
    !editPermissionForm.value.role_ids ||
    editPermissionForm.value.role_ids.length === 0
  ) {
    ElMessage.warning('请选择至少一个角色');
>>>>>>> Stashed changes
    return;
  }

  loading.value = true;
  try {
<<<<<<< Updated upstream
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
=======
    // 根据用户是否有原始角色，调用不同的API方法
    const response = editPermissionForm.value.hasOriginalRoles
      ? await assignRolesToUserPutApi(editPermissionForm.value.u_pid, {
          roleIds: editPermissionForm.value.role_ids, // 直接使用角色ID数组
        })
      : await assignRolesToUserPostApi(editPermissionForm.value.u_pid, {
          roleIds: editPermissionForm.value.role_ids, // 直接使用角色ID数组
        });

    if (response.code === 200) {
      // 根据操作类型显示不同的成功消息
      ElMessage.success(
        editPermissionForm.value.hasOriginalRoles
          ? '权限修改成功'
          : '权限分配成功',
      );
      editPermissionDialogVisible.value = false;
      loadRoleUsers(); // 刷新角色用户列表
    } else {
      ElMessage.error(
        response.message ||
          (editPermissionForm.value.hasOriginalRoles
            ? '权限修改失败'
            : '权限分配失败'),
      );
    }
  } catch {
    ElMessage.error(
      editPermissionForm.value.hasOriginalRoles
        ? '权限修改失败'
        : '权限分配失败',
    );
>>>>>>> Stashed changes
  } finally {
    loading.value = false;
  }
};

const getRoleTagType = (
  roleCode: string,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' => {
  const typeMap: Record<
    string,
    'danger' | 'info' | 'primary' | 'success' | 'warning'
  > = {
    ADMIN: 'danger',
    REVIEWER: 'warning',
    LAWYER: 'success',
  };
  return typeMap[roleCode] || 'info';
};

const getRoleName = (roleCode: string) => {
<<<<<<< Updated upstream
=======
  // 如果roleCode为空，返回"所有角色"
  if (!roleCode) {
    return '所有角色';
  }

>>>>>>> Stashed changes
  // 先从roles数组中查找角色名称
  const role = roles.value.find((r) => r.roleCode === roleCode);
  if (role && role.roleName) {
    return role.roleName;
  }

  // 保留原有映射作为 fallback
  const nameMap: Record<string, string> = {
    ADMIN: '管理员',
    REVIEWER: '审核员',
    LAWYER: '律师',
    SUPER_ADMIN: '超级管理员',
    VIEWER: '只读用户',
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
<<<<<<< Updated upstream
          <ElButton type="primary" @click="loadRoles">
=======
          <ElButton
            type="primary"
            @click="
              () => {
                // 根据当前激活的标签页调用对应的查询接口
                if (activeTab === 'roles') {
                  loadRoles();
                } else if (activeTab === 'roleUsers') {
                  loadRoleUsers();
                }
              }
            "
          >
>>>>>>> Stashed changes
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <ElTabs v-model="activeTab">
        <ElTabPane label="角色列表" name="roles">
          <div class="tab-content">
            <ElTable :data="roles" v-loading="loading" stripe border>
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
                  <ElTag
                    :type="row.isSystem === '1' ? 'warning' : 'info'"
                    size="small"
                  >
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
              <ElTable :data="roleUsers" v-loading="loading" stripe border>
                <ElTableColumn label="序号" width="100">
                  <template #default="scope">
                    {{ scope.$index + 1 }}
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="uUser" label="用户名" width="200" />
                <ElTableColumn prop="uName" label="真实姓名" />
                <ElTableColumn prop="uMobile" label="联系电话" width="180" />
                <ElTableColumn label="操作" width="200">
                  <template #default="scope">
                    <span
<<<<<<< Updated upstream
                      class="cursor-pointer text-primary mr-4"
=======
                      class="mr-4 cursor-pointer"
                      :style="
                        scope.row.userRoles
                          ? { color: '#409eff' }
                          : { color: '#67c23a', fontWeight: 'bold' }
                      "
>>>>>>> Stashed changes
                      @click="handleEditPermission(scope.row)"
                    >
                      修改权限
                    </span>
                    <span
                      class="cursor-pointer"
                      style="color: red"
                      @click="handleRemoveUser(scope.row)"
                    >
                      移除
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
                  <ElButton
                    type="primary"
                    @click="handleCheckRole"
                    :loading="loading"
                  >
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
        <ElButton
          type="primary"
          @click="handleUpdatePermission"
          :loading="loading"
        >
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
