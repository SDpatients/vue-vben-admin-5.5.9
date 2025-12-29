<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import ChatLayout from '../components/ChatLayout.vue';

const route = useRoute();
const router = useRouter();

// 获取联系人ID
const contactId = computed(() => Number(route.params.id) || 0);
const isEditMode = computed(() => contactId.value > 0);

// 表单状态
const formRef = ref();
const form = ref({
  name: '',
  phone: '',
  email: '',
  avatar: '',
  groupId: 1,
  description: '',
});

const rules = {
  name: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
};

// 模拟数据
const mockGroups = [
  { id: 1, name: '默认分组' },
  { id: 2, name: '家人' },
  { id: 3, name: '朋友' },
  { id: 4, name: '同事' },
];

const mockContact = {
  id: 1,
  name: '张三',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  groupId: 1,
  description: '这是一个测试联系人',
};

// 方法
async function initForm() {
  if (isEditMode.value) {
    // 模拟从API获取联系人信息
    setTimeout(() => {
      form.value = { ...mockContact };
    }, 500);
  }
}

async function submitForm() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 模拟提交表单
    setTimeout(() => {
      ElMessage.success(isEditMode.value ? '联系人编辑成功' : '联系人添加成功');
      router.push('/chat/contacts');
    }, 500);
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error);
  }
}

function resetForm() {
  if (formRef.value) {
    formRef.value.resetFields();
  }
}

function cancelEdit() {
  router.push('/chat/contacts');
}

function handleAvatarUpload(file: any) {
  // 模拟上传头像
  return new Promise((resolve, _reject) => {
    // 实际项目中这里应该调用API上传头像
    setTimeout(() => {
      const url = URL.createObjectURL(file.raw);
      form.value.avatar = url;
      resolve({ url });
    }, 1000);
  });
}

// 生命周期钩子
onMounted(() => {
  initForm();
});
</script>

<template>
  <ChatLayout>
    <!-- 联系人编辑页面 -->
    <div class="contact-edit-container">
      <!-- 顶部操作栏 -->
      <header class="edit-header">
        <div class="header-left">
          <el-button type="text" icon="el-icon-back" @click="cancelEdit">
            返回
          </el-button>
          <h2>{{ isEditMode ? '编辑联系人' : '新增联系人' }}</h2>
        </div>
        <div class="header-right">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm">
            {{ isEditMode ? '保存修改' : '添加联系人' }}
          </el-button>
        </div>
      </header>

      <!-- 表单内容 -->
      <main class="edit-content">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="contact-form"
        >
          <!-- 头像上传 -->
          <el-form-item label="头像">
            <div class="avatar-uploader">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :http-request="handleAvatarUpload"
                accept="image/*"
              >
                <img v-if="form.avatar" :src="form.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="avatar-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
            </div>
          </el-form-item>

          <!-- 姓名 -->
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入联系人姓名" />
          </el-form-item>

          <!-- 电话 -->
          <el-form-item label="电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱地址" />
          </el-form-item>

          <!-- 分组 -->
          <el-form-item label="分组">
            <el-select v-model="form.groupId" placeholder="请选择分组">
              <el-option
                v-for="group in mockGroups"
                :key="group.id"
                :label="group.name"
                :value="group.id"
              />
            </el-select>
          </el-form-item>

          <!-- 描述 -->
          <el-form-item label="描述">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入联系人描述"
              resize="vertical"
            />
          </el-form-item>
        </el-form>
      </main>
    </div>
  </ChatLayout>
</template>

<style scoped>
.contact-edit-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

/* 顶部操作栏样式 */
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.edit-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* 表单内容样式 */
.edit-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.contact-form {
  max-width: 800px;
  padding: 32px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

/* 头像上传样式 */
.avatar-uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.avatar {
  width: 120px;
  height: 120px;
  cursor: pointer;
  object-fit: cover;
  border: 2px solid #e4e7ed;
  border-radius: 50%;
  transition: all 0.2s;
}

.avatar:hover {
  border-color: #408aed;
  box-shadow: 0 0 0 4px rgb(64 138 237 / 10%);
}

.avatar-uploader-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  font-size: 48px;
  color: #c0c4cc;
  cursor: pointer;
  background-color: #f5f7fa;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
  transition: all 0.3s;
}

.avatar-uploader-icon:hover {
  color: #408aed;
  background-color: #ecf5ff;
  border-color: #408aed;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
}

/* 表单字段样式 */
.contact-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.contact-form :deep(.el-input__inner),
.contact-form :deep(.el-textarea__inner),
.contact-form :deep(.el-select__wrapper) {
  border-radius: 4px;
  transition: all 0.3s;
}

.contact-form :deep(.el-input__inner:focus),
.contact-form :deep(.el-textarea__inner:focus),
.contact-form :deep(.el-select__wrapper.is-focus) {
  border-color: #408aed;
  box-shadow: 0 0 0 2px rgb(64 138 237 / 20%);
}

/* 滚动条样式 */
.edit-content::-webkit-scrollbar {
  width: 6px;
}

.edit-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.edit-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.edit-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
