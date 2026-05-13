<template>
  <view class="detail-container" v-if="document">
    <!-- 头部信息 -->
    <view class="header-card">
      <view class="header-top">
        <text class="approval-no">文书审批 #{{ document.id }}</text>
        <text :class="['status-badge', getDocumentStatusClass(document.status)]">
          {{ getDocumentStatusText(document.status) }}
        </text>
      </view>
      <text class="approval-title">{{ document.documentName }}</text>
      <view class="header-meta">
        <text class="type-tag">{{ document.documentType || '文书审批' }}</text>
        <text class="meta-text">案号：{{ document.caseNumber || '-' }}</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="info-section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">文书编号</text>
          <text class="value">{{ document.documentNumber || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">文书名称</text>
          <text class="value">{{ document.documentName }}</text>
        </view>
        <view class="info-item">
          <text class="label">文书类型</text>
          <text class="value">{{ document.documentType || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">收件人</text>
          <text class="value">{{ document.recipientName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">收件人类型</text>
          <text class="value">{{ document.recipientType || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">联系电话</text>
          <text class="value">{{ document.contactPhone || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">送达地址</text>
          <text class="value">{{ document.deliveryAddress || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">送达方式</text>
          <text class="value">{{ document.deliveryMethod || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">案号</text>
          <text class="value">{{ document.caseNumber || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">案件名称</text>
          <text class="value">{{ document.caseName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">审批状态</text>
          <text :class="['value', getDocumentStatusClass(document.status)]">
            {{ getDocumentStatusText(document.status) }}
          </text>
        </view>
        <view class="info-item">
          <text class="label">发送状态</text>
          <text class="value">{{ document.sendStatus || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDateTime(document.createTime) }}</text>
        </view>
        <view class="info-item">
          <text class="label">更新时间</text>
          <text class="value">{{ formatDateTime(document.updateTime) }}</text>
        </view>
        <view class="info-item" v-if="document.sendTime">
          <text class="label">发送时间</text>
          <text class="value">{{ formatDateTime(document.sendTime) }}</text>
        </view>
        <view class="info-item" v-if="document.deliveryTime">
          <text class="label">送达时间</text>
          <text class="value">{{ formatDateTime(document.deliveryTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 送达内容 -->
    <view class="info-section" v-if="document.deliveryContent">
      <view class="section-title">送达内容</view>
      <view class="content-box">
        <text class="content-text">{{ document.deliveryContent }}</text>
      </view>
    </view>

    <!-- 附件列表 -->
    <view class="info-section" v-if="attachments.length > 0">
      <view class="section-title">附件列表 ({{ attachments.length }}个)</view>
      <view class="attachment-list">
        <view
          v-for="attach in attachments"
          :key="attach.id"
          class="attachment-item"
        >
          <view class="attachment-info">
            <text class="file-icon">{{ getFileIcon(attach.originalFileName) }}</text>
            <view class="file-details">
              <text class="file-name">{{ attach.originalFileName }}</text>
              <text class="file-meta">{{ formatFileSize(attach.fileSize) }} · {{ attach.fileExtension }}</text>
            </view>
          </view>
          <view class="attachment-actions" v-if="attach.filePath">
            <text class="file-action-btn" @click="handlePreviewFile(attach)">预览</text>
            <text class="file-action-btn" @click="handleDownloadFile(attach)">下载</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="info-section" v-if="document.remark">
      <view class="section-title">审批意见</view>
      <view class="remark-box">
        <text class="remark-text">{{ document.remark }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar" v-if="document.status === 'PENDING'">
      <view class="action-btn reject-btn" @click="showRejectDialog = true">
        <text>驳回</text>
      </view>
      <view class="action-btn approve-btn" @click="handleApprove">
        <text>通过</text>
      </view>
    </view>
    <view class="action-bar" v-else>
      <view class="action-btn back-btn" @click="handleBack">
        <text>返回</text>
      </view>
    </view>

    <!-- 驳回意见弹窗 -->
    <view class="dialog-overlay" v-if="showRejectDialog">
      <view class="dialog-mask" @click="showRejectDialog = false"></view>
      <view class="dialog-container">
        <view class="dialog-header">
          <text class="dialog-title">驳回文书</text>
          <text class="dialog-close" @click="showRejectDialog = false">✕</text>
        </view>
        <view class="dialog-content">
          <view class="form-item">
            <text class="label">驳回原因</text>
            <textarea
              v-model="rejectOpinion"
              class="textarea"
              placeholder="请输入驳回原因"
              :maxlength="500"
            />
          </view>
        </view>
        <view class="dialog-footer">
          <view class="dialog-btn cancel" @click="showRejectDialog = false">
            <text>取消</text>
          </view>
          <view class="dialog-btn confirm danger" @click="handleReject">
            <text>确认驳回</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 通过确认弹窗 -->
    <view class="dialog-overlay" v-if="showApproveDialog">
      <view class="dialog-mask" @click="showApproveDialog = false"></view>
      <view class="dialog-container">
        <view class="dialog-header">
          <text class="dialog-title">确认通过</text>
          <text class="dialog-close" @click="showApproveDialog = false">✕</text>
        </view>
        <view class="dialog-content">
          <view class="form-item">
            <text class="label">审批意见（选填）</text>
            <textarea
              v-model="approveOpinion"
              class="textarea"
              placeholder="请输入审批意见"
              :maxlength="500"
            />
          </view>
        </view>
        <view class="dialog-footer">
          <view class="dialog-btn cancel" @click="showApproveDialog = false">
            <text>取消</text>
          </view>
          <view class="dialog-btn confirm primary" @click="confirmApprove">
            <text>确认通过</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view class="loading-container" v-else>
    <text>加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getDocumentDetailApi,
  getDocumentAttachmentsApi,
  updateDocumentStatusRemarkApi,
  getDocumentStatusText,
  getDocumentStatusClass,
  formatFileSize,
  type DocumentDelivery,
  type DocumentAttachment,
} from '@/api/document-service'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const document = ref<DocumentDelivery | null>(null)
const attachments = ref<DocumentAttachment[]>([])
const documentId = ref('')
const showRejectDialog = ref(false)
const showApproveDialog = ref(false)
const rejectOpinion = ref('')
const approveOpinion = ref('')

onMounted(() => {
  documentId.value = getPageParam('id')
  if (documentId.value) {
    loadDetail()
    loadAttachments()
  }
})

const loadDetail = async () => {
  try {
    const res = await getDocumentDetailApi(Number(documentId.value))
    document.value = res.data ? { ...res.data } : null
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadAttachments = async () => {
  try {
    const res = await getDocumentAttachmentsApi(Number(documentId.value))
    attachments.value = Array.isArray(res.data) ? res.data.map((item) => ({ ...item })) : []
  } catch (error) {
    // 静默处理
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const handleApprove = () => {
  approveOpinion.value = ''
  showApproveDialog.value = true
}

const confirmApprove = async () => {
  try {
    await updateDocumentStatusRemarkApi(Number(documentId.value), {
      status: 'APPROVED',
      remark: approveOpinion.value || undefined,
    })
    uni.showToast({ title: '审批通过', icon: 'success' })
    showApproveDialog.value = false
    uni.$emit('refresh-approval-list')
    await loadDetail()
  } catch (error: any) {
    uni.showToast({ title: error?.message || '操作失败', icon: 'none' })
  }
}

const handleReject = async () => {
  try {
    await updateDocumentStatusRemarkApi(Number(documentId.value), {
      status: 'REJECTED',
      remark: rejectOpinion.value || undefined,
    })
    uni.showToast({ title: '已驳回', icon: 'success' })
    showRejectDialog.value = false
    uni.$emit('refresh-approval-list')
    await loadDetail()
  } catch (error: any) {
    uni.showToast({ title: error?.message || '操作失败', icon: 'none' })
  }
}

const getFileIcon = (fileName?: string) => {
  if (!fileName) return '📄'
  if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName)) return '🖼️'
  if (/\.pdf$/i.test(fileName)) return '📕'
  if (/\.docx?$/i.test(fileName)) return '📝'
  if (/\.xlsx?$/i.test(fileName)) return '📊'
  return '📎'
}

const handlePreviewFile = (file: DocumentAttachment) => {
  if (!file.filePath) {
    uni.showToast({ title: '文件路径不存在', icon: 'none' })
    return
  }
  const downloadUrl = file.filePath.startsWith('http') ? file.filePath : file.filePath
  uni.downloadFile({
    url: downloadUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          fail: () => {
            uni.showToast({ title: '无法预览该文件', icon: 'none' })
          },
        })
      } else {
        uni.showToast({ title: '下载文件失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '下载文件失败', icon: 'none' })
    },
  })
}

const handleDownloadFile = (file: DocumentAttachment) => {
  if (!file.filePath) {
    uni.showToast({ title: '文件路径不存在', icon: 'none' })
    return
  }
  const downloadUrl = file.filePath.startsWith('http') ? file.filePath : file.filePath
  uni.downloadFile({
    url: downloadUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            uni.showToast({ title: '文件已保存', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '保存失败', icon: 'none' })
          },
        })
      }
    },
    fail: () => {
      uni.showToast({ title: '下载失败', icon: 'none' })
    },
  })
}

const formatDateTime = (date?: string | null) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 180rpx;
}

.header-card {
  background: linear-gradient(135deg, #0068E2, #004bb5);
  padding: 40rpx;
  color: #fff;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .approval-no {
      font-size: 26rpx;
      opacity: 0.9;
    }

    .status-badge {
      font-size: 22rpx;
      padding: 8rpx 24rpx;
      border-radius: 24rpx;
      background: rgba(255, 255, 255, 0.2);

      &.status-pending {
        background: rgba(255, 152, 0, 0.35);
      }

      &.status-approved {
        background: rgba(76, 175, 80, 0.35);
      }

      &.status-rejected {
        background: rgba(244, 67, 54, 0.35);
      }
    }
  }

  .approval-title {
    font-size: 36rpx;
    font-weight: bold;
    line-height: 1.4;
    margin-bottom: 16rpx;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .type-tag {
      font-size: 22rpx;
      padding: 6rpx 18rpx;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 6rpx;
    }

    .meta-text {
      font-size: 24rpx;
      opacity: 0.85;
    }
  }
}

.info-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 28rpx;
        color: #999;
        min-width: 140rpx;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        text-align: right;
        flex: 1;
        margin-left: 20rpx;
        word-break: break-all;

        &.status-pending {
          color: #ff9800;
        }

        &.status-approved {
          color: #4caf50;
        }

        &.status-rejected {
          color: #f44336;
        }
      }
    }
  }

  .content-box {
    padding: 20rpx;
    background: #fafafa;
    border-radius: 12rpx;
    border: 1rpx solid #eee;

    .content-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  .remark-box {
    padding: 20rpx;
    background: #fef0f0;
    border-radius: 12rpx;
    border: 1rpx solid #fbc4ab;

    .remark-text {
      font-size: 28rpx;
      color: #e6a23c;
      line-height: 1.6;
    }
  }
}

.attachment-list {
  .attachment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx;
    background: #fafafa;
    border-radius: 8rpx;
    margin-bottom: 10rpx;
    border: 1rpx solid #f0f0f0;

    .attachment-info {
      display: flex;
      align-items: center;
      flex: 1;
      overflow: hidden;

      .file-icon {
        font-size: 36rpx;
        margin-right: 16rpx;
      }

      .file-details {
        overflow: hidden;

        .file-name {
          font-size: 26rpx;
          color: #333;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-meta {
          font-size: 22rpx;
          color: #999;
        }
      }
    }

    .attachment-actions {
      display: flex;
      gap: 8rpx;

      .file-action-btn {
        font-size: 24rpx;
        color: #0068E2;
        padding: 8rpx 20rpx;
        background: rgba(0, 104, 226, 0.06);
        border-radius: 6rpx;

        &:active {
          background: rgba(0, 104, 226, 0.12);
        }
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;

  .action-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: 500;

    &.back-btn {
      background: #f5f7fa;
      color: #333;
      border: 1rpx solid #e8e8e8;

      &:active {
        background: #e8e8e8;
      }
    }

    &.reject-btn {
      background: #fff;
      color: #ff4d4f;
      border: 2rpx solid #ff4d4f;

      &:active {
        background: #fff1f0;
      }
    }

    &.approve-btn {
      background: #0068E2;
      color: #fff;

      &:active {
        background: #0052b3;
      }
    }
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  .dialog-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .dialog-container {
    position: relative;
    width: 600rpx;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .dialog-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .dialog-close {
      font-size: 40rpx;
      color: #999;
      line-height: 1;
      padding: 0 10rpx;
    }
  }

  .dialog-content {
    padding: 30rpx;
    max-height: 60vh;
    overflow-y: auto;

    .form-item {
      .label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: block;
      }

      .textarea {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 12rpx;
        font-size: 28rpx;
        background: #fafafa;
        min-height: 160rpx;
        box-sizing: border-box;
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 20rpx;
    padding: 0 30rpx 30rpx;

    .dialog-btn {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;
      font-weight: 500;

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm {
        color: #fff;

        &.primary {
          background: #0068E2;
        }

        &.danger {
          background: #ff4d4f;
        }
      }
    }
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #999;
  font-size: 28rpx;
}
</style>