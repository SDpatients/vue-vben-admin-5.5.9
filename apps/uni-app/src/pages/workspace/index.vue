<template>
  <view class="workspace-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-content">
        <view class="user-info">
          <view class="avatar-wrapper">
            <text class="avatar-text">{{ userInfo?.realName?.substring(0, 1) || 'U' }}</text>
          </view>
          <view class="info">
            <text class="greeting">{{ getGreeting() }}</text>
            <text class="name">{{ userInfo?.realName || '未登录' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view
        v-for="(item, index) in quickActions"
        :key="item.id"
        class="action-item animate-fade-in-up"
        :style="{ animationDelay: `${0.1 + index * 0.08}s` }"
        @click="handleAction(item.action)"
      >
        <view :class="['icon-wrapper', item.iconClass]">
          <text class="icon">{{ item.icon }}</text>
        </view>
        <text class="label">{{ item.label }}</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="section-header">
        <text class="title">数据统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="num">{{ stats.pendingCases }}</text>
          <text class="label">待处理案件</text>
        </view>
        <view class="stat-item">
          <text class="num">{{ stats.completedCases }}</text>
          <text class="label">已完成案件</text>
        </view>
        <view class="stat-item">
          <text class="num">{{ stats.pendingTodos }}</text>
          <text class="label">待办事项</text>
        </view>
        <view class="stat-item">
          <text class="num">{{ stats.notifications }}</text>
          <text class="label">消息通知</text>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyCaseStats } from '@/api/case'
import { getPendingCount, getCompletedCount, getOverdueCount } from '@/api/todo'

const quickActions = ref([
  { id: 'todo', icon: '📋', label: '待办事项', action: 'todo', iconClass: 'todo' },
  { id: 'cases', icon: '📁', label: '案件管理', action: 'cases', iconClass: 'case' },
  { id: 'basicData', icon: '📚', label: '基础资料', action: 'basicData', iconClass: 'basic' },
  { id: 'approval', icon: '✓', label: '审批流程', action: 'approval', iconClass: 'approval' },
])

const userInfo = ref<any>(null)
const stats = ref({
  pendingCases: 0,
  completedCases: 0,
  pendingTodos: 0,
  notifications: 0,
})

onMounted(() => {
  loadUserInfo()
  loadStats()
})

onShow(() => {
  loadUserInfo()
  loadStats()
})

const loadUserInfo = () => {
  const info = uni.getStorageSync('userInfo')
  if (info) {
    userInfo.value = info
  }
}

const loadStats = async () => {
  try {
    const [caseStatsRes, pendingRes, completedRes, overdueRes] = await Promise.all([
      getMyCaseStats(),
      getPendingCount(1),
      getCompletedCount(1),
      getOverdueCount(1),
    ])

    stats.value.pendingCases = caseStatsRes?.data?.inProgressCases || 0
    stats.value.completedCases = caseStatsRes?.data?.completedCases || 0
    stats.value.pendingTodos = pendingRes?.data || 0
    stats.value.notifications = (completedRes?.data || 0) + (overdueRes?.data || 0)
  } catch (error) {
    console.error('[loadStats] Error:', error)
  }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

const handleAction = (action: string) => {
  const handlers: Record<string, () => void> = {
    todo: () => uni.switchTab({ url: '/pages/todo/index' }),
    cases: () => uni.switchTab({ url: '/pages/cases/index' }),
    basicData: () => uni.navigateTo({ url: '/pages/basic-data/index' }),
    approval: () => uni.showToast({ title: '审批功能开发中', icon: 'none' }),
    report: () => uni.showToast({ title: '报表功能开发中', icon: 'none' }),
  }
  handlers[action]?.()
}

const handleTodo = () => {
  uni.switchTab({ url: '/pages/todo/index' })
}

const handleCases = () => {
  uni.switchTab({ url: '/pages/cases/index' })
}

const handleApproval = () => {
  uni.showToast({ title: '审批功能开发中', icon: 'none' })
}

const handleReport = () => {
  uni.showToast({ title: '报表功能开发中', icon: 'none' })
}


</script>

<style lang="scss" scoped>
.workspace-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.user-card {
  background: #1890ff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;

  .user-content {
    .user-info {
      display: flex;
      align-items: center;
      gap: 24rpx;

      .avatar-wrapper {
        width: 100rpx;
        height: 100rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .avatar-text {
          font-size: 40rpx;
          color: #fff;
          font-weight: bold;
        }
      }

      .info {
        .greeting {
          display: block;
          font-size: 26rpx;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8rpx;
        }

        .name {
          font-size: 36rpx;
          color: #fff;
          font-weight: bold;
        }
      }
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;

    .icon-wrapper {
      width: 88rpx;
      height: 88rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.todo {
        background: #e6f7ff;
      }

      &.case {
        background: #f6ffed;
      }

      &.approval {
        background: #fff7e6;
      }

      &.basic {
        background: #fff7e6;
      }

      &.report {
        background: #f9f0ff;
      }

      .icon {
        font-size: 40rpx;
      }
    }

    .label {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.stats-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-header {
    margin-bottom: 24rpx;

    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .stat-item {
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 24rpx;
      text-align: center;

      .num {
        display: block;
        font-size: 40rpx;
        font-weight: bold;
        color: #1890ff;
        margin-bottom: 8rpx;
      }

      .label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style>
