<template>
  <view class="plan-container">
    <view class="search-section">
      <view class="case-filter-bar">
        <view class="case-selector" @click="openCaseSelector">
          <text class="label">案号：</text>
          <text class="value" :class="{ placeholder: !selectedCase }">
            {{ selectedCase ? selectedCase.caseNumber : '请选择案号' }}
          </text>
          <text class="arrow">▼</text>
        </view>
        <view v-if="selectedCase" class="show-all-btn" @click="clearCaseFilter">
          <text>显示全部</text>
        </view>
      </view>

      <view class="search-bar">
        <view class="search-input">
          <text class="icon">🔍</text>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索计划内容"
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
          <text class="filter-label">计划类型</text>
          <view class="filter-options">
            <view
              v-for="item in planTypeOptions"
              :key="item.value"
              :class="['filter-option', { active: filterParams.planType === item.value }]"
              @click="toggleFilter('planType', item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>
        <view class="filter-item">
          <text class="filter-label">执行状态</text>
          <view class="filter-options">
            <view
              v-for="item in executionStatusOptions"
              :key="item.value"
              :class="['filter-option', { active: filterParams.executionStatus === item.value }]"
              @click="toggleFilter('executionStatus', item.value)"
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
      <view class="th th-name">计划信息</view>
      <view class="th th-status">状态</view>
    </view>

    <scroll-view class="table-body" scroll-y @scrolltolower="onLoadMore">
      <view
        v-for="(item, index) in planList"
        :key="item.id"
        class="table-row animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.03}s` }"
        @click="goToDetail(item.id)"
      >
        <view class="td td-name">
          <view class="name-cell">
            <view class="avatar-mini">📅</view>
            <view class="name-info">
              <text class="type">{{ item.planType }}</text>
              <text class="content">{{ item.planContent }}</text>
              <text class="date" v-if="item.startDate || item.endDate">
                {{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}
              </text>
            </view>
          </view>
        </view>
        <view class="td td-status">
          <text :class="['status-badge', getExecutionStatusClass(item.executionStatus)]">
            {{ getExecutionStatusText(item.executionStatus) }}
          </text>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && planList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="planList.length === 0">
        <text class="empty-icon">📅</text>
        <text class="empty-text">{{ emptyText }}</text>
      </view>
    </scroll-view>

    <!-- 案号选择弹窗 -->
    <view class="case-modal" v-if="showCaseSelector">
      <view class="modal-mask" @click="showCaseSelector = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">选择案号</text>
          <text class="close-btn" @click="showCaseSelector = false">✕</text>
        </view>
        <view class="case-search">
          <view class="search-input">
            <text class="icon">🔍</text>
            <input
              v-model="caseSearchKeyword"
              type="text"
              placeholder="搜索案件编号或名称"
              @input="handleCaseSearchInput"
            />
          </view>
        </view>
        <scroll-view class="case-list" scroll-y>
          <view
            v-for="item in caseList"
            :key="item.id"
            class="case-item"
            :class="{ active: selectedCase?.id === item.id }"
            @click="selectCase(item)"
          >
            <text class="case-no">{{ item.caseNumber }}</text>
            <text class="case-name">{{ item.caseName }}</text>
          </view>
          <view class="empty-case" v-if="caseList.length === 0">
            <text>暂无案件数据</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getWorkPlanList, type WorkPlanItem } from '@/api/basic-data'
import { getCaseList, type CaseItem } from '@/api/case'
import dayjs from 'dayjs'

const searchKeyword = ref('')
const planList = shallowRef<WorkPlanItem[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const showFilter = ref(false)
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// 案号筛选相关
const showCaseSelector = ref(false)
const caseSearchKeyword = ref('')
const caseList = shallowRef<CaseItem[]>([])
const selectedCase = shallowRef<CaseItem | null>(null)
const caseSearchTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const filterParams = ref({
  planType: '',
  executionStatus: '',
})

const planTypeOptions = [
  { label: '全部', value: '' },
  { label: '案件审理计划', value: '案件审理计划' },
  { label: '债权申报计划', value: '债权申报计划' },
  { label: '资产处置计划', value: '资产处置计划' },
  { label: '会议召开计划', value: '会议召开计划' },
]

const executionStatusOptions = [
  { label: '全部', value: '' },
  { label: '未开始', value: 'NOT_STARTED' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
]

const filterCount = computed(() => {
  let count = 0
  if (filterParams.value.planType) count++
  if (filterParams.value.executionStatus) count++
  return count
})

const emptyText = computed(() => {
  if (selectedCase.value) {
    return '该案件暂无工作计划数据'
  }
  return '暂无工作计划数据'
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

const toggleFilter = (key: 'planType' | 'executionStatus', value: string) => {
  if (filterParams.value[key] === value) {
    filterParams.value[key] = ''
  } else {
    filterParams.value[key] = value
  }
}

const resetFilter = () => {
  filterParams.value = { planType: '', executionStatus: '' }
}

const applyFilter = () => {
  showFilter.value = false
  loadData(true)
}

// 案号选择相关
const openCaseSelector = () => {
  showCaseSelector.value = true
  loadCaseList()
}

const loadCaseList = async () => {
  try {
    const params: any = {
      pageNum: 1,
      pageSize: 50,
    }
    if (caseSearchKeyword.value.trim()) {
      params.keyword = caseSearchKeyword.value.trim()
    }
    const res = await getCaseList(params)
    caseList.value = res.data?.list || []
  } catch (error) {
    console.error('[loadCaseList] Error:', error)
  }
}

const handleCaseSearchInput = () => {
  if (caseSearchTimer.value) {
    clearTimeout(caseSearchTimer.value)
  }
  caseSearchTimer.value = setTimeout(() => {
    loadCaseList()
  }, 300)
}

const selectCase = (item: CaseItem) => {
  selectedCase.value = item
  showCaseSelector.value = false
  loadData(true)
}

const clearCaseFilter = () => {
  selectedCase.value = null
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

    if (selectedCase.value) {
      params.caseId = selectedCase.value.id
    }

    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
      params.planContent = searchKeyword.value.trim()
    }
    if (filterParams.value.planType) {
      params.planType = filterParams.value.planType
    }
    if (filterParams.value.executionStatus) {
      params.executionStatus = filterParams.value.executionStatus
    }

    const res = await getWorkPlanList(params)
    const listData = res.data?.list || []

    if (isRefresh) {
      planList.value = listData
      page.value = 1
    } else {
      planList.value = [...planList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = planList.value.length < (res.data?.total || 0)
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
  uni.navigateTo({ url: `/pages/basic-data/plan-detail?id=${id}` })
}

const getExecutionStatusText = (status?: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: '未开始',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
  }
  return map[status || ''] || status || '未知'
}

const getExecutionStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: 'status-pending',
    IN_PROGRESS: 'status-progress',
    COMPLETED: 'status-completed',
  }
  return map[status || ''] || ''
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.plan-container {
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

.case-filter-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;

  .case-selector {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 24rpx;
    height: 72rpx;

    .label {
      font-size: 28rpx;
      color: #666;
      margin-right: 8rpx;
    }

    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.placeholder {
        color: #999;
      }
    }

    .arrow {
      font-size: 24rpx;
      color: #999;
      margin-left: 8rpx;
    }
  }

  .show-all-btn {
    padding: 0 24rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e6f7ff;
    border-radius: 36rpx;
    font-size: 28rpx;
    color: #1890ff;

    &:active {
      opacity: 0.8;
    }
  }
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

    &.th-status {
      width: 120rpx;
      text-align: center;
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
    align-items: flex-start;

    &.td-name {
      flex: 1;

      .name-cell {
        display: flex;
        align-items: flex-start;
        gap: 16rpx;

        .avatar-mini {
          width: 64rpx;
          height: 64rpx;
          background: #fff1f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
        }

        .name-info {
          flex: 1;

          .type {
            display: block;
            font-size: 26rpx;
            color: #1890ff;
            font-weight: 500;
            margin-bottom: 4rpx;
          }

          .content {
            display: block;
            font-size: 26rpx;
            color: #333;
            margin-bottom: 4rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .date {
            font-size: 22rpx;
            color: #999;
          }
        }
      }
    }

    &.td-status {
      width: 120rpx;
      justify-content: center;
      padding-top: 8rpx;

      .status-badge {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;

        &.status-pending {
          background: #fff7e6;
          color: #fa8c16;
        }

        &.status-progress {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.status-completed {
          background: #e6f7ed;
          color: #52c41a;
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

// 案号选择弹窗
.case-modal {
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
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
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

    .close-btn {
      font-size: 32rpx;
      color: #999;
      padding: 10rpx;
    }
  }

  .case-search {
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .search-input {
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
  }

  .case-list {
    flex: 1;
    max-height: 50vh;

    .case-item {
      display: flex;
      flex-direction: column;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &.active {
        background: #e6f7ff;
      }

      &:active {
        background: #f5f5f5;
      }

      .case-no {
        font-size: 28rpx;
        color: #1890ff;
        font-weight: 500;
        margin-bottom: 8rpx;
      }

      .case-name {
        font-size: 26rpx;
        color: #666;
      }
    }

    .empty-case {
      display: flex;
      justify-content: center;
      padding: 60rpx 0;
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
