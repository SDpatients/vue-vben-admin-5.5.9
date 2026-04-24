<template>
  <view class="announcement-overview-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content">
        <text class="nav-title">公告总览</text>
        <view class="nav-actions">
          <view class="action-btn" @click="handleCreate">
            <text class="action-icon">+</text>
            <text class="action-text">发布</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计栏 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-num">{{ totalCount }}</text>
        <text class="stat-label">全部公告</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ todayCount }}</text>
        <text class="stat-label">今日更新</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ topCount }}</text>
        <text class="stat-label">置顶公告</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-section">
      <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
        <view class="filter-list">
          <view
            v-for="tab in filterTabs"
            :key="tab.value"
            :class="['filter-item', { active: currentFilter === tab.value }]"
            @click="handleFilterChange(tab.value)"
          >
            <text>{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 公告列表 -->
    <view class="announcement-list">
      <view
        v-for="(item, index) in filteredList"
        :key="item.id"
        class="announcement-card"
        :class="{ 'is-top': item.isTop }"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="goToDetail(item.id)"
      >
        <!-- 置顶标识 -->
        <view v-if="item.isTop" class="top-badge">
          <text>置顶</text>
        </view>

        <view class="card-header">
          <view
            class="type-tag"
            :style="{
              background: getAnnouncementTypeColor(item.announcementType) + '20',
              color: getAnnouncementTypeColor(item.announcementType),
            }"
          >
            <text>{{ getAnnouncementTypeText(item.announcementType) }}</text>
          </view>
          <text class="case-number">{{ item.caseNumber || '' }}</text>
        </view>

        <view class="card-title">
          <text>{{ item.title }}</text>
        </view>

        <view class="card-content">
          <text class="content-text">{{ truncateContent(item.content, 60) }}</text>
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
      <view v-if="filteredList.length === 0 && !loading" class="empty-state">
        <u-empty mode="message" text="暂无公告">
          <template #desc>
            <text class="empty-desc">{{ emptyText }}</text>
          </template>
        </u-empty>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && filteredList.length > 0" class="load-more" @click="loadMore">
      <text v-if="!loadingMore">加载更多</text>
      <u-loading-icon v-else mode="circle" size="16"></u-loading-icon>
    </view>

    <!-- 到底提示 -->
    <view v-if="!hasMore && filteredList.length > 0" class="no-more">
      <text>已经到底了</text>
    </view>

    <!-- 加载状态 -->
    <u-loading-page :loading="loading && filteredList.length === 0" loading-text="加载中..."></u-loading-page>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import {
  getAnnouncementList,
  type Announcement,
  getAnnouncementTypeText,
  getAnnouncementTypeColor,
} from '@/api/announcement'
import dayjs from 'dayjs'

const announcementList = ref<Announcement[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const pageNum = ref(1)
const pageSize = 10
const totalCount = ref(0)
const hasMore = ref(true)
const currentFilter = ref('all')

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '公告', value: 'ANNOUNCEMENT' },
  { label: '通知', value: 'NOTICE' },
  { label: '警告', value: 'WARNING' },
]

const CACHE_KEY = 'announcement_overview_list'

const filteredList = computed(() => {
  if (currentFilter.value === 'all') return announcementList.value
  return announcementList.value.filter((item) => item.announcementType === currentFilter.value)
})

const todayCount = computed(() => {
  const today = dayjs().startOf('day')
  return announcementList.value.filter((item) => {
    const time = dayjs(item.publishTime || item.createTime)
    return time.isAfter(today) || time.isSame(today)
  }).length
})

const topCount = computed(() => {
  return announcementList.value.filter((item) => item.isTop).length
})

const emptyText = computed(() => {
  if (currentFilter.value === 'all') return '暂无公告信息'
  const tab = filterTabs.find((t) => t.value === currentFilter.value)
  return `暂无${tab?.label || ''}类公告`
})

onMounted(() => {
  loadData(true)
})

onShow(() => {
  loadData(true)
})

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
      status: 'PUBLISHED',
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
        uni.setStorageSync(CACHE_KEY, {
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
    console.error('[loadData] Error:', error)
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
    const cache = uni.getStorageSync(CACHE_KEY)
    if (cache && cache.list && Date.now() - cache.timestamp < 5 * 60 * 1000) {
      announcementList.value = cache.list
      totalCount.value = cache.total
      uni.showToast({ title: '已加载缓存数据', icon: 'none' })
    }
  } catch (e) {
    console.error('[loadFromCache] Error:', e)
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

const handleFilterChange = (value: string) => {
  currentFilter.value = value
}

const goToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/cases/announcement-detail?announcementId=${id}`,
  })
}

const handleCreate = () => {
  uni.navigateTo({
    url: '/pages/announcement/form',
  })
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
.announcement-overview-container {
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

    .nav-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }

    .nav-actions {
      .action-btn {
        display: flex;
        align-items: center;
        gap: 4rpx;
        padding: 8rpx 20rpx;
        border-radius: 24rpx;
        background: rgba(255, 255, 255, 0.2);

        .action-icon {
          font-size: 28rpx;
          color: #fff;
          font-weight: bold;
        }

        .action-text {
          font-size: 24rpx;
          color: #fff;
        }
      }
    }
  }
}

.stats-bar {
  display: flex;
  background: #fff;
  margin: 20rpx;
  padding: 32rpx 0;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-num {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #0068E2;
      margin-bottom: 8rpx;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }

  .stat-divider {
    width: 1rpx;
    height: 60rpx;
    background: #f0f0f0;
  }
}

.filter-section {
  background: #fff;
  margin: 0 20rpx 20rpx;
  padding: 20rpx 0;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .filter-scroll {
    white-space: nowrap;

    .filter-list {
      display: inline-flex;
      padding: 0 20rpx;
      gap: 16rpx;

      .filter-item {
        padding: 12rpx 32rpx;
        border-radius: 32rpx;
        background: #f5f7fa;
        font-size: 26rpx;
        color: #666;
        transition: all 0.2s;

        &.active {
          background: #0068E2;
          color: #fff;
        }
      }
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
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .type-tag {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-weight: 500;
      }

      .case-number {
        font-size: 22rpx;
        color: #999;
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
