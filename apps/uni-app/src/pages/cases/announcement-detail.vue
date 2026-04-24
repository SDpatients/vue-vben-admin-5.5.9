<template>
  <view class="announcement-detail-container" v-if="announcement">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">公告详情</text>
        <view class="nav-right" @click="showActionSheet = true">
          <text class="more-icon">⋯</text>
        </view>
      </view>
    </view>

    <!-- 公告头部信息 -->
    <view class="announcement-header">
      <view class="header-tags">
        <view
          class="type-tag"
          :style="{
            background: getAnnouncementTypeColor(announcement.announcementType) + '20',
            color: getAnnouncementTypeColor(announcement.announcementType),
          }"
        >
          <text>{{ getAnnouncementTypeText(announcement.announcementType) }}</text>
        </view>
        <view
          class="status-tag"
          :style="{
            background: getAnnouncementStatusColor(announcement.status) + '20',
            color: getAnnouncementStatusColor(announcement.status),
          }"
        >
          <text>{{ getAnnouncementStatusText(announcement.status) }}</text>
        </view>
        <view v-if="announcement.isTop" class="top-tag">
          <text>置顶</text>
        </view>
      </view>

      <view class="announcement-title">
        <text>{{ announcement.title }}</text>
      </view>

      <view class="announcement-meta">
        <view class="meta-item">
          <text class="meta-label">发布人：</text>
          <text class="meta-value">{{ announcement.publisherName || '-' }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">发布时间：</text>
          <text class="meta-value">{{ formatDateTime(announcement.publishTime) }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">查看次数：</text>
          <text class="meta-value">{{ announcement.viewCount || 0 }} 次</text>
        </view>
      </view>
    </view>

    <!-- 公告内容 -->
    <view class="content-section">
      <view class="section-title">
        <text>公告内容</text>
      </view>
      <view class="content-body">
        <text class="content-text">{{ announcement.content }}</text>
      </view>
    </view>

    <!-- 案件信息 -->
    <view class="case-section" v-if="announcement.caseNumber">
      <view class="section-title">
        <text>关联案件</text>
      </view>
      <view class="case-info">
        <view class="info-row">
          <text class="info-label">案件编号</text>
          <text class="info-value">{{ announcement.caseNumber }}</text>
        </view>
        <view class="info-row" v-if="announcement.principalOfficer">
          <text class="info-label">负责人</text>
          <text class="info-value">{{ announcement.principalOfficer }}</text>
        </view>
      </view>
    </view>

    <!-- 附件列表 -->
    <view class="attachment-section" v-if="attachments.length > 0">
      <view class="section-title">
        <text>附件 ({{ attachments.length }})</text>
      </view>
      <view class="attachment-list">
        <view
          v-for="file in attachments"
          :key="file.id"
          class="attachment-item"
          @click="handlePreviewFile(file)"
        >
          <view class="file-icon">
            <text class="file-ext">{{ file.fileExtension?.toUpperCase() || 'FILE' }}</text>
          </view>
          <view class="file-info">
            <text class="file-name">{{ file.originalFileName }}</text>
            <text class="file-size">{{ formatFileSize(file.fileSize) }}</text>
          </view>
          <view class="file-action">
            <text class="action-text">查看</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="back-btn" @click="handleBack">
        <text>返回</text>
      </view>
    </view>

    <!-- 操作菜单 -->
    <u-action-sheet
      :show="showActionSheet"
      :actions="actionSheetActions"
      @select="handleActionSelect"
      @close="showActionSheet = false"
    ></u-action-sheet>
  </view>

  <!-- 加载状态 -->
  <view class="loading-container" v-else-if="loading">
    <u-loading-page loading loading-text="加载中..."></u-loading-page>
  </view>

  <!-- 错误状态 -->
  <view class="error-container" v-else>
    <u-empty mode="message" text="加载失败">
      <template #desc>
        <text class="error-desc">公告加载失败，请检查网络后重试</text>
      </template>
    </u-empty>
    <view class="retry-btn" @click="loadDetail">
      <text>重新加载</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getAnnouncementDetail,
  getAnnouncementAttachments,
  createViewRecord,
  deleteAnnouncement,
  publishAnnouncement,
  topAnnouncement,
  cancelTopAnnouncement,
  type Announcement,
  type AnnouncementAttachment,
  getAnnouncementTypeText,
  getAnnouncementTypeColor,
  getAnnouncementStatusText,
  getAnnouncementStatusColor,
  formatFileSize,
} from '@/api/announcement'
import { getBaseUrl } from '@/config'
import dayjs from 'dayjs'

const announcement = ref<Announcement | null>(null)
const attachments = ref<AnnouncementAttachment[]>([])
const loading = ref(false)
const announcementId = ref('')
const caseId = ref('')
const showActionSheet = ref(false)

const getCacheKey = (id: string) => `announcement_detail_${id}`

const actionSheetActions = computed(() => {
  const actions: any[] = []
  if (announcement.value?.status === 'DRAFT') {
    actions.push({ name: '发布公告', color: '#0068E2' })
  }
  if (announcement.value?.isTop) {
    actions.push({ name: '取消置顶' })
  } else {
    actions.push({ name: '置顶公告', color: '#ff4d4f' })
  }
  actions.push({ name: '删除公告', color: '#ff4d4f' })
  actions.push({ name: '取消' })
  return actions
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  announcementId.value = currentPage.options?.announcementId || ''
  caseId.value = currentPage.options?.caseId || ''

  if (announcementId.value) {
    loadDetail()
  } else {
    uni.showToast({ title: '公告ID不能为空', icon: 'none' })
  }
})

const loadDetail = async () => {
  loading.value = true
  try {
    const [detailRes, attachmentRes] = await Promise.all([
      getAnnouncementDetail(Number(announcementId.value)),
      getAnnouncementAttachments(Number(announcementId.value)).catch(() => null),
    ])

    if (detailRes.code === 200 && detailRes.data) {
      announcement.value = detailRes.data
      uni.setStorageSync(getCacheKey(announcementId.value), {
        data: detailRes.data,
        timestamp: Date.now(),
      })
      recordView()
    } else {
      loadFromCache()
    }

    if (attachmentRes && attachmentRes.code === 200 && attachmentRes.data) {
      attachments.value = attachmentRes.data
    } else {
      try {
        if (announcement.value?.attachments) {
          const parsed = JSON.parse(announcement.value.attachments)
          if (Array.isArray(parsed)) {
            attachments.value = parsed
          }
        }
      } catch (e) {
        attachments.value = []
      }
    }
  } catch (error) {
    console.error('[loadDetail] Error:', error)
    loadFromCache()
  } finally {
    loading.value = false
  }
}

const loadFromCache = () => {
  try {
    const cache = uni.getStorageSync(getCacheKey(announcementId.value))
    if (cache && cache.data && Date.now() - cache.timestamp < 10 * 60 * 1000) {
      announcement.value = cache.data
      uni.showToast({ title: '已加载缓存数据', icon: 'none' })
    }
  } catch (e) {
    console.error('[loadFromCache] Error:', e)
  }
}

const recordView = async () => {
  try {
    const userInfo = uni.getStorageSync('userInfo')
    await createViewRecord({
      announcementId: Number(announcementId.value),
      announcementTitle: announcement.value?.title,
      caseId: caseId.value ? Number(caseId.value) : undefined,
      viewerId: userInfo?.id,
      viewerName: userInfo?.realName,
      viewerType: userInfo?.userType,
      deviceType: 'MOBILE',
    })
  } catch (error) {
    console.error('[recordView] Error:', error)
  }
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
  uni.showModal({
    title: '确认发布',
    content: '发布后将无法修改，是否继续？',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          const result = await publishAnnouncement(Number(announcementId.value))
          if (result.code === 200) {
            uni.showToast({ title: '发布成功', icon: 'success' })
            loadDetail()
          }
        } catch (error) {
          uni.showToast({ title: '发布失败', icon: 'none' })
        }
      }
    },
  })
}

const handleTop = async () => {
  try {
    const result = await topAnnouncement(Number(announcementId.value))
    if (result.code === 200) {
      uni.showToast({ title: '置顶成功', icon: 'success' })
      loadDetail()
    }
  } catch (error) {
    uni.showToast({ title: '置顶失败', icon: 'none' })
  }
}

const handleCancelTop = async () => {
  try {
    const result = await cancelTopAnnouncement(Number(announcementId.value))
    if (result.code === 200) {
      uni.showToast({ title: '已取消置顶', icon: 'success' })
      loadDetail()
    }
  } catch (error) {
    uni.showToast({ title: '取消置顶失败', icon: 'none' })
  }
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，是否继续？',
    confirmColor: '#ff4d4f',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          const result = await deleteAnnouncement(Number(announcementId.value))
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
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

const handlePreviewFile = (file: AnnouncementAttachment) => {
  if (!file.filePath) {
    uni.showToast({ title: '文件路径不存在', icon: 'none' })
    return
  }
  
  const baseUrl = getBaseUrl()
  const encodedFilePath = encodeURIComponent(file.filePath)
  
  const token = uni.getStorageSync('token')
  const ext = file.fileExtension?.toLowerCase() || ''
  
  const fileUrl = `${baseUrl}/api/v1/file/preview-by-path?filePath=${encodedFilePath}`
  
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    uni.downloadFile({
      url: fileUrl,
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res: UniApp.DownloadSuccessData) => {
        if (res.statusCode === 200) {
          uni.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: () => {
              console.log('[handlePreviewFile] 打开文档成功')
            },
            fail: (err: any) => {
              console.error('[handlePreviewFile] 打开文档失败:', err)
              uni.showToast({ title: '无法打开文件', icon: 'none' })
            },
          })
        } else {
          uni.showToast({ title: '文件下载失败', icon: 'none' })
        }
      },
      fail: () => {
        uni.showToast({ title: '文件下载失败', icon: 'none' })
      },
    })
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    uni.downloadFile({
      url: fileUrl,
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (downloadRes: UniApp.DownloadSuccessData) => {
        if (downloadRes.statusCode === 200) {
          const tempFilePath = downloadRes.tempFilePath
          uni.previewImage({
            urls: [tempFilePath],
            current: tempFilePath,
            longPressActions: {
              itemList: ['保存图片到相册'],
              success: (data: any) => {
                if (data.tapIndex === 0) {
                  uni.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success: () => {
                      uni.showToast({ title: '保存成功', icon: 'success' })
                    },
                    fail: (err: any) => {
                      console.error('[saveImageToPhotosAlbum] Error:', err)
                      if (err.errMsg?.includes('auth deny')) {
                        uni.showModal({
                          title: '提示',
                          content: '需要您授权保存图片到相册',
                          confirmText: '去授权',
                          success: (modalRes) => {
                            if (modalRes.confirm) {
                              uni.openSetting({
                                success: (settingRes: any) => {
                                  if (settingRes.authSetting['scope.writePhotosAlbum']) {
                                    uni.saveImageToPhotosAlbum({
                                      filePath: tempFilePath,
                                      success: () => {
                                        uni.showToast({ title: '保存成功', icon: 'success' })
                                      },
                                      fail: () => {
                                        uni.showToast({ title: '保存失败', icon: 'none' })
                                      },
                                    })
                                  }
                                },
                              })
                            }
                          },
                        })
                      } else {
                        uni.showToast({ title: '保存失败', icon: 'none' })
                      }
                    },
                  })
                }
              },
              fail: (err: any) => {
                console.error('[longPressActions] Error:', err)
              },
            },
          })
        } else {
          uni.showToast({ title: '图片加载失败', icon: 'none' })
        }
      },
      fail: () => {
        uni.showToast({ title: '图片下载失败', icon: 'none' })
      },
    })
  } else {
    uni.showToast({ title: '不支持的文件类型', icon: 'none' })
  }
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.announcement-detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
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

      .more-icon {
        font-size: 36rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

.announcement-header {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .header-tags {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;
    flex-wrap: wrap;

    .type-tag,
    .status-tag {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-weight: 500;
    }

    .top-tag {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      background: #ff4d4f;
      color: #fff;
      font-weight: 500;
    }
  }

  .announcement-title {
    margin-bottom: 24rpx;

    text {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      line-height: 1.4;
    }
  }

  .announcement-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .meta-item {
      display: flex;
      align-items: center;

      .meta-label {
        font-size: 24rpx;
        color: #999;
      }

      .meta-value {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.content-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .content-body {
    .content-text {
      font-size: 30rpx;
      color: #333;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.case-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .case-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 28rpx;
        color: #999;
      }

      .info-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.attachment-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .attachment-list {
    .attachment-item {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      &:active {
        background: #e6f2ff;
      }

      .file-icon {
        width: 80rpx;
        height: 80rpx;
        background: #0068E2;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .file-ext {
          font-size: 20rpx;
          color: #fff;
          font-weight: bold;
        }
      }

      .file-info {
        flex: 1;
        margin-left: 20rpx;
        min-width: 0;

        .file-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          display: block;
          font-size: 24rpx;
          color: #999;
          margin-top: 4rpx;
        }
      }

      .file-action {
        flex-shrink: 0;
        margin-left: 16rpx;

        .action-text {
          font-size: 26rpx;
          color: #0068E2;
          padding: 8rpx 20rpx;
          border: 1rpx solid #0068E2;
          border-radius: 8rpx;
        }
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;

  .back-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 30rpx;
    font-weight: 500;
    background: #f5f7fa;
    color: #333;
    border: 1rpx solid #e8e8e8;

    &:active {
      background: #e8e8e8;
    }
  }

  .edit-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 30rpx;
    font-weight: 500;
    background: #0068E2;
    color: #fff;

    &:active {
      opacity: 0.8;
    }
  }
}

.loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .error-desc {
    font-size: 26rpx;
    color: #999;
    margin-top: 16rpx;
  }

  .retry-btn {
    margin-top: 40rpx;
    padding: 16rpx 48rpx;
    background: #0068E2;
    border-radius: 8rpx;

    text {
      font-size: 28rpx;
      color: #fff;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
