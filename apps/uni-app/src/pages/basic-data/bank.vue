<template>
  <view class="bank-container">
    <view class="search-section">
      <view class="search-bar">
        <view class="search-input">
          <text class="icon">🔍</text>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索账户名称"
            confirm-type="search"
            @confirm="handleSearch"
            @input="handleSearchInput"
          />
          <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</text>
        </view>
        <view class="filter-btn" :class="{ active: showFilter }" @click="showFilter = !showFilter">
          <text>筛选</text>
          <text class="filter-icon" v-if="filterCount > 0">{{ filterCount }}</text>
        </view>
      </view>

      <view class="filter-panel" v-if="showFilter">
        <view class="filter-item">
          <text class="filter-label">账户类型</text>
          <view class="filter-options">
            <view
              v-for="item in accountTypeOptions"
              :key="item.value"
              :class="['filter-option', { active: filterParams.accountType === item.value }]"
              @click="toggleFilter('accountType', item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>
        <view class="filter-item">
          <text class="filter-label">状态</text>
          <view class="filter-options">
            <view
              v-for="item in statusOptions"
              :key="item.value"
              :class="['filter-option', { active: filterParams.status === item.value }]"
              @click="toggleFilter('status', item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>
        <view class="filter-actions">
          <view class="reset-btn" @click="resetFilter">重置</view>
          <view class="confirm-btn" @click="applyFilter">确定</view>
        </view>
      </view>
    </view>

    <view class="result-stats" v-if="total > 0">
      <text>共 {{ total }} 条结果</text>
    </view>

    <view class="table-header">
      <view class="th th-name">账户信息</view>
      <view class="th th-balance">余额</view>
    </view>

    <scroll-view class="table-body" scroll-y @scrolltolower="onLoadMore">
      <view
        v-for="(item, index) in bankList"
        :key="item.id"
        class="table-row animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.03}s` }"
        @click="goToDetail(item.id)"
      >
        <view class="td td-name">
          <view class="name-cell">
            <view class="avatar-mini">💳</view>
            <view class="name-info">
              <text class="name">{{ item.accountName }}</text>
              <text class="account">{{ item.bankName }} {{ item.accountNumber }}</text>
            </view>
          </view>
        </view>
        <view class="td td-balance">
          <text class="balance">¥{{ formatMoney(item.currentBalance) }}</text>
          <text :class="['status-badge', getStatusClass(item.status)]">{{ getStatusText(item.status) }}</text>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && bankList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="bankList.length === 0">
        <text class="empty-icon">🏦</text>
        <text class="empty-text">暂无银行账户数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getBankAccountList, type BankAccountItem } from '@/api/basic-data'

const searchKeyword = ref('')
const bankList = shallowRef<BankAccountItem[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const showFilter = ref(false)
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const filterParams = ref({
  accountType: '',
  status: '',
})

const accountTypeOptions = [
  { label: '全部', value: '' },
  { label: '基本存款账户', value: '基本存款账户' },
  { label: '一般存款账户', value: '一般存款账户' },
  { label: '临时存款账户', value: '临时存款账户' },
  { label: '专用存款账户', value: '专用存款账户' },
]

const statusOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
]

const filterCount = computed(() => {
  let count = 0
  if (filterParams.value.accountType) count++
  if (filterParams.value.status) count++
  return count
})

onMounted(() => {
  loadData()
})

const handleSearchInput = () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  searchTimer.value = setTimeout(() => {
    loadData(true)
  }, 300)
}

const handleSearch = () => {
  loadData(true)
}

const clearSearch = () => {
  searchKeyword.value = ''
  loadData(true)
}

const toggleFilter = (key: 'accountType' | 'status', value: string) => {
  if (filterParams.value[key] === value) {
    filterParams.value[key] = ''
  } else {
    filterParams.value[key] = value
  }
}

const resetFilter = () => {
  filterParams.value = { accountType: '', status: '' }
}

const applyFilter = () => {
  showFilter.value = false
  loadData(true)
}

const loadData = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const params: any = {
      pageNum: isRefresh ? 1 : page.value,
      pageSize,
    }

    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
      params.accountName = searchKeyword.value.trim()
    }
    if (filterParams.value.accountType) {
      params.accountType = filterParams.value.accountType
    }
    if (filterParams.value.status) {
      params.status = filterParams.value.status
    }

    const res = await getBankAccountList(params)
    const listData = res.data?.list || []

    if (isRefresh) {
      bankList.value = listData
      page.value = 1
    } else {
      bankList.value = [...bankList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = bankList.value.length < (res.data?.total || 0)
  } catch (error) {
    console.error('[loadData] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const onRefresh = () => {
  loadData(true)
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
  uni.navigateTo({ url: `/pages/basic-data/bank-detail?id=${id}` })
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = { ACTIVE: '正常', INACTIVE: '停用' }
  return map[status || ''] || status || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = { ACTIVE: 'status-active', INACTIVE: 'status-inactive' }
  return map[status || ''] || ''
}

const formatMoney = (money?: number) => {
  if (!money) return '0.00'
  return money.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}
</script>

<style lang="scss" scoped>
.bank-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.search-section {
  background: #fff;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.search-bar {
  display: flex;
  align-items: center;
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

    .clear-btn {
      font-size: 28rpx;
      color: #999;
      padding: 10rpx;
    }
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 24rpx;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    font-size: 28rpx;
    color: #666;

    &.active {
      background: #e6f7ff;
      color: #1890ff;
    }

    .filter-icon {
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 10rpx;
      border-radius: 20rpx;
    }
  }
}

.filter-panel {
  margin-top: 20rpx;
  padding: 24rpx;
  background: #fafafa;
  border-radius: 16rpx;

  .filter-item {
    margin-bottom: 24rpx;

    &:last-of-type {
      margin-bottom: 0;
    }

    .filter-label {
      display: block;
      font-size: 26rpx;
      color: #999;
      margin-bottom: 16rpx;
    }

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .filter-option {
        padding: 12rpx 32rpx;
        background: #fff;
        border: 1rpx solid #eee;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #666;

        &.active {
          background: #1890ff;
          border-color: #1890ff;
          color: #fff;
        }
      }
    }
  }

  .filter-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #eee;

    .reset-btn,
    .confirm-btn {
      flex: 1;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;
    }

    .reset-btn {
      background: #f5f5f5;
      color: #666;
    }

    .confirm-btn {
      background: #1890ff;
      color: #fff;
    }
  }
}

.result-stats {
  padding: 16rpx 20rpx;
  background: #f5f7fa;
  color: #999;
  font-size: 24rpx;
}

.table-header {
  display: flex;
  padding: 24rpx 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;

  .th {
    font-size: 24rpx;
    color: #999;
    font-weight: 500;

    &.th-name {
      flex: 1;
    }

    &.th-balance {
      width: 200rpx;
      text-align: right;
    }
  }
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.table-row {
  display: flex;
  padding: 24rpx 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f5f5f5;
  opacity: 0;
  animation-fill-mode: forwards;

  &:active {
    background: #fafafa;
  }

  .td {
    display: flex;
    flex-direction: column;
    justify-content: center;

    &.td-name {
      flex: 1;

      .name-cell {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .avatar-mini {
          width: 64rpx;
          height: 64rpx;
          background: #f9f0ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
        }

        .name-info {
          .name {
            display: block;
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 4rpx;
          }

          .account {
            font-size: 22rpx;
            color: #999;
          }
        }
      }
    }

    &.td-balance {
      width: 200rpx;
      align-items: flex-end;

      .balance {
        display: block;
        font-size: 28rpx;
        color: #ff6b6b;
        font-weight: bold;
        margin-bottom: 4rpx;
      }

      .status-badge {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;

        &.status-active {
          background: #e6f7ed;
          color: #52c41a;
        }

        &.status-inactive {
          background: #f5f5f5;
          color: #999;
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
  }
}
</style>
