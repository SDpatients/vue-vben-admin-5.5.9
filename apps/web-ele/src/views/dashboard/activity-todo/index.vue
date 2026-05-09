<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { todoApi, parseApiResponse, type Todo, type TodoDTO, type TodoUpdateRequest, type MyTodoStatisticsResponse } from '#/api/core/todo';
import { getUsersApi } from '#/api/core/user';
import { getCaseDetailApi } from '#/api/core/case';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElSelect,
  ElOption,
  ElEmpty,
  ElMessage,
  ElDialog,
  ElInput,
  ElForm,
  ElFormItem,
  ElTag,
  ElCheckbox,
  ElDatePicker,
  ElTabs,
  ElTabPane,
  ElTooltip,
  ElPagination,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElCard,
  ElRow,
  ElCol,
  ElBadge,
} from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 加载状态
const loading = ref(false);
const statsLoading = ref(false);

// 统计数据
const stats = ref<MyTodoStatisticsResponse>({
  inProgressTodos: 0,
  completedTodos: 0,
  overdueTodos: 0,
});

// 待办列表数据
const todos = ref<Todo[]>([]);
const totalElements = ref(0);
const totalPages = ref(0);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选参数
const activeTab = ref('all');
const selectedStatus = ref('');
const selectedPriority = ref('');
const selectedType = ref('');
const searchKeyword = ref('');
const dateRange = ref<[Date, Date] | null>(null);

// 对话框状态
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const assignDialogVisible = ref(false);
const caseSelectDialogVisible = ref(false);

// 案件选择弹窗状态
const caseSearchKeyword = ref('');
const caseList = ref<Array<{ id: number; caseNumber: string; caseName: string }>>([]);
const caseLoading = ref(false);
const caseCurrentPage = ref(1);
const casePageSize = ref(10);
const caseTotal = ref(0);
const selectedCase = ref<{ id: number; caseNumber: string; caseName: string } | null>(null);
const isSelectingForEdit = ref(false);

// 表单引用
const createFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();
const assignFormRef = ref<FormInstance>();

// 当前选中的待办
const currentTodo = ref<Todo | null>(null);
const detailCaseNumber = ref<string>('');

// 表单数据
const createForm = ref<TodoDTO>({
  title: '',
  description: '',
  priority: 'NORMAL',
  type: '',
  deadline: '',
  remark: '',
  caseNumber: '',
  caseId: undefined,
});

const editForm = ref<TodoUpdateRequest>({
  title: '',
  description: '',
  priority: 'NORMAL',
  type: '',
  deadline: '',
  remark: '',
  caseNumber: '',
  caseId: undefined,
});

const assignForm = ref({
  assigneeId: undefined as number | undefined,
  assigneeName: '',
});

// 用户选项（从真实API获取）
const userOptions = ref<Array<{ label: string; value: number }>>([]);
const usersLoading = ref(false);

// 加载用户列表
const loadUsers = async () => {
  usersLoading.value = true;
  try {
    const res = await getUsersApi('', 1, 1000);
    // 使用通用解析函数处理用户数据
    const parsed = parseApiResponse(res);
    userOptions.value = parsed.data.map((user: any) => ({
      label: user.name || user.userName || `用户${user.userId}`,
      value: user.userId || user.id,
    }));
  } catch (error) {
    console.error('加载用户列表失败:', error);
  } finally {
    usersLoading.value = false;
  }
};

// 表单校验规则
const createRules: FormRules = {
  title: [{ required: true, message: '请输入待办标题', trigger: 'blur' }],
};

const editRules: FormRules = {
  title: [{ required: true, message: '请输入待办标题', trigger: 'blur' }],
};

const assignRules: FormRules = {
  assigneeId: [{ required: true, message: '请选择被分配人', trigger: 'change' }],
  assigneeName: [{ required: true, message: '请输入被分配人姓名', trigger: 'blur' }],
};

// 优先级配置
const priorityConfig: Record<string, { label: string; color: string; type: 'danger' | 'warning' | 'success' | 'info' }> = {
  URGENT: { label: '紧急', color: '#ff4d4f', type: 'danger' },
  HIGH: { label: '高', color: '#ff7a45', type: 'danger' },
  NORMAL: { label: '普通', color: '#faad14', type: 'warning' },
  LOW: { label: '低', color: '#52c41a', type: 'success' },
};

// 状态配置
const statusConfig: Record<string, { label: string; color: string; type: 'success' | 'warning' | 'info' | 'danger' }> = {
  PENDING: { label: '待处理', color: '#faad14', type: 'warning' },
  COMPLETED: { label: '已完成', color: '#52c41a', type: 'success' },
};

// 类型配置
const typeOptions = [
  { label: '工作', value: 'WORK' },
  { label: '个人', value: 'PERSONAL' },
  { label: '紧急', value: 'URGENT' },
  { label: '其他', value: 'OTHER' },
];

// 计算属性：筛选后的待办列表（仅前端关键词过滤）
const filteredTodos = computed(() => {
  let result = todos.value;

  // 前端关键词过滤（后端 searchTodos 暂不支持关键词搜索）
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (todo) =>
        todo.title.toLowerCase().includes(keyword) ||
        (todo.description && todo.description.toLowerCase().includes(keyword)),
    );
  }

  return result;
});

// 计算属性：是否显示批量操作
const showBatchActions = computed(() => {
  return selectedTodos.value.length > 0;
});

// 选中的待办ID列表
const selectedTodos = ref<number[]>([]);

// 使用 api/core/todo.ts 中统一的 parseApiResponse 函数解析响应

// 获取统计数据
const loadStats = async () => {
  statsLoading.value = true;
  try {
    const res: any = await todoApi.getMyStats();
    // 兼容两种返回格式：
    // 1. 拦截器已解包：res = { inProgressTodos, completedTodos, overdueTodos }
    // 2. 拦截器未解包：res = { code, message, data: { inProgressTodos, ... } }
    if (res && typeof res === 'object' && 'inProgressTodos' in res) {
      stats.value = res as MyTodoStatisticsResponse;
    } else if (res && res.data && typeof res.data === 'object' && 'inProgressTodos' in res.data) {
      stats.value = res.data as MyTodoStatisticsResponse;
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    statsLoading.value = false;
  }
};

// 构建统一的搜索参数
const buildSearchParams = () => {
  const params: {
    type?: string;
    status?: string;
    priority?: string;
    pageNum: number;
    pageSize: number;
  } = {
    pageNum: currentPage.value - 1, // Spring Data 使用 0-based 分页
    pageSize: pageSize.value,
  };

  // 根据当前 tab 设置状态（tab 优先级高于状态筛选器）
  // 注意：逾期tab不使用 search?status=OVERDUE，因为数据库没有 OVERDUE 状态值
  // 逾期tab会单独调用 /todo/overdue 接口
  if (activeTab.value === 'pending') {
    params.status = 'PENDING';
  } else if (activeTab.value === 'completed') {
    params.status = 'COMPLETED';
  } else if (selectedStatus.value && selectedStatus.value !== 'OVERDUE') {
    // 仅在"全部" tab 下，使用筛选器中的状态
    // 筛选器选择 OVERDUE 时也不传，因为数据库没有该状态值
    params.status = selectedStatus.value;
  }

  // 添加其他筛选条件
  if (selectedType.value) {
    params.type = selectedType.value;
  }
  if (selectedPriority.value) {
    params.priority = selectedPriority.value;
  }

  return params;
};

// 获取待办列表
const loadTodos = async () => {
  loading.value = true;
  try {
    let res: any;

    // 逾期tab使用专门的 /todo/overdue 接口
    // 因为数据库 status 字段没有 OVERDUE 值，search?status=OVERDUE 永远查不到数据
    if (activeTab.value === 'overdue') {
      res = await todoApi.getOverdueTodos(
        currentPage.value - 1,
        pageSize.value,
      );
    } else {
      // 其他tab统一使用 searchTodos 接口
      const params = buildSearchParams();
      res = await todoApi.searchTodos(params);
    }

    const parsedData = parseApiResponse<Todo>(res);
    todos.value = parsedData.data;
    totalElements.value = parsedData.total ?? 0;
    totalPages.value = parsedData.totalPages ?? 0;
  } catch (error) {
    console.error('加载待办列表失败:', error);
    ElMessage.error('加载待办列表失败');
    todos.value = [];
    totalElements.value = 0;
    totalPages.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadTodos();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadTodos();
};

// 处理标签页切换
const handleTabChange = () => {
  currentPage.value = 1;
  // 切换 tab 时，清除与 tab 冲突的状态筛选
  // 因为 tab 本身就是按状态筛选的
  selectedStatus.value = '';
  loadTodos();
};

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1;
  loadTodos();
};

// 处理日期范围变化
const handleDateRangeChange = () => {
  currentPage.value = 1;
  loadTodos();
};

// 清空筛选
const clearFilters = () => {
  selectedStatus.value = '';
  selectedPriority.value = '';
  selectedType.value = '';
  searchKeyword.value = '';
  dateRange.value = null;
  currentPage.value = 1;
  loadTodos();
};

// 显示创建对话框
const showCreateModal = () => {
  createForm.value = {
    title: '',
    description: '',
    priority: 'NORMAL',
    type: '',
    deadline: '',
    remark: '',
    caseNumber: '',
    caseId: undefined,
  };
  createDialogVisible.value = true;
};

// 显示案件选择弹窗
const showCaseSelectModal = (forEdit: boolean = false) => {
  isSelectingForEdit.value = forEdit;
  caseSearchKeyword.value = '';
  caseCurrentPage.value = 1;
  selectedCase.value = null;
  caseSelectDialogVisible.value = true;
  loadCases();
};

// 加载案件列表
const loadCases = async () => {
  caseLoading.value = true;
  try {
    const res = await todoApi.searchCases(
      caseSearchKeyword.value,
      caseCurrentPage.value,
      casePageSize.value,
    );
    const parsed = parseApiResponse<{ id: number; caseNumber: string; caseName: string }>(res);
    caseList.value = parsed.data;
    caseTotal.value = parsed.total ?? 0;
  } catch (error) {
    console.error('加载案件列表失败:', error);
    ElMessage.error('加载案件列表失败');
    caseList.value = [];
    caseTotal.value = 0;
  } finally {
    caseLoading.value = false;
  }
};

// 搜索案件
const handleCaseSearch = () => {
  caseCurrentPage.value = 1;
  loadCases();
};

// 案件分页变化
const handleCasePageChange = (page: number) => {
  caseCurrentPage.value = page;
  loadCases();
};

// 选择案件
const selectCase = (caseItem: { id: number; caseNumber: string; caseName: string }) => {
  console.log('[DEBUG] 选择案件:', caseItem);
  selectedCase.value = caseItem;
};

// 确认选择案件
const confirmSelectCase = () => {
  if (!selectedCase.value) {
    ElMessage.warning('请先选择一个案件');
    return;
  }
  if (isSelectingForEdit.value) {
    editForm.value.caseNumber = selectedCase.value.caseNumber;
    editForm.value.caseId = selectedCase.value.id;
  } else {
    createForm.value.caseNumber = selectedCase.value.caseNumber;
    createForm.value.caseId = selectedCase.value.id;
  }
  caseSelectDialogVisible.value = false;
  ElMessage.success(`已关联案件：${selectedCase.value.caseNumber}`);
};

// 清除案件关联
const clearCaseRelation = (forEdit: boolean = false) => {
  if (forEdit) {
    editForm.value.caseNumber = '';
    editForm.value.caseId = undefined;
  } else {
    createForm.value.caseNumber = '';
    createForm.value.caseId = undefined;
  }
};

// 创建待办
const handleCreate = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 如果有案件关联信息，使用with-case接口
        if (createForm.value.caseNumber || createForm.value.caseId) {
          await todoApi.createTodoWithCase(createForm.value);
        } else {
          await todoApi.createTodo(createForm.value);
        }
        ElMessage.success('创建成功');
        createDialogVisible.value = false;
        loadTodos();
        loadStats();
      } catch (error) {
        ElMessage.error('创建失败');
      }
    }
  });
};

// 显示编辑对话框
const showEditModal = (todo: Todo) => {
  currentTodo.value = todo;
  editForm.value = {
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority,
    type: todo.type || '',
    deadline: todo.deadline || '',
    remark: todo.remark || '',
    caseNumber: '',
    caseId: todo.relatedId,
  };
  editDialogVisible.value = true;
};

// 更新待办
const handleUpdate = async () => {
  if (!editFormRef.value || !currentTodo.value) return;
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const todoId = currentTodo.value!.id;
        if (editForm.value.caseNumber || editForm.value.caseId) {
          await todoApi.updateTodoWithCase(todoId, editForm.value);
        } else {
          await todoApi.updateTodo(todoId, editForm.value);
        }
        ElMessage.success('更新成功');
        editDialogVisible.value = false;
        loadTodos();
      } catch (error) {
        ElMessage.error('更新失败');
      }
    }
  });
};

// 显示详情对话框
const showDetailModal = async (todo: Todo) => {
  try {
    const res = await todoApi.getTodoDetail(todo.id);
    currentTodo.value = res;
    detailCaseNumber.value = '';
    if (res.relatedId) {
      try {
        const caseRes = await getCaseDetailApi(res.relatedId);
        if (caseRes && caseRes.data && caseRes.data.caseNumber) {
          detailCaseNumber.value = caseRes.data.caseNumber;
        }
      } catch (error) {
        console.error('获取案号失败:', error);
      }
    }
    detailDialogVisible.value = true;
  } catch (error) {
    currentTodo.value = todo;
    detailCaseNumber.value = '';
    detailDialogVisible.value = true;
  }
};

// 显示分配对话框
const showAssignModal = (todo: Todo) => {
  currentTodo.value = todo;
  assignForm.value = {
    assigneeId: todo.assigneeId,
    assigneeName: todo.assigneeName || '',
  };
  assignDialogVisible.value = true;
};

// 分配待办
const handleAssign = async () => {
  if (!assignFormRef.value || !currentTodo.value) return;
  await assignFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const todoId = currentTodo.value!.id;
        await todoApi.assignTodo(
          todoId,
          assignForm.value.assigneeId!,
          assignForm.value.assigneeName,
        );
        ElMessage.success('分配成功');
        assignDialogVisible.value = false;
        loadTodos();
      } catch (error) {
        ElMessage.error('分配失败');
      }
    }
  });
};

// 切换待办状态
const toggleTodoStatus = async (todo: Todo) => {
  try {
    if (todo.status === 'COMPLETED') {
      await todoApi.updateTodoStatus(todo.id, 'PENDING');
      todo.status = 'PENDING';
      ElMessage.success('已恢复为待处理');
    } else {
      await todoApi.completeTodo(todo.id);
      todo.status = 'COMPLETED';
      ElMessage.success('已完成');
    }
    loadStats();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

// 删除待办
const deleteTodo = async (id: number) => {
  try {
    await todoApi.deleteTodo(id);
    ElMessage.success('删除成功');
    loadTodos();
    loadStats();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 批量删除
const batchDelete = async () => {
  try {
    await todoApi.batchDeleteTodos(selectedTodos.value);
    ElMessage.success('批量删除成功');
    selectedTodos.value = [];
    loadTodos();
    loadStats();
  } catch (error) {
    ElMessage.error('批量删除失败');
  }
};

// 处理表格选择变化
const handleSelectionChange = (selection: Todo[]) => {
  selectedTodos.value = selection.map((item) => item.id);
};

// 获取优先级样式
const getPriorityStyle = (priority: string) => {
  return priorityConfig[priority] || { label: priority, color: '#999', type: 'info' };
};

// 获取状态样式
const getStatusStyle = (status: string) => {
  return statusConfig[status] || { label: status, color: '#999', type: 'info' };
};

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return '-';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 检查是否逾期
const isOverdue = (todo: Todo) => {
  if (!todo.deadline || todo.status === 'COMPLETED') return false;
  return new Date(todo.deadline) < new Date();
};

// 获取逾期天数
const getOverdueDays = (deadline?: string) => {
  if (!deadline) return 0;
  const diff = new Date().getTime() - new Date(deadline).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// 监听筛选条件变化
watch([selectedStatus, selectedPriority, selectedType], () => {
  handleFilterChange();
});

onMounted(() => {
  loadStats();
  loadTodos();
  loadUsers();
});
</script>

<template>
  <div class="todo-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <Icon icon="lucide:list-checks" :size="28" color="#1890ff" />
        <h2>待办事项管理</h2>
      </div>
      <div class="header-right">
        <ElButton type="primary" @click="showCreateModal">
          <Icon icon="lucide:plus" :size="16" />
          新建待办
        </ElButton>
      </div>
    </div>

    <!-- 统计卡片 -->
    <ElRow :gutter="16" class="stats-row">
      <ElCol :xs="24" :sm="8">
        <ElCard class="stat-card pending" shadow="hover" v-loading="statsLoading">
          <div class="stat-content">
            <div class="stat-icon">
              <Icon icon="lucide:clock" :size="32" color="#faad14" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.inProgressTodos }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="8">
        <ElCard class="stat-card completed" shadow="hover" v-loading="statsLoading">
          <div class="stat-content">
            <div class="stat-icon">
              <Icon icon="lucide:check-circle" :size="32" color="#52c41a" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedTodos }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="8">
        <ElCard class="stat-card overdue" shadow="hover" v-loading="statsLoading">
          <div class="stat-content">
            <div class="stat-icon">
              <Icon icon="lucide:alert-triangle" :size="32" color="#ff4d4f" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.overdueTodos }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 筛选区域 -->
    <ElCard class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-left">
          <ElInput
            v-model="searchKeyword"
            placeholder="搜索待办标题或描述"
            style="width: 220px"
            clearable
            @keyup.enter="handleFilterChange"
          >
            <template #prefix>
              <Icon icon="lucide:search" :size="16" />
            </template>
          </ElInput>
          <ElSelect
            v-model="selectedStatus"
            placeholder="状态"
            style="width: 120px"
            clearable
          >
            <ElOption label="全部状态" value="" />
            <ElOption label="待处理" value="PENDING" />
            <ElOption label="已完成" value="COMPLETED" />
          </ElSelect>
          <ElSelect
            v-model="selectedPriority"
            placeholder="优先级"
            style="width: 120px"
            clearable
          >
            <ElOption label="全部优先级" value="" />
            <ElOption label="紧急" value="URGENT" />
            <ElOption label="高" value="HIGH" />
            <ElOption label="普通" value="NORMAL" />
            <ElOption label="低" value="LOW" />
          </ElSelect>
          <ElSelect
            v-model="selectedType"
            placeholder="类型"
            style="width: 120px"
            clearable
          >
            <ElOption label="全部类型" value="" />
            <ElOption
              v-for="type in typeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </ElSelect>
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </div>
        <div class="filter-right">
          <ElButton @click="clearFilters">
            <Icon icon="lucide:rotate-ccw" :size="14" />
            重置
          </ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 标签页和内容区域 -->
    <ElCard class="content-card" shadow="never">
      <ElTabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <ElTabPane label="全部待办" name="all">
          <template #label>
            <span class="tab-label">
              <Icon icon="lucide:list" :size="14" />
              全部待办
            </span>
          </template>
        </ElTabPane>
        <ElTabPane label="待处理" name="pending">
          <template #label>
            <span class="tab-label">
              <Icon icon="lucide:clock" :size="14" />
              待处理
              <ElBadge
                v-if="stats.inProgressTodos > 0"
                :value="stats.inProgressTodos"
                class="tab-badge"
              />
            </span>
          </template>
        </ElTabPane>
        <ElTabPane label="已完成" name="completed">
          <template #label>
            <span class="tab-label">
              <Icon icon="lucide:check-circle" :size="14" />
              已完成
            </span>
          </template>
        </ElTabPane>
        <ElTabPane label="已逾期" name="overdue">
          <template #label>
            <span class="tab-label">
              <Icon icon="lucide:alert-triangle" :size="14" />
              已逾期
              <ElBadge
                v-if="stats.overdueTodos > 0"
                :value="stats.overdueTodos"
                type="danger"
                class="tab-badge"
              />
            </span>
          </template>
        </ElTabPane>
      </ElTabs>

      <!-- 批量操作栏 -->
      <div v-if="showBatchActions" class="batch-bar">
        <span class="batch-text">已选择 {{ selectedTodos.length }} 项</span>
        <ElPopconfirm
          title="确定要删除选中的待办事项吗？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          @confirm="batchDelete"
        >
          <template #reference>
            <ElButton type="danger" size="small">
              <Icon icon="lucide:trash-2" :size="14" />
              批量删除
            </ElButton>
          </template>
        </ElPopconfirm>
      </div>

      <!-- 待办列表 -->
      <div v-loading="loading" class="table-container">
        <ElTable
          :data="filteredTodos"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="状态" width="80" align="center">
            <template #default="{ row }">
              <ElCheckbox
                :model-value="row.status === 'COMPLETED'"
                @change="toggleTodoStatus(row)"
                size="large"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="标题" min-width="200">
            <template #default="{ row }">
              <div class="todo-title-cell" :class="{ completed: row.status === 'COMPLETED' }">
                <span class="title-text" @click="showDetailModal(row)">{{ row.title }}</span>
                <ElTag
                  v-if="isOverdue(row)"
                  type="danger"
                  size="small"
                  effect="plain"
                  class="overdue-tag"
                >
                  逾期{{ getOverdueDays(row.deadline) }}天
                </ElTag>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="优先级" width="100" align="center">
            <template #default="{ row }">
              <ElTag
                :type="getPriorityStyle(row.priority).type"
                size="small"
                effect="light"
              >
                {{ getPriorityStyle(row.priority).label }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100" align="center">
            <template #default="{ row }">
              <ElTag
                :type="getStatusStyle(row.status).type"
                size="small"
                effect="light"
              >
                {{ getStatusStyle(row.status).label }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" width="100" align="center">
            <template #default="{ row }">
              <span v-if="row.type" class="type-text">{{ row.type }}</span>
              <span v-else class="empty-text">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="截止时间" width="160" align="center">
            <template #default="{ row }">
              <span :class="{ 'overdue-time': isOverdue(row) }">
                {{ formatTime(row.deadline) }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="创建时间" width="160" align="center">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <ElTooltip content="查看详情" placement="top">
                  <ElButton circle size="small" @click="showDetailModal(row)">
                    <Icon icon="lucide:eye" :size="14" />
                  </ElButton>
                </ElTooltip>
                <ElTooltip content="编辑" placement="top">
                  <ElButton circle size="small" type="primary" @click="showEditModal(row)">
                    <Icon icon="lucide:pencil" :size="14" />
                  </ElButton>
                </ElTooltip>
                <ElTooltip content="分配" placement="top">
                  <ElButton circle size="small" type="warning" @click="showAssignModal(row)">
                    <Icon icon="lucide:user-plus" :size="14" />
                  </ElButton>
                </ElTooltip>
                <ElPopconfirm
                  title="确定要删除此待办事项吗？"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  @confirm="deleteTodo(row.id)"
                >
                  <template #reference>
                    <ElButton circle size="small" type="danger">
                      <Icon icon="lucide:trash-2" :size="14" />
                    </ElButton>
                  </template>
                </ElPopconfirm>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <ElEmpty v-if="filteredTodos.length === 0 && !loading" description="暂无待办事项" />

        <!-- 分页 -->
        <div v-if="totalElements > 0" class="pagination-wrapper">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalElements"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </ElCard>

    <!-- 创建待办对话框 -->
    <ElDialog v-model="createDialogVisible" title="新建待办" width="600px" destroy-on-close>
      <ElForm
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <ElFormItem label="标题" prop="title">
          <ElInput v-model="createForm.title" placeholder="请输入待办标题" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入待办描述"
          />
        </ElFormItem>
        <ElFormItem label="类型">
          <ElSelect v-model="createForm.type" placeholder="请选择类型" style="width: 100%">
            <ElOption
              v-for="type in typeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElSelect v-model="createForm.priority" placeholder="请选择优先级" style="width: 100%">
            <ElOption label="紧急" value="URGENT" />
            <ElOption label="高" value="HIGH" />
            <ElOption label="普通" value="NORMAL" />
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
        <ElFormItem label="案号关联">
          <div class="case-relation-input">
            <ElInput
              v-model="createForm.caseNumber"
              placeholder="请选择案件"
              readonly
              style="flex: 1"
            >
              <template #append>
                <ElButton @click="showCaseSelectModal(false)">
                  <Icon icon="lucide:search" :size="14" />
                  选择案件
                </ElButton>
              </template>
            </ElInput>
            <ElButton
              v-if="createForm.caseNumber"
              type="danger"
              link
              @click="clearCaseRelation(false)"
            >
              <Icon icon="lucide:x" :size="14" />
            </ElButton>
          </div>
          <div v-if="createForm.caseNumber" class="case-info">
            <ElTag type="success" size="default" effect="light" class="case-selected-tag">
              <Icon icon="lucide:check-circle" :size="14" />
              <span class="case-tag-content">
                已关联案件：<strong>{{ createForm.caseNumber }}</strong>
              </span>
            </ElTag>
          </div>
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="createForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleCreate">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 编辑待办对话框 -->
    <ElDialog v-model="editDialogVisible" title="编辑待办" width="600px" destroy-on-close>
      <ElForm
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <ElFormItem label="标题" prop="title">
          <ElInput v-model="editForm.title" placeholder="请输入待办标题" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入待办描述"
          />
        </ElFormItem>
        <ElFormItem label="类型">
          <ElSelect v-model="editForm.type" placeholder="请选择类型" style="width: 100%">
            <ElOption
              v-for="type in typeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElSelect v-model="editForm.priority" placeholder="请选择优先级" style="width: 100%">
            <ElOption label="紧急" value="URGENT" />
            <ElOption label="高" value="HIGH" />
            <ElOption label="普通" value="NORMAL" />
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
        <ElFormItem label="案号关联">
          <div class="case-relation-input">
            <ElInput
              v-model="editForm.caseNumber"
              placeholder="请选择案件"
              readonly
              style="flex: 1"
            >
              <template #append>
                <ElButton @click="showCaseSelectModal(true)">
                  <Icon icon="lucide:search" :size="14" />
                  选择案件
                </ElButton>
              </template>
            </ElInput>
            <ElButton
              v-if="editForm.caseNumber"
              type="danger"
              link
              @click="clearCaseRelation(true)"
            >
              <Icon icon="lucide:x" :size="14" />
            </ElButton>
          </div>
          <div v-if="editForm.caseNumber" class="case-info">
            <ElTag type="success" size="default" effect="light" class="case-selected-tag">
              <Icon icon="lucide:check-circle" :size="14" />
              <span class="case-tag-content">
                已关联案件：<strong>{{ editForm.caseNumber }}</strong>
              </span>
            </ElTag>
          </div>
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="editForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleUpdate">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 详情对话框 -->
    <ElDialog v-model="detailDialogVisible" title="待办详情" width="550px">
      <div v-if="currentTodo" class="detail-content">
        <div class="detail-item">
          <span class="detail-label">标题：</span>
          <span class="detail-value">{{ currentTodo.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">描述：</span>
          <span class="detail-value">{{ currentTodo.description || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态：</span>
          <ElTag :type="getStatusStyle(currentTodo.status).type" size="small">
            {{ getStatusStyle(currentTodo.status).label }}
          </ElTag>
        </div>
        <div class="detail-item">
          <span class="detail-label">优先级：</span>
          <ElTag :type="getPriorityStyle(currentTodo.priority).type" size="small">
            {{ getPriorityStyle(currentTodo.priority).label }}
          </ElTag>
        </div>
        <div class="detail-item">
          <span class="detail-label">类型：</span>
          <span class="detail-value">{{ currentTodo.type || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">截止时间：</span>
          <span class="detail-value">{{ formatTime(currentTodo.deadline) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">完成时间：</span>
          <span class="detail-value">{{ formatTime(currentTodo.completedTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">被分配人：</span>
          <span class="detail-value">{{ currentTodo.assigneeName || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建人：</span>
          <span class="detail-value">{{ currentTodo.createUserName || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间：</span>
          <span class="detail-value">{{ formatTime(currentTodo.createTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">更新时间：</span>
          <span class="detail-value">{{ formatTime(currentTodo.updateTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">备注：</span>
          <span class="detail-value">{{ currentTodo.remark || '-' }}</span>
        </div>
        <div v-if="currentTodo.relatedId" class="detail-item">
          <span class="detail-label">关联信息：</span>
          <span class="detail-value">
            <span v-if="detailCaseNumber">案号: {{ detailCaseNumber }}</span>
            <span v-else>{{ currentTodo.relatedType }} - ID: {{ currentTodo.relatedId }}</span>
          </span>
        </div>
      </div>
      <template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="showEditModal(currentTodo!); detailDialogVisible = false">
          编辑
        </ElButton>
      </template>
    </ElDialog>

    <!-- 分配对话框 -->
    <ElDialog v-model="assignDialogVisible" title="分配待办" width="500px">
      <ElForm
        ref="assignFormRef"
        :model="assignForm"
        :rules="assignRules"
        label-width="100px"
      >
        <ElFormItem label="被分配人" prop="assigneeId">
          <ElSelect
            v-model="assignForm.assigneeId"
            placeholder="请选择用户"
            style="width: 100%"
            @change="(val: number) => {
              const user = userOptions.find(u => u.value === val);
              if (user) assignForm.assigneeName = user.label;
            }"
          >
            <ElOption
              v-for="user in userOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="姓名" prop="assigneeName">
          <ElInput v-model="assignForm.assigneeName" placeholder="请输入被分配人姓名" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="assignDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAssign">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 案件选择对话框 -->
    <ElDialog
      v-model="caseSelectDialogVisible"
      title="选择关联案件"
      width="700px"
      destroy-on-close
    >
      <div class="case-select-content">
        <!-- 搜索栏 -->
        <div class="case-search-bar">
          <ElInput
            v-model="caseSearchKeyword"
            placeholder="输入案号搜索案件"
            style="width: 300px"
            clearable
            @keyup.enter="handleCaseSearch"
          >
            <template #prefix>
              <Icon icon="lucide:search" :size="16" />
            </template>
          </ElInput>
          <ElButton type="primary" @click="handleCaseSearch">
            <Icon icon="lucide:search" :size="14" />
            搜索
          </ElButton>
        </div>

        <!-- 案件列表 -->
        <div v-loading="caseLoading" class="case-table-wrapper">
          <ElTable
            :data="caseList"
            style="width: 100%"
            highlight-current-row
            :row-class-name="({ row }) => selectedCase?.id === row.id ? 'case-row-selected' : ''"
            @current-change="(row: any) => selectCase(row)"
          >
            <ElTableColumn width="55" align="center">
              <template #default="{ row }">
                <div class="case-radio-wrapper" @click.stop="selectCase(row)">
                  <div class="case-radio" :class="{ 'is-checked': selectedCase?.id === row.id }">
                    <div class="case-radio-inner" />
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="caseNumber" label="案号" min-width="180" />
            <ElTableColumn prop="caseName" label="案件名称" min-width="200" />
          </ElTable>

          <!-- 选中案件预览 -->
          <div v-if="selectedCase" class="case-preview" :key="selectedCase.id">
            <div class="case-preview-inner">
              <Icon icon="lucide:check-circle" :size="18" color="#52c41a" class="preview-icon" />
              <div class="preview-text">
                <span class="preview-label">当前选中：</span>
                <strong class="preview-case-number">{{ selectedCase.caseNumber }}</strong>
                <span class="preview-separator">·</span>
                <span class="preview-case-name">{{ selectedCase.caseName }}</span>
              </div>
            </div>
          </div>

          <ElEmpty v-if="caseList.length === 0 && !caseLoading" description="暂无案件数据" />
        </div>

        <!-- 分页 -->
        <div v-if="caseTotal > 0" class="case-pagination">
          <ElPagination
            v-model:current-page="caseCurrentPage"
            v-model:page-size="casePageSize"
            :page-sizes="[10, 20, 50]"
            :total="caseTotal"
            layout="total, prev, pager, next"
            @current-change="handleCasePageChange"
          />
        </div>
      </div>
      <template #footer>
        <ElButton @click="caseSelectDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="confirmSelectCase">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.todo-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-right {
  display: flex;
  gap: 10px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: v-bind('"#fff7e6"');
}

.stat-card.pending .stat-icon {
  background: #fff7e6;
}

.stat-card.completed .stat-icon {
  background: #f6ffed;
}

.stat-card.overdue .stat-icon {
  background: #fff1f0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 筛选区域 */
.filter-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.filter-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-right {
  display: flex;
  gap: 10px;
}

/* 内容区域 */
.content-card {
  border-radius: 12px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-badge {
  margin-left: 4px;
}

:deep(.el-badge__content) {
  font-size: 11px;
  height: 16px;
  line-height: 16px;
  padding: 0 5px;
}

/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #f0f5ff;
  border-radius: 8px;
  border: 1px solid #d6e4ff;
}

.batch-text {
  font-size: 14px;
  color: #1d39c4;
  font-weight: 500;
}

/* 表格 */
.table-container {
  padding: 8px 0;
}

.todo-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.todo-title-cell.completed .title-text {
  text-decoration: line-through;
  color: #8c8c8c;
}

.title-text {
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: color 0.2s;
}

.title-text:hover {
  color: #1890ff;
}

.overdue-tag {
  font-size: 11px;
}

.overdue-time {
  color: #ff4d4f;
  font-weight: 500;
}

.type-text {
  font-size: 13px;
  color: #595959;
}

.empty-text {
  color: #bfbfbf;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 详情 */
.detail-content {
  padding: 8px 0;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  width: 90px;
  flex-shrink: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  color: #1a1a1a;
  font-size: 14px;
  word-break: break-all;
}

/* 案号关联输入 */
.case-relation-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.case-info {
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.case-selected-tag {
  background: #f0f9ff !important;
  border: 1px solid #91d5ff !important;
  color: #1890ff !important;
  padding: 6px 12px;
  font-size: 13px;
  animation: caseSelectedFadeIn 0.4s ease-in-out;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.case-selected-tag .case-tag-content strong {
  color: #096dd9;
  font-weight: 600;
}

@keyframes caseSelectedFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-4px);
  }
  50% {
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 案件选择弹窗 */
.case-select-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.case-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.case-table-wrapper {
  min-height: 200px;
}

.case-pagination {
  display: flex;
  justify-content: flex-end;
}

/* 选中的案件行高亮 */
:deep(.case-row-selected) {
  background-color: #f0f9ff !important;
}

:deep(.case-row-selected td) {
  background-color: #f0f9ff !important;
}

/* 选中案件预览 */
.case-preview {
  margin-top: 12px;
  animation: previewFadeIn 0.3s ease-in-out;
}

.case-preview-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%);
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.1);
}

.case-preview .preview-icon {
  flex-shrink: 0;
}

.case-preview .preview-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.case-preview .preview-label {
  color: #8c8c8c;
  margin-right: 4px;
}

.case-preview .preview-case-number {
  color: #1890ff;
  font-weight: 600;
  font-size: 15px;
  margin-right: 4px;
}

.case-preview .preview-separator {
  color: #d9d9d9;
  margin: 0 6px;
}

.case-preview .preview-case-name {
  color: #595959;
}

@keyframes previewFadeIn {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义单选按钮 */
.case-radio-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.case-radio {
  width: 18px;
  height: 18px;
  border: 2px solid #dcdfe6;
  border-radius: 50%;
  position: relative;
  transition: all 0.25s ease;
  background: #fff;
}

.case-radio.is-checked {
  border-color: #409eff;
  background: #409eff;
}

.case-radio.is-checked::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  animation: radioPop 0.2s ease-out;
}

.case-radio:not(.is-checked) .case-radio-inner {
  width: 8px;
  height: 8px;
  background: transparent;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: all 0.25s ease;
}

@keyframes radioPop {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .filter-left {
    width: 100%;
  }

  .filter-left > * {
    width: 100% !important;
  }

  .stats-row .el-col {
    margin-bottom: 12px;
  }
}
</style>
