<template>
  <view class="announcement-list-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">案件公告</text>
        <view class="nav-right" @click="handleCreate">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 公告统计 -->
    <view class="stats-bar" v-if="caseInfo">
      <view class="case-info">
        <text class="case-number">{{ caseInfo.caseNumber }}</text>
        <text class="case-name">{{ caseInfo.caseName }}</text>
      </view>
      <view class="announcement-count">
        <text class="count-num">{{ totalCount }}</text>
        <text class="count-label">条公告</text>
      </view>
    </view>

    <!-- 公告列表 -->
    <view class="announcement-list">
      <view
        v-for="(item, index) in announcementList"
        :key="item.id"
        class="announcement-card"
        :class="{ 'is-top': item.isTop }"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="goToDetail(item.id)"
        @longpress="handleLongPress(item)"
      >
        <!-- 置顶标识 -->
        <view v-if="item.isTop" class="top-badge">
          <text>置顶</text>
        </view>

        <view class="card-header">
          <view class="type-tag" :style="{ background: getAnnouncementTypeColor(item.announcementType) + '20', color: getAnnouncementTypeColor(item.announcementType) }">
            <text>{{ getAnnouncementTypeText(item.announcementType) }}</text>
          </view>
          <view class="status-tag" :style="{ background: getAnnouncementStatusColor(item.status) + '20', color: getAnnouncementStatusColor(item.status) }">
            <text>{{ getAnnouncementStatusText(item.status) }}</text>
          </view>
        </view>

        <view class="card-title">
          <text>{{ item.title }}</text>
        </view>

        <view class="card-content">
          <text class="content-text">{{ truncateContent(item.content, 80) }}</text>
        </view>

        <view class="card-footer">
          <view class="footer-left">
            <text class="publisher">{{ item.publisherName || '未知发布人' }}</text>
            <text class="time">{{ formatTime(item.publishTime || item.createTime) }}</text>
          </view>
          <view class="footer-right">
            <text class="view-count">👁 {{ item.viewCount || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="announcementList.length === 0 && !loading" class="empty-state">
        <u-empty mode="message" text="暂无公告" icon="https://cdn.uviewui.com/uview/empty/message.png">
          <template #desc>
            <text class="empty-desc">该案件暂无公告信息</text>
          </template>
        </u-empty>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && announcementList.length > 0" class="load-more" @click="loadMore">
        <text v-if="!loadingMore">加载更多</text>
        <u-loading-icon v-else mode="circle" size="16"></u-loading-icon>
      </view>

      <!-- 到底提示 -->
      <view v-if="!hasMore && announcementList.length > 0" class="no-more">
        <text>已经到底了</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <u-loading-page :loading="loading && announcementList.length === 0" loading-text="加载中..."></u-loading-page>

    <!-- 长按操作菜单 -->
    <u-action-sheet
      :show="showActionSheet"
      :actions="actionSheetActions"
      @select="handleActionSelect"
      @close="showActionSheet = false"
    ></u-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import {
  getAnnouncementList,
  deleteAnnouncement,
  publishAnnouncement,
  topAnnouncement,
  cancelTopAnnouncement,
  type Announcement,
  getAnnouncementTypeText,
  getAnnouncementTypeColor,
  getAnnouncementStatusText,
  getAnnouncementStatusColor,
} from '@/api/announcement'
import dayjs from 'dayjs'

const props = defineProps<{
  caseId?: string
}>()

const caseId = ref('')
const caseInfo = ref<any>(null)
const announcementList = ref<Announcement[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const pageNum = ref(1)
const pageSize = 10
const totalCount = ref(0)
const hasMore = ref(true)
const showActionSheet = ref(false)
const selectedAnnouncement = ref<Announcement | null>(null)

const actionSheetActions = computed(() => {
  const actions: any[] = []
  if (!selectedAnnouncement.value) return actions

  if (selectedAnnouncement.value.status === 'DRAFT') {
    actions.push({ name: '发布公告', color: '#0068E2' })
  }
  if (selectedAnnouncement.value.isTop) {
    actions.push({ name: '取消置顶' })
  } else {
    actions.push({ name: '置顶公告', color: '#ff4d4f' })
  }
  actions.push({ name: '删除公告', color: '#ff4d4f' })
  actions.push({ name: '取消' })
  return actions
})

const getCacheKey = (id: string) => `announcement_list_${id}`

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.caseId || props.caseId || ''

  if (caseId.value) {
    loadCaseInfo()
    loadData(true)
  } else {
    uni.showToast({ title: '案件ID不能为空', icon: 'none' })
  }
})

onShow(() => {
  if (caseId.value) {
    loadData(true)
  }
})

const loadCaseInfo = () => {
  try {
    const cachedCase = uni.getStorageSync('current_case_info')
    if (cachedCase && cachedCase.id === Number(caseId.value)) {
      caseInfo.value = cachedCase
    }
  } catch (e) {
}
}

const loadData = async (isRefresh = false) => {
  if (isRefresh) {
    pageNum.value = 1
    hasMore.value = true
    announcementList.value = []
  }

  if (!hasMore.value && !isRefresh) return

  if (pageNum.value === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const res = await getAnnouncementList({
      pageNum: pageNum.value,
      pageSize,
      caseId: Number(caseId.value),
    })

    if (res.code === 200 && res.data) {
      const newList = res.data.list || []
      totalCount.value = res.data.total || 0

      if (isRefresh) {
        announcementList.value = newList
      } else {
        announcementList.value = [...announcementList.value, ...newList]
      }

      hasMore.value = announcementList.value.length < totalCount.value

      if (isRefresh) {
        uni.setStorageSync(getCacheKey(caseId.value), {
          list: announcementList.value,
          total: totalCount.value,
          timestamp: Date.now(),
        })
      }
    } else {
      if (isRefresh) {
        announcementList.value = []
        totalCount.value = 0
      }
      hasMore.value = false
    }
  } catch (error) {
uni.showToast({ title: '加载失败，请重试', icon: 'none' })

    if (isRefresh) {
      loadFromCache()
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadFromCache = () => {
  try {
    const cache = uni.getStorageSync(getCacheKey(caseId.value))
    if (cache && cache.list && Date.now() - cache.timestamp < 5 * 60 * 1000) {
      announcementList.value = cache.list
      totalCount.value = cache.total
      uni.showToast({ title: '已加载缓存数据', icon: 'none' })
    }
  } catch (e) {
}
}

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    pageNum.value++
    loadData()
  }
}

onPullDownRefresh(() => {
  loadData(true).then(() => {
    uni.stopPullDownRefresh()
  })
})

onReachBottom(() => {
  loadMore()
})

const goToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/cases/announcement-detail?announcementId=${id}&caseId=${caseId.value}`,
  })
}

const handleCreate = () => {
  uni.navigateTo({
    url: `/pages/announcement/form?caseId=${caseId.value}`,
  })
}

const handleLongPress = (item: Announcement) => {
  selectedAnnouncement.value = item
  showActionSheet.value = true
}

const handleActionSelect = (e: any) => {
  const action = e.name
  switch (action) {
    case '发布公告':
      handlePublish()
      break
    case '置顶公告':
      handleTop()
      break
    case '取消置顶':
      handleCancelTop()
      break
    case '删除公告':
      handleDelete()
      break
  }
  showActionSheet.value = false
}

const handlePublish = () => {
  if (!selectedAnnouncement.value) return
  uni.showModal({
    title: '确认发布',
    content: '发布后将无法修改，是否继续？',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          const result = await publishAnnouncement(selectedAnnouncement.value!.id)
          if (result.code === 200) {
            uni.showToast({ title: '发布成功', icon: 'success' })
            loadData(true)
          }
        } catch (error) {
          uni.showToast({ title: '发布失败', icon: 'none' })
        }
      }
    },
  })
}

const handleTop = async () => {
  if (!selectedAnnouncement.value) return
  try {
    const result = await topAnnouncement(selectedAnnouncement.value.id)
    if (result.code === 200) {
      uni.showToast({ title: '置顶成功', icon: 'success' })
      loadData(true)
    }
  } catch (error) {
    uni.showToast({ title: '置顶失败', icon: 'none' })
  }
}

const handleCancelTop = async () => {
  if (!selectedAnnouncement.value) return
  try {
    const result = await cancelTopAnnouncement(selectedAnnouncement.value.id)
    if (result.code === 200) {
      uni.showToast({ title: '已取消置顶', icon: 'success' })
      loadData(true)
    }
  } catch (error) {
    uni.showToast({ title: '取消置顶失败', icon: 'none' })
  }
}

const handleDelete = () => {
  if (!selectedAnnouncement.value) return
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，是否继续？',
    confirmColor: '#ff4d4f',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          const result = await deleteAnnouncement(selectedAnnouncement.value!.id)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            loadData(true)
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const handleBack = () => {
  uni.navigateBack()
}

const truncateContent = (content: string, maxLength: number) => {
  if (!content) return ''
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
}

const formatTime = (time?: string) => {
  if (!time) return '-'
  const now = dayjs()
  const target = dayjs(time)
  const diffMinutes = now.diff(target, 'minute')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`

  const diffHours = now.diff(target, 'hour')
  if (diffHours < 24) return `${diffHours}小时前`

  const diffDays = now.diff(target, 'day')
  if (diffDays < 7) return `${diffDays}天前`

  return target.format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.announcement-list-container {
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
    justify-content: space-between;
    padding: 0 24rpx;

    .nav-back {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .back-icon {
        font-size: 48rpx;
        color: #fff;
        font-weight: bold;
      }
    }

    .nav-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
      flex: 1;
      text-align: center;
    }

    .nav-right {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .add-icon {
        font-size: 40rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  margin: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .case-info {
    flex: 1;
    min-width: 0;

    .case-number {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 8rpx;
    }

    .case-name {
      display: block;
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .announcement-count {
    text-align: center;
    margin-left: 20rpx;

    .count-num {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #0068E2;
    }

    .count-label {
      display: block;
      font-size: 22rpx;
      color: #999;
      margin-top: 4rpx;
    }
  }
}

.announcement-list {
  padding: 0 20rpx;
  padding-bottom: 40rpx;

  .announcement-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;

    &.is-top {
      border: 2rpx solid #ff4d4f;
    }

    &:active {
      transform: scale(0.98);
      transition: transform 0.15s ease;
    }

    .top-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 4rpx 16rpx;
      border-radius: 0 16rpx 0 16rpx;
    }

    .card-header {
      display: flex;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .type-tag,
      .status-tag {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-weight: 500;
      }
    }

    .card-title {
      margin-bottom: 12rpx;

      text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        line-height: 1.4;
      }
    }

    .card-content {
      margin-bottom: 16rpx;

      .content-text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1rpx solid #f5f5f5;
      padding-top: 16rpx;

      .footer-left {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .publisher {
          font-size: 24rpx;
          color: #999;
        }

        .time {
          font-size: 22rpx;
          color: #ccc;
        }
      }

      .footer-right {
        .view-count {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

.empty-state {
  padding: 120rpx 40rpx;
  text-align: center;

  .empty-desc {
    font-size: 26rpx;
    color: #999;
    margin-top: 16rpx;
  }
}

.load-more {
  text-align: center;
  padding: 32rpx 0;
  color: #0068E2;
  font-size: 26rpx;
}

.no-more {
  text-align: center;
  padding: 32rpx 0;
  color: #ccc;
  font-size: 24rpx;
}
</style>
