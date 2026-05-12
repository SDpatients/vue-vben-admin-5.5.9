<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElProgress,
  ElTag,
} from 'element-plus';

import {
  changePasswordApi,
  getCurrentUserApi,
  updateMobileApi,
  updateEmailApi,
  updateRealNameApi,
} from '#/api/core/auth';
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  validatePasswordComplexity,
} from '#/utils/password-validator';

interface CurrentUser {
  id: number;
  username: string;
  realName: string;
  mobile: string;
  email: string;
  phone: string;
  status: string;
  roles: string[];
  permissions: string[];
}

interface EditForm {
  realName?: string;
  mobile?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const loading = ref(false);
const currentUser = ref<CurrentUser | null>(null);

// 编辑弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const editType = ref<'realName' | 'mobile' | 'email' | 'password'>('mobile');
const editForm = reactive<EditForm>({
  realName: '',
  mobile: '',
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const editLoading = ref(false);

const passwordStrength = computed(() => getPasswordStrength(editForm.newPassword || ''));
const passwordStrengthText = computed(() => getPasswordStrengthText(passwordStrength.value));
const passwordStrengthColor = computed(() => getPasswordStrengthColor(passwordStrength.value));
const passwordStrengthPercent = computed(() => {
  const levelMap: Record<string, number> = { 'weak': 25, 'medium': 50, 'strong': 75, 'very-strong': 100 };
  return levelMap[passwordStrength.value] || 0;
});

const fetchCurrentUser = async () => {
  try {
    loading.value = true;
    const result = await getCurrentUserApi();
    
    if (result && result.code === 200 && result.data) {
      currentUser.value = result.data;
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息错误:', error);
    ElMessage.error('获取用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 打开编辑弹窗
const openEditDialog = (type: 'realName' | 'mobile' | 'email' | 'password') => {
  editType.value = type as any;
  editForm.realName = currentUser.value?.realName || '';
  editForm.mobile = currentUser.value?.mobile || '';
  editForm.email = currentUser.value?.email || '';
  editForm.oldPassword = '';
  editForm.newPassword = '';
  editForm.confirmPassword = '';
  
  switch (type) {
    case 'realName':
      dialogTitle.value = '修改姓名';
      break;
    case 'mobile':
      dialogTitle.value = '修改手机号';
      break;
    case 'email':
      dialogTitle.value = '修改邮箱';
      break;
    case 'password':
      dialogTitle.value = '修改密码';
      break;
  }
  
  dialogVisible.value = true;
};

// 保存修改
const saveEdit = async () => {
  // 表单验证
  if (editType.value === 'realName' && !editForm.realName) {
    ElMessage.warning('请输入姓名');
    return;
  }
  if (editType.value === 'realName' && editForm.realName!.length > 50) {
    ElMessage.warning('姓名长度不能超过 50 个字符');
    return;
  }
  if (editType.value === 'mobile' && !editForm.mobile) {
    ElMessage.warning('请输入手机号');
    return;
  }
  if (editType.value === 'email' && !editForm.email) {
    ElMessage.warning('请输入邮箱');
    return;
  }
  if (editType.value === 'password') {
    if (!editForm.oldPassword) {
      ElMessage.warning('请输入原密码');
      return;
    }
    if (!editForm.newPassword) {
      ElMessage.warning('请输入新密码');
      return;
    }
    if (editForm.newPassword.length < 6 || editForm.newPassword.length > 20) {
      ElMessage.warning('密码长度应为 6-20 位');
      return;
    }
    const complexityResult = validatePasswordComplexity(editForm.newPassword);
    if (!complexityResult.valid) {
      ElMessage.warning(complexityResult.message);
      return;
    }
    if (editForm.oldPassword === editForm.newPassword) {
      ElMessage.warning('新密码不能与原密码相同');
      return;
    }
    if (editForm.newPassword !== editForm.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致');
      return;
    }
  }
    
    editLoading.value = true;
  try {
    let result;
    switch (editType.value) {
      case 'realName':
        result = await updateRealNameApi({ realName: editForm.realName! });
        break;
      case 'mobile':
        result = await updateMobileApi({ mobile: editForm.mobile! });
        break;
      case 'email':
        result = await updateEmailApi({ email: editForm.email! });
        break;
      case 'password':
        result = await changePasswordApi({ 
          oldPassword: editForm.oldPassword!, 
          newPassword: editForm.newPassword! 
        });
        break;
    }
    
    if (result && result.code === 200) {
      ElMessage.success('修改成功');
      dialogVisible.value = false;
      // 重新获取用户信息
      await fetchCurrentUser();
    } else {
      ElMessage.error(result?.message || '修改失败');
    }
  } catch (error: any) {
    console.error('修改失败:', error);
    ElMessage.error(error?.response?.data?.message || '修改失败');
  } finally {
    editLoading.value = false;
  }
};

onMounted(() => {
  fetchCurrentUser();
});
</script>

<template>
  <div class="p-6 h-full">
    <ElCard class="box-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">个人中心</span>
        </div>
      </template>

      <div class="profile-container">
        <ElDescriptions :column="1" border v-if="currentUser">
          <ElDescriptionsItem label="用户名">
            <span class="text-gray-700">{{ currentUser.username || '-' }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="密码">
            <div class="flex items-center justify-between">
              <span class="text-gray-700">******</span>
              <ElButton type="primary" link size="small" @click="openEditDialog('password')">
                修改
              </ElButton>
            </div>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="真实姓名">
            <div class="flex items-center justify-between">
              <span class="text-gray-700">{{ currentUser.realName || '-' }}</span>
              <ElButton type="primary" link size="small" @click="openEditDialog('realName')">
                修改
              </ElButton>
            </div>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="角色">
            <div class="flex flex-wrap gap-1">
              <ElTag
                v-for="role in currentUser.roles"
                :key="role"
                type="success"
                size="small"
              >
                {{ role }}
              </ElTag>
              <span v-if="!currentUser.roles || currentUser.roles.length === 0" class="text-gray-400">
                无角色
              </span>
            </div>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="手机号">
            <div class="flex items-center justify-between">
              <span class="text-gray-700">{{ currentUser.mobile || '-' }}</span>
              <ElButton type="primary" link size="small" @click="openEditDialog('mobile')">
                修改
              </ElButton>
            </div>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="邮箱">
            <div class="flex items-center justify-between">
              <span class="text-gray-700">{{ currentUser.email || '-' }}</span>
              <ElButton type="primary" link size="small" @click="openEditDialog('email')">
                修改
              </ElButton>
            </div>
          </ElDescriptionsItem>
        </ElDescriptions>
        <div v-else class="no-data">
          <p>暂无用户信息</p>
        </div>
      </div>
    </ElCard>

    <!-- 编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <ElForm :model="editForm" label-width="100px">
        <ElFormItem
          v-if="editType === 'realName'"
          label="姓名"
          required
        >
          <ElInput
            v-model="editForm.realName"
            placeholder="请输入姓名"
            maxlength="50"
          />
        </ElFormItem>
        <ElFormItem
          v-if="editType === 'mobile'"
          label="手机号"
          required
        >
          <ElInput
            v-model="editForm.mobile"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </ElFormItem>
        <ElFormItem
          v-if="editType === 'email'"
          label="邮箱"
          required
        >
          <ElInput
            v-model="editForm.email"
            placeholder="请输入邮箱"
          />
        </ElFormItem>
        <ElFormItem
          v-if="editType === 'password'"
          label="原密码"
          required
        >
          <ElInput
            v-model="editForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </ElFormItem>
        <ElFormItem
          v-if="editType === 'password'"
          label="新密码"
          required
        >
          <ElInput
            v-model="editForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20 位，需包含大写字母、小写字母、数字、特殊符号中的至少3种）"
            show-password
            maxlength="20"
          />
          <div v-if="editForm.newPassword" class="password-strength mt-2">
            <ElProgress
              :percentage="passwordStrengthPercent"
              :color="passwordStrengthColor"
              :stroke-width="6"
              :show-text="false"
            />
            <span :style="{ color: passwordStrengthColor, fontSize: '12px' }">
              {{ passwordStrengthText }}
            </span>
          </div>
        </ElFormItem>
        <ElFormItem
          v-if="editType === 'password'"
          label="确认密码"
          required
        >
          <ElInput
            v-model="editForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            maxlength="20"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="editLoading" @click="saveEdit">
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
}

.profile-container {
  width: 100%;
  max-width: 100%;
}

.box-card {
  margin-bottom: 20px;
  min-height: 400px;
}

.box-card :deep(.el-card__body) {
  padding: 0;
}

.profile-container :deep(.el-descriptions) {
  width: 100%;
}

/* 每行的样式 */
.profile-container :deep(.el-descriptions__body) {
  border-top: none;
}

.profile-container :deep(.el-descriptions__label) {
  width: 240px !important;
  font-weight: 500;
  padding: 16px 24px 16px 39px !important;
  background-color: transparent;
  border-bottom: 1px solid #f5f5f5;
}

.profile-container :deep(.el-descriptions__content) {
  padding: 16px 24px;
  background-color: transparent;
  border-bottom: 1px solid #f5f5f5;
}

/* 修改按钮的容器样式 */
.profile-container :deep(.flex.items-center.justify-between) {
  padding-right: 35px;
}

/* 鼠标悬停时显示非常淡的背景色 */
.profile-container :deep(.el-descriptions__row:hover) {
  background-color: #fafafa;
}

/* 最后一行去掉底部边框 */
.profile-container :deep(.el-descriptions__body > tr:last-child .el-descriptions__label),
.profile-container :deep(.el-descriptions__body > tr:last-child .el-descriptions__content) {
  border-bottom: none;
}

.no-data {
  text-align: center;
  padding: 80px 0;
  color: #999;
  font-size: 16px;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-strength :deep(.el-progress-bar__outer) {
  width: 120px;
}
</style>
