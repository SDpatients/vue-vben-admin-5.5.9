<script lang="ts" setup>
import type { ManagerApi } from '#/api/core/manager';
import type { StaffApi } from '#/api/core/staff';

import { onMounted, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElCard,
  ElCol,
  ElDialog,
  ElEmpty,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getManagerListApi } from '#/api/core/manager';
import {
  createStaffApi,
  deleteStaffApi,
  getAvailableUsersApi,
  getStaffListApi,
} from '#/api/core/staff';

const loading = ref(false);
const managerList = ref<ManagerApi.ManagerInfo[]>([]);
const selectedManager = ref<ManagerApi.ManagerInfo | null>(null);
const staffList = ref<StaffApi.StaffInfo[]>([]);
const staffLoading = ref(false);

const managerPagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});

const dialogVisible = ref(false);
const availableUsers = ref<StaffApi.AvailableUser[]>([]);
const availableUsersLoading = ref(false);
const selectedUserId = ref<number | undefined>(undefined);

const fetchManagerList = async () => {
  loading.value = true;
  try {
    const params: ManagerApi.ManagerQueryParams = {
      pageNum: managerPagination.page,
      pageSize: managerPagination.pageSize,
    };

    const response = await getManagerListApi(params);

    if (response.code === 200 && response.data) {
      managerList.value = response.data.list || [];
      managerPagination.itemCount = response.data.total || 0;
    } else {
      managerList.value = [];
      managerPagination.itemCount = 0;
    }
  } catch {
    ElMessage.error('获取管理人列表失败');
    managerList.value = [];
    managerPagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
};

const fetchStaffList = async () => {
  if (!selectedManager.value) {
    staffList.value = [];
    return;
  }

  staffLoading.value = true;
  try {
    const response = await getStaffListApi(selectedManager.value.id);

    if (response.code === 200 && response.data) {
      staffList.value = response.data;
    } else {
      staffList.value = [];
    }
  } catch {
    ElMessage.error('获取员工列表失败');
    staffList.value = [];
  } finally {
    staffLoading.value = false;
  }
};

const handleManagerClick = (manager: ManagerApi.ManagerInfo) => {
  selectedManager.value = manager;
  fetchStaffList();
};

const handleManagerPageChange = (page: number) => {
  managerPagination.page = page;
  fetchManagerList();
};

const handleManagerSizeChange = (size: number) => {
  managerPagination.pageSize = size;
  managerPagination.page = 1;
  fetchManagerList();
};

const fetchAvailableUsers = async () => {
  if (!selectedManager.value) return;

  availableUsersLoading.value = true;
  try {
    const response = await getAvailableUsersApi(selectedManager.value.id);
    if (response.code === 200 && response.data) {
      availableUsers.value = response.data;
    } else {
      availableUsers.value = [];
    }
  } catch {
    ElMessage.error('获取可用用户列表失败');
    availableUsers.value = [];
  } finally {
    availableUsersLoading.value = false;
  }
};

const openAddDialog = () => {
  if (!selectedManager.value) {
    ElMessage.warning('请先选择管理人');
    return;
  }
  selectedUserId.value = undefined;
  fetchAvailableUsers();
  dialogVisible.value = true;
};

const saveStaff = async () => {
  if (!selectedManager.value || !selectedUserId.value) {
    ElMessage.warning('请选择用户');
    return;
  }

  try {
    staffLoading.value = true;
    const response = await createStaffApi(selectedManager.value.id, {
      userId: selectedUserId.value,
    });
    if (response.code === 200) {
      ElMessage.success('新增成功');
      dialogVisible.value = false;
      fetchStaffList();
    } else {
      ElMessage.error(response.message || '新增失败');
    }
  } catch {
    ElMessage.error('新增失败');
  } finally {
    staffLoading.value = false;
  }
};

const handleDelete = async (staff: StaffApi.StaffInfo) => {
  if (!selectedManager.value) return;

  try {
    await ElMessageBox.confirm('确定要删除该员工吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    staffLoading.value = true;
    const response = await deleteStaffApi(selectedManager.value.id, staff.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      fetchStaffList();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  } finally {
    staffLoading.value = false;
  }
};

watch(selectedManager, () => {
  if (selectedManager.value) {
    fetchStaffList();
  }
});

onMounted(() => {
  fetchManagerList();
});
</script>

<template>
  <div class="staff-management-container p-4">
    <ElRow :gutter="20" class="h-full">
      <ElCol :span="6" class="h-full">
        <ElCard class="manager-card h-full">
          <template #header>
            <div class="card-header">
              <span class="font-semibold">管理人列表</span>
            </div>
          </template>

          <ElTable
            v-loading="loading"
            :data="managerList"
            :style="{ width: '100%' }"
            :height="500"
            highlight-current-row
            @current-change="handleManagerClick"
          >
            <ElTableColumn prop="administratorName" label="管理人名称" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <span>{{ row.administratorName }}</span>
                  <ElTag v-if="selectedManager?.id === row.id" type="success" size="small">
                    已选中
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>

          <div class="mt-4 flex justify-center">
            <el-pagination
              v-model:current-page="managerPagination.page"
              v-model:page-size="managerPagination.pageSize"
              :total="managerPagination.itemCount"
              :page-sizes="[10, 20, 50]"
              layout="prev, pager, next"
              size="small"
              @size-change="handleManagerSizeChange"
              @current-change="handleManagerPageChange"
            />
          </div>
        </ElCard>
      </ElCol>

      <ElCol :span="18" class="h-full">
        <ElCard class="staff-card h-full">
          <template #header>
            <div class="card-header">
              <span class="font-semibold">
                {{ selectedManager ? `${selectedManager.administratorName} - 员工列表` : '员工列表' }}
              </span>
              <ElButton
                type="primary"
                :disabled="!selectedManager"
                @click="openAddDialog"
              >
                <i class="i-lucide-plus mr-1"></i>
                新增员工
              </ElButton>
            </div>
          </template>

          <div v-if="!selectedManager" class="flex items-center justify-center" style="height: 400px">
            <ElEmpty description="请在左侧选择管理人" />
          </div>

          <ElTable
            v-else
            v-loading="staffLoading"
            :data="staffList"
            :style="{ width: '100%' }"
            :height="500"
            :border="true"
            :stripe="true"
          >
            <ElTableColumn type="index" label="序号" width="80" align="center" />
            <ElTableColumn prop="name" label="姓名" min-width="150" align="center" />
            <ElTableColumn prop="contactPhone" label="手机号" min-width="150" align="center" />
            <ElTableColumn label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <ElButton size="small" text type="danger" @click="handleDelete(row)">
                  <i class="i-lucide-trash-2 mr-1"></i>
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElDialog
      v-model="dialogVisible"
      title="新增员工"
      width="400px"
    >
      <div class="mb-2 text-gray-500 text-sm">选择要添加的员工：</div>
      <ElSelect
        v-model="selectedUserId"
        placeholder="请选择用户"
        :loading="availableUsersLoading"
        filterable
        style="width: 100%"
      >
        <ElOption
          v-for="user in availableUsers"
          :key="user.id"
          :label="`${user.realName} (${user.mobile})`"
          :value="user.id"
        >
          <div class="flex justify-between w-full">
            <span>{{ user.realName }}</span>
            <span class="text-gray-400 text-sm">{{ user.mobile }}</span>
          </div>
        </ElOption>
      </ElSelect>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :disabled="!selectedUserId" @click="saveStaff">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.staff-management-container {
  height: calc(100vh - 120px);
}

.manager-card,
.staff-card {
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
