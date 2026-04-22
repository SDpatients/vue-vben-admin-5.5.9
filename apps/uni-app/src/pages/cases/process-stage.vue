<template>
  <view class="process-stage-container">
    <!-- 阶段头部 -->
    <view class="stage-header">
      <view class="stage-info">
        <text class="stage-name">{{ stageConfig.name }}</text>
        <text class="stage-desc">{{ stageConfig.description }}</text>
      </view>
      <view class="stage-progress">
        <u-circle-progress 
          :percent="completionRate" 
          :size="80"
          :border-width="6"
          active-color="#0068E2"
        >
          <text class="progress-text">{{ completionRate }}%</text>
        </u-circle-progress>
      </view>
    </view>

    <!-- 模块列表 -->
    <view class="module-list">
      <view 
        class="module-card" 
        v-for="(module, index) in stageConfig.modules" 
        :key="module.code"
        @click="handleModuleClick(module)"
      >
        <view class="module-header">
          <view class="module-icon">
            <u-icon :name="getModuleIcon(module.code)" size="24" color="#0068E2"></u-icon>
          </view>
          <view class="module-info">
            <text class="module-name">{{ module.name }}</text>
            <text class="module-status" :class="getModuleStatusClass(module.code)">
              {{ getModuleStatusText(module.code) }}
            </text>
          </view>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </view>
        
        <!-- 模块数据预览 -->
        <view class="module-preview" v-if="getModuleData(module.code)">
          <text class="preview-text">{{ getModuleData(module.code) }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <u-empty 
      v-if="stageConfig.modules.length === 0" 
      mode="list" 
      text="暂无模块数据"
    ></u-empty>

    <!-- 提交按钮 -->
    <view class="action-bar">
      <u-button 
        type="primary" 
        text="保存阶段数据"
        :loading="submitting"
        @click="handleSubmit"
      ></u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { stageConfig as defaultStageConfig } from '@/api/process'

console.log('=== process-stage.vue loaded ===')

const props = defineProps<{
  caseId: string
  stageNum: number
}>()

const stageData = ref<any[]>([])
const submitting = ref(false)

const stageConfig = computed(() => {
  return defaultStageConfig[props.stageNum as keyof typeof defaultStageConfig] || {
    name: '未知阶段',
    description: '',
    modules: []
  }
})

const completionRate = computed(() => {
  if (stageConfig.value.modules.length === 0) return 0
  const completed = stageConfig.value.modules.filter(m => getModuleData(m.code)).length
  return Math.round((completed / stageConfig.value.modules.length) * 100)
})

onMounted(() => {
  console.log('[onMounted] caseId:', props.caseId, 'stageNum:', props.stageNum)
  loadStageData()
})

const loadStageData = async () => {
  try {
    // TODO: 调用API获取阶段数据
    console.log('[loadStageData] Loading stage data...')
  } catch (error) {
    console.error('[loadStageData] Error:', error)
  }
}

const getModuleIcon = (code: string) => {
  const iconMap: Record<string, string> = {
    workTeam: 'account',
    workPlan: 'calendar',
    acceptance: 'file-text',
    assetsAndLiabilities: 'list',
    noticeAndNotice: 'bell',
    takeOver: 'download',
    auditInvestigation: 'search',
    propertySearch: 'eye',
    recoverDebt: 'red-packet',
    administrativeRecovery: 'reload',
    recoveryLawsuit: 'file-text',
    criminalOffense: 'warning',
    debtDeclaration: 'edit-pen',
    creditorRightExamination: 'search',
    creditor: 'account',
    creditorsMeeting: 'users',
    rightOfVoting: 'checkmark',
    creditorsCommittee: 'user-group',
    postClaimReview: 'reload',
    debtExaminationLitigation: 'file-text',
    resolution: 'file-text',
    resolutionRecord: 'list',
    voting: 'checkmark-circle',
    meetingMinutes: 'file-text',
    meetingMatters: 'list',
    meeting: 'users',
    notice: 'bell',
    agenda: 'list',
    reorganizationPlan: 'file-text',
    settlementAgreement: 'file-text',
    bankruptcyDeclaration: 'warning',
    propertyValuationPlan: 'file-text',
    assetValuation: 'search',
    propertyValuationImplementation: 'reload',
    auctionAgency: 'shop',
    propertyDistribution: 'red-packet',
    auditReport: 'file-text',
    propertyFinalReport: 'file-text',
    workSummaryReport: 'file-text',
    projectClosingApplication: 'checkmark',
    fileArchive: 'folder',
    accountCloseOut: 'close-circle',
    taxDeregistration: 'minus-circle',
    businessDeregistration: 'minus-circle',
    sealDestruction: 'trash',
    accountClosing: 'close-circle',
  }
  return iconMap[code] || 'file-text'
}

const getModuleStatusClass = (code: string) => {
  const data = getModuleData(code)
  return data ? 'completed' : 'pending'
}

const getModuleStatusText = (code: string) => {
  const data = getModuleData(code)
  return data ? '已完成' : '待处理'
}

const getModuleData = (code: string) => {
  const data = stageData.value.find(d => d.moduleCode === code)
  return data ? data.title || data.content : null
}

const handleModuleClick = (module: any) => {
  console.log('[handleModuleClick] module:', module)
  uni.navigateTo({
    url: `/pages/cases/process-module?caseId=${props.caseId}&stageNum=${props.stageNum}&moduleCode=${module.code}&moduleName=${encodeURIComponent(module.name)}`
  })
}

const handleSubmit = async () => {
  console.log('[handleSubmit] Submitting stage data...')
  submitting.value = true
  try {
    // TODO: 调用API保存阶段数据
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    console.error('[handleSubmit] Error:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.process-stage-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
  padding-bottom: 140rpx;
}

.stage-header {
  background: #0068E2;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stage-info {
    flex: 1;
    color: #fff;
    margin-right: 24rpx;

    .stage-name {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }

    .stage-desc {
      display: block;
      font-size: 24rpx;
      opacity: 0.9;
      line-height: 1.5;
    }
  }

  .stage-progress {
    .progress-text {
      font-size: 24rpx;
      color: #fff;
      font-weight: bold;
    }
  }
}

.module-list {
  .module-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

    .module-header {
      display: flex;
      align-items: center;

      .module-icon {
        width: 64rpx;
        height: 64rpx;
        background: #f0f4ff;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
      }

      .module-info {
        flex: 1;

        .module-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          margin-bottom: 4rpx;
        }

        .module-status {
          font-size: 22rpx;

          &.completed {
            color: #52c41a;
          }

          &.pending {
            color: #999;
          }
        }
      }
    }

    .module-preview {
      margin-top: 16rpx;
      padding: 16rpx;
      background: #f5f7fa;
      border-radius: 8rpx;

      .preview-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}
</style>
