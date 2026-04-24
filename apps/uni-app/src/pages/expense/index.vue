<template>
  <view class="expense-container">
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
      <text class="filter-btn" :class="{ active: hasActiveFilter }" @click="showFilter = true">
        筛选{{ hasActiveFilter ? `(${activeFilterCount})` : '' }}
      </text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-bar">
      <view class="stat-item" @click="quickFilter('')">
        <text class="num" :class="{ active: !filterParams.approvalStatus }">{{ total }}</text>
        <text class="label">全部</text>
      </view>
      <view class="stat-item" @click="quickFilter('PENDING')">
        <text class="num" :class="{ active: filterParams.approvalStatus === 'PENDING' }">{{ pendingCount }}</text>
        <text class="label">待审批</text>
      </view>
      <view class="stat-item" @click="quickFilter('APPROVED')">
        <text class="num" :class="{ active: filterParams.approvalStatus === 'APPROVED' }">{{ approvedCount }}</text>
        <text class="label">已通过</text>
      </view>
      <view class="stat-item" @click="quickFilter('REJECTED')">
        <text class="num" :class="{ active: filterParams.approvalStatus === 'REJECTED' }">{{ rejectedCount }}</text>
        <text class="label">已拒绝</text>
      </view>
    </view>

    <!-- 报销单列表 -->
    <view class="expense-list">
      <view
        v-for="(item, index) in expenseList"
        :key="item.id"
        class="expense-card animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="goToDetail(item.id)"
      >
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
            <text class="label">银行账户：</text>
            <text class="value">{{ item.fundAccountName || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">报销日期：</text>
            <text class="value">{{ formatDate(item.reimbursementDate) }}</text>
          </view>
        </view>
        <view class="card-footer">
          <text class="time">{{ formatDateTime(item.createTime) }}</text>
          <text class="amount">¥{{ formatAmount(item.totalAmount) }}</text>
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

    <!-- 新建按钮 -->
    <view class="fab-btn" @click="handleCreate">
      <text class="icon">+</text>
    </view>

    <!-- 筛选弹窗 -->
    <view class="filter-modal" v-if="showFilter">
      <view class="modal-mask" @click="showFilter = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">筛选条件</text>
          <text class="reset-btn" @click="resetFilter">重置</text>
        </view>

        <view class="filter-section">
          <text class="section-title">审批状态</text>
          <view class="option-list">
            <view
              v-for="item in statusOptions"
              :key="item.value"
              class="option-item"
              :class="{ active: tempFilterParams.approvalStatus === item.value }"
              @click="tempFilterParams.approvalStatus = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <view class="btn cancel" @click="showFilter = false">
            <text>取消</text>
          </view>
          <view class="btn confirm" @click="applyFilter">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, computed, watch } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import {
  getExpenseReimbursementList,
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
const refreshing = ref(false)
const hasMore = ref(true)
const showFilter = ref(false)

const filterParams = ref<{
  approvalStatus: string
}>({
  approvalStatus: '',
})

const tempFilterParams = ref<{
  approvalStatus: string
}>({
  approvalStatus: '',
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待审批', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
]

const hasActiveFilter = computed(() => {
  return filterParams.value.approvalStatus !== ''
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterParams.value.approvalStatus) count++
  return count
})

const pendingCount = computed(() =>
  expenseList.value.filter((item) => item.approvalStatus === 'PENDING').length
)

const approvedCount = computed(() =>
  expenseList.value.filter((item) => item.approvalStatus === 'APPROVED').length
)

const rejectedCount = computed(() =>
  expenseList.value.filter((item) => item.approvalStatus === 'REJECTED').length
)

watch(showFilter, (newVal) => {
  if (newVal) {
    tempFilterParams.value = { ...filterParams.value }
  }
})

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

const quickFilter = (status: string) => {
  filterParams.value.approvalStatus = status
  loadData(true)
}

const resetFilter = () => {
  tempFilterParams.value = {
    approvalStatus: '',
  }
}

const applyFilter = () => {
  filterParams.value = { ...tempFilterParams.value }
  showFilter.value = false
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

    if (filterParams.value.approvalStatus) {
      params.approvalStatus = filterParams.value.approvalStatus
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
    console.error('[loadData] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  loadData(true).finally(() => {
    uni.stopPullDownRefresh()
  })
}

const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadData()
}

onPullDownRefresh(() => {
  onRefresh()
})

onReachBottom(() => {
  onLoadMore()
})

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/expense/detail?id=${id}` })
}

const handleCreate = () => {
  uni.navigateTo({ url: '/pages/expense/form' })
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('MM-DD HH:mm')
}

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toFixed(2)
}
</script>

<style lang="scss" scoped>
.expense-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  gap: 20rpx;

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

  .filter-btn {
    font-size: 28rpx;
    color: #0068E2;
    font-weight: 500;

    &.active {
      color: #0068E2;
      font-weight: bold;
    }
  }

  .clear-btn {
    font-size: 28rpx;
    color: #999;
    padding: 10rpx;
  }
}

.stats-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
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
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;

      &.active {
        color: #0068E2;
      }
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.expense-list {
  padding: 0 20rpx;
  padding-bottom: 120rpx;

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

  .icon {
    font-size: 48rpx;
    color: #fff;
    font-weight: 300;
  }

  &:active {
    transform: scale(0.95);
  }
}

.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600rpx;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .reset-btn {
      font-size: 28rpx;
      color: #0068E2;
    }
  }

  .filter-section {
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .section-title {
      display: block;
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
    }

    .option-list {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .option-item {
        padding: 16rpx 32rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #666;

        &.active {
          background: #0068E2;
          color: #fff;
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    padding: 20rpx 30rpx;
    gap: 20rpx;

    .btn {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background: #0068E2;
        color: #fff;
      }
    }
  }
}
</style>
