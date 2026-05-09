<template>
  <view class="detail-container" v-if="caseDetail">
    <view class="header-card">
      <view class="case-no">{{ caseDetail.caseNumber }}</view>
      <view class="case-name">{{ caseDetail.caseName }}</view>
      <view :class="['status-badge', getStatusClass(caseDetail.caseStatus)]">
        {{ getStatusText(caseDetail.caseStatus) }}
      </view>
      <view v-if="caseDetail.caseProgress" class="progress-badge">
        {{ getProgressText(caseDetail.caseProgress) }}
      </view>
    </view>

    <view class="info-section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">案件编号</text>
          <text class="value">{{ caseDetail.caseNumber }}</text>
        </view>
        <view class="info-item">
          <text class="label">案件名称</text>
          <text class="value">{{ caseDetail.caseName }}</text>
        </view>
        <view class="info-item">
          <text class="label">案由</text>
          <text class="value">{{ caseDetail.caseReason || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">案件来源</text>
          <text class="value">{{ caseDetail.caseSource || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">主要负责人</text>
          <text class="value">{{ caseDetail.mainResponsiblePerson || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">承办人员</text>
          <text class="value">{{ caseDetail.undertakingPersonnel || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">受理法院</text>
          <text class="value">{{ caseDetail.acceptanceCourt || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">指定机构</text>
          <text class="value">{{ caseDetail.designatedInstitution || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">指定法官</text>
          <text class="value">{{ caseDetail.designatedJudge || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">是否简易审理</text>
          <text class="value">{{ caseDetail.isSimplifiedTrial ? '是' : '否' }}</text>
        </view>
      </view>
    </view>

    <view class="info-section">
      <view class="section-title">时间信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">受理日期</text>
          <text class="value">{{ formatDate(caseDetail.acceptanceDate) }}</text>
        </view>
        <view class="info-item">
          <text class="label">债权申报截止日期</text>
          <text class="value">{{ formatDate(caseDetail.debtClaimDeadline) }}</text>
        </view>
        <view class="info-item" v-if="caseDetail.filingDate">
          <text class="label">立案日期</text>
          <text class="value">{{ formatDate(caseDetail.filingDate) }}</text>
        </view>
        <view class="info-item" v-if="caseDetail.closingDate">
          <text class="label">结案日期</text>
          <text class="value">{{ formatDate(caseDetail.closingDate) }}</text>
        </view>
        <view class="info-item" v-if="caseDetail.bankruptcyDate">
          <text class="label">破产日期</text>
          <text class="value">{{ formatDate(caseDetail.bankruptcyDate) }}</text>
        </view>
        <view class="info-item" v-if="caseDetail.terminationDate">
          <text class="label">终止日期</text>
          <text class="value">{{ formatDate(caseDetail.terminationDate) }}</text>
        </view>
        <view class="info-item" v-if="caseDetail.cancellationDate">
          <text class="label">注销日期</text>
          <text class="value">{{ formatDate(caseDetail.cancellationDate) }}</text>
        </view>
        <view class="info-item" v-if="caseDetail.archivingDate">
          <text class="label">归档日期</text>
          <text class="value">{{ formatDate(caseDetail.archivingDate) }}</text>
        </view>
      </view>
    </view>

    <view class="info-section" v-if="caseDetail.remarks">
      <view class="section-title">备注信息</view>
      <view class="description">
        {{ caseDetail.remarks }}
      </view>
    </view>

    <view class="info-section">
      <view class="section-title">创建信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDateTime(caseDetail.createTime) }}</text>
        </view>
        <view class="info-item">
          <text class="label">更新时间</text>
          <text class="value">{{ formatDateTime(caseDetail.updateTime) }}</text>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <view class="action-btn" @click="handleBack">
        <text>返回</text>
      </view>
      <view class="action-btn" @click="handleEdit">
        <text>编辑</text>
      </view>
      <view class="action-btn" @click="handleViewFiles">
        <text>文件</text>
      </view>
      <view class="action-btn" @click="handleProcess">
        <text>流程</text>
      </view>
    </view>

    <!-- 功能按钮区域 -->
    <view class="feature-section">
      <view class="section-title">案件功能</view>
      <view class="feature-list">
        <view class="feature-item" @click="handleWorkTeam">
          <text class="feature-text">工作团队</text>
          <text class="arrow">›</text>
        </view>
        <view class="feature-item" @click="handleClaimManage">
          <text class="feature-text">债权管理</text>
          <text class="arrow">›</text>
        </view>
        <view class="feature-item" @click="handleDebtor">
          <text class="feature-text">债务人管理</text>
          <text class="arrow">›</text>
        </view>
        <view class="feature-item" @click="handleWorkLog">
          <text class="feature-text">工作日志</text>
          <text class="arrow">›</text>
        </view>
        <view class="feature-item" @click="handleAnnouncement">
          <text class="feature-text">公告管理</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>
  </view>

  <view class="loading-container" v-else>
    <text>加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCaseDetail, type CaseDetail } from '@/api/case'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const caseDetail = shallowRef<CaseDetail | null>(null)
const caseId = ref('')

onMounted(() => {
  caseId.value = getPageParam('id')

  if (caseId.value) {
    loadDetail()
  }
})

onShow(() => {
  if (caseId.value) {
    loadDetail()
  }
})

const loadDetail = async () => {
  try {
    const res = await getCaseDetail(caseId.value)
    const rawData = res.data
    caseDetail.value = rawData ? { ...rawData } : null
  } catch (error: any) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    ONGOING: '进行中',
    IN_PROGRESS: '进行中',
    CLOSED: '已结案',
    COMPLETED: '已完成',
    PENDING: '待处理',
    ARCHIVED: '已归档',
    TERMINATED: '已终结',
  }
  return map[status || ''] || status || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    ONGOING: 'status-processing',
    IN_PROGRESS: 'status-processing',
    CLOSED: 'status-completed',
    COMPLETED: 'status-completed',
    PENDING: 'status-pending',
    ARCHIVED: 'status-archived',
    TERMINATED: 'status-terminated',
  }
  return map[status || ''] || ''
}

const getProgressText = (progress?: string) => {
  const map: Record<string, string> = {
    FIRST: '一、申请与受理',
    SECOND: '二、管理人履职与财产接管',
    THIRD: '三、债权申报与核查',
    FOURTH: '四、债权人会议',
    FIFTH: '五、重整和解及破产宣告',
    SIXTH: '六、财产变价与分配',
    SEVENTH: '七、程序终结',
  }
  return map[progress || ''] || progress || '-'
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const handleBack = () => {
  uni.navigateBack()
}

const handleEdit = () => {
  uni.navigateTo({ url: `/pages/cases/edit?id=${caseId.value}` })
}

const handleViewFiles = () => {
  uni.navigateTo({ url: `/pages/cases/files?id=${caseId.value}` })
}

const handleProcess = () => {
  uni.navigateTo({ url: `/pages/cases/process?id=${caseId.value}` })
}

const handleWorkTeam = () => {
  uni.navigateTo({ url: `/pages/cases/work-team?id=${caseId.value}` })
}

const handleClaimManage = () => {
  uni.navigateTo({ url: `/pages/cases/claim-manage?id=${caseId.value}` })
}

const handleDebtor = () => {
  uni.navigateTo({ url: `/pages/cases/debtor?id=${caseId.value}` })
}

const handleWorkLog = () => {
  uni.navigateTo({ url: `/pages/cases/work-log?id=${caseId.value}` })
}

const handleAnnouncement = () => {
  // 缓存案件信息供公告列表页使用
  if (caseDetail.value) {
    uni.setStorageSync('current_case_info', {
      id: caseDetail.value.id,
      caseNumber: caseDetail.value.caseNumber,
      caseName: caseDetail.value.caseName,
    })
  }
  uni.navigateTo({ url: `/pages/cases/announcement-list?caseId=${caseId.value}` })
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

  .case-no {
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
    margin-right: 16rpx;

    &.status-processing {
      background: rgba(33, 150, 243, 0.3);
    }

    &.status-completed {
      background: rgba(76, 175, 80, 0.3);
    }

    &.status-pending {
      background: rgba(255, 152, 0, 0.3);
    }

    &.status-archived {
      background: rgba(158, 158, 158, 0.3);
    }

    &.status-terminated {
      background: rgba(244, 67, 54, 0.3);
    }
  }

  .progress-badge {
    display: inline-block;
    font-size: 20rpx;
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
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
      }
    }
  }

  .description {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
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

.feature-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 140rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .feature-list {
    .feature-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 16rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: #f8f9fa;
      }

      .feature-text {
        font-size: 28rpx;
        color: #333;
      }

      .arrow {
        font-size: 36rpx;
        color: #ccc;
      }
    }
  }
}
</style>
