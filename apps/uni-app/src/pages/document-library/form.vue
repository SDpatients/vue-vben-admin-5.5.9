<template>
  <view class="document-form-container">
    <view class="form-section">
      <view class="section-title">基本信息</view>
      <view class="form-list">
        <view class="form-item">
          <text class="form-label required">文档名称</text>
          <input
            v-model="form.documentName"
            class="form-input"
            placeholder="请输入文档名称"
          />
        </view>
        <view class="form-item">
          <text class="form-label">文档编码</text>
          <input
            v-model="form.documentCode"
            class="form-input"
            placeholder="请输入文档编码"
          />
        </view>
        <view class="form-item">
          <text class="form-label required">文档类型</text>
          <picker mode="selector" :range="documentTypes" :value="documentTypeIndex" @change="onTypeChange">
            <view class="form-picker">
              <text :class="['picker-text', { placeholder: !form.documentType }]">
                {{ documentTypeMap[form.documentType] || '请选择文档类型' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">所属文件夹</text>
          <picker mode="selector" :range="folderNames" :value="folderIndex" @change="onFolderChange">
            <view class="form-picker">
              <text :class="['picker-text', { placeholder: !form.folderId }]">
                {{ selectedFolderName || '请选择文件夹' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="请输入文档描述"
            :maxlength="500"
          />
        </view>
        <view class="form-item">
          <text class="form-label">标签</text>
          <input
            v-model="form.tags"
            class="form-input"
            placeholder="多个标签用逗号分隔"
          />
        </view>
        <view class="form-item switch-item">
          <text class="form-label">是否公开</text>
          <switch :checked="form.isPublic" @change="onPublicChange" color="#1890ff" />
        </view>
        <view class="form-item switch-item">
          <text class="form-label">文档状态</text>
          <picker mode="selector" :range="statusOptions" :value="statusIndex" @change="onStatusChange">
            <view class="form-picker">
              <text :class="['picker-text', { placeholder: !form.status }]">
                {{ statusMap[form.status] || 'ACTIVE' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 文件信息（仅编辑模式显示） -->
    <view v-if="isEdit && documentInfo" class="form-section">
      <view class="section-title">文件信息</view>
      <view class="file-info-card">
        <view class="file-icon" :class="getFileIconClass(documentInfo.fileExtension)">
          <text class="icon-text">{{ getFileIcon(documentInfo.fileExtension) }}</text>
        </view>
        <view class="file-details">
          <text class="file-name">{{ documentInfo.fileName }}</text>
          <text class="file-meta">{{ formatFileSize(documentInfo.fileSize) }} · {{ documentInfo.fileExtension?.toUpperCase() }}</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" @click="handleSubmit">{{ isEdit ? '保存修改' : '创建文档' }}</button>
      <button v-if="isEdit" class="cancel-btn" @click="handleCancel">取消</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  createDocument,
  updateDocument,
  getDocumentDetail,
  getFolderTree,
  type DocumentItem,
  type FolderItem,
  type FolderTreeNode,
} from '@/api/document-library'

const documentTypes = ['合同文件', '报告文件', '法律文件', '财务文件', '其他文件']
const documentTypeValues = ['CONTRACT', 'REPORT', 'LEGAL', 'FINANCIAL', 'OTHER']
const documentTypeMap: Record<string, string> = {
  CONTRACT: '合同文件',
  REPORT: '报告文件',
  LEGAL: '法律文件',
  FINANCIAL: '财务文件',
  OTHER: '其他文件',
}

const statusOptions = ['正常', '已归档', '已删除']
const statusValues = ['ACTIVE', 'ARCHIVED', 'DELETED']
const statusMap: Record<string, string> = {
  ACTIVE: '正常',
  ARCHIVED: '已归档',
  DELETED: '已删除',
}

const isEdit = ref(false)
const documentId = ref<number>()
const documentInfo = ref<DocumentItem>()
const folders = ref<FolderItem[]>([])
const folderNames = ref<string[]>(['根目录'])
const folderIds = ref<number[]>([])
const selectedFolderName = ref('')

const documentTypeIndex = ref(0)
const folderIndex = ref(0)
const statusIndex = ref(0)

const form = ref({
  documentName: '',
  documentCode: '',
  documentType: '',
  folderId: undefined as number | undefined,
  description: '',
  tags: '',
  isPublic: false,
  status: 'ACTIVE',
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || currentPage.$route?.query || {}

  if (options.mode === 'edit' && options.id) {
    isEdit.value = true
    documentId.value = Number(options.id)
    loadDocumentDetail()
  }

  loadFolders()
})

const loadDocumentDetail = async () => {
  if (!documentId.value) return
  try {
    const res = await getDocumentDetail(documentId.value)
    if (res.code === 200) {
      documentInfo.value = res.data
      form.value = {
        documentName: res.data.documentName,
        documentCode: res.data.documentCode || '',
        documentType: res.data.documentType,
        folderId: res.data.folderId,
        description: res.data.description || '',
        tags: res.data.tags || '',
        isPublic: res.data.isPublic || false,
        status: res.data.status || 'ACTIVE',
      }
      documentTypeIndex.value = documentTypeValues.indexOf(res.data.documentType)
      statusIndex.value = statusValues.indexOf(res.data.status || 'ACTIVE')
    }
  } catch (error) {
    console.error('[loadDocumentDetail] Error:', error)
  }
}

const loadFolders = async () => {
  try {
    const res = await getFolderTree()
    if (res.code === 200 && res.data) {
      const root = res.data
      folders.value = (root.children || []) as unknown as FolderItem[]
      folderNames.value = ['根目录']
      folderIds.value = []

      const extractFolders = (items: FolderTreeNode[]) => {
        items.forEach((item) => {
          folderNames.value.push(item.name)
          folderIds.value.push(item.id)
          if (item.children && item.children.length > 0) {
            extractFolders(item.children)
          }
        })
      }

      if (root.children) {
        extractFolders(root.children)
      }

      if (form.value.folderId) {
        const index = folderIds.value.indexOf(form.value.folderId)
        if (index !== -1) {
          folderIndex.value = index + 1
          selectedFolderName.value = folderNames.value[index + 1]
        }
      }
    }
  } catch (error) {
    console.error('[loadFolders] Error:', error)
  }
}

const onTypeChange = (e: any) => {
  const index = e.detail.value
  documentTypeIndex.value = index
  form.value.documentType = documentTypeValues[index]
}

const onFolderChange = (e: any) => {
  const index = e.detail.value
  folderIndex.value = index
  if (index === 0) {
    form.value.folderId = undefined
    selectedFolderName.value = ''
  } else {
    form.value.folderId = folderIds.value[index - 1]
    selectedFolderName.value = folderNames.value[index]
  }
}

const onPublicChange = (e: any) => {
  form.value.isPublic = e.detail.value
}

const onStatusChange = (e: any) => {
  const index = e.detail.value
  statusIndex.value = index
  form.value.status = statusValues[index]
}

const handleSubmit = async () => {
  if (!form.value.documentName.trim()) {
    uni.showToast({ title: '请输入文档名称', icon: 'none' })
    return
  }
  if (!form.value.documentType) {
    uni.showToast({ title: '请选择文档类型', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })
  try {
    let res
    if (isEdit.value && documentId.value) {
      res = await updateDocument(documentId.value, {
        documentName: form.value.documentName,
        folderId: form.value.folderId,
        description: form.value.description,
        tags: form.value.tags,
        isPublic: form.value.isPublic,
        status: form.value.status,
      })
    } else {
      if (!documentInfo.value) {
        uni.showToast({ title: '请先选择文件', icon: 'none' })
        return
      }
      res = await createDocument({
        documentName: form.value.documentName,
        documentCode: form.value.documentCode,
        folderId: form.value.folderId,
        documentType: form.value.documentType,
        fileName: documentInfo.value.fileName,
        filePath: documentInfo.value.filePath,
        fileSize: documentInfo.value.fileSize,
        fileExtension: documentInfo.value.fileExtension,
        mimeType: documentInfo.value.mimeType,
        description: form.value.description,
        tags: form.value.tags,
        isPublic: form.value.isPublic,
      })
    }

    if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const handleCancel = () => {
  uni.navigateBack()
}

const getFileIcon = (ext?: string) => {
  const iconMap: Record<string, string> = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    xls: '📗',
    xlsx: '📗',
    ppt: '📙',
    pptx: '📙',
    txt: '📄',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  }
  return iconMap[ext?.toLowerCase() || ''] || '📄'
}

const getFileIconClass = (ext?: string) => {
  const classMap: Record<string, string> = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'doc',
    xls: 'xls',
    xlsx: 'xls',
    ppt: 'ppt',
    pptx: 'ppt',
    txt: 'txt',
    jpg: 'img',
    jpeg: 'img',
    png: 'img',
    gif: 'img',
    zip: 'zip',
    rar: 'zip',
  }
  return classMap[ext?.toLowerCase() || ''] || 'default'
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
.document-form-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.form-section {
  background: #fff;
  margin-bottom: 16rpx;
  padding: 24rpx 0;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    padding: 0 32rpx;
    margin-bottom: 16rpx;
  }

  .form-list {
    .form-item {
      display: flex;
      align-items: flex-start;
      padding: 20rpx 32rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &.switch-item {
        justify-content: space-between;
        align-items: center;
      }

      .form-label {
        width: 180rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
        padding-top: 8rpx;

        &.required::before {
          content: '*';
          color: #ff4d4f;
          margin-right: 4rpx;
        }
      }

      .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        text-align: right;
      }

      .form-picker {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8rpx;

        .picker-text {
          font-size: 28rpx;
          color: #333;

          &.placeholder {
            color: #999;
          }
        }

        .picker-arrow {
          font-size: 32rpx;
          color: #999;
        }
      }

      .form-textarea {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        height: 160rpx;
        text-align: right;
      }
    }
  }
}

.file-info-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  background: #f5f7fa;
  margin: 0 32rpx;
  border-radius: 12rpx;

  .file-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    flex-shrink: 0;

    &.pdf {
      background: #fff2f0;
    }

    &.doc {
      background: #e6f7ff;
    }

    &.xls {
      background: #f6ffed;
    }

    &.ppt {
      background: #fff7e6;
    }

    &.img {
      background: #f9f0ff;
    }

    .icon-text {
      font-size: 40rpx;
    }
  }

  .file-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .file-name {
      font-size: 28rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-meta {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.submit-section {
  padding: 40rpx 32rpx;

  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #1890ff;
    color: #fff;
    font-size: 32rpx;
    border-radius: 12rpx;
    margin-bottom: 20rpx;

    &:active {
      background: #40a9ff;
    }
  }

  .cancel-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #f5f5f5;
    color: #666;
    font-size: 32rpx;
    border-radius: 12rpx;

    &:active {
      background: #e8e8e8;
    }
  }
}
</style>
