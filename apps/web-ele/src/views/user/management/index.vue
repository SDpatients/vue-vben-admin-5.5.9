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

interface UserForm {
  U_USER: string;
  U_NAME: string;
  U_TEL: string;
  U_EMAIL: string;
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
    console.log('开始获取用户列表...');
    console.log('当前页码:', pagination.page);
    console.log('每页大小:', pagination.pageSize);

    const params = {
      page: pagination.page,
      size: pagination.pageSize,
    };

    console.log('请求参数:', params);
    const response = await userApi.getAllUsers(params);

    console.log('API响应:', response);
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);

    if (response.status === '1') {
      console.log('API调用成功，开始处理数据...');

      // 安全检查
      if (!response.data) {
        console.error('响应数据为空');
        userList.value = [];
        pagination.itemCount = 0;
        return;
      }

      if (!Array.isArray(response.data.records)) {
        console.error('records不是数组:', response.data.records);
        userList.value = [];
        pagination.itemCount = response.data.count || 0;
        return;
      }

      userList.value = response.data.records;
      pagination.itemCount = response.data.count || 0;

      console.log('用户列表数据:', userList.value);
      console.log('用户列表长度:', userList.value.length);

      // 检查每个用户对象
      userList.value.forEach((user, index) => {
        console.log(`用户 ${index}:`, user);
      });
    } else {
      console.error('API返回错误:', response.error);
      ElMessage.error(response.error || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
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

      <ElTable :data="userList" v-loading="loading" style="width: 100%">
        <ElTableColumn type="index" label="序号" width="80" />
        <ElTableColumn prop="U_USER" label="用户名" width="120" />
        <ElTableColumn prop="U_NAME" label="姓名" width="120" />
        <ElTableColumn prop="U_TEL" label="电话" width="120" />
        <ElTableColumn prop="U_EMAIL" label="邮箱" width="150" />
        <ElTableColumn prop="U_REMARK" label="备注" width="200" />
        <ElTableColumn prop="U_VALID" label="状态" width="80">
          <template #default="scope">
            <ElTag
              :type="scope.row.U_VALID === 'Y' ? 'success' : 'danger'"
            >
              {{ scope.row.U_VALID === 'Y' ? '启用' : '禁用' }}
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
