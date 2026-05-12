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

    <!-- 用户模块 -->
    <view class="user-section">
      <view class="section-header">
        <text class="title">用户模块</text>
      </view>
      <view class="quick-actions">
        <view
          v-for="(item, index) in quickActions"
          :key="item.id"
          class="action-item animate-fade-in-up"
          :style="{ animationDelay: `${0.1 + index * 0.08}s` }"
          @click="handleAction(item.action)"
        >
          <view :class="['icon-wrapper', item.iconClass]">
            <text
              class="action-icon"
              :style="{ fontFamily: 'uicon-iconfont', fontSize: '44rpx', color: item.iconColor }"
            >{{ item.iconChar }}</text>
          </view>
          <text class="label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 管理员模块 -->
    <view v-if="isAdmin" class="admin-section">
      <view class="section-header">
        <text class="title">管理员模块</text>
      </view>
      <view class="quick-actions">
        <view
          v-for="(item, index) in adminActions"
          :key="item.id"
          class="action-item animate-fade-in-up"
          :style="{ animationDelay: `${0.1 + index * 0.08}s` }"
          @click="handleAdminAction(item.action)"
        >
          <view :class="['icon-wrapper', item.iconClass]">
            <text
              class="action-icon"
              :style="{ fontFamily: 'uicon-iconfont', fontSize: '44rpx', color: item.iconColor }"
            >{{ item.iconChar }}</text>
          </view>
          <text class="label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 - 最近查询案件 -->
    <view v-if="recentSearches.length > 0" class="recent-searches-section">
      <view class="section-header">
        <text class="title">快捷入口</text>
        <text class="subtitle">最近查询</text>
      </view>
      <view class="recent-searches-list">
        <view
          v-for="item in recentSearches"
          :key="item.caseId"
          class="recent-search-item"
          @click="goToCaseDetail(item.caseId)"
        >
          <view class="search-item-content">
            <view :class="['search-item-icon', `search-item-icon--${item.caseStatus?.toLowerCase() || 'default'}`]">
            <text
              class="icon-text"
              :style="{ fontFamily: 'uicon-iconfont', color: getStatusIconColor(item.caseStatus) }"
            >{{ getStatusIcon(item.caseStatus) }}</text>
          </view>
            <view class="search-item-info">
              <text class="search-item-title">{{ item.caseNumber }}</text>
              <view class="search-item-meta">
                <text class="search-item-status" :class="item.caseStatus?.toLowerCase()">{{ caseStatusMap[item.caseStatus] || item.caseStatus }}</text>
                <text class="search-item-time">{{ formatSearchTime(item.searchTime) }}</text>
              </view>
            </view>
          </view>
          <view class="search-item-action" @click.stop="handleRemoveRecentSearch(item.caseId)">
            <text class="action-text">✕</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="section-header">
        <text class="title">数据统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item" @click="handleStatClick('pendingCases')">
          <text class="num">{{ stats.pendingCases }}</text>
          <text class="label">待处理案件</text>
        </view>
        <view class="stat-item" @click="handleStatClick('completedCases')">
          <text class="num">{{ stats.completedCases }}</text>
          <text class="label">已完成案件</text>
        </view>
        <view class="stat-item" @click="handleStatClick('pendingTodos')">
          <text class="num">{{ stats.pendingTodos }}</text>
          <text class="label">待办事项</text>
        </view>
        <view class="stat-item" @click="handleStatClick('notifications')">
          <text class="num">{{ stats.notifications }}</text>
          <text class="label">消息通知</text>
        </view>
      </view>
    </view>

    <view class="copyright-footer">
      <text class="copyright-text">© {{ customerConfig.copyright.year }} {{ customerConfig.copyright.company }}</text>
      <text class="version-text">V {{ customerConfig.app.version }}</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { getMyCaseStats, getRecentSearches, removeRecentSearch } from '@/api/case'
import { getPendingCount, getCompletedCount, getOverdueCount } from '@/api/todo'
import { getUnreadCount } from '@/api/notification'
import { checkAdmin } from '@/api/auth'
import { customerConfig } from '@/customer.config'
const quickActions = ref([
  { id: 'todo', icon: 'checkmark-circle', iconChar: '\ue63d', iconColor: '#1890ff', label: '待办事项', action: 'todo', iconClass: 'todo' },
  { id: 'cases', icon: 'file-text', iconChar: '\ue663', iconColor: '#52c41a', label: '案件管理', action: 'cases', iconClass: 'case' },
  { id: 'documentLib', icon: 'folder', iconChar: '\ue7f5', iconColor: '#13c2c2', label: '文档库', action: 'documentLib', iconClass: 'document' },
  { id: 'expense', icon: 'red-packet', iconChar: '\ue691', iconColor: '#52c41a', label: '费用报销', action: 'expense', iconClass: 'expense' },
  { id: 'announcement', icon: 'bell', iconChar: '\ue609', iconColor: '#ff4d4f', label: '公告', action: 'announcement', iconClass: 'announcement' },
  { id: 'basicData', icon: 'list', iconChar: '\ue650', iconColor: '#fa8c16', label: '基础资料', action: 'basicData', iconClass: 'basic' },
])

// 管理员功能按钮（仅管理员可见）
const adminActions = ref([
  { id: 'approveExpense', icon: 'checkmark-circle', iconChar: '\ue63d', iconColor: '#1890ff', label: '审核报销', action: 'approveExpense', iconClass: 'approve' },
  { id: 'approvalManage', icon: 'list', iconChar: '\ue650', iconColor: '#722ed1', label: '审批管理', action: 'approvalManage', iconClass: 'approval-manage' },
])

const userInfo = ref<any>(null)
const isAdmin = ref(false)
const stats = ref({
  pendingCases: 0,
  completedCases: 0,
  pendingTodos: 0,
  notifications: 0,
})

// 最近查询案件
const recentSearches = ref<any[]>([])
const recentSearchesLoading = ref(false)

onMounted(() => {
  loadUserInfo()
  loadStats()
  loadRecentSearches()
})

onShow(() => {
  loadUserInfo()
  loadStats()
  loadRecentSearches()
})

const loadUserInfo = async () => {
  const info = uni.getStorageSync('userInfo')
  if (info) {
    userInfo.value = info
    const roles = info.roles || []
    isAdmin.value = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')
  }
  try {
    const adminRes = await checkAdmin()
    if (adminRes?.data) {
      isAdmin.value = adminRes.data.isAdmin || adminRes.data.isSuperAdmin || false
      userInfo.value = {
        ...userInfo.value,
        roles: adminRes.data.roles || [],
        isAdmin: adminRes.data.isAdmin,
      }
    }
  } catch (_error) {
  }
}

const loadStats = async () => {
  try {
    const info = uni.getStorageSync('userInfo')
    const userId = info?.userId

    const [caseStatsRes, pendingRes, unreadRes] = await Promise.all([
      getMyCaseStats(),
      getPendingCount(userId || 0),
      getUnreadCount(),
    ])

    stats.value.pendingCases = caseStatsRes?.data?.pendingCases || 0
    stats.value.completedCases = caseStatsRes?.data?.completedCases || 0
    stats.value.pendingTodos = pendingRes?.data || 0
    stats.value.notifications = unreadRes?.data || 0
  } catch (_error) {
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
    documentLib: () => uni.navigateTo({ url: '/pages/document-library/index' }),
    expense: () => uni.navigateTo({ url: '/pages/expense/index' }),
    announcement: () => uni.navigateTo({ url: '/pages/announcement/index' }),
    basicData: () => uni.navigateTo({ url: '/pages/basic-data/index' }),
    approval: () => uni.showToast({ title: '审批功能开发中', icon: 'none' }),
    report: () => uni.showToast({ title: '报表功能开发中', icon: 'none' }),
  }
  handlers[action]?.()
}

// 处理管理员功能按钮点击
const handleAdminAction = async (action: string) => {
  if (action === 'approveExpense') {
    uni.showLoading({ title: '检查权限中...' })
    try {
      const res = await checkAdmin()
      uni.hideLoading()
      if (res.code === 200 && res.data?.isAdmin) {
        uni.navigateTo({ url: '/pages/expense/approve' })
      } else {
        uni.showModal({
          title: '权限不足',
          content: '您没有管理员权限，无法访问审核功能。',
          showCancel: false,
          confirmText: '知道了',
        })
      }
    } catch (error) {
      uni.hideLoading()
      uni.showModal({
        title: '权限不足',
        content: '您没有管理员权限，无法访问审核功能。',
        showCancel: false,
        confirmText: '知道了',
      })
    }
  } else if (action === 'approvalManage') {
    uni.navigateTo({ url: '/pages/approval/index' })
  }
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

// 统计卡片点击跳转
const handleStatClick = (type: string) => {
  const routes: Record<string, string> = {
    pendingCases: '/pages/cases/index',
    completedCases: '/pages/cases/index',
    pendingTodos: '/pages/todo/index',
    notifications: '/pages/notification/index',
  }
  const url = routes[type]
  if (url) {
    if (url.startsWith('/pages/todo') || url.startsWith('/pages/cases')) {
      uni.switchTab({ url })
    } else {
      uni.navigateTo({ url })
    }
  }
}

// 加载最近查询案件列表
const loadRecentSearches = async () => {
  recentSearchesLoading.value = true
  try {
    const res = await getRecentSearches(3)
    if (res.code === 200) {
      recentSearches.value = res.data || []
    } else {
      recentSearches.value = []
    }
  } catch (error) {
    recentSearches.value = []
  } finally {
    recentSearchesLoading.value = false
  }
}

// 跳转到案件详情
const goToCaseDetail = (caseId: number) => {
  uni.navigateTo({ url: `/pages/cases/detail?id=${caseId}` })
}

// 移除单条最近查询记录
const handleRemoveRecentSearch = async (caseId: number) => {
  try {
    await removeRecentSearch(caseId)
    uni.showToast({ title: '已移除', icon: 'success' })
    await loadRecentSearches()
  } catch (error) {
    console.error('[workspace] 移除最近搜索失败:', error)
    uni.showToast({ title: '移除失败', icon: 'none' })
  }
}

// 格式化最近查询时间
const formatSearchTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return dayjs(date).format('YYYY/M/D')
}

// 获取案件状态图标
const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    ONGOING: '\ue663',
    AWAITING: '\ue609',
    COMPLETED: '\ue63d',
  }
  return iconMap[status] || '\ue663'
}

// 获取案件状态图标颜色
const getStatusIconColor = (status: string) => {
  const colorMap: Record<string, string> = {
    ONGOING: '#1890ff',
    AWAITING: '#fa8c16',
    COMPLETED: '#52c41a',
  }
  return colorMap[status] || '#1890ff'
}

// 案件状态映射
const caseStatusMap: Record<string, string> = {
  ONGOING: '在办',
  AWAITING: '报结',
  COMPLETED: '已结',
}

</script>

<style lang="scss" scoped>
// 引入 uview-plus 内置图标字体，确保 icon font 在当前页面可用
@font-face {
  font-family: 'uicon-iconfont';
  src: url('https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf') format('truetype');
}

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

      &.document {
        background: #e6fffb;
      }

      &.expense {
        background: #f6ffed;
      }

      &.announcement {
        background: #fff2f0;
      }

      &.report {
        background: #f9f0ff;
      }

      &.approve {
        background: #e6f7ff;
      }

      &.approval-manage {
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

.user-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-header {
    margin-bottom: 24rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.admin-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-header {
    margin-bottom: 24rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.recent-searches-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-header {
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;

    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .subtitle {
      font-size: 24rpx;
      color: #999;
    }
  }

  .recent-searches-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .recent-search-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 20rpx;
      transition: all 0.2s;

      &:active {
        background: #e6f2ff;
      }

      .search-item-content {
        display: flex;
        align-items: center;
        gap: 20rpx;
        flex: 1;
        min-width: 0;

        .search-item-icon {
          width: 72rpx;
          height: 72rpx;
          background: #e6f2ff;
          border-radius: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.search-item-icon--ongoing {
            background: #e6f7ff;
          }

          &.search-item-icon--awaiting {
            background: #fff7e6;
          }

          &.search-item-icon--completed {
            background: #f6ffed;
          }

          .icon-text {
            font-size: 36rpx;
          }
        }

        .search-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8rpx;

          .search-item-title {
            font-size: 28rpx;
            font-weight: 500;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .search-item-meta {
            display: flex;
            align-items: center;
            gap: 16rpx;

            .search-item-status {
              font-size: 22rpx;
              padding: 4rpx 12rpx;
              border-radius: 8rpx;
              background: #e6f7ff;
              color: #1890ff;

              &.ongoing {
                background: #e6f7ff;
                color: #1890ff;
              }

              &.awaiting {
                background: #fff7e6;
                color: #fa8c16;
              }

              &.completed {
                background: #f6ffed;
                color: #52c41a;
              }
            }

            .search-item-time {
              font-size: 22rpx;
              color: #999;
            }
          }
        }
      }

      .search-item-action {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 12rpx;
        flex-shrink: 0;

        .action-text {
          font-size: 28rpx;
          color: #999;
        }
      }
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
      transition: all 0.2s;

      &:active {
        background: #e6f2ff;
        transform: scale(0.96);
      }

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

.copyright-footer {
  text-align: center;
  padding: 30rpx 0 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .copyright-text {
    font-size: 22rpx;
    color: #bbb;
  }

  .version-text {
    font-size: 20rpx;
    color: #ccc;
  }
}
</style>
