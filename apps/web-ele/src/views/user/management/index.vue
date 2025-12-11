<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import {
  ElCard,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { userApi } from '#/api/user';

interface User {
  row: number;
  U_PID: number;
  U_USER: string;
  U_NAME: string;
  U_TEL: null | string;
  U_EMAIL: null | string;
  U_REMARK: string;
  U_VALID: string;
}

// 响应式数据
const loading = ref(false);
const userList = ref<User[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
});

// 方法
const fetchUserList = async () => {
  try {
    loading.value = true;

    const params = {
      page: pagination.page,
      size: pagination.pageSize,
    };

    const response = await userApi.getAllUsers(params);

    if (response.status === '1') {
      // 安全检查
      if (!response.data) {
        userList.value = [];
        pagination.itemCount = 0;
        return;
      }

      if (!Array.isArray(response.data.records)) {
        userList.value = [];
        pagination.itemCount = response.data.count || 0;
        return;
      }

      userList.value = response.data.records;
      pagination.itemCount = response.data.count || 0;
    } else {
      ElMessage.error(response.error || '获取用户列表失败');
    }
  } catch {
    ElMessage.error('获取用户列表失败');
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
        </div>
      </template>

      <ElTable :data="userList" v-loading="loading" :style="{ width: '100%' }">
        <ElTableColumn type="index" label="序号" width="80" />
        <ElTableColumn prop="U_USER" label="用户名" width="120" />
        <ElTableColumn prop="U_NAME" label="姓名" width="120" />
        <ElTableColumn prop="U_TEL" label="电话" width="120" />
        <ElTableColumn prop="U_EMAIL" label="邮箱" width="150" />
        <ElTableColumn prop="U_REMARK" label="备注" width="200" />
        <ElTableColumn prop="U_VALID" label="状态" width="80">
          <template #default="{ row }">
            <ElTag :type="row.U_VALID === 'Y' ? 'success' : 'danger'">
              {{ row.U_VALID === 'Y' ? '启用' : '禁用' }}
            </ElTag>
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
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.box-card {
  margin-bottom: 20px;
}
</style>
