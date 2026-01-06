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

import { getCaseListApi } from '#/api/core/case';
import { todoApi } from '#/api/core/todo';
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
const caseList = ref<CaseApi.CaseInfo[]>([]);
const currentPage = ref(1);
const pageSize = ref(3); // 每页显示3个数据
const totalCases = ref(0);
const searchKeyword = ref('');
const caseStatus = ref('在办');

// 计算办理天数
const calculateDays = (createTime?: number) => {
  if (!createTime) return '0天';
  const now = new Date();
  const createDate = new Date(createTime);
  const diffTime = Math.abs(now.getTime() - createDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}天`;
};

// 格式化日期
const formatDate = (time?: number) => {
  if (!time) return '';
  return new Date(time).toLocaleDateString('zh-CN');
};

const loadTodoItems = async () => {
  try {
    const res = await todoApi.getTodoList('PENDING', undefined, 1, 5);
    const todos: Todo[] = res.data || [];
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
    const res = await getCaseListApi({ 
      page: currentPage.value, 
      size: pageSize.value,
      AJZT: caseStatus.value,
      AH: searchKeyword.value
    });
    caseList.value = res.data?.records || [];
    totalCases.value = res.data?.count || 0;
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
                :key="item.SEP_ID"
                class="case-card p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                @click="goToCaseDetail(item.SEP_ID)"
              >
                <div class="case-title font-semibold text-base mb-2">{{ item.AH }}</div>
                
                <!-- 承办法院 -->
                <div class="case-info mb-1 text-sm">
                  <span class="text-gray-500">承办法院：</span>
                  <span>{{ item.FYQC }}</span>
                </div>
                
                <!-- 承办法官 -->
                <div class="case-info mb-1 text-sm">
                  <span class="text-gray-500">承办法官：</span>
                  <span>{{ item.CBFG }}</span>
                </div>
                
                <!-- 立案日期 -->
                <div class="case-info mb-1 text-sm">
                  <span class="text-gray-500">立案日期：</span>
                  <span>{{ formatDate(item.LARQ) }}</span>
                </div>
                
                <!-- 案件状态和办理天数 -->
                <div class="case-info flex justify-between mb-3 text-sm">
                  <div>
                    <span class="text-gray-500">案件状态：</span>
                    <span class="text-green-500">{{ item.AJZT }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">办理天数：</span>
                    <span>已审理 {{ calculateDays(item.LARQ) }}</span>
                  </div>
                </div>
                
                <!-- 当前节点 -->
                <div class="case-progress flex justify-start items-center text-xs pt-2 border-t border-dashed border-gray-200">
                  <span class="text-gray-500">当前阶段：</span>
                  <span class="text-blue-500">{{ item.AJJD }}</span>
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
        
        <!-- 待办事项管理板块 - 移到受理案件下方 -->
        <TodoList class="mb-5" title="待办事项管理" />
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
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.view-more {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.view-more-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.view-more-btn:hover {
  background-color: #ecf5ff;
}

/* 案件列表样式 */
.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  transition: all 0.3s;
  background-color: #f0f8ff;
}

.case-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #e6f7ff;
}

.case-title {
  color: #333;
  font-weight: 600;
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
