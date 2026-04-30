<template>
  <view class="court-container">
    <view class="page-header">
      <text class="page-title">法院管理</text>
      <view class="add-btn" @click="goToAdd">
        <text>+</text>
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <view class="search-input">
          <text class="icon">🔍</text>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索法院名称"
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
          <text class="filter-label">法院级别</text>
          <view class="filter-options">
            <view
              v-for="item in courtLevelOptions"
              :key="item.value"
              :class="['filter-option', { active: filterParams.courtLevel === item.value }]"
              @click="toggleFilter('courtLevel', item.value)"
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
      <view class="th th-name">法院名称</view>
      <view class="th th-level">级别</view>
      <view class="th th-actions">操作</view>
    </view>

    <scroll-view class="table-body" scroll-y @scrolltolower="onLoadMore">
      <view
        v-for="(item, index) in courtList"
        :key="item.id"
        class="table-row animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.03}s` }"
        @click="goToDetail(item.id)"
      >
        <view class="td td-name">
          <view class="name-cell">
            <view class="avatar-mini">⚖</view>
            <view class="name-info">
              <text class="name">{{ item.shortName }}</text>
              <text class="full-name">{{ item.fullName }}</text>
            </view>
          </view>
        </view>
        <view class="td td-level">
          <text class="level-badge">{{ item.courtLevel }}</text>
        </view>
        <view class="td td-actions">
          <view class="action-btn edit-btn" @click.stop="goToEdit(item.id)">编辑</view>
          <view class="action-btn delete-btn" @click.stop="handleDelete(item.id)">删除</view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && courtList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="courtList.length === 0">
        <text class="empty-icon">⚖️</text>
        <text class="empty-text">暂无法院数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getCourtList, deleteCourt, type CourtItem } from '@/api/basic-data'

const searchKeyword = ref('')
const courtList = shallowRef<CourtItem[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const showFilter = ref(false)
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const filterParams = ref({
  courtLevel: '',
})

const courtLevelOptions = [
  { label: '全部', value: '' },
  { label: '最高人民法院', value: '最高人民法院' },
  { label: '高级人民法院', value: '高级人民法院' },
  { label: '中级人民法院', value: '中级人民法院' },
  { label: '基层人民法院', value: '基层人民法院' },
]

const filterCount = computed(() => {
  return filterParams.value.courtLevel ? 1 : 0
})

onMounted(() => {
  loadData()
  uni.$on('refresh-court-list', () => loadData(true))
})

onUnmounted(() => {
  uni.$off('refresh-court-list')
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

const toggleFilter = (key: 'courtLevel', value: string) => {
  if (filterParams.value[key] === value) {
    filterParams.value[key] = ''
  } else {
    filterParams.value[key] = value
  }
}

const resetFilter = () => {
  filterParams.value = { courtLevel: '' }
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
      params.shortName = searchKeyword.value.trim()
    }
    if (filterParams.value.courtLevel) {
      params.courtLevel = filterParams.value.courtLevel
    }

    const res = await getCourtList(params)
    const listData = res.data?.list || []

    if (isRefresh) {
      courtList.value = listData
      page.value = 1
    } else {
      courtList.value = [...courtList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = courtList.value.length < (res.data?.total || 0)
  } catch (error) {
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
  uni.navigateTo({ url: `/pages/basic-data/court-detail?id=${id}` })
}

const goToAdd = () => {
  uni.navigateTo({ url: '/pages/basic-data/court-form' })
}

const goToEdit = (id: number) => {
  uni.navigateTo({ url: `/pages/basic-data/court-form?id=${id}` })
}

const handleDelete = async (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后将无法恢复，确定要删除该法院吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteCourt(id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadData(true)
        } catch (error) {
uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.court-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;

  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .add-btn {
    width: 60rpx;
    height: 60rpx;
    background: #1890ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      color: #fff;
      font-size: 36rpx;
      font-weight: bold;
    }

    &:active {
      background: #096dd9;
    }
  }
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

    &.th-level {
      width: 180rpx;
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
    align-items: center;

    &.td-name {
      flex: 1;

      .name-cell {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .avatar-mini {
          width: 64rpx;
          height: 64rpx;
          background: #f6ffed;
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

          .full-name {
            font-size: 22rpx;
            color: #999;
          }
        }
      }
    }

    &.td-level {
      width: 180rpx;
      justify-content: flex-end;

      .level-badge {
        font-size: 22rpx;
        color: #1890ff;
        padding: 4rpx 16rpx;
        background: #e6f7ff;
        border-radius: 6rpx;
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
