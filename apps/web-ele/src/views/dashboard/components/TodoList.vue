<script lang="ts" setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '完成案件报告', description: '整理Q4案件数据并生成报告', dueDate: '2025-12-30', priority: 'high', status: 'pending' },
  { id: 2, title: '客户回访', description: '联系重要客户确认案件进展', dueDate: '2025-12-25', priority: 'medium', status: 'in_progress' },
  { id: 3, title: '系统更新', description: '部署最新版本到测试环境', dueDate: '2026-01-05', priority: 'low', status: 'pending' },
])
</script>

<template>
  <div class="todo-list">
    <h4 class="text-base font-semibold mb-3">待办事项</h4>
    <div class="todo-items space-y-3">
      <div 
        v-for="todo in todos" 
        :key="todo.id"
        class="todo-item p-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
        :class="{
          'border-l-4 border-red-500': todo.priority === 'high',
          'border-l-4 border-yellow-500': todo.priority === 'medium',
          'border-l-4 border-green-500': todo.priority === 'low'
        }"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center">
              <div class="text-sm font-medium text-gray-900">{{ todo.title }}</div>
              <span 
                class="ml-2 text-xs px-1.5 py-0.5 rounded-full text-white"
                :class="{
                  'bg-red-500': todo.priority === 'high',
                  'bg-yellow-500': todo.priority === 'medium',
                  'bg-green-500': todo.priority === 'low'
                }"
              >
                {{ todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低' }}
              </span>
            </div>
            <div class="text-xs text-gray-600 mt-1">{{ todo.description }}</div>
            <div class="mt-2 text-xs text-gray-500">
              截止日期: {{ todo.dueDate }}
            </div>
          </div>
          <div class="ml-3">
            <span 
              class="inline-block text-xs px-2 py-1 rounded-full"
              :class="{
                'bg-gray-200 text-gray-700': todo.status === 'pending',
                'bg-blue-100 text-blue-700': todo.status === 'in_progress',
                'bg-green-100 text-green-700': todo.status === 'completed'
              }"
            >
              {{ todo.status === 'pending' ? '待处理' : todo.status === 'in_progress' ? '处理中' : '已完成' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.todo-items {
  overflow-y: auto;
  flex: 1;
}

.todo-item {
  transition: all 0.2s ease;
}

.todo-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>