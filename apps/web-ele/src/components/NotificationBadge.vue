<script setup lang="ts">
import type { Notification } from '#/api/core/notification';
import type { Approval } from '#/api/core/approval';

import { onMounted, onUnmounted, ref, watch } from 'vue';
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
import { approvalApi } from '#/api/core/approval';
import { useWebSocket } from '#/websocket/notification';
import ActivityTimeline from './ActivityTimeline.vue';
import ApprovalCard from './ApprovalCard.vue';

const router = useRouter();
const dropdownVisible = ref(false);
const isHovering = ref(false);
const loading = ref(false);
const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const pendingApprovals = ref<Approval[]>([]);

// 标签页配置
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'dynamic', label: '最新动态' },
  { key: 'approval', label: '待审核' },
];
const activeTab = ref('all');
const showSettings = ref(false);

// 动态数据计数
const dynamicCount = ref(0);

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
    console.log('加载通知结果:', res);
    notifications.value = res.data || [];
    
    // 如果没有数据，添加一些模拟数据用于测试
    if (notifications.value.length === 0) {
      notifications.value = [
        {
          id: 1,
          userId: 1,
          type: 'SYSTEM',
          title: '系统通知',
          content: '您有新的系统消息',
          isRead: false,
          createTime: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          type: 'CASE',
          title: '案件更新',
          content: '您的案件已经更新',
          isRead: true,
          createTime: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          userId: 1,
          type: 'APPROVAL',
          title: '审批通知',
          content: '您有新的审批请求',
          isRead: false,
          createTime: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
    }
  } catch (error) {
    console.error('加载通知失败:', error);
    // 发生错误时，添加一些模拟数据用于测试
    notifications.value = [
      {
        id: 1,
        userId: 1,
        type: 'SYSTEM',
        title: '系统通知',
        content: '您有新的系统消息',
        isRead: false,
        createTime: new Date().toISOString(),
      },
      {
        id: 2,
        userId: 1,
        type: 'CASE',
        title: '案件更新',
        content: '您的案件已经更新',
        isRead: true,
        createTime: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
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

// 加载待审核数据
const loadPendingApprovals = async () => {
  try {
    const res = await approvalApi.getPendingApprovals(1, 10);
    console.log('加载待审核结果:', res);
    pendingApprovals.value = res.data || [];
    
    // 如果没有数据，添加一些模拟数据用于测试
    if (pendingApprovals.value.length === 0) {
      pendingApprovals.value = [
        {
          id: 1,
          approvalNo: 'SP2023001',
          title: '案件审核请求',
          type: 'CASE',
          applicantId: 1,
          applicantName: '用户1',
          approverId: 2,
          approverName: '管理员',
          status: 'PENDING',
          applyTime: new Date().toISOString(),
          description: '请审核该案件',
        },
        {
          id: 2,
          approvalNo: 'SP2023002',
          title: '文书审核请求',
          type: 'DOCUMENT',
          applicantId: 3,
          applicantName: '用户2',
          approverId: 2,
          approverName: '管理员',
          status: 'PENDING',
          applyTime: new Date(Date.now() - 3600000).toISOString(),
          description: '请审核该文书',
        },
      ];
    }
  } catch (error) {
    console.error('加载待审核失败:', error);
    // 发生错误时，添加一些模拟数据用于测试
    pendingApprovals.value = [
      {
        id: 1,
        approvalNo: 'SP2023001',
        title: '案件审核请求',
        type: 'CASE',
        applicantId: 1,
        applicantName: '用户1',
        approverId: 2,
        approverName: '管理员',
        status: 'PENDING',
        applyTime: new Date().toISOString(),
        description: '请审核该案件',
      },
    ];
  }
};

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
  if (dropdownVisible.value) {
    loadNotifications();
    loadPendingApprovals();
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

// 处理审核点击
const handleApprovalClick = (approval: Approval) => {
  router.push(`/approval/detail/${approval.id}`);
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

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const handleWebSocketMessage = (data: any) => {
  notifications.value.unshift(data);
  if (!data.isRead) {
    unreadCount.value++;
  }
};



// 监听下拉菜单显示状态，加载数据
watch(dropdownVisible, (newVal) => {
  if (newVal) {
    loadNotifications();
    loadPendingApprovals();
  }
});

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
    <div class="notification-trigger" @click="dropdownVisible = !dropdownVisible">
      <ElBadge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
        <div class="notification-icon-wrapper">
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
    </div>
    
    <!-- 自定义下拉菜单 -->
    <div 
      v-if="dropdownVisible" 
      class="notification-dropdown-container"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <div class="notification-dropdown">
        <!-- 标签页导航 -->
        <div class="notification-tabs">
          <div 
            v-for="tab in tabs" 
            :key="tab.key"
            class="notification-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <span>{{ tab.label }}</span>
            <span v-if="tab.key === 'all' && unreadCount > 0" class="tab-badge circle-badge">{{ unreadCount }}</span>
            <span v-if="tab.key === 'dynamic' && dynamicCount > 0" class="tab-badge circle-badge">{{ dynamicCount }}</span>
            <span v-if="tab.key === 'approval' && pendingApprovals.length > 0" class="tab-badge circle-badge">{{ pendingApprovals.length }}</span>
          </div>
          <div class="notification-tab settings" @click="toggleSettings">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-settings"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        </div>
        
        <ElScrollbar max-height="450px">
          <!-- 全部通知 -->
          <div v-if="activeTab === 'all'" class="notification-content-section">
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
          </div>
          
          <!-- 最新动态 -->
          <div v-else-if="activeTab === 'dynamic'" class="notification-content-section">
            <ActivityTimeline @update:count="dynamicCount = $event" />
          </div>
          
          <!-- 待审核 -->
          <div v-else-if="activeTab === 'approval'" class="notification-content-section">
            <div v-if="pendingApprovals.length > 0" class="pending-approvals">
              <ApprovalCard
                v-for="approval in pendingApprovals"
                :key="approval.id"
                :approval="approval"
                @refresh="loadPendingApprovals"
                @click="handleApprovalClick(approval)"
              />
            </div>
            <div v-else class="approval-empty">
              <div class="empty-icon">📋</div>
              <div class="empty-text">暂无待审核任务</div>
            </div>
          </div>
        </ElScrollbar>
        
        <!-- 底部操作 -->
        <div class="notification-footer">
          <div class="footer-left">
            <ElButton link size="small" @click="markAllAsRead">
              全部标记为已读
            </ElButton>
          </div>
          <div class="footer-right">
            <ElButton link size="small" @click="goToNotificationCenter">
              查看全部
            </ElButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 点击外部关闭 -->
    <div 
      v-if="dropdownVisible" 
      class="notification-overlay" 
      @click="dropdownVisible = false"
    ></div>
  </div>
</template>

<style scoped>
.notification-badge {
  position: relative;
  z-index: 9999;
}

.notification-trigger {
  cursor: pointer;
  display: inline-block;
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

.notification-dropdown-container {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  z-index: 10000;
  pointer-events: auto;
}

.notification-dropdown {
  width: 420px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  pointer-events: auto;
}

/* 标签页样式 */
.notification-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.notification-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
}

.notification-tab.active {
  background-color: #1890ff;
  color: white;
}

.notification-tab:not(.active):hover {
  background-color: #f0f0f0;
}

.notification-tab.settings {
  padding: 4px;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-badge {
  background-color: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* 圆形徽章样式 */
.circle-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
  width: 18px;
  height: 18px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

/* 内容区域样式 */
.notification-content-section {
  padding: 0;
}

.notification-list {
  padding: 0 4px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

/* 待审核样式 */
.pending-approvals {
  padding: 8px;
}

.approval-empty {
  padding: 40px;
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.notification-empty {
  padding: 40px;
  text-align: center;
  color: #999;
}

/* 底部样式 */
.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 8px;
}

.notification-actions {
  display: flex;
  gap: 4px;
}
</style>
