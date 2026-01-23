<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { ElSelect, ElOption, ElButton, ElScrollbar, ElEmpty } from 'element-plus';
import { notificationApi, type Notification } from '#/api/core/notification';

// 定义事件
const emit = defineEmits<{
  (e: 'update:count', count: number): void;
}>();

const loading = ref(false);
const activities = ref<Notification[]>([]);
const selectedType = ref('');
const hasMore = ref(false);

const formatTime = (time: string) => {
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
    // 从本地存储获取userId，如果没有则使用默认值16
    const userId = Number(localStorage.getItem('chat_user_id') || '16');
    
    const res = await notificationApi.getUnreadNotifications(userId);
    console.log('加载动态结果:', res);
    // requestClient配置了responseReturn: 'data'，所以res直接是API响应的data字段
    activities.value = res || [];
    hasMore.value = false; // 新接口一次性返回所有未读通知，不需要分页
  } catch (error) {
    console.error('加载动态失败:', error);
    // 移除模拟数据，改为返回空数组
    activities.value = [];
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};



const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    CASE: 'lucide:file-case',
    TODO: 'lucide:check-square',
    SYSTEM: 'lucide:bell',
    APPROVAL: 'lucide:clipboard-check',
    order_notice: 'lucide:receipt',
  };
  return iconMap[type] || 'lucide:activity';
};

const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    CASE: '#1890ff',
    TODO: '#52c41a',
    SYSTEM: '#faad14',
    APPROVAL: '#ff7875',
    order_notice: '#722ed1',
  };
  return colorMap[type] || '#999';
};

// 我已知晓，标记为已读
const markAsKnown = async (id: number) => {
  try {
    await notificationApi.markAsRead(id);
    // 从列表中移除该通知
    activities.value = activities.value.filter(item => item.id !== id);
  } catch (error) {
    console.error('标记为已读失败:', error);
  }
};

// 全部知晓，标记所有为已读
const markAllAsKnown = async () => {
  try {
    await notificationApi.markAllAsRead();
    // 清空活动列表
    activities.value = [];
  } catch (error) {
    console.error('标记全部为已读失败:', error);
  }
};

// 监听活动数量变化，传递给父组件
watch(activities, (newVal) => {
  emit('update:count', newVal.length);
}, { immediate: true });

onMounted(async () => {
  await loadActivities();
  // 确保数据加载完成后，再次触发数量更新
  emit('update:count', activities.value.length);
});

// 暴露方法给父组件
defineExpose({
  loadActivities
});
</script>

<template>
  <div class="activity-timeline">
    <div class="activity-header">
      <div class="activity-header-actions">
        <span class="mark-all-known" @click="markAllAsKnown">全部知晓</span>
      </div>
    </div>
    <div class="activity-list-wrapper">
      <ElScrollbar :max-height="'450px'">
        <div v-loading="loading" class="activity-list">
          <div
            v-for="(item, index) in activities"
            :key="item.id"
            class="activity-item"
          >
            <div class="activity-icon" :style="{ backgroundColor: getActivityColor(item.type) }">
              <Icon :icon="getActivityIcon(item.type)" :size="16" color="#fff" />
            </div>
            <div class="activity-content-wrapper">
              <div class="activity-user">{{ item.title }}</div>
              <div class="activity-content">{{ item.content }}</div>
              <div class="activity-footer-row">
                <div class="activity-time">{{ formatTime(item.createTime) }}</div>
                <ElButton size="small" type="danger" text @click="markAsKnown(item.id)">我已知晓</ElButton>
              </div>
            </div>
            <div v-if="index < activities.length - 1" class="activity-line" />
          </div>
          <ElEmpty v-if="activities.length === 0 && !loading" description="暂无动态" />
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<style scoped>
.activity-timeline {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  height: 100%; /* 确保组件占满父容器高度 */
}

/* 表头 */
.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 8px 0;
  margin-bottom: 10px;
  background-color: #fff;
}

.activity-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
}

/* 全部知晓文字样式 */
.mark-all-known {
  font-size: 12px;
  font-weight: 500;
  color: #ff4d4f;
  cursor: pointer;
}

.mark-all-known:hover {
  text-decoration: underline;
}

.activity-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

/* 列表容器 */
.activity-list-wrapper {
  flex: 1;
  height: calc(100% - 50px); /* 固定高度，减去header高度 */
  overflow: hidden;
}

/* 列表区域 */
.activity-list {
  position: relative;
  margin-top: 0;
  overflow: visible;
}

.activity-item {
  position: relative;
  display: flex;
  padding: 12px;
  padding-top: 10px;
  padding-bottom: 20px;
  margin-top: 0;
  margin-bottom: 4px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

.activity-icon {
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border-radius: 50%;
}

.activity-content-wrapper {
  flex: 1;
  min-width: 0;
}

.activity-user {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #1890ff;
}

.activity-content {
  display: -webkit-box;
  min-height: 16px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  font-size: 14px;
  color: #333;
  word-break: break-word;
  -webkit-box-orient: vertical;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-line {
  position: absolute;
  top: 44px;
  bottom: -4px;
  left: 27px;
  width: 2px;
  background-color: #f0f0f0;
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
