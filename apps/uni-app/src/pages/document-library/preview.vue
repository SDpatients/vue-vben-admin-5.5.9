<template>
  <view class="preview-container">
    <!-- 顶部导航 -->
    <view class="preview-header">
      <view class="header-left" @click="goBack">
        <text class="back-text">返回</text>
      </view>
      <text class="preview-title">{{ documentName }}</text>
      <view class="header-right">
        <text class="action-text" @click="handleDownload">下载</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 预览内容 -->
    <view v-else class="preview-content">
      <!-- 图片预览 -->
      <view v-if="isImage" class="image-preview">
        <image
          :src="previewUrl"
          class="preview-image"
          mode="aspectFit"
          @error="handleImageError"
          @load="handleImageLoad"
        />
        <view class="image-tips">
          <text>双指缩放查看详情</text>
        </view>
      </view>

      <!-- PDF预览 - 使用系统打开 -->
      <view v-else-if="isPdf" class="file-preview">
        <view class="file-info-card">
          <view class="file-icon type-pdf">
            <text class="icon-text">PDF</text>
          </view>
          <text class="file-name">{{ documentName }}</text>
          <text class="file-size">{{ formatFileSize(fileSize) }}</text>
        </view>
        <view class="preview-actions">
          <view class="btn-primary" @click="openDocument">
            <text>打开文档</text>
          </view>
          <view class="btn-secondary" @click="handleDownload">
            <text>下载到本地</text>
          </view>
        </view>
        <view class="preview-note">
          <text>提示：PDF文件将使用系统应用打开</text>
        </view>
      </view>

      <!-- Office文档预览 -->
      <view v-else-if="isOffice" class="file-preview">
        <view class="file-info-card">
          <view class="file-icon" :class="officeIconClass">
            <text class="icon-text">{{ officeTypeLabel }}</text>
          </view>
          <text class="file-name">{{ documentName }}</text>
          <text class="file-size">{{ formatFileSize(fileSize) }}</text>
        </view>
        <view class="preview-actions">
          <view class="btn-primary" @click="openDocument">
            <text>打开文档</text>
          </view>
          <view class="btn-secondary" @click="handleDownload">
            <text>下载到本地</text>
          </view>
        </view>
        <view class="preview-note">
          <text>提示：将使用手机上安装的Office应用打开</text>
        </view>
        <view class="preview-tips-card">
          <text class="tips-title">支持的打开方式：</text>
          <text class="tips-item">- WPS Office</text>
          <text class="tips-item">- Microsoft Office</text>
          <text class="tips-item">- 金山文档</text>
          <text class="tips-item">- 其他文档应用</text>
        </view>
      </view>

      <!-- 其他文件类型 -->
      <view v-else class="file-preview">
        <view class="file-info-card">
          <view class="file-icon type-other">
            <text class="icon-text">{{ fileTypeLabel }}</text>
          </view>
          <text class="file-name">{{ documentName }}</text>
          <text class="file-type">{{ getFileTypeDesc() }}</text>
        </view>
        <view class="preview-actions">
          <view class="btn-primary" @click="openDocument">
            <text>打开文档</text>
          </view>
          <view class="btn-secondary" @click="handleDownload">
            <text>下载到本地</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getDocumentDetail,
  downloadDocument,
  previewDocument,
  downloadDocumentWithAuth,
  openDocumentWithAuth,
  saveDocumentWithAuth,
  type DocumentItem,
} from '@/api/document-library'

const documentId = ref<number>()
const documentName = ref('')
const fileExtension = ref('')
const fileSize = ref(0)
const document = ref<DocumentItem>()
const loading = ref(true)
const previewUrl = ref('')

const isImage = computed(() => {
  const ext = fileExtension.value?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')
})

const isPdf = computed(() => {
  return fileExtension.value?.toLowerCase() === 'pdf'
})

const isOffice = computed(() => {
  const ext = fileExtension.value?.toLowerCase()
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')
})

const officeIconClass = computed(() => {
  const ext = fileExtension.value?.toLowerCase()
  if (['doc', 'docx'].includes(ext || '')) return 'type-word'
  if (['xls', 'xlsx'].includes(ext || '')) return 'type-excel'
  if (['ppt', 'pptx'].includes(ext || '')) return 'type-ppt'
  return 'type-other'
})

const officeTypeLabel = computed(() => {
  const ext = fileExtension.value?.toLowerCase()
  if (['doc', 'docx'].includes(ext || '')) return 'Word'
  if (['xls', 'xlsx'].includes(ext || '')) return 'Excel'
  if (['ppt', 'pptx'].includes(ext || '')) return 'PPT'
  return '文件'
})

const fileTypeLabel = computed(() => {
  const ext = fileExtension.value?.toUpperCase()
  return ext || '文件'
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || currentPage.$route?.query || {}

  if (options.id) {
    documentId.value = Number(options.id)
    loadDocument()
  }
  if (options.name) {
    documentName.value = decodeURIComponent(options.name)
  }
  if (options.ext) {
    fileExtension.value = options.ext
  }
})

const loadDocument = async () => {
  if (!documentId.value) return
  loading.value = true
  try {
    const res = await getDocumentDetail(documentId.value)
    if (res.code === 200) {
      document.value = res.data
      documentName.value = res.data.documentName
      fileExtension.value = res.data.fileExtension || ''
      fileSize.value = res.data.fileSize || 0
      previewUrl.value = previewDocument(res.data.id)
    }
  } catch (error) {
    console.error('[loadDocument] Error:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const openDocument = async () => {
  if (!documentId.value) return
  
  uni.showLoading({ title: '加载中...' })
  
  try {
    await openDocumentWithAuth(documentId.value)
    uni.hideLoading()
  } catch (error: any) {
    uni.hideLoading()
    if (error.message?.includes('登录已过期')) {
      uni.showModal({
        title: '登录过期',
        content: '请重新登录后再试',
        showCancel: false,
      })
    } else if (error.message?.includes('打开失败')) {
      uni.showModal({
        title: '打开失败',
        content: '未找到可打开此文件的应用，请先安装WPS Office或Microsoft Office。',
        showCancel: false,
      })
    } else {
      uni.showToast({ title: error.message || '操作失败', icon: 'none' })
    }
  }
}

const handleDownload = async () => {
  if (!documentId.value) return
  
  uni.showLoading({ title: '下载中...' })
  
  try {
    const savedFilePath = await saveDocumentWithAuth(documentId.value)
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

const handleImageError = () => {
  uni.showToast({ title: '图片加载失败', icon: 'none' })
}

const handleImageLoad = () => {
  console.log('图片加载成功')
}

const formatFileSize = (size?: number) => {
  if (!size) return '未知大小'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return `${fileSize.toFixed(1)} ${units[index]}`
}

const getFileTypeDesc = () => {
  const ext = fileExtension.value?.toLowerCase()
  const typeMap: Record<string, string> = {
    pdf: 'PDF文档',
    doc: 'Word文档',
    docx: 'Word文档',
    xls: 'Excel表格',
    xlsx: 'Excel表格',
    ppt: 'PowerPoint演示文稿',
    pptx: 'PowerPoint演示文稿',
    txt: '文本文件',
    zip: '压缩文件',
    rar: '压缩文件',
  }
  return typeMap[ext || ''] || '文件'
}
</script>

<style lang="scss" scoped>
.preview-container {
  min-height: 100vh;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #2a2a2a;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;

  .header-left {
    padding: 8rpx 16rpx;
  }

  .back-text {
    font-size: 28rpx;
    color: #1890ff;
  }

  .preview-title {
    flex: 1;
    font-size: 30rpx;
    color: #fff;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 20rpx;
  }

  .header-right {
    padding: 8rpx 16rpx;
  }

  .action-text {
    font-size: 28rpx;
    color: #1890ff;
  }
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #333;
    border-top-color: #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preview-content {
  flex: 1;
  margin-top: 100rpx;
}

.image-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;

  .preview-image {
    width: 100%;
    height: calc(100vh - 200rpx);
  }

  .image-tips {
    padding: 16rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 8rpx;
    position: fixed;
    bottom: 40rpx;
    left: 50%;
    transform: translateX(-50%);

    text {
      font-size: 24rpx;
      color: #fff;
    }
  }
}

.file-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;

  .file-info-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48rpx;
    background: #2a2a2a;
    border-radius: 16rpx;
    margin-bottom: 40rpx;
    width: 100%;
    max-width: 600rpx;

    .file-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24rpx;

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

      &.type-other {
        background: #f5f7fa;
        .icon-text { color: #666; }
      }

      .icon-text {
        font-size: 28rpx;
        font-weight: 500;
      }
    }

    .file-name {
      font-size: 30rpx;
      color: #fff;
      text-align: center;
      margin-bottom: 12rpx;
      word-break: break-all;
    }

    .file-size,
    .file-type {
      font-size: 24rpx;
      color: #999;
    }
  }

  .preview-actions {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    width: 100%;
    max-width: 600rpx;
    margin-bottom: 32rpx;

    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 88rpx;
      background: #1890ff;
      border-radius: 8rpx;

      text {
        font-size: 30rpx;
        color: #fff;
      }

      &:active {
        background: #40a9ff;
      }
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 88rpx;
      background: #3a3a3a;
      border-radius: 8rpx;

      text {
        font-size: 30rpx;
        color: #fff;
      }

      &:active {
        background: #4a4a4a;
      }
    }
  }

  .preview-note {
    padding: 16rpx 24rpx;
    background: rgba(24, 144, 255, 0.1);
    border-radius: 8rpx;
    margin-bottom: 32rpx;

    text {
      font-size: 24rpx;
      color: #1890ff;
    }
  }

  .preview-tips-card {
    width: 100%;
    max-width: 600rpx;
    padding: 24rpx;
    background: #2a2a2a;
    border-radius: 12rpx;

    .tips-title {
      display: block;
      font-size: 26rpx;
      color: #fff;
      margin-bottom: 16rpx;
    }

    .tips-item {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 8rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
