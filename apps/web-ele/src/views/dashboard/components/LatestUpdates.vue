<script lang="ts" setup>
import { ref } from 'vue'

const updates = ref([
  { id: 1, title: '系统更新', content: '新功能上线：案件管理模块优化', time: '2025-12-23 10:30', user: '管理员' },
  { id: 2, title: '重要通知', content: '请各位用户及时更新密码', time: '2025-12-22 14:45', user: '系统' },
  { id: 3, title: '数据同步', content: '案件数据已完成同步', time: '2025-12-21 09:15', user: '自动化' },
])
</script>

<template>
  <div class="latest-updates">
    <h4 class="text-base font-semibold mb-3">最新动态</h4>
    <div class="updates-list space-y-3">
      <div v-for="update in updates" :key="update.id" class="update-item p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">{{ update.title }}</div>
            <div class="text-xs text-gray-600 mt-1">{{ update.content }}</div>
          </div>
          <div class="text-right ml-3 min-w-[120px]">
            <div class="text-xs text-gray-500">{{ update.time }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ update.user }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.latest-updates {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.updates-list {
  overflow-y: auto;
  flex: 1;
}

.update-item {
  transition: all 0.2s ease;
}

.update-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>