<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  getUserListApi,
  deleteUserApi,
} from '#/api/core/user-management';
import { loginApi } from '#/api/core/auth';
import { useUserStore } from '@vben/stores';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const users = ref<any[]>([]);

const searchForm = reactive({
  keyword: '',
  status: undefined as string | undefined,
});

const statusOptions = [
  { label: '正常', value: 'ACTIVE' },
  { label: '未激活', value: 'INACTIVE' },
  { label: '已锁定', value: 'LOCKED' },
  { label: '已删除', value: 'DELETED' },
];

const isAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('ADMIN') || roles.includes('admin') || roles.includes('管理员') || roles.includes('SUPER_ADMIN') || roles.includes('超级管理员');
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await getUserListApi({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status as any,
    });
    users.value = response.data.users || [];
    total.value = response.data.total || 0;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error('获取用户列表失败:', error);
    users.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = undefined;
  currentPage.value = 1;
  fetchUsers();
};

const handleAdd = () => {
  router.push('/expense-system/user-management/add');
};

const handleDelete = async (row: any) => {
  try {
    const { value: password } = await ElMessageBox.prompt(
      `请输入当前管理员密码以确认删除用户「${row.realName || row.username}」（ID: ${row.id}）：`,
      '删除确认 - 密码校验',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        inputType: 'password',
        inputPlaceholder: '请输入登录密码',
      },
    );

    if (!password) {
      ElMessage.warning('请输入密码');
      return;
    }

    const currentUsername = userStore.userInfo?.username || localStorage.getItem('chat_username');
    if (!currentUsername) {
      ElMessage.error('无法获取当前用户信息');
      return;
    }

    const verifyRes = await loginApi({ username: currentUsername, password });
    if (verifyRes.code !== 200) {
      ElMessage.error(verifyRes.message || '密码验证失败');
      return;
    }

    loading.value = true;
    const response = await deleteUserApi(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      fetchUsers();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      const errorMsg = error?.response?.data?.message || error?.message || '删除失败';
      ElMessage.error(errorMsg);
      console.error('删除用户失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchUsers();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchUsers();
};

const getStatusTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    ACTIVE: { type: 'success', text: '正常' },
    INACTIVE: { type: 'info', text: '未激活' },
    LOCKED: { type: 'warning', text: '已锁定' },
    DELETED: { type: 'danger', text: '已删除' },
  };
  return map[status] || { type: 'info', text: status };
};

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-management-page">
    <div class="page-header">
      <h1>用户管理</h1>
    </div>

    <div class="user-management-content">
      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="60px">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="用户名/姓名/手机号/邮箱"
              clearable
              style="width: 250px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleAdd">
              新增用户
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="hover" class="list-card">
        <el-table v-loading="loading" :data="users" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="realName" label="真实姓名" width="120" />
          <el-table-column prop="mobile" label="手机号" width="140" />
          <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
          <el-table-column prop="phone" label="座机号" width="140" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status).type" size="small">
                {{ getStatusTag(scope.row.status).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="loginCount" label="登录次数" width="90" align="center" />
          <el-table-column label="最后登录时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.lastLoginTime) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="!loading">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.user-management-page {
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
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.user-management-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.search-card {
  margin-bottom: 16px;
}

.list-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
