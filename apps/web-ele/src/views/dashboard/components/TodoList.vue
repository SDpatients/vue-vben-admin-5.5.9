<script lang="ts" setup>
import { ref } from 'vue';

const todos = ref([
  {
    id: 1,
    title: '完成案件报告',
    description: '整理Q4案件数据并生成报告',
    dueDate: '2025-12-30',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 2,
    title: '客户回访',
    description: '联系重要客户确认案件进展',
    dueDate: '2025-12-25',
    priority: 'medium',
    status: 'in_progress',
  },
  {
    id: 3,
    title: '系统更新',
    description: '部署最新版本到测试环境',
    dueDate: '2026-01-05',
    priority: 'low',
    status: 'pending',
  },
]);
</script>

<template>
  <div class="todo-list">
    <h4 class="mb-3 text-base font-semibold">待办事项</h4>
    <div class="todo-items space-y-3">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="todo-item rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md"
        :class="{
          'border-l-4 border-red-500': todo.priority === 'high',
          'border-l-4 border-yellow-500': todo.priority === 'medium',
          'border-l-4 border-green-500': todo.priority === 'low',
        }"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center">
              <div class="text-sm font-medium text-gray-900">
                {{ todo.title }}
              </div>
              <span
                class="ml-2 rounded-full px-1.5 py-0.5 text-xs text-white"
                :class="{
                  'bg-red-500': todo.priority === 'high',
                  'bg-yellow-500': todo.priority === 'medium',
                  'bg-green-500': todo.priority === 'low',
                }"
              >
                {{
                  todo.priority === 'high'
                    ? '高'
                    : todo.priority === 'medium'
                      ? '中'
                      : '低'
                }}
              </span>
            </div>
            <div class="mt-1 text-xs text-gray-600">{{ todo.description }}</div>
            <div class="mt-2 text-xs text-gray-500">
              截止日期: {{ todo.dueDate }}
            </div>
          </div>
          <div class="ml-3">
            <span
              class="inline-block rounded-full px-2 py-1 text-xs"
              :class="{
                'bg-gray-200 text-gray-700': todo.status === 'pending',
                'bg-blue-100 text-blue-700': todo.status === 'in_progress',
                'bg-green-100 text-green-700': todo.status === 'completed',
              }"
            >
              {{
                todo.status === 'pending'
                  ? '待处理'
                  : todo.status === 'in_progress'
                    ? '处理中'
                    : '已完成'
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.todo-items {
  flex: 1;
  overflow-y: auto;
}

.todo-item {
  transition: all 0.2s ease;
}

.todo-item:hover {
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}
</style>
