<template>
  <view class="transactions-container">
    <!-- 账户摘要卡片 -->
    <view class="account-summary">
      <view class="summary-header">
        <view class="account-info">
          <text class="account-name">{{ accountInfo.accountName }}</text>
          <text class="account-no">{{ accountInfo.accountNumber }}</text>
        </view>
        <text :class="['status-badge', getStatusClass(accountInfo.status)]">{{ getStatusText(accountInfo.status) }}</text>
      </view>
      <view class="balance-row">
        <view class="balance-item">
          <text class="balance-label">当前余额</text>
          <text class="balance-value">¥{{ formatMoney(accountInfo.currentBalance) }}</text>
        </view>
        <view class="balance-divider"></view>
        <view class="balance-item">
          <text class="balance-label in">总流入</text>
          <text class="balance-value in">+¥{{ formatMoney(totalInflow) }}</text>
        </view>
        <view class="balance-divider"></view>
        <view class="balance-item">
          <text class="balance-label out">总流出</text>
          <text class="balance-value out">-¥{{ formatMoney(totalOutflow) }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索摘要、对方名称/账户"
          confirm-type="search"
          @confirm="handleSearch"
          @input="handleSearchInput"
        />
        <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</text>
      </view>
      <view class="filter-toggle" :class="{ active: showFilterPanel }" @click="showFilterPanel = !showFilterPanel">
        <text>筛选</text>
        <text class="badge" v-if="activeFilterCount > 0">{{ activeFilterCount }}</text>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view class="filter-panel" v-if="showFilterPanel">
      <view class="filter-group">
        <text class="filter-title">交易类型</text>
        <view class="filter-tags">
          <view
            v-for="item in transactionTypeOptions"
            :key="item.value"
            :class="['filter-tag', { active: filterParams.transactionType === item.value }]"
            @click="filterParams.transactionType = filterParams.transactionType === item.value ? '' : item.value"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
      <view class="filter-group">
        <text class="filter-title">业务类型</text>
        <view class="filter-tags">
          <view
            v-for="item in businessTypeOptions"
            :key="item.value"
            :class="['filter-tag', { active: filterParams.businessType === item.value }]"
            @click="filterParams.businessType = filterParams.businessType === item.value ? '' : item.value"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
      <view class="filter-group">
        <text class="filter-title">日期范围</text>
        <view class="quick-dates">
          <view
            v-for="item in quickDateOptions"
            :key="item.value"
            :class="['quick-tag', { active: quickDateValue === item.value }]"
            @click="selectQuickDate(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
        <view class="custom-date-row">
          <picker mode="date" :value="filterParams.startDate || ''" @change="onStartDateChange">
            <view class="date-input" :class="{ active: filterParams.startDate }">
              {{ filterParams.startDate || '开始日期' }}
            </view>
          </picker>
          <text class="date-separator">至</text>
          <picker mode="date" :value="filterParams.endDate || ''" @change="onEndDateChange">
            <view class="date-input" :class="{ active: filterParams.endDate }">
              {{ filterParams.endDate || '结束日期' }}
            </view>
          </picker>
        </view>
      </view>
      <view class="filter-actions">
        <view class="filter-btn reset" @click="resetFilter">重置</view>
        <view class="filter-btn confirm" @click="applyFilter">确定</view>
      </view>
    </view>

    <!-- 统计栏 -->
    <view class="stats-bar" v-if="transactionList.length > 0">
      <text class="stats-text">
        共 {{ total }} 条 · 流入 +¥{{ formatMoney(filteredInflow) }} · 流出 -¥{{ formatMoney(filteredOutflow) }}
      </text>
    </view>

    <!-- 新增按钮 -->
    <view class="action-bar">
      <view class="add-btn" @click="goToAddTransaction">
        <text>+ 新增流水</text>
      </view>
    </view>

    <!-- 流水列表 -->
    <scroll-view class="transaction-list" scroll-y @scrolltolower="onLoadMore">
      <view
        v-for="(item, index) in transactionList"
        :key="item.id"
        class="transaction-card"
        :style="{ animationDelay: `${index * 0.03}s` }"
      >
        <view class="card-header">
          <view class="type-badge" :class="item.transactionType === 'IN' ? 'type-in' : 'type-out'">
            <text>{{ item.transactionType === 'IN' ? '流入' : '流出' }}</text>
          </view>
          <text class="date">{{ item.transactionDate }}</text>
        </view>

        <view class="card-body">
          <view class="amount-row">
            <text class="amount-label">交易金额</text>
            <text :class="['amount', item.transactionType === 'IN' ? 'amount-in' : 'amount-out']">
              {{ item.transactionType === 'IN' ? '+' : '-' }}¥{{ formatMoney(item.amount) }}
            </text>
          </view>

          <view class="info-row" v-if="item.businessType">
            <text class="info-label">业务类型</text>
            <text class="info-value">{{ item.businessType }}</text>
          </view>

          <view class="info-row" v-if="item.summary">
            <text class="info-label">摘要</text>
            <text class="info-value summary">{{ item.summary }}</text>
          </view>

          <view class="info-row" v-if="item.counterpartyName">
            <text class="info-label">对方名称</text>
            <text class="info-value">{{ item.counterpartyName }}</text>
          </view>

          <view class="info-row" v-if="item.counterpartyAccount">
            <text class="info-label">对方账户</text>
            <text class="info-value account">{{ item.counterpartyAccount }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">交易后余额</text>
            <text class="info-value balance-after">¥{{ formatMoney(item.balanceAfter) }}</text>
          </view>

          <view class="info-row" v-if="item.remark">
            <text class="info-label">备注</text>
            <text class="info-value remark">{{ item.remark }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="action-btn edit-btn" @click="goToEditTransaction(item.id)">编辑</view>
          <view class="action-btn delete-btn" @click="handleDelete(item.id)">删除</view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && transactionList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="transactionList.length === 0 && !loading">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无流水记录</text>
        <view class="add-first-btn" @click="goToAddTransaction">
          <text>新增第一条流水</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import { getBankAccountDetail, getBankAccountTransactions, deleteBankTransaction, type BankTransactionItem } from '@/api/basic-data'
import { getPageParam } from '@/utils/pageParam'

const accountId = ref<number>(0)
const accountInfo = ref<any>({})
const transactionList = shallowRef<BankTransactionItem[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)

const searchKeyword = ref('')
const showFilterPanel = ref(false)
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const quickDateValue = ref('')

const filterParams = ref({
  transactionType: '',
  businessType: '',
  startDate: '',
  endDate: '',
})

const transactionTypeOptions = [
  { label: '全部', value: '' },
  { label: '流入', value: 'IN' },
  { label: '流出', value: 'OUT' },
]

const businessTypeOptions = [
  { label: '全部', value: '' },
  { label: '收款', value: '收款' },
  { label: '付款', value: '付款' },
  { label: '转账', value: '转账' },
  { label: '利息收入', value: '利息收入' },
  { label: '手续费', value: '手续费' },
  { label: '其他', value: '其他' },
]

const quickDateOptions = [
  { label: '今天', value: 'today' },
  { label: '近7天', value: 'week' },
  { label: '近30天', value: 'month' },
  { label: '本月', value: 'thisMonth' },
  { label: '上月', value: 'lastMonth' },
]

const activeFilterCount = computed(() => {
  let count = 0
  if (filterParams.value.transactionType) count++
  if (filterParams.value.businessType) count++
  if (filterParams.value.startDate || filterParams.value.endDate) count++
  return count
})

const totalInflow = computed(() => {
  return transactionList.value
    .filter((item) => item.transactionType === 'IN')
    .reduce((sum, item) => sum + (item.amount || 0), 0)
})

const totalOutflow = computed(() => {
  return transactionList.value
    .filter((item) => item.transactionType === 'OUT')
    .reduce((sum, item) => sum + (item.amount || 0), 0)
})

const filteredInflow = computed(() => {
  return transactionList.value
    .filter((item) => item.transactionType === 'IN')
    .reduce((sum, item) => sum + (item.amount || 0), 0)
})

const filteredOutflow = computed(() => {
  return transactionList.value
    .filter((item) => item.transactionType === 'OUT')
    .reduce((sum, item) => sum + (item.amount || 0), 0)
})

onMounted(() => {
  const id = getPageParam('id')

  if (id) {
    accountId.value = parseInt(id)
    loadAccountInfo(id)
    loadTransactions(true)
  }

  uni.$on('refresh-transaction-list', () => {
    loadAccountInfo(accountId.value)
    loadTransactions(true)
  })
})

onUnmounted(() => {
  uni.$off('refresh-transaction-list')
})

const loadAccountInfo = async (id: number) => {
  try {
    const res = await getBankAccountDetail(id)
    accountInfo.value = res.data
  } catch (error) {
    uni.showToast({ title: '加载账户信息失败', icon: 'none' })
  }
}

const loadTransactions = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const params: any = {
      pageNum: isRefresh ? 1 : page.value,
      pageSize,
    }

    if (filterParams.value.transactionType) {
      params.transactionType = filterParams.value.transactionType
    }
    if (filterParams.value.businessType) {
      params.businessType = filterParams.value.businessType
    }
    if (filterParams.value.startDate) {
      params.startDate = filterParams.value.startDate
    }
    if (filterParams.value.endDate) {
      params.endDate = filterParams.value.endDate
    }

    const res = await getBankAccountTransactions(accountId.value, params)
    const listData = res.data?.list || []

    if (isRefresh) {
      transactionList.value = listData
      page.value = 1
    } else {
      transactionList.value = [...transactionList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = transactionList.value.length < (res.data?.total || 0)
  } catch (error) {
    uni.showToast({ title: '加载流水失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadTransactions()
}

const handleSearchInput = () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  searchTimer.value = setTimeout(() => {
    handleSearch()
  }, 300)
}

const handleSearch = () => {
  // 前端搜索过滤
  if (!searchKeyword.value.trim()) {
    loadTransactions(true)
    return
  }
  const keyword = searchKeyword.value.trim().toLowerCase()
  const filtered = transactionList.value.filter((item) => {
    return (
      (item.summary && item.summary.toLowerCase().includes(keyword)) ||
      (item.counterpartyName && item.counterpartyName.toLowerCase().includes(keyword)) ||
      (item.counterpartyAccount && item.counterpartyAccount.toLowerCase().includes(keyword)) ||
      (item.businessType && item.businessType.toLowerCase().includes(keyword)) ||
      (item.remark && item.remark.toLowerCase().includes(keyword))
    )
  })
  transactionList.value = filtered
}

const clearSearch = () => {
  searchKeyword.value = ''
  loadTransactions(true)
}

const selectQuickDate = (value: string) => {
  quickDateValue.value = quickDateValue.value === value ? '' : value
  const today = dayjs()

  switch (value) {
    case 'today':
      filterParams.value.startDate = today.format('YYYY-MM-DD')
      filterParams.value.endDate = today.format('YYYY-MM-DD')
      break
    case 'week':
      filterParams.value.startDate = today.subtract(6, 'day').format('YYYY-MM-DD')
      filterParams.value.endDate = today.format('YYYY-MM-DD')
      break
    case 'month':
      filterParams.value.startDate = today.subtract(29, 'day').format('YYYY-MM-DD')
      filterParams.value.endDate = today.format('YYYY-MM-DD')
      break
    case 'thisMonth':
      filterParams.value.startDate = today.startOf('month').format('YYYY-MM-DD')
      filterParams.value.endDate = today.endOf('month').format('YYYY-MM-DD')
      break
    case 'lastMonth':
      filterParams.value.startDate = today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
      filterParams.value.endDate = today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      break
    default:
      filterParams.value.startDate = ''
      filterParams.value.endDate = ''
  }
}

const onStartDateChange = (e: any) => {
  filterParams.value.startDate = e.detail.value
  quickDateValue.value = ''
}

const onEndDateChange = (e: any) => {
  filterParams.value.endDate = e.detail.value
  quickDateValue.value = ''
}

const resetFilter = () => {
  filterParams.value = {
    transactionType: '',
    businessType: '',
    startDate: '',
    endDate: '',
  }
  quickDateValue.value = ''
  searchKeyword.value = ''
}

const applyFilter = () => {
  showFilterPanel.value = false
  loadTransactions(true)
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = { ACTIVE: '正常', INACTIVE: '停用', DELETED: '已删除' }
  return map[status || ''] || status || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = { ACTIVE: 'status-active', INACTIVE: 'status-inactive', DELETED: 'status-deleted' }
  return map[status || ''] || ''
}

const formatMoney = (money?: number) => {
  if (money === undefined || money === null) return '0.00'
  return money.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const goToAddTransaction = () => {
  uni.navigateTo({ url: `/pages/basic-data/bank-transaction-form?accountId=${accountId.value}` })
}

const goToEditTransaction = (id: number) => {
  uni.navigateTo({ url: `/pages/basic-data/bank-transaction-form?accountId=${accountId.value}&transactionId=${id}` })
}

const handleDelete = async (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后将无法恢复，确定要删除该流水记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteBankTransaction(id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadTransactions(true)
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.transactions-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 账户摘要 */
.account-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30rpx;
  color: #fff;

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;

    .account-info {
      display: flex;
      flex-direction: column;

      .account-name {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .account-no {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
        font-family: monospace;
      }
    }

    .status-badge {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      background: rgba(255, 255, 255, 0.2);

      &.status-active {
        background: rgba(82, 196, 26, 0.3);
      }

      &.status-inactive {
        background: rgba(255, 255, 255, 0.2);
      }

      &.status-deleted {
        background: rgba(255, 77, 79, 0.3);
      }
    }
  }

  .balance-row {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    padding: 20rpx 0;

    .balance-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .balance-label {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8rpx;

        &.in {
          color: #a8f5a8;
        }

        &.out {
          color: #ffb3b3;
        }
      }

      .balance-value {
        font-size: 28rpx;
        font-weight: bold;

        &.in {
          color: #a8f5a8;
        }

        &.out {
          color: #ffb3b3;
        }
      }
    }

    .balance-divider {
      width: 1rpx;
      height: 60rpx;
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #fff;

  .search-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 24rpx;
    height: 72rpx;

    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }

    input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .clear-btn {
      font-size: 28rpx;
      color: #999;
      padding: 10rpx;
    }
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 24rpx;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      background: #e6f7ff;
      color: #1890ff;
    }

    .badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 10rpx;
      border-radius: 20rpx;
    }
  }
}

/* 筛选面板 */
.filter-panel {
  background: #fff;
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;

  .filter-group {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .filter-title {
      display: block;
      font-size: 26rpx;
      color: #999;
      margin-bottom: 16rpx;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .filter-tag {
        padding: 12rpx 28rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #666;

        &.active {
          background: #1890ff;
          color: #fff;
        }
      }
    }

    .quick-dates {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .quick-tag {
        padding: 12rpx 24rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        font-size: 24rpx;
        color: #666;

        &.active {
          background: #e6f7ff;
          color: #1890ff;
          border: 2rpx solid #1890ff;
        }
      }
    }

    .custom-date-row {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .date-input {
        flex: 1;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #999;

        &.active {
          color: #333;
          background: #e6f7ff;
        }
      }

      .date-separator {
        font-size: 26rpx;
        color: #999;
      }
    }
  }

  .filter-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;

    .filter-btn {
      flex: 1;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;

      &.reset {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background: #1890ff;
        color: #fff;
      }
    }
  }
}

/* 统计栏 */
.stats-bar {
  padding: 16rpx 24rpx;
  background: #fff8f0;

  .stats-text {
    font-size: 24rpx;
    color: #666;
  }
}

/* 新增按钮 */
.action-bar {
  padding: 20rpx;
  background: #fff;

  .add-btn {
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1890ff;
    color: #fff;
    font-size: 30rpx;
    border-radius: 12rpx;

    &:active {
      background: #096dd9;
    }
  }
}

/* 流水列表 */
.transaction-list {
  flex: 1;
  padding: 0 20rpx 20rpx;
  overflow-y: auto;
}

.transaction-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: #fafafa;
    border-bottom: 1rpx solid #f0f0f0;

    .type-badge {
      padding: 8rpx 20rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
      color: #fff;

      &.type-in {
        background: #52c41a;
      }

      &.type-out {
        background: #ff4d4f;
      }
    }

    .date {
      font-size: 26rpx;
      color: #999;
    }
  }

  .card-body {
    padding: 20rpx;

    .amount-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16rpx;
      margin-bottom: 16rpx;
      border-bottom: 1rpx solid #f0f0f0;

      .amount-label {
        font-size: 26rpx;
        color: #999;
      }

      .amount {
        font-size: 32rpx;
        font-weight: bold;

        &.amount-in {
          color: #52c41a;
        }

        &.amount-out {
          color: #ff4d4f;
        }
      }
    }

    .info-row {
      display: flex;
      padding: 12rpx 0;

      .info-label {
        font-size: 24rpx;
        color: #999;
        width: 160rpx;
        flex-shrink: 0;
      }

      .info-value {
        font-size: 24rpx;
        color: #333;
        flex: 1;
        word-break: break-all;

        &.summary {
          color: #666;
        }

        &.account {
          font-family: monospace;
          color: #1890ff;
        }

        &.balance-after {
          font-weight: 500;
          color: #333;
        }

        &.remark {
          color: #666;
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16rpx 20rpx;
    border-top: 1rpx solid #f0f0f0;

    .action-btn {
      padding: 12rpx 24rpx;
      border-radius: 8rpx;
      font-size: 24rpx;

      &.edit-btn {
        color: #1890ff;

        &:active {
          background: #e6f7ff;
        }
      }

      &.delete-btn {
        margin-left: 20rpx;
        color: #ff4d4f;

        &:active {
          background: #fff1f0;
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

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 30rpx;
  }

  .add-first-btn {
    padding: 20rpx 40rpx;
    background: #1890ff;
    color: #fff;
    font-size: 28rpx;
    border-radius: 12rpx;

    &:active {
      background: #096dd9;
    }
  }
}
</style>