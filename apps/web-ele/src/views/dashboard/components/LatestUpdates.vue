<script lang="ts" setup>
import { ref } from 'vue';

const updates = ref([
  {
    id: 1,
    title: '系统更新',
    content: '新功能上线：案件管理模块优化',
    time: '2025-12-23 10:30',
    user: '管理员',
  },
  {
    id: 2,
    title: '重要通知',
    content: '请各位用户及时更新密码',
    time: '2025-12-22 14:45',
    user: '系统',
  },
  {
    id: 3,
    title: '数据同步',
    content: '案件数据已完成同步',
    time: '2025-12-21 09:15',
    user: '自动化',
  },
]);
</script>

<template>
  <div class="latest-updates">
    <h4 class="mb-3 text-base font-semibold">最新动态</h4>
    <div class="updates-list space-y-3">
      <div
        v-for="update in updates"
        :key="update.id"
        class="update-item rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">
              {{ update.title }}
            </div>
            <div class="mt-1 text-xs text-gray-600">{{ update.content }}</div>
          </div>
          <div class="ml-3 min-w-[120px] text-right">
            <div class="text-xs text-gray-500">{{ update.time }}</div>
            <div class="mt-1 text-xs text-gray-400">{{ update.user }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.latest-updates {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.updates-list {
  flex: 1;
  overflow-y: auto;
}

.update-item {
  transition: all 0.2s ease;
}

.update-item:hover {
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}
</style>
