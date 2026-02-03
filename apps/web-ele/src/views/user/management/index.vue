<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElPagination,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
  ElTag,
  ElMessageBox,
} from 'element-plus';

import { userApi } from '#/api/user';

interface User {
  id: number;
  username: string;
  realName: string;
  mobile: string;
  email: string;
  phone: string;
  status: string;
}

interface UserForm {
  username: string;
  password?: string;
  realName: string;
  mobile: string;
  email: string;
  phone: string;
  status: string;
}

// 响应式数据
const loading = ref(false);
const userList = ref<User[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
});

// 新增用户
const dialogVisible = ref(false);
const dialogTitle = ref('新增用户');
const form = reactive<UserForm>({
  username: '',
  password: '',
  realName: '',
  mobile: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
});

const editingUser = ref<User | null>(null);

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: !editingUser.value, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
};

// 方法
const fetchUserList = async () => {
  try {
    loading.value = true;

    const params = {
      page: pagination.page,
      size: pagination.pageSize,
    };

    const response = await userApi.getAllUsers(params);

    // 安全检查
    if (!response) {
      userList.value = [];
      pagination.itemCount = 0;
      return;
    }

    if (!Array.isArray(response.users)) {
      userList.value = [];
      pagination.itemCount = response.total || 0;
      return;
    }

    userList.value = response.users;
    pagination.itemCount = response.total || 0;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error('获取用户列表错误:', error);
  } finally {
    loading.value = false;
  }
};

// 打开新增用户弹窗
const openAddDialog = () => {
  dialogTitle.value = '新增用户';
  editingUser.value = null;
  Object.assign(form, {
    username: '',
    password: '',
    realName: '',
    mobile: '',
    email: '',
    status: 'ACTIVE',
  });
  dialogVisible.value = true;
};

// 打开编辑用户弹窗
const openEditDialog = (user: User) => {
  dialogTitle.value = '编辑用户';
  editingUser.value = user;
  Object.assign(form, {
    username: user.username,
    password: '',
    realName: user.realName,
    mobile: user.mobile,
    email: user.email || '',
    status: user.status,
  });
  dialogVisible.value = true;
};

// 保存用户
const saveUser = async () => {
  try {
    loading.value = true;
    let response;
    if (editingUser.value) {
      // 修改用户
      response = await userApi.updateUser(editingUser.value.id, form);
    } else {
      // 新增用户
      response = await userApi.createUser(form);
    }
    
    ElMessage.success(editingUser.value ? '修改成功' : '新增成功');
    dialogVisible.value = false;
    fetchUserList();
  } catch (error) {
    ElMessage.error(editingUser.value ? '修改失败' : '新增失败');
    console.error('操作失败:', error);
  } finally {
    loading.value = false;
  }
};

// 删除用户
const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    loading.value = true;
    await userApi.deleteUser(user.id);
    
    ElMessage.success('删除成功');
    fetchUserList();
  } catch (error: any) {
    if (error === 'cancel') return;
    ElMessage.error('删除失败');
    console.error('删除失败:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchUserList();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  fetchUserList();
};

// 生命周期
onMounted(() => {
  fetchUserList();
});
</script>

<template>
  <div class="p-6">
    <ElCard class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <ElButton type="primary" @click="openAddDialog">
            新增用户
          </ElButton>
        </div>
      </template>

      <ElTable :data="userList" v-loading="loading" :style="{ width: '100%' }">
        <ElTableColumn type="index" label="序号" width="80" />
        <ElTableColumn prop="username" label="用户名" width="120" />
        <ElTableColumn prop="realName" label="姓名" width="120" />
        <ElTableColumn prop="mobile" label="电话" width="120" />
        <ElTableColumn prop="email" label="邮箱" width="150" />
        <ElTableColumn prop="status" label="状态" width="80">
          <template #default="{ row }">
            <ElTag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180">
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              @click="openEditDialog(row)"
              class="mr-2"
            >
              编辑
            </ElButton>
            <ElButton
              type="danger"
              size="small"
              @click="deleteUser(row)"
            >
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-container">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.itemCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>

    <!-- 新增/编辑用户弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <ElForm :model="form" label-width="100px">
        <ElFormItem label="用户名" required>
          <ElInput v-model="form.username" placeholder="请输入用户名" autocomplete="off" />
        </ElFormItem>
        <ElFormItem v-if="!editingUser" label="密码" required>
          <ElInput
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="off"
          />
        </ElFormItem>
        <ElFormItem label="姓名" required>
          <ElInput v-model="form.realName" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="手机号" required>
          <ElInput v-model="form.mobile" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="邮箱">
          <ElInput v-model="form.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="form.status" placeholder="请选择状态">
            <ElOption label="启用" value="ACTIVE" />
            <ElOption label="禁用" value="INACTIVE" />
            <ElOption label="锁定" value="LOCKED" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="saveUser">确定</ElButton>
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
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.box-card {
  margin-bottom: 20px;
}
</style>
