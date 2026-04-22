<template>
  <view class="cases-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="icon">🔍</text>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索案件编号或名称"
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
        <text class="num" :class="{ active: !filterParams.caseStatus }">{{ total }}</text>
        <text class="label">全部案件</text>
      </view>
      <view class="stat-item" @click="quickFilter('ONGOING')">
        <text class="num" :class="{ active: filterParams.caseStatus === 'ONGOING' }">{{ ongoingCount }}</text>
        <text class="label">进行中</text>
      </view>
      <view class="stat-item" @click="quickFilter('CLOSED')">
        <text class="num" :class="{ active: filterParams.caseStatus === 'CLOSED' }">{{ closedCount }}</text>
        <text class="label">已结案</text>
      </view>
    </view>

    <!-- 案件列表 -->
    <view class="case-list">
      <view
        v-for="(item, index) in caseList"
        :key="item.id"
        class="case-card animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="goToDetail(item.id)"
      >
        <view class="card-header">
          <text class="case-no">{{ item.caseNumber }}</text>
          <text :class="['status', getStatusClass(item.caseStatus)]">
            {{ getStatusText(item.caseStatus) }}
          </text>
        </view>
        <view class="card-body">
          <text class="case-name">{{ item.caseName }}</text>
          <view class="info-row">
            <text class="label">主要负责人：</text>
            <text class="value">{{ item.mainResponsiblePerson || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">受理法院：</text>
            <text class="value">{{ item.acceptanceCourt || '-' }}</text>
          </view>
        </view>
        <view class="card-footer">
          <text class="time">{{ formatDate(item.acceptanceDate) }}</text>
          <text class="type">{{ getProgressText(item.caseProgress) }}</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && caseList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="caseList.length === 0">
        <image src="/static/empty.png" mode="aspectFit" />
        <text>暂无案件数据</text>
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
          <text class="section-title">案件状态</text>
          <view class="option-list">
            <view
              v-for="item in statusOptions"
              :key="item.value"
              class="option-item"
              :class="{ active: tempFilterParams.caseStatus === item.value }"
              @click="tempFilterParams.caseStatus = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <view class="filter-section">
          <text class="section-title">案件进度</text>
          <view class="option-list">
            <view
              v-for="item in progressOptions"
              :key="item.value"
              class="option-item"
              :class="{ active: tempFilterParams.caseProgress === item.value }"
              @click="tempFilterParams.caseProgress = item.value"
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
import { getCaseList, advancedCaseSearch, type CaseItem, type CaseListParams } from '@/api/case'
import dayjs from 'dayjs'

console.log('=== cases/index.vue loaded ===')

const searchKeyword = ref('')
const caseList = shallowRef<CaseItem[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const showFilter = ref(false)

const filterParams = ref<{
  caseStatus: string
  caseProgress: string
}>({
  caseStatus: '',
  caseProgress: '',
})

const tempFilterParams = ref<{
  caseStatus: string
  caseProgress: string
}>({
  caseStatus: '',
  caseProgress: '',
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '进行中', value: 'ONGOING' },
  { label: '已结案', value: 'CLOSED' },
  { label: '待受理', value: 'PENDING' },
  { label: '已归档', value: 'ARCHIVED' },
]

const progressOptions = [
  { label: '全部', value: '' },
  { label: '第一阶段', value: 'FIRST' },
  { label: '第二阶段', value: 'SECOND' },
  { label: '第三阶段', value: 'THIRD' },
  { label: '第四阶段', value: 'FOURTH' },
  { label: '第五阶段', value: 'FIFTH' },
  { label: '第六阶段', value: 'SIXTH' },
  { label: '第七阶段', value: 'SEVENTH' },
]

const hasActiveFilter = computed(() => {
  return filterParams.value.caseStatus !== '' || filterParams.value.caseProgress !== ''
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterParams.value.caseStatus) count++
  if (filterParams.value.caseProgress) count++
  return count
})

const ongoingCount = computed(() =>
  caseList.value.filter((item) => item.caseStatus === 'ONGOING' || item.caseStatus === 'IN_PROGRESS').length
)

const closedCount = computed(() =>
  caseList.value.filter((item) => item.caseStatus === 'CLOSED' || item.caseStatus === 'COMPLETED').length
)

watch(showFilter, (newVal) => {
  if (newVal) {
    tempFilterParams.value = { ...filterParams.value }
  }
})

onMounted(() => {
  console.log('[onMounted] Loading data...')
  loadData()
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    console.log('[handleSearchInput] Search keyword:', searchKeyword.value)
    loadData(true)
  }, 500)
}

const handleSearch = () => {
  console.log('[handleSearch] Search triggered:', searchKeyword.value)
  loadData(true)
}

const clearSearch = () => {
  console.log('[clearSearch] Clearing search')
  searchKeyword.value = ''
  loadData(true)
}

const quickFilter = (status: string) => {
  console.log('[quickFilter] Status:', status)
  filterParams.value.caseStatus = status
  loadData(true)
}

const resetFilter = () => {
  console.log('[resetFilter] Resetting filter')
  tempFilterParams.value = {
    caseStatus: '',
    caseProgress: '',
  }
}

const applyFilter = () => {
  console.log('[applyFilter] Applying filter:', tempFilterParams.value)
  filterParams.value = { ...tempFilterParams.value }
  showFilter.value = false
  loadData(true)
}

const loadData = async (isRefresh = false) => {
  console.log('[loadData] isRefresh:', isRefresh, 'page:', page.value)
  if (loading.value) {
    console.log('[loadData] Already loading, skip')
    return
  }
  loading.value = true

  try {
    const params: CaseListParams = {
      pageNum: isRefresh ? 1 : page.value,
      pageSize,
    }
    
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }

    if (filterParams.value.caseStatus) {
      params.caseStatus = filterParams.value.caseStatus
    }

    if (filterParams.value.caseProgress) {
      params.caseProgress = filterParams.value.caseProgress
    }

    console.log('[loadData] Request params:', params)

    let res
    const hasSearchOrFilter = searchKeyword.value.trim() || 
                               filterParams.value.caseStatus || 
                               filterParams.value.caseProgress

    if (hasSearchOrFilter) {
      console.log('[loadData] Using advanced search API')
      res = await advancedCaseSearch(params)
    } else {
      console.log('[loadData] Using basic list API')
      res = await getCaseList(params)
    }
    
    console.log('[loadData] Response:', res)

    const rawList = res.data?.list || []
    const listData = Array.isArray(rawList) ? rawList.map(item => ({ ...item })) : []

    if (isRefresh) {
      caseList.value = listData
      page.value = 1
    } else {
      caseList.value = [...caseList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = caseList.value.length < (res.data?.total || 0)
    console.log('[loadData] Total:', total.value, 'hasMore:', hasMore.value)
  } catch (error) {
    console.error('[loadData] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  console.log('[onRefresh] Refreshing...')
  loadData(true).finally(() => {
    uni.stopPullDownRefresh()
  })
}

const onLoadMore = () => {
  console.log('[onLoadMore] Loading more, hasMore:', hasMore.value)
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
  console.log('[goToDetail] id:', id)
  uni.navigateTo({ url: `/pages/cases/detail?id=${id}` })
}

const handleCreate = () => {
  uni.navigateTo({ url: '/pages/cases/add' })
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    ONGOING: '进行中',
    CLOSED: '已结案',
    PENDING: '待受理',
    ARCHIVED: '已归档',
  }
  return map[status || ''] || status || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    ONGOING: 'status-processing',
    CLOSED: 'status-completed',
    PENDING: 'status-pending',
    ARCHIVED: 'status-archived',
  }
  return map[status || ''] || ''
}

const getProgressText = (progress?: string) => {
  const map: Record<string, string> = {
    FIRST: '第一阶段',
    SECOND: '第二阶段',
    THIRD: '第三阶段',
    FOURTH: '第四阶段',
    FIFTH: '第五阶段',
    SIXTH: '第六阶段',
    SEVENTH: '第七阶段',
  }
  return map[progress || ''] || progress || '-'
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}


</script>

<style lang="scss" scoped>
.cases-container {
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
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.case-list {
  padding: 0 20rpx;
  padding-bottom: 120rpx;

  .case-card {
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

      .case-no {
        font-size: 26rpx;
        color: #0068E2;
        font-weight: 500;
      }

      .status {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;

        &.status-processing {
          background: #e3f2fd;
          color: #2196f3;
        }

        &.status-completed {
          background: #e8f5e9;
          color: #4caf50;
        }

        &.status-pending {
          background: #fff3e0;
          color: #ff9800;
        }

        &.status-archived {
          background: #f5f5f5;
          color: #999;
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
      padding-top: 16rpx;
      border-top: 1rpx solid #f5f5f5;

      .time {
        font-size: 24rpx;
        color: #999;
      }

      .type {
        font-size: 24rpx;
        color: #0068E2;
        background: #f0f4ff;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
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

    image {
      width: 200rpx;
      height: 200rpx;
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

.search-bar {
  .clear-btn {
    font-size: 28rpx;
    color: #999;
    padding: 10rpx;
  }

  .filter-btn {
    &.active {
      color: #0068E2;
      font-weight: bold;
    }
  }
}

.stats-bar {
  .stat-item {
    .num {
      &.active {
        color: #0068E2;
      }
    }
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
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &.show {
    .modal-mask {
      opacity: 1;
    }

    .modal-content {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
