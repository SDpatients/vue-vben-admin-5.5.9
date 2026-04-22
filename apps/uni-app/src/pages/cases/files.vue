<template>
  <view class="files-container">
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

    <view class="file-list">
      <view
        v-for="item in fileList"
        :key="item.id"
        class="file-card"
        @click="handlePreview(item)"
      >
        <view class="file-checkbox" @click.stop="toggleSelect(item)">
          <view class="checkbox" :class="{ checked: selectedIds.includes(item.id) }">
            <text v-if="selectedIds.includes(item.id)">✓</text>
          </view>
        </view>
        <view class="file-icon">
          <text class="icon">{{ getFileIcon(item.fileExtension) }}</text>
        </view>
        <view class="file-info">
          <text class="file-name">{{ item.originalFileName || item.fileName }}</text>
          <view class="file-meta">
            <text class="file-size">{{ formatFileSize(item.fileSize) }}</text>
            <text class="file-time">{{ formatDateTime(item.uploadTime) }}</text>
          </view>
          <view class="file-status" v-if="item.status">
            <text :class="['status-tag', item.status.toLowerCase()]">{{ item.status === 'ACTIVE' ? '有效' : '无效' }}</text>
          </view>
        </view>
        <view class="file-actions">
          <text class="action-btn" @click.stop="handleDownload(item)">下载</text>
          <text class="action-btn rename" @click.stop="handleRename(item)">重命名</text>
          <text class="action-btn delete" @click.stop="handleDelete(item)">删除</text>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="!hasMore && fileList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-else-if="fileList.length === 0 && !loading">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无文件</text>
        <text class="empty-tip">点击右下角按钮上传文件</text>
      </view>
    </view>

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

    <view class="upload-btn" @click="handleUpload">
      <text class="icon">+</text>
      <text class="text">上传</text>
    </view>

    <view class="rename-modal" v-if="showRenameModal">
      <view class="modal-mask" @click="showRenameModal = false"></view>
      <view class="modal-content">
        <view class="modal-title">
          <text>重命名文件</text>
        </view>
        <input
          class="modal-input"
          v-model="newFileName"
          type="text"
          placeholder="请输入新文件名"
        />
        <view class="modal-btns">
          <view class="modal-btn cancel" @click="showRenameModal = false">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @click="confirmRename">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  getCaseFiles,
  deleteCaseFile,
  batchDeleteCaseFiles,
  renameCaseFile,
  updateCaseFileStatus,
  getCaseFileStatistics,
  type FileItem,
  type FileStatisticsResponse
} from '@/api/case'
import { getBaseUrl } from '@/config'
import dayjs from 'dayjs'

console.log('=== files.vue loaded ===')

const caseId = ref('')
const fileList = ref<FileItem[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const statusFilter = ref('')
const statistics = ref<FileStatisticsResponse['data'] | null>(null)
const selectedIds = ref<number[]>([])
const showRenameModal = ref(false)
const newFileName = ref('')
const renamingFile = ref<FileItem | null>(null)

const isH5 = typeof window !== 'undefined' && document !== undefined

watch(statusFilter, () => {
  console.log('[Watch] statusFilter changed:', statusFilter.value)
  loadFiles(true)
})

const handleFileChange = (e: Event) => {
  console.log('[Event] handleFileChange triggered')
  const target = e.target as HTMLInputElement
  const files = target.files
  console.log('[Event] Selected files:', files?.length || 0)
  if (!files || files.length === 0) return

  uploadFilesH5(Array.from(files))
  target.value = ''
}

const uploadFilesH5 = async (files: File[]) => {
  console.log('[Upload] uploadFilesH5 called, files count:', files.length)
  uni.showLoading({ title: '上传中...' })

  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
  console.log('[Upload] baseUrl:', baseUrl)
  console.log('[Upload] token exists:', !!token)

  let uploadedCount = 0
  const totalFiles = files.length
  const results: any[] = []

  for (const file of files) {
    console.log('[Upload] Uploading file:', file.name, 'size:', file.size)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bizType', 'case')
    formData.append('bizId', caseId.value)

    try {
      const response = await fetch(`${baseUrl}/api/v1/file/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()
      console.log('[Upload] Upload response:', result)
      results.push(result)

      uploadedCount++
      if (uploadedCount === totalFiles) {
        uni.hideLoading()
        const successCount = results.filter(r => r.code === 200).length
        console.log('[Upload] Upload completed, success:', successCount, 'total:', totalFiles)
        uni.showToast({ title: `成功上传 ${successCount} 个文件`, icon: 'success' })
        loadFiles(true)
        loadStatistics()
      }
    } catch (error) {
      console.error('[Upload] Upload error:', error)
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
  }
}

onMounted(() => {
  console.log('=== onMounted ===')
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.id || ''
  console.log('[onMounted] caseId:', caseId.value)

  if (caseId.value) {
    loadFiles()
    loadStatistics()
  }
})

const loadFiles = async (isRefresh = false) => {
  console.log('[loadFiles] called, isRefresh:', isRefresh, 'page:', page.value)
  if (loading.value) {
    console.log('[loadFiles] Already loading, skip')
    return
  }
  loading.value = true

  try {
    const params: any = {
      pageNum: isRefresh ? 1 : page.value,
      pageSize,
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    console.log('[loadFiles] Request params:', params)
    console.log('[loadFiles] caseId:', caseId.value)

    const res = await getCaseFiles(Number(caseId.value), params)
    console.log('[loadFiles] Full Response:', JSON.stringify(res, null, 2))
    console.log('[loadFiles] res.data:', res.data)
    console.log('[loadFiles] res.data?.list:', res.data?.list)

    const rawList = res.data?.list || []
    console.log('[loadFiles] rawList:', rawList)
    console.log('[loadFiles] rawList type:', typeof rawList, 'isArray:', Array.isArray(rawList))

    const listData = Array.isArray(rawList) ? rawList.map(item => ({ ...item })) : []
    console.log('[loadFiles] listData:', listData)
    console.log('[loadFiles] listData count:', listData.length)

    if (isRefresh) {
      fileList.value = []
      await nextTick()
      fileList.value = listData
      page.value = 1
    } else {
      fileList.value = [...fileList.value, ...listData]
    }

    total.value = res.data?.total || 0
    hasMore.value = fileList.value.length < (res.data?.total || 0)
    console.log('[loadFiles] fileList.value after update:', fileList.value)
    console.log('[loadFiles] fileList.value.length:', fileList.value.length)
    console.log('[loadFiles] total:', total.value, 'hasMore:', hasMore.value)
  } catch (error) {
    console.error('[loadFiles] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
    console.log('[loadFiles] finished, fileList.value:', fileList.value)
  }
}

const loadStatistics = async () => {
  console.log('[loadStatistics] called')
  try {
    const res = await getCaseFileStatistics(Number(caseId.value))
    console.log('[loadStatistics] Response:', res)
    if (res.data) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('[loadStatistics] Error:', error)
  }
}

const onRefresh = () => {
  console.log('[onRefresh] triggered')
  refreshing.value = true
  loadFiles(true)
  loadStatistics()
}

const onLoadMore = () => {
  console.log('[onLoadMore] triggered, hasMore:', hasMore.value, 'loading:', loading.value)
  if (!hasMore.value || loading.value) return
  page.value++
  loadFiles()
}

const getFileIcon = (extension?: string) => {
  if (!extension) return '📄'
  const ext = extension.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return '🖼️'
  if (['pdf'].includes(ext)) return '📕'
  if (['doc', 'docx'].includes(ext)) return '📘'
  if (['xls', 'xlsx'].includes(ext)) return '📗'
  if (['ppt', 'pptx'].includes(ext)) return '📙'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return '🎬'
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return '🎵'
  return '📄'
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
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const toggleSelect = (item: FileItem) => {
  console.log('[toggleSelect] item:', item.id)
  const index = selectedIds.value.indexOf(item.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(item.id)
  }
  console.log('[toggleSelect] selectedIds:', selectedIds.value)
}

const clearSelection = () => {
  console.log('[clearSelection]')
  selectedIds.value = []
}

const handlePreview = async (item: FileItem) => {
  console.log('[handlePreview] item:', item)
  const ext = item.fileExtension?.toLowerCase()
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
    if (isH5) {
      try {
        uni.showLoading({ title: '加载中...' })
        const response = await fetch(`${baseUrl}/api/v1/file/preview/${item.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error('加载失败')
        }
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        uni.hideLoading()
        uni.previewImage({
          urls: [blobUrl],
          current: blobUrl,
        })
        console.log('[handlePreview] blobUrl:', blobUrl)
      } catch (error) {
        uni.hideLoading()
        console.error('[handlePreview] error:', error)
        uni.showToast({ title: '预览失败', icon: 'none' })
      }
    } else {
      uni.previewImage({
        urls: [`${baseUrl}/api/v1/file/preview/${item.id}`],
        current: `${baseUrl}/api/v1/file/preview/${item.id}`,
      })
    }
  } else if (['pdf'].includes(ext || '')) {
    if (isH5) {
      try {
        uni.showLoading({ title: '加载中...' })
        const response = await fetch(`${baseUrl}/api/v1/file/preview/${item.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error('加载失败')
        }
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        uni.hideLoading()
        window.open(blobUrl, '_blank')
        console.log('[handlePreview] PDF blobUrl:', blobUrl)
      } catch (error) {
        uni.hideLoading()
        console.error('[handlePreview] PDF error:', error)
        uni.showToast({ title: '预览失败', icon: 'none' })
      }
    } else {
      uni.showToast({ title: '请在浏览器中查看', icon: 'none' })
    }
  } else {
    uni.showToast({ title: '暂不支持预览此类型文件', icon: 'none' })
  }
}

const handleDownload = async (item: FileItem) => {
  console.log('[handleDownload] item:', item)
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
  const fileUrl = `${baseUrl}/api/v1/file/download/${item.id}`
  console.log('[handleDownload] fileUrl:', fileUrl)

  uni.showModal({
    title: '确认下载',
    content: `确定要下载 ${item.originalFileName || item.fileName} 吗？`,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        console.log('[handleDownload] User confirmed download')
        if (isH5) {
          try {
            uni.showLoading({ title: '下载中...' })
            const response = await fetch(fileUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            if (!response.ok) {
              throw new Error('下载失败')
            }
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
            console.error('[handleDownload] error:', error)
            uni.showToast({ title: '下载失败', icon: 'none' })
          }
        } else {
          uni.downloadFile({
            url: `${baseUrl}/api/v1/file/download/${item.id}`,
            header: {
              Authorization: `Bearer ${token}`
            },
            success: (downloadRes: any) => {
              console.log('[handleDownload] downloadFile success:', downloadRes)
              if (downloadRes.statusCode === 200) {
                uni.saveFile({
                  tempFilePath: downloadRes.tempFilePath,
                  success: () => {
                    uni.showToast({ title: '下载成功', icon: 'success' })
                  },
                  fail: () => {
                    uni.showToast({ title: '保存失败', icon: 'none' })
                  },
                })
              }
            },
            fail: (err: any) => {
              console.error('[handleDownload] downloadFile fail:', err)
              uni.showToast({ title: '下载失败', icon: 'none' })
            },
          })
        }
      }
    },
  })
}

const handleRename = (item: FileItem) => {
  console.log('[handleRename] item:', item)
  renamingFile.value = item
  newFileName.value = item.originalFileName || item.fileName
  showRenameModal.value = true
}

const confirmRename = async () => {
  console.log('[confirmRename] newFileName:', newFileName.value)
  if (!renamingFile.value || !newFileName.value.trim()) {
    uni.showToast({ title: '请输入文件名', icon: 'none' })
    return
  }

  try {
    const result = await renameCaseFile(renamingFile.value.id, newFileName.value.trim())
    console.log('[confirmRename] result:', result)
    if (result.code === 200) {
      uni.showToast({ title: '重命名成功', icon: 'success' })
      showRenameModal.value = false
      loadFiles(true)
    } else {
      uni.showToast({ title: result.message || '重命名失败', icon: 'none' })
    }
  } catch (error) {
    console.error('[confirmRename] error:', error)
    uni.showToast({ title: '重命名失败', icon: 'none' })
  }
}

const handleDelete = (item: FileItem) => {
  console.log('[handleDelete] item:', item)
  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${item.originalFileName || item.fileName} 吗？`,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        console.log('[handleDelete] User confirmed delete')
        try {
          const result = await deleteCaseFile(item.id)
          console.log('[handleDelete] result:', result)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            loadFiles(true)
            loadStatistics()
          } else {
            uni.showToast({ title: result.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          console.error('[handleDelete] error:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const handleBatchDownload = () => {
  console.log('[handleBatchDownload] selectedIds:', selectedIds.value)
  uni.showToast({ title: '批量下载功能开发中', icon: 'none' })
}

const handleBatchDelete = () => {
  console.log('[handleBatchDelete] selectedIds:', selectedIds.value)
  if (selectedIds.value.length === 0) {
    uni.showToast({ title: '请选择要删除的文件', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedIds.value.length} 个文件吗？`,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        console.log('[handleBatchDelete] User confirmed')
        try {
          const result = await batchDeleteCaseFiles(selectedIds.value)
          console.log('[handleBatchDelete] result:', result)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            selectedIds.value = []
            loadFiles(true)
            loadStatistics()
          } else {
            uni.showToast({ title: result.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          console.error('[handleBatchDelete] error:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const handleUpload = () => {
  console.log('[handleUpload] triggered, isH5:', isH5)
  
  if (isH5) {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.style.display = 'none'
    input.onchange = (e: Event) => {
      handleFileChange(e)
      document.body.removeChild(input)
    }
    document.body.appendChild(input)
    input.click()
    console.log('[handleUpload] H5 input created and clicked')
    return
  }

  uni.chooseFile({
    count: 10,
    success: (res: any) => {
      console.log('[handleUpload] choose success:', res)
      uploadFiles(res.tempFilePaths)
    },
    fail: () => {
      uni.showToast({ title: '选择文件取消', icon: 'none' })
    },
  })
}

const uploadFiles = (filePaths: string[]) => {
  console.log('[uploadFiles] filePaths:', filePaths)
  uni.showLoading({ title: '上传中...' })

  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')

  let uploadedCount = 0
  const totalFiles = filePaths.length

  filePaths.forEach((filePath) => {
    uni.uploadFile({
      url: `${baseUrl}/api/v1/file/upload`,
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
        console.log('[uploadFiles] upload success:', res)
        uploadedCount++
        if (uploadedCount === totalFiles) {
          uni.hideLoading()
          uni.showToast({ title: '上传成功', icon: 'success' })
          loadFiles(true)
          loadStatistics()
        }
      },
      fail: (err) => {
        console.error('[uploadFiles] upload fail:', err)
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

.file-list {
  height: calc(100vh - 320rpx);
  padding: 0 20rpx;

  .file-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

    .file-checkbox {
      margin-right: 16rpx;

      .checkbox {
        width: 40rpx;
        height: 40rpx;
        border: 2rpx solid #ddd;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        color: #fff;

        &.checked {
          background: #0068E2;
          border-color: #0068E2;
        }
      }
    }

    .file-icon {
      width: 80rpx;
      height: 80rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;

      .icon {
        font-size: 40rpx;
      }
    }

    .file-info {
      flex: 1;
      overflow: hidden;

      .file-name {
        display: block;
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 8rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-meta {
        display: flex;
        gap: 20rpx;

        .file-size,
        .file-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .file-status {
        margin-top: 8rpx;

        .status-tag {
          font-size: 22rpx;
          padding: 4rpx 16rpx;
          border-radius: 8rpx;

          &.active {
            background: #e8f5e9;
            color: #4caf50;
          }

          &.inactive {
            background: #ffebee;
            color: #f44336;
          }
        }
      }
    }

    .file-actions {
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .action-btn {
        font-size: 24rpx;
        color: #0068E2;
        padding: 8rpx 16rpx;
        border-radius: 8rpx;
        background: #f0f4ff;
        text-align: center;

        &.rename {
          color: #ff9800;
          background: #fff3e0;
        }

        &.delete {
          color: #ff4d4f;
          background: #fff1f0;
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

.rename-modal {
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
      width: 100%;
      height: 80rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      box-sizing: border-box;
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
        }
      }
    }
  }
}
</style>
