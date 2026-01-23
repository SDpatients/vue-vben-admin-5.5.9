<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { todoApi, type Todo, type TodoDTO } from '#/api/core/todo';
import { Icon } from '@iconify/vue';
import { ElButton, ElCheckbox, ElTag, ElSelect, ElOption, ElRadioGroup, ElRadioButton, ElScrollbar, ElEmpty, ElMessage, ElMessageBox, ElDialog, ElInput, ElForm, ElFormItem, ElDatePicker } from 'element-plus';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const todos = ref<Todo[]>([]);
const selectedStatus = ref('');
const selectedPriority = ref('');

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const createFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();
const currentEditTodo = ref<Todo | null>(null);

const createForm = ref<TodoDTO>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  deadline: '',
});

const editForm = ref<Partial<TodoDTO>>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  deadline: '',
});

const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadTodos = async () => {
  loading.value = true;
  try {
    let res;
    if (selectedStatus.value === 'PENDING') {
      // 调用待处理待办事项接口
      res = await todoApi.getPendingTodos();
      // 新API响应格式直接返回数据数组
      todos.value = res.data || [];
    } else if (selectedStatus.value === 'COMPLETED') {
      // 调用已完成待办事项接口
      res = await todoApi.getCompletedTodos();
      // 新API响应格式直接返回数据数组
      todos.value = res.data || [];
    } else {
      // 调用原接口获取其他状态的待办事项
      res = await todoApi.getTodoList(
        selectedStatus.value || undefined,
        selectedPriority.value || undefined,
        0,
        20,
      );
      // 原API响应格式中，待办事项在content字段中
      todos.value = res.data?.content || [];
    }
  } catch (error) {
    console.error('加载待办失败:', error);
  } finally {
    loading.value = false;
  }
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

const editTodo = (item: Todo) => {
  currentEditTodo.value = item;
  editForm.value = {
    title: item.title,
    description: item.description,
    priority: item.priority,
    deadline: item.deadline || '',
  };
  editDialogVisible.value = true;
};

const handleEdit = async () => {
  if (!editFormRef.value || !currentEditTodo.value) return;
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await todoApi.updateTodo(currentEditTodo.value!.id, editForm.value);
        ElMessage.success('更新成功');
        editDialogVisible.value = false;
        loadTodos();
      } catch (error) {
        ElMessage.error('更新失败');
      }
    }
  });
};

const deleteTodo = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该待办事项吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await todoApi.deleteTodo(id);
    todos.value = todos.value.filter((item) => item.id !== id);
    ElMessage.success('删除成功');
  } catch (error: any) {
    if (error === 'cancel') {
      return;
    }
    ElMessage.error('删除失败');
  }
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
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return textMap[status] || status;
};

onMounted(() => {
  loadTodos();
});
</script>

<template>
  <div class="todo-list">
    <div class="todo-header">
      <h3>待办事项</h3>
      <ElButton type="primary" size="small" @click="showCreateModal">
        <Icon icon="lucide:plus" :size="14" />
        新建
      </ElButton>
    </div>
    <div class="todo-filters">
      <ElRadioGroup v-model="selectedStatus" @change="loadTodos" size="small">
        <ElRadioButton value="">全部</ElRadioButton>
        <ElRadioButton value="PENDING">待处理</ElRadioButton>
        <ElRadioButton value="COMPLETED">已完成</ElRadioButton>
      </ElRadioGroup>
      <ElSelect
        v-model="selectedPriority"
        style="width: 100px; margin-left: 12px"
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
      <ElScrollbar :max-height="'500px'">
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
              <span 
                class="todo-status" 
                :class="{
                  'status-pending': item.status === 'PENDING',
                  'status-completed': item.status === 'COMPLETED',
                  'status-cancelled': item.status === 'CANCELLED'
                }"
              >
                {{ getStatusText(item.status) }}
              </span>
              <span v-if="item.deadline" class="todo-deadline">
                <Icon icon="lucide:clock" :size="12" />
                {{ formatTime(item.deadline) }}
              </span>
            </div>
            </div>
            <div class="todo-actions">
              <ElButton circle size="small" @click="editTodo(item)">
                <Icon icon="lucide:edit-2" :size="14" />
              </ElButton>
              <ElButton circle size="small" type="danger" @click="deleteTodo(item.id)">
                <Icon icon="lucide:trash-2" :size="14" />
              </ElButton>
            </div>
          </div>
          <ElEmpty v-if="todos.length === 0 && !loading" description="暂无待办事项" />
        </div>
      </ElScrollbar>
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

    <ElDialog v-model="editDialogVisible" title="编辑待办" width="500px">
      <ElForm ref="editFormRef" :model="editForm" label-width="80px">
        <ElFormItem label="标题" required>
          <ElInput v-model="editForm.title" placeholder="请输入待办标题" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入待办描述" />
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElSelect v-model="editForm.priority" placeholder="请选择优先级">
            <ElOption label="高" value="HIGH" />
            <ElOption label="中" value="MEDIUM" />
            <ElOption label="低" value="LOW" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="截止时间">
          <ElDatePicker
            v-model="editForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleEdit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.todo-list {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  height: 100%; /* 确保组件占满父容器高度 */
}

.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.todo-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.todo-filters {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.todo-items {
  height: calc(100% - 112px); /* 100%减去header和filters的高度 */
}

.todo-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: all 0.2s;
}

.todo-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 10%);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
}

.todo-item.high {
  border-left: 3px solid #ff4d4f;
}

.todo-item.medium {
  border-left: 3px solid #faad14;
}

.todo-item.low {
  border-left: 3px solid #52c41a;
}

.todo-checkbox {
  margin-top: 2px;
  margin-right: 12px;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
}

.todo-description {
  display: -webkit-box;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  font-size: 13px;
  color: #666;
  -webkit-box-orient: vertical;
}

.todo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.todo-deadline {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.todo-status {
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  color: #ff4d4f;
}

.status-completed {
  color: #52c41a;
}

.status-cancelled {
  color: #999;
}

.todo-actions {
  display: flex;
  gap: 4px;
}

/* 滚动条样式 */
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-scrollbar__bar.is-vertical) {
  width: 8px !important;
  right: 2px !important;
}

:deep(.el-scrollbar__thumb) {
  background-color: #c1c1c1 !important;
  border-radius: 4px !important;
}

:deep(.el-scrollbar__thumb:hover) {
  background-color: #a8a8a8 !important;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  height: 8px !important;
  bottom: 2px !important;
}
</style>
