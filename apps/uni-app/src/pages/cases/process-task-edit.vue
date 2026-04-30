<template>
  <view class="task-edit-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <text class="title">{{ pageTitle }}</text>
      <view class="right-btn" v-if="mode === 'view'" @click="mode = 'edit'">
        <text class="edit-text">编辑</text>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <u-form :model="taskForm" ref="taskFormRef" :rules="rules" labelWidth="80">
        <u-form-item label="任务名称" prop="taskName" required>
          <u-input 
            v-model="taskForm.taskName" 
            placeholder="请输入任务名称"
            :disabled="mode === 'view'"
          ></u-input>
        </u-form-item>
        
        <u-form-item label="任务编码" prop="taskCode">
          <u-input 
            v-model="taskForm.taskCode" 
            placeholder="请输入任务编码"
            :disabled="mode === 'view'"
          ></u-input>
        </u-form-item>
        
        <u-form-item label="任务描述" prop="taskDescription">
          <u-textarea 
            v-model="taskForm.taskDescription" 
            placeholder="请输入任务描述"
            :disabled="mode === 'view'"
            height="120"
          ></u-textarea>
        </u-form-item>

        <u-form-item label="任务状态" prop="status" v-if="mode !== 'add'">
          <u-radio-group v-model="taskForm.status" :disabled="mode === 'view'">
            <u-radio label="PENDING">待处理</u-radio>
            <u-radio label="PROCESSING">进行中</u-radio>
            <u-radio label="COMPLETED">已完成</u-radio>
          </u-radio-group>
        </u-form-item>
      </u-form>
    </view>

    <!-- 文件列表 -->
    <view class="file-section" v-if="mode !== 'add'">
      <view class="section-header">
        <text class="title">附件文件</text>
        <text class="count">({{ fileList.length }})</text>
      </view>
      
      <view class="file-list" v-if="fileList.length > 0">
        <view 
          v-for="file in fileList" 
          :key="file.id"
          class="file-item"
        >
          <u-icon name="file-text" size="20" color="#0068E2"></u-icon>
          <text class="file-name">{{ file.fileName }}</text>
          <view class="file-actions" v-if="mode === 'edit'">
            <u-icon name="trash" size="16" color="#ff4d4f" @click="handleDeleteFile(file.id)"></u-icon>
          </view>
        </view>
      </view>
      
      <u-empty v-else mode="list" text="暂无文件"></u-empty>

      <!-- 上传按钮 -->
      <view class="upload-btn" v-if="mode === 'edit'" @click="handleUpload">
        <u-icon name="plus" size="16" color="#0068E2"></u-icon>
        <text>上传文件</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="mode !== 'view'">
      <u-button 
        type="primary" 
        text="保存"
        :loading="submitting"
        @click="handleSubmit"
      ></u-button>
    </view>

    <!-- 加载状态 -->
    <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  getCaseTaskById, 
  addCaseTask, 
  updateCaseTask,
  getTaskFiles,
  type CaseTask,
  type CaseTaskDetail 
} from '@/api/process'
const caseId = ref('')
const taskId = ref('')
const mode = ref<'add' | 'edit' | 'view'>('add')
const loading = ref(false)
const submitting = ref(false)
const fileList = ref<any[]>([])

const taskForm = ref<Partial<CaseTask>>({
  taskName: '',
  taskCode: '',
  taskDescription: '',
  status: 'PENDING',
  caseId: 0,
})

const taskFormRef = ref()

const rules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
}

const pageTitle = computed(() => {
  const titles = { add: '新建任务', edit: '编辑任务', view: '任务详情' }
  return titles[mode.value]
})

onMounted(() => {
const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options || {}
  
  caseId.value = options.caseId || ''
  taskId.value = options.taskId || ''
  mode.value = options.mode || 'add'
if (mode.value !== 'add' && taskId.value) {
    loadTaskDetail()
  }
})

const loadTaskDetail = async () => {
  loading.value = true
  try {
    const res = await getCaseTaskById(Number(taskId.value))
if (res.data) {
      taskForm.value = res.data
      loadTaskFiles()
    }
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadTaskFiles = async () => {
  try {
    const res = await getTaskFiles(Number(taskId.value))
fileList.value = res.data || []
  } catch (error) {
}
}

const handleSubmit = async () => {
const valid = await taskFormRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    let res
    if (mode.value === 'add') {
      res = await addCaseTask({
        ...taskForm.value,
        caseId: Number(caseId.value),
      })
    } else {
      res = await updateCaseTask(Number(taskId.value), {
        taskDescription: taskForm.value.taskDescription,
        status: taskForm.value.status,
      })
    }
if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      uni.$emit('refresh-task-list', caseId.value)
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
    }
  } catch (error) {
uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const handleUpload = () => {
uni.showToast({ title: '上传功能开发中', icon: 'none' })
}

const handleDeleteFile = (fileId: number) => {
uni.showModal({
    title: '确认删除',
    content: '确定要删除这个文件吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '删除功能开发中', icon: 'none' })
      }
    },
  })
}

const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.task-edit-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 140rpx;
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
    width: 80rpx;
    text-align: right;

    .edit-text {
      font-size: 28rpx;
      color: #0068E2;
    }
  }
}

.form-container {
  background: #fff;
  padding: 24rpx;
  margin: 20rpx;
  border-radius: 16rpx;
}

.file-section {
  background: #fff;
  padding: 24rpx;
  margin: 20rpx;
  border-radius: 16rpx;

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .count {
      font-size: 26rpx;
      color: #999;
      margin-left: 8rpx;
    }
  }

  .file-list {
    .file-item {
      display: flex;
      align-items: center;
      padding: 16rpx;
      background: #f5f7fa;
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

      .file-actions {
        padding: 8rpx;
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
    margin-top: 20rpx;

    text {
      font-size: 26rpx;
      color: #0068E2;
      margin-left: 8rpx;
    }
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}
</style>
