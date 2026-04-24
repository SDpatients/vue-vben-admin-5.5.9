<template>
  <view class="favorites-container">
    <!-- 收藏夹标签 -->
    <view class="folder-tabs">
      <scroll-view scroll-x class="tab-scroll">
        <view class="tab-list">
          <view
            class="tab-item"
            :class="{ active: currentFolder === '' }"
            @click="switchFolder('')"
          >
            <text class="tab-text">全部</text>
          </view>
          <view
            v-for="folder in favoriteFolders"
            :key="folder"
            class="tab-item"
            :class="{ active: currentFolder === folder }"
            @click="switchFolder(folder)"
          >
            <text class="tab-text">{{ folder }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 收藏列表 -->
    <view class="favorites-list-section">
      <scroll-view
        scroll-y
        class="favorites-scroll"
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="favoriteList.length === 0 && !loading" class="empty-state">
          <text class="empty-icon">⭐</text>
          <text class="empty-text">暂无收藏</text>
          <text class="empty-subtext">在文档详情页点击收藏按钮添加</text>
        </view>

        <view
          v-for="item in favoriteList"
          :key="item.id"
          class="favorite-item"
          @click="goToDetail(item.documentId)"
        >
          <view class="doc-icon">
            <text class="icon-text">📄</text>
          </view>
          <view class="doc-info">
            <text class="doc-name">{{ item.documentName }}</text>
            <view class="doc-meta">
              <text class="doc-type">{{ documentTypeMap[item.documentType || ''] || item.documentType || '其他' }}</text>
              <text class="doc-size">{{ formatFileSize(item.fileSize) }}</text>
            </view>
            <view v-if="item.folderName" class="doc-folder">
              <text class="folder-tag">{{ item.folderName }}</text>
            </view>
          </view>
          <view class="doc-actions" @click.stop>
            <text class="action-icon favorite" @click="handleRemoveFavorite(item)">⭐</text>
          </view>
        </view>

        <view v-if="loadingMore" class="loading-more">
          <text class="loading-text">加载中...</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getFavorites,
  getFavoriteFolders,
  getFavoritesByFolder,
  removeFavorite,
  type FavoriteItem,
} from '@/api/document-library'

const documentTypeMap: Record<string, string> = {
  CONTRACT: '合同',
  REPORT: '报告',
  LEGAL: '法律',
  FINANCIAL: '财务',
  OTHER: '其他',
}

const favoriteList = ref<FavoriteItem[]>([])
const favoriteFolders = ref<string[]>([])
const currentFolder = ref('')
const page = ref(1)
const size = 10
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)

onMounted(() => {
  loadData()
  loadFolders()
})

const loadData = async () => {
  page.value = 1
  await loadFavorites()
}

const loadFavorites = async () => {
  loading.value = true
  try {
    let res
    if (currentFolder.value) {
      res = await getFavoritesByFolder(currentFolder.value, page.value, size)
    } else {
      res = await getFavorites(page.value, size)
    }

    if (res.code === 200) {
      const items = res.data.favorites || []
      const totalCount = res.data.total || 0
      if (page.value === 1) {
        favoriteList.value = items
      } else {
        favoriteList.value = [...favoriteList.value, ...items]
      }
      total.value = totalCount
    }
  } catch (error) {
    console.error('[loadFavorites] Error:', error)
  } finally {
    loading.value = false
  }
}

const loadFolders = async () => {
  try {
    const res = await getFavoriteFolders()
    if (res.code === 200) {
      favoriteFolders.value = res.data || []
    }
  } catch (error) {
    console.error('[loadFolders] Error:', error)
  }
}

const switchFolder = (folder: string) => {
  currentFolder.value = folder
  page.value = 1
  loadFavorites()
}

const loadMore = () => {
  if (favoriteList.value.length >= total.value) return
  page.value++
  loadingMore.value = true
  loadFavorites().finally(() => {
    loadingMore.value = false
  })
}

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  Promise.all([loadFavorites(), loadFolders()]).finally(() => {
    refreshing.value = false
  })
}

const goToDetail = (documentId: number) => {
  uni.navigateTo({ url: `/pages/document-library/detail?id=${documentId}` })
}

const handleRemoveFavorite = async (item: FavoriteItem) => {
  uni.showModal({
    title: '取消收藏',
    content: `确定要取消收藏"${item.documentName}"吗？`,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          await removeFavorite(item.documentId)
          uni.showToast({ title: '已取消收藏', icon: 'success' })
          loadFavorites()
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

const formatFileSize = (size?: number) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return `${fileSize.toFixed(1)} ${units[index]}`
}
</script>

<style lang="scss" scoped>
.favorites-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.folder-tabs {
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-scroll {
    white-space: nowrap;
  }

  .tab-list {
    display: inline-flex;
    gap: 32rpx;
  }

  .tab-item {
    padding: 20rpx 0;
    position: relative;

    &.active {
      .tab-text {
        color: #1890ff;
        font-weight: 500;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #1890ff;
        border-radius: 2rpx;
      }
    }

    .tab-text {
      font-size: 28rpx;
      color: #666;
    }
  }
}

.favorites-list-section {
  .favorites-scroll {
    height: calc(100vh - 88rpx);

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 200rpx 40rpx;

      .empty-icon {
        font-size: 80rpx;
        margin-bottom: 20rpx;
      }

      .empty-text {
        font-size: 30rpx;
        color: #999;
        margin-bottom: 12rpx;
      }

      .empty-subtext {
        font-size: 26rpx;
        color: #ccc;
      }
    }

    .favorite-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      background: #fff;
      padding: 24rpx 32rpx;
      margin-bottom: 2rpx;

      &:active {
        background: #f5f7fa;
      }

      .doc-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 12rpx;
        background: #fff7e6;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .icon-text {
          font-size: 40rpx;
        }
      }

      .doc-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .doc-name {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .doc-meta {
          display: flex;
          align-items: center;
          gap: 16rpx;

          .doc-type {
            font-size: 22rpx;
            padding: 2rpx 10rpx;
            border-radius: 8rpx;
            background: #e6f7ff;
            color: #1890ff;
          }

          .doc-size {
            font-size: 22rpx;
            color: #999;
          }
        }

        .doc-folder {
          .folder-tag {
            font-size: 20rpx;
            padding: 2rpx 10rpx;
            border-radius: 8rpx;
            background: #f9f0ff;
            color: #722ed1;
          }
        }
      }

      .doc-actions {
        .action-icon {
          font-size: 40rpx;
          padding: 12rpx;

          &.favorite {
            color: #faad14;
          }
        }
      }
    }

    .loading-more {
      text-align: center;
      padding: 20rpx;

      .loading-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style>
