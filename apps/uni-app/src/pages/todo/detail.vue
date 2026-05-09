<template>
  <view class="detail-container">
    <view class="header">
      <text class="title">待办详情</text>
      <view class="status-tag" :class="todoData?.status.toLowerCase()">
        {{ getStatusText(todoData?.status) }}
      </view>
    </view>

    <view class="content">
      <view class="info-card">
        <view class="info-item">
          <text class="label">标题</text>
          <text class="value">{{ todoData?.title }}</text>
        </view>

        <view class="info-item" v-if="todoData?.description">
          <text class="label">描述</text>
          <text class="value">{{ todoData.description }}</text>
        </view>

        <view class="info-item">
          <text class="label">优先级</text>
          <view class="priority-tag" :class="todoData?.priority.toLowerCase()">
            {{ getPriorityText(todoData?.priority) }}
          </view>
        </view>

        <view class="info-item">
          <text class="label">类型</text>
          <text class="value">{{ getTypeText(todoData?.type) }}</text>
        </view>

        <view class="info-item" v-if="todoData?.deadline">
          <text class="label">截止时间</text>
          <text class="value" :class="{ overdue: isOverdue(todoData.deadline) }">
            {{ formatDateTime(todoData.deadline) }}
          </text>
        </view>

        <view class="info-item" v-if="todoData?.assigneeName">
          <text class="label">负责人</text>
          <text class="value">{{ todoData.assigneeName }}</text>
        </view>

        <view class="info-item" v-if="todoData?.relatedId">
          <text class="label">关联业务</text>
          <text class="value">{{ todoData.relatedType }} - {{ todoData.relatedId }}</text>
        </view>

        <view class="info-item" v-if="todoData?.remark">
          <text class="label">备注</text>
          <text class="value">{{ todoData.remark }}</text>
        </view>

        <view class="info-item">
          <text class="label">创建人</text>
          <text class="value">{{ todoData?.createUserName }}</text>
        </view>

        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDateTime(todoData?.createTime) }}</text>
        </view>

        <view class="info-item" v-if="todoData?.completedTime">
          <text class="label">完成时间</text>
          <text class="value">{{ formatDateTime(todoData.completedTime) }}</text>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button class="cancel-btn" @click="handleBack">返回</button>
      <button
        v-if="todoData?.status === 'PENDING'"
        class="complete-btn"
        @click="handleComplete"
      >
        完成
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTodoById, completeTodo, type Todo } from '@/api/todo'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const todoId = ref('')
const todoData = ref<Todo | null>(null)

onMounted(() => {
  todoId.value = getPageParam('id')

  if (todoId.value) {
    loadDetail()
  }
})

onShow(() => {
  if (todoId.value) {
    loadDetail()
  }
})

const loadDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getTodoById(Number(todoId.value))
    if (res.code === 200 && res.data) {
      todoData.value = res.data
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: '待处理',
    COMPLETED: '已完成',
  }
  return map[status || ''] || status
}

const getPriorityText = (priority?: string) => {
  const map: Record<string, string> = {
    HIGH: '高',
    NORMAL: '中',
    LOW: '低',
  }
  return map[priority || ''] || '中'
}

const getTypeText = (type?: string) => {
  const map: Record<string, string> = {
    CASE_REVIEW: '案件审核',
    TASK: '任务',
    MEETING: '会议',
    DOCUMENT: '文档',
    OTHER: '其他',
  }
  return map[type || ''] || type || '其他'
}

const formatDateTime = (datetime?: string) => {
  if (!datetime) return ''
  return dayjs(datetime).format('YYYY-MM-DD HH:mm')
}

const isOverdue = (deadline: string) => {
  return dayjs(deadline).isBefore(dayjs())
}

const handleBack = () => {
  uni.navigateBack()
}

const handleComplete = async () => {
  uni.showModal({
    title: '确认完成',
    content: `确定要完成待办"${todoData.value?.title}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await completeTodo(Number(todoId.value))
          if (result.code === 200) {
            uni.showToast({ title: '已完成', icon: 'success' })
            uni.$emit('refresh-todo-list')
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            uni.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

const handleEdit = () => {
  uni.navigateTo({
    url: `/pages/todo/edit?mode=edit&id=${todoId.value}`,
  })
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  background: #0068E2;
  color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }

  .status-tag {
    padding: 8rpx 20rpx;
    border-radius: 12rpx;
    font-size: 24rpx;
    background: rgba(255, 255, 255, 0.2);

    &.pending {
      background: #fff3cd;
      color: #856404;
    }

    &.completed {
      background: #d4edda;
      color: #155724;
    }
  }
}

.content {
  padding: 20rpx;
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .info-item {
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      display: block;
      font-size: 26rpx;
      color: #999;
      margin-bottom: 12rpx;
    }

    .value {
      font-size: 30rpx;
      color: #333;
      line-height: 1.6;

      &.overdue {
        color: #ff4d4f;
      }
    }

    .priority-tag {
      display: inline-block;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-size: 24rpx;

      &.high {
        background: #fff1f0;
        color: #ff4d4f;
      }

      &.normal {
        background: #e6f7ff;
        color: #1890ff;
      }

      &.low {
        background: #f6ffed;
        color: #52c41a;
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

  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }

  .complete-btn {
    background: #52c41a;
    color: #fff;
  }

  .edit-btn {
    background: #0068E2;
    color: #fff;
  }
}
</style>
