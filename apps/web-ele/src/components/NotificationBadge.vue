<script setup lang="ts">
import type { Approval } from '#/api/core/approval';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

import { ElBadge, ElButton, ElMessage, ElScrollbar } from 'element-plus';

import { approvalApi } from '#/api/core/approval';
import { notificationApi } from '#/api/core/notification';

import ActivityTimeline from './ActivityTimeline.vue';
import ApprovalCard from './ApprovalCard.vue';

const router = useRouter();
const userStore = useUserStore();
const dropdownVisible = ref(false);
const isHovering = ref(false);
// 全部消息个数 = 最新动态个数 + 待审核个数
const totalCount = computed(() => {
  return dynamicCount.value + pendingApprovals.value.length;
});
const pendingApprovals = ref<Approval[]>([]);

// 检查用户是否有管理员权限
const isAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
});

// 标签页配置
const tabs = computed(() => {
  const baseTabs = [{ key: 'dynamic', label: '最新动态' }];
  // 只有管理员才能看到待审核标签
  if (isAdmin.value) {
    baseTabs.push({ key: 'approval', label: '待审核' });
  }
  return baseTabs;
});
const activeTab = ref('dynamic');
const showSettings = ref(false);

// 动态数据计数
const dynamicCount = ref(0);
// 动态数据列表
const activities = ref<any[]>([]);

// ActivityTimeline 组件引用
const activityTimelineRef = ref<any>(null);

// 加载最新动态数量
const loadDynamicCount = async () => {
  try {
    // 从本地存储获取 userId
    const userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      dynamicCount.value = 0;
      return;
    }
    // 调用新的未读通知接口
    const res = await notificationApi.getUnreadNotifications(Number(userId));
    // requestClient 配置了 responseReturn: 'data'，所以 res 直接是 API 响应的 data 字段
    const list = res || [];
    dynamicCount.value = list.length;
    activities.value = list; // 保存列表数据
  } catch (error) {
    console.error('加载最新动态数量失败:', error);
    dynamicCount.value = 0;
    activities.value = [];
  }
};

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

// 加载待审核数据
const loadPendingApprovals = async () => {
  try {
    // 调用待审核API接口
    const res = await approvalApi.getApprovalList({
      pageNum: 1,
      pageSize: 10,
      approvalStatus: 'PENDING',
      approvalType: '',
    });
    // requestClient配置了responseReturn: 'data'，所以res直接是API响应的data字段
    // API返回的数据格式为 { total: number, list: Approval[] }
    pendingApprovals.value = res?.list || [];
  } catch (error) {
    console.error('加载待审核失败:', error);
    pendingApprovals.value = [];
  }
};

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
  if (dropdownVisible.value && isAdmin.value) {
    loadPendingApprovals();
  }
};

// 处理审核点击
const handleApprovalClick = (approval: Approval) => {
  router.push(`/approval/detail/${approval.id}`);
  dropdownVisible.value = false;
};

const markAllAsRead = async () => {
  // 从本地存储获取userId
  const userId = localStorage.getItem('chat_user_id');
  if (!userId) {
    ElMessage.error('无法获取用户信息');
    return;
  }
  try {
    await notificationApi.markAllAsRead();
  } catch (error: any) {
    const errorMsg = error?.message || '';
    if (!errorMsg.includes("Cannot destructure property 'config' of 'response' as it is null")) {
      console.error('标记全部为已读失败:', error);
      ElMessage.error('标记全部为已读失败');
      return;
    }
  }
  loadDynamicCount();
  // 刷新最新动态数据
  if (
    activityTimelineRef.value &&
    typeof activityTimelineRef.value.loadActivities === 'function'
  ) {
    await activityTimelineRef.value.loadActivities();
  }
  ElMessage.success('已全部标记为已读');
};

const goToNotificationCenter = () => {
  router.push('/notification');
  dropdownVisible.value = false;
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

// 监听下拉菜单显示状态，加载数据
watch(dropdownVisible, (newVal) => {
  if (newVal) {
    // 下拉菜单打开时，同时加载最新动态和待审核数据
    if (isAdmin.value) {
      loadPendingApprovals();
    }
    // 刷新最新动态数据
    if (
      activityTimelineRef.value &&
      typeof activityTimelineRef.value.loadActivities === 'function'
    ) {
      activityTimelineRef.value.loadActivities();
    }
  }
});

onMounted(() => {
  loadDynamicCount(); // 加载最新动态数量
  if (isAdmin.value) {
    loadPendingApprovals(); // 加载待审核数据
  }
});

onUnmounted(() => {});
</script>

<template>
  <div class="notification-badge">
    <div
      class="notification-trigger"
      @click="dropdownVisible = !dropdownVisible"
    >
      <ElBadge :value="totalCount" :hidden="totalCount === 0" :max="99">
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

            <span
              v-if="tab.key === 'dynamic' && dynamicCount > 0"
              class="tab-badge circle-badge"
              >{{ dynamicCount }}</span>
            <span
              v-if="tab.key === 'approval' && pendingApprovals.length > 0"
              class="tab-badge circle-badge"
              >{{ pendingApprovals.length }}</span>
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
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          </div>
        </div>

        <ElScrollbar style="flex: 1; min-height: 0">
          <div class="notification-content-wrapper">
            <!-- 最新动态 -->
            <div
              v-show="activeTab === 'dynamic'"
              class="notification-content-section"
            >
              <ActivityTimeline
                ref="activityTimelineRef"
                :initial-activities="activities"
                @update:count="dynamicCount = $event"
              />
            </div>

            <!-- 待审核 -->
            <div
              v-show="activeTab === 'approval'"
              class="notification-content-section"
            >
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
  display: inline-block;
}

.notification-trigger {
  display: inline-block;
  cursor: pointer;
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
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 9999999;
  width: 420px;
  margin: 0;
  pointer-events: auto;
}

.notification-dropdown {
  position: relative;
  z-index: inherit;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  padding: 0;
  overflow: hidden;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

/* 标签页固定 */
.notification-tabs {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

/* 内容区域滚动 */
.notification-content-section {
  flex: 1;
  overflow: hidden;
}

/* 确保滚动条只在内容区域显示 */
:deep(.el-scrollbar__wrap) {
  max-height: calc(
    500px - 50px - 50px
  ); /* 总高度 - 标签栏高度(减少10px) - 底部操作栏高度 */
  overflow-y: auto;
}

.notification-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: auto;
}

/* 标签页样式 */
.notification-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 6px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.notification-tab {
  position: relative;
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.2s;
}

.notification-tab.active {
  color: white;
  background-color: #1890ff;
}

.notification-tab:not(.active):hover {
  background-color: #f0f0f0;
}

.notification-tab.settings {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 4px;
  border-radius: 50%;
}

.tab-badge {
  min-width: 14px;
  padding: 0 3px;
  font-size: 9px;
  color: white;
  text-align: center;
  background-color: #ff4d4f;
  border-radius: 6px;
}

/* 圆形徽章样式 */
.circle-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  min-width: auto;
  height: 14px;
  padding: 0;
  font-size: 7px;
  font-weight: bold;
  color: white;
  background-color: #ff4d4f;
  border-radius: 50%;
  box-shadow: 0 1px 1px rgb(0 0 0 / 10%);
}

/* 内容区域样式 */
.notification-content-section {
  padding: 12px;
}

.notification-list {
  padding: 0 4px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 4px;
  cursor: pointer;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
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
  height: auto;
  min-height: 60px;
  overflow: visible;
}

.notification-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
}

.notification-text {
  display: -webkit-box;
  min-height: 16px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  font-size: 13px;
  color: #666;
  word-break: break-word;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
  text-align: center;
}

.empty-icon {
  margin-bottom: 12px;
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.notification-empty {
  padding: 40px;
  color: #999;
  text-align: center;
}

/* 底部样式 */
.notification-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
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

/* 覆盖Element Plus徽章样式，确保数字居中 */
:deep(.el-badge__content) {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* 确保圆形徽章中的数字居中 */
:deep(.el-badge__content.is-dot) {
  width: auto;
  height: auto;
  padding: 0 6px;
  border-radius: 10px;
}
</style>
