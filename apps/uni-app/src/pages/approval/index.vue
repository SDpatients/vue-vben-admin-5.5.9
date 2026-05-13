<template>
  <view class="approval-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="icon">🔍</text>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索审批标题或案件编号"
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

    <!-- 分类Tab栏 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'all' }"
        @click="switchTab('all')"
      >
        <text class="tab-label">全部</text>
        <text v-if="totalCount > 0" class="tab-count">{{ totalCount > 99 ? '99+' : totalCount }}</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'caseSubmit' }"
        @click="switchTab('caseSubmit')"
      >
        <text class="tab-label">案件审批</text>
        <text v-if="caseSubmitPendingCount > 0" class="tab-count badge-red">{{ caseSubmitPendingCount > 99 ? '99+' : caseSubmitPendingCount }}</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'fileApproval' }"
        @click="switchTab('fileApproval')"
      >
        <text class="tab-label">流程文件</text>
        <text v-if="taskPendingCount > 0" class="tab-count badge-red">{{ taskPendingCount > 99 ? '99+' : taskPendingCount }}</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'document' }"
        @click="switchTab('document')"
      >
        <text class="tab-label">文书审批</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-bar">
      <view class="stat-item" @click="quickFilter('')">
        <text class="num" :class="{ active: !currentFilterStatus }">{{ currentTotal }}</text>
        <text class="label">全部</text>
      </view>
      <view class="stat-item" @click="quickFilter('PENDING')">
        <text class="num" :class="{ active: currentFilterStatus === 'PENDING' }">{{ currentPendingCount }}</text>
        <text class="label">待审核</text>
      </view>
      <view class="stat-item" @click="quickFilter('APPROVED')">
        <text class="num" :class="{ active: currentFilterStatus === 'APPROVED' }">{{ currentApprovedCount }}</text>
        <text class="label">已通过</text>
      </view>
      <view class="stat-item" @click="quickFilter('REJECTED')">
        <text class="num" :class="{ active: currentFilterStatus === 'REJECTED' }">{{ currentRejectedCount }}</text>
        <text class="label">已驳回</text>
      </view>
    </view>

    <!-- 审批列表 -->
    <view class="approval-list">
      <!-- 文书审批列表 -->
      <template v-if="activeTab === 'document'">
        <view
          v-for="(item, index) in documentList"
          :key="'doc-' + item.id"
          class="approval-card animate-fade-in-up"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="goToDocumentDetail(item.id)"
        >
          <view class="card-header">
            <view class="card-title-row">
              <text class="type-tag">文书审批</text>
            </view>
            <text :class="['status', getDocumentStatusClass(item.status)]">
              {{ getDocumentStatusText(item.status) }}
            </text>
          </view>
          <view class="card-title">
            <text>{{ item.documentName }}</text>
          </view>
          <view class="card-body">
            <view class="info-row">
              <text class="label">文书类型：</text>
              <text class="value">{{ item.documentType || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="label">收件人：</text>
              <text class="value">{{ item.recipientName || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="label">案号：</text>
              <text class="value">{{ item.caseNumber || '-' }}</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="time">{{ formatDateTime(item.createTime) }}</text>
            <view class="footer-actions">
              <text v-if="item.status === 'PENDING'" class="action-hint">待处理</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 案件审批 / 流程文件 / 全部列表 -->
      <template v-else>
        <view
          v-for="(item, index) in approvalList"
          :key="item.id"
          class="approval-card animate-fade-in-up"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="goToDetail(item.id)"
        >
          <view class="card-header">
            <view class="card-title-row">
              <text class="type-tag">{{ getApprovalTypeText(item.approvalType) }}</text>
            </view>
            <text :class="['status', getApprovalStatusClass(item.approvalStatus)]">
              {{ getApprovalStatusText(item.approvalStatus) }}
            </text>
          </view>
          <view class="card-title">
            <text>{{ item.approvalTitle }}</text>
          </view>
          <view class="card-body">
            <view class="info-row">
              <text class="label">案件编号：</text>
              <text class="value">{{ item.caseNumber || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="label">提交人：</text>
              <text class="value">{{ item.realName || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="label">审批次数：</text>
              <text class="value">{{ item.approvalCount }}</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="time">{{ formatDateTime(item.createTime) }}</text>
            <view class="footer-actions">
              <text v-if="item.approvalResult" :class="['result-tag', getApprovalResultClass(item.approvalResult)]">
                {{ getApprovalResultText(item.approvalResult) }}
              </text>
              <text v-if="item.approvalStatus === 'PENDING'" class="action-hint">待处理</text>
            </view>
          </view>
        </view>
      </template>

      <view class="loading-more" v-if="currentLoading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!currentHasMore && currentListLength > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="currentListLength === 0">
        <text class="empty-icon">📋</text>
        <text>暂无审批数据</text>
      </view>
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
              v-for="item in statusFilterOptions"
              :key="item.value"
              class="option-item"
              :class="{ active: tempFilterParams.approvalStatus === item.value }"
              @click="tempFilterParams.approvalStatus = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <view class="filter-section" v-if="activeTab !== 'document'">
          <text class="section-title">审批类型</text>
          <scroll-view scroll-y class="type-scroll">
            <view class="option-list option-list-wrap">
              <view
                v-for="item in typeFilterOptions"
                :key="item.value"
                class="option-item"
                :class="{ active: tempFilterParams.approvalType === item.value }"
                @click="tempFilterParams.approvalType = item.value"
              >
                <text>{{ item.label }}</text>
              </view>
            </view>
          </scroll-view>
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
import { ref, shallowRef, onMounted, onUnmounted, computed, watch } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import {
  getApprovalList,
  getApprovalStatusText,
  getApprovalStatusClass,
  getApprovalTypeText,
  getApprovalResultText,
  getApprovalResultClass,
  getPendingCaseSubmitCount,
  getPendingTaskCount,
  type Approval,
} from '@/api/approval'
import {
  getAllDocumentListApi,
  getDocumentStatusText,
  getDocumentStatusClass,
  type DocumentDelivery,
} from '@/api/document-service'
import dayjs from 'dayjs'

const searchKeyword = ref('')
const approvalList = shallowRef<Approval[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const showFilter = ref(false)

const activeTab = ref('all')
const caseSubmitPendingCount = ref(0)
const taskPendingCount = ref(0)
const totalCount = ref(0)

// 文书审批专用状态
const documentList = shallowRef<DocumentDelivery[]>([])
const documentTotal = ref(0)
const documentPage = ref(1)
const documentLoading = ref(false)
const documentHasMore = ref(true)
const documentFilterStatus = ref('')

// 当前列表的计算属性（根据 activeTab 切换数据源）
const currentListLength = computed(() =>
  activeTab.value === 'document' ? documentList.value.length : approvalList.value.length
)
const currentLoading = computed(() =>
  activeTab.value === 'document' ? documentLoading.value : loading.value
)
const currentHasMore = computed(() =>
  activeTab.value === 'document' ? documentHasMore.value : hasMore.value
)
const currentTotal = computed(() =>
  activeTab.value === 'document' ? documentTotal.value : total.value
)
const currentFilterStatus = computed(() =>
  activeTab.value === 'document' ? documentFilterStatus.value : filterParams.value.approvalStatus
)
const currentPendingCount = computed(() => {
  if (activeTab.value === 'document') {
    return documentList.value.filter((item) => item.status === 'PENDING').length
  }
  return approvalList.value.filter((item) => item.approvalStatus === 'PENDING').length
})
const currentApprovedCount = computed(() => {
  if (activeTab.value === 'document') {
    return documentList.value.filter((item) => item.status === 'APPROVED').length
  }
  return approvalList.value.filter((item) => item.approvalStatus === 'APPROVED').length
})
const currentRejectedCount = computed(() => {
  if (activeTab.value === 'document') {
    return documentList.value.filter((item) => item.status === 'REJECTED').length
  }
  return approvalList.value.filter((item) => item.approvalStatus === 'REJECTED').length
})

const typeFilterOptions = [
  { label: '全部', value: '' },
  { label: '案件提交', value: 'CASE_SUBMIT' },
  { label: '案件结案', value: 'CASE_CLOSE' },
  { label: '费用申请', value: 'FEE_APPLY' },
  { label: '证据上传', value: 'EVIDENCE_UPLOAD' },
  { label: '提交破产申请材料', value: 'TASK_001' },
  { label: '裁定受理并公告', value: 'TASK_002' },
  { label: '全面接管债务人', value: 'TASK_003' },
  { label: '管理人印章', value: 'TASK_004' },
  { label: '调查财产及经营状况', value: 'TASK_005' },
  { label: '追收债务人财产', value: 'TASK_006' },
  { label: '决定合同继续履行或解除', value: 'TASK_007' },
  { label: '通知已知债权人并公告', value: 'TASK_008' },
  { label: '接收、登记债权申报', value: 'TASK_009' },
  { label: '审查申报债权并编制债权表', value: 'TASK_010' },
  { label: '债权审查结果通知', value: 'TASK_011' },
  { label: '会议资料', value: 'TASK_012' },
  { label: '表决事项和表决结果', value: 'TASK_013' },
  { label: '宣告重整与和解', value: 'TASK_014' },
  { label: '审查宣告破产条件', value: 'TASK_015' },
  { label: '裁定宣告债务人破产及公告', value: 'TASK_016' },
  { label: '破产财产变价方案', value: 'TASK_017' },
  { label: '破产费用与共益债务', value: 'TASK_018' },
  { label: '破产财产分配方案', value: 'TASK_019' },
  { label: '提请终结破产程序', value: 'TASK_020' },
  { label: '法院裁定并公告', value: 'TASK_021' },
  { label: '办理企业注销登记', value: 'TASK_022' },
  { label: '管理人终止执行职务并归档', value: 'TASK_023' },
]

const statusFilterOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
]

const filterParams = ref<{
  approvalStatus: string
  approvalType: string
}>({
  approvalStatus: '',
  approvalType: '',
})

const tempFilterParams = ref<{
  approvalStatus: string
  approvalType: string
}>({
  approvalStatus: '',
  approvalType: '',
})

const hasActiveFilter = computed(() => {
  return filterParams.value.approvalStatus !== '' || filterParams.value.approvalType !== ''
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterParams.value.approvalStatus) count++
  if (filterParams.value.approvalType) count++
  return count
})

watch(showFilter, (newVal) => {
  if (newVal) {
    tempFilterParams.value = { ...filterParams.value }
  }
})

const switchTab = (tab: string) => {
  activeTab.value = tab

  // 重置类型筛选
  filterParams.value.approvalType = ''

  switch (tab) {
    case 'caseSubmit':
      filterParams.value.approvalType = 'CASE_SUBMIT'
      break
    case 'fileApproval':
      filterParams.value.approvalType = 'TASK_'
      break
    case 'document':
      // 文书审批使用独立的 API，不使用 approvalType 筛选
      break
    default:
      filterParams.value.approvalType = ''
      break
  }

  if (tab === 'document') {
    loadDocumentData(true)
  } else {
    loadData(true)
  }
}

const loadPendingCounts = async () => {
  try {
    const [caseSubmitRes, taskRes] = await Promise.all([
      getPendingCaseSubmitCount(),
      getPendingTaskCount(),
    ])
    caseSubmitPendingCount.value = caseSubmitRes?.count || 0
    taskPendingCount.value = taskRes?.count || 0
  } catch {
    // 静默处理
  }
}

onMounted(() => {
  loadData()
  loadPendingCounts()
  uni.$on('refresh-approval-list', () => {
    if (activeTab.value === 'document') {
      loadDocumentData(true)
    } else {
      loadData(true)
    }
  })
})

onUnmounted(() => {
  uni.$off('refresh-approval-list')
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    if (activeTab.value === 'document') {
      loadDocumentData(true)
    } else {
      loadData(true)
    }
  }, 500)
}

const handleSearch = () => {
  if (activeTab.value === 'document') {
    loadDocumentData(true)
  } else {
    loadData(true)
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  if (activeTab.value === 'document') {
    loadDocumentData(true)
  } else {
    loadData(true)
  }
}

const quickFilter = (status: string) => {
  if (activeTab.value === 'document') {
    documentFilterStatus.value = status
    loadDocumentData(true)
  } else {
    filterParams.value.approvalStatus = status
    loadData(true)
  }
}

const resetFilter = () => {
  tempFilterParams.value = {
    approvalStatus: '',
    approvalType: '',
  }
}

const applyFilter = () => {
  filterParams.value = { ...tempFilterParams.value }
  showFilter.value = false
  if (activeTab.value === 'document') {
    documentFilterStatus.value = tempFilterParams.value.approvalStatus
    loadDocumentData(true)
    return
  }
  // 切换筛选后，取消 tab 高亮
  if (filterParams.value.approvalType !== 'CASE_SUBMIT' && filterParams.value.approvalType !== 'TASK_') {
    activeTab.value = 'all'
  }
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
      params.approvalTitle = searchKeyword.value.trim()
    }

    if (filterParams.value.approvalStatus) {
      params.approvalStatus = filterParams.value.approvalStatus
    }

    if (filterParams.value.approvalType) {
      params.approvalType = filterParams.value.approvalType
    }

    const res = await getApprovalList(params)

    const rawList = res.data?.list || []
    const listData = Array.isArray(rawList) ? rawList.map((item) => ({ ...item })) : []

    if (isRefresh) {
      approvalList.value = listData
      page.value = 1
    } else {
      approvalList.value = [...approvalList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = approvalList.value.length < (res.data?.total || 0)
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 文书审批数据加载
const loadDocumentData = async (isRefresh = false) => {
  if (documentLoading.value) return
  documentLoading.value = true

  try {
    const params: any = {
      pageNum: isRefresh ? 1 : documentPage.value,
      pageSize,
    }

    if (searchKeyword.value.trim()) {
      params.caseNumber = searchKeyword.value.trim()
    }

    if (documentFilterStatus.value) {
      params.status = documentFilterStatus.value
    }

    const res = await getAllDocumentListApi(params)

    const rawList = res.data?.list || []
    const listData = Array.isArray(rawList) ? rawList.map((item) => ({ ...item })) : []

    if (isRefresh) {
      documentList.value = listData
      documentPage.value = 1
    } else {
      documentList.value = [...documentList.value, ...listData]
    }

    documentTotal.value = res.data?.total || 0
    documentHasMore.value = documentList.value.length < (res.data?.total || 0)
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    documentLoading.value = false
  }
}

const onRefresh = () => {
  const refreshPromise = activeTab.value === 'document' ? loadDocumentData(true) : loadData(true)
  refreshPromise.finally(() => {
    uni.stopPullDownRefresh()
  })
}

const onLoadMore = () => {
  if (activeTab.value === 'document') {
    if (!documentHasMore.value || documentLoading.value) return
    documentPage.value++
    loadDocumentData()
  } else {
    if (!hasMore.value || loading.value) return
    page.value++
    loadData()
  }
}

onPullDownRefresh(() => {
  onRefresh()
})

onReachBottom(() => {
  onLoadMore()
})

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/approval/detail?id=${id}` })
}

const goToDocumentDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/approval/document-detail?id=${id}` })
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('MM-DD')
}
</script>

<style lang="scss" scoped>
.approval-container {
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

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 12rpx;
    position: relative;

    .tab-label {
      font-size: 28rpx;
      color: #666;
    }

    .tab-count {
      margin-left: 8rpx;
      font-size: 22rpx;
      color: #999;
      background: #f5f5f5;
      padding: 2rpx 10rpx;
      border-radius: 16rpx;

      &.badge-red {
        color: #fff;
        background: #f56c6c;
        min-width: 28rpx;
        text-align: center;
      }
    }

    &.active {
      .tab-label {
        color: #0068E2;
        font-weight: bold;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 20%;
        width: 60%;
        height: 4rpx;
        background: #0068E2;
        border-radius: 2rpx;
      }
    }
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

.approval-list {
  padding: 0 20rpx;
  padding-bottom: 40rpx;

  .approval-card {
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
      margin-bottom: 12rpx;

      .card-title-row {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .type-tag {
          font-size: 22rpx;
          color: #0068E2;
          background: rgba(0, 104, 226, 0.08);
          padding: 4rpx 16rpx;
          border-radius: 6rpx;
        }
      }

      .status {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        flex-shrink: 0;

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

        &.status-cancelled {
          background: #f5f5f5;
          color: #999;
        }
      }
    }

    .card-title {
      margin-bottom: 16rpx;

      text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .card-body {
      margin-bottom: 16rpx;

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

      .footer-actions {
        display: flex;
        gap: 12rpx;
        align-items: center;
      }

      .result-tag {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;

        &.result-pass {
          background: #e8f5e9;
          color: #4caf50;
        }

        &.result-fail {
          background: #ffebee;
          color: #f44336;
        }
      }

      .action-hint {
        font-size: 22rpx;
        color: #ff9800;
        font-weight: 500;
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
    width: 640rpx;
    max-height: 80vh;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
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

    .type-scroll {
      max-height: 360rpx;
    }

    .option-list {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .option-item {
        padding: 14rpx 28rpx;
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out both;
}
</style>