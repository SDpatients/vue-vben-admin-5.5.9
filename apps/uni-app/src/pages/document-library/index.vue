<template>
  <view class="document-library-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-box">
        <view class="search-icon-wrapper">
          <text class="search-icon-text">搜</text>
        </view>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索文档名称"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">取消</text>
      </view>
    </view>

    <!-- 文件夹路径导航 -->
    <view v-if="folderPath.length > 0" class="breadcrumb-section">
      <scroll-view scroll-x class="breadcrumb-scroll">
        <view class="breadcrumb-list">
          <text class="breadcrumb-item" @click="goToRoot">全部</text>
          <text v-for="(item, index) in folderPath" :key="item.id" class="breadcrumb-item-wrapper">
            <text class="breadcrumb-separator">/</text>
            <text
              class="breadcrumb-item"
              :class="{ active: index === folderPath.length - 1 }"
              @click="goToFolder(item.id, index)"
            >{{ item.folderName }}</text>
          </text>
        </view>
      </scroll-view>
    </view>

    <!-- 标签栏 -->
    <view class="tab-section">
      <scroll-view scroll-x class="tab-scroll">
        <view class="tab-list">
          <view
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-item"
            :class="{ active: currentTab === tab.value }"
            @click="switchTab(tab.value)"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选栏 -->
    <view v-if="!searchKeyword && currentTab === 'all'" class="filter-section">
      <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
        <view class="filter-list">
          <view
            v-for="filter in documentTypeFilters"
            :key="filter.value"
            class="filter-item"
            :class="{ active: currentTypeFilter === filter.value }"
            @click="handleTypeFilterChange(filter.value)"
          >
            <text>{{ filter.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 文件夹列表 -->
    <view v-if="currentTab === 'all' && !searchKeyword && folderList.length > 0" class="folder-section">
      <view class="section-header">
        <text class="section-title">文件夹</text>
        <text class="section-action" @click="showFolderManage">管理</text>
      </view>
      <view class="folder-grid">
        <view
          v-for="folder in folderList"
          :key="folder.id"
          class="folder-item"
          @click="enterFolder(folder.id)"
        >
          <view class="folder-icon" :style="{ backgroundColor: folder.color || '#1890ff' }">
            <text class="folder-icon-text">文件夹</text>
          </view>
          <view class="folder-info">
            <text class="folder-name">{{ folder.folderName }}</text>
            <text class="folder-count">{{ folder.documentCount || 0 }}个文件</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 文档列表 -->
    <view class="document-section">
      <view class="section-header">
        <text class="section-title">{{ searchKeyword ? '搜索结果' : '文档' }}</text>
        <text class="document-count">共{{ total }}个</text>
      </view>

      <scroll-view
        scroll-y
        class="document-scroll"
        :style="{ height: scrollHeight + 'px' }"
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="documentList.length === 0 && !loading" class="empty-state">
          <view class="empty-icon-wrapper">
            <text class="empty-icon-text">空</text>
          </view>
          <text class="empty-text">暂无文档</text>
          <text class="empty-subtext">点击下方按钮上传文档</text>
        </view>

        <view v-for="doc in documentList" :key="doc.id" class="document-item" @click="goToDetail(doc.id)">
          <view class="doc-icon" :class="getFileIconClass(doc.fileExtension, doc.documentType)">
            <text class="doc-icon-text">{{ getFileTypeLabel(doc.fileExtension) }}</text>
          </view>
          <view class="doc-info">
            <view class="doc-header">
              <text class="doc-name">{{ doc.documentName }}</text>
              <view v-if="doc.isLocked" class="lock-badge">已锁定</view>
            </view>
            <view class="doc-meta">
              <text class="doc-type-tag" :class="getTypeTagClass(doc.documentType)">{{ documentTypeMap[doc.documentType] || '其他' }}</text>
              <text class="doc-size">{{ formatFileSize(doc.fileSize) }}</text>
              <text class="doc-time">{{ formatTime(doc.createTime) }}</text>
            </view>
            <view v-if="doc.tags" class="doc-tags">
              <text v-for="tag in doc.tags.split(',')" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
          <view class="doc-actions" @click.stop>
            <text class="action-more" @click="showDocActions(doc)">更多</text>
          </view>
        </view>

        <view v-if="loadingMore" class="loading-more">
          <text class="loading-text">加载中...</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn primary" @click="showUploadOptions">
        <text class="btn-text">上传</text>
      </view>
      <view class="action-btn" @click="goToFavorites">
        <text class="btn-text">收藏</text>
      </view>
      <view class="action-btn" @click="showSortOptions">
        <text class="btn-text">统计</text>
      </view>
    </view>

    <!-- 文档操作弹窗 -->
    <uni-popup ref="docActionPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-sheet-header">
          <text class="action-sheet-title">{{ currentDoc?.documentName }}</text>
        </view>
        <view class="action-list">
          <view class="action-item-popup" @click="handleDownload">
            <text class="action-text">下载</text>
          </view>
          <view class="action-item-popup" @click="handlePreview">
            <text class="action-text">预览</text>
          </view>
          <view class="action-item-popup" @click="handleToggleFavorite">
            <text class="action-text">{{ currentDoc?.isFavorited ? '取消收藏' : '收藏' }}</text>
          </view>
          <view class="action-item-popup" @click="handleShare">
            <text class="action-text">分享</text>
          </view>
          <view class="action-item-popup" @click="handleEdit">
            <text class="action-text">编辑</text>
          </view>
          <view class="action-item-popup" @click="handleMove">
            <text class="action-text">移动</text>
          </view>
          <view class="action-item-popup delete" @click="handleDelete">
            <text class="action-text">删除</text>
          </view>
        </view>
        <view class="action-sheet-cancel" @click="closeDocActions">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>

    <!-- 上传选项弹窗 -->
    <uni-popup ref="uploadPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-sheet-header">
          <text class="action-sheet-title">上传文档</text>
        </view>
        <view class="action-list">
          <view class="action-item-popup" @click="chooseFile">
            <text class="action-text">从手机选择文件</text>
          </view>
          <view class="action-item-popup" @click="createFolder">
            <text class="action-text">新建文件夹</text>
          </view>
        </view>
        <view class="action-sheet-cancel" @click="closeUploadOptions">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getDocumentList,
  getDocumentsByFolder,
  searchDocuments,
  getMyDocuments,
  getRecentDocuments,
  getPopularDocuments,
  deleteDocument,
  addFavorite,
  removeFavorite,
  saveDocumentWithAuth,
  getRootFolders,
  getFolderChildren,
  getFolderPath,
  createFolder as createFolderApi,
  uploadDocument,
  type DocumentItem,
  type FolderItem,
} from '@/api/document-library'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '我的', value: 'my' },
  { label: '最近', value: 'recent' },
  { label: '热门', value: 'popular' },
]

const documentTypeMap: Record<string, string> = {
  WORD: 'Word',
  EXCEL: 'Excel',
  PDF: 'PDF',
  OTHER: '其他',
  CONTRACT: '合同',
  REPORT: '报告',
  LEGAL: '法律',
  FINANCIAL: '财务',
}

const documentTypeFilters = [
  { label: '全部', value: '' },
  { label: 'Word', value: 'WORD' },
  { label: 'Excel', value: 'EXCEL' },
  { label: 'PDF', value: 'PDF' },
  { label: '其他', value: 'OTHER' },
]

const currentTab = ref('all')
const currentTypeFilter = ref('')
const searchKeyword = ref('')
const documentList = ref<DocumentItem[]>([])
const folderList = ref<FolderItem[]>([])
const folderPath = ref<Array<{ id: number; folderName: string }>>([])
const currentFolderId = ref<number>()
const page = ref(1)
const size = 10
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const scrollHeight = ref(600)
const docActionPopup = ref()
const uploadPopup = ref()
const currentDoc = ref<DocumentItem>()

onMounted(() => {
  loadData()
  calculateScrollHeight()
  uni.$on('refresh-document-list', () => loadData())
  uni.$on('enter-folder', (folderId: number) => {
    currentFolderId.value = folderId
    currentTab.value = 'all'
    searchKeyword.value = ''
    currentTypeFilter.value = ''
    page.value = 1
    loadData()
  })
})

onUnmounted(() => {
  uni.$off('refresh-document-list')
  uni.$off('enter-folder')
})

onShow(() => {
  loadData()
})

const calculateScrollHeight = () => {
  const systemInfo = uni.getSystemInfoSync()
  scrollHeight.value = systemInfo.windowHeight - 200
}

const loadData = async () => {
  page.value = 1
  await Promise.all([loadDocuments(), loadFolders()])
}

const loadDocuments = async () => {
  loading.value = true
  try {
    let res
    if (searchKeyword.value) {
      res = await searchDocuments(searchKeyword.value, page.value, size)
    } else if (currentFolderId.value) {
      res = await getDocumentsByFolder(currentFolderId.value, page.value, size)
    } else {
      switch (currentTab.value) {
        case 'my':
          res = await getMyDocuments(page.value, size)
          break
        case 'recent':
          res = await getRecentDocuments(page.value, size)
          break
        case 'popular':
          res = await getPopularDocuments(page.value, size)
          break
        default:
          // 使用 getDocumentList 进行筛选查询
          const params: any = {
            page: page.value,
            size,
            sortBy: 'createTime',
            sortOrder: 'desc',
          }
          if (currentTypeFilter.value) {
            params.documentType = currentTypeFilter.value
          }
          res = await getDocumentList(params)
      }
    }

    if (res.code === 200) {
      const docs = res.data.documents || []
      const totalCount = res.data.total || 0
      if (page.value === 1) {
        documentList.value = docs
      } else {
        documentList.value = [...documentList.value, ...docs]
      }
      total.value = totalCount
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadFolders = async () => {
  if (currentFolderId.value) {
    try {
      const [childrenRes, pathRes] = await Promise.all([
        getFolderChildren(currentFolderId.value),
        getFolderPath(currentFolderId.value),
      ])
      if (childrenRes.code === 200) {
        folderList.value = childrenRes.data || []
      }
      if (pathRes.code === 200) {
        folderPath.value = (pathRes.data || []).map((item: any) => ({
          id: item.id,
          folderName: item.name || item.folderName,
        }))
      }
    } catch (error) {
      // silent fail
    }
  } else {
    try {
      const res = await getRootFolders()
      if (res.code === 200) {
        folderList.value = res.data.folders || []
      }
      folderPath.value = []
    } catch (error) {
      // silent fail
    }
  }
}

const switchTab = (tab: string) => {
  currentTab.value = tab
  currentFolderId.value = undefined
  searchKeyword.value = ''
  currentTypeFilter.value = ''
  page.value = 1
  loadData()
}

const handleTypeFilterChange = (type: string) => {
  currentTypeFilter.value = type
  page.value = 1
  loadDocuments()
}

const handleSearch = () => {
  page.value = 1
  loadDocuments()
}

const clearSearch = () => {
  searchKeyword.value = ''
  page.value = 1
  loadDocuments()
}

const enterFolder = (folderId: number) => {
  currentFolderId.value = folderId
  page.value = 1
  loadData()
}

const goToRoot = () => {
  currentFolderId.value = undefined
  folderPath.value = []
  page.value = 1
  loadData()
}

const goToFolder = (folderId: number, index: number) => {
  if (index === folderPath.value.length - 1) return
  currentFolderId.value = folderId
  page.value = 1
  loadData()
}

const loadMore = () => {
  if (documentList.value.length >= total.value) return
  page.value++
  loadingMore.value = true
  loadDocuments().finally(() => {
    loadingMore.value = false
  })
}

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  loadData().finally(() => {
    refreshing.value = false
  })
}

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/document-library/detail?id=${id}` })
}

const goToFavorites = () => {
  uni.navigateTo({ url: '/pages/document-library/favorites' })
}

const showDocActions = (doc: DocumentItem) => {
  currentDoc.value = doc
  docActionPopup.value?.open()
}

const closeDocActions = () => {
  docActionPopup.value?.close()
}

const showUploadOptions = () => {
  uploadPopup.value?.open()
}

const closeUploadOptions = () => {
  uploadPopup.value?.close()
}

const chooseFile = () => {
  closeUploadOptions()

  // #ifdef H5
  const input = document.createElement('input')
  input.type = 'file'
  input.style.display = 'none'
  input.accept = '.doc,.docx,.xls,.xlsx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar'
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      const filePath = URL.createObjectURL(file)
      handleUpload(filePath, file.name, file)
    }
    document.body.removeChild(input)
  }
  document.body.appendChild(input)
  input.click()
  // #endif

  // #ifndef H5
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    success: (res: UniApp.ChooseMessageFileSuccessCallbackResult) => {
      const file = res.tempFiles[0]
      handleUpload(file.path, file.name)
    },
    fail: () => {
      uni.showToast({ title: '选择文件失败', icon: 'none' })
    },
  })
  // #endif
}

const handleUpload = async (filePath: string, fileName: string, fileObj?: File) => {
  uni.showLoading({ title: '上传中...' })
  try {
    const res = await uploadDocument(filePath, {
      folderId: currentFolderId.value,
      documentName: fileName,
    }, fileObj)
    if (res.code === 200) {
      uni.showToast({ title: '上传成功', icon: 'success' })
      loadData()
    }
  } catch (error: any) {
    uni.showToast({ title: error?.message || '上传失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const createFolder = () => {
  closeUploadOptions()
  uni.showModal({
    title: '新建文件夹',
    editable: true,
    placeholderText: '请输入文件夹名称',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm && res.content) {
        try {
          const result = await createFolderApi({
            folderName: res.content,
            parentId: currentFolderId.value,
          })
          if (result.code === 200) {
            uni.showToast({ title: '创建成功', icon: 'success' })
            loadFolders()
          }
        } catch (error) {
          uni.showToast({ title: '创建失败', icon: 'none' })
        }
      }
    },
  })
}

const handleDownload = async () => {
  if (!currentDoc.value) return

  uni.showLoading({ title: '下载中...' })

  try {
    const savedFilePath = await saveDocumentWithAuth(currentDoc.value.id)
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
  closeDocActions()
}

const handlePreview = () => {
  if (!currentDoc.value) return
  uni.navigateTo({
    url: `/pages/document-library/preview?id=${currentDoc.value.id}&name=${encodeURIComponent(currentDoc.value.documentName)}&ext=${currentDoc.value.fileExtension || ''}`,
  })
  closeDocActions()
}

const handleToggleFavorite = async () => {
  if (!currentDoc.value) return
  try {
    if (currentDoc.value.isFavorited) {
      await removeFavorite(currentDoc.value.id)
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      await addFavorite(currentDoc.value.id)
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
    currentDoc.value.isFavorited = !currentDoc.value.isFavorited
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
  closeDocActions()
}

const handleShare = () => {
  if (!currentDoc.value) return
  uni.navigateTo({
    url: `/pages/document-library/share?documentId=${currentDoc.value.id}&documentName=${encodeURIComponent(currentDoc.value.documentName)}`,
  })
  closeDocActions()
}

const handleEdit = () => {
  if (!currentDoc.value) return
  uni.navigateTo({
    url: `/pages/document-library/form?id=${currentDoc.value.id}&mode=edit`,
  })
  closeDocActions()
}

const handleMove = () => {
  if (!currentDoc.value) return
  uni.showToast({ title: '移动功能开发中', icon: 'none' })
  closeDocActions()
}

const handleDelete = () => {
  if (!currentDoc.value) return
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${currentDoc.value.documentName}"吗？`,
    confirmColor: '#ff4d4f',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          await deleteDocument(currentDoc.value!.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadData()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
  closeDocActions()
}

const showFolderManage = () => {
  uni.navigateTo({ url: '/pages/document-library/folder' })
}

const showSortOptions = () => {
  uni.navigateTo({ url: '/pages/document-library/statistics' })
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
    txt: '文本',
    jpg: '图片',
    jpeg: '图片',
    png: '图片',
    gif: '图片',
    zip: '压缩',
    rar: '压缩',
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

const getTypeTagClass = (docType?: string) => {
  const classMap: Record<string, string> = {
    WORD: 'tag-word',
    EXCEL: 'tag-excel',
    PDF: 'tag-pdf',
    OTHER: 'tag-other',
    CONTRACT: 'tag-contract',
    REPORT: 'tag-report',
    LEGAL: 'tag-legal',
    FINANCIAL: 'tag-financial',
  }
  return classMap[docType || ''] || 'tag-other'
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
.document-library-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.search-section {
  padding: 20rpx;
  background: #fff;

  .search-box {
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 8rpx;
    padding: 16rpx 24rpx;

    .search-icon-wrapper {
      width: 48rpx;
      height: 48rpx;
      background: #1890ff;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;

      .search-icon-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: 500;
      }
    }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .clear-btn {
      font-size: 26rpx;
      color: #1890ff;
      padding: 8rpx 16rpx;
    }
  }
}

.breadcrumb-section {
  background: #fff;
  padding: 0 20rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .breadcrumb-scroll {
    white-space: nowrap;
  }

  .breadcrumb-list {
    display: inline-flex;
    align-items: center;
  }

  .breadcrumb-item {
    font-size: 26rpx;
    color: #666;

    &.active {
      color: #1890ff;
      font-weight: 500;
    }
  }

  .breadcrumb-separator {
    font-size: 26rpx;
    color: #999;
    margin: 0 8rpx;
  }

  .breadcrumb-item-wrapper {
    display: inline-flex;
    align-items: center;
  }
}

.tab-section {
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

.filter-section {
  background: #fff;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .filter-scroll {
    white-space: nowrap;
  }

  .filter-list {
    display: inline-flex;
    gap: 16rpx;
  }

  .filter-item {
    padding: 10rpx 24rpx;
    border-radius: 32rpx;
    background: #f5f7fa;
    font-size: 24rpx;
    color: #666;
    transition: all 0.2s;

    &.active {
      background: #1890ff;
      color: #fff;
    }
  }
}

.folder-section {
  background: #fff;
  padding: 20rpx;
  margin-bottom: 16rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .section-action {
      font-size: 26rpx;
      color: #1890ff;
    }
  }

  .folder-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
  }

  .folder-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    background: #f5f7fa;
    border-radius: 8rpx;
    padding: 20rpx;

    &:active {
      background: #e6f2ff;
    }

    .folder-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .folder-icon-text {
        font-size: 20rpx;
        color: #fff;
        font-weight: 500;
      }
    }

    .folder-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .folder-name {
        font-size: 28rpx;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .folder-count {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.document-section {
  background: #fff;
  padding: 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .document-count {
      font-size: 24rpx;
      color: #999;
    }
  }

  .document-scroll {
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 40rpx;

      .empty-icon-wrapper {
        width: 120rpx;
        height: 120rpx;
        background: #f5f7fa;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20rpx;

        .empty-icon-text {
          font-size: 32rpx;
          color: #999;
          font-weight: 500;
        }
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

    .document-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:active {
        background: #f5f7fa;
      }

      .doc-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.type-pdf {
          background: #fff1f0;
          .doc-icon-text { color: #f5222d; }
        }

        &.type-word {
          background: #e6f7ff;
          .doc-icon-text { color: #1890ff; }
        }

        &.type-excel {
          background: #f6ffed;
          .doc-icon-text { color: #52c41a; }
        }

        &.type-ppt {
          background: #fff7e6;
          .doc-icon-text { color: #fa8c16; }
        }

        &.type-img {
          background: #f9f0ff;
          .doc-icon-text { color: #722ed1; }
        }

        &.type-other {
          background: #f5f7fa;
          .doc-icon-text { color: #666; }
        }

        .doc-icon-text {
          font-size: 22rpx;
          font-weight: 500;
        }
      }

      .doc-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .doc-header {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .doc-name {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .lock-badge {
            font-size: 20rpx;
            padding: 2rpx 8rpx;
            background: #fff7e6;
            color: #fa8c16;
            border-radius: 4rpx;
            flex-shrink: 0;
          }
        }

        .doc-meta {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .doc-type-tag {
            font-size: 20rpx;
            padding: 2rpx 10rpx;
            border-radius: 4rpx;

            &.tag-word { background: #e6f7ff; color: #1890ff; }
            &.tag-excel { background: #f6ffed; color: #52c41a; }
            &.tag-pdf { background: #fff1f0; color: #f5222d; }
            &.tag-contract { background: #e6f7ff; color: #1890ff; }
            &.tag-report { background: #f6ffed; color: #52c41a; }
            &.tag-legal { background: #fff7e6; color: #fa8c16; }
            &.tag-financial { background: #f9f0ff; color: #722ed1; }
            &.tag-other { background: #f5f5f5; color: #666; }
          }

          .doc-size {
            font-size: 22rpx;
            color: #999;
          }

          .doc-time {
            font-size: 22rpx;
            color: #999;
          }
        }

        .doc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8rpx;

          .tag {
            font-size: 20rpx;
            padding: 2rpx 10rpx;
            border-radius: 4rpx;
            background: #f5f5f5;
            color: #666;
          }
        }
      }

      .doc-actions {
        .action-more {
          font-size: 26rpx;
          color: #1890ff;
          padding: 12rpx;
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

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 16rpx 0;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));

  .action-btn {
    padding: 16rpx 48rpx;
    border-radius: 8rpx;
    background: #f5f7fa;

    &.primary {
      background: #1890ff;
      .btn-text { color: #fff; }
    }

    .btn-text {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.action-sheet {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;

  .action-sheet-header {
    text-align: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .action-sheet-title {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .action-list {
    .action-item-popup {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:active {
        background: #f5f7fa;
      }

      &.delete {
        .action-text {
          color: #ff4d4f;
        }
      }

      .action-text {
        font-size: 30rpx;
        color: #333;
      }
    }
  }

  .action-sheet-cancel {
    text-align: center;
    padding: 28rpx;
    border-top: 16rpx solid #f5f5f5;
    font-size: 30rpx;
    color: #666;

    &:active {
      background: #f5f7fa;
    }
  }
}
</style>
