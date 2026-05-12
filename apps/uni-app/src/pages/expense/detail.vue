<template>
  <view class="detail-container" v-if="expenseDetail">
    <!-- 头部信息 -->
    <view class="header-card">
      <view class="expense-no">{{ expenseDetail.reimbursementNumber }}</view>
      <view class="case-name">{{ expenseDetail.caseName }}</view>
      <view :class="['status-badge', getApprovalStatusClass(expenseDetail.approvalStatus)]">
        {{ getApprovalStatusText(expenseDetail.approvalStatus) }}
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="info-section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">报销单号</text>
          <text class="value">{{ expenseDetail.reimbursementNumber }}</text>
        </view>
        <view class="info-item">
          <text class="label">案件名称</text>
          <text class="value">{{ expenseDetail.caseName }}</text>
        </view>
        <view class="info-item">
          <text class="label">申请人</text>
          <text class="value">{{ expenseDetail.applicantName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">银行账户</text>
          <text class="value">{{ expenseDetail.fundAccountName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">开户行</text>
          <text class="value">{{ expenseDetail.bankName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">银行账号</text>
          <text class="value">{{ expenseDetail.bankAccount || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">报销日期</text>
          <text class="value">{{ formatDate(expenseDetail.reimbursementDate) }}</text>
        </view>
        <view class="info-item">
          <text class="label">报销金额</text>
          <text class="value amount">¥{{ formatAmount(expenseDetail.totalAmount) }}</text>
        </view>
        <view class="info-item" v-if="expenseDetail.description">
          <text class="label">报销说明</text>
          <text class="value">{{ expenseDetail.description }}</text>
        </view>
      </view>
    </view>

    <!-- 审批信息 -->
    <view class="info-section" v-if="expenseDetail.approvalStatus !== 'PENDING'">
      <view class="section-title">审批信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">审批人</text>
          <text class="value">{{ expenseDetail.approverName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">审批时间</text>
          <text class="value">{{ formatDateTime(expenseDetail.approvalTime) }}</text>
        </view>
        <view class="info-item" v-if="expenseDetail.approvalOpinion">
          <text class="label">审批意见</text>
          <text class="value">{{ expenseDetail.approvalOpinion }}</text>
        </view>
      </view>
    </view>

    <!-- 报销明细 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">报销明细</text>
      </view>
      <view class="item-list">
        <view class="item-card" v-for="(item, index) in expenseDetail.items" :key="item.id">
          <view class="item-header">
            <text class="item-name">{{ item.itemName }}</text>
            <text class="item-amount">¥{{ formatAmount(item.itemAmount) }}</text>
          </view>
          <view class="item-desc" v-if="item.itemDescription">{{ item.itemDescription }}</view>
          <view class="item-footer">
            <text class="item-index">明细 {{ index + 1 }}</text>
          </view>
        </view>
        <view class="empty-items" v-if="!expenseDetail.items || expenseDetail.items.length === 0">
          <text>暂无报销明细</text>
        </view>
      </view>
    </view>

    <!-- 附件列表 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">附件</text>
      </view>
      <view class="attachment-list">
        <view class="attachment-card" v-for="file in expenseDetail.attachments" :key="file.id">
          <view class="file-info">
            <text class="file-name">{{ file.fileName }}</text>
            <text class="file-size">{{ formatFileSize(file.fileSize) }}</text>
          </view>
          <view class="file-actions">
            <text class="action-btn" v-if="isImageFile(file.fileType)" @click="previewImage(file)">预览</text>
            <text class="action-btn" @click="downloadFile(file)">下载</text>
          </view>
        </view>
        <view class="empty-attachments" v-if="!expenseDetail.attachments || expenseDetail.attachments.length === 0">
          <text>暂无附件</text>
        </view>
      </view>
    </view>

    <!-- 创建信息 -->
    <view class="info-section">
      <view class="section-title">创建信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDateTime(expenseDetail.createTime) }}</text>
        </view>
        <view class="info-item">
          <text class="label">更新时间</text>
          <text class="value">{{ formatDateTime(expenseDetail.updateTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn" @click="handleBack">
        <text>返回</text>
      </view>
    </view>


  </view>

  <view class="loading-container" v-else>
    <text>加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getExpenseReimbursementDetail,
  downloadAndPreviewAttachment,
  downloadAttachmentFile,
  getApprovalStatusText,
  getApprovalStatusClass,
  type ExpenseReimbursement,
} from '@/api/expense-reimbursement'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const expenseDetail = ref<ExpenseReimbursement | null>(null)
const expenseId = ref('')

onMounted(() => {
  expenseId.value = getPageParam('id')
  if (expenseId.value) {
    loadDetail()
  }
})

onShow(() => {
  if (expenseId.value) {
    loadDetail()
  }
})

const loadDetail = async () => {
  try {
    const res = await getExpenseReimbursementDetail(expenseId.value)
    const rawData = res.data
    expenseDetail.value = rawData ? { ...rawData } : null
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const isImageFile = (fileType?: string): boolean => {
  if (!fileType) return false
  const ext = fileType.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'image/'].some(e => ext.includes(e))
}

const previewImage = async (file: any) => {
  uni.showLoading({ title: '加载中...' })
  
  try {
    const localPath = await downloadAndPreviewAttachment(file.id)
    uni.hideLoading()
    uni.previewImage({
      urls: [localPath],
      current: localPath,
    })
  } catch (error: any) {
    uni.hideLoading()
    if (error?.message?.includes('登录已过期')) {
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
    } else {
      uni.showToast({ title: error?.message || '预览失败', icon: 'none' })
    }
  }
}

const downloadFile = async (file: any) => {
  uni.showLoading({ title: '下载中...' })
  
  try {
    await downloadAttachmentFile(file.id, file.fileName)
    uni.hideLoading()
    uni.showToast({ title: '下载成功', icon: 'success' })
  } catch (error: any) {
    uni.hideLoading()
    if (error?.message?.includes('登录已过期')) {
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
    } else {
      uni.showToast({ title: error?.message || '下载失败', icon: 'none' })
    }
  }
}

const formatDate = (date?: string | null) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date?: string | null) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toFixed(2)
}

const formatFileSize = (size?: number) => {
  if (!size) return '0 B'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 180rpx;
}

.header-card {
  background: #0068E2;
  padding: 40rpx;
  color: #fff;

  .expense-no {
    font-size: 26rpx;
    opacity: 0.9;
    margin-bottom: 16rpx;
  }

  .case-name {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    line-height: 1.4;
  }

  .status-badge {
    display: inline-block;
    font-size: 22rpx;
    padding: 8rpx 24rpx;
    border-radius: 24rpx;
    background: rgba(255, 255, 255, 0.2);

    &.status-pending {
      background: rgba(255, 152, 0, 0.3);
    }

    &.status-approved {
      background: rgba(76, 175, 80, 0.3);
    }

    &.status-rejected {
      background: rgba(244, 67, 54, 0.3);
    }
  }
}

.info-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      padding-left: 16rpx;
      border-left: 6rpx solid #0068E2;
    }

    .section-action {
      font-size: 26rpx;
      color: #0068E2;
      padding: 8rpx 16rpx;
      background: #f0f4ff;
      border-radius: 8rpx;
    }
  }

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
        min-width: 180rpx;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        text-align: right;
        flex: 1;
        margin-left: 20rpx;
        word-break: break-all;

        &.amount {
          color: #f44336;
          font-size: 32rpx;
        }
      }
    }
  }

  .item-list {
    .item-card {
      background: #f8f9fa;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .item-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }

        .item-amount {
          font-size: 32rpx;
          color: #f44336;
          font-weight: bold;
        }
      }

      .item-desc {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 16rpx;
        line-height: 1.5;
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16rpx;
        border-top: 1rpx solid #e8e8e8;

        .item-index {
          font-size: 24rpx;
          color: #999;
        }

        .item-delete {
          font-size: 26rpx;
          color: #ff4d4f;
          padding: 4rpx 12rpx;
        }
      }
    }

    .empty-items {
      text-align: center;
      padding: 60rpx 0;
      color: #999;
      font-size: 28rpx;
    }
  }

  .attachment-list {
    .attachment-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
      margin-bottom: 16rpx;

      .file-info {
        flex: 1;
        min-width: 0;

        .file-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          font-size: 24rpx;
          color: #999;
        }
      }

      .file-actions {
        display: flex;
        gap: 16rpx;

        .action-btn {
          font-size: 26rpx;
          color: #0068E2;
          padding: 8rpx 16rpx;
          background: #f0f4ff;
          border-radius: 8rpx;

          &.delete {
            color: #ff4d4f;
            background: #fff2f0;
          }
        }
      }
    }

    .empty-attachments {
      text-align: center;
      padding: 60rpx 0;
      color: #999;
      font-size: 28rpx;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  right: 0;
  display: flex;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;

  .action-btn {
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

    &.primary {
      background: #0068E2;
      color: #fff;
      border: none;

      &:active {
        background: #0052b3;
      }
    }

    &.danger {
      background: #ff4d4f;
      color: #fff;
      border: none;

      &:active {
        background: #d9363e;
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

.dialog-container {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

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
      font-size: 48rpx;
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
      margin-bottom: 30rpx;

      .label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: block;

        .required {
          color: #ff4d4f;
        }
      }

      .input {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
      }

      .textarea {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
        min-height: 120rpx;
      }

      .picker-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        background: #fafafa;

        text {
          font-size: 28rpx;
          color: #333;
        }

        .picker-arrow {
          color: #999;
        }
      }

      .radio-group {
        display: flex;
        gap: 20rpx;

        .radio-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12rpx;
          padding: 24rpx;
          background: #f5f5f5;
          border-radius: 12rpx;
          font-size: 28rpx;
          color: #666;

          &.active {
            background: #e3f2fd;
            color: #0068E2;
            border: 2rpx solid #0068E2;
          }

          .radio-icon {
            font-size: 32rpx;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 20rpx;
    padding: 0 30rpx 30rpx;

    .dialog-btn {
      flex: 1;
      margin: 0;

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
</style>
