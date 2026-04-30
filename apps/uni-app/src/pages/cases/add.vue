<template>
  <view class="add-case-container">
    <scroll-view scroll-y class="form-scroll" :style="{ height: scrollHeight }">
      <!-- 案件基本信息 -->
      <view class="form-section">
        <view class="section-title">案件基本信息</view>

        <view class="form-item">
          <text class="label required">案号</text>
          <input
            v-model="formData.caseNumber"
            class="input"
            type="text"
            placeholder="请输入案号"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="label required">案件名称</text>
          <input
            v-model="formData.caseName"
            class="input"
            type="text"
            placeholder="请输入案件名称"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <text class="label required">受理日期</text>
          <picker
            mode="date"
            :value="formData.acceptanceDate"
            @change="onAcceptanceDateChange"
          >
            <view class="picker" :class="{ placeholder: !formData.acceptanceDate }">
              {{ formData.acceptanceDate || '请选择受理日期' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">案件来源</text>
          <input
            v-model="formData.caseSource"
            class="input"
            type="text"
            placeholder="请输入案件来源"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="label">受理法院</text>
          <view class="select-wrapper" @click="showCourtPicker = true">
            <view class="picker" :class="{ placeholder: !formData.acceptanceCourt }">
              {{ formData.acceptanceCourt || '请选择或输入受理法院' }}
            </view>
            <text class="icon">▼</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">承办法官</text>
          <input
            v-model="formData.designatedJudge"
            class="input"
            type="text"
            placeholder="请输入承办法官"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="label">指定机构</text>
          <view class="select-wrapper" @click="showManagerPicker = true">
            <view class="picker" :class="{ placeholder: !formData.designatedInstitution }">
              {{ formData.designatedInstitution || '请选择或输入指定机构' }}
            </view>
            <text class="icon">▼</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">主要负责人</text>
          <view class="select-wrapper" @click="openUserPicker('main')">
            <view class="picker" :class="{ placeholder: !formData.mainResponsiblePerson }">
              {{ formData.mainResponsiblePerson || '请选择或输入主要负责人' }}
            </view>
            <text class="icon">▼</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">承办人员</text>
          <view class="select-wrapper" @click="openUserPicker('undertaking')">
            <view class="picker" :class="{ placeholder: !selectedUndertakingPersonName }">
              {{ selectedUndertakingPersonName || '请选择或输入承办人员' }}
            </view>
            <text class="icon">▼</text>
          </view>
        </view>
      </view>

      <!-- 案件进度信息 -->
      <view class="form-section">
        <view class="section-title">案件进度信息</view>

        <view class="form-item">
          <text class="label">是否简化审</text>
          <picker
            mode="selector"
            :range="simplifiedTrialOptions"
            :value="simplifiedTrialIndex"
            @change="onSimplifiedTrialChange"
          >
            <view class="picker" :class="{ placeholder: simplifiedTrialIndex === 0 }">
              {{ simplifiedTrialOptions[simplifiedTrialIndex] }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">案件进度</text>
          <picker
            mode="selector"
            :range="progressOptions"
            range-key="label"
            :value="progressIndex"
            @change="onProgressChange"
          >
            <view class="picker" :class="{ placeholder: !formData.caseProgress }">
              {{ getProgressLabel(formData.caseProgress) || '请选择案件进度' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">债权申报截止日期</text>
          <picker
            mode="date"
            :value="formData.debtClaimDeadline"
            @change="onDebtClaimDeadlineChange"
          >
            <view class="picker" :class="{ placeholder: !formData.debtClaimDeadline }">
              {{ formData.debtClaimDeadline || '请选择债权申报截止日期' }}
            </view>
          </picker>
        </view>
      </view>

      <!-- 备注信息 -->
      <view class="form-section">
        <view class="section-title">备注信息</view>
        <view class="form-item">
          <textarea
            v-model="formData.remarks"
            class="textarea"
            placeholder="请输入备注信息"
            :maxlength="500"
          />
          <text class="word-count">{{ formData.remarks?.length || 0 }}/500</text>
        </view>
      </view>

      <!-- 文件上传 -->
      <view class="form-section">
        <view class="section-title">文件上传</view>
        <view class="upload-section">
          <view class="upload-tip">
            支持PDF、DOC、DOCX、XLS、XLSX、JPG、PNG格式，单个文件不超过10MB
          </view>
          <view class="file-list" v-if="selectedFiles.length > 0">
            <view v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <text class="file-icon">{{ getFileIcon(file.name) }}</text>
              <text class="file-name">{{ file.name }}</text>
              <text class="delete-btn" @click="removeFile(index)">✕</text>
            </view>
          </view>
          <view class="upload-btn" @click="handleSelectFile">
            <text class="icon">+</text>
            <text class="text">选择文件</text>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view style="height: 120rpx;"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button class="cancel-btn" @click="handleCancel">取消</button>
      <button class="submit-btn" :loading="submitting" @click="handleSubmit">
        提交
      </button>
    </view>

    <!-- 法院选择弹窗 -->
    <view class="picker-modal" v-if="showCourtPicker">
      <view class="modal-mask" @click="showCourtPicker = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">选择受理法院</text>
          <text class="close-btn" @click="showCourtPicker = false">✕</text>
        </view>
        <view class="search-box">
          <input
            v-model="courtSearchKeyword"
            class="search-input"
            type="text"
            placeholder="搜索法院"
            @input="searchCourts"
          />
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="court in filteredCourtList"
            :key="court.id"
            class="picker-item"
            :class="{ active: formData.acceptanceCourt === court.fullName }"
            @click="selectCourt(court.fullName)"
          >
            <text class="name">{{ court.fullName }}</text>
            <text class="sub">{{ court.shortName }}</text>
          </view>
          <view v-if="filteredCourtList.length === 0" class="empty-tip">
            未找到匹配的法院，可直接输入
          </view>
        </scroll-view>
        <view class="custom-input-box">
          <input
            v-model="customCourt"
            class="custom-input"
            type="text"
            placeholder="自定义输入法院名称"
          />
          <button class="confirm-btn" @click="confirmCustomCourt">确定</button>
        </view>
      </view>
    </view>

    <!-- 管理人选择弹窗 -->
    <view class="picker-modal" v-if="showManagerPicker">
      <view class="modal-mask" @click="showManagerPicker = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">选择指定机构</text>
          <text class="close-btn" @click="showManagerPicker = false">✕</text>
        </view>
        <view class="search-box">
          <input
            v-model="managerSearchKeyword"
            class="search-input"
            type="text"
            placeholder="搜索机构"
            @input="searchManagers"
          />
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="manager in filteredManagerList"
            :key="manager.id"
            class="picker-item"
            :class="{ active: formData.designatedInstitution === manager.administratorName }"
            @click="selectManager(manager.administratorName)"
          >
            <text class="name">{{ manager.administratorName }}</text>
          </view>
          <view v-if="filteredManagerList.length === 0" class="empty-tip">
            未找到匹配的机构，可直接输入
          </view>
        </scroll-view>
        <view class="custom-input-box">
          <input
            v-model="customManager"
            class="custom-input"
            type="text"
            placeholder="自定义输入机构名称"
          />
          <button class="confirm-btn" @click="confirmCustomManager">确定</button>
        </view>
      </view>
    </view>

    <!-- 用户选择弹窗 -->
    <view class="picker-modal" v-if="showUserPicker">
      <view class="modal-mask" @click="showUserPicker = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">选择{{ userPickerType === 'main' ? '主要负责人' : '承办人员' }}</text>
          <text class="close-btn" @click="showUserPicker = false">✕</text>
        </view>
        <view class="search-box">
          <input
            v-model="userSearchKeyword"
            class="search-input"
            type="text"
            placeholder="搜索用户"
            @input="searchUsers"
          />
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="user in filteredUserList"
            :key="user.id"
            class="picker-item"
            :class="{ active: isUserSelected(user) }"
            @click="selectUser(user)"
          >
            <text class="name">{{ user.realName || user.username }}</text>
          </view>
          <view v-if="filteredUserList.length === 0" class="empty-tip">
            未找到匹配的用户
          </view>
        </scroll-view>
        <view class="custom-input-box">
          <input
            v-model="customUser"
            class="custom-input"
            type="text"
            placeholder="自定义输入姓名"
          />
          <button class="confirm-btn" @click="confirmCustomUser">确定</button>
        </view>
      </view>
    </view>

    <!-- 确认弹窗 -->
    <view class="confirm-modal" v-if="showConfirmModal">
      <view class="modal-mask"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">确认新增案件</text>
        </view>
        <view class="modal-body">
          <view class="confirm-item">
            <text class="label">案号：</text>
            <text class="value">{{ formData.caseNumber }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">案件名称：</text>
            <text class="value">{{ formData.caseName }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">受理日期：</text>
            <text class="value">{{ formData.acceptanceDate }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">受理法院：</text>
            <text class="value">{{ formData.acceptanceCourt || '-' }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">指定机构：</text>
            <text class="value">{{ formData.designatedInstitution || '-' }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">主要负责人：</text>
            <text class="value">{{ formData.mainResponsiblePerson || '-' }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">承办人员：</text>
            <text class="value">{{ selectedUndertakingPersonName || '-' }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">是否简化审：</text>
            <text class="value">{{ simplifiedTrialOptions[simplifiedTrialIndex] }}</text>
          </view>
          <view class="confirm-item">
            <text class="label">案件进度：</text>
            <text class="value">{{ getProgressLabel(formData.caseProgress) }}</text>
          </view>
          <view class="confirm-item" v-if="selectedFiles.length > 0">
            <text class="label">文件数量：</text>
            <text class="value">{{ selectedFiles.length }} 个</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="showConfirmModal = false">取消</button>
          <button class="confirm-btn" @click="confirmSubmit">确认新增</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  createCaseApi,
  getCourtList,
  getManagerList,
  getUserList,
  batchUploadCaseFiles,
  type CreateCaseParams,
  type CourtInfo,
  type ManagerInfo,
  type UserInfo,
} from '@/api/case'
import { getBaseUrl } from '@/config'

// 判断是否 H5 环境
const isH5 = typeof window !== 'undefined' && typeof document !== 'undefined'

// 表单数据
const formData = reactive<CreateCaseParams>({
  caseNumber: '',
  caseName: '',
  acceptanceDate: '',
  caseSource: '',
  acceptanceCourt: '',
  designatedJudge: '',
  designatedInstitution: '',
  mainResponsiblePerson: '',
  undertakingPersonnel: undefined,
  isSimplifiedTrial: 0,
  caseProgress: 'FIRST',
  debtClaimDeadline: '',
  remarks: '',
})

// 是否简化审选项
const simplifiedTrialOptions = ['请选择', '否', '是']
const simplifiedTrialIndex = ref(0)

// 案件进度选项
const progressOptions = [
  { label: '第一阶段', value: 'FIRST' },
  { label: '第二阶段', value: 'SECOND' },
  { label: '第三阶段', value: 'THIRD' },
  { label: '第四阶段', value: 'FOURTH' },
  { label: '第五阶段', value: 'FIFTH' },
  { label: '第六阶段', value: 'SIXTH' },
  { label: '第七阶段', value: 'SEVENTH' },
]

const progressIndex = computed(() => {
  if (!formData.caseProgress) return 0
  const index = progressOptions.findIndex(opt => opt.value === formData.caseProgress)
  return index >= 0 ? index : 0
})

const getProgressLabel = (value?: string) => {
  const option = progressOptions.find(opt => opt.value === value)
  return option ? option.label : ''
}

// 选择的人员
const selectedUndertakingPersonName = ref('')

// 文件列表
// 选中的文件列表 - H5环境存储File对象，小程序/APP环境存储文件路径
const selectedFiles = ref<{ path?: string; file?: File; name: string; size: number }[]>([])

// 提交状态
const submitting = ref(false)

// 弹窗显示状态
const showCourtPicker = ref(false)
const showManagerPicker = ref(false)
const showUserPicker = ref(false)
const showConfirmModal = ref(false)

// 用户选择器类型
const userPickerType = ref<'main' | 'undertaking'>('main')

// 数据列表
const courtList = ref<CourtInfo[]>([])
const managerList = ref<ManagerInfo[]>([])
const userList = ref<UserInfo[]>([])

// 搜索关键词
const courtSearchKeyword = ref('')
const managerSearchKeyword = ref('')
const userSearchKeyword = ref('')

// 自定义输入
const customCourt = ref('')
const customManager = ref('')
const customUser = ref('')

// 过滤后的列表
const filteredCourtList = computed(() => {
  if (!courtSearchKeyword.value) return courtList.value
  return courtList.value.filter(court =>
    court.fullName.includes(courtSearchKeyword.value) ||
    court.shortName.includes(courtSearchKeyword.value)
  )
})

const filteredManagerList = computed(() => {
  if (!managerSearchKeyword.value) return managerList.value
  return managerList.value.filter(manager =>
    manager.administratorName.includes(managerSearchKeyword.value)
  )
})

const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) return userList.value
  return userList.value.filter(user =>
    (user.realName && user.realName.includes(userSearchKeyword.value)) ||
    user.username.includes(userSearchKeyword.value)
  )
})

// 滚动区域高度
const scrollHeight = ref('100vh')

onMounted(() => {
  // 计算滚动区域高度（减去底部操作栏高度）
  const systemInfo = uni.getSystemInfoSync()
  scrollHeight.value = `${systemInfo.windowHeight - 60}px`

  // 加载基础数据
  loadCourtList()
  loadManagerList()
  loadUserList()
})

// 加载法院列表
const loadCourtList = async () => {
  try {
    const res = await getCourtList({ page: 1, size: 100 })
    if (res.code === 200 && res.data?.list) {
      courtList.value = res.data.list
    }
  } catch (error) {
}
}

// 加载管理人列表
const loadManagerList = async () => {
  try {
    const res = await getManagerList({ pageNum: 1, pageSize: 100 })
    if (res.code === 200 && res.data?.list) {
      managerList.value = res.data.list
    }
  } catch (error) {
}
}

// 加载用户列表
const loadUserList = async () => {
  try {
    const res = await getUserList('', 1, 10000)
    if (res.code === 200 && res.data?.users) {
      userList.value = res.data.users
    }
  } catch (error) {
}
}

// 日期选择
const onAcceptanceDateChange = (e: any) => {
  formData.acceptanceDate = e.detail.value
}

const onDebtClaimDeadlineChange = (e: any) => {
  formData.debtClaimDeadline = e.detail.value
}

// 是否简化审选择
const onSimplifiedTrialChange = (e: any) => {
  simplifiedTrialIndex.value = e.detail.value
  formData.isSimplifiedTrial = e.detail.value === '0' ? 0 : 1
}

// 案件进度选择
const onProgressChange = (e: any) => {
  const index = e.detail.value
  formData.caseProgress = progressOptions[index].value
}

// 打开用户选择器
const openUserPicker = (type: 'main' | 'undertaking') => {
  userPickerType.value = type
  userSearchKeyword.value = ''
  customUser.value = ''
  showUserPicker.value = true
}

// 选择法院
const selectCourt = (name: string) => {
  formData.acceptanceCourt = name
  showCourtPicker.value = false
}

// 确认自定义法院
const confirmCustomCourt = () => {
  if (customCourt.value.trim()) {
    formData.acceptanceCourt = customCourt.value.trim()
    showCourtPicker.value = false
    customCourt.value = ''
  }
}

// 选择管理人
const selectManager = (name: string) => {
  formData.designatedInstitution = name
  showManagerPicker.value = false
}

// 确认自定义管理人
const confirmCustomManager = () => {
  if (customManager.value.trim()) {
    formData.designatedInstitution = customManager.value.trim()
    showManagerPicker.value = false
    customManager.value = ''
  }
}

// 选择用户
const selectUser = (user: UserInfo) => {
  const userName = user.realName || user.username
  if (userPickerType.value === 'main') {
    formData.mainResponsiblePerson = userName
  } else {
    formData.undertakingPersonnel = user.id
    selectedUndertakingPersonName.value = userName
  }
  showUserPicker.value = false
}

// 确认自定义用户
const confirmCustomUser = () => {
  if (customUser.value.trim()) {
    if (userPickerType.value === 'main') {
      formData.mainResponsiblePerson = customUser.value.trim()
    } else {
      selectedUndertakingPersonName.value = customUser.value.trim()
      formData.undertakingPersonnel = undefined
    }
    showUserPicker.value = false
    customUser.value = ''
  }
}

// 判断用户是否被选中
const isUserSelected = (user: UserInfo) => {
  const userName = user.realName || user.username
  if (userPickerType.value === 'main') {
    return formData.mainResponsiblePerson === userName
  } else {
    return selectedUndertakingPersonName.value === userName
  }
}

// 搜索法院
const searchCourts = () => {
  // 过滤逻辑在 computed 中处理
}

// 搜索管理人
const searchManagers = () => {
  // 过滤逻辑在 computed 中处理
}

// 搜索用户
const searchUsers = () => {
  // 过滤逻辑在 computed 中处理
}

// 选择文件 - 统一使用 uni.chooseFile
const handleSelectFile = () => {
  uni.chooseFile({
    count: 10,
    type: 'all',
    extension: ['.doc', '.docx', '.pdf', '.jpg', '.png', '.txt', '.xls', '.xlsx'],
    success: (res: any) => {
const files = res.tempFiles || []
const validFiles = files.filter((file: any) => {
// 验证文件大小（10MB）
        if (file.size > 10 * 1024 * 1024) {
          uni.showToast({ title: `${file.name} 超过10MB`, icon: 'none' })
          return false
        }
        return true
      })
      
      // 确保文件路径正确 - 小程序/APP环境使用 path 或 tempFilePath
      const processedFiles = validFiles.map((file: any) => ({
        path: file.path || file.tempFilePath,
        name: file.name || file.path?.split('/').pop() || '未知文件',
        size: file.size || 0
      }))
selectedFiles.value.push(...processedFiles)
    },
    fail: (err: any) => {
},
  })
}

// 移除文件
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// 获取文件图标
const getFileIcon = (fileName?: string) => {
  if (!fileName) return '📄'
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) return '🖼️'
  if (['pdf'].includes(ext || '')) return '📕'
  if (['doc', 'docx'].includes(ext || '')) return '📘'
  if (['xls', 'xlsx'].includes(ext || '')) return '📗'
  if (['ppt', 'pptx'].includes(ext || '')) return '📙'
  return '📄'
}

// 获取文件名
const getFileName = (path: string) => {
  if (!path) return ''
  const parts = path.split('/')
  return parts[parts.length - 1]
}

// 统一上传文件 - 使用 uni.uploadFile
const uploadFilesUniApp = async (caseId: number) => {
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
const files = selectedFiles.value.filter(f => f.path)
let uploadedCount = 0
  
  for (const fileInfo of files) {
try {
      const uploadRes = await new Promise<any>((resolve, reject) => {
        uni.uploadFile({
          url: `${baseUrl}/api/v1/file/upload`,
          filePath: fileInfo.path,
          name: 'file',
          formData: {
            bizType: 'case',
            bizId: caseId.toString(),
          },
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        })
      })
      
      const result = JSON.parse(uploadRes.data)
if (result.code === 200) {
        uploadedCount++
      }
    } catch (error) {
}
  }
uni.showToast({ 
    title: `案件创建成功，已上传 ${uploadedCount}/${files.length} 个文件`, 
    icon: 'success' 
  })
}

// 取消
const handleCancel = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消吗？已填写的数据将丢失',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    },
  })
}

// 提交表单
const handleSubmit = () => {
  // 表单验证
  if (!formData.caseNumber.trim()) {
    uni.showToast({ title: '请输入案号', icon: 'none' })
    return
  }
  if (!formData.caseName.trim()) {
    uni.showToast({ title: '请输入案件名称', icon: 'none' })
    return
  }
  if (!formData.acceptanceDate) {
    uni.showToast({ title: '请选择受理日期', icon: 'none' })
    return
  }

  // 显示确认弹窗
  showConfirmModal.value = true
}

// 确认提交
const confirmSubmit = async () => {
  showConfirmModal.value = false
  submitting.value = true

  uni.showLoading({ title: '提交中...' })

  try {
    // 1. 创建案件
    const submitData: CreateCaseParams = {
      caseNumber: formData.caseNumber.trim(),
      caseName: formData.caseName.trim(),
      acceptanceDate: formData.acceptanceDate,
      caseSource: formData.caseSource?.trim(),
      acceptanceCourt: formData.acceptanceCourt?.trim(),
      designatedJudge: formData.designatedJudge?.trim(),
      designatedInstitution: formData.designatedInstitution?.trim(),
      mainResponsiblePerson: formData.mainResponsiblePerson?.trim(),
      undertakingPersonnel: formData.undertakingPersonnel,
      isSimplifiedTrial: simplifiedTrialIndex.value === 2 ? 1 : 0,
      caseProgress: formData.caseProgress || 'FIRST',
      debtClaimDeadline: formData.debtClaimDeadline,
      remarks: formData.remarks?.trim(),
    }

    const caseResult = await createCaseApi(submitData)

    if (caseResult.code === 200 && caseResult.data) {
      const caseId = caseResult.data.caseId

      // 2. 上传文件（如果有）
      if (selectedFiles.value.length > 0) {
        uni.showLoading({ title: '上传文件中...' })
try {
          // 统一使用 uni.uploadFile 上传
          await uploadFilesUniApp(caseId)
        } catch (fileError: any) {
uni.showToast({ title: `案件创建成功，但文件上传失败: ${fileError.message || '未知错误'}`, icon: 'none' })
        }
      } else {
}

      uni.hideLoading()
      uni.showToast({ title: '案件创建成功', icon: 'success' })
      uni.$emit('refresh-case-list')

      // 3. 跳转到案件详情页
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/cases/detail?id=${caseId}` })
      }, 1500)
    } else {
      throw new Error(caseResult.message || '案件创建失败')
    }
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({ title: error.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.add-case-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.form-scroll {
  background: #f5f7fa;
}

.form-section {
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

  .form-item {
    margin-bottom: 30rpx;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
      font-weight: 500;

      &.required::before {
        content: '*';
        color: #ff4d4f;
        margin-right: 8rpx;
      }
    }

    .input {
      width: 100%;
      height: 80rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }

    .textarea {
      width: 100%;
      min-height: 200rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 24rpx;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }

    .picker {
      width: 100%;
      height: 80rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #333;
      display: flex;
      align-items: center;
      box-sizing: border-box;

      &.placeholder {
        color: #999;
      }
    }

    .select-wrapper {
      display: flex;
      align-items: center;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding-right: 24rpx;

      .picker {
        flex: 1;
        background: transparent;
      }

      .icon {
        font-size: 24rpx;
        color: #999;
      }
    }

    .word-count {
      position: absolute;
      right: 20rpx;
      bottom: 20rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.upload-section {
  .upload-tip {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
    line-height: 1.5;
  }

  .file-list {
    margin-bottom: 20rpx;

    .file-item {
      display: flex;
      align-items: center;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 16rpx;

      .file-icon {
        font-size: 40rpx;
        margin-right: 16rpx;
      }

      .file-name {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .delete-btn {
        font-size: 32rpx;
        color: #ff4d4f;
        padding: 10rpx;
      }
    }
  }

  .upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 160rpx;
    background: #f5f7fa;
    border-radius: 12rpx;
    border: 2rpx dashed #ddd;

    .icon {
      font-size: 48rpx;
      color: #0068E2;
      margin-bottom: 8rpx;
    }

    .text {
      font-size: 28rpx;
      color: #666;
    }

    &:active {
      background: #e8f4ff;
      border-color: #0068E2;
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
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;
  z-index: 100;

  .cancel-btn,
  .submit-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    border: none;
    margin: 0;
    padding: 0;

    &::after {
      display: none;
    }
  }

  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }

  .submit-btn {
    background: #0068E2;
    color: #fff;

    &:active {
      background: #0055c4;
    }

    &[loading] {
      opacity: 0.7;
    }
  }
}

// 选择器弹窗样式
.picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .close-btn {
      font-size: 36rpx;
      color: #999;
      padding: 10rpx;
    }
  }

  .search-box {
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .search-input {
      width: 100%;
      height: 72rpx;
      background: #f5f5f5;
      border-radius: 36rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }
  }

  .picker-list {
    flex: 1;
    max-height: 400rpx;
    padding: 0 30rpx;

    .picker-item {
      display: flex;
      flex-direction: column;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &.active {
        .name {
          color: #0068E2;
          font-weight: 500;
        }
      }

      .name {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 8rpx;
      }

      .sub {
        font-size: 26rpx;
        color: #999;
      }
    }

    .empty-tip {
      text-align: center;
      padding: 60rpx 0;
      font-size: 28rpx;
      color: #999;
    }
  }

  .custom-input-box {
    display: flex;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;
    gap: 20rpx;

    .custom-input {
      flex: 1;
      height: 80rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }

    .confirm-btn {
      width: 140rpx;
      height: 80rpx;
      background: #0068E2;
      color: #fff;
      border-radius: 12rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
      border: none;

      &::after {
        display: none;
      }
    }
  }
}

// 确认弹窗样式
.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: relative;
    width: 600rpx;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 30rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .modal-body {
    padding: 30rpx;
    max-height: 400rpx;
    overflow-y: auto;

    .confirm-item {
      display: flex;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      line-height: 1.5;

      .label {
        color: #666;
        width: 180rpx;
        flex-shrink: 0;
      }

      .value {
        color: #333;
        flex: 1;
        word-break: break-all;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .modal-footer {
    display: flex;
    padding: 20rpx 30rpx;
    gap: 20rpx;
    border-top: 1rpx solid #f0f0f0;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;
      margin: 0;
      padding: 0;
      border: none;

      &::after {
        display: none;
      }
    }

    .cancel-btn {
      background: #f5f5f5;
      color: #666;
    }

    .confirm-btn {
      background: #0068E2;
      color: #fff;
    }
  }
}
</style>
