<template>
  <view class="document-detail-container">
    <!-- 文档信息卡片 -->
    <view class="doc-card">
      <view class="doc-header">
        <view class="doc-icon-large" :class="getFileIconClass(document?.fileExtension, document?.documentType)">
          <text class="icon-text">{{ getFileTypeLabel(document?.fileExtension) }}</text>
        </view>
        <view class="doc-title-section">
          <text class="doc-title">{{ document?.documentName }}</text>
          <view class="doc-badges">
            <text class="badge type">{{ documentTypeMap[document?.documentType || ''] || '其他' }}</text>
            <text v-if="document?.isLocked" class="badge lock">已锁定</text>
            <text v-if="document?.isPublic" class="badge public">公开</text>
          </view>
        </view>
      </view>

      <view class="doc-stats">
        <view class="stat-item">
          <text class="stat-num">{{ document?.viewCount || 0 }}</text>
          <text class="stat-label">浏览</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ document?.downloadCount || 0 }}</text>
          <text class="stat-label">下载</text>
        </view>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="info-section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">文档编码</text>
          <text class="info-value">{{ document?.documentCode || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">文件名称</text>
          <text class="info-value">{{ document?.fileName }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">文件大小</text>
          <text class="info-value">{{ formatFileSize(document?.fileSize) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">文件类型</text>
          <text class="info-value">{{ document?.fileExtension?.toUpperCase() || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">所在文件夹</text>
          <text class="info-value">{{ document?.folderName || '根目录' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">创建人</text>
          <text class="info-value">{{ document?.createUserName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatDateTime(document?.createTime) }}</text>
        </view>
        <view v-if="document?.description" class="info-item">
          <text class="info-label">描述</text>
          <text class="info-value">{{ document.description }}</text>
        </view>
        <view v-if="document?.tags" class="info-item">
          <text class="info-label">标签</text>
          <view class="tag-list">
            <text v-for="tag in document.tags.split(',')" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-row">
        <view class="action-btn primary" @click="handlePreview">
          <text class="btn-text">预览</text>
        </view>
        <view class="action-btn primary" @click="handleDownload">
          <text class="btn-text">下载</text>
        </view>
      </view>
      <view class="action-row">
        <view class="action-btn" :class="{ active: isFavorited }" @click="handleToggleFavorite">
          <text class="btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="action-btn" @click="handleShare">
          <text class="btn-text">分享</text>
        </view>
        <view class="action-btn" @click="handleEdit">
          <text class="btn-text">编辑</text>
        </view>
      </view>
      <view class="action-row">
        <view class="action-btn" :class="{ active: document?.isLocked }" @click="handleLock">
          <text class="btn-text">{{ document?.isLocked ? '解锁' : '锁定' }}</text>
        </view>
        <view class="action-btn danger" @click="handleDelete">
          <text class="btn-text">删除</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getDocumentDetail,
  addFavorite,
  removeFavorite,
  checkFavorite,
  lockDocument,
  unlockDocument,
  deleteDocument,
  openDocumentWithAuth,
  saveDocumentWithAuth,
  type DocumentItem,
} from '@/api/document-library'

const document = ref<DocumentItem>()
const isFavorited = ref(false)
const documentId = ref<number>()

const documentTypeMap: Record<string, string> = {
  CONTRACT: '合同',
  REPORT: '报告',
  LEGAL: '法律',
  FINANCIAL: '财务',
  OTHER: '其他',
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id || currentPage.$route?.query?.id
  if (id) {
    documentId.value = Number(id)
    loadDetail()
  }
})

const loadDetail = async () => {
  if (!documentId.value) return
  uni.showLoading({ title: '加载中...' })
  try {
    const [docRes, favoriteRes] = await Promise.all([
      getDocumentDetail(documentId.value),
      checkFavorite(documentId.value),
    ])

    if (docRes.code === 200) {
      document.value = docRes.data
    }
    if (favoriteRes.code === 200) {
      isFavorited.value = favoriteRes.data
    }
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const handlePreview = () => {
  if (!document.value) return
  uni.navigateTo({
    url: `/pages/document-library/preview?id=${document.value.id}&name=${encodeURIComponent(document.value.documentName)}&ext=${document.value.fileExtension || ''}`,
  })
}

const handleDownload = async () => {
  if (!document.value) return

  uni.showLoading({ title: '下载中...' })

  try {
    const savedFilePath = await saveDocumentWithAuth(document.value.id)
    uni.hideLoading()
    uni.showModal({
      title: '下载完成',
      content: '文件已准备就绪，是否立即打开？',
      confirmText: '打开',
      cancelText: '关闭',
      success: (res: UniApp.ShowModalRes) => {
        if (res.confirm) {
          uni.openDocument({
            filePath: savedFilePath,
            showMenu: true,
            fail: () => {
              uni.showToast({ title: '打开失败', icon: 'none' })
            },
          })
        }
      },
    })
  } catch (error: any) {
    uni.hideLoading()
    if (error.message?.includes('登录已过期')) {
      uni.showModal({
        title: '登录过期',
        content: '请重新登录后再试',
        showCancel: false,
      })
    } else {
      uni.showToast({ title: error.message || '下载失败', icon: 'none' })
    }
  }
}

const handleToggleFavorite = async () => {
  if (!document.value) return
  try {
    if (isFavorited.value) {
      await removeFavorite(document.value.id)
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      await addFavorite(document.value.id)
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
    isFavorited.value = !isFavorited.value
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleShare = () => {
  if (!document.value) return
  uni.navigateTo({
    url: `/pages/document-library/share?documentId=${document.value.id}&documentName=${encodeURIComponent(document.value.documentName)}`,
  })
}

const handleEdit = () => {
  if (!document.value) return
  uni.navigateTo({
    url: `/pages/document-library/form?id=${document.value.id}&mode=edit`,
  })
}

const handleLock = async () => {
  if (!document.value) return
  try {
    if (document.value.isLocked) {
      await unlockDocument(document.value.id)
      uni.showToast({ title: '已解锁', icon: 'success' })
    } else {
      await lockDocument(document.value.id)
      uni.showToast({ title: '已锁定', icon: 'success' })
    }
    loadDetail()
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleDelete = () => {
  if (!document.value) return
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${document.value.documentName}"吗？删除后不可恢复！`,
    confirmColor: '#ff4d4f',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          await deleteDocument(document.value!.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          uni.$emit('refresh-document-list')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const getFileTypeLabel = (ext?: string) => {
  const labelMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    ppt: 'PPT',
    pptx: 'PPT',
    txt: 'TXT',
    jpg: 'JPG',
    jpeg: 'JPG',
    png: 'PNG',
    gif: 'GIF',
    zip: 'ZIP',
    rar: 'RAR',
  }
  return labelMap[ext?.toLowerCase() || ''] || '文件'
}

const getFileIconClass = (ext?: string, docType?: string) => {
  if (docType) {
    const typeClassMap: Record<string, string> = {
      WORD: 'type-word',
      EXCEL: 'type-excel',
      PDF: 'type-pdf',
      OTHER: 'type-other',
    }
    if (typeClassMap[docType]) return typeClassMap[docType]
  }
  const classMap: Record<string, string> = {
    pdf: 'type-pdf',
    doc: 'type-word',
    docx: 'type-word',
    xls: 'type-excel',
    xlsx: 'type-excel',
    ppt: 'type-ppt',
    pptx: 'type-ppt',
    txt: 'type-other',
    jpg: 'type-img',
    jpeg: 'type-img',
    png: 'type-img',
    gif: 'type-img',
    zip: 'type-other',
    rar: 'type-other',
  }
  return classMap[ext?.toLowerCase() || ''] || 'type-other'
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

const formatDateTime = (time?: string) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.document-detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.doc-card {
  background: #fff;
  padding: 40rpx;
  margin-bottom: 16rpx;

  .doc-header {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 32rpx;

    .doc-icon-large {
      width: 120rpx;
      height: 120rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.type-pdf {
        background: #fff1f0;
        .icon-text { color: #f5222d; }
      }

      &.type-word {
        background: #e6f7ff;
        .icon-text { color: #1890ff; }
      }

      &.type-excel {
        background: #f6ffed;
        .icon-text { color: #52c41a; }
      }

      &.type-ppt {
        background: #fff7e6;
        .icon-text { color: #fa8c16; }
      }

      &.type-img {
        background: #f9f0ff;
        .icon-text { color: #722ed1; }
      }

      &.type-other {
        background: #f5f7fa;
        .icon-text { color: #666; }
      }

      .icon-text {
        font-size: 28rpx;
        font-weight: 500;
      }
    }

    .doc-title-section {
      flex: 1;
      min-width: 0;

      .doc-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 12rpx;
        word-break: break-all;
      }

      .doc-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .badge {
          font-size: 22rpx;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;

          &.type {
            background: #e6f7ff;
            color: #1890ff;
          }

          &.lock {
            background: #fff7e6;
            color: #fa8c16;
          }

          &.public {
            background: #f6ffed;
            color: #52c41a;
          }
        }
      }
    }
  }

  .doc-stats {
    display: flex;
    justify-content: space-around;
    border-top: 1rpx solid #f5f5f5;
    padding-top: 24rpx;

    .stat-item {
      text-align: center;

      .stat-num {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 4rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.info-section {
  background: #fff;
  padding: 24rpx 40rpx;
  margin-bottom: 16rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .info-list {
    .info-item {
      display: flex;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        width: 160rpx;
        font-size: 28rpx;
        color: #999;
        flex-shrink: 0;
      }

      .info-value {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        word-break: break-all;
      }

      .tag-list {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 8rpx;

        .tag {
          font-size: 22rpx;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
          background: #f5f5f5;
          color: #666;
        }
      }
    }
  }
}

.action-section {
  background: #fff;
  padding: 24rpx 40rpx;

  .action-row {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24rpx;
      background: #f5f7fa;
      border-radius: 8rpx;

      &:active {
        background: #e6f2ff;
      }

      &.primary {
        background: #1890ff;

        &:active {
          background: #40a9ff;
        }

        .btn-text {
          color: #fff;
        }
      }

      &.active {
        background: #e6f7ff;
        .btn-text { color: #1890ff; }
      }

      &.danger {
        background: #fff1f0;

        &:active {
          background: #ffccc7;
        }

        .btn-text {
          color: #ff4d4f;
        }
      }

      .btn-text {
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}
</style>
