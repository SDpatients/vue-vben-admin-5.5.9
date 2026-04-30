<template>
  <view class="announcement-form-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">发布公告</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 选择案件 -->
      <view class="form-item" v-if="!caseId">
        <text class="form-label required">选择案件</text>
        <view class="form-input" @click="showCasePicker = true">
          <text :class="['input-text', { placeholder: !selectedCase }]">
            {{ selectedCase ? selectedCase.caseName : '请选择案件' }}
          </text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 案件信息（已选择案件时显示） -->
      <view class="form-item" v-else>
        <text class="form-label">关联案件</text>
        <view class="form-input disabled">
          <text class="input-text">{{ selectedCase?.caseName || form.caseNumber || '-' }}</text>
        </view>
      </view>

      <!-- 公告标题 -->
      <view class="form-item">
        <text class="form-label required">公告标题</text>
        <input
          class="form-input-field"
          v-model="form.title"
          placeholder="请输入公告标题"
          maxlength="200"
        />
      </view>

      <!-- 公告类型 -->
      <view class="form-item">
        <text class="form-label required">公告类型</text>
        <view class="type-options">
          <view
            v-for="type in announcementTypes"
            :key="type.value"
            :class="['type-option', { active: form.announcementType === type.value }]"
            @click="form.announcementType = type.value"
          >
            <text>{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 公告内容 -->
      <view class="form-item">
        <text class="form-label required">公告内容</text>
        <textarea
          class="form-textarea"
          v-model="form.content"
          placeholder="请输入公告内容"
          maxlength="2000"
        />
        <text class="textarea-count">{{ form.content.length }}/2000</text>
      </view>

      <!-- 附件上传 -->
      <view class="form-item">
        <text class="form-label">附件</text>
        <view class="file-upload-area" @click="handleChooseFile">
          <text class="upload-icon">+</text>
          <text class="upload-text">点击上传附件</text>
          <text class="upload-hint">支持 doc/docx/pdf/jpg/png 格式</text>
        </view>

        <!-- 已选文件列表 -->
        <view class="file-list" v-if="fileList.length > 0">
          <view v-for="(file, index) in fileList" :key="index" class="file-item">
            <view class="file-info">
              <text class="file-name">{{ file.name }}</text>
              <text class="file-size">{{ formatFileSize(file.size) }}</text>
            </view>
            <view class="file-delete" @click="handleRemoveFile(index)">
              <text>✕</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="cancel-btn" @click="handleBack">
        <text>取消</text>
      </view>
      <view class="submit-btn" @click="handleSubmit">
        <text v-if="!submitting">发布</text>
        <u-loading-icon v-else mode="circle" size="16" color="#fff"></u-loading-icon>
      </view>
    </view>

    <!-- 案件选择弹窗 -->
    <u-popup :show="showCasePicker" mode="bottom" @close="showCasePicker = false">
      <view class="picker-container">
        <view class="picker-header">
          <text class="picker-title">选择案件</text>
          <text class="picker-close" @click="showCasePicker = false">关闭</text>
        </view>
        <scroll-view scroll-y class="picker-body">
          <view
            v-for="caseItem in caseOptions"
            :key="caseItem.id"
            :class="['picker-item', { active: selectedCase?.id === caseItem.id }]"
            @click="handleSelectCase(caseItem)"
          >
            <view class="picker-item-info">
              <text class="picker-item-name">{{ caseItem.caseName }}</text>
              <text class="picker-item-number">{{ caseItem.caseNumber }}</text>
            </view>
            <text v-if="selectedCase?.id === caseItem.id" class="picker-check">✓</text>
          </view>
          <view v-if="caseOptions.length === 0" class="picker-empty">
            <text>暂无案件数据</text>
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  createAnnouncement,
  createAnnouncementWithFiles,
} from '@/api/announcement'
import { getCaseList } from '@/api/case'
import { getBaseUrl } from '@/config'

interface CaseOption {
  id: number
  caseName: string
  caseNumber: string
}

interface FormData {
  caseId: number
  caseNumber: string
  principalOfficer: string
  title: string
  content: string
  announcementType: string
}

const props = defineProps<{
  caseId?: string
}>()

const caseId = ref('')
const submitting = ref(false)
const showCasePicker = ref(false)
const caseOptions = ref<CaseOption[]>([])
const selectedCase = ref<CaseOption | null>(null)
const fileList = ref<{ name: string; size: number; path: string; file?: File }[]>([])

const form = ref<FormData>({
  caseId: 0,
  caseNumber: '',
  principalOfficer: '',
  title: '',
  content: '',
  announcementType: 'ANNOUNCEMENT',
})

const announcementTypes = [
  { label: '公告', value: 'ANNOUNCEMENT' },
  { label: '通知', value: 'NOTICE' },
  { label: '警告', value: 'WARNING' },
]

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.caseId || props.caseId || ''

  if (caseId.value) {
    form.value.caseId = Number(caseId.value)
  }

  loadCaseList()
})

const loadCaseList = async () => {
  try {
    const res = await getCaseList({ pageNum: 1, pageSize: 10000 })
    if (res.code === 200 && res.data?.list) {
      caseOptions.value = res.data.list.map((item: any) => ({
        id: item.id,
        caseName: item.caseName,
        caseNumber: item.caseNumber,
      }))

      if (caseId.value) {
        const found = caseOptions.value.find((c) => c.id === Number(caseId.value))
        if (found) {
          selectedCase.value = found
          form.value.caseNumber = found.caseNumber
        }
      }
    }
  } catch (error) {
}
}

const handleSelectCase = (caseItem: CaseOption) => {
  selectedCase.value = caseItem
  form.value.caseId = caseItem.id
  form.value.caseNumber = caseItem.caseNumber
  showCasePicker.value = false
}

const handleChooseFile = () => {
  uni.chooseFile({
    count: 5,
    type: 'all',
    extension: ['.doc', '.docx', '.pdf', '.jpg', '.jpeg', '.png', '.txt'],
    success: (res: any) => {
      const files = res.tempFiles || []
      files.forEach((file: any) => {
        if (fileList.value.length >= 5) {
          uni.showToast({ title: '最多上传5个文件', icon: 'none' })
          return
        }
        fileList.value.push({
          name: file.name,
          size: file.size,
          path: file.path,
          file: file,
        })
      })
    },
    fail: () => {
      uni.showToast({ title: '选择文件失败', icon: 'none' })
    },
  })
}

const handleRemoveFile = (index: number) => {
  fileList.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateForm = (): boolean => {
  if (!form.value.caseId) {
    uni.showToast({ title: '请选择案件', icon: 'none' })
    return false
  }
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入公告标题', icon: 'none' })
    return false
  }
  if (!form.value.content.trim()) {
    uni.showToast({ title: '请输入公告内容', icon: 'none' })
    return false
  }
  return true
}

// 统一上传文件并创建公告
const uploadAnnouncementFiles = async (): Promise<boolean> => {
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
  
  // 先上传所有文件
  const uploadedFileIds: number[] = []
  
  for (const fileInfo of fileList.value) {
    if (!fileInfo.path) continue
    
    try {
      const uploadRes = await new Promise<any>((resolve, reject) => {
        uni.uploadFile({
          url: `${baseUrl}/api/v1/file/upload`,
          filePath: fileInfo.path,
          name: 'file',
          formData: {
            bizType: 'announcement',
            bizId: '0',
          },
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        })
      })
      
      const result = JSON.parse(uploadRes.data)
      if (result.code === 200 && result.data?.id) {
        uploadedFileIds.push(result.data.id)
      }
    } catch (error) {
throw error
    }
  }
  
  // 创建公告，关联已上传的文件
  const res = await createAnnouncement({
    caseId: form.value.caseId,
    caseNumber: form.value.caseNumber,
    principalOfficer: form.value.principalOfficer,
    title: form.value.title,
    content: form.value.content,
    announcementType: form.value.announcementType,
    attachments: uploadedFileIds.length > 0 ? JSON.stringify(uploadedFileIds) : undefined,
  } as any)
  
  return res.code === 200
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    if (fileList.value.length > 0) {
      // 有文件时，先上传文件再创建公告
      const success = await uploadAnnouncementFiles()
      if (success) {
        uni.showToast({ title: '发布成功', icon: 'success' })
        uni.$emit('refresh-announcement-list', caseId.value)
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    } else {
      // 无文件时，直接创建公告
      const res = await createAnnouncement({
        caseId: form.value.caseId,
        caseNumber: form.value.caseNumber,
        principalOfficer: form.value.principalOfficer,
        title: form.value.title,
        content: form.value.content,
        announcementType: form.value.announcementType,
      })
      if (res.code === 200) {
        uni.showToast({ title: '发布成功', icon: 'success' })
        uni.$emit('refresh-announcement-list', caseId.value)
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  } catch (error) {
uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.announcement-form-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 140rpx;
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
    }
  }
}

.form-content {
  padding: 20rpx;

  .form-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 16rpx;

      &.required::after {
        content: '*';
        color: #ff4d4f;
        margin-left: 4rpx;
      }
    }

    .form-input {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80rpx;
      padding: 0 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 1rpx solid #e8e8e8;

      &.disabled {
        background: #f5f5f5;
      }

      .input-text {
        font-size: 28rpx;
        color: #333;

        &.placeholder {
          color: #999;
        }
      }

      .arrow {
        font-size: 32rpx;
        color: #ccc;
      }
    }

    .form-input-field {
      height: 80rpx;
      padding: 0 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 1rpx solid #e8e8e8;
      font-size: 28rpx;
      color: #333;
    }

    .form-textarea {
      width: 100%;
      min-height: 300rpx;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 1rpx solid #e8e8e8;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }

    .textarea-count {
      display: block;
      text-align: right;
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }

    .type-options {
      display: flex;
      gap: 20rpx;

      .type-option {
        flex: 1;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border-radius: 8rpx;
        border: 1rpx solid #e8e8e8;
        font-size: 28rpx;
        color: #666;

        &.active {
          background: #0068E2;
          color: #fff;
          border-color: #0068E2;
        }
      }
    }

    .file-upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 2rpx dashed #d9d9d9;

      &:active {
        background: #e6f2ff;
        border-color: #0068E2;
      }

      .upload-icon {
        font-size: 48rpx;
        color: #999;
        margin-bottom: 12rpx;
      }

      .upload-text {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .upload-hint {
        font-size: 22rpx;
        color: #999;
      }
    }

    .file-list {
      margin-top: 16rpx;

      .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16rpx 20rpx;
        background: #f8f9fa;
        border-radius: 8rpx;
        margin-bottom: 12rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .file-info {
          flex: 1;
          min-width: 0;

          .file-name {
            display: block;
            font-size: 26rpx;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-size {
            display: block;
            font-size: 22rpx;
            color: #999;
            margin-top: 4rpx;
          }
        }

        .file-delete {
          width: 48rpx;
          height: 48rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 16rpx;

          text {
            font-size: 28rpx;
            color: #ff4d4f;
          }
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

  .cancel-btn {
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

  .submit-btn {
    flex: 2;
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

.picker-container {
  height: 60vh;
  display: flex;
  flex-direction: column;

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;

    .picker-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .picker-close {
      font-size: 28rpx;
      color: #999;
    }
  }

  .picker-body {
    flex: 1;
    height: calc(60vh - 100rpx);
    padding: 0 24rpx;
    overflow-y: auto;

    .picker-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &.active {
        .picker-item-name {
          color: #0068E2;
        }
      }

      .picker-item-info {
        flex: 1;
        min-width: 0;

        .picker-item-name {
          display: block;
          font-size: 30rpx;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .picker-item-number {
          display: block;
          font-size: 24rpx;
          color: #999;
          margin-top: 4rpx;
        }
      }

      .picker-check {
        font-size: 32rpx;
        color: #0068E2;
        font-weight: bold;
      }
    }

    .picker-empty {
      padding: 60rpx 0;
      text-align: center;

      text {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}
</style>
