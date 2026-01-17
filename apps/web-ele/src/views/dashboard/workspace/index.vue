<script lang="ts" setup>
import type { Todo } from '#/api/core/todo';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { AnalysisChartCard, WorkbenchHeader } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElDialog,
  ElEmpty,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCaseListApi, getUserCaseListApi } from '#/api/core/case';
import {
  createViewRecordApi,
  getAnnouncementDetailApi,
  getAnnouncementListApi,
  getViewRecordListApi,
} from '#/api/core/case-announcement';
import { downloadFileApi } from '#/api/core/file';
import { todoApi } from '#/api/core/todo';
import TodoList from '#/components/TodoList.vue';

const userStore = useUserStore();
const router = useRouter();

// 从本地存储获取用户信息
const getUserInfoFromLocal = () => {
  try {
    const chatUserInfoStr = localStorage.getItem('chat_user_info');
    if (chatUserInfoStr) {
      return JSON.parse(chatUserInfoStr);
    }
  } catch (error) {
    console.error('获取本地用户信息失败:', error);
  }
  return null;
};

// 获取当前用户信息
const currentUserInfo = ref(getUserInfoFromLocal());

// 固定显示"您好"，不展示实际位置
const location = ref('您好');
const weather = ref({
  condition: '',
  tempMin: '',
  tempMax: '',
});

const todoItems = ref<WorkbenchTodoItem[]>([]);
const loading = ref(false);

// 统计数据
const todoCount = ref(0);
const todoTotal = ref(0);
const caseCount = ref(0);
const teamCount = ref(0);

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
  FIRST: '第一阶段',
  SECOND: '第二阶段',
  THIRD: '第三阶段',
  FOURTH: '第四阶段',
  FIFTH: '第五阶段',
  SIXTH: '第六阶段',
  SEVENTH: '第七阶段',
};

// 案件状态映射
const caseStatusMap: Record<string, string> = {
  ONGOING: '在办',
  AWAITING: '报结',
  COMPLETED: '已结',
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

// 公告详情相关
const showAnnouncementDetailDialog = ref(false);
const announcementDetail = ref<Announcement | null>(null);
const detailLoading = ref(false);

// 浏览记录相关
const showViewsDialog = ref(false);
const viewsList = ref<any[]>([]);
const viewsTotal = ref(0);
const viewsCurrentPage = ref(1);
const viewsPageSize = ref(10);
const viewsLoading = ref(false);

// 附件相关
const showPreviewDialog = ref(false);
const previewAttachment = ref<any>(null);
const previewUrl = ref('');
const previewLoading = ref(false);
const isImage = ref(false);
const isPdf = ref(false);
const isText = ref(false);

const announcementTypeMap: Record<string, { label: string; type: string }> = {
  NOTICE: { label: '通知', type: 'info' },
  ANNOUNCEMENT: { label: '公告', type: 'warning' },
  WARNING: { label: '警告', type: 'danger' },
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
    const response = await getAnnouncementListApi({
      pageNum: announcementCurrentPage.value,
      pageSize: announcementPageSize.value,
    });
    if (response.code === 200 && response.data) {
      const list = response.data.list || [];
      announcements.value = list.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return 0;
      });
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

    // 调用创建查看记录API（单独try-catch，确保不影响详情获取）
    try {
      await createViewRecordApi({
        announcementId: announcement.id,
        caseId: announcement.caseId,
        viewerId: userId,
      });
    } catch (recordError) {
      console.error('记录公告查看失败:', recordError);
      // 不显示错误，继续执行
    }

    // 调用获取公告详情API
    detailLoading.value = true;
    const response = await getAnnouncementDetailApi(announcement.id);
    if (response.code === 200 && response.data) {
      // 转换数据格式，确保与法律模块一致
      const detail = response.data;
      // 处理附件，确保使用正确的file_id
      let attachments = detail.attachments || [];
      if (typeof attachments === 'string') {
        try {
          attachments = JSON.parse(attachments);
        } catch (error) {
          console.error('解析attachments失败:', error);
          attachments = [];
        }
      }

      // 处理附件字段映射，确保使用正确的file_id
      const processedAttachments = attachments.map((attach: any) => ({
        ...attach,
        file_name:
          attach.name ||
          attach.file_name ||
          attach.originalFileName ||
          '未知文件',
        file_id: attach.file_id || attach.id || attach.fileId || '',
        type: attach.type || attach.mimeType || 'application/octet-stream',
      }));

      // 过滤掉没有有效file_id的附件
      const validAttachments = processedAttachments.filter((attach: any) => {
        return attach.file_id && !isNaN(Number(attach.file_id));
      });

      announcementDetail.value = {
        ...detail,
        announcement_type: detail.announcementType,
        is_top: detail.isTop ? 1 : 0,
        top_expire_time: detail.topExpireTime,
        publisher_name: detail.publisherName,
        publish_time: detail.publishTime,
        view_count: detail.viewCount,
        caseNumber: detail.caseNumber,
        principalOfficer: detail.principalOfficer,
        attachments: validAttachments,
      };
      showAnnouncementDetailDialog.value = true;
    } else {
      ElMessage.error(`获取公告详情失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('查看公告详情失败:', error);
    ElMessage.error('查看公告详情失败');
  } finally {
    detailLoading.value = false;
  }
};

// 查看公告浏览记录
const viewAnnouncementViews = async (announcement: any) => {
  if (!announcement) return;

  try {
    viewsLoading.value = true;
    viewsCurrentPage.value = 1;

    const response = await getViewRecordListApi({
      announcementId: announcement.id,
      page: viewsCurrentPage.value - 1,
      size: viewsPageSize.value,
    });

    if (response.code === 200 && response.data) {
      const records = response.data || [];
      viewsList.value = records;
      viewsTotal.value = records.length;
      showViewsDialog.value = true;
    } else {
      ElMessage.error(`获取浏览记录失败：${response.message || '未知错误'}`);
      viewsList.value = [];
    }
  } catch (error) {
    console.error('获取浏览记录失败:', error);
    ElMessage.error('获取浏览记录失败');
    viewsList.value = [];
  } finally {
    viewsLoading.value = false;
  }
};

// 查看附件
const viewAttachment = async (attachment: any) => {
  try {
    // 检查file_id是否存在且有效
    if (!attachment.file_id) {
      ElMessage.error('无效的文件ID');
      return;
    }

    // 确保file_id是数字
    const fileId = Number(attachment.file_id);
    if (isNaN(fileId)) {
      ElMessage.error('文件ID必须是数字');
      return;
    }

    previewLoading.value = true;
    previewAttachment.value = attachment;

    // 确定文件类型
    const fileName = attachment.file_name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeType = attachment.type || '';

    // 设置预览类型
    isImage.value =
      ['bmp', 'gif', 'jpeg', 'jpg', 'png'].includes(fileExtension) ||
      mimeType.startsWith('image/');
    isPdf.value = fileExtension === 'pdf' || mimeType === 'application/pdf';
    isText.value =
      ['css', 'html', 'js', 'json', 'log', 'md', 'ts', 'txt', 'xml'].includes(
        fileExtension,
      ) || mimeType.startsWith('text/');

    // 根据文件类型生成预览URL
    if (isImage.value || isPdf.value || isText.value) {
      // 直接使用后端提供的预览URL
      previewUrl.value = `/api/v1/file/preview/${fileId}`;
      showPreviewDialog.value = true;
    } else {
      // 对于不支持的文件类型，直接打开发预览对话框
      showPreviewDialog.value = true;
    }
  } catch (error) {
    console.error('预览附件失败:', error);
    ElMessage.error('文件预览失败');
  } finally {
    previewLoading.value = false;
  }
};

// 下载附件
const downloadAttachment = async (attachment: any) => {
  try {
    // 检查file_id是否存在且有效
    if (!attachment.file_id) {
      ElMessage.error('无效的文件ID');
      return;
    }

    // 确保file_id是数字
    const fileId = Number(attachment.file_id);
    if (isNaN(fileId)) {
      ElMessage.error('文件ID必须是数字');
      return;
    }

    // 使用后端提供的下载接口
    const downloadResponse = await downloadFileApi(fileId);

    // 创建下载链接
    const blob = new Blob([downloadResponse], {
      type: attachment.type || 'application/octet-stream',
    });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = attachment.file_name;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    ElMessage.success('文件下载开始');
  } catch (error: any) {
    ElMessage.error(`文件下载失败：${error.message || '未知错误'}`);
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

    // 更新待办统计
    todoCount.value = res.data?.content?.length || 0;
    todoTotal.value = res.data?.totalElements || 0;
  } catch (error) {
    console.error('加载待办事项失败:', error);
  }
};

// 判断用户是否为管理员
const isAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('ADMIN') || roles.includes('admin');
});

// 加载案件列表
const loadCaseList = async () => {
  loading.value = true;
  try {
    // 映射案件状态到后端需要的英文状态
    const statusMap: Record<string, string> = {
      在办: 'ONGOING',
      报结: 'AWAITING',
      已结: 'COMPLETED',
    };
    const caseStatusEn = statusMap[caseStatus.value] || 'ONGOING';

    let res;

    // 管理员查看所有案件，律师只查看自己的案件
    if (isAdmin.value) {
      console.log('[loadCaseList] 管理员查看所有案件');
      res = await getCaseListApi({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        caseStatus: caseStatusEn,
      });
    } else {
      // 从本地存储获取userId
      const chatUserId = localStorage.getItem('chat_user_id');
      const userId = Number(chatUserId) || 0;
      console.log('[loadCaseList] 律师查看自己的案件，userId:', userId);

      res = await getUserCaseListApi(userId, {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        caseStatus: caseStatusEn,
      });
    }

    caseList.value = res.data?.list || [];
    totalCases.value = res.data?.total || 0;

    // 更新案件统计（获取所有状态的案件总数）
    if (isAdmin.value) {
      const allCasesRes = await getCaseListApi({
        pageNum: 1,
        pageSize: 9999,
      });
      caseCount.value = allCasesRes.data?.total || 0;
    } else {
      const chatUserId = localStorage.getItem('chat_user_id');
      const userId = Number(chatUserId) || 0;
      const allCasesRes = await getUserCaseListApi(userId, {
        pageNum: 1,
        pageSize: 9999,
      });
      caseCount.value = allCasesRes.data?.total || 0;
    }
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

// 加载工作团队数量
const loadTeamCount = async () => {
  try {
    console.log('[loadTeamCount] 开始获取工作团队数量...');
    const res = await getCurrentUserWorkTeamsApi();
    console.log('[loadTeamCount] API返回结果:', res);
    console.log('[loadTeamCount] res.data:', res.data);
    console.log('[loadTeamCount] res.data类型:', typeof res.data);
    console.log('[loadTeamCount] res.data是否为数组:', Array.isArray(res.data));
    console.log('[loadTeamCount] res.data.length:', res.data?.length);

    teamCount.value = res.data?.length || 0;
    console.log('[loadTeamCount] 最终团队数量:', teamCount.value);
  } catch (error) {
    console.error('[loadTeamCount] 加载工作团队数量失败:', error);
    teamCount.value = 0;
  }
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
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Asia/Shanghai`,
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
  loadTeamCount();
  initWeather();
});
</script>

<template>
  <div class="workspace-container">
    <div class="p-5">
      <WorkbenchHeader
        :avatar="currentUserInfo?.avatar || preferences.app.defaultAvatar"
        :todo-count="todoCount"
        :todo-total="todoTotal"
        :case-count="caseCount"
        :team-count="teamCount"
      >
        <template #title>
          <div class="flex items-center justify-between">
            <span>{{ greeting }}, {{ currentUserInfo?.realName }},
              开始您一天的工作吧！</span>
          </div>
        </template>
        <template #description>
          {{ location ? location : '未知位置' }}，今日{{
            weather.condition
          }}，{{ weather.tempMin }} ~ {{ weather.tempMax }}！
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
                  class="case-tab-btn mr-2 rounded-full px-3 py-1 text-sm"
                  :class="{
                    'bg-blue-500 text-white': caseStatus === status,
                    'bg-gray-100 text-gray-700': caseStatus !== status,
                  }"
                  @click="changeCaseStatus(status)"
                >
                  {{ status }}
                </button>
              </div>
              <div class="case-search flex items-center">
                <input
                  v-model="searchKeyword"
                  type="link"
                  placeholder="请输入案号"
                  class="case-search-input rounded-full border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @keyup.enter="searchCases"
                />
                <button class="ml-2 text-gray-500" @click="searchCases">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div v-loading="loading" class="case-list">
              <div
                v-if="caseList.length > 0"
                class="grid grid-cols-1 gap-3 md:grid-cols-3"
              >
                <div
                  v-for="item in caseList"
                  :key="item.id"
                  class="case-card cursor-pointer rounded-lg bg-white p-3 shadow transition-shadow hover:shadow-md"
                  @click="goToCaseDetail(item.id)"
                >
                  <div class="case-title mb-2 text-base font-semibold">
                    {{ item.caseNumber }}
                  </div>

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
                  <div class="case-info mb-3 flex justify-between text-sm">
                    <div>
                      <span class="text-gray-500">案件状态：</span>
                      <span class="text-green-500">{{
                        caseStatusMap[item.caseStatus]
                      }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">办理天数：</span>
                      <span>已审理 {{ calculateDays(item.filingDate) }}</span>
                    </div>
                  </div>

                  <!-- 当前节点 -->
                  <div
                    class="case-progress flex items-center justify-start border-t border-dashed border-gray-200 pt-2 text-xs"
                  >
                    <span class="text-gray-500">当前阶段：</span>
                    <span class="text-blue-500">{{
                      caseProgressMap[item.caseProgress]
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- 暂无数据 -->
              <div
                v-else
                class="empty-case-list flex flex-col items-center justify-center py-10 text-gray-500"
              >
                <img
                  src="/src/images/u=3126400111,3705029976&fm=253&fmt=auto&app=138&f=PNG.webp"
                  alt="暂无数据"
                  class="mb-2 h-12 w-12"
                />
                <span>暂无案件数据</span>
              </div>
            </div>

            <!-- 分页 -->
            <div
              v-if="totalCases > 0"
              class="case-pagination mt-4 flex justify-center"
            >
              <div class="flex items-center">
                <span class="pagination-text mr-4 text-sm text-gray-600">
                  共 {{ totalCases }} 条，第
                </span>
                <button
                  class="pagination-btn rounded-l border border-gray-300 px-2 py-1"
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
                  class="pagination-input w-12 border-b border-t border-gray-300 px-3 py-1 text-center"
                  @keyup.enter="handlePageChange(currentPage)"
                  @change="handlePageChange(currentPage)"
                />
                <button
                  class="pagination-btn rounded-r border border-gray-300 px-2 py-1"
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
          <div class="flex gap-5" style="height: 550px">
            <!-- 待办事项管理板块 - 宽度减少160px -->
            <div class="min-w-0 flex-1" style="flex: 1 1 calc(66.666% - 160px)">
              <TodoList
                class="mb-5"
                title="待办事项管理"
                style="height: 100%"
              />
            </div>

            <!-- 公告板块 - 宽度增加160px -->
            <div class="min-w-0" style="flex: 1 1 calc(33.333% + 160px)">
              <AnalysisChartCard
                title="公告列表"
                class="mb-5"
                style="height: 100%"
              >
                <div
                  v-loading="announcementLoading"
                  class="announcement-list"
                  style="height: calc(100% - 72px); overflow-y: auto"
                >
                  <div v-if="announcements.length > 0" class="space-y-3">
                    <div
                      v-for="item in announcements"
                      :key="item.id"
                      class="announcement-card cursor-pointer rounded-lg bg-white p-3 shadow transition-shadow hover:shadow-md"
                      @click="viewAnnouncementDetail(item)"
                    >
                      <div
                        class="announcement-header mb-2 flex items-start justify-between"
                      >
                        <h4
                          class="announcement-title truncate text-sm font-semibold"
                        >
                          {{ item.title }}
                        </h4>
                        <div class="flex items-center space-x-1">
                          <ElTag
                            v-if="item.isTop"
                            size="small"
                            type="danger"
                            effect="light"
                          >
                            置顶
                          </ElTag>
                          <ElTag
                            size="small"
                            :type="
                              item.status === 'PUBLISHED' ? 'success' : 'info'
                            "
                            effect="light"
                          >
                            {{
                              item.status === 'PUBLISHED' ? '已发布' : '草稿'
                            }}
                          </ElTag>
                        </div>
                      </div>

                      <div
                        class="announcement-content mb-2 line-clamp-2 text-xs text-gray-600"
                      >
                        {{ item.content }}
                      </div>

                      <div
                        class="announcement-meta flex items-center justify-between text-xs text-gray-500"
                      >
                        <div class="flex items-center">
                          <ElTag
                            :type="
                              announcementTypeMap[item.announcementType]
                                ?.type || 'info'
                            "
                            size="small"
                            effect="plain"
                          >
                            {{
                              announcementTypeMap[item.announcementType]
                                ?.label || '普通'
                            }}
                          </ElTag>
                          <span class="ml-2">{{
                            item.publisherName || '系统'
                          }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="mr-2">{{
                            formatDateTime(item.publishTime || item.createTime)
                          }}</span>
                          <span class="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="mr-1 h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {{ item.viewCount }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 暂无公告 -->
                  <div
                    v-else
                    class="empty-announcement flex flex-col items-center justify-center py-10 text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="mb-2 h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span>暂无公告</span>
                  </div>
                </div>

                <!-- 公告分页 -->
                <div
                  v-if="announcementTotal > 0"
                  class="announcement-pagination mt-4 flex justify-center"
                >
                  <ElPagination
                    v-model:current-page="announcementCurrentPage"
                    v-model:page-size="announcementPageSize"
                    :page-sizes="[5, 10, 20]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="announcementTotal"
                    @size-change="loadAnnouncements"
                    @current-change="loadAnnouncements"
                    size="small"
                  />
                </div>
              </AnalysisChartCard>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告详情对话框 -->
    <ElDialog
      v-model="showAnnouncementDetailDialog"
      title="公告详情"
      width="80%"
      destroy-on-close
    >
      <div class="announcement-detail-container">
        <div v-loading="detailLoading" class="detail-content-wrapper">
          <!-- 加载完成且有数据 -->
          <div v-if="announcementDetail" class="detail-content">
            <div class="detail-meta">
              <div class="meta-row">
                <span class="label">公告类型：</span>
                <ElTag
                  :type="
                    announcementDetail.announcement_type === 'URGENT'
                      ? 'danger'
                      : announcementDetail.announcement_type === 'IMPORTANT'
                        ? 'warning'
                        : 'info'
                  "
                  size="small"
                >
                  {{
                    announcementDetail.announcement_type === 'URGENT'
                      ? '紧急'
                      : announcementDetail.announcement_type === 'IMPORTANT'
                        ? '重要'
                        : '普通'
                  }}
                </ElTag>
              </div>
              <div class="meta-row">
                <span class="label">状态：</span>
                <ElTag
                  :type="
                    announcementDetail.status === 'PUBLISHED'
                      ? 'success'
                      : 'warning'
                  "
                  size="small"
                >
                  {{
                    announcementDetail.status === 'PUBLISHED'
                      ? '已发布'
                      : '草稿'
                  }}
                </ElTag>
              </div>
              <div class="meta-row">
                <span class="label">发布人：</span>
                <span>{{ announcementDetail.publisher_name || '系统' }}</span>
              </div>
              <div class="meta-row">
                <span class="label">发布时间：</span>
                <span>{{
                  formatDateTime(
                    announcementDetail.publish_time ||
                      announcementDetail.createTime,
                  )
                }}</span>
              </div>
              <div class="meta-row">
                <span class="label">案号：</span>
                <span>{{ announcementDetail.caseNumber || '无' }}</span>
              </div>
              <div class="meta-row">
                <span class="label">主要负责人：</span>
                <span>{{ announcementDetail.principalOfficer || '无' }}</span>
              </div>
              <div class="meta-row">
                <span class="label">浏览次数：</span>
                <span>{{ announcementDetail.view_count || 0 }}</span>
                <ElButton
                  link
                  type="primary"
                  size="small"
                  @click="viewAnnouncementViews(announcementDetail)"
                  style="margin-left: 12px"
                >
                  查看浏览记录
                </ElButton>
              </div>
              <div class="meta-row">
                <span class="label">是否置顶：</span>
                <ElTag
                  :type="announcementDetail.is_top === 1 ? 'danger' : 'info'"
                  size="small"
                >
                  {{ announcementDetail.is_top === 1 ? '已置顶' : '未置顶' }}
                </ElTag>
              </div>
              <div
                v-if="
                  announcementDetail.is_top === 1 &&
                  announcementDetail.top_expire_time
                "
                class="meta-row"
              >
                <span class="label">置顶过期时间：</span>
                <span>{{
                  formatDateTime(announcementDetail.top_expire_time)
                }}</span>
              </div>
            </div>

            <div class="detail-body">
              <h4 class="section-title">公告内容</h4>
              <div
                class="content-html"
                v-html="announcementDetail.content"
              ></div>
            </div>

            <div
              v-if="
                announcementDetail.attachments &&
                announcementDetail.attachments.length > 0
              "
              class="detail-attachments"
            >
              <h4 class="section-title">附件</h4>
              <div class="attachment-list">
                <div
                  v-for="(attachment, index) in announcementDetail.attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <Icon icon="lucide:paperclip" class="attachment-icon" />
                  <span class="attachment-name">{{
                    attachment.file_name
                  }}</span>
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    @click="viewAttachment(attachment)"
                    style="margin-right: 8px"
                  >
                    查看
                  </ElButton>
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    @click="downloadAttachment(attachment)"
                  >
                    下载
                  </ElButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- 浏览记录对话框 -->
    <ElDialog
      v-model="showViewsDialog"
      title="浏览记录"
      width="80%"
      destroy-on-close
    >
      <div v-loading="viewsLoading" class="views-content-wrapper">
        <ElTable :data="viewsList" border stripe style="width: 100%">
          <ElTableColumn prop="viewerName" label="浏览人" width="120" />
          <ElTableColumn prop="viewTime" label="浏览时间" width="180" />
          <ElTableColumn prop="ipAddress" label="IP地址" width="150" />
          <ElTableColumn prop="browserType" label="浏览器" width="120" />
          <ElTableColumn prop="osType" label="操作系统" width="120" />
          <ElTableColumn prop="deviceType" label="设备类型" width="100" />
          <ElTableColumn prop="location" label="位置" min-width="150" />
          <ElTableColumn
            prop="viewDuration"
            label="浏览时长（秒）"
            width="120"
          />
        </ElTable>

        <div
          v-if="viewsList.length === 0"
          class="empty-state mt-10 text-center"
        >
          <ElEmpty description="暂无浏览记录" />
        </div>

        <div
          v-if="viewsTotal > 0"
          class="views-pagination mt-4 flex justify-center"
        >
          <ElPagination
            v-model:current-page="viewsCurrentPage"
            v-model:page-size="viewsPageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="viewsTotal"
            @size-change="() => viewAnnouncementViews(announcementDetail.value)"
            @current-change="
              () => viewAnnouncementViews(announcementDetail.value)
            "
          />
        </div>
      </div>
    </ElDialog>

    <!-- 文件预览对话框 -->
    <ElDialog
      v-model="showPreviewDialog"
      :title="previewAttachment?.file_name || '文件预览'"
      width="90%"
      destroy-on-close
    >
      <div class="file-preview-container">
        <div v-loading="previewLoading" class="preview-content">
          <div v-if="previewAttachment">
            <!-- 图片预览 -->
            <div v-if="isImage" class="image-preview">
              <img :src="previewUrl" alt="预览图片" class="preview-image" />
            </div>

            <!-- PDF预览 -->
            <div v-else-if="isPdf" class="pdf-preview">
              <iframe
                :src="previewUrl"
                class="preview-pdf"
                frameborder="0"
              ></iframe>
            </div>

            <!-- 文本预览 -->
            <div v-else-if="isText" class="text-preview">
              <iframe
                :src="previewUrl"
                class="preview-text"
                frameborder="0"
              ></iframe>
            </div>

            <!-- 不支持的文件类型 -->
            <div v-else class="unsupported-preview">
              <Icon icon="lucide:file-question" class="unsupported-icon" />
              <h3>不支持的文件类型</h3>
              <p>该文件类型不支持在线预览，建议下载后查看</p>
              <ElButton
                type="primary"
                @click="downloadAttachment(previewAttachment)"
                style="margin-top: 16px"
              >
                <Icon icon="lucide:download" class="mr-1" />
                下载文件
              </ElButton>
            </div>
          </div>
        </div>
      </div>
    </ElDialog>
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

/* 公告详情样式 */
.announcement-detail-container {
  padding: 20px 0;
}

.detail-content-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

.detail-content {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-row .label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.detail-body {
  margin-bottom: 24px;
}

.content-html {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  word-break: break-word;
}

.content-html p {
  margin-bottom: 12px;
}

.detail-attachments {
  margin-bottom: 20px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.attachment-icon {
  color: #409eff;
  font-size: 16px;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

/* 浏览记录样式 */
.views-content-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

.views-pagination {
  margin-top: 16px;
}

/* 文件预览样式 */
.file-preview-container {
  padding: 20px 0;
}

.preview-content {
  max-height: 700px;
  overflow-y: auto;
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.unsupported-icon {
  font-size: 64px;
  color: #909399;
  margin-bottom: 16px;
}

.unsupported-preview h3 {
  font-size: 18px;
  color: #606266;
  margin-bottom: 8px;
}

.unsupported-preview p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
}

/* 图片预览样式 */
.image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 700px;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 700px;
  object-fit: contain;
}

/* PDF预览样式 */
.pdf-preview {
  width: 100%;
  height: 700px;
  overflow: hidden;
}

.preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
}

/* 文本预览样式 */
.text-preview {
  width: 100%;
  height: 700px;
  overflow: hidden;
}

.preview-text {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #f5f7fa;
}

/* 滚动条样式 */
.announcement-list::-webkit-scrollbar,
.todo-items::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.announcement-list::-webkit-scrollbar-track,
.todo-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.announcement-list::-webkit-scrollbar-thumb,
.todo-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: all 0.3s;
}

.announcement-list::-webkit-scrollbar-thumb:hover,
.todo-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 清理不需要的样式 */
</style>
