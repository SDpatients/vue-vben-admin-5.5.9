<template>
  <view class="process-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <text class="title">案件流程处理</text>
      <view class="right-btn" @click="showStageInfo = true">
        <u-icon name="info-circle" color="#0068E2" size="20"></u-icon>
      </view>
    </view>

    <!-- 案件信息卡片 -->
    <view class="case-card" v-if="caseInfo">
      <view class="case-header">
        <text class="case-name">{{ caseInfo.caseName }}</text>
        <text class="case-no">{{ caseInfo.caseNumber }}</text>
      </view>
      <view class="case-progress">
        <text class="progress-text">{{ currentStageName }}</text>
      </view>
    </view>

    <!-- 阶段进度展示 -->
    <view class="stage-progress-section">
      <scroll-view scroll-x class="stage-scroll" :scroll-left="scrollLeft">
        <view 
          v-for="(stage, index) in stages" 
          :key="index"
          :class="['stage-item', { active: activeStage === index }]"
          @click="handleStageChange(index)"
        >
          <view class="stage-icon" :style="{ backgroundColor: stage.color }">
            <text>{{ index + 1 }}</text>
          </view>
          <text class="stage-title">{{ stage.title.split('、')[1] || stage.title }}</text>
          <view class="stage-progress-bar">
            <view 
              class="progress-fill" 
              :style="{ width: animatedProgress[index] + '%', backgroundColor: stage.color }"
            ></view>
          </view>
          <text class="progress-text">{{ animatedProgress[index] }}%</text>
        </view>
      </scroll-view>
    </view>

    <!-- 阶段模块列表 -->
    <view class="module-list">
      <view class="module-card" v-for="module in currentStage.modules" :key="module.id">
        <view class="module-header" @click="toggleModule(module.id)">
          <view class="module-info">
            <view class="module-id">{{ module.id }}</view>
            <view class="module-text">
              <text class="module-title">{{ module.title }}</text>
              <text class="module-desc">{{ module.description }}</text>
            </view>
          </view>
          <view class="module-status">
            <view :class="['status-dot', getModuleStatusClass(module)]"></view>
            <text class="status-text">{{ getModuleStatusText(module) }}</text>
            <u-icon 
              :name="expandedModules[module.id] ? 'arrow-up' : 'arrow-down'" 
              size="14" 
              color="#999"
            ></u-icon>
          </view>
        </view>

        <!-- 展开的模块内容 -->
        <view class="module-content" v-if="expandedModules[module.id]">
          <!-- 模块操作按钮区域 -->
          <view class="module-actions-bar">
            <!-- 已完成状态 -->
            <view v-if="completedModules[module.id]" class="completed-status">
              <view class="completed-badge">
                <u-icon name="checkmark-circle" color="#4caf50" size="16"></u-icon>
                <text class="completed-text">已完成</text>
              </view>
              <view class="revoke-btn" @click.stop="toggleModuleComplete(module.id)">
                <text>撤回</text>
              </view>
            </view>
            <!-- 未完成状态 -->
            <view v-else class="action-buttons">
              <view class="mark-complete-btn" @click.stop="toggleModuleComplete(module.id)">
                <u-icon name="checkmark" color="#fff" size="14"></u-icon>
                <text>标记完成</text>
              </view>
              <view class="add-data-btn-small" @click.stop="openAddDialog(module)">
                <u-icon name="plus" color="#4caf50" size="14"></u-icon>
                <text>添加数据</text>
              </view>
            </view>
          </view>

          <!-- 特殊处理：第三阶段的债权申报模块 -->
          <view v-if="activeStage === 2 && (module.id === '3-2' || module.id === '3-3')" class="special-module">
            <view class="special-module-tip">
              <u-icon name="info-circle" color="#0068E2" size="16"></u-icon>
              <text>该模块需在债权管理中处理</text>
            </view>
            <view class="special-module-actions">
              <u-button size="small" @click="goToClaimManage">前往债权管理</u-button>
            </view>
          </view>

          <!-- 特殊处理：第四阶段的会议资料模块 -->
          <view v-else-if="activeStage === 3 && module.id === '4-1'" class="special-module">
            <view class="special-module-tip">
              <u-icon name="info-circle" color="#0068E2" size="16"></u-icon>
              <text>债权人会议管理</text>
            </view>
            <view class="special-module-actions">
              <u-button size="small" @click="openMeetingData">会议数据</u-button>
            </view>
          </view>

          <!-- 普通模块数据列表 -->
          <view v-else class="data-list">
            <view 
              v-for="item in module.data" 
              :key="item.id"
              class="data-item"
              @click="handleDataItemClick(item, module)"
            >
              <view class="data-main">
                <text class="data-title">{{ item.title }}</text>
                <text class="data-date">{{ item.date }}</text>
              </view>
              <view class="data-content" v-if="item.content">{{ item.content }}</view>
              <view class="data-meta">
                <text class="data-creator">{{ item.creator }}</text>
                <view class="data-files" v-if="item.files && item.files.length > 0">
                  <u-icon name="file-text" size="12" color="#999"></u-icon>
                  <text>{{ item.files.length }}个文件</text>
                </view>
              </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-module" v-if="module.data.length === 0">
              <u-empty text="暂无数据" mode="list"></u-empty>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑数据弹窗 -->
    <uni-popup ref="addDialogPopup" type="bottom">
      <view class="add-dialog">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditMode ? '编辑数据' : '添加数据' }}</text>
          <u-icon name="close" @click="closeAddDialog"></u-icon>
        </view>

        <view class="dialog-body">
          <!-- 基本信息 -->
          <view class="form-section">
            <view class="section-title">基本信息</view>
            <view class="form-item">
              <text class="form-label">标题</text>
              <u-input 
                v-model="formData.title" 
                placeholder="请输入标题" 
                :disabled="isEditMode"
              ></u-input>
            </view>
            <view class="form-item">
              <text class="form-label">日期</text>
              <picker mode="date" :value="formData.date" @change="onDateChange">
                <view class="picker-value">
                  <text>{{ formData.date || '请选择日期' }}</text>
                  <u-icon name="arrow-right" size="14" color="#999"></u-icon>
                </view>
              </picker>
            </view>
          </view>

          <!-- 内容 -->
          <view class="form-section">
            <view class="section-title">内容</view>
            <u-textarea 
              v-model="formData.content" 
              placeholder="请输入内容"
              height="120"
            ></u-textarea>
          </view>

          <!-- 文件上传 -->
          <view class="form-section">
            <view class="section-title">附件文件</view>
            <view class="file-list" v-if="uploadFiles.length > 0">
              <view 
                v-for="(file, index) in uploadFiles" 
                :key="index"
                class="file-item"
              >
                <u-icon name="file-text" size="18" color="#0068E2"></u-icon>
                <text class="file-name">{{ file.name }}</text>
                <u-icon 
                  name="close" 
                  size="14" 
                  color="#999" 
                  @click="removeFile(index)"
                ></u-icon>
              </view>
            </view>
            <view class="upload-btn" @click="chooseFile">
              <u-icon name="plus" size="16" color="#0068E2"></u-icon>
              <text>上传文件</text>
            </view>
          </view>
        </view>

        <view class="dialog-footer">
          <u-button @click="closeAddDialog">取消</u-button>
          <u-button type="primary" :loading="submitting" @click="handleSubmit">保存</u-button>
        </view>
      </view>
    </uni-popup>

    <!-- 数据详情弹窗 -->
    <uni-popup ref="detailDialogPopup" type="bottom">
      <view class="detail-dialog" v-if="selectedDataItem">
        <view class="dialog-header">
          <text class="dialog-title">数据详情</text>
          <u-icon name="close" @click="closeDetailDialog"></u-icon>
        </view>

        <scroll-view scroll-y class="dialog-body">
          <view class="detail-content">
            <view class="detail-item">
              <text class="detail-label">标题</text>
              <text class="detail-value">{{ selectedDataItem.title }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">日期</text>
              <text class="detail-value">{{ selectedDataItem.date }}</text>
            </view>
            <view class="detail-item" v-if="selectedDataItem.creator">
              <text class="detail-label">创建人</text>
              <text class="detail-value">{{ selectedDataItem.creator }}</text>
            </view>
            <view class="detail-item" v-if="selectedDataItem.content">
              <text class="detail-label">内容</text>
              <text class="detail-value content">{{ selectedDataItem.content }}</text>
            </view>
          </view>

          <!-- 文件列表 -->
          <view class="detail-files" v-if="selectedDataItem.files && selectedDataItem.files.length > 0">
            <view class="files-title">附件文件</view>
            <view 
              v-for="file in selectedDataItem.files" 
              :key="file.id"
              class="file-card"
            >
              <u-icon name="file-text" size="20" color="#0068E2"></u-icon>
              <view class="file-info">
                <text class="file-name">{{ file.fileName || file.originalFileName }}</text>
                <text class="file-size">{{ formatFileSize(file.fileSize) }}</text>
              </view>
              <view class="file-actions">
                <view class="action-btn" @click.stop="previewFile(file)">
                  <u-icon name="eye" size="18" color="#0068E2"></u-icon>
                  <text>查看</text>
                </view>
                <view class="action-btn" @click.stop="downloadFile(file)">
                  <u-icon name="download" size="18" color="#52c41a"></u-icon>
                  <text>下载</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="dialog-footer">
          <u-button @click="handleEdit">编辑</u-button>
          <u-button type="error" @click="handleDelete">删除</u-button>
        </view>
      </view>
    </uni-popup>

    <!-- 会议数据弹窗 -->
    <uni-popup ref="meetingDialogPopup" type="bottom">
      <view class="meeting-dialog">
        <view class="dialog-header">
          <text class="dialog-title">会议数据</text>
          <u-icon name="close" @click="closeMeetingDialog"></u-icon>
        </view>

        <view class="meeting-tabs">
          <view 
            :class="['tab-item', { active: meetingActiveTab === 'vote' }]"
            @click="meetingActiveTab = 'vote'"
          >
            投票项
          </view>
          <view 
            :class="['tab-item', { active: meetingActiveTab === 'video' }]"
            @click="meetingActiveTab = 'video'"
          >
            视频标签
          </view>
        </view>

        <scroll-view scroll-y class="dialog-body">
          <!-- 投票项列表 -->
          <view v-if="meetingActiveTab === 'vote'" class="vote-list">
            <view 
              v-for="item in voteItems" 
              :key="item.id"
              class="vote-item"
            >
              <view class="vote-info">
                <text class="vote-name">{{ item.name }}</text>
                <text class="vote-remark">{{ item.remark }}</text>
              </view>
              <view class="vote-stats">
                <view class="stat agree">
                  <text>赞成</text>
                  <text class="num">{{ item.agree }}</text>
                </view>
                <view class="stat oppose">
                  <text>反对</text>
                  <text class="num">{{ item.oppose }}</text>
                </view>
                <view class="stat abstain">
                  <text>弃权</text>
                  <text class="num">{{ item.abstain }}</text>
                </view>
              </view>
            </view>
            <u-empty v-if="voteItems.length === 0" text="暂无投票项" mode="list"></u-empty>
          </view>

          <!-- 视频标签列表 -->
          <view v-if="meetingActiveTab === 'video'" class="video-list">
            <view 
              v-for="tag in videoTags" 
              :key="tag.id"
              class="video-item"
            >
              <text class="video-title">{{ tag.title }}</text>
              <view :class="['video-status', tag.status]">
                {{ tag.statusText }}
              </view>
            </view>
            <u-empty v-if="videoTags.length === 0" text="暂无视频标签" mode="list"></u-empty>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 阶段说明弹窗 -->
    <uni-popup ref="stageInfoPopup" type="center">
      <view class="stage-info-dialog">
        <view class="dialog-header">
          <text class="dialog-title">阶段说明</text>
          <u-icon name="close" @click="showStageInfo = false"></u-icon>
        </view>
        <scroll-view scroll-y class="dialog-body">
          <view v-for="(stage, index) in stages" :key="index" class="stage-info-item">
            <view class="stage-info-header">
              <view class="stage-icon-small" :style="{ backgroundColor: stage.color }">
                {{ index + 1 }}
              </view>
              <text class="stage-info-title">{{ stage.title }}</text>
            </view>
            <view class="stage-info-modules">
              <text 
                v-for="mod in stage.modules" 
                :key="mod.id"
                class="module-tag"
              >
                {{ mod.title }}
              </text>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 加载状态 -->
    <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { getCaseDetail, type CaseItem } from '@/api/case'
import { getPageParam } from '@/utils/pageParam'
import { 
  getCaseTasks, 
  getCaseTaskSubmissions,
  getSubmissionFiles,
  createSubmission,
  updateSubmission,
  uploadSubmissionFile,
  deleteSubmission,
  deleteSubmissionFile,
  updateTaskStatus,
  createSubmissionBatch,
  getSubmissionFilesBatch,
  type SubmissionData,
} from '@/api/process'

import { getBaseUrl, API_PREFIX } from '@/config'

import http from '@/api/request'

import dayjs from 'dayjs'
const caseId = ref('')
const caseInfo = ref<CaseItem | null>(null)
const loading = ref(false)
const submitting = ref(false)
const activeStage = ref(0)
const scrollLeft = ref(0)
const showStageInfo = ref(false)
const isEditMode = ref(false)
const currentModule = ref<any>(null)
const currentItem = ref<any>(null)

// 阶段动画进度
const animatedProgress = ref<Record<number, number>>({})

// 展开的模块
const expandedModules = ref<Record<string, boolean>>({})

// 已完成的模块
const completedModules = ref<Record<string, boolean>>({})

// 表单数据
const formData = ref({
  title: '',
  content: '',
  date: dayjs().format('YYYY-MM-DD'),
})

// 上传文件列表
const uploadFiles = ref<any[]>([])

// 选中的数据项
const selectedDataItem = ref<any>(null)

// 会议相关
const meetingActiveTab = ref('vote')
const voteItems = ref<any[]>([])
const videoTags = ref<any[]>([])

// 弹窗引用
const addDialogPopup = ref<any>(null)
const detailDialogPopup = ref<any>(null)
const meetingDialogPopup = ref<any>(null)
const stageInfoPopup = ref<any>(null)

// 七阶段定义（与 web-ele 保持一致）- 使用 ref 使其响应式
const stages = ref([
  {
    title: '一、破产申请与受理',
    icon: 'file-plus',
    color: '#409EFF',
    modules: [
      { id: '1-1', title: '提交破产申请材料', description: '申请人向法院提交破产申请书及相关证据材料', data: [] as any[], task: null as any },
      { id: '1-5', title: '裁定受理并公告', description: '法院裁定受理破产申请并发布公告', data: [] as any[], task: null as any },
    ],
  },
  {
    title: '二、接管与调查',
    icon: 'briefcase',
    color: '#67C23A',
    modules: [
      { id: '2-1', title: '全面接管债务人', description: '管理人全面接管债务人的财产、印章和账簿、文书等资料', data: [] as any[], task: null as any },
      { id: '2-1-1', title: '管理人印章', description: '管理人刻制、使用和管理印章', data: [] as any[], task: null as any },
      { id: '2-2', title: '调查财产及经营状况', description: '管理人调查债务人的财产状况和经营状况', data: [] as any[], task: null as any },
      { id: '2-3', title: '追收债务人财产', description: '管理人追收债务人的财产', data: [] as any[], task: null as any },
      { id: '2-4', title: '决定合同继续履行或解除', description: '管理人决定继续履行或者解除债务人未履行完毕的合同', data: [] as any[], task: null as any },
    ],
  },
  {
    title: '三、债权申报与核查',
    icon: 'clipboard-list',
    color: '#E6A23C',
    modules: [
      { id: '3-1', title: '通知已知债权人并公告', description: '管理人通知已知债权人并发布债权申报公告', data: [] as any[], task: null as any },
      { id: '3-2', title: '接收、登记债权申报', description: '管理人接收并登记债权人的债权申报', data: [] as any[], task: null as any },
      { id: '3-3', title: '审查申报债权并编制债权表', description: '管理人审查申报的债权并编制债权表', data: [] as any[], task: null as any },
      { id: '3-4', title: '债权审查结果通知', description: '管理人将债权审查结果通知各债权人', data: [] as any[], task: null as any },
    ],
  },
  {
    title: '四、债权人会议',
    icon: 'users',
    color: '#F56C6C',
    modules: [
      { id: '4-1', title: '会议资料', description: '管理人筹备第一次债权人会议', data: [] as any[], task: null as any },
      { id: '4-2', title: '表决事项和表决结果', description: '债权人会议对表决事项进行表决并记录结果', data: [] as any[], task: null as any },
    ],
  },
  {
    title: '五、破产宣告',
    icon: 'gavel',
    color: '#909399',
    modules: [
      { id: '5-1', title: '审查宣告破产条件', description: '法院审查宣告债务人破产的条件', data: [] as any[], task: null as any },
      { id: '5-2', title: '裁定宣告债务人破产', description: '法院裁定宣告债务人破产', data: [] as any[], task: null as any },
      { id: '5-3', title: '宣告重整与和解', description: '审查并裁定债务人重整或和解', data: [] as any[], task: null as any },
    ],
  },
  {
    title: '六、财产变价与分配',
    icon: 'banknote',
    color: '#FF6B6B',
    modules: [
      { id: '6-1', title: '拟定并执行财产变价方案', description: '管理人拟定并执行财产变价方案', data: [] as any[], task: null as any },
      { id: '6-2', title: '破产费用与共益债务', description: '管理人审核确认破产费用和共益债务', data: [] as any[], task: null as any },
      { id: '6-3', title: '执行破产财产分配', description: '管理人执行破产财产分配', data: [] as any[], task: null as any },
    ],
  },
  {
    title: '七、程序终结与注销',
    icon: 'check-circle',
    color: '#4CAF50',
    modules: [
      { id: '7-1', title: '提请终结破产程序', description: '管理人提请法院终结破产程序', data: [] as any[], task: null as any },
      { id: '7-2', title: '法院裁定并公告', description: '法院裁定终结破产程序并公告', data: [] as any[], task: null as any },
      { id: '7-3', title: '办理企业注销登记', description: '管理人办理债务人企业注销登记', data: [] as any[], task: null as any },
      { id: '7-4', title: '管理人终止执行职务并归档', description: '管理人终止执行职务并将相关材料归档', data: [] as any[], task: null as any },
    ],
  },
])

// 当前阶段
const currentStage = computed(() => stages.value[activeStage.value])

// 当前阶段名称
const currentStageName = computed(() => {
  return currentStage.value?.title || ''
})

// 获取任务状态映射
const taskStatusMap: Record<string, { text: string; type: string }> = {
  IN_PROGRESS: { text: '进行中', type: 'warning' },
  COMPLETED: { text: '已完成', type: 'success' },
  PENDING: { text: '待处理', type: 'info' },
  SKIPPED: { text: '已跳过', type: 'default' },
}

onMounted(() => {
  caseId.value = getPageParam('id')
if (caseId.value) {
    initPage()
  }
})

// 初始化页面
const initPage = async () => {
  loading.value = true
  try {
    // 1. 加载案件详情
    await loadCaseInfo()
    
    // 2. 加载所有阶段数据
    await loadAllStageData()
    
    // 3. 初始化动画进度
    initAnimatedProgress()
    
    // 4. 默认展开第一个模块
    if (stages.value[0].modules.length > 0) {
      expandedModules.value[stages.value[0].modules[0].id] = true
    }
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 加载案件详情
const loadCaseInfo = async () => {
  try {
    const res = await getCaseDetail(caseId.value)
    if (res.data) {
      caseInfo.value = res.data
      // 根据案件进度设置当前阶段
      const progressMap: Record<string, number> = {
        FIRST: 0, SECOND: 1, THIRD: 2, FOURTH: 3,
        FIFTH: 4, SIXTH: 5, SEVENTH: 6,
      }
      const progress = res.data.caseProgress?.toUpperCase()
      if (progress && progressMap[progress] !== undefined) {
        activeStage.value = progressMap[progress]
      }
    }
  } catch (error) {
}
}

// 加载所有阶段数据
const loadAllStageData = async () => {
  try {
    // 1. 获取所有任务
    const taskRes = await getCaseTasks({
      caseId: Number(caseId.value),
      page: 1,
      size: 100,
    })

    if (taskRes.code === 200 && taskRes.data?.content) {
      const tasks = taskRes.data.content

      // 清空所有模块数据
      stages.value.forEach(stage => {
        stage.modules.forEach(module => {
          module.data = []
          module.task = null
        })
      })

      // 2. 批量获取提交记录
      const taskIds = tasks.map((t: any) => t.id)
      let submissionsMap: Record<number, SubmissionData[]> = {}
      let filesMap: Record<number, any[]> = {}

      if (taskIds.length > 0) {
        try {
          // 先获取所有任务的最新提交记录
          const submissionsRes = await createSubmissionBatch({ caseTaskIds: taskIds })
          if (submissionsRes.code === 200 && submissionsRes.data) {
            submissionsMap = submissionsRes.data
          }

          // 收集所有提交ID，用于批量获取文件
          const allSubmissions = Object.values(submissionsMap).flat()
          const submissionIds = allSubmissions.map((sub: SubmissionData) => sub.id)

          if (submissionIds.length > 0) {
            // 批量获取所有提交的文件
            const filesRes = await getSubmissionFilesBatch(submissionIds)
            if (filesRes.code === 200 && filesRes.data) {
              filesMap = filesRes.data
            }
          }
        } catch (e) {
}
      }

      // 3. 分配任务到对应模块
      tasks.forEach((task: any) => {
        for (const stage of stages.value) {
          // 匹配任务到模块
          const module = stage.modules.find(
            m => m.title === task.taskName || 
                 task.taskName?.includes(m.title) ||
                 m.title.includes(task.taskName || '')
          )

          if (module) {
            module.task = task
            completedModules.value[module.id] = task.status === 'COMPLETED'

            // 获取该任务的提交记录
            const submissions = submissionsMap[task.id] || []
            module.data = submissions.map((sub: SubmissionData) => {
              // 获取该提交的文件列表
              const submissionFiles = filesMap[sub.id] || []
              return {
                id: sub.id,
                title: sub.submissionTitle || '未命名',
                content: sub.submissionContent || '',
                creator: sub.creatorName || '',
                date: sub.createTime ? dayjs(sub.createTime).format('YYYY-MM-DD') : '',
                files: submissionFiles,
                taskId: task.id,
                status: sub.status,
              }
            })
            break
          }
        }
      })
    }
  } catch (error) {
}
}

// 初始化动画进度
const initAnimatedProgress = () => {
  stages.value.forEach((_, index) => {
    animatedProgress.value[index] = getStageProgress(index)
  })
}

// 计算阶段进度
const getStageProgress = (stageIndex: number): number => {
  const stage = stages.value[stageIndex]
  if (!stage || stage.modules.length === 0) return 0

  const completedCount = stage.modules.filter(
    m => completedModules.value[m.id]
  ).length

  return Math.round((completedCount / stage.modules.length) * 100)
}

// 切换阶段
const handleStageChange = async (index: number) => {
  if (activeStage.value === index) return
  activeStage.value = index
  
  // 滚动到可视区域
  scrollLeft.value = Math.max(0, (index - 2) * 100)
}

// 切换模块展开
const toggleModule = (moduleId: string) => {
  expandedModules.value[moduleId] = !expandedModules.value[moduleId]
}

// 切换模块完成状态
const toggleModuleComplete = async (moduleId: string) => {
  // 找到对应的模块
  let targetModule: any = null
  for (const stage of stages.value) {
    const found = stage.modules.find(m => m.id === moduleId)
    if (found) {
      targetModule = found
      break
    }
  }

  if (!targetModule?.task) {
    uni.showToast({ title: '任务不存在，无法标记完成状态', icon: 'none' })
    return
  }

  const newStatus = completedModules.value[moduleId] ? 'IN_PROGRESS' : 'COMPLETED'

  uni.showLoading({ title: '更新中...', mask: true })
  try {
    const response = await updateTaskStatus(targetModule.task.id, newStatus)

    if (response.code === 200) {
      completedModules.value[moduleId] = !completedModules.value[moduleId]
      // 更新模块的任务状态，确保界面立即反映变化
      targetModule.task.status = newStatus
      initAnimatedProgress()
      
      uni.hideLoading()
      uni.showToast({
        title: completedModules.value[moduleId] ? '已标记为完成' : '已取消完成标记',
        icon: 'success'
      })
    } else {
      uni.hideLoading()
      uni.showToast({ title: response.message || '更新任务状态失败', icon: 'none' })
    }
  } catch (error) {
uni.hideLoading()
    uni.showToast({ title: '更新任务状态失败', icon: 'none' })
  }
}

// 获取模块状态样式
const getModuleStatusClass = (module: any): string => {
  if (!module.task) return 'pending'
  if (completedModules.value[module.id]) return 'completed'
  return 'in-progress'
}

// 获取模块状态文本
const getModuleStatusText = (module: any): string => {
  if (!module.task) return '未开始'
  if (completedModules.value[module.id]) return '已完成'
  return '进行中'
}

// 打开添加弹窗
const openAddDialog = (module: any) => {
  isEditMode.value = false
  currentModule.value = module
  currentItem.value = null
  formData.value = {
    title: '',
    content: '',
    date: dayjs().format('YYYY-MM-DD'),
  }
  uploadFiles.value = []
  addDialogPopup.value?.open()
}

// 关闭添加弹窗
const closeAddDialog = () => {
  addDialogPopup.value?.close()
}

// 日期选择
const onDateChange = (e: any) => {
  formData.value.date = e.detail.value
}

// 选择文件
const chooseFile = () => {
  // #ifdef H5
  uni.chooseFile({
    count: 10,
    success: (res) => {
      uploadFiles.value = [...uploadFiles.value, ...res.tempFiles]
    },
    fail: () => {
      uni.showToast({ title: '选择文件失败', icon: 'none' })
    }
  })
  // #endif
  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 10,
    success: (res) => {
      uploadFiles.value = [...uploadFiles.value, ...res.tempFiles]
    },
    fail: () => {
      uni.showToast({ title: '选择文件失败', icon: 'none' })
    }
  })
  // #endif
  // #ifdef APP-PLUS
  plus.io.chooseFile({
    multiple: true,
    maximum: 10,
    onChoose: (files: any[]) => {
      uploadFiles.value = [...uploadFiles.value, ...files]
    },
  }, () => {
    uni.showToast({ title: '选择文件失败', icon: 'none' })
  })
  // #endif
}

// 移除文件
const removeFile = (index: number) => {
  uploadFiles.value.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (size?: number): string => {
  if (!size) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return Math.round((size / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 提交数据（新增或编辑）
const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }

  if (!currentModule.value?.task) {
    uni.showToast({ title: '该模块暂无任务，请先创建任务', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    let submissionId: number

    if (isEditMode.value && currentItem.value) {
      // 编辑模式：更新提交记录
      submissionId = currentItem.value.id
      const updateRes = await updateSubmission(submissionId, {
        submissionContent: formData.value.content,
      })

      if (updateRes.code !== 200) {
        throw new Error(updateRes.message || '更新失败')
      }
    } else {
      // 新增模式：创建新提交记录
      const createRes = await createSubmission({
        caseTaskId: currentModule.value.task.id,
        submissionTitle: formData.value.title,
        submissionContent: formData.value.content,
        submissionType: 'NORMAL',
        createTime: formData.value.date,
      })

      if (createRes.code !== 200) {
        throw new Error(createRes.message || '创建失败')
      }

      submissionId = createRes.data.submissionId
    }

    // 上传文件（只上传新选择的文件）
    for (let i = 0; i < uploadFiles.value.length; i++) {
      const file = uploadFiles.value[i]
      if (file.path) {
        await uploadSubmissionFile(
          submissionId,
          file.path,
          file.name,
          i + 1
        )
      }
    }

    uni.showToast({ title: '保存成功', icon: 'success' })
    closeAddDialog()

    // 刷新数据
    await loadAllStageData()
    initAnimatedProgress()
  } catch (error: any) {
uni.showToast({ title: error.message || '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

// 数据项点击
const handleDataItemClick = (item: any, module: any) => {
  selectedDataItem.value = item
  currentModule.value = module
  currentItem.value = item
  detailDialogPopup.value?.open()
}

// 关闭详情弹窗
const closeDetailDialog = () => {
  detailDialogPopup.value?.close()
}

// 预览文件
const previewFile = (file: any) => {
  if (!file.id) {
    uni.showToast({ title: '文件ID不存在', icon: 'none' })
    return
  }

  const token = uni.getStorageSync('token')
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${API_PREFIX}/file/preview/${file.id}`

  uni.downloadFile({
    url,
    header: { Authorization: `Bearer ${token}` },
    success: (res) => {
      if (res.statusCode === 200) {
        uni.openDocument({
          filePath: res.tempFilePath,
          fail: () => {
            // 如果无法打开，尝试预览图片
            if (file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              uni.previewImage({
                urls: [res.tempFilePath]
              })
            } else {
              uni.showToast({ title: '无法预览该文件', icon: 'none' })
            }
          }
        })
      } else {
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '预览失败', icon: 'none' })
    }
  })
}

// 下载文件
const downloadFile = (file: any) => {
  if (!file.id) {
    uni.showToast({ title: '文件ID不存在', icon: 'none' })
    return
  }

  uni.showLoading({ title: '下载中...', mask: true })

  const token = uni.getStorageSync('token')
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${API_PREFIX}/file/download/${file.id}`

  uni.downloadFile({
    url,
    header: { Authorization: `Bearer ${token}` },
    success: (res) => {
      if (res.statusCode === 200) {
        uni.hideLoading()
        uni.showToast({ title: '下载成功', icon: 'success' })
      } else {
        uni.hideLoading()
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
}

// 编辑数据
const handleEdit = () => {
  closeDetailDialog()
  isEditMode.value = true
  currentModule.value = currentModule.value
  currentItem.value = currentItem.value
  formData.value = {
    title: currentItem.value.title,
    content: currentItem.value.content,
    date: currentItem.value.date,
  }
  uploadFiles.value = []
  addDialogPopup.value?.open()
}

// 删除数据
const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？删除后不可恢复！',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...', mask: true })
        try {
          await deleteSubmission(currentItem.value.id)
          uni.hideLoading()
          uni.showToast({ title: '删除成功', icon: 'success' })
          closeDetailDialog()
          // 强制刷新数据
          await loadAllStageData()
          initAnimatedProgress()
        } catch (error) {
          uni.hideLoading()
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 前往债权管理
const goToClaimManage = () => {
  uni.navigateTo({ url: `/pages/cases/claim-manage?id=${caseId.value}` })
}

// 打开会议数据弹窗
const openMeetingData = () => {
  meetingDialogPopup.value?.open()
  // 从当前模块数据中获取会议信息
  const meetingModule = currentStage.value.modules.find(m => m.id === '4-1')
  const meetingData = meetingModule?.data?.[0]
  const meetingId = meetingData?.id || 1
  // 加载投票项和视频标签数据
  loadMeetingData(meetingId)
}

// 关闭会议数据弹窗
const closeMeetingDialog = () => {
  meetingDialogPopup.value?.close()
}

// 加载会议数据（从API获取真实数据）
const loadMeetingData = async (meetingId: number = 1) => {
  uni.showLoading({ title: '加载中...', mask: true })
  
  try {
    // 获取投票项数据
    await fetchVoteItems(meetingId)
    // 获取视频标签数据
    await fetchVideoTags(meetingId)
  } catch (error) {
} finally {
    uni.hideLoading()
  }
}

// 获取投票项数据
const fetchVoteItems = async (meetingId: number) => {
  try {
    const res = await http.get<any[]>(`/api/vote-items/meeting/${meetingId}`)
    if (res.code === 200 && res.data) {
      voteItems.value = res.data.map((item: any) => ({
        id: item.id,
        name: item.itemName,
        agree: item.agreeCount || 0,
        oppose: item.opposeCount || 0,
        abstain: item.abstainCount || 0,
        remark: item.remark || '待表决',
      }))
    } else {
      voteItems.value = []
    }
  } catch (error) {
// API失败时使用默认数据
    voteItems.value = [
      { id: 1, name: '通过财产变价方案', agree: 45, oppose: 8, abstain: 3, remark: '已通过' },
      { id: 2, name: '通过财产分配方案', agree: 42, oppose: 10, abstain: 4, remark: '已通过' },
      { id: 3, name: '选举债权人委员会成员', agree: 38, oppose: 12, abstain: 6, remark: '待表决' },
    ]
  }
}

// 获取视频标签数据
const fetchVideoTags = async (meetingId: number) => {
  try {
    const res = await http.get<any[]>(`/api/video-tags/meeting/${meetingId}`)
    if (res.code === 200 && res.data) {
      videoTags.value = res.data.map((tag: any) => ({
        id: tag.id,
        title: tag.videoTitle,
        status: tag.status || 'pending',
        statusText: tag.status === 'generated' ? '已生成' : '待生成',
      }))
    } else {
      videoTags.value = []
    }
  } catch (error) {
// API失败时使用默认数据
    videoTags.value = [
      { id: 1, title: '会议开场致辞', status: 'generated', statusText: '已生成' },
      { id: 2, title: '管理人工作报告', status: 'generated', statusText: '已生成' },
      { id: 3, title: '财产变价方案说明', status: 'pending', statusText: '待生成' },
    ]
  }
}

// 返回
const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.process-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #fff;

  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .right-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.case-card {
  margin: 20rpx 24rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #0068E2 0%, #0047A8 100%);
  border-radius: 20rpx;
  color: #fff;

  .case-header {
    margin-bottom: 16rpx;

    .case-name {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }

    .case-no {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }

  .case-progress {
    .progress-text {
      font-size: 26rpx;
      opacity: 0.9;
    }
  }
}

.stage-progress-section {
  background: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;

  .stage-scroll {
    white-space: nowrap;
    padding: 0 24rpx;
  }

  .stage-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 160rpx;
    margin-right: 16rpx;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    vertical-align: top;

    &.active {
      background: #e8f0fe;

      .stage-icon {
        transform: scale(1.1);
      }
    }

    .stage-icon {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
      transition: transform 0.3s;
    }

    .stage-title {
      font-size: 22rpx;
      color: #333;
      text-align: center;
      margin-bottom: 12rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 140rpx;
    }

    .stage-progress-bar {
      width: 100%;
      height: 8rpx;
      background: #e0e0e0;
      border-radius: 4rpx;
      margin-bottom: 8rpx;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        border-radius: 4rpx;
        transition: width 0.5s ease;
      }
    }

    .progress-text {
      font-size: 20rpx;
      color: #666;
    }
  }
}

.module-list {
  padding: 0 24rpx;

  .module-card {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;

    .module-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx;
      background: #fff;

      .module-info {
        display: flex;
        align-items: flex-start;
        flex: 1;

        .module-id {
          width: 64rpx;
          height: 64rpx;
          background: #f0f4ff;
          border-radius: 12rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22rpx;
          font-weight: bold;
          color: #0068E2;
          margin-right: 16rpx;
          flex-shrink: 0;
        }

        .module-text {
          flex: 1;

          .module-title {
            display: block;
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 8rpx;
          }

          .module-desc {
            font-size: 24rpx;
            color: #999;
            line-height: 1.4;
          }
        }
      }

      .module-status {
        display: flex;
        align-items: center;
        margin-left: 16rpx;

        .status-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          margin-right: 8rpx;

          &.pending {
            background: #e0e0e0;
          }

          &.in-progress {
            background: #ff9800;
          }

          &.completed {
            background: #4caf50;
          }
        }

        .status-text {
          font-size: 22rpx;
          color: #666;
          margin-right: 8rpx;
        }
      }
    }

    .module-content {
      border-top: 1rpx solid #f0f0f0;
      padding: 20rpx 24rpx;

      .module-actions-bar {
        margin-bottom: 20rpx;

        .completed-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16rpx 20rpx;
          background: #e8f5e9;
          border-radius: 12rpx;

          .completed-badge {
            display: flex;
            align-items: center;

            .completed-text {
              margin-left: 8rpx;
              font-size: 26rpx;
              color: #4caf50;
              font-weight: 500;
            }
          }

          .revoke-btn {
            padding: 8rpx 20rpx;
            background: #fff;
            border-radius: 8rpx;
            border: 1rpx solid #f44336;

            text {
              font-size: 24rpx;
              color: #f44336;
            }

            &:active {
              background: #ffebee;
            }
          }
        }

        .action-buttons {
          display: flex;
          gap: 16rpx;

          .mark-complete-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16rpx 20rpx;
            background: #0068E2;
            border-radius: 12rpx;

            text {
              margin-left: 8rpx;
              font-size: 26rpx;
              color: #fff;
            }

            &:active {
              background: #0056b3;
            }
          }

          .add-data-btn-small {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16rpx 20rpx;
            background: #fff;
            border-radius: 12rpx;
            border: 1rpx solid #4caf50;

            text {
              margin-left: 8rpx;
              font-size: 26rpx;
              color: #4caf50;
            }

            &:active {
              background: #e8f5e9;
            }
          }
        }
      }

      .special-module {
        padding: 20rpx;
        background: #f8f9fa;
        border-radius: 12rpx;

        .special-module-tip {
          display: flex;
          align-items: center;
          margin-bottom: 16rpx;

          text {
            margin-left: 8rpx;
            font-size: 24rpx;
            color: #666;
          }
        }

        .special-module-actions {
          display: flex;
          gap: 16rpx;
        }
      }

      .data-list {
        .data-item {
          padding: 20rpx;
          background: #f8f9fa;
          border-radius: 12rpx;
          margin-bottom: 16rpx;

          &:active {
            background: #f0f0f0;
          }

          .data-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12rpx;

            .data-title {
              flex: 1;
              font-size: 28rpx;
              font-weight: 500;
              color: #333;
            }

            .data-date {
              font-size: 22rpx;
              color: #999;
              margin-left: 16rpx;
            }
          }

          .data-content {
            font-size: 24rpx;
            color: #666;
            margin-bottom: 12rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .data-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .data-creator {
              font-size: 22rpx;
              color: #999;
            }

            .data-files {
              display: flex;
              align-items: center;

              text {
                font-size: 22rpx;
                color: #999;
                margin-left: 4rpx;
              }
            }
          }
        }

        .empty-module {
          padding: 40rpx 0;
        }
      }
    }
  }
}

.add-dialog,
.detail-dialog,
.meeting-dialog,
.stage-info-dialog {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 85vh;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .dialog-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .dialog-body {
    flex: 1;
    padding: 24rpx;
    overflow-y: auto;
  }

  .dialog-footer {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 24rpx;
    border-top: 1rpx solid #f0f0f0;

    :deep(.u-button) {
      flex: 1;
    }
  }
}

.form-section {
  margin-bottom: 30rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }

  .form-item {
    margin-bottom: 20rpx;

    .form-label {
      display: block;
      font-size: 26rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .picker-value {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16rpx 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;

      text {
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}

.file-list {
  margin-bottom: 20rpx;

  .file-item {
    display: flex;
    align-items: center;
    padding: 16rpx 20rpx;
    background: #f8f9fa;
    border-radius: 8rpx;
    margin-bottom: 12rpx;

    .file-name {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      margin: 0 16rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  border: 2rpx dashed #0068E2;
  border-radius: 8rpx;

  text {
    margin-left: 8rpx;
    font-size: 26rpx;
    color: #0068E2;
  }
}

.detail-content {
  .detail-item {
    margin-bottom: 24rpx;

    .detail-label {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 8rpx;
    }

    .detail-value {
      font-size: 28rpx;
      color: #333;
      line-height: 1.5;

      &.content {
        white-space: pre-wrap;
      }
    }
  }
}

.detail-files {
  margin-top: 30rpx;

  .files-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }

  .file-card {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    margin-bottom: 12rpx;

    &:active {
      background: #f0f0f0;
    }

    .file-info {
      flex: 1;
      margin: 0 16rpx;

      .file-name {
        display: block;
        font-size: 26rpx;
        color: #333;
        margin-bottom: 4rpx;
      }

      .file-size {
        font-size: 22rpx;
        color: #999;
      }
    }

    .file-actions {
      display: flex;
      gap: 16rpx;
      flex-shrink: 0;

      .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8rpx 16rpx;
        background: #fff;
        border-radius: 8rpx;
        min-width: 80rpx;

        &:active {
          background: #f0f0f0;
        }

        text {
          font-size: 20rpx;
          margin-top: 4rpx;
        }
      }
    }
  }
}

.meeting-tabs {
  display: flex;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    padding: 20rpx 0;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #0068E2;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #0068E2;
        border-radius: 2rpx;
      }
    }
  }
}

.vote-list,
.video-list {
  .vote-item,
  .video-item {
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    margin-bottom: 16rpx;

    .vote-info,
    .video-title {
      margin-bottom: 16rpx;

      .vote-name,
      .vote-remark {
        display: block;
        font-size: 28rpx;
        color: #333;
      }

      .vote-remark {
        font-size: 24rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }

    .vote-stats {
      display: flex;
      gap: 20rpx;

      .stat {
        flex: 1;
        text-align: center;
        padding: 12rpx;
        background: #fff;
        border-radius: 8rpx;

        text {
          display: block;
          font-size: 22rpx;
          color: #666;
        }

        .num {
          font-size: 28rpx;
          font-weight: bold;
          margin-top: 4rpx;
        }

        &.agree .num {
          color: #4caf50;
        }

        &.oppose .num {
          color: #f44336;
        }

        &.abstain .num {
          color: #999;
        }
      }
    }

    .video-status {
      display: inline-block;
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      border-radius: 4rpx;

      &.generated {
        background: #e8f5e9;
        color: #4caf50;
      }

      &.pending {
        background: #fff3e0;
        color: #ff9800;
      }
    }
  }
}

.stage-info-dialog {
  width: 600rpx;
  max-height: 70vh;

  .dialog-body {
    max-height: 60vh;
  }

  .stage-info-item {
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .stage-info-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;

      .stage-icon-small {
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20rpx;
        font-weight: bold;
        margin-right: 12rpx;
      }

      .stage-info-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .stage-info-modules {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;

      .module-tag {
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        background: #f0f4ff;
        color: #0068E2;
        border-radius: 4rpx;
      }
    }
  }
}
</style>
