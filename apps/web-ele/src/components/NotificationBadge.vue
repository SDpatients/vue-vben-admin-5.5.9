<script setup lang="ts">
import type { Notification } from '#/api/core/notification';

import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  ElBadge,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElMessage,
  ElScrollbar,
} from 'element-plus';

import { notificationApi } from '#/api/core/notification';
import { useWebSocket } from '#/websocket/notification';

const router = useRouter();
const dropdownVisible = ref(false);
const loading = ref(false);
const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);

const { connect, disconnect, onMessage } = useWebSocket();

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

const loadNotifications = async () => {
  loading.value = true;
  try {
    const res = await notificationApi.getNotificationList(1, 10);
    notifications.value = res.data || [];
  } catch (error) {
    console.error('加载通知失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadUnreadCount = async () => {
  try {
    const res = await notificationApi.getUnreadCount();
    unreadCount.value = res.data || 0;
  } catch (error) {
    console.error('加载未读数量失败:', error);
  }
};

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
  if (dropdownVisible.value) {
    loadNotifications();
  }
};

const handleNotificationClick = async (item: Notification) => {
  if (!item.isRead) {
    await notificationApi.markAsRead(item.id);
    item.isRead = true;
    loadUnreadCount();
  }
  if (item.relatedType && item.relatedId) {
    router.push(`/${item.relatedType.toLowerCase()}/${item.relatedId}`);
  }
  dropdownVisible.value = false;
};

const markAllAsRead = async () => {
  await notificationApi.markAllAsRead();
  notifications.value.forEach((item) => {
    item.isRead = true;
  });
  loadUnreadCount();
  ElMessage.success('已全部标记为已读');
};

const deleteNotification = async (id: number) => {
  await notificationApi.deleteNotification(id);
  notifications.value = notifications.value.filter((item) => item.id !== id);
  loadUnreadCount();
  ElMessage.success('通知已删除');
};

const goToNotificationCenter = () => {
  router.push('/notification');
  dropdownVisible.value = false;
};

const handleWebSocketMessage = (data: any) => {
  notifications.value.unshift(data);
  if (!data.isRead) {
    unreadCount.value++;
  }
};

onMounted(() => {
  loadUnreadCount();
  connect();
  onMessage(handleWebSocketMessage);
});

onUnmounted(() => {
  disconnect();
});
</script>

<template>
  <div class="notification-badge">
    <ElBadge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
      <div class="notification-icon-wrapper" @click="toggleDropdown">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-bell"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </div>
    </ElBadge>

    <ElDropdown
      v-model:visible="dropdownVisible"
      trigger="click"
      placement="bottom-end"
    >
      <template #dropdown>
        <ElDropdownMenu class="notification-dropdown">
          <div class="notification-header">
            <span class="title">通知中心</span>
            <ElButton link size="small" @click="markAllAsRead">
              全部已读
            </ElButton>
          </div>
          <ElScrollbar max-height="400px">
            <div v-loading="loading" class="notification-list">
              <div
                v-for="item in notifications"
                :key="item.id"
                class="notification-item"
                :class="{ unread: !item.isRead }"
                @click="handleNotificationClick(item)"
              >
                <div class="notification-content">
                  <div class="notification-title">{{ item.title }}</div>
                  <div class="notification-text">{{ item.content }}</div>
                  <div class="notification-time">
                    {{ formatTime(item.createTime) }}
                  </div>
                </div>
                <div class="notification-actions">
                  <ElButton
                    circle
                    size="small"
                    @click.stop="deleteNotification(item.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-trash-2"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </ElButton>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="notification-empty">
                暂无通知
              </div>
            </div>
          </ElScrollbar>
          <div class="notification-footer">
            <ElButton link @click="goToNotificationCenter">
              查看全部通知
            </ElButton>
          </div>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>

<style scoped>
.notification-badge {
  position: relative;
}

.notification-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-icon-wrapper:hover {
  background-color: #f0f0f0;
}

.notification-dropdown {
  width: 380px;
  padding: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-header .title {
  font-weight: 600;
  font-size: 16px;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #e6f7ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 14px;
}

.notification-text {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-empty {
  padding: 40px;
  text-align: center;
  color: #999;
}

.notification-footer {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.notification-actions {
  display: flex;
  gap: 4px;
}
</style>
