<script lang="ts" setup>
import type { Todo } from '#/api/core/todo';
import { type CaseApi } from '#/api/core/case';

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { ElTag, ElPagination, ElMessage } from 'element-plus';

import { getUserCaseListApi } from '#/api/core/case';
import { todoApi } from '#/api/core/todo';
import {
  getAnnouncementListApi,
  createViewRecordApi
} from '#/api/core/case-announcement';
import TodoList from '#/components/TodoList.vue';

const userStore = useUserStore();
const router = useRouter();

// 固定显示"您好"，不展示实际位置
const location = ref('您好');
const weather = ref({
  condition: '',
  tempMin: '',
  tempMax: '',
});

const todoItems = ref<WorkbenchTodoItem[]>([]);
const loading = ref(false);

// 案件列表相关数据
const caseList = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(3); // 每页显示3个数据
const totalCases = ref(0);
const searchKeyword = ref('');
const caseStatus = ref('在办');

// 计算办理天数
const calculateDays = (filingDate?: string) => {
  if (!filingDate) return '0天';
  const now = new Date();
  const createDate = new Date(filingDate);
  const diffTime = Math.abs(now.getTime() - createDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}天`;
};

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

// 案件进度映射
const caseProgressMap: Record<string, string> = {
  'FIRST': '第一阶段',
  'SECOND': '第二阶段',
  'THIRD': '第三阶段',
  'FOURTH': '第四阶段',
  'FIFTH': '第五阶段',
  'SIXTH': '第六阶段',
  'SEVENTH': '第七阶段'
};

// 案件状态映射
const caseStatusMap: Record<string, string> = {
  'ONGOING': '在办',
  'AWAITING': '报结',
  'COMPLETED': '已结'
};

// 公告相关数据
interface Announcement {
  id: number;
  caseId: number;
  title: string;
  content: string;
  announcementType: string;
  status: string;
  publisherId: number;
  publisherName: string;
  publishTime: string;
  viewCount: number;
  isTop: boolean;
  topExpireTime: string;
  attachments: any[];
  createTime: string;
  updateTime: string;
}

const announcements = ref<Announcement[]>([]);
const announcementLoading = ref(false);
const announcementCurrentPage = ref(1);
const announcementPageSize = ref(5);
const announcementTotal = ref(0);

const announcementTypeMap: Record<string, { label: string; type: string }> = {
  NORMAL: { label: '普通', type: 'info' },
  URGENT: { label: '紧急', type: 'danger' },
  IMPORTANT: { label: '重要', type: 'warning' },
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 加载公告列表
const loadAnnouncements = async () => {
  announcementLoading.value = true;
  try {
    const response = await getAnnouncementListApi(
      announcementCurrentPage.value,
      announcementPageSize.value
    );
    if (response.code === 200 && response.data) {
      announcements.value = response.data.list || [];
      announcementTotal.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('加载公告列表失败:', error);
    ElMessage.error('加载公告列表失败');
  } finally {
    announcementLoading.value = false;
  }
};

// 查看公告详情
const viewAnnouncementDetail = async (announcement: Announcement) => {
  try {
    // 获取当前用户ID
    const chatUserId = localStorage.getItem('chat_user_id');
    const userId = Number(chatUserId) || 0;
    
    // 调用创建查看记录API
    await createViewRecordApi({
      announcementId: announcement.id,
      caseId: announcement.caseId,
      viewerId: userId,
    });
    // 这里可以添加查看详情的逻辑，比如弹出对话框
    ElMessage.info('查看公告详情');
  } catch (error) {
    console.error('记录公告查看失败:', error);
  }
};

const loadTodoItems = async () => {
  try {
    // 新API页码从0开始，所以传递0而不是1
    const res = await todoApi.getTodoList('PENDING', undefined, 0, 5);
    // 新API响应格式中，待办事项在content字段中
    const todos: Todo[] = res.data?.content || [];
    todoItems.value = todos.map((item: Todo) => ({
      title: item.title,
      content: item.description || '暂无描述',
      date: item.deadline
        ? new Date(item.deadline).toLocaleDateString('zh-CN')
        : new Date().toLocaleDateString('zh-CN'),
      completed: item.status === 'COMPLETED',
    }));
  } catch (error) {
    console.error('加载待办事项失败:', error);
  }
};

// 加载案件列表
const loadCaseList = async () => {
  loading.value = true;
  try {
    // 从本地存储获取userId
    const chatUserId = localStorage.getItem('chat_user_id');
    const userId = Number(chatUserId) || 0;
    
    // 映射案件状态到后端需要的英文状态
    const statusMap: Record<string, string> = {
      '在办': 'ONGOING',
      '报结': 'AWAITING',
      '已结': 'COMPLETED'
    };
    const caseStatusEn = statusMap[caseStatus.value] || 'ONGOING';
    
    const res = await getUserCaseListApi(userId, { 
      pageNum: currentPage.value, 
      pageSize: pageSize.value,
      caseStatus: caseStatusEn
    });
    caseList.value = res.data?.list || [];
    totalCases.value = res.data?.total || 0;
  } catch (error) {
    console.error('加载案件数据失败:', error);
    caseList.value = [];
    totalCases.value = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索案件
const searchCases = () => {
  currentPage.value = 1;
  loadCaseList();
};

// 切换案件状态
const changeCaseStatus = (status: string) => {
  caseStatus.value = status;
  currentPage.value = 1;
  loadCaseList();
};

// 分页变化处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadCaseList();
};

// 跳转到案件详情
const goToCaseDetail = (caseId: number) => {
  router.push(`/case-detail/${caseId}`);
};

// 获取天气数据 - 根据用户IP地址获取
const getWeather = async () => {
  try {
    // 使用ip-api.com获取用户IP对应的经纬度（免费API，无需密钥）
    const ipResponse = await fetch('https://ipapi.co/json/');
    const ipData = await ipResponse.json();
    
    // 获取经纬度
    const latitude = ipData.latitude || 30.6833; // 默认使用安吉经纬度
    const longitude = ipData.longitude || 119.6333;
    
    // 使用Open-Meteo API获取天气数据（无需API密钥）
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Asia/Shanghai`
    );
    const weatherData = await weatherResponse.json();
    
    // 天气代码映射
    const weatherCodeMap: Record<number, string> = {
      0: '晴',
      1: '晴',
      2: '多云',
      3: '阴',
      45: '雾',
      48: '雾凇',
      51: '小雨',
      53: '中雨',
      55: '大雨',
      56: '冻雨',
      57: '冻雨',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      66: '冻雨',
      67: '冻雨',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      77: '雪粒',
      80: '阵雨',
      81: '阵雨',
      82: '阵雨',
      85: '阵雪',
      86: '阵雪',
      95: '雷暴',
      96: '雷暴',
      99: '雷暴',
    };
    
    weather.value = {
      condition: weatherCodeMap[weatherData.daily.weathercode[0]] || '未知',
      tempMin: `${Math.round(weatherData.daily.temperature_2m_min[0])}℃`,
      tempMax: `${Math.round(weatherData.daily.temperature_2m_max[0])}℃`,
    };
  } catch (error) {
    console.error('获取天气数据失败:', error);
    weather.value = {
      condition: '晴',
      tempMin: '20℃',
      tempMax: '32℃',
    };
  }
};

// 根据当前时间获取问候语
const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 6 && hour < 12) {
    return '早安';
  } else if (hour >= 12 && hour < 18) {
    return '午安';
  } else {
    return '晚安';
  }
};

// 问候语
const greeting = ref(getGreeting());

// 初始化获取天气数据
const initWeather = async () => {
  await getWeather();
};

onMounted(() => {
  loadTodoItems();
  loadCaseList();
  loadAnnouncements();
  initWeather();
});
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        <div class="flex items-center justify-between">
          <span>{{ greeting }}, {{ userStore.userInfo?.realName }},
            开始您一天的工作吧！</span>
        </div>
      </template>
      <template #description>
        {{ location ? location : '未知位置' }}，今日{{ weather.condition }}，{{ weather.tempMin }} ~ {{ weather.tempMax }}！
      </template>
    </WorkbenchHeader>

    <div class="mt-5">
      <!-- 左侧主要内容区 -->
      <div class="mb-5">
        <!-- 受理案件板块 -->
        <AnalysisChartCard title="我的案件" class="mb-5">
          <div class="case-header mb-4">
            <div class="case-tabs flex">
              <button 
                v-for="status in ['在办', '报结', '已结']" 
                :key="status"
                class="case-tab-btn mr-2 px-3 py-1 rounded-full text-sm"
                :class="{ 'bg-blue-500 text-white': caseStatus === status, 'bg-gray-100 text-gray-700': caseStatus !== status }"
                @click="changeCaseStatus(status)"
              >
                {{ status }}
              </button>
            </div>
            <div class="case-search flex items-center">
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="请输入案号"
                class="case-search-input px-3 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keyup.enter="searchCases"
              />
              <button 
                class="ml-2 text-gray-500"
                @click="searchCases"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-loading="loading" class="case-list">
            <div v-if="caseList.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div 
                v-for="item in caseList" 
                :key="item.id"
                class="case-card p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                @click="goToCaseDetail(item.id)"
              >
                <div class="case-title font-semibold text-base mb-2">{{ item.caseNumber }}</div>
                
                <!-- 承办法院 -->
                <div class="case-info mb-1 text-sm">
                  <span class="text-gray-500">承办法院：</span>
                  <span>{{ item.acceptanceCourt }}</span>
                </div>
                
                <!-- 承办法官 -->
                <div class="case-info mb-1 text-sm">
                  <span class="text-gray-500">承办法官：</span>
                  <span>{{ item.designatedJudge }}</span>
                </div>
                
                <!-- 立案日期 -->
                <div class="case-info mb-1 text-sm">
                  <span class="text-gray-500">立案日期：</span>
                  <span>{{ formatDate(item.filingDate) }}</span>
                </div>
                
                <!-- 案件状态和办理天数 -->
                <div class="case-info flex justify-between mb-3 text-sm">
                  <div>
                    <span class="text-gray-500">案件状态：</span>
                    <span class="text-green-500">{{ caseStatusMap[item.caseStatus] }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">办理天数：</span>
                    <span>已审理 {{ calculateDays(item.filingDate) }}</span>
                  </div>
                </div>
                
                <!-- 当前节点 -->
                <div class="case-progress flex justify-start items-center text-xs pt-2 border-t border-dashed border-gray-200">
                  <span class="text-gray-500">当前阶段：</span>
                  <span class="text-blue-500">{{ caseProgressMap[item.caseProgress] }}</span>
                </div>
              </div>
            </div>
            
            <!-- 暂无数据 -->
            <div v-else class="empty-case-list flex flex-col items-center justify-center py-10 text-gray-500">
              <img 
                src="/src/images/u=3126400111,3705029976&fm=253&fmt=auto&app=138&f=PNG.webp" 
                alt="暂无数据" 
                class="h-12 w-12 mb-2" 
              />
              <span>暂无案件数据</span>
            </div>
          </div>
          
          <!-- 分页 -->
          <div v-if="totalCases > 0" class="case-pagination mt-4 flex justify-center">
            <div class="flex items-center">
              <span class="pagination-text mr-4 text-sm text-gray-600">
                共 {{ totalCases }} 条，第
              </span>
              <button 
                class="pagination-btn px-2 py-1 border border-gray-300 rounded-l"
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                &lt;
              </button>
              <input 
                type="number" 
                v-model.number="currentPage" 
                min="1" 
                :max="Math.ceil(totalCases / pageSize)" 
                class="pagination-input px-3 py-1 border-t border-b border-gray-300 text-center w-12"
                @keyup.enter="handlePageChange(currentPage)"
                @change="handlePageChange(currentPage)"
              />
              <button 
                class="pagination-btn px-2 py-1 border border-gray-300 rounded-r"
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage * pageSize >= totalCases"
              >
                &gt;
              </button>
              <span class="pagination-text ml-4 text-sm text-gray-600">
                /{{ Math.ceil(totalCases / pageSize) }} 页
              </span>
            </div>
          </div>
        </AnalysisChartCard>
        
        <!-- 待办事项和公告板块并排布局 -->
        <div class="flex gap-5">
          <!-- 待办事项管理板块 - 占2/3宽度 -->
          <div class="flex-1 min-w-0">
            <TodoList class="mb-5" title="待办事项管理" />
          </div>
          
          <!-- 公告板块 - 占1/3宽度 -->
          <div class="w-1/3 min-w-0">
            <AnalysisChartCard title="公告列表" class="mb-5">
              <div v-loading="announcementLoading" class="announcement-list">
                <div v-if="announcements.length > 0" class="space-y-3">
                  <div 
                    v-for="item in announcements" 
                    :key="item.id"
                    class="announcement-card p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                    @click="viewAnnouncementDetail(item)"
                  >
                    <div class="announcement-header flex justify-between items-start mb-2">
                      <h4 class="announcement-title font-semibold text-sm truncate">
                        {{ item.title }}
                      </h4>
                      <ElTag 
                        v-if="item.isTop" 
                        size="small" 
                        type="danger" 
                        effect="light"
                      >
                        置顶
                      </ElTag>
                    </div>
                    
                    <div class="announcement-content text-xs text-gray-600 line-clamp-2 mb-2">
                      {{ item.content }}
                    </div>
                    
                    <div class="announcement-meta flex justify-between items-center text-xs text-gray-500">
                      <div class="flex items-center">
                        <ElTag 
                          :type="announcementTypeMap[item.announcementType]?.type || 'info'" 
                          size="small"
                          effect="plain"
                        >
                          {{ announcementTypeMap[item.announcementType]?.label || '普通' }}
                        </ElTag>
                        <span class="ml-2">{{ item.publisherName }}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="mr-2">{{ formatDateTime(item.publishTime) }}</span>
                        <span class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {{ item.viewCount }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 暂无公告 -->
                <div v-else class="empty-announcement flex flex-col items-center justify-center py-10 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>暂无公告</span>
                </div>
              </div>
              
              <!-- 公告分页 -->
              <div v-if="announcementTotal > 0" class="announcement-pagination mt-4 flex justify-center">
                <ElPagination
                  v-model:current-page="announcementCurrentPage"
                  v-model:page-size="announcementPageSize"
                  :page-sizes="[5, 10, 20]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="announcementTotal"
                  @size-change="loadAnnouncements"
                  @current-change="loadAnnouncements"
                  small
                />
              </div>
            </AnalysisChartCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pending-approvals {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-icon {
  margin-bottom: 12px;
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.view-more {
  padding-top: 12px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}

.view-more-btn {
  padding: 4px 12px;
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.view-more-btn:hover {
  background-color: #ecf5ff;
}

/* 案件列表样式 */
.case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.case-tabs {
  display: flex;
  gap: 8px;
}

.case-tab-btn {
  cursor: pointer;
  transition: all 0.3s;
}

.case-tab-btn:hover {
  opacity: 0.8;
}

.case-search {
  display: flex;
  align-items: center;
}

.case-search-input {
  width: 200px;
  transition: width 0.3s;
}

.case-search-input:focus {
  width: 250px;
}

.case-list {
  min-height: 200px;
}

.case-card {
  background-color: #f0f8ff;
  transition: all 0.3s;
}

.case-card:hover {
  background-color: #e6f7ff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}

.case-title {
  font-weight: 600;
  color: #333;
}

.case-info {
  font-size: 14px;
  line-height: 1.5;
}

.case-progress {
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

.empty-case-list {
  min-height: 200px;
}

.case-pagination {
  margin-top: 16px;
}

.pagination-btn {
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-info {
  background-color: #fff;
}

/* 清理不需要的样式 */
</style>
