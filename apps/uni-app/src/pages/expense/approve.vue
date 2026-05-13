<template>
  <view class="approve-container">
    <!-- 顶部统计 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="num">{{ total }}</text>
        <text class="label">全部</text>
      </view>
      <view class="stat-item">
        <text class="num pending">{{ pendingCount }}</text>
        <text class="label">待审批</text>
      </view>
      <view class="stat-item">
        <text class="num approved">{{ approvedCount }}</text>
        <text class="label">已通过</text>
      </view>
      <view class="stat-item">
        <text class="num rejected">{{ rejectedCount }}</text>
        <text class="label">已拒绝</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="icon">🔍</text>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索案件名称或报销单号"
          confirm-type="search"
          @confirm="handleSearch"
          @input="handleSearchInput"
        />
        <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 报销单列表 -->
    <view class="expense-list">
      <view
        v-for="(item, index) in expenseList"
        :key="item.id"
        class="expense-card animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <view @click="goToDetail(item.id)">
          <view class="card-header">
            <text class="expense-no">{{ item.reimbursementNumber }}</text>
            <text :class="['status', getApprovalStatusClass(item.approvalStatus)]">
              {{ getApprovalStatusText(item.approvalStatus) }}
            </text>
          </view>
          <view class="card-body">
            <text class="case-name">{{ item.caseName }}</text>
            <view class="info-row">
              <text class="label">申请人：</text>
              <text class="value">{{ item.applicantName || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="label">报销日期：</text>
              <text class="value">{{ formatDate(item.reimbursementDate) }}</text>
            </view>
            <view class="info-row" v-if="item.description">
              <text class="label">报销说明：</text>
              <text class="value">{{ item.description }}</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="time">{{ formatDateTime(item.createTime) }}</text>
            <text class="amount">¥{{ formatAmount(item.totalAmount) }}</text>
          </view>
        </view>
        
        <!-- 快速审批按钮 - 仅待审批状态显示 -->
        <view class="quick-actions" v-if="item.approvalStatus === 'PENDING'">
          <view class="action-btn approve" @click.stop="handleQuickApprove(item.id, 'APPROVED')">
            <text>✓ 通过</text>
          </view>
          <view class="action-btn reject" @click.stop="handleQuickApprove(item.id, 'REJECTED')">
            <text>✗ 拒绝</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && expenseList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="expenseList.length === 0">
        <text class="empty-icon">📄</text>
        <text>暂无报销单数据</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, computed } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import {
  getExpenseReimbursementList,
  approveExpenseReimbursement,
  getApprovalStatusText,
  getApprovalStatusClass,
  type ExpenseReimbursement,
} from '@/api/expense-reimbursement'
import dayjs from 'dayjs'

const searchKeyword = ref('')
const expenseList = shallowRef<ExpenseReimbursement[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)

onMounted(() => {
  loadData()
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    loadData(true)
  }, 500)
}

const handleSearch = () => {
  loadData(true)
}

const clearSearch = () => {
  searchKeyword.value = ''
  loadData(true)
}

const loadData = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const params: any = {
      page: isRefresh ? 1 : page.value,
      size: pageSize,
    }

    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }

    const res = await getExpenseReimbursementList(params)

    const rawList = res.data?.list || []
    const listData = Array.isArray(rawList) ? rawList.map(item => ({ ...item })) : []

    if (isRefresh) {
      expenseList.value = listData
      page.value = 1
    } else {
      expenseList.value = [...expenseList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = expenseList.value.length < (res.data?.total || 0)
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(() => {
  loadData(true).finally(() => {
    uni.stopPullDownRefresh()
  })
})

onReachBottom(() => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadData()
})

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/expense/detail?id=${id}` })
}

const handleQuickApprove = (id: number, status: 'APPROVED' | 'REJECTED') => {
  const statusText = status === 'APPROVED' ? '通过' : '拒绝'
  uni.showModal({
    title: `确认${statusText}`,
    content: `确定要${statusText}该报销单吗？`,
    confirmText: '确定',
    cancelText: '取消',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        uni.showLoading({ title: '审批中...' })
        try {
          await approveExpenseReimbursement(id, {
            approvalStatus: status,
            approvalOpinion: '',
          })
          uni.hideLoading()
          uni.showToast({ title: `已${statusText}`, icon: 'success' })
          loadData(true)
        } catch (error) {
          uni.hideLoading()
          uni.showToast({ title: '审批失败', icon: 'none' })
        }
      }
    },
  })
}

const pendingCount = computed(() =>
  expenseList.value.filter((item) => item.approvalStatus === 'PENDING').length
)

const approvedCount = computed(() =>
  expenseList.value.filter((item) => item.approvalStatus === 'APPROVED').length
)

const rejectedCount = computed(() =>
  expenseList.value.filter((item) => item.approvalStatus === 'REJECTED').length
)

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('MM-DD')
}

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toFixed(2)
}
</script>

<style lang="scss" scoped>
.approve-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.stats-bar {
  display: flex;
  background: #fff;
  padding: 24rpx 0;
  margin-bottom: 20rpx;

  .stat-item {
    flex: 1;
    text-align: center;
    border-right: 1rpx solid #f0f0f0;

    &:last-child {
      border-right: none;
    }

    .num {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;

      &.pending {
        color: #ff9800;
      }

      &.approved {
        color: #4caf50;
      }

      &.rejected {
        color: #f44336;
      }
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .search-input {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 24rpx;
    height: 72rpx;

    .icon {
      font-size: 28rpx;
      margin-right: 12rpx;
      color: #999;
    }

    input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }

  .clear-btn {
    font-size: 28rpx;
    color: #999;
    padding: 10rpx;
  }
}

.expense-list {
  padding: 0 20rpx;
  padding-bottom: 40rpx;

  .expense-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    opacity: 0;
    animation-fill-mode: forwards;

    &:active {
      transform: scale(0.98);
      transition: transform 0.15s ease;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .expense-no {
        font-size: 26rpx;
        color: #0068E2;
        font-weight: 500;
      }

      .status {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;

        &.status-pending {
          background: #fff3e0;
          color: #ff9800;
        }

        &.status-approved {
          background: #e8f5e9;
          color: #4caf50;
        }

        &.status-rejected {
          background: #ffebee;
          color: #f44336;
        }
      }
    }

    .card-body {
      margin-bottom: 16rpx;

      .case-name {
        display: block;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 12rpx;
      }

      .info-row {
        display: flex;
        margin-bottom: 8rpx;

        .label {
          font-size: 26rpx;
          color: #999;
          width: 160rpx;
        }

        .value {
          flex: 1;
          font-size: 26rpx;
          color: #666;
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16rpx;
      border-top: 1rpx solid #f5f5f5;

      .time {
        font-size: 24rpx;
        color: #999;
      }

      .amount {
        font-size: 32rpx;
        color: #f44336;
        font-weight: bold;
      }
    }

    .quick-actions {
      display: flex;
      gap: 16rpx;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;

      .action-btn {
        flex: 1;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8rpx;
        font-size: 28rpx;
        font-weight: 500;

        &.approve {
          background: #e8f5e9;
          color: #4caf50;

          &:active {
            background: #c8e6c9;
          }
        }

        &.reject {
          background: #ffebee;
          color: #f44336;

          &:active {
            background: #ffcdd2;
          }
        }
      }
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 30rpx;
    color: #999;
    font-size: 24rpx;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }

    text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
