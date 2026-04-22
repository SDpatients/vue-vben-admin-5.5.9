<template>
  <view class="todo-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content">
        <text class="title">待办事项</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="num">{{ stats.pending }}</text>
        <text class="label">待处理</text>
      </view>
      <view class="divider"></view>
      <view class="stat-item">
        <text class="num">{{ stats.completed }}</text>
        <text class="label">已完成</text>
      </view>
      <view class="divider"></view>
      <view class="stat-item">
        <text class="num">{{ stats.overdue }}</text>
        <text class="label">已逾期</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view 
        v-for="tab in filterTabs" 
        :key="tab.value"
        :class="['tab-item', { active: currentFilter === tab.value }]"
        @click="handleFilterChange(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 待办列表 -->
    <view class="todo-list">
      <view 
        v-for="(todo, index) in todoList" 
        :key="todo.id"
        class="todo-card animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="goToDetail(todo.id)"
      >
        <view class="todo-header">
          <view :class="['priority-dot', todo.priority?.toLowerCase()]"></view>
          <text class="todo-title">{{ todo.title }}</text>
          <view class="header-right">
            <text :class="['priority-text', todo.priority?.toLowerCase()]">
              优先级：{{ getPriorityText(todo.priority) }}
            </text>
            <u-tag 
              :text="getStatusText(todo.status)" 
              :type="getStatusType(todo.status)"
              size="mini"
            ></u-tag>
          </view>
        </view>
        <view class="todo-content" v-if="todo.description">
          <text>{{ todo.description }}</text>
        </view>
        <view class="todo-footer">
          <view class="deadline" :class="{ overdue: isOverdue(todo.deadline) }">
            <u-icon name="clock" size="14" :color="isOverdue(todo.deadline) ? '#ff4d4f' : '#999'"></u-icon>
            <text>{{ formatDate(todo.deadline) }}</text>
          </view>
          <view class="actions" @click.stop>
            <u-icon 
              v-if="todo.status !== 'COMPLETED'"
              name="checkmark-circle" 
              size="20" 
              color="#52c41a"
              @click="handleComplete(todo.id)"
            ></u-icon>
            <u-icon 
              name="trash" 
              size="20" 
              color="#ff4d4f"
              @click="handleDelete(todo.id)"
            ></u-icon>
          </view>
        </view>
      </view>

      <u-empty 
        v-if="todoList.length === 0 && !loading" 
        mode="list" 
        text="暂无待办事项"
      ></u-empty>
    </view>

    <!-- 新建按钮 -->
    <view class="fab-btn" @click="handleCreate">
      <u-icon name="plus" color="#fff" size="24"></u-icon>
    </view>

    <!-- 加载状态 -->
    <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { 
  getTodoList, 
  completeTodo, 
  deleteTodo,
  getTodoMyStats,
  type Todo 
} from '@/api/todo'
import dayjs from 'dayjs'

console.log('=== todo/index.vue loaded ===')

const authStore = useAuthStore()
const todoList = ref<Todo[]>([])
const loading = ref(true)
const currentFilter = ref('all')

const stats = ref({
  pending: 0,
  completed: 0,
  overdue: 0,
})

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'completed' },
]

onMounted(() => {
  console.log('[onMounted] todo index')
  loadData()
})

const handleFilterChange = (value: string) => {
  console.log('[handleFilterChange] filter:', value)
  currentFilter.value = value
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const userId = authStore.userInfo?.userId
    console.log('[loadData] userId:', userId, 'filter:', currentFilter.value)
    if (!userId) {
      console.error('[loadData] userId is empty, cannot load stats')
      uni.showToast({ title: '用户未登录', icon: 'none' })
      return
    }

    const statusParam = currentFilter.value === 'all' ? undefined : currentFilter.value.toUpperCase()

    // 加载待办列表
    const res = await getTodoList({ 
      userId,
      pageNum: 1,
      pageSize: 100,
      status: statusParam,
    })
    console.log('[loadData] getTodoList Response:', JSON.stringify(res))
    console.log('[loadData] res.data:', JSON.stringify(res.data))
    
    // 后端返回的数据格式是 data.list
    if (res.data?.list) {
      todoList.value = res.data.list
      console.log('[loadData] todoList from res.data.list, count:', todoList.value.length)
    } else if (res.data?.content) {
      todoList.value = res.data.content
      console.log('[loadData] todoList from res.data.content, count:', todoList.value.length)
    } else {
      console.log('[loadData] no list or content in response')
      todoList.value = []
    }
    
    // 加载统计数据
    console.log('[loadData] Calling getTodoMyStats with userId:', userId)
    const statsRes = await getTodoMyStats(userId)
    console.log('[loadData] getTodoMyStats Response:', statsRes)
    
    if (statsRes?.data) {
      console.log('[loadData] Stats data:', statsRes.data)
      stats.value.pending = statsRes.data.inProgressTodos || 0
      stats.value.completed = statsRes.data.completedTodos || 0
      stats.value.overdue = statsRes.data.overdueTodos || 0
      console.log('[loadData] Final stats:', stats.value)
    } else {
      console.warn('[loadData] Stats response has no data, response:', statsRes)
    }
  } catch (error) {
    console.error('[loadData] Error:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const isOverdue = (deadline?: string) => {
  if (!deadline) return false
  return dayjs(deadline).isBefore(dayjs())
}

const onRefresh = () => {
  loadData().finally(() => {
    uni.stopPullDownRefresh()
  })
}

onPullDownRefresh(() => {
  onRefresh()
})

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/todo/detail?id=${id}` })
}

const handleCreate = () => {
  uni.navigateTo({ url: '/pages/todo/edit?mode=add' })
}

const handleComplete = async (id: number) => {
  try {
    const res = await completeTodo(id)
    if (res.code === 200) {
      uni.showToast({ title: '已完成', icon: 'success' })
      loadData()
    }
  } catch (error) {
    console.error('[handleComplete] Error:', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleDelete = (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个待办事项吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteTodo(id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadData()
        } catch (error) {
          console.error('[handleDelete] Error:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: '待处理',
    COMPLETED: '已完成',
  }
  return map[status || ''] || status || '未知'
}

const getStatusType = (status?: string): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    PENDING: 'warning',
    COMPLETED: 'success',
  }
  return map[status || ''] || 'info'
}

const getPriorityText = (priority?: string) => {
  const map: Record<string, string> = {
    HIGH: '高',
    NORMAL: '中',
    LOW: '低',
  }
  return map[priority || ''] || '中'
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.todo-container {
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
    justify-content: center;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }
  }
}

.stats-card {
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

.todo-list {
  padding: 0 24rpx;
  padding-bottom: 120rpx;

  .todo-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    opacity: 0;
    animation-fill-mode: forwards;

    &:active {
      transform: scale(0.98);
      transition: transform 0.15s ease;
    }

    .todo-header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      .priority-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        margin-right: 12rpx;

        &.high {
          background: #ff4d4f;
        }

        &.normal {
          background: #faad14;
        }

        &.low {
          background: #52c41a;
        }
      }

      .todo-title {
        flex: 1;
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
        margin-right: 16rpx;
      }
    }

    .todo-content {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 16rpx;
      line-height: 1.5;
    }

    .todo-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .deadline {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #999;

        &.overdue {
          color: #ff4d4f;
        }

        text {
          margin-left: 8rpx;
        }
      }

      .actions {
        display: flex;
        gap: 24rpx;
      }
    }
  }
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  background: #0068E2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 104, 226, 0.3);
}
</style>
