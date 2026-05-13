<template>
  <view class="detail-container" v-if="approval">
    <!-- 头部信息 -->
    <view class="header-card">
      <view class="header-top">
        <text class="approval-no">审批 #{{ approval.id }}</text>
        <text :class="['status-badge', getApprovalStatusClass(approval.approvalStatus)]">
          {{ getApprovalStatusText(approval.approvalStatus) }}
        </text>
      </view>
      <text class="approval-title">{{ approval.approvalTitle }}</text>
      <view class="header-meta">
        <text class="type-tag">{{ getApprovalTypeText(approval.approvalType) }}</text>
        <text class="meta-text">案件编号：{{ approval.caseNumber || '-' }}</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="info-section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">审批ID</text>
          <text class="value">{{ approval.id }}</text>
        </view>
        <view class="info-item">
          <text class="label">案件编号</text>
          <text class="value">{{ approval.caseNumber || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">审批类型</text>
          <text class="value">{{ getApprovalTypeText(approval.approvalType) }}</text>
        </view>
        <view class="info-item">
          <text class="label">审批标题</text>
          <text class="value">{{ approval.approvalTitle }}</text>
        </view>
        <view class="info-item">
          <text class="label">提交人</text>
          <text class="value">{{ approval.realName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">审批次数</text>
          <text class="value">{{ approval.approvalCount }}</text>
        </view>
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDateTime(approval.createTime) }}</text>
        </view>
        <view class="info-item">
          <text class="label">更新时间</text>
          <text class="value">{{ formatDateTime(approval.updateTime) }}</text>
        </view>
        <view class="info-item" v-if="approval.approvalDate">
          <text class="label">审批时间</text>
          <text class="value">{{ formatDateTime(approval.approvalDate) }}</text>
        </view>
        <view class="info-item" v-if="approval.approvalResult">
          <text class="label">审批结果</text>
          <text :class="['value', getApprovalResultClass(approval.approvalResult)]">
            {{ getApprovalResultText(approval.approvalResult) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 解析的内容：任务信息 -->
    <view class="info-section" v-if="contentData && 'task' in contentData && contentData.task">
      <view class="section-title">任务信息</view>
      <view class="task-info-list">
        <view class="info-item">
          <text class="label">任务编码</text>
          <text class="value">{{ contentData.task.taskCode }}</text>
        </view>
        <view class="info-item">
          <text class="label">任务名称</text>
          <text class="value">{{ contentData.task.taskName }}</text>
        </view>
        <view class="info-item">
          <text class="label">任务状态</text>
          <text class="value">{{ contentData.task.status }}</text>
        </view>
        <view class="info-item" v-if="contentData.task.taskDescription">
          <text class="label">任务描述</text>
          <text class="value">{{ contentData.task.taskDescription }}</text>
        </view>
      </view>

      <!-- 提交记录 -->
      <view
        v-if="contentData.submissions && contentData.submissions.length > 0"
        class="submissions-section"
      >
        <view class="sub-section-title">提交记录 ({{ contentData.submissions.length }}条)</view>
        <view
          v-for="submission in contentData.submissions"
          :key="submission.id"
          class="submission-card"
        >
          <view class="submission-header">
            <text class="submission-index">提交 #{{ submission.submissionNumber }}</text>
            <text class="submission-title-text">{{ submission.submissionTitle }}</text>
            <text
              :class="['submission-status', submission.status === 'APPROVED' ? 'tag-approved' : 'tag-pending']"
            >
              {{ submission.status === 'APPROVED' ? '已通过' : '待审核' }}
            </text>
          </view>
          <view class="submission-body">
            <view class="submission-content" v-if="submission.submissionContent">
              <text class="content-label">提交内容：</text>
              <text class="content-text">{{ submission.submissionContent }}</text>
            </view>
            <text class="submission-time">提交时间：{{ formatDateTime(submission.createTime) }}</text>
          </view>

          <!-- 该提交的附件 -->
          <view
            v-if="attachmentData && 'files' in attachmentData && attachmentData.files[submission.id]"
            class="submission-files"
          >
            <view class="files-label">
              附件文件 ({{ attachmentData.files[submission.id].length }}个)
            </view>
            <view
              v-for="file in attachmentData.files[submission.id]"
              :key="file.id"
              class="file-item"
            >
              <view class="file-info">
                <text class="file-icon">{{ getFileIcon(file.originalFileName) }}</text>
                <view class="file-details">
                  <text class="file-name">{{ file.originalFileName }}</text>
                  <text class="file-meta">{{ formatFileSize(file.fileSize) }} · {{ file.fileExtension }}</text>
                </view>
              </view>
              <view class="file-actions" v-if="file.filePath">
                <text class="file-action-btn" @click="handlePreviewFile(file)">预览</text>
                <text class="file-action-btn" @click="handleDownloadFile(file)">下载</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 原始审批内容（无法JSON解析时） -->
    <view class="info-section" v-else-if="contentData && 'originalContent' in contentData">
      <view class="section-title">审批内容</view>
      <view class="content-text">{{ contentData.originalContent }}</view>
    </view>

    <!-- 简单审批内容（无task结构时） -->
    <view class="info-section" v-else-if="approval.approvalContent">
      <view class="section-title">审批内容</view>
      <view class="content-text">{{ approval.approvalContent }}</view>
    </view>

    <!-- 解析的附件 -->
    <view
      class="info-section"
      v-if="attachmentData && 'files' in attachmentData && Object.keys(attachmentData.files).length > 0 && !contentData?.submissions?.length"
    >
      <view class="section-title">审批附件</view>
      <view v-for="(files, submissionId) in attachmentData.files" :key="submissionId" class="files-group">
        <view class="files-group-title">
          附件组 #{{ submissionId }} ({{ files.length }}个)
        </view>
        <view v-for="file in files" :key="file.id" class="file-item">
          <view class="file-info">
            <text class="file-icon">{{ getFileIcon(file.originalFileName) }}</text>
            <view class="file-details">
              <text class="file-name">{{ file.originalFileName }}</text>
              <text class="file-meta">{{ formatFileSize(file.fileSize) }} · {{ file.uploadTime ? formatDateTime(file.uploadTime) : '' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 原始附件（无法JSON解析时） -->
    <view class="info-section" v-else-if="attachmentData && 'originalAttachment' in attachmentData">
      <view class="section-title">审批附件</view>
      <view class="content-text">{{ attachmentData.originalAttachment }}</view>
    </view>

    <!-- 备注 -->
    <view class="info-section" v-if="approval.remark">
      <view class="section-title">备注</view>
      <view class="content-text">{{ approval.remark }}</view>
    </view>

    <!-- 审批历史 -->
    <view class="info-section">
      <view class="section-title">审批历史</view>
      <view class="timeline" v-if="approvalHistory.length > 0">
        <view class="timeline-item" v-for="(item, index) in approvalHistory" :key="item.id">
          <view class="timeline-dot" :class="getTimelineDotClass(index)"></view>
          <view class="timeline-content" :class="{ 'timeline-last': index === approvalHistory.length - 1 }">
            <view class="timeline-header">
              <text class="timeline-action">{{ getApprovalTypeText(item.approvalType) }}</text>
              <text :class="['timeline-status', getApprovalStatusClass(item.approvalStatus)]">
                {{ getApprovalStatusText(item.approvalStatus) }}
              </text>
            </view>
            <text class="timeline-opinion" v-if="item.approvalOpinion">
              审批意见：{{ item.approvalOpinion }}
            </text>
            <text class="timeline-time">{{ formatDateTime(item.createTime) }}</text>
          </view>
        </view>
      </view>
      <view class="empty-timeline" v-else>
        <text>暂无审批历史</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar" v-if="approval.approvalStatus === 'PENDING'">
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
          <text class="dialog-title">驳回审批</text>
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
  getApprovalDetail,
  getApprovalHistory,
  approveApproval,
  getApprovalStatusText,
  getApprovalStatusClass,
  getApprovalTypeText,
  getApprovalResultText,
  getApprovalResultClass,
  parseApprovalContent,
  parseApprovalAttachment,
  formatFileSize,
  type Approval,
  type ApprovalHistoryItem,
  type ApprovalContentData,
  type ApprovalAttachmentData,
  type ApprovalFile,
} from '@/api/approval'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const approval = ref<Approval | null>(null)
const approvalHistory = ref<ApprovalHistoryItem[]>([])
const approvalId = ref('')
const showRejectDialog = ref(false)
const showApproveDialog = ref(false)
const rejectOpinion = ref('')
const approveOpinion = ref('')
const contentData = ref<ApprovalContentData | { originalContent: string } | null>(null)
const attachmentData = ref<ApprovalAttachmentData | { originalAttachment: string } | null>(null)

onMounted(() => {
  approvalId.value = getPageParam('id')
  if (approvalId.value) {
    loadDetail()
    loadHistory()
  }
})

const loadDetail = async () => {
  try {
    const res = await getApprovalDetail(approvalId.value)
    const rawData = res.data
    approval.value = rawData ? { ...rawData } : null

    if (approval.value) {
      contentData.value = parseApprovalContent(approval.value.approvalContent)
      attachmentData.value = parseApprovalAttachment(approval.value.approvalAttachment)
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadHistory = async () => {
  try {
    const res = await getApprovalHistory(approvalId.value)
    approvalHistory.value = res.data?.list || []
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
    const userId = uni.getStorageSync('userInfo')?.userId || uni.getStorageSync('user_id') || 0
    await approveApproval(approvalId.value, {
      approvalResult: 'PASS',
      approvalOpinion: approveOpinion.value,
      approverId: Number(userId),
    })
    uni.showToast({ title: '审批通过', icon: 'success' })
    showApproveDialog.value = false
    uni.$emit('refresh-approval-list')
    await loadDetail()
    await loadHistory()
  } catch (error: any) {
    uni.showToast({ title: error?.message || '操作失败', icon: 'none' })
  }
}

const handleReject = async () => {
  try {
    const userId = uni.getStorageSync('userInfo')?.userId || uni.getStorageSync('user_id') || 0
    await approveApproval(approvalId.value, {
      approvalResult: 'REJECT',
      approvalOpinion: rejectOpinion.value,
      approverId: Number(userId),
    })
    uni.showToast({ title: '已驳回', icon: 'success' })
    showRejectDialog.value = false
    uni.$emit('refresh-approval-list')
    await loadDetail()
    await loadHistory()
  } catch (error: any) {
    uni.showToast({ title: error?.message || '操作失败', icon: 'none' })
  }
}

/** 文件图标 */
const getFileIcon = (fileName?: string) => {
  if (!fileName) return '📄'
  if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName)) return '🖼️'
  if (/\.pdf$/i.test(fileName)) return '📕'
  if (/\.docx?$/i.test(fileName)) return '📝'
  if (/\.xlsx?$/i.test(fileName)) return '📊'
  return '📎'
}

/** 预览文件 */
const handlePreviewFile = (file: ApprovalFile) => {
  if (!file.filePath) {
    uni.showToast({ title: '文件路径不存在', icon: 'none' })
    return
  }
  // uni-app 使用 downloadFile + openDocument 预览
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

/** 下载文件 */
const handleDownloadFile = (file: ApprovalFile) => {
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

const getTimelineDotClass = (index: number) => {
  if (index === 0) return 'dot-primary'
  return 'dot-default'
}

const formatDateTime = (date?: string) => {
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

      &.status-cancelled {
        background: rgba(158, 158, 158, 0.35);
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

  .sub-section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #555;
    margin: 20rpx 0 16rpx;
    padding-top: 20rpx;
    border-top: 1rpx dashed #e8e8e8;
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

        &.result-pass {
          color: #4caf50;
        }

        &.result-fail {
          color: #f44336;
        }
      }
    }
  }

  .task-info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 26rpx;
        color: #999;
        min-width: 140rpx;
      }

      .value {
        font-size: 26rpx;
        color: #333;
        text-align: right;
        flex: 1;
        margin-left: 20rpx;
        word-break: break-all;
      }
    }
  }

  .content-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.submissions-section {
  .submission-card {
    background: #fafafa;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #eee;

    .submission-header {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 16rpx;
      flex-wrap: wrap;

      .submission-index {
        font-size: 22rpx;
        color: #0068E2;
        background: rgba(0, 104, 226, 0.08);
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
      }

      .submission-title-text {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        flex: 1;
      }

      .submission-status {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;

        &.tag-approved {
          background: #e8f5e9;
          color: #4caf50;
        }

        &.tag-pending {
          background: #fff3e0;
          color: #ff9800;
        }
      }
    }

    .submission-body {
      .submission-content {
        margin-bottom: 12rpx;

        .content-label {
          font-size: 26rpx;
          color: #999;
        }

        .content-text {
          font-size: 26rpx;
          color: #555;
          margin-top: 8rpx;
          line-height: 1.6;
        }
      }

      .submission-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .submission-files {
      margin-top: 16rpx;
      padding-top: 16rpx;
      border-top: 1rpx solid #eee;

      .files-label {
        font-size: 26rpx;
        font-weight: 500;
        color: #666;
        margin-bottom: 12rpx;
      }

      .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx;
        background: #fff;
        border-radius: 8rpx;
        margin-bottom: 10rpx;
        border: 1rpx solid #f0f0f0;

        .file-info {
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

        .file-actions {
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
  }
}

.files-group {
  margin-bottom: 24rpx;

  .files-group-title {
    font-size: 26rpx;
    font-weight: 500;
    color: #666;
    margin-bottom: 12rpx;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx;
    background: #fafafa;
    border-radius: 8rpx;
    margin-bottom: 10rpx;

    .file-info {
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
  }
}

.timeline {
  padding: 10rpx 0;

  .timeline-item {
    display: flex;
    position: relative;

    .timeline-dot {
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      margin-top: 6rpx;
      margin-right: 20rpx;
      flex-shrink: 0;

      &.dot-primary {
        background: #0068E2;
        box-shadow: 0 0 0 6rpx rgba(0, 104, 226, 0.15);
      }

      &.dot-default {
        background: #c0c4cc;
        box-shadow: 0 0 0 6rpx rgba(192, 196, 204, 0.15);
      }
    }

    .timeline-content {
      flex: 1;
      padding-bottom: 30rpx;
      border-left: 2rpx solid #e8e8e8;
      padding-left: 20rpx;

      &.timeline-last {
        border-left-color: transparent;
        padding-bottom: 0;
      }

      .timeline-header {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-bottom: 8rpx;

        .timeline-action {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
        }

        .timeline-status {
          font-size: 22rpx;
          padding: 2rpx 12rpx;
          border-radius: 6rpx;

          &.status-pending {
            background: #fff3e0;
            color: #ff9800;
          }

          &.status-approved {
            background: #e8f5e9;
            color: #4caf50;
          }

          &.status-rejected {
            background: #ffebee;
            color: #f44336;
          }

          &.status-cancelled {
            background: #f5f5f5;
            color: #999;
          }
        }
      }

      .timeline-opinion {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 6rpx;
        line-height: 1.5;
      }

      .timeline-time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.empty-timeline {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
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