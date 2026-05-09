<template>
  <view class="folder-manage-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">返回</text>
      </view>
      <text class="nav-title">文件夹管理</text>
      <view class="nav-action" @click="showCreateFolder">
        <text class="action-text">新建</text>
      </view>
    </view>

    <!-- 路径导航 -->
    <view v-if="folderPath.length > 0" class="breadcrumb-section">
      <scroll-view scroll-x class="breadcrumb-scroll">
        <view class="breadcrumb-list">
          <text class="breadcrumb-item" @click="goToRoot">根目录</text>
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

    <!-- 文件夹列表 -->
    <view class="folder-list-section">
      <scroll-view
        scroll-y
        class="folder-scroll"
        :style="{ height: scrollHeight + 'px' }"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="folderList.length === 0 && !loading" class="empty-state">
          <view class="empty-icon-wrapper">
            <text class="empty-icon-text">空</text>
          </view>
          <text class="empty-text">暂无文件夹</text>
          <text class="empty-subtext">点击右上角"新建"创建文件夹</text>
        </view>

        <view
          v-for="folder in folderList"
          :key="folder.id"
          class="folder-card"
          @click="enterFolder(folder)"
        >
          <view class="folder-main">
            <view class="folder-icon" :style="{ backgroundColor: folder.color || '#1890ff' }">
              <text class="folder-icon-text">文件夹</text>
            </view>
            <view class="folder-info">
              <text class="folder-name">{{ folder.folderName }}</text>
              <text class="folder-desc">{{ folder.description || '暂无描述' }}</text>
              <view class="folder-meta">
                <text class="meta-item">{{ folder.documentCount || 0 }}个文件</text>
                <text class="meta-item">{{ formatTime(folder.createTime) }}</text>
              </view>
            </view>
          </view>
          <view class="folder-actions" @click.stop>
            <text class="action-btn-icon" @click="showFolderActions(folder)">更多</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 文件夹操作弹窗 -->
    <uni-popup ref="folderActionPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-sheet-header">
          <text class="action-sheet-title">{{ currentFolder?.folderName }}</text>
        </view>
        <view class="action-list">
          <view class="action-item-popup" @click="handleViewFiles">
            <text class="action-text">查看文件</text>
          </view>
          <view class="action-item-popup" @click="handleEditFolder">
            <text class="action-text">编辑</text>
          </view>
          <view class="action-item-popup" @click="handleCreateSubFolder">
            <text class="action-text">新建子文件夹</text>
          </view>
          <view class="action-item-popup" @click="handleMoveFolder">
            <text class="action-text">移动</text>
          </view>
          <view class="action-item-popup delete" @click="handleDeleteFolder">
            <text class="action-text">删除</text>
          </view>
        </view>
        <view class="action-sheet-cancel" @click="closeFolderActions">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>

    <!-- 移动文件夹选择弹窗 -->
    <uni-popup ref="movePopup" type="bottom">
      <view class="action-sheet">
        <view class="action-sheet-header">
          <text class="action-sheet-title">选择目标文件夹</text>
        </view>
        <scroll-view scroll-y class="move-folder-list">
          <view class="move-folder-item" @click="confirmMove(undefined)">
            <text class="move-folder-name">根目录</text>
          </view>
          <view
            v-for="folder in allFolders"
            :key="folder.id"
            class="move-folder-item"
            :class="{ disabled: folder.id === currentFolder?.id || isDescendant(folder.id) }"
            @click="confirmMove(folder.id)"
          >
            <text class="move-folder-name" :style="{ paddingLeft: `${(folder.level || 0) * 40}rpx` }">
              {{ folder.folderName }}
            </text>
          </view>
        </scroll-view>
        <view class="action-sheet-cancel" @click="closeMovePopup">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getFolderTree,
  getRootFolders,
  getFolderChildren,
  getFolderPath,
  createFolder,
  updateFolder,
  deleteFolder,
  moveFolder,
  getFolderDescendants,
  type FolderItem,
  type FolderTreeItem,
} from '@/api/document-library'

interface FlatFolder extends FolderItem {
  level?: number
}

const folderList = ref<FolderItem[]>([])
const allFolders = ref<FlatFolder[]>([])
const folderPath = ref<Array<{ id: number; folderName: string }>>([])
const currentParentId = ref<number>()
const currentFolder = ref<FolderItem>()
const loading = ref(false)
const refreshing = ref(false)
const scrollHeight = ref(600)
const folderActionPopup = ref()
const movePopup = ref()
const currentDescendants = ref<number[]>([])

onMounted(() => {
  loadFolders()
  calculateScrollHeight()
})

const calculateScrollHeight = () => {
  const systemInfo = uni.getSystemInfoSync()
  scrollHeight.value = systemInfo.windowHeight - 120
}

const loadFolders = async () => {
  loading.value = true
  try {
    if (currentParentId.value) {
      const [childrenRes, pathRes] = await Promise.all([
        getFolderChildren(currentParentId.value),
        getFolderPath(currentParentId.value),
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
    } else {
      const res = await getRootFolders()
      if (res.code === 200) {
        folderList.value = res.data.folders || []
      }
      folderPath.value = []
    }
    // 同时加载全部文件夹树用于移动选择
    await loadAllFolders()
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadAllFolders = async () => {
  try {
    const res = await getFolderTree()
    if (res.code === 200) {
      allFolders.value = flattenFolderTree(res.data || [])
    }
  } catch (error) {
    // silent fail
  }
}

const flattenFolderTree = (tree: FolderTreeItem[], level: number = 0): FlatFolder[] => {
  const result: FlatFolder[] = []
  for (const item of tree) {
    result.push({ ...item, level })
    if (item.children && item.children.length > 0) {
      result.push(...flattenFolderTree(item.children, level + 1))
    }
  }
  return result
}

const enterFolder = (folder: FolderItem) => {
  currentParentId.value = folder.id
  loadFolders()
}

const goToRoot = () => {
  currentParentId.value = undefined
  folderPath.value = []
  loadFolders()
}

const goToFolder = (folderId: number, index: number) => {
  if (index === folderPath.value.length - 1) return
  currentParentId.value = folderId
  loadFolders()
}

const goBack = () => {
  if (folderPath.value.length > 0) {
    const parent = folderPath.value[folderPath.value.length - 2]
    if (parent) {
      currentParentId.value = parent.id
    } else {
      currentParentId.value = undefined
    }
    loadFolders()
  } else {
    uni.navigateBack()
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadFolders().finally(() => {
    refreshing.value = false
  })
}

const showCreateFolder = () => {
  uni.showModal({
    title: '新建文件夹',
    editable: true,
    placeholderText: '请输入文件夹名称',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm && res.content) {
        try {
          const result = await createFolder({
            folderName: res.content,
            parentId: currentParentId.value,
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

const showFolderActions = async (folder: FolderItem) => {
  currentFolder.value = folder
  // 加载当前文件夹的所有后代ID，用于移动时禁用
  try {
    const res = await getFolderDescendants(folder.id)
    if (res.code === 200) {
      currentDescendants.value = res.data || []
    }
  } catch (error) {
    currentDescendants.value = []
  }
  folderActionPopup.value?.open()
}

const closeFolderActions = () => {
  folderActionPopup.value?.close()
}

const handleViewFiles = () => {
  if (!currentFolder.value) return
  // 返回到文档库首页并进入该文件夹
  uni.$emit('enter-folder', currentFolder.value.id)
  uni.switchTab({ url: '/pages/document-library/index' })
  closeFolderActions()
}

const handleEditFolder = () => {
  if (!currentFolder.value) return
  uni.showModal({
    title: '编辑文件夹',
    content: currentFolder.value.folderName,
    editable: true,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm && res.content && res.content !== currentFolder.value!.folderName) {
        try {
          const result = await updateFolder(currentFolder.value!.id, {
            folderName: res.content,
          })
          if (result.code === 200) {
            uni.showToast({ title: '修改成功', icon: 'success' })
            loadFolders()
          }
        } catch (error) {
          uni.showToast({ title: '修改失败', icon: 'none' })
        }
      }
    },
  })
  closeFolderActions()
}

const handleCreateSubFolder = () => {
  if (!currentFolder.value) return
  uni.showModal({
    title: '新建子文件夹',
    editable: true,
    placeholderText: '请输入子文件夹名称',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm && res.content) {
        try {
          const result = await createFolder({
            folderName: res.content,
            parentId: currentFolder.value!.id,
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
  closeFolderActions()
}

const handleMoveFolder = () => {
  closeFolderActions()
  movePopup.value?.open()
}

const closeMovePopup = () => {
  movePopup.value?.close()
}

const isDescendant = (folderId: number) => {
  return currentDescendants.value.includes(folderId)
}

const confirmMove = async (targetFolderId?: number) => {
  if (!currentFolder.value) return
  try {
    const result = await moveFolder(currentFolder.value.id, targetFolderId)
    if (result.code === 200) {
      uni.showToast({ title: '移动成功', icon: 'success' })
      loadFolders()
    }
  } catch (error) {
    uni.showToast({ title: '移动失败', icon: 'none' })
  }
  closeMovePopup()
}

const handleDeleteFolder = () => {
  if (!currentFolder.value) return
  uni.showModal({
    title: '确认删除',
    content: `确定要删除文件夹"${currentFolder.value.folderName}"吗？\n文件夹内的文件不会被删除。`,
    confirmColor: '#ff4d4f',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          const result = await deleteFolder(currentFolder.value!.id)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            loadFolders()
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
  closeFolderActions()
}

const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.folder-manage-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .back-btn {
    padding: 12rpx;

    .back-icon {
      font-size: 28rpx;
      color: #666;
    }
  }

  .nav-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .nav-action {
    padding: 12rpx 20rpx;

    .action-text {
      font-size: 28rpx;
      color: #1890ff;
    }
  }
}

.breadcrumb-section {
  background: #fff;
  padding: 16rpx 20rpx;
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

.folder-list-section {
  padding: 20rpx;

  .folder-scroll {
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

    .folder-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      &:active {
        background: #f5f7fa;
      }

      .folder-main {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 20rpx;
        min-width: 0;

        .folder-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 12rpx;
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
          gap: 8rpx;

          .folder-name {
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .folder-desc {
            font-size: 24rpx;
            color: #999;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .folder-meta {
            display: flex;
            gap: 16rpx;

            .meta-item {
              font-size: 22rpx;
              color: #ccc;
            }
          }
        }
      }

      .folder-actions {
        .action-btn-icon {
          font-size: 26rpx;
          color: #1890ff;
          padding: 16rpx;
        }
      }
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

  .move-folder-list {
    max-height: 600rpx;

    .move-folder-item {
      padding: 24rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:active {
        background: #f5f7fa;
      }

      &.disabled {
        opacity: 0.4;
        pointer-events: none;
      }

      .move-folder-name {
        font-size: 28rpx;
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
