<template>
  <view class="todo-edit-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content">
        <view class="back-btn" @click="handleBack">
          <u-icon name="arrow-left" color="#fff" size="20"></u-icon>
        </view>
        <text class="title">{{ pageTitle }}</text>
        <view class="right-btn"></view>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <u-form :model="todoForm" ref="todoFormRef" :rules="rules" labelWidth="80">
        <u-form-item label="标题" prop="title" required>
          <u-input 
            v-model="todoForm.title" 
            placeholder="请输入待办标题"
            border="surround"
          ></u-input>
        </u-form-item>

        <u-form-item label="描述" prop="description">
          <u-textarea 
            v-model="todoForm.description" 
            placeholder="请输入待办描述"
            height="120"
            border="surround"
          ></u-textarea>
        </u-form-item>

        <u-form-item label="优先级" prop="priority" required>
          <view class="priority-group">
            <view 
              :class="['priority-btn', { active: todoForm.priority === 'HIGH' }]"
              @click="todoForm.priority = 'HIGH'"
            >
              <text class="btn-text high">高</text>
            </view>
            <view 
              :class="['priority-btn', { active: todoForm.priority === 'NORMAL' }]"
              @click="todoForm.priority = 'NORMAL'"
            >
              <text class="btn-text normal">中</text>
            </view>
            <view 
              :class="['priority-btn', { active: todoForm.priority === 'LOW' }]"
              @click="todoForm.priority = 'LOW'"
            >
              <text class="btn-text low">低</text>
            </view>
          </view>
        </u-form-item>

        <u-form-item label="截止日期" prop="deadline" required>
          <view class="datetime-picker" @click="showDatePicker = true">
            <text :class="['picker-text', { placeholder: !todoForm.deadline }]">
              {{ todoForm.deadline || '请选择截止日期' }}
            </text>
            <u-icon name="calendar" color="#999" size="18"></u-icon>
          </view>
        </u-form-item>

        <!-- 案号搜索 -->
        <u-form-item label="关联案号" prop="caseNumber">
          <view class="case-search-wrapper">
            <u-input
              v-model="caseNumberInput"
              placeholder="请输入案号进行搜索（可选）"
              border="surround"
              @input="onCaseNumberInput"
              @blur="onCaseNumberBlur"
              @focus="onCaseNumberFocus"
            ></u-input>
            <view v-if="caseNumberInput && !selectedCase" class="search-btn" @click="searchCase">
              <u-icon name="search" color="#fff" size="16"></u-icon>
            </view>
            <view v-if="selectedCase" class="clear-btn" @click="clearCase">
              <u-icon name="close" color="#999" size="16"></u-icon>
            </view>
          </view>

          <!-- 已选案件标签 -->
          <view v-if="selectedCase" class="selected-case-tag">
            <text class="case-name">{{ selectedCase.caseName }}</text>
            <text class="case-number">{{ selectedCase.caseNumber }}</text>
          </view>

          <!-- 搜索历史 -->
          <view v-if="showHistory && !selectedCase" class="search-history">
            <view class="history-header">
              <text class="history-title">搜索历史</text>
              <view class="clear-history" @click="clearHistory">
                <u-icon name="trash" color="#999" size="14"></u-icon>
                <text>清空</text>
              </view>
            </view>
            <view class="history-list">
              <view
                v-for="(item, index) in searchHistory"
                :key="index"
                class="history-item"
                @click="useHistorySearch(item)"
              >
                <u-icon name="clock" color="#ccc" size="14"></u-icon>
                <text class="history-text">{{ item }}</text>
                <view class="remove-btn" @click.stop="removeHistoryItem(item, $event)">
                  <u-icon name="close" color="#ccc" size="12"></u-icon>
                </view>
              </view>
            </view>
          </view>

          <!-- 搜索结果列表 -->
          <view v-if="showSearchResults && searchResults.length > 0" class="search-results">
            <view class="results-header">
              <text class="results-count">共 {{ searchTotal }} 条结果</text>
            </view>
            <view
              v-for="item in searchResults"
              :key="item.id"
              class="result-item"
              @click="selectCase(item)"
            >
              <view class="result-info">
                <rich-text class="result-name" :nodes="highlightKeyword(item.caseName, searchKeyword)"></rich-text>
                <rich-text class="result-number" :nodes="highlightKeyword(item.caseNumber, searchKeyword)"></rich-text>
              </view>
              <u-icon name="arrow-right" color="#999" size="14"></u-icon>
            </view>
            <!-- 加载更多 -->
            <view v-if="hasMore" class="load-more" @click="loadMore">
              <text v-if="!searching">点击加载更多</text>
              <u-loading-icon v-else size="14" text="加载中..."></u-loading-icon>
            </view>
          </view>

          <!-- 搜索提示 -->
          <view v-if="showSearchResults && searchResults.length === 0 && !searching" class="search-empty">
            <u-icon name="search" color="#ddd" size="40"></u-icon>
            <text>未找到匹配的案件</text>
            <text class="empty-tip">请尝试更换关键词搜索</text>
          </view>

          <!-- 搜索中 -->
          <view v-if="searching && searchResults.length === 0" class="search-loading">
            <u-loading-icon size="20" text="搜索中..."></u-loading-icon>
          </view>
        </u-form-item>
      </u-form>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <u-button 
        type="primary" 
        text="保存"
        :loading="submitting"
        @click="handleSubmit"
      ></u-button>
    </view>

    <!-- 日期选择器 -->
    <u-datetime-picker
      :show="showDatePicker"
      v-model="selectedDate"
      mode="datetime"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = true"
    ></u-datetime-picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getPageParam } from '@/utils/pageParam'
import {
  createTodoWithCase,
  updateTodoWithCase,
  getTodoById,
  searchSimpleCases,
  type Todo,
  type SimpleCaseInfo
} from '@/api/todo'

import dayjs from 'dayjs'

const authStore = useAuthStore()
const todoId = ref('')
const mode = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const showDatePicker = ref(false)
const selectedDate = ref(Date.now())

// 案号搜索相关
const caseNumberInput = ref('')
const selectedCase = ref<SimpleCaseInfo | null>(null)
const searchResults = ref<SimpleCaseInfo[]>([])
const showSearchResults = ref(false)
const searching = ref(false)
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const searchPage = ref(1)
const searchTotal = ref(0)
const hasMore = ref(false)
const searchKeyword = ref('')
const searchHistory = ref<string[]>([])
const showHistory = ref(false)
const SEARCH_HISTORY_KEY = 'todo_case_search_history'
const MAX_HISTORY = 8

const todoForm = ref<Partial<Todo>>({
  title: '',
  description: '',
  priority: 'NORMAL',
  deadline: '',
  caseNumber: undefined,
  caseId: undefined,
  userId: 0,
})

const todoFormRef = ref()

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
  caseNumber: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        // 如果填写了案号，必须选择了有效的案件
        if (caseNumberInput.value && !selectedCase.value) {
          callback(new Error('请从搜索结果中选择有效的案件，或清空案号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const pageTitle = computed(() => mode.value === 'add' ? '新建待办' : '编辑待办')

onMounted(() => {
  mode.value = (getPageParam('mode') as 'add' | 'edit') || 'add'
  todoId.value = getPageParam('id') || ''
  if (mode.value === 'edit' && todoId.value) {
    loadTodoDetail()
  }

  // 设置当前用户ID
  if (authStore.userInfo?.userId) {
    todoForm.value.userId = authStore.userInfo.userId
  }

  // 加载搜索历史
  loadSearchHistory()
})

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = uni.getStorageSync(SEARCH_HISTORY_KEY)
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (e) {
    searchHistory.value = []
  }
}

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return
  const trimmed = keyword.trim()
  // 去重并放到最前面
  searchHistory.value = [trimmed, ...searchHistory.value.filter(item => item !== trimmed)].slice(0, MAX_HISTORY)
  uni.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
}

// 删除单条历史
const removeHistoryItem = (item: string, event: Event) => {
  event.stopPropagation()
  searchHistory.value = searchHistory.value.filter(h => h !== item)
  uni.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
}

// 清空历史
const clearHistory = () => {
  searchHistory.value = []
  uni.removeStorageSync(SEARCH_HISTORY_KEY)
}

// 使用历史记录搜索
const useHistorySearch = (keyword: string) => {
  caseNumberInput.value = keyword
  searchCase()
}

const loadTodoDetail = async () => {
  try {
    const res = await getTodoById(Number(todoId.value))
    if (res.data) {
      todoForm.value = {
        ...res.data,
        deadline: res.data.deadline ? dayjs(res.data.deadline).format('YYYY-MM-DD HH:mm') : '',
      }

      // 如果有案号，显示已选案件
      if (res.data.caseNumber) {
        caseNumberInput.value = res.data.caseNumber
        selectedCase.value = {
          id: res.data.caseId || 0,
          caseNumber: res.data.caseNumber,
          caseName: res.data.caseName || res.data.caseNumber,
        }
      }

      if (res.data.deadline) {
        selectedDate.value = dayjs(res.data.deadline).valueOf()
      }
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 案号输入处理
const onCaseNumberInput = (value: string) => {
  // 清除之前的定时器
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }

  // 如果清空了输入，清除选择
  if (!value.trim()) {
    clearCase()
    return
  }

  // 如果已选择案件，用户重新输入，清除选择
  if (selectedCase.value) {
    selectedCase.value = null
    todoForm.value.caseNumber = undefined
    todoForm.value.caseId = undefined
    todoForm.value.relatedId = undefined
    todoForm.value.relatedType = undefined
  }

  // 显示历史记录
  showHistory.value = true
  showSearchResults.value = false

  // 延迟搜索，避免频繁请求
  searchTimer.value = setTimeout(() => {
    searchCase()
  }, 600)
}

// 案号获得焦点
const onCaseNumberFocus = () => {
  if (!caseNumberInput.value.trim() && searchHistory.value.length > 0) {
    showHistory.value = true
    showSearchResults.value = false
  }
}

// 案号失去焦点
const onCaseNumberBlur = () => {
  // 延迟隐藏搜索结果，让用户可以点击
  setTimeout(() => {
    showSearchResults.value = false
    showHistory.value = false
  }, 250)
}

// 搜索案件
const searchCase = async (page: number = 1) => {
  const keyword = caseNumberInput.value.trim()
  if (!keyword) {
    searchResults.value = []
    showSearchResults.value = false
    showHistory.value = searchHistory.value.length > 0
    return
  }

  searching.value = true
  showSearchResults.value = true
  showHistory.value = false
  searchKeyword.value = keyword

  try {
    const res = await searchSimpleCases(keyword, page, 10)
    if (res.data?.content || res.data?.list) {
      const list = res.data.content || res.data.list || []
      if (page === 1) {
        searchResults.value = list
      } else {
        searchResults.value = [...searchResults.value, ...list]
      }
      searchTotal.value = res.data.totalElements || 0
      searchPage.value = page
      hasMore.value = searchResults.value.length < searchTotal.value
      // 保存搜索历史
      saveSearchHistory(keyword)
    } else {
      if (page === 1) {
        searchResults.value = []
      }
      hasMore.value = false
  }
  } catch (error) {
    if (page === 1) {
      searchResults.value = []
    }
    hasMore.value = false
  } finally {
    searching.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!hasMore.value || searching.value) return
  searchCase(searchPage.value + 1)
}

// 选择案件
const selectCase = (caseItem: SimpleCaseInfo) => {
  selectedCase.value = caseItem
  caseNumberInput.value = caseItem.caseNumber
  todoForm.value.caseNumber = caseItem.caseNumber
  todoForm.value.caseId = caseItem.id
  todoForm.value.relatedId = caseItem.id
  todoForm.value.relatedType = 'CASE'
  showSearchResults.value = false
  showHistory.value = false
  }

// 清除案件选择
const clearCase = () => {
  selectedCase.value = null
  caseNumberInput.value = ''
  todoForm.value.caseNumber = undefined
  todoForm.value.caseId = undefined
  todoForm.value.relatedId = undefined
  todoForm.value.relatedType = undefined
  searchResults.value = []
  showSearchResults.value = false
  showHistory.value = searchHistory.value.length > 0
}

// 高亮匹配关键词
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword.trim()) return text
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<text class="highlight">$1</text>')
}

const onDateConfirm = (e: any) => {
  todoForm.value.deadline = dayjs(e.value).format('YYYY-MM-DD HH:mm')
  showDatePicker.value = false
  }

const handleSubmit = async () => {
  const valid = await todoFormRef.value?.validate()
  if (!valid) return

  if (!todoForm.value.userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  // 验证案号：如果输入了案号但没有选择案件，提示错误
  if (caseNumberInput.value && !selectedCase.value) {
    uni.showToast({ title: '请从搜索结果中选择有效的案件，或清空案号', icon: 'none', duration: 3000 })
    return
  }

  submitting.value = true
  try {
    let res
    const submitData = {
      ...todoForm.value,
      deadline: todoForm.value.deadline ? dayjs(todoForm.value.deadline).format('YYYY-MM-DD HH:mm:ss') : undefined,
    }

    if (mode.value === 'add') {
      res = await createTodoWithCase(submitData as any)
    } else {
      res = await updateTodoWithCase(Number(todoId.value), submitData)
    }
    if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      uni.$emit('refresh-todo-list')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.todo-edit-container {
  min-height: 100vh;
  background: #f5f7fa;
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
      color: #fff;
    }

    .right-btn {
      width: 60rpx;
    }
  }
}

.form-container {
  background: #fff;
  margin: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;

  // 自定义优先级按钮样式
  .priority-group {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .priority-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 72rpx;
      min-width: 80rpx;
      padding: 0 24rpx;
      border: 2rpx solid #e8e8e8;
      border-radius: 12rpx;
      background: #fff;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }

      &.active {
        border-color: #0068E2;
        background: #e6f7ff;

        .btn-text {
          font-weight: bold;
          font-size: 32rpx;
        }
      }

      .btn-text {
        font-size: 30rpx;
        line-height: 1;

        &.high {
          color: #ff4d4f;
        }

        &.normal {
          color: #faad14;
        }

        &.low {
          color: #52c41a;
        }
      }
    }
  }

  .priority-text {
    margin-left: 8rpx;
    font-size: 26rpx;

    &.high {
      color: #ff4d4f;
    }

    &.normal {
      color: #faad14;
    }

    &.low {
      color: #52c41a;
    }
  }

  .datetime-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 20rpx;
    border: 1rpx solid #dcdfe6;
    border-radius: 8rpx;

    .picker-text {
      font-size: 28rpx;
      color: #333;

      &.placeholder {
        color: #999;
      }
    }
  }

  // 案号搜索样式
  .case-search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12rpx;

    :deep(.u-input) {
      flex: 1;
    }

    .search-btn {
      width: 64rpx;
      height: 64rpx;
      background: #0068E2;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &:active {
        opacity: 0.8;
      }
    }

    .clear-btn {
      width: 64rpx;
      height: 64rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &:active {
        background: #e8e8e8;
      }
    }
  }

  // 已选案件标签
  .selected-case-tag {
    margin-top: 16rpx;
    padding: 16rpx 20rpx;
    background: #e6f7ff;
    border: 1rpx solid #0068E2;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .case-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }

    .case-number {
      font-size: 24rpx;
      color: #666;
    }
  }

  // 搜索历史
  .search-history {
    margin-top: 16rpx;
    background: #fff;
    border: 1rpx solid #e8e8e8;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;

    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16rpx;

      .history-title {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;
      }

      .clear-history {
        display: flex;
        align-items: center;
        gap: 6rpx;
        padding: 8rpx 12rpx;

        text {
          font-size: 24rpx;
          color: #999;
        }

        &:active {
          opacity: 0.7;
        }
      }
    }

    .history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .history-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 12rpx 20rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        max-width: 100%;

        &:active {
          background: #e8e8e8;
        }

        .history-text {
          font-size: 26rpx;
          color: #333;
          max-width: 300rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .remove-btn {
          padding: 4rpx;
          margin-left: 4rpx;

          &:active {
            opacity: 0.6;
          }
        }
      }
    }
  }

  // 搜索结果列表
  .search-results {
    margin-top: 16rpx;
    background: #fff;
    border: 1rpx solid #e8e8e8;
    border-radius: 12rpx;
    max-height: 600rpx;
    overflow-y: auto;

    .results-header {
      padding: 16rpx 24rpx;
      border-bottom: 1rpx solid #f0f0f0;
      background: #fafafa;
      border-radius: 12rpx 12rpx 0 0;

      .results-count {
        font-size: 24rpx;
        color: #999;
      }
    }

    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 24rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: #f5f7fa;
      }

      .result-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        flex: 1;
        overflow: hidden;

        .result-name {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;

          ::v-deep .highlight {
            color: #0068E2;
            font-weight: bold;
          }
        }

        .result-number {
          font-size: 24rpx;
          color: #999;

          ::v-deep .highlight {
            color: #0068E2;
            font-weight: bold;
          }
        }
      }
    }

    .load-more {
      padding: 24rpx;
      text-align: center;
      border-top: 1rpx solid #f0f0f0;

      text {
        font-size: 26rpx;
        color: #0068E2;
      }

      &:active {
        background: #f5f7fa;
      }
    }
  }

  // 搜索空状态
  .search-empty {
    margin-top: 16rpx;
    padding: 60rpx 40rpx;
    text-align: center;
    background: #fafafa;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;

    text {
      font-size: 28rpx;
      color: #999;
    }

    .empty-tip {
      font-size: 24rpx;
      color: #bbb;
    }
  }

  // 搜索加载中
  .search-loading {
    margin-top: 16rpx;
    padding: 60rpx 40rpx;
    display: flex;
    justify-content: center;
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
