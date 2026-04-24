<template>
  <view class="tasks-container">
    <view class="header">
      <text class="title">{{ moduleName }}</text>
      <view class="add-btn" @click="handleAddTask">
        <text class="icon">+</text>
        <text class="text">添加</text>
      </view>
    </view>

    <scroll-view
      class="task-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view
        v-for="task in taskList"
        :key="task.id"
        class="task-card"
        @click="handleTaskClick(task)"
      >
        <view class="task-header">
          <text class="task-title">{{ task.title }}</text>
          <view :class="['status-badge', getStatusClass(task.status)]">
            {{ getStatusText(task.status) }}
          </view>
        </view>

        <view class="task-content" v-if="task.content">
          {{ task.content }}
        </view>

        <view class="task-footer">
          <text class="task-time">{{ formatDateTime(task.createTime) }}</text>
          <view class="task-actions">
            <text class="action-btn" @click.stop="handleEditTask(task)">编辑</text>
            <text class="action-btn delete" @click.stop="handleDeleteTask(task)">删除</text>
          </view>
        </view>
      </view>

      <view class="empty" v-if="taskList.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无任务</text>
        <view class="empty-btn" @click="handleAddTask">
          <text>添加第一个任务</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getCaseStageDataByStageNum,
  deleteCaseStageData,
  type ProcessStageData,
} from '@/api/process-stage'
import dayjs from 'dayjs'

const caseId = ref('')
const stageId = ref(1)
const moduleCode = ref('')
const moduleName = ref('')
const taskList = ref<ProcessStageData[]>([])
const refreshing = ref(false)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.caseId || ''
  stageId.value = Number(currentPage.options?.stageId) || 1
  moduleCode.value = currentPage.options?.moduleCode || ''
  moduleName.value = decodeURIComponent(currentPage.options?.moduleName || '')

  loadTasks()
})

onShow(() => {
  if (caseId.value) {
    loadTasks()
  }
})

const loadTasks = async () => {
  if (!caseId.value) {
    console.warn('caseId is empty, skipping loadTasks')
    return
  }
  try {
    const res = await getCaseStageDataByStageNum(Number(caseId.value), stageId.value)
    if (res.code === 200 && res.data) {
      taskList.value = res.data.filter((item) => item.moduleCode === moduleCode.value)
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadTasks()
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    '0': '进行中',
    '1': '已完成',
    '2': '已跳过',
  }
  return map[status || ''] || '进行中'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    '0': 'status-processing',
    '1': 'status-completed',
    '2': 'status-skipped',
  }
  return map[status || ''] || 'status-processing'
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const handleAddTask = () => {
  uni.navigateTo({
    url: `/pages/cases/process-task-edit?caseId=${caseId.value}&stageId=${stageId.value}&moduleCode=${moduleCode.value}&moduleName=${encodeURIComponent(moduleName.value)}&mode=add`,
  })
}

const handleTaskClick = (task: ProcessStageData) => {
  uni.navigateTo({
    url: `/pages/cases/process-task-edit?caseId=${caseId.value}&stageId=${stageId.value}&moduleCode=${moduleCode.value}&moduleName=${encodeURIComponent(moduleName.value)}&mode=view&taskId=${task.id}`,
  })
}

const handleEditTask = (task: ProcessStageData) => {
  uni.navigateTo({
    url: `/pages/cases/process-task-edit?caseId=${caseId.value}&stageId=${stageId.value}&moduleCode=${moduleCode.value}&moduleName=${encodeURIComponent(moduleName.value)}&mode=edit&taskId=${task.id}`,
  })
}

const handleDeleteTask = (task: ProcessStageData) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除任务"${task.title}"吗？`,
    success: async (res: any) => {
      if (res.confirm) {
        try {
          const result = await deleteCaseStageData(task.id)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            loadTasks()
          } else {
            uni.showToast({ title: result.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.tasks-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: #0068E2;
  padding: 40rpx;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 24rpx;

    .icon {
      font-size: 32rpx;
    }

    .text {
      font-size: 26rpx;
    }
  }
}

.task-list {
  padding: 20rpx;
  height: calc(100vh - 160rpx);
}

.task-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .task-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      flex: 1;
      margin-right: 16rpx;
    }

    .status-badge {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;

      &.status-processing {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.status-completed {
        background: #e8f5e9;
        color: #388e3c;
      }

      &.status-skipped {
        background: #fff3e0;
        color: #f57c00;
      }
    }
  }

  .task-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 16rpx;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .task-time {
      font-size: 24rpx;
      color: #999;
    }

    .task-actions {
      display: flex;
      gap: 20rpx;

      .action-btn {
        font-size: 24rpx;
        color: #0068E2;
        padding: 4rpx 12rpx;
        background: #f0f4ff;
        border-radius: 8rpx;

        &.delete {
          color: #ff4d4f;
          background: #fff1f0;
        }
      }
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 30rpx;
  }

  .empty-btn {
    padding: 16rpx 32rpx;
    background: #0068E2;
    color: #fff;
    border-radius: 24rpx;
    font-size: 26rpx;
  }
}
</style>
