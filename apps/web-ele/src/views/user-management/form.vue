<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  createUserApi,
  assignUserRoleApi,
  getRoleListApi,
} from '#/api/core/user-management';
import { loginApi } from '#/api/core/auth';
import { useUserStore } from '@vben/stores';

const router = useRouter();
const userStore = useUserStore();

const submitting = ref(false);
const loadingRoles = ref(false);

const form = reactive({
  username: '',
  password: '',
  realName: '',
  mobile: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
});

const availableRoles = ref<any[]>([]);
const selectedRoleIds = ref<number[]>([]);

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }],
};

const statusOptions = [
  { label: '正常', value: 'ACTIVE' },
  { label: '未激活', value: 'INACTIVE' },
  { label: '已锁定', value: 'LOCKED' },
];

const fetchRoles = async () => {
  loadingRoles.value = true;
  try {
    const response = await getRoleListApi({ status: 'ACTIVE', size: 50 });
    if (response.code === 200) {
      const allRoles = response.data.roles || [];
      availableRoles.value = allRoles.filter(
        (r: any) => r.roleCode === 'LAWYER' || r.roleCode === 'ADMIN',
      );
    }
  } catch (error) {
    console.error('加载角色列表失败:', error);
  } finally {
    loadingRoles.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;

  try {
    const adminRole = availableRoles.value.find((r) => r.roleCode === 'ADMIN');
    const hasAdmin = adminRole && selectedRoleIds.value.includes(adminRole.id);

    if (hasAdmin) {
      const { value: password } = await ElMessageBox.prompt(
        '分配管理员角色需要验证当前管理员密码：',
        '密码校验',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          inputType: 'password',
          inputPlaceholder: '请输入登录密码',
        },
      );

      if (!password) {
        ElMessage.warning('请输入密码');
        submitting.value = false;
        return;
      }

      const currentUsername = userStore.userInfo?.username || localStorage.getItem('chat_username');
      if (!currentUsername) {
        ElMessage.error('无法获取当前用户信息');
        submitting.value = false;
        return;
      }

      const verifyRes = await loginApi({ username: currentUsername, password });
      if (verifyRes.code !== 200) {
        ElMessage.error(verifyRes.message || '密码验证失败');
        submitting.value = false;
        return;
      }
    }

    const createRes = await createUserApi({
      username: form.username,
      password: form.password,
      realName: form.realName || undefined,
      mobile: form.mobile || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      status: form.status,
    });

    if (createRes.code !== 200) {
      ElMessage.error(createRes.message || '创建用户失败');
      return;
    }

    const userId = createRes.data.id;

    if (selectedRoleIds.value.length > 0) {
      try {
        await assignUserRoleApi(userId, { roleIds: selectedRoleIds.value });
      } catch (error) {
        console.error('分配角色失败:', error);
        ElMessage.warning('用户已创建，但角色分配失败，请手动分配');
        router.push('/expense-system/user-management');
        return;
      }
    }

    ElMessage.success('新增用户成功');
    router.push('/expense-system/user-management');
  } catch (error: any) {
    if (error !== 'cancel') {
      const errorMsg = error?.response?.data?.message || error?.message || '操作失败';
      ElMessage.error(errorMsg);
      console.error('新增用户失败:', error);
    }
  } finally {
    submitting.value = false;
  }
};

const handleBack = () => {
  router.push('/expense-system/user-management');
};

onMounted(() => {
  fetchRoles();
});
</script>

<template>
  <div class="user-form-page">
    <div class="page-header">
      <el-button @click="handleBack" text>
        <i class="el-icon-back"></i> 返回列表
      </el-button>
      <h1>新增用户</h1>
      <p class="page-tip">创建新用户并分配角色，仅支持管理员角色的用户操作</p>
    </div>

    <div class="user-form-content">
      <el-card shadow="hover">
        <el-form
          :model="form"
          :rules="formRules"
          label-width="100px"
          style="max-width: 600px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="form.realName"
              placeholder="请输入真实姓名"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="手机号" prop="mobile">
            <el-input
              v-model="form.mobile"
              placeholder="请输入手机号"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              maxlength="100"
            />
          </el-form-item>

          <el-form-item label="座机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入座机号"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select
              v-model="form.status"
              style="width: 100%"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="分配角色">
            <div v-loading="loadingRoles" class="role-select-area">
              <div v-if="availableRoles.length === 0 && !loadingRoles" class="empty-roles">
                暂无可分配角色
              </div>
              <el-checkbox-group v-model="selectedRoleIds" class="role-checkbox-group">
                <div
                  v-for="role in availableRoles"
                  :key="role.id"
                  class="role-item"
                >
                  <el-checkbox :label="role.id" :value="role.id">
                    {{ role.roleName }}
                    <span class="role-desc">（{{ role.roleDesc }}）</span>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="submitting"
              @click="handleSubmit"
            >
              提交创建
            </el-button>
            <el-button @click="handleBack">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.user-form-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 8px 0 4px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.page-tip {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.user-form-content {
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  margin: 0;
}

.role-select-area {
  width: 100%;
}

.empty-roles {
  padding: 12px 0;
  color: #909399;
}

.role-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-item {
  padding: 4px 0;
}

.role-desc {
  font-size: 12px;
  color: #909399;
}
</style>
