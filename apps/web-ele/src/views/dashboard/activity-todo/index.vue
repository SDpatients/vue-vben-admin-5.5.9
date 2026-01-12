<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { activityApi, type Activity } from '#/api/core/activity';
import { todoApi, type Todo, type TodoDTO } from '#/api/core/todo';
import { useAccessStore } from '@vben/stores';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElSelect,
  ElOption,
  ElScrollbar,
  ElEmpty,
  ElMessage,
  ElDialog,
  ElInput,
  ElForm,
  ElFormItem,
  ElRadioGroup,
  ElRadioButton,
  ElTag,
  ElCheckbox,
  ElDatePicker,
  ElTabs,
  ElTabPane,
  ElAlert,
  ElTooltip,
} from 'element-plus';
import type { FormInstance } from 'element-plus';

const accessStore = useAccessStore();

const activeTab = ref('activity');
const loading = ref(false);
const activities = ref<Activity[]>([]);
const todos = ref<Todo[]>([]);
const selectedType = ref('');
const selectedStatus = ref('');
const selectedPriority = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

const createDialogVisible = ref(false);
const createForUserDialogVisible = ref(false);
const createFormRef = ref<FormInstance>();
const createForUserFormRef = ref<FormInstance>();

const createForm = ref<TodoDTO>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  deadline: '',
});

const createForUserForm = ref<TodoDTO & { targetUserId?: number }>({
  targetUserId: undefined,
  title: '',
  description: '',
  priority: 'MEDIUM',
  deadline: '',
});

const userOptions = ref([
  { label: '张三', value: 1 },
  { label: '李四', value: 2 },
  { label: '王五', value: 3 },
]);

const permissions = computed(() => accessStore.accessCodes);

const canViewAllActivities = computed(() => {
  return permissions.value.includes('activity:view:all');
});

const canViewAllTodos = computed(() => {
  return permissions.value.includes('todo:view:all');
});

const canCreateTodoForOthers = computed(() => {
  return permissions.value.includes('todo:create:all');
});

const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

const loadActivities = async () => {
  loading.value = true;
  try {
    const res = await activityApi.getMyActivityList(currentPage.value, pageSize.value);
    activities.value = res.data || [];
  } catch (error) {
    ElMessage.error('加载动态失败');
  } finally {
    loading.value = false;
  }
};

const loadTodos = async () => {
  loading.value = true;
  try {
    // 新API页码从0开始，所以传递0而不是1
    const res = await todoApi.getTodoList(
      selectedStatus.value || undefined,
      selectedPriority.value || undefined,
      0,
      20,
    );
    // 新API响应格式中，待办事项在content字段中
    todos.value = res.data?.content || [];
  } catch (error) {
    ElMessage.error('加载待办失败');
  } finally {
    loading.value = false;
  }
};

const showCreateModal = () => {
  createForm.value = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
  };
  createDialogVisible.value = true;
};

const handleCreate = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await todoApi.createTodo(createForm.value);
        ElMessage.success('创建成功');
        createDialogVisible.value = false;
        loadTodos();
      } catch (error) {
        ElMessage.error('创建失败');
      }
    }
  });
};

const showCreateForUserModal = () => {
  createForUserForm.value = {
    targetUserId: undefined,
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
  };
  createForUserDialogVisible.value = true;
};

const handleCreateForUser = async () => {
  if (!createForUserFormRef.value) return;
  await createForUserFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!createForUserForm.value.targetUserId) {
        ElMessage.warning('请选择用户');
        return;
      }
      try {
        await todoApi.createTodoForUser(createForUserForm.value.targetUserId, {
          title: createForUserForm.value.title,
          description: createForUserForm.value.description,
          priority: createForUserForm.value.priority,
          deadline: createForUserForm.value.deadline,
        });
        ElMessage.success('创建成功');
        createForUserDialogVisible.value = false;
        loadTodos();
      } catch (error) {
        ElMessage.error('创建失败');
      }
    }
  });
};

const toggleTodoStatus = async (item: Todo) => {
  try {
    if (item.status === 'COMPLETED') {
      await todoApi.updateTodo(item.id, { status: 'PENDING' });
      item.status = 'PENDING';
      ElMessage.success('已取消完成');
    } else {
      await todoApi.completeTodo(item.id);
      item.status = 'COMPLETED';
      ElMessage.success('已完成');
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const deleteTodo = async (id: number) => {
  try {
    await todoApi.deleteTodo(id);
    todos.value = todos.value.filter((item) => item.id !== id);
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    CREATE_CASE: 'lucide:file-plus',
    UPDATE_CASE: 'lucide:file-edit',
    DELETE_CASE: 'lucide:file-x',
    SUBMIT: 'lucide:send',
    APPROVE_PASS: 'lucide:check-circle',
    APPROVE_REJECT: 'lucide:x-circle',
    CREATE_TODO: 'lucide:plus-circle',
    COMPLETE_TODO: 'lucide:check-square',
    CANCEL_TODO: 'lucide:x-square',
    DELETE_TODO: 'lucide:trash-2',
  };
  return iconMap[type] || 'lucide:activity';
};

const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    CREATE_CASE: '#1890ff',
    UPDATE_CASE: '#1890ff',
    DELETE_CASE: '#ff4d4f',
    SUBMIT: '#722ed1',
    APPROVE_PASS: '#52c41a',
    APPROVE_REJECT: '#ff4d4f',
    CREATE_TODO: '#1890ff',
    COMPLETE_TODO: '#52c41a',
    CANCEL_TODO: '#faad14',
    DELETE_TODO: '#ff4d4f',
  };
  return colorMap[type] || '#999';
};

const getActivityTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    CREATE_CASE: '创建案件',
    UPDATE_CASE: '更新案件',
    DELETE_CASE: '删除案件',
    SUBMIT: '提交审核',
    APPROVE_PASS: '审核通过',
    APPROVE_REJECT: '审核驳回',
    CREATE_TODO: '创建待办',
    COMPLETE_TODO: '完成待办',
    CANCEL_TODO: '取消待办',
    DELETE_TODO: '删除待办',
  };
  return textMap[type] || type;
};

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'success',
  };
  return colorMap[priority] || 'info';
};

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
  };
  return textMap[priority] || priority;
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '待处理',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return textMap[status] || status;
};

onMounted(() => {
  loadActivities();
  loadTodos();
});
</script>

<template>
  <div class="activity-todo-container">
    <div class="container-header">
      <h2>动态与待办事项管理</h2>
      <ElAlert
        title="权限说明"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="permission-info">
            <p><strong>普通用户：</strong>只能查看和管理自己的动态和待办事项</p>
            <p><strong>审核员：</strong>可以查看所有用户的动态和待办事项</p>
            <p><strong>管理员：</strong>可以查看所有用户的动态和待办事项，并可以为其他用户创建待办</p>
          </div>
        </template>
      </ElAlert>
    </div>

    <div class="container-body">
      <ElTabs v-model="activeTab" type="border-card">
        <ElTabPane label="动态管理" name="activity">
          <div class="tab-header">
            <h3>最新动态</h3>
            <div class="tab-actions">
              <ElSelect
                v-model="selectedType"
                style="width: 150px"
                placeholder="全部类型"
                @change="loadActivities"
              >
                <ElOption label="全部" value="" />
                <ElOption label="创建案件" value="CREATE_CASE" />
                <ElOption label="更新案件" value="UPDATE_CASE" />
                <ElOption label="删除案件" value="DELETE_CASE" />
                <ElOption label="提交审核" value="SUBMIT" />
                <ElOption label="审核通过" value="APPROVE_PASS" />
                <ElOption label="审核驳回" value="APPROVE_REJECT" />
                <ElOption label="创建待办" value="CREATE_TODO" />
                <ElOption label="完成待办" value="COMPLETE_TODO" />
              </ElSelect>
            </div>
          </div>
          <div class="activity-list">
            <ElScrollbar max-height="600px">
              <div v-loading="loading">
                <div
                  v-for="(item, index) in activities"
                  :key="item.id"
                  class="activity-item"
                >
                  <div class="activity-icon" :style="{ backgroundColor: getActivityColor(item.type) }">
                    <Icon :icon="getActivityIcon(item.type)" :size="18" color="#fff" />
                  </div>
                  <div class="activity-content-wrapper">
                    <div class="activity-header-row">
                      <span class="activity-user">{{ item.userName }}</span>
                      <ElTag size="small" :color="getActivityColor(item.type)" effect="plain">
                        {{ getActivityTypeText(item.type) }}
                      </ElTag>
                    </div>
                    <div class="activity-content">{{ item.content }}</div>
                    <div class="activity-time">{{ formatTime(item.createTime) }}</div>
                  </div>
                  <div v-if="index < activities.length - 1" class="activity-line" />
                </div>
                <ElEmpty v-if="activities.length === 0 && !loading" description="暂无动态" />
              </div>
            </ElScrollbar>
          </div>
        </ElTabPane>

        <ElTabPane label="待办事项" name="todo">
          <div class="tab-header">
            <h3>待办事项</h3>
            <div class="tab-actions">
              <ElButton type="primary" size="small" @click="showCreateModal">
                <Icon icon="lucide:plus" :size="14" />
                新建待办
              </ElButton>
              <ElTooltip v-if="canCreateTodoForOthers" content="为其他用户创建待办事项" placement="top">
                <ElButton type="success" size="small" @click="showCreateForUserModal">
                  <Icon icon="lucide:user-plus" :size="14" />
                  为用户创建待办
                </ElButton>
              </ElTooltip>
            </div>
          </div>
          <div class="todo-filters">
            <ElRadioGroup v-model="selectedStatus" @change="loadTodos" size="small">
              <ElRadioButton value="">全部</ElRadioButton>
              <ElRadioButton value="PENDING">待处理</ElRadioButton>
              <ElRadioButton value="IN_PROGRESS">进行中</ElRadioButton>
              <ElRadioButton value="COMPLETED">已完成</ElRadioButton>
            </ElRadioGroup>
            <ElSelect
              v-model="selectedPriority"
              style="width: 120px; margin-left: 12px"
              placeholder="优先级"
              size="small"
              @change="loadTodos"
            >
              <ElOption label="全部优先级" value="" />
              <ElOption label="高" value="HIGH" />
              <ElOption label="中" value="MEDIUM" />
              <ElOption label="低" value="LOW" />
            </ElSelect>
          </div>
          <div class="todo-items">
            <ElScrollbar max-height="500px">
              <div v-loading="loading">
                <div
                  v-for="item in todos"
                  :key="item.id"
                  class="todo-item"
                  :class="{
                    completed: item.status === 'COMPLETED',
                    high: item.priority === 'HIGH',
                    medium: item.priority === 'MEDIUM',
                    low: item.priority === 'LOW',
                  }"
                >
                  <div class="todo-checkbox">
                    <ElCheckbox
                      :model-value="item.status === 'COMPLETED'"
                      @change="toggleTodoStatus(item)"
                    />
                  </div>
                  <div class="todo-content">
                    <div class="todo-title">{{ item.title }}</div>
                    <div v-if="item.description" class="todo-description">
                      {{ item.description }}
                    </div>
                    <div class="todo-meta">
                      <ElTag :type="getPriorityColor(item.priority)" size="small">
                        {{ getPriorityText(item.priority) }}
                      </ElTag>
                      <ElTag type="info" size="small">
                        {{ getStatusText(item.status) }}
                      </ElTag>
                      <span v-if="item.deadline" class="todo-deadline">
                        <Icon icon="lucide:clock" :size="12" />
                        {{ formatTime(item.deadline) }}
                      </span>
                    </div>
                  </div>
                  <div class="todo-actions">
                    <ElButton circle size="small" type="danger" @click="deleteTodo(item.id)">
                      <Icon icon="lucide:trash-2" :size="14" />
                    </ElButton>
                  </div>
                </div>
                <ElEmpty v-if="todos.length === 0 && !loading" description="暂无待办事项" />
              </div>
            </ElScrollbar>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <ElDialog v-model="createDialogVisible" title="新建待办" width="500px">
      <ElForm ref="createFormRef" :model="createForm" label-width="80px">
        <ElFormItem label="标题" required>
          <ElInput v-model="createForm.title" placeholder="请输入待办标题" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入待办描述" />
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElSelect v-model="createForm.priority" placeholder="请选择优先级">
            <ElOption label="高" value="HIGH" />
            <ElOption label="中" value="MEDIUM" />
            <ElOption label="低" value="LOW" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="截止时间">
          <ElDatePicker
            v-model="createForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleCreate">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="createForUserDialogVisible" title="为用户创建待办" width="500px">
      <ElForm ref="createForUserFormRef" :model="createForUserForm" label-width="80px">
        <ElFormItem label="选择用户" required>
          <ElSelect
            v-model="createForUserForm.targetUserId"
            placeholder="请选择用户"
            style="width: 100%"
          >
            <ElOption
              v-for="user in userOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="标题" required>
          <ElInput v-model="createForUserForm.title" placeholder="请输入待办标题" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="createForUserForm.description" type="textarea" :rows="3" placeholder="请输入待办描述" />
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElSelect v-model="createForUserForm.priority" placeholder="请选择优先级">
            <ElOption label="高" value="HIGH" />
            <ElOption label="中" value="MEDIUM" />
            <ElOption label="低" value="LOW" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="截止时间">
          <ElDatePicker
            v-model="createForUserForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createForUserDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleCreateForUser">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.activity-todo-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.container-header {
  margin-bottom: 20px;
}

.container-header h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.permission-info {
  font-size: 14px;
  line-height: 1.8;
}

.permission-info p {
  margin: 4px 0;
}

.container-body {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.tab-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.tab-actions {
  display: flex;
  gap: 8px;
}

.activity-list {
  position: relative;
  padding: 0 20px 20px 20px;
}

.activity-item {
  display: flex;
  position: relative;
  padding-bottom: 24px;
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 16px;
  z-index: 1;
}

.activity-content-wrapper {
  flex: 1;
  min-width: 0;
}

.activity-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.activity-user {
  font-weight: 500;
  color: #1890ff;
  font-size: 14px;
}

.activity-content {
  color: #333;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.6;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-line {
  position: absolute;
  left: 17px;
  top: 36px;
  bottom: 0;
  width: 2px;
  background-color: #f0f0f0;
}

.todo-filters {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 20px;
}

.todo-items {
  padding: 0 20px 20px 20px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
  background: #fff;
}

.todo-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
}

.todo-item.high {
  border-left: 4px solid #ff4d4f;
}

.todo-item.medium {
  border-left: 4px solid #faad14;
}

.todo-item.low {
  border-left: 4px solid #52c41a;
}

.todo-checkbox {
  margin-right: 12px;
  margin-top: 2px;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 15px;
  color: #1a1a1a;
}

.todo-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.todo-deadline {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.todo-actions {
  display: flex;
  gap: 6px;
}
</style>
