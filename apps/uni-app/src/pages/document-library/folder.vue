<template>
  <view class="folder-manage-container">
    <!-- 文件夹列表 -->
    <view class="folder-list-section">
      <scroll-view
        scroll-y
        class="folder-scroll"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="folderList.length === 0 && !loading" class="empty-state">
          <text class="empty-icon">📁</text>
          <text class="empty-text">暂无文件夹</text>
          <text class="empty-subtext">点击右下角按钮创建文件夹</text>
        </view>

        <view
          v-for="folder in folderList"
          :key="folder.id"
          class="folder-item"
          @click="enterFolder(folder)"
        >
          <view class="folder-icon" :style="{ backgroundColor: folder.color || '#1890ff' }">
            <text class="icon-text">📁</text>
          </view>
          <view class="folder-info">
            <text class="folder-name">{{ folder.folderName }}</text>
            <text class="folder-meta">{{ folder.documentCount || 0 }}个文件 · {{ folder.subFolderCount || 0 }}个子文件夹</text>
            <text v-if="folder.description" class="folder-desc">{{ folder.description }}</text>
          </view>
          <view class="folder-actions" @click.stop>
            <text class="action-more" @click="showFolderActions(folder)">⋮</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部添加按钮 -->
    <view class="bottom-bar">
      <view class="add-btn" @click="showCreateFolder">
        <text class="btn-icon">➕</text>
        <text class="btn-text">新建文件夹</text>
      </view>
    </view>

    <!-- 文件夹操作弹窗 -->
    <uni-popup ref="folderActionPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-sheet-header">
          <text class="action-sheet-title">{{ currentFolder?.folderName }}</text>
        </view>
        <view class="action-list">
          <view class="action-item-popup" @click="handleEditFolder">
            <text class="action-icon">✏️</text>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-item-popup" @click="handleMoveFolder">
            <text class="action-icon">📂</text>
            <text class="action-text">移动</text>
          </view>
          <view class="action-item-popup" @click="handleRenameFolder">
            <text class="action-icon">📝</text>
            <text class="action-text">重命名</text>
          </view>
          <view class="action-item-popup delete" @click="handleDeleteFolder">
            <text class="action-icon">🗑️</text>
            <text class="action-text">删除</text>
          </view>
        </view>
        <view class="action-sheet-cancel" @click="closeFolderActions">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>

    <!-- 编辑文件夹弹窗 -->
    <uni-popup ref="editPopup" type="center">
      <view class="edit-modal">
        <view class="modal-title">编辑文件夹</view>
        <view class="modal-form">
          <view class="form-item">
            <text class="form-label">文件夹名称</text>
            <input v-model="editForm.folderName" class="form-input" placeholder="请输入文件夹名称" />
          </view>
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea v-model="editForm.description" class="form-textarea" placeholder="请输入描述" />
          </view>
          <view class="form-item">
            <text class="form-label">颜色</text>
            <view class="color-picker">
              <view
                v-for="color in colorOptions"
                :key="color"
                class="color-item"
                :style="{ backgroundColor: color }"
                :class="{ active: editForm.color === color }"
                @click="editForm.color = color"
              />
            </view>
          </view>
        </view>
        <view class="modal-actions">
          <text class="modal-btn cancel" @click="closeEditModal">取消</text>
          <text class="modal-btn confirm" @click="confirmEdit">确定</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getRootFolders,
  getFolderChildren,
  getFolderTree,
  createFolder,
  updateFolder,
  deleteFolder,
  moveFolder,
  type FolderItem,
} from '@/api/document-library'

const folderList = ref<FolderItem[]>([])
const currentFolder = ref<FolderItem>()
const currentParentId = ref<number>()
const folderPath = ref<FolderItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const folderActionPopup = ref()
const editPopup = ref()

const colorOptions = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fadb14']

const editForm = ref({
  folderName: '',
  description: '',
  color: '#1890ff',
})

onMounted(() => {
  loadFolders()
})

const loadFolders = async () => {
  loading.value = true
  try {
    if (currentParentId.value) {
      const res = await getFolderChildren(currentParentId.value)
      if (res.code === 200) {
        folderList.value = res.data || []
      }
    } else {
      const res = await getRootFolders()
      if (res.code === 200) {
        folderList.value = res.data.list || []
      }
    }
  } catch (error) {
} finally {
    loading.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadFolders().finally(() => {
    refreshing.value = false
  })
}

const enterFolder = (folder: FolderItem) => {
  currentParentId.value = folder.id
  folderPath.value.push(folder)
  loadFolders()
}

const goBack = () => {
  if (folderPath.value.length > 0) {
    folderPath.value.pop()
    const parent = folderPath.value[folderPath.value.length - 1]
    currentParentId.value = parent?.id
    loadFolders()
  } else {
    currentParentId.value = undefined
    loadFolders()
  }
}

const showFolderActions = (folder: FolderItem) => {
  currentFolder.value = folder
  folderActionPopup.value?.open()
}

const closeFolderActions = () => {
  folderActionPopup.value?.close()
}

const handleEditFolder = () => {
  if (!currentFolder.value) return
  editForm.value = {
    folderName: currentFolder.value.folderName,
    description: currentFolder.value.description || '',
    color: currentFolder.value.color || '#1890ff',
  }
  editPopup.value?.open()
  closeFolderActions()
}

const closeEditModal = () => {
  editPopup.value?.close()
}

const confirmEdit = async () => {
  if (!currentFolder.value) return
  if (!editForm.value.folderName.trim()) {
    uni.showToast({ title: '请输入文件夹名称', icon: 'none' })
    return
  }

  try {
    const res = await updateFolder(currentFolder.value.id, {
      folderName: editForm.value.folderName,
      description: editForm.value.description,
      color: editForm.value.color,
    })
    if (res.code === 200) {
      uni.showToast({ title: '修改成功', icon: 'success' })
      closeEditModal()
      loadFolders()
    }
  } catch (error) {
    uni.showToast({ title: '修改失败', icon: 'none' })
  }
}

const handleRenameFolder = () => {
  if (!currentFolder.value) return
  uni.showModal({
    title: '重命名',
    editable: true,
    content: currentFolder.value.folderName,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm && res.content) {
        try {
          const result = await updateFolder(currentFolder.value!.id, {
            folderName: res.content,
          })
          if (result.code === 200) {
            uni.showToast({ title: '重命名成功', icon: 'success' })
            loadFolders()
          }
        } catch (error) {
          uni.showToast({ title: '重命名失败', icon: 'none' })
        }
      }
    },
  })
  closeFolderActions()
}

const handleMoveFolder = () => {
  uni.showToast({ title: '移动功能开发中', icon: 'none' })
  closeFolderActions()
}

const handleDeleteFolder = () => {
  if (!currentFolder.value) return
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${currentFolder.value.folderName}"吗？\n注意：文件夹必须为空才能删除！`,
    confirmColor: '#ff4d4f',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          await deleteFolder(currentFolder.value!.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadFolders()
        } catch (error) {
          uni.showToast({ title: '删除失败，请确保文件夹为空', icon: 'none' })
        }
      }
    },
  })
  closeFolderActions()
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
            color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
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
</script>

<style lang="scss" scoped>
.folder-manage-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.folder-list-section {
  .folder-scroll {
    height: calc(100vh - 120rpx);

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

    .folder-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      background: #fff;
      padding: 24rpx 32rpx;
      margin-bottom: 2rpx;

      &:active {
        background: #f5f7fa;
      }

      .folder-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .icon-text {
          font-size: 40rpx;
        }
      }

      .folder-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6rpx;

        .folder-name {
          font-size: 30rpx;
          color: #333;
          font-weight: 500;
        }

        .folder-meta {
          font-size: 24rpx;
          color: #999;
        }

        .folder-desc {
          font-size: 24rpx;
          color: #999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .folder-actions {
        .action-more {
          font-size: 40rpx;
          color: #999;
          padding: 12rpx;
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
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    height: 88rpx;
    background: #1890ff;
    border-radius: 12rpx;

    &:active {
      background: #40a9ff;
    }

    .btn-icon {
      font-size: 32rpx;
      color: #fff;
    }

    .btn-text {
      font-size: 30rpx;
      color: #fff;
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
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .action-list {
    .action-item-popup {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 24rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:active {
        background: #f5f7fa;
      }

      &.delete {
        .action-text {
          color: #ff4d4f;
        }
      }

      .action-icon {
        font-size: 36rpx;
      }

      .action-text {
        font-size: 30rpx;
        color: #333;
      }
    }
  }

  .action-sheet-cancel {
    text-align: center;
    padding: 24rpx;
    border-top: 8rpx solid #f5f5f5;
    font-size: 30rpx;
    color: #333;

    &:active {
      background: #f5f7fa;
    }
  }
}

.edit-modal {
  background: #fff;
  border-radius: 16rpx;
  width: 600rpx;
  padding: 32rpx;

  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 24rpx;
  }

  .modal-form {
    .form-item {
      margin-bottom: 20rpx;

      .form-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 12rpx;
      }

      .form-input {
        width: 100%;
        height: 72rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }

      .form-textarea {
        width: 100%;
        height: 120rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        padding: 16rpx 20rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }

      .color-picker {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .color-item {
          width: 56rpx;
          height: 56rpx;
          border-radius: 50%;

          &.active {
            box-shadow: 0 0 0 4rpx #fff, 0 0 0 8rpx #1890ff;
          }
        }
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 24rpx;
    margin-top: 24rpx;

    .modal-btn {
      font-size: 28rpx;
      padding: 12rpx 32rpx;
      border-radius: 8rpx;

      &.cancel {
        color: #666;
      }

      &.confirm {
        color: #1890ff;
        background: #e6f7ff;
      }
    }
  }
}
</style>
