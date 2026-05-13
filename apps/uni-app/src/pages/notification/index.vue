<template>
  <view class="notification-container">
    <view class="custom-nav">
      <view class="nav-content">
        <text class="title">消息通知</text>
        <view class="nav-actions">
          <view class="action-btn" @click="handleMarkAllAsRead" v-if="unreadCount > 0">
            <u-icon name="checkmark-circle" color="#fff" size="18"></u-icon>
            <text class="action-text">全部已读</text>
          </view>
        </view>
      </view>
    </view>

    <view class="stats-bar">
      <view class="stat-item">
        <text class="num">{{ unreadCount }}</text>
        <text class="label">未读</text>
      </view>
      <view class="divider"></view>
      <view class="stat-item">
        <text class="num">{{ totalCount }}</text>
        <text class="label">全部</text>
      </view>
    </view>

    <view class="filter-tabs">
      <view 
        v-for="tab in filterTabs" 
        :key="tab.value"
        :class="['tab-item', { active: currentFilter === tab.value }]"
        @click="currentFilter = tab.value"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="notification-list">
      <view 
        v-for="(notification, index) in filteredNotifications" 
        :key="notification.id"
        class="notification-card"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="goToDetail(notification.id)"
      >
        <view class="card-left">
          <view v-if="!notification.isRead" class="unread-dot"></view>
          <view v-else class="read-dot"></view>
        </view>
        <view class="card-main">
          <view class="card-header">
            <text class="title">{{ notification.title }}</text>
            <view class="header-right">
              <u-tag 
                :text="getPriorityText(notification.priority)" 
                :type="getPriorityType(notification.priority)"
                size="mini"
              ></u-tag>
            </view>
          </view>
          <view class="card-content">
            <text class="content-text">{{ truncateContent(notification.content, 60) }}</text>
          </view>
          <view class="card-footer">
            <view class="meta-info">
              <view :class="['type-tag', getTypeClass(notification.type)]">
                <u-icon :name="getTypeIcon(notification.type)" size="12" color="#fff"></u-icon>
                <text>{{ getTypeText(notification.type) }}</text>
              </view>
              <text class="time">{{ formatTime(notification.createTime) }}</text>
            </view>
            <view class="actions" @click.stop>
              <u-icon 
                v-if="!notification.isRead"
                name="checkmark" 
                size="18" 
                color="#52c41a"
                @click="handleMarkAsRead(notification.id)"
              ></u-icon>
              <u-icon 
                name="trash" 
                size="18" 
                color="#ff4d4f"
                @click="handleDelete(notification.id)"
              ></u-icon>
            </view>
          </view>
        </view>
      </view>

      <u-empty 
        v-if="filteredNotifications.length === 0 && !loading" 
        mode="message" 
        text="暂无消息通知"
      ></u-empty>
    </view>

    <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>

    <view class="load-more" v-if="hasMore && filteredNotifications.length > 0" @click="loadMore">
      <text>加载更多</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { 
  getNotificationList, 
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
  notificationTypeMap,
  notificationPriorityMap
} from '@/api/notification'
import dayjs from 'dayjs'

const notificationList = ref<Notification[]>([])
const loading = ref(true)
const currentFilter = ref('all')
const pageNum = ref(0)
const pageSize = 10
const hasMore = ref(true)
const unreadCount = ref(0)
const totalCount = ref(0)

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '未读', value: 'unread' },
  { label: '已读', value: 'read' },
]

const filteredNotifications = computed(() => {
  if (currentFilter.value === 'all') return notificationList.value
  if (currentFilter.value === 'unread') return notificationList.value.filter(n => !n.isRead)
  if (currentFilter.value === 'read') return notificationList.value.filter(n => n.isRead)
  return notificationList.value
})

onMounted(() => {
  loadData()
  loadUnreadCount()
})

const loadData = async (isRefresh = false) => {
  if (isRefresh) {
    pageNum.value = 0
    hasMore.value = true
  }
  if (!hasMore.value && !isRefresh) return

  loading.value = true
  try {
    const res = await getNotificationList({
      pageNum: pageNum.value,
      pageSize,
    })
    
    if (res.data?.content) {
      if (isRefresh) {
        notificationList.value = res.data.content
      } else {
        notificationList.value = [...notificationList.value, ...res.data.content]
      }
      
      totalCount.value = res.data.totalElements
      hasMore.value = res.data.number + 1 < res.data.totalPages
    }
  } catch (error) {
uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    if (res.data !== undefined) {
      unreadCount.value = res.data
    }
  } catch (error) {
}
}

const onRefresh = () => {
  loadData(true).then(() => {
    loadUnreadCount()
    uni.stopPullDownRefresh()
  })
}

onPullDownRefresh(() => {
  onRefresh()
})

onReachBottom(() => {
  loadMore()
})

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    pageNum.value++
    loadData()
  }
}

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/notification/detail?id=${id}` })
}

const handleMarkAsRead = async (id: number) => {
  try {
    const res = await markAsRead(id)
    if (res.code === 200) {
      uni.showToast({ title: '已标记为已读', icon: 'success' })
      loadData(true)
      loadUnreadCount()
    }
  } catch (error) {
uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleMarkAllAsRead = () => {
  uni.showModal({
    title: '确认操作',
    content: '确定要标记所有通知为已读吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await markAllAsRead()
          if (response.code === 200) {
            uni.showToast({ title: '已全部标记为已读', icon: 'success' })
            loadData(true)
            loadUnreadCount()
          }
        } catch (error) {
uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

const handleDelete = (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条通知吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteNotification(id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadData(true)
          loadUnreadCount()
        } catch (error) {
uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const getTypeText = (type?: string) => {
  return notificationTypeMap[type || '']?.text || type || '通知'
}

const getTypeIcon = (type?: string) => {
  return notificationTypeMap[type || '']?.icon || 'notification'
}

const getTypeClass = (type?: string) => {
  const classMap: Record<string, string> = {
    CASE_REVIEW: 'type-case',
    TASK_ASSIGN: 'type-task',
    SYSTEM: 'type-system',
    MEETING: 'type-meeting',
    CREDITOR: 'type-creditor',
    DEADLINE: 'type-deadline',
  }
  return classMap[type || ''] || 'type-default'
}

const getPriorityText = (priority?: string) => {
  return notificationPriorityMap[priority || '']?.text || '中'
}

const getPriorityType = (priority?: string): 'warning' | 'error' | 'info' | 'success' | 'primary' => {
  return notificationPriorityMap[priority || '']?.type || 'info'
}

const truncateContent = (content: string, maxLength: number) => {
  if (!content) return ''
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
}

const formatTime = (time?: string) => {
  if (!time) return '-'
  const now = dayjs()
  const target = dayjs(time)
  const diffMinutes = now.diff(target, 'minute')
  
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  
  const diffHours = now.diff(target, 'hour')
  if (diffHours < 24) return `${diffHours}小时前`
  
  const diffDays = now.diff(target, 'day')
  if (diffDays < 7) return `${diffDays}天前`
  
  return target.format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.notification-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.custom-nav {
  background: #0068E2;
  padding-top: var(--status-bar-height, 44rpx);

  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }

    .nav-actions {
      display: flex;
      align-items: center;

      .action-btn {
        display: flex;
        align-items: center;
        padding: 8rpx 16rpx;
        border-radius: 24rpx;
        background: rgba(255, 255, 255, 0.2);

        .action-text {
          font-size: 22rpx;
          color: #fff;
          margin-left: 8rpx;
        }
      }
    }
  }
}

.stats-bar {
  display: flex;
  background: #fff;
  margin: 20rpx;
  padding: 32rpx 0;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .stat-item {
    flex: 1;
    text-align: center;

    .num {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #0068E2;
      margin-bottom: 8rpx;
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }
  }

  .divider {
    width: 1rpx;
    height: 60rpx;
    background: #f0f0f0;
  }
}

.filter-tabs {
  display: flex;
  padding: 0 24rpx;
  margin-bottom: 20rpx;

  .tab-item {
    padding: 16rpx 32rpx;
    margin-right: 16rpx;
    background: #fff;
    border-radius: 32rpx;
    font-size: 26rpx;
    color: #666;

    &.active {
      background: #0068E2;
      color: #fff;
    }
  }
}

.notification-list {
  padding: 0 24rpx;
  padding-bottom: 120rpx;

  .notification-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    display: flex;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

    &:active {
      transform: scale(0.98);
      transition: transform 0.15s ease;
    }

    .card-left {
      margin-right: 16rpx;
      padding-top: 8rpx;

      .unread-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background: #ff4d4f;
      }

      .read-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background: #d9d9d9;
      }
    }

    .card-main {
      flex: 1;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12rpx;

        .title {
          flex: 1;
          font-size: 30rpx;
          color: #333;
          font-weight: 500;
          margin-right: 16rpx;
        }
      }

      .card-content {
        margin-bottom: 16rpx;

        .content-text {
          font-size: 26rpx;
          color: #666;
          line-height: 1.5;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .meta-info {
          display: flex;
          align-items: center;

          .type-tag {
            display: flex;
            align-items: center;
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
            font-size: 22rpx;
            color: #fff;
            margin-right: 16rpx;

            text {
              margin-left: 6rpx;
            }

            &.type-case {
              background: #1890ff;
            }

            &.type-task {
              background: #722ed1;
            }

            &.type-system {
              background: #52c41a;
            }

            &.type-meeting {
              background: #fa8c16;
            }

            &.type-creditor {
              background: #13c2c2;
            }

            &.type-deadline {
              background: #eb2f96;
            }

            &.type-default {
              background: #8c8c8c;
            }
          }

          .time {
            font-size: 24rpx;
            color: #999;
          }
        }

        .actions {
          display: flex;
          gap: 20rpx;
          align-items: center;
        }
      }
    }
  }
}

.load-more {
  text-align: center;
  padding: 32rpx 0;
  color: #0068E2;
  font-size: 26rpx;
}
</style>
