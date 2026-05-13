<template>
  <view class="detail-container">
    <view class="header">
      <view class="header-top">
        <view class="back-btn" @click="handleBack">
          <u-icon name="arrow-left" color="#fff" size="20"></u-icon>
        </view>
        <text class="title">通知详情</text>
        <view class="header-actions">
          <u-icon 
            v-if="notificationData && !notificationData.isRead"
            name="checkmark-circle" 
            color="#fff" 
            size="22"
            @click="handleMarkAsRead"
          ></u-icon>
          <u-icon 
            name="trash" 
            color="#fff" 
            size="22"
            @click="handleDelete"
          ></u-icon>
        </view>
      </view>
      <view class="status-badges">
        <view :class="['badge', getStatusClass(notificationData?.status)]">
          {{ getStatusText(notificationData?.status) }}
        </view>
        <view :class="['badge', 'priority-' + (notificationData?.priority?.toLowerCase() || 'normal')]">
          {{ getPriorityText(notificationData?.priority) }}
        </view>
        <view v-if="!notificationData?.isRead" class="badge badge-unread">未读</view>
        <view v-else class="badge badge-read">已读</view>
      </view>
    </view>

    <view class="content" v-if="notificationData">
      <view class="title-section">
        <text class="notification-title">{{ notificationData.title }}</text>
        <view :class="['type-tag', getTypeClass(notificationData.type)]">
          <u-icon :name="getTypeIcon(notificationData.type)" size="14" color="#fff"></u-icon>
          <text>{{ getTypeText(notificationData.type) }}</text>
        </view>
      </view>

      <view class="content-section">
        <text class="notification-content">{{ notificationData.content }}</text>
      </view>

      <view class="info-card">
        <view class="section-title">
          <u-icon name="info-circle" color="#0068E2" size="16"></u-icon>
          <text>详细信息</text>
        </view>

        <view class="info-item">
          <text class="label">接收人</text>
          <text class="value">{{ notificationData.userName }}</text>
        </view>

        <view class="info-item" v-if="notificationData.createUserName">
          <text class="label">创建人</text>
          <text class="value">{{ notificationData.createUserName }}</text>
        </view>

        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDateTime(notificationData.createTime) }}</text>
        </view>

        <view class="info-item" v-if="notificationData.readTime">
          <text class="label">阅读时间</text>
          <text class="value">{{ formatDateTime(notificationData.readTime) }}</text>
        </view>

        <view class="info-item" v-if="notificationData.expireTime">
          <text class="label">过期时间</text>
          <text class="value" :class="{ expired: isExpired(notificationData.expireTime) }">
            {{ formatDateTime(notificationData.expireTime) }}
          </text>
        </view>

        <view class="info-item" v-if="notificationData.relatedId">
          <text class="label">关联业务</text>
          <text class="value">{{ notificationData.relatedType }} (ID: {{ notificationData.relatedId }})</text>
        </view>

        <view class="info-item" v-if="notificationData.remark">
          <text class="label">备注</text>
          <text class="value">{{ notificationData.remark }}</text>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button class="back-btn-footer" @click="handleBack">返回列表</button>
      <button 
        v-if="notificationData && !notificationData.isRead"
        class="read-btn" 
        @click="handleMarkAsRead"
      >
        标记为已读
      </button>
    </view>

    <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  getNotificationById, 
  markAsRead,
  deleteNotification,
  type Notification,
  notificationTypeMap,
  notificationPriorityMap,
  notificationStatusMap
} from '@/api/notification'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const notificationId = ref('')
const notificationData = ref<Notification | null>(null)
const loading = ref(true)

onMounted(() => {
  notificationId.value = getPageParam('id')

  if (notificationId.value) {
    loadDetail()
  }
})

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getNotificationById(Number(notificationId.value))
    if (res.code === 200 && res.data) {
      notificationData.value = res.data
      
      if (!res.data.isRead) {
        await markAsRead(Number(notificationId.value))
      }
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
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

const getStatusText = (status?: string) => {
  return notificationStatusMap[status || '']?.text || status || '未知'
}

const getStatusClass = (status?: string) => {
  const classMap: Record<string, string> = {
    ACTIVE: 'status-active',
    INACTIVE: 'status-inactive',
    EXPIRED: 'status-expired',
  }
  return classMap[status || ''] || 'status-default'
}

const formatDateTime = (datetime?: string) => {
  if (!datetime) return ''
  return dayjs(datetime).format('YYYY-MM-DD')
}

const isExpired = (expireTime: string) => {
  return dayjs(expireTime).isBefore(dayjs())
}

const handleBack = () => {
  uni.navigateBack()
}

const handleMarkAsRead = async () => {
  try {
    const res = await markAsRead(Number(notificationId.value))
    if (res.code === 200) {
      uni.showToast({ title: '已标记为已读', icon: 'success' })
      if (notificationData.value) {
        notificationData.value.isRead = true
        notificationData.value.readTime = new Date().toISOString()
      }
    }
  } catch (error) {
uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条通知吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteNotification(Number(notificationId.value))
          uni.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 140rpx;
}

.header {
  background: linear-gradient(135deg, #0068E2 0%, #004bb5 100%);
  padding: 40rpx 32rpx 32rpx;

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .back-btn {
      padding: 8rpx;
    }

    .title {
      flex: 1;
      text-align: center;
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }

    .header-actions {
      display: flex;
      gap: 24rpx;
    }
  }

  .status-badges {
    display: flex;
    gap: 12rpx;
    justify-content: center;
    flex-wrap: wrap;

    .badge {
      padding: 8rpx 20rpx;
      border-radius: 24rpx;
      font-size: 24rpx;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;

      &.status-active {
        background: rgba(82, 196, 26, 0.3);
      }

      &.status-inactive {
        background: rgba(255, 255, 255, 0.2);
      }

      &.status-expired {
        background: rgba(255, 77, 79, 0.3);
      }

      &.priority-high {
        background: rgba(255, 77, 79, 0.3);
      }

      &.priority-normal {
        background: rgba(250, 173, 20, 0.3);
      }

      &.priority-low {
        background: rgba(82, 196, 26, 0.3);
      }

      &.badge-unread {
        background: rgba(255, 77, 79, 0.5);
      }

      &.badge-read {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }
}

.content {
  padding: 24rpx;
}

.title-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .notification-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    line-height: 1.5;
  }

  .type-tag {
    display: inline-flex;
    align-items: center;
    padding: 8rpx 20rpx;
    border-radius: 12rpx;
    font-size: 24rpx;
    color: #fff;

    text {
      margin-left: 8rpx;
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
}

.content-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .notification-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;

  .section-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .label {
      font-size: 26rpx;
      color: #999;
      flex-shrink: 0;
      min-width: 160rpx;
    }

    .value {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      text-align: right;
      line-height: 1.6;

      &.expired {
        color: #ff4d4f;
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;

  button {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    border: none;
  }

  .back-btn-footer {
    background: #f5f5f5;
    color: #666;
  }

  .read-btn {
    background: #0068E2;
    color: #fff;
  }
}
</style>
