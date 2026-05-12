<template>
  <view class="files-container">
    <!-- 调试信息条 -->
    <view class="debug-bar" v-if="showDebug">
      <text class="debug-text">H5:{{ isH5 }} URL:{{ typeof URL !== 'undefined' ? 'Y' : 'N' }} Img:{{ fileList.filter(f => isImageFile(f.fileExtension)).length }} Loaded:{{ fileList.filter(f => f._blobUrl && f._blobUrl.length > 0).length }}</text>
      <text class="debug-close" @click="showDebug = false">✕</text>
    </view>
    
    <view class="header">
      <text class="title">案件文件</text>
      <text class="count">共 {{ total }} 个文件</text>
    </view>

    <view class="stats-bar" v-if="statistics">
      <view class="stat-item">
        <text class="num">{{ statistics.totalFiles }}</text>
        <text class="label">文件总数</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ formatFileSize(statistics.totalSize) }}</text>
        <text class="label">总大小</text>
      </view>
    </view>

    <view class="filter-bar">
      <view class="filter-item" :class="{ active: statusFilter === '' }" @click="statusFilter = ''">
        <text>全部</text>
      </view>
      <view class="filter-item" :class="{ active: statusFilter === 'ACTIVE' }" @click="statusFilter = 'ACTIVE'">
        <text>有效</text>
      </view>
      <view class="filter-item" :class="{ active: statusFilter === 'INACTIVE' }" @click="statusFilter = 'INACTIVE'">
        <text>无效</text>
      </view>
    </view>

    <!-- 文件网格视图 - 支持图片和PDF预览 -->
    <view class="file-grid">
      <view
        v-for="item in fileList"
        :key="item.id"
        class="file-grid-item"
        @click="handlePreview(item)"
        @longpress="handleLongPress(item)"
      >
        <!-- 图片预览 -->
        <view v-if="isImageFile(item.fileExtension)" class="file-preview image-preview">
          <image
            v-if="item._blobUrl"
            :src="item._blobUrl"
            mode="aspectFill"
            class="preview-image"
            @error="handleImageError(item)"
          />
          <view v-if="!item._blobUrl" class="loading-mask">
            <text class="loading-text">加载中...</text>
          </view>
        </view>
        
        <!-- PDF预览 -->
        <view v-else-if="isPdfFile(item.fileExtension)" class="file-preview pdf-preview">
          <view class="pdf-icon-wrapper">
            <text class="pdf-label">PDF</text>
          </view>
          <text class="file-name-overlay">{{ truncateFileName(item.originalFileName || item.fileName, 15) }}</text>
        </view>
        
        <!-- 其他文件类型 -->
        <view v-else class="file-preview other-preview">
          <u-icon :name="getFileIconName(item.fileExtension)" size="28" :color="getFileIconColor(item.fileExtension)"></u-icon>
          <text class="file-type-text">{{ getFileIcon(item.fileExtension) }}</text>
        </view>
        
        <!-- 文件信息 -->
        <view class="file-info-overlay">
          <text class="file-name-text">{{ item.originalFileName || item.fileName }}</text>
          <text class="file-size-text">{{ formatFileSize(item.fileSize) }}</text>
        </view>
        
        <!-- 选中状态 -->
        <view v-if="selectedIds.includes(item.id)" class="selected-mask">
          <view class="selected-check">✓</view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && fileList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="fileList.length === 0 && !loading">
        <text class="empty-text">暂无文件</text>
        <text class="empty-tip">点击右下角按钮上传文件</text>
      </view>
    </view>

    <!-- 批量操作栏 -->
    <view class="batch-actions" v-if="selectedIds.length > 0">
      <view class="selected-count">
        <text>已选择 {{ selectedIds.length }} 个文件</text>
      </view>
      <view class="batch-btns">
        <view class="batch-btn" @click="handleBatchDownload">
          <text>批量下载</text>
        </view>
        <view class="batch-btn danger" @click="handleBatchDelete">
          <text>批量删除</text>
        </view>
        <view class="batch-btn" @click="clearSelection">
          <text>取消选择</text>
        </view>
      </view>
    </view>

    <!-- 上传按钮 -->
    <view class="upload-btn" @click="handleUpload">
      <text class="icon">+</text>
      <text class="text">上传</text>
    </view>

    <!-- 图片预览弹窗 -->
    <view class="image-preview-modal" v-if="showImagePreview" @click="closeImagePreview">
      <view class="preview-header">
        <text class="preview-title">{{ currentPreviewFile?.originalFileName || currentPreviewFile?.fileName }}</text>
        <text class="close-btn" @click.stop="closeImagePreview">✕</text>
      </view>
      <view class="preview-content" @click.stop>
        <image
          :src="currentPreviewUrl"
          mode="aspectFit"
          class="preview-full-image"
          @longpress="handleDownloadFromPreview"
        />
      </view>
      <view class="preview-footer">
        <text class="tip-text">长按图片可下载</text>
        <text class="download-btn" @click.stop="handleDownloadFromPreview">下载图片</text>
      </view>
    </view>

    <!-- PDF预览弹窗 -->
    <view class="pdf-preview-modal" v-if="showPdfPreview">
      <view class="preview-header">
        <text class="preview-title">{{ currentPreviewFile?.originalFileName || currentPreviewFile?.fileName }}</text>
        <text class="close-btn" @click="closePdfPreview">✕</text>
      </view>
      <view class="preview-content" @click.stop>
        <iframe
          v-if="pdfPreviewUrl"
          :src="pdfPreviewUrl"
          class="pdf-iframe"
        ></iframe>
        <view v-else class="pdf-loading">
          <text>加载中...</text>
        </view>
      </view>
      <view class="preview-footer">
        <text class="download-btn" @click.stop="handleDownloadFromPreview">下载PDF</text>
      </view>
    </view>

    <!-- 操作菜单弹窗 -->
    <view class="action-menu-modal" v-if="showActionMenu" @click="showActionMenu = false">
      <view class="action-menu" @click.stop>
        <view class="menu-title">
          <text>{{ currentActionFile?.originalFileName || currentActionFile?.fileName }}</text>
        </view>
        <view class="menu-item" @click="handleActionPreview">
          <text>预览</text>
        </view>
        <view class="menu-item" @click="handleActionDownload">
          <text>下载</text>
        </view>
        <view class="menu-item" @click="handleActionRename">
          <text>重命名</text>
        </view>
        <view class="menu-item danger" @click="handleActionDelete">
          <text>删除</text>
        </view>
        <view class="menu-item cancel" @click="showActionMenu = false">
          <text>取消</text>
        </view>
      </view>
    </view>

    <!-- 重命名弹窗 -->
    <view class="rename-modal" v-if="showRenameModal">
      <view class="modal-mask" @click="showRenameModal = false"></view>
      <view class="modal-content">
        <view class="modal-title">
          <text>重命名文件</text>
        </view>
        <view class="rename-original-name">
          <text class="rename-label">原文件名：</text>
          <text class="rename-value">{{ renamingFile?.originalFileName || renamingFile?.fileName }}</text>
        </view>
        <view class="rename-input-wrapper">
          <input
            class="modal-input"
            v-model="newFileName"
            type="text"
            placeholder="请输入新文件名"
            focus
          />
          <text class="rename-extension" v-if="renamingFile && (renamingFile.originalFileName || renamingFile.fileName).lastIndexOf('.') > 0">
            {{ (renamingFile.originalFileName || renamingFile.fileName).substring((renamingFile.originalFileName || renamingFile.fileName).lastIndexOf('.')) }}
          </text>
        </view>
        <view class="modal-btns">
          <view class="modal-btn cancel" @click="showRenameModal = false">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" :class="{ disabled: renameLoading }" @click="confirmRename">
            <text>{{ renameLoading ? '处理中...' : '确定' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import {
  getCaseFiles,
  deleteCaseFile,
  batchDeleteCaseFiles,
  renameCaseFile,
  getCaseFileStatistics,
  type FileItem,
  type FileStatisticsResponse
} from '@/api/case'
import { getPageParam } from '@/utils/pageParam'
import { getBaseUrl, FILE_API } from '@/config'

import { chooseFilePlatform } from '@/utils/chooseFile'

import dayjs from 'dayjs'

const caseId = ref('')
const fileList = ref<(FileItem & { _loaded?: boolean; _blobUrl?: string })[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const statusFilter = ref('')
const statistics = ref<FileStatisticsResponse['data'] | null>(null)
const selectedIds = ref<number[]>([])

const isH5 = typeof window !== 'undefined' && typeof document !== 'undefined'

const showDebug = ref(true)

const showRenameModal = ref(false)
const newFileName = ref('')
const renamingFile = ref<FileItem | null>(null)
const renameLoading = ref(false)

const showImagePreview = ref(false)
const showPdfPreview = ref(false)
const currentPreviewFile = ref<FileItem | null>(null)
const currentPreviewUrl = ref('')
const pdfPreviewUrl = ref('')

const showActionMenu = ref(false)
const currentActionFile = ref<FileItem | null>(null)

const baseUrl = getBaseUrl()

const isImageFile = (extension?: string) => {
  if (!extension) return false
  const ext = extension.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)
}

const isPdfFile = (extension?: string) => {
  if (!extension) return false
  return extension.toLowerCase() === 'pdf'
}

const getPreviewUrl = (fileId: number) => {
  return `${baseUrl}/api/v1/file/preview/${fileId}`
}

const fetchFileBlob = async (fileId: number) => {
  // #ifdef H5
  const token = uni.getStorageSync('token')
  const url = `${baseUrl}/api/v1/file/preview/${fileId}`
  console.log('[files.vue] fetchFileBlob 请求URL:', url, 'token存在:', !!token)
  
  if (typeof fetch === 'undefined') {
    console.error('[files.vue] fetchFileBlob fetch API 不可用')
    throw new Error('文件预览仅在 H5 环境支持')
  }
  
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('[files.vue] fetchFileBlob 响应状态:', response.status, 'ok:', response.ok, 'contentType:', response.headers.get('content-type'))
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误响应')
      console.error('[files.vue] fetchFileBlob 响应失败:', response.status, errorText)
      throw new Error(`加载失败: HTTP ${response.status}`)
    }
    
    const blob = await response.blob()
    console.log('[files.vue] fetchFileBlob blob大小:', blob.size, '类型:', blob.type)
    return blob
  } catch (error: any) {
    console.error('[files.vue] fetchFileBlob 异常:', error?.message || error)
    throw error
  }
  // #endif
  // #ifndef H5
  console.error('[files.vue] fetchFileBlob 非H5平台，不支持')
  throw new Error('文件预览仅在 H5 环境支持')
  // #endif
}

const truncateFileName = (name: string, maxLen: number) => {
  if (!name || name.length <= maxLen) return name
  const ext = name.split('.').pop()
  const baseName = name.substring(0, name.lastIndexOf('.'))
  const truncated = baseName.substring(0, maxLen - 4) + '...'
  return ext ? `${truncated}.${ext}` : truncated
}

watch(statusFilter, () => {
  loadFiles(true)
})

onMounted(() => {
  caseId.value = getPageParam('id')

  console.log('[files.vue] onMounted 初始化', {
    caseId: caseId.value,
    isH5,
    typeofWindow: typeof window,
    typeofDocument: typeof document,
    typeofURL: typeof URL,
    typeofCreateObjectURL: typeof URL !== 'undefined' ? typeof URL.createObjectURL : 'undefined',
    baseUrl,
  })

  if (caseId.value) {
    loadFiles()
    loadStatistics()
  } else {
    console.error('[files.vue] onMounted caseId为空!')
  }
})

const loadFiles = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  console.log('[files.vue] loadFiles 开始, isRefresh:', isRefresh, 'caseId:', caseId.value)

  try {
    const params: any = {
      pageNum: isRefresh ? 1 : page.value,
      pageSize,
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const res = await getCaseFiles(Number(caseId.value), params)
    const rawList = res.data?.list || []
    const listData = Array.isArray(rawList) ? rawList.map(item => ({ ...item, _loaded: false, _blobUrl: '' })) : []

    console.log('[files.vue] loadFiles 获取到文件数量:', listData.length, '总数:', res.data?.total)
    console.log('[files.vue] 文件列表:', listData.map(f => ({
      id: f.id,
      fileName: f.originalFileName || f.fileName,
      fileExtension: f.fileExtension,
      isImage: isImageFile(f.fileExtension),
      _blobUrl: f._blobUrl,
    })))

    if (isRefresh) {
      fileList.value.forEach(f => {
        if (f._blobUrl && f._blobUrl.startsWith('blob:')) {
          if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(f._blobUrl)
          }
        }
      })
      fileList.value = []
      await nextTick()
      fileList.value = listData
      page.value = 1
    } else {
      fileList.value = [...fileList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = fileList.value.length < (res.data?.total || 0)
    
    console.log('[files.vue] loadFiles isH5:', isH5, 'typeof URL:', typeof URL, 'URL.createObjectURL:', typeof URL !== 'undefined' ? typeof URL.createObjectURL : 'undefined')
    if (isH5) {
      console.log('[files.vue] loadFiles 调用 preloadImages() (H5平台)')
      preloadImages()
    } else {
      console.log('[files.vue] loadFiles 调用 preloadThumbnailsNonH5() (非H5平台)')
      preloadThumbnailsNonH5()
    }
  } catch (error) {
    console.error('[files.vue] loadFiles 加载失败:', error)
uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const preloadImages = async () => {
  console.log('[files.vue] preloadImages 开始 (H5平台)')
  if (!isH5 || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    console.warn('[files.vue] preloadImages 跳过: isH5=', isH5, 'URL=', typeof URL, 'createObjectURL=', typeof URL !== 'undefined' ? typeof URL.createObjectURL : 'undefined')
    return
  }
  
  const imageItems = fileList.value.filter(item => isImageFile(item.fileExtension))
  console.log('[files.vue] preloadImages 需要预加载的图片数量:', imageItems.length)
  
  for (const item of imageItems) {
    if (!item._blobUrl) {
      try {
        console.log('[files.vue] preloadImages 开始加载图片:', item.id, item.originalFileName || item.fileName)
        const blob = await fetchFileBlob(item.id)
        const blobUrl = URL.createObjectURL(blob)
        item._blobUrl = blobUrl
        item._loaded = true
        console.log('[files.vue] preloadImages 图片加载成功:', item.id, 'blobUrl:', blobUrl.substring(0, 50) + '...')
      } catch (error: any) {
        console.error('[files.vue] preloadImages 图片加载失败:', item.id, item.originalFileName || item.fileName, '错误:', error?.message || error)
      }
    } else {
      console.log('[files.vue] preloadImages 图片已有_blobUrl，跳过:', item.id)
    }
  }
  
  console.log('[files.vue] preloadImages 完成')
}

const preloadThumbnailsNonH5 = async () => {
  console.log('[files.vue] preloadThumbnailsNonH5 开始 (非H5平台)')
  
  const imageItems = fileList.value.filter(item => isImageFile(item.fileExtension))
  console.log('[files.vue] preloadThumbnailsNonH5 需要预加载的图片数量:', imageItems.length)
  
  if (imageItems.length === 0) {
    console.log('[files.vue] preloadThumbnailsNonH5 没有需要预加载的图片，跳过')
    return
  }
  
  for (const item of imageItems) {
    if (item._blobUrl && !item._blobUrl.startsWith('blob:') && item._blobUrl.length > 0) {
      console.log('[files.vue] preloadThumbnailsNonH5 图片已有有效路径，跳过:', item.id, item._blobUrl)
      continue
    }
    
    try {
      console.log('[files.vue] preloadThumbnailsNonH5 开始下载缩略图:', item.id, item.originalFileName || item.fileName)
      const token = uni.getStorageSync('token')
      if (!token) {
        console.error('[files.vue] preloadThumbnailsNonH5 未找到token，跳过:', item.id)
        continue
      }
      
      const tempFilePath = await new Promise<string>((resolve, reject) => {
        uni.downloadFile({
          url: `${baseUrl}/api/v1/file/preview/${item.id}`,
          header: { Authorization: `Bearer ${token}` },
          success: (downloadRes: any) => {
            console.log('[files.vue] preloadThumbnailsNonH5 downloadFile success:', item.id, 'statusCode:', downloadRes.statusCode)
            if (downloadRes.statusCode === 200 && downloadRes.tempFilePath) {
              resolve(downloadRes.tempFilePath)
            } else {
              reject(new Error(`下载失败, statusCode: ${downloadRes.statusCode}`))
            }
          },
          fail: (err: any) => {
            console.error('[files.vue] preloadThumbnailsNonH5 downloadFile fail:', item.id, err)
            reject(new Error(err.errMsg || '下载失败'))
          },
        })
      })
      
      item._blobUrl = tempFilePath
      item._loaded = true
      console.log('[files.vue] preloadThumbnailsNonH5 缩略图下载成功:', item.id, 'tempFilePath:', tempFilePath)
    } catch (error: any) {
      console.error('[files.vue] preloadThumbnailsNonH5 缩略图下载失败:', item.id, item.originalFileName || item.fileName, '错误:', error?.message || error)
    }
  }
  
  console.log('[files.vue] preloadThumbnailsNonH5 完成')
}

const loadStatistics = async () => {
  try {
    const res = await getCaseFileStatistics(Number(caseId.value))
    if (res.data) {
      statistics.value = res.data
    }
  } catch (error) {
}
}

const handleImageError = (item: FileItem & { _blobUrl?: string }) => {
  console.error('[files.vue] handleImageError 图片加载失败:', {
    id: item.id,
    fileName: item.originalFileName || item.fileName,
    _blobUrl: item._blobUrl,
    blobUrlType: item._blobUrl ? (item._blobUrl.startsWith('blob:') ? 'blob' : item._blobUrl.startsWith('http') ? 'http' : 'local') : 'empty',
  })
}

const getFileIcon = (extension?: string) => {
  if (!extension) return 'FILE'
  const ext = extension.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'IMG'
  if (['pdf'].includes(ext)) return 'PDF'
  if (['doc', 'docx'].includes(ext)) return 'DOC'
  if (['xls', 'xlsx'].includes(ext)) return 'XLS'
  if (['ppt', 'pptx'].includes(ext)) return 'PPT'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ZIP'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'VID'
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'AUD'
  return 'FILE'
}

const getFileIconName = (extension?: string) => {
  if (!extension) return 'file-text'
  const ext = extension.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'camera'
  if (['pdf'].includes(ext)) return 'file-text'
  if (['doc', 'docx'].includes(ext)) return 'file-text'
  if (['xls', 'xlsx'].includes(ext)) return 'file-text'
  if (['ppt', 'pptx'].includes(ext)) return 'file-text'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'folder'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'play-circle'
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'volume'
  return 'file-text'
}

const getFileIconColor = (extension?: string) => {
  if (!extension) return '#999'
  const ext = extension.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return '#722ed1'
  if (['pdf'].includes(ext)) return '#f40f02'
  if (['doc', 'docx'].includes(ext)) return '#2b579a'
  if (['xls', 'xlsx'].includes(ext)) return '#217346'
  if (['ppt', 'pptx'].includes(ext)) return '#d24726'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '#fa8c16'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return '#1890ff'
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return '#13c2c2'
  return '#999'
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const handlePreview = async (item: FileItem) => {
  console.log('[files.vue] handlePreview 点击文件:', {
    id: item.id,
    fileName: item.originalFileName || item.fileName,
    fileExtension: item.fileExtension,
    isImage: isImageFile(item.fileExtension),
    isPdf: isPdfFile(item.fileExtension),
    isH5,
    _blobUrl: (item as any)._blobUrl,
  })
  
  currentPreviewFile.value = item
  
  if (isImageFile(item.fileExtension)) {
    await openImagePreview(item)
  } else if (isPdfFile(item.fileExtension)) {
    await openPdfPreview(item)
  } else {
    showActionMenu.value = true
    currentActionFile.value = item
  }
}

const openImagePreview = async (item: FileItem & { _blobUrl?: string }) => {
  console.log('[files.vue] openImagePreview 开始, isH5:', isH5, 'item._blobUrl:', item._blobUrl)
  
  // 非 H5 环境：先下载文件（带 token），再本地预览
  if (!isH5) {
    console.log('[files.vue] openImagePreview 非H5路径: 使用uni.downloadFile')
    const token = uni.getStorageSync('token')
    uni.showLoading({ title: '加载中...' })
    uni.downloadFile({
      url: `${baseUrl}/api/v1/file/preview/${item.id}`,
      header: { Authorization: `Bearer ${token}` },
      success: (downloadRes: any) => {
        console.log('[files.vue] openImagePreview downloadFile success, statusCode:', downloadRes.statusCode, 'tempFilePath:', downloadRes.tempFilePath)
        uni.hideLoading()
        if (downloadRes.statusCode === 200) {
          uni.previewImage({
            urls: [downloadRes.tempFilePath],
            current: downloadRes.tempFilePath,
          })
        } else {
          console.error('[files.vue] openImagePreview downloadFile statusCode异常:', downloadRes.statusCode)
          uni.showToast({ title: '预览失败', icon: 'none' })
        }
      },
      fail: (err: any) => {
        console.error('[files.vue] openImagePreview downloadFile fail:', err)
        uni.hideLoading()
        uni.showToast({ title: '预览失败', icon: 'none' })
      },
    })
    return
  }

  // H5 环境使用 blob URL 预览
  console.log('[files.vue] openImagePreview H5路径: 使用fetch + blob')
  try {
    if (item._blobUrl) {
      console.log('[files.vue] openImagePreview 使用已有的_blobUrl:', item._blobUrl.substring(0, 50) + '...')
      currentPreviewUrl.value = item._blobUrl
      showImagePreview.value = true
    } else {
      console.log('[files.vue] openImagePreview _blobUrl不存在，重新fetch')
      uni.showLoading({ title: '加载中...' })
      const blob = await fetchFileBlob(item.id)
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        currentPreviewUrl.value = URL.createObjectURL(blob)
        console.log('[files.vue] openImagePreview 新建blobUrl:', currentPreviewUrl.value.substring(0, 50) + '...')
      }
      uni.hideLoading()
      showImagePreview.value = true
    }
  } catch (error: any) {
    console.error('[files.vue] openImagePreview 失败:', error?.message || error)
    uni.hideLoading()
    uni.showToast({ title: '预览失败', icon: 'none' })
  }
}

const closeImagePreview = () => {
  showImagePreview.value = false
  currentPreviewUrl.value = ''
  currentPreviewFile.value = null
}

const openPdfPreview = async (item: FileItem) => {
  // 非 H5 环境提示使用浏览器查看
  if (!isH5) {
    uni.showToast({ title: '请在浏览器中查看PDF', icon: 'none' })
    return
  }

  // H5 环境使用 blob URL 预览
  try {
    uni.showLoading({ title: '加载中...' })
    const blob = await fetchFileBlob(item.id)
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      pdfPreviewUrl.value = URL.createObjectURL(blob)
    }
    uni.hideLoading()
    showPdfPreview.value = true
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '预览失败', icon: 'none' })
  }
}

const closePdfPreview = () => {
  showPdfPreview.value = false
  if (pdfPreviewUrl.value && pdfPreviewUrl.value.startsWith('blob:')) {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(pdfPreviewUrl.value)
    }
  }
  pdfPreviewUrl.value = ''
  currentPreviewFile.value = null
}

const handleLongPress = (item: FileItem) => {
  showActionMenu.value = true
  currentActionFile.value = item
}

const handleActionPreview = () => {
  showActionMenu.value = false
  if (currentActionFile.value) {
    handlePreview(currentActionFile.value)
  }
}

const handleActionDownload = () => {
  showActionMenu.value = false
  if (currentActionFile.value) {
    downloadFile(currentActionFile.value)
  }
}

const handleActionRename = () => {
  showActionMenu.value = false
  if (currentActionFile.value) {
    renamingFile.value = currentActionFile.value
    const fullName = currentActionFile.value.originalFileName || currentActionFile.value.fileName || ''
    const lastDotIndex = fullName.lastIndexOf('.')
    if (lastDotIndex > 0) {
      newFileName.value = fullName.substring(0, lastDotIndex)
    } else {
      newFileName.value = fullName
    }
    showRenameModal.value = true
  }
}

const handleActionDelete = () => {
  showActionMenu.value = false
  if (currentActionFile.value) {
    handleDelete(currentActionFile.value)
  }
}

const handleDownloadFromPreview = async () => {
  if (currentPreviewFile.value) {
    await downloadFile(currentPreviewFile.value)
  }
}

const downloadFile = async (item: FileItem) => {
  const token = uni.getStorageSync('token')
  if (isH5) {
    try {
      uni.showLoading({ title: '下载中...' })
      const response = await fetch(`${baseUrl}/api/v1/file/download/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('下载失败')
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = item.originalFileName || item.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      uni.hideLoading()
      uni.showToast({ title: '下载成功', icon: 'success' })
    } catch (error) {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  } else {
    uni.downloadFile({
      url: `${baseUrl}/api/v1/file/download/${item.id}`,
      header: { Authorization: `Bearer ${token}` },
      success: (downloadRes: any) => {
        if (downloadRes.statusCode === 200) {
          uni.openDocument({
            filePath: downloadRes.tempFilePath,
            showMenu: true,
            success: () => uni.showToast({ title: '下载成功', icon: 'success' }),
            fail: () => uni.showToast({ title: '打开失败', icon: 'none' }),
          })
        }
      },
      fail: () => uni.showToast({ title: '下载失败', icon: 'none' }),
    })
  }
}

const handleDelete = (item: FileItem) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${item.originalFileName || item.fileName} 吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await deleteCaseFile(item.id)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            loadFiles(true)
            loadStatistics()
          } else {
            uni.showToast({ title: result.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const confirmRename = async () => {
  if (!renamingFile.value || !newFileName.value.trim()) {
    uni.showToast({ title: '请输入文件名', icon: 'none' })
    return
  }

  const fullName = renamingFile.value.originalFileName || renamingFile.value.fileName || ''
  const lastDotIndex = fullName.lastIndexOf('.')
  const extension = lastDotIndex > 0 ? fullName.substring(lastDotIndex) : ''
  const finalFileName = newFileName.value.trim() + extension

  if (finalFileName === fullName) {
    showRenameModal.value = false
    return
  }

  try {
    renameLoading.value = true
    const result = await renameCaseFile(renamingFile.value.id, finalFileName)
    if (result.code === 200) {
      uni.showToast({ title: '重命名成功', icon: 'success' })
      showRenameModal.value = false
      const idx = fileList.value.findIndex(f => f.id === renamingFile.value!.id)
      if (idx !== -1) {
        fileList.value[idx].originalFileName = finalFileName
        fileList.value[idx].fileName = finalFileName
      }
    } else {
      uni.showToast({ title: result.message || '重命名失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '重命名失败', icon: 'none' })
  } finally {
    renameLoading.value = false
  }
}

const clearSelection = () => {
  selectedIds.value = []
}

const handleBatchDownload = () => {
  uni.showToast({ title: '批量下载功能开发中', icon: 'none' })
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    uni.showToast({ title: '请选择要删除的文件', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedIds.value.length} 个文件吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await batchDeleteCaseFiles(selectedIds.value)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            selectedIds.value = []
            loadFiles(true)
            loadStatistics()
          } else {
            uni.showToast({ title: result.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const handleUpload = async () => {
  try {
    console.log('[cases-files] 开始选择文件...')
    const files = await chooseFilePlatform({
      count: 10,
      extension: ['.doc', '.docx', '.pdf', '.jpg', '.png', '.txt', '.xls', '.xlsx'],
    })
    const filePaths = files.map((f) => f.path).filter(Boolean)
    console.log('[cases-files] 文件选择成功, 文件数量:', filePaths.length, JSON.stringify(filePaths))
    if (filePaths.length > 0) {
      uploadFiles(filePaths)
    }
  } catch (e) {
    console.error('[cases-files] 选择文件失败:', e)
    uni.showToast({ title: '选择文件取消', icon: 'none' })
  }
}

const uploadFiles = (filePaths: string[]) => {
  const token = uni.getStorageSync('token')
  const uploadUrl = `${baseUrl}${FILE_API.UPLOAD}`
  console.log('[cases-files][upload] 开始上传, uploadUrl:', uploadUrl, '文件数量:', filePaths.length, 'token存在:', !!token)
  uni.showLoading({ title: '上传中...' })
  let uploadedCount = 0
  const totalFiles = filePaths.length

  filePaths.forEach((filePath, index) => {
    console.log(`[cases-files][upload] 正在上传第${index + 1}个文件:`, filePath)
    uni.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'file',
      formData: {
        bizType: 'case',
        bizId: caseId.value,
      },
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        console.log(`[cases-files][upload] 文件${index + 1}上传成功, statusCode:`, res.statusCode)
        uploadedCount++
        if (uploadedCount === totalFiles) {
          uni.hideLoading()
          uni.showToast({ title: '上传成功', icon: 'success' })
          loadFiles(true)
          loadStatistics()
        }
      },
      fail: (err) => {
        console.error(`[cases-files][upload] 文件${index + 1}上传失败:`, JSON.stringify(err))
        uni.showToast({ title: '上传失败', icon: 'none' })
      },
    })
  })
}
</script>

<style lang="scss" scoped>
.files-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.debug-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff3cd;
  padding: 8rpx 20rpx;
  border-bottom: 1rpx solid #ffc107;

  .debug-text {
    font-size: 20rpx;
    color: #856404;
    flex: 1;
    word-break: break-all;
  }

  .debug-close {
    font-size: 24rpx;
    color: #856404;
    padding: 4rpx 12rpx;
    margin-left: 10rpx;
  }
}

.header {
  background: #fff;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .count {
    font-size: 26rpx;
    color: #999;
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
      font-size: 32rpx;
      font-weight: bold;
      color: #0068E2;
      margin-bottom: 8rpx;
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .filter-item {
    padding: 12rpx 32rpx;
    border-radius: 8rpx;
    background: #f5f5f5;
    font-size: 26rpx;
    color: #666;

    &.active {
      background: #0068E2;
      color: #fff;
    }
  }
}

.file-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 10rpx;
  gap: 16rpx;

  .file-grid-item {
    width: calc(33.33% - 12rpx);
    aspect-ratio: 1;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

    .file-preview {
      width: 100%;
      height: 70%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      position: relative;

      &.image-preview {
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .loading-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;

          .loading-text {
            font-size: 24rpx;
            color: #999;
          }
        }
      }

      &.pdf-preview {
        flex-direction: column;

        .pdf-icon-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;

          .pdf-icon {
            font-size: 60rpx;
          }

          .pdf-label {
            font-size: 24rpx;
            color: #d32f2f;
            font-weight: bold;
            margin-top: 8rpx;
          }
        }

        .file-name-overlay {
          font-size: 20rpx;
          color: #666;
          margin-top: 12rpx;
          text-align: center;
          padding: 0 10rpx;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &.other-preview {
        flex-direction: column;

        .file-type-icon {
          font-size: 60rpx;
        }

        .file-type-text {
          font-size: 22rpx;
          color: #999;
          margin-top: 8rpx;
        }
      }
    }

    .file-info-overlay {
      padding: 12rpx;
      background: #fff;

      .file-name-text {
        display: block;
        font-size: 22rpx;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 4rpx;
      }

      .file-size-text {
        font-size: 20rpx;
        color: #999;
      }
    }

    .selected-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 104, 226, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;

      .selected-check {
        width: 50rpx;
        height: 50rpx;
        background: #0068E2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 28rpx;
      }
    }
  }

  .loading-more,
  .no-more {
    width: 100%;
    text-align: center;
    padding: 30rpx;
    color: #999;
    font-size: 24rpx;
  }

  .empty {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-icon {
      font-size: 100rpx;
      margin-bottom: 20rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 12rpx;
    }

    .empty-tip {
      font-size: 24rpx;
      color: #ccc;
    }
  }
}

.batch-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);

  .selected-count {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  .batch-btns {
    display: flex;
    gap: 20rpx;

    .batch-btn {
      flex: 1;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      background: #0068E2;
      color: #fff;
      font-size: 28rpx;

      &.danger {
        background: #ff4d4f;
      }
    }
  }
}

.upload-btn {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 120rpx;
  height: 120rpx;
  background: #0068E2;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 104, 226, 0.3);

  .icon {
    font-size: 48rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
  }

  .text {
    font-size: 20rpx;
    color: #fff;
    margin-top: 4rpx;
  }

  &:active {
    transform: scale(0.95);
  }
}

// 图片预览弹窗
.image-preview-modal,
.pdf-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
    background: rgba(0, 0, 0, 0.5);

    .preview-title {
      flex: 1;
      font-size: 28rpx;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 20rpx;
    }

    .close-btn {
      font-size: 40rpx;
      color: #fff;
      padding: 10rpx;
    }
  }

  .preview-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .preview-full-image {
      width: 100%;
      height: 100%;
    }

    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .pdf-loading {
      color: #fff;
      font-size: 28rpx;
    }
  }

  .preview-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 30rpx;
    background: rgba(0, 0, 0, 0.5);
    gap: 30rpx;

    .tip-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
    }

    .download-btn {
      font-size: 28rpx;
      color: #0068E2;
      background: #fff;
      padding: 16rpx 40rpx;
      border-radius: 8rpx;
    }
  }
}

// 操作菜单
.action-menu-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  .action-menu {
    width: 100%;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding-bottom: env(safe-area-inset-bottom);

    .menu-title {
      padding: 30rpx;
      text-align: center;
      border-bottom: 1rpx solid #f0f0f0;
      font-size: 28rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-item {
      padding: 30rpx;
      text-align: center;
      font-size: 30rpx;
      color: #333;
      border-bottom: 1rpx solid #f5f5f5;

      &:active {
        background: #f5f5f5;
      }

      &.danger {
        color: #ff4d4f;
      }

      &.cancel {
        margin-top: 16rpx;
        background: #f5f5f5;
        border-bottom: none;
      }
    }
  }
}

// 重命名弹窗
.rename-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1002;

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
    width: 600rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 40rpx;

    .modal-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin-bottom: 30rpx;
    }

    .modal-input {
      flex: 1;
      height: 80rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }

    .rename-original-name {
      margin-bottom: 20rpx;
      padding: 16rpx 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;

      .rename-label {
        font-size: 24rpx;
        color: #999;
      }

      .rename-value {
        font-size: 24rpx;
        color: #333;
        word-break: break-all;
      }
    }

    .rename-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .rename-extension {
        font-size: 28rpx;
        color: #999;
        flex-shrink: 0;
        padding-right: 8rpx;
      }
    }

    .modal-btns {
      display: flex;
      gap: 20rpx;
      margin-top: 30rpx;

      .modal-btn {
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

          &.disabled {
            background: #a0c4f1;
            pointer-events: none;
          }
        }
      }
    }
  }
}
</style>
