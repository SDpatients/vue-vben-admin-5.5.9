<script lang="ts" setup>
import type { Todo } from '#/api/core/todo';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '#/store';

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
  ElTooltip,
} from 'element-plus';
import FullCalendar from '@fullcalendar/vue3';
import locale from '@fullcalendar/core/locales/zh-cn';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import { getCaseListApi, getUserCaseListApi } from '#/api/core/case';
import {
  createViewRecordApi,
  getAnnouncementAttachmentsApi,
  getAnnouncementDetailApi,
  getAnnouncementListApi,
  getViewRecordListApi,
} from '#/api/core/case-announcement';
import { downloadFileApi } from '#/api/core/file';
import { todoApi } from '#/api/core/todo';
import { getCurrentUserWorkTeamsApi } from '#/api/core/work-team';
import { getWorkPlanListByTimeApi } from '#/api/core/work-plan';
import { fileUploadRequestClient } from '#/api/request';
import { changePasswordApi } from '#/api/core/auth';
import ActivityTimeline from '#/components/ActivityTimeline.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
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

interface WorkbenchTodoItem {
  title: string;
  content: string;
  date: string;
  completed: boolean;
}

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

// FullCalendar 日历相关
const FullCalendar_ref = ref();
const calendarOptions = ref({
  locale: locale,
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  weekends: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  events: [],
  eventClick: (info) => {
    console.log('Event clicked:', info.event);
  },
  eventDoubleClick: (info) => {
    console.log('Event double clicked:', info.event);
    // 双击事件时显示详情窗口
    showTodoDetail(info.event);
  },
  dateClick: (info) => {
    console.log('Date clicked:', info.dateStr);
  },
  viewDidMount: (info) => {
    console.log('您切换了视图', info);
    // 切换视图时重新加载数据
    loadCalendarEvents();
  },
  viewDidUpdate: (info) => {
    console.log('您切换了月份', info);
    // 月份变化时重新加载数据
    loadCalendarEvents();
  },
  datesSet: (info) => {
    console.log('您切换了日期范围', info);
    // 日期范围变化时重新加载数据
    loadCalendarEvents();
  }
});

// 加载日历事件数据
const loadCalendarEvents = async () => {
  try {
    console.log('开始加载日历事件数据...');
    
    // 获取当前日历视图的日期范围
    const calendarApi = FullCalendar_ref.value?.getApi();
    console.log('FullCalendar_ref.value:', FullCalendar_ref.value);
    console.log('calendarApi:', calendarApi);
    
    const view = calendarApi?.view;
    console.log('view:', view);
    
    const currentDate = view?.currentStart || new Date();
    console.log('currentDate:', currentDate);
    
    // 获取当前月份的第一天和最后一天
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 计算开始日期：当前月份1号往前推12天
    const startDateObj = new Date(firstDay);
    startDateObj.setDate(startDateObj.getDate() - 12);
    
    // 计算结束日期：下一个月份的12号
    const endDateObj = new Date(year, month + 1, 12);
    
    console.log('日期范围:', startDateObj, '到', endDateObj);

    // 格式化日期为YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const startDate = formatDate(startDateObj);
    const endDate = formatDate(endDateObj);
    console.log('格式化后的日期范围:', startDate, '到', endDate);

    // 调用案件管理API获取数据
    console.log('开始获取案件数据...');
    const casesRes = await getCaseListApi({
      pageNum: 1,
      pageSize: 100,
      startTime: startDate,
      endTime: endDate,
    });
    console.log('案件API响应:', casesRes);

    // 调用待办事项API获取数据
    console.log('开始获取待办事项数据...');
    const todosRes = await todoApi.getTodoList(undefined, 0, 100, startDate + 'T00:00:00', endDate + 'T23:59:59');
    console.log('待办事项API响应:', todosRes);

    // 调用工作规划API获取数据
    console.log('开始获取工作规划数据...');
    const workPlansRes = await getWorkPlanListByTimeApi(undefined, undefined, undefined, undefined, 1, 100);
    console.log('工作规划API响应:', workPlansRes);

    // 处理案件数据
    const caseItems = casesRes?.content || [];
    const todoItems = todosRes?.content || [];
    const workPlanItems = workPlansRes?.data?.list || [];
    console.log('待办事项数据:', todoItems);
    console.log('工作规划数据:', workPlanItems);

    // 构建日历事件
    const events = [];

    // 处理案件数据
    caseItems.forEach((item: any) => {
      if (item.startDate || item.filingDate) {
        events.push({
          id: `case-${item.id}`,
          title: item.caseNumber,
          start: item.startDate || item.filingDate,
          color: '#3498db',
          textColor: 'white',
          type: 'case',
          extendedProps: {
            priority: item.priority,
            status: item.status
          }
        });
      }
    });

    // 处理待办事项数据
    console.log('开始处理待办事项数据...');
    todoItems.forEach((item: any) => {
      if (item.deadline) {
        // 格式化deadline为ISO格式
        let deadline = item.deadline;
        if (deadline.includes(' ')) {
          deadline = deadline.replace(' ', 'T');
        }
        if (!deadline.includes('T')) {
          deadline += 'T00:00:00';
        }
        
        const event = {
          id: item.id,
          title: item.title,
          start: deadline,
          end: deadline,
          allDay: false,
          isSlippage: false,
          color: '#e74c3c',
          textColor: 'white',
          type: 'todo',
          extendedProps: {
            priority: item.priority,
            status: item.status
          }
        };
        
        events.push(event);
        console.log('添加待办事项事件:', event);
      }
    });

    // 处理工作规划数据
    console.log('开始处理工作规划数据...');
    workPlanItems.forEach((item: any) => {
      if (item.startDate || item.endDate) {
        events.push({
          id: `workplan-${item.id}`,
          title: item.planContent,
          start: item.startDate,
          end: item.endDate,
          color: '#27ae60',
          textColor: 'white',
          type: 'workplan',
          extendedProps: {
            planType: item.planType,
            executionStatus: item.executionStatus,
            responsibleUserId: item.responsibleUserId
          }
        });
        console.log('添加工作规划事件:', item.planContent, '开始时间:', item.startDate, '结束时间:', item.endDate);
      }
    });

    console.log('最终日历事件:', events);
    calendarOptions.value.events = events;
    console.log('日历事件已更新');
  } catch (error) {
    console.error('加载日历事件数据失败:', error);
    ElMessage.error('加载日历事件数据失败');
  }
};

// 切换日历视图
const switchToView = (mode: string) => {
  FullCalendar_ref.value?.getApi().changeView(mode);
};

// 定位到今天
const toToday = () => {
  FullCalendar_ref.value?.getApi().today();
};

// 日历翻页
const pageTurning = (mode: string) => {
  if (mode == 'prev') {
    FullCalendar_ref.value?.getApi().prev();
  } else {
    FullCalendar_ref.value?.getApi().next();
  }
};

// 模拟接口获取日历列表事项
const getMatter = async () => {
  try {
    // 获取当前日历视图的日期范围
    const calendarApi = FullCalendar_ref.value?.getApi();
    const view = calendarApi?.view;
    const currentDate = view?.currentStart || new Date();
    
    // 获取当前月份的第一天
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // 计算开始日期：当前月份1号往前推12天
    const startDateObj = new Date(firstDay);
    startDateObj.setDate(startDateObj.getDate() - 12);
    
    // 计算结束日期：下一个月份的12号
    const endDateObj = new Date(year, month + 1, 12);

    // 格式化日期为YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const startDate = formatDate(startDateObj);
    const endDate = formatDate(endDateObj);

    // 调用待办事项API获取数据
    const res = await todoApi.getTodoList(undefined, 0, 100, startDate + 'T00:00:00', endDate + 'T23:59:59');
    
    // 从API响应中获取待办事项数据
    const todoItems = res?.content || [];
    
    // 转换为日历事件格式
    const events = todoItems.map((item: any) => {
      if (!item.deadline) return null;
      
      // 格式化deadline为ISO格式
      let deadline = item.deadline;
      if (deadline.includes(' ')) {
        deadline = deadline.replace(' ', 'T');
      }
      if (!deadline.includes('T')) {
        deadline += 'T00:00:00';
      }
      
      return {
        id: item.id,
        title: item.title,
        start: deadline,
        end: deadline,
        allDay: false,
        isSlippage: false,
        color: '#e74c3c',
        textColor: 'white',
        type: 'todo',
        extendedProps: {
          priority: item.priority,
          status: item.status,
          description: item.description
        }
      };
    }).filter(item => item !== null);
    
    calendarOptions.value.events = events;
  } catch (error) {
    console.error('获取日历列表事项失败:', error);
    ElMessage.error('获取日历列表事项失败');
  }
};

// 动态插入事项数据(新增事项)
const addMatter = () => {
  showTodoDialog.value = true;
};

// 获取当前日历视图数据
const getViewsData = () => {
  const calendarApi = FullCalendar_ref.value?.getApi();
  if (calendarApi) {
    const view = calendarApi.view;
    console.log('当前日历标题:', view.currentData.viewTitle);
    console.log('当前日历开始日期:', view.currentStart);
    console.log('当前日历结束日期:', view.currentEnd);
    console.log('当前日历事件:', view.currentData.events);
  }
};

// 重置清空日历列表事项
const clearAllList = () => {
  calendarOptions.value.events = [];
};

// 对话框相关
const showTodoDialog = ref(false);
const showDateDetailDialog = ref(false);
const showTodoDetailDialog = ref(false);
const selectedTodo = ref<any>(null);
const selectedDateStr = ref('');
const selectedDateData = ref<any[]>([]);
const calendarValue = ref(new Date());
const todoForm = ref({
  title: '',
  description: '',
  priority: 'MEDIUM',
  deadline: ''
});

// 添加待办事项
const addTodoItem = async () => {
  try {
    await todoApi.createTodo(todoForm.value);
    ElMessage.success('待办事项添加成功');
    showTodoDialog.value = false;
    // 重置表单
    todoForm.value = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      deadline: ''
    };
    // 重新加载日历事件
    loadCalendarEvents();
  } catch (error) {
    console.error('添加待办事项失败:', error);
    ElMessage.error('添加待办事项失败');
  }
};

// 显示待办事项详情
const showTodoDetail = (event: any) => {
  console.log('显示待办事项详情:', event);
  selectedTodo.value = {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    isSlippage: event.extendedProps?.isSlippage || false,
    priority: event.extendedProps?.priority || 'MEDIUM',
    status: event.extendedProps?.status || 'PENDING',
    description: event.extendedProps?.description || ''
  };
  showTodoDetailDialog.value = true;
};

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
    const [detailResponse, attachmentsResponse] = await Promise.all([
      getAnnouncementDetailApi(announcement.id),
      getAnnouncementAttachmentsApi(announcement.id),
    ]);

    if (detailResponse.code === 200 && detailResponse.data) {
      const detail = detailResponse.data;
      detail.attachments = [];

      if (attachmentsResponse.code === 200 && attachmentsResponse.data) {
        detail.attachments = attachmentsResponse.data.map((attach: any) => ({
          file_name: attach.originalFileName || '未知文件',
          file_id: attach.id,
          type: attach.mimeType || 'application/octet-stream',
        }));
      }

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
      };
      showAnnouncementDetailDialog.value = true;
    } else {
      ElMessage.error(
        `获取公告详情失败：${detailResponse.message || '未知错误'}`,
      );
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

    try {
      ElMessage.info('正在加载文件...');

      const response = await fileUploadRequestClient.get(
        `/api/v1/file/preview/${fileId}`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response], {
        type: response.type || 'application/octet-stream',
      });

      if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
        window.URL.revokeObjectURL(previewUrl.value);
      }

      previewUrl.value = window.URL.createObjectURL(blob);
      showPreviewDialog.value = true;
      ElMessage.success('文件加载成功');
    } catch (error) {
      console.error('预览附件失败:', error);
      ElMessage.error('文件预览失败，请检查文件是否存在或权限是否足够');
      showPreviewDialog.value = true;
    } finally {
      previewLoading.value = false;
    }
  } catch (error) {
    console.error('预览附件失败:', error);
    ElMessage.error('文件预览失败');
  } finally {
    previewLoading.value = false;
  }
};

// 关闭文件预览对话框
const closePreviewDialog = () => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  showPreviewDialog.value = false;
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
    const res = await todoApi.getTodoList(undefined, 0, 5);
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

// 判断用户是否为管理员或超级管理员
const isAdminOrSuperAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('管理员') || roles.includes('超级管理员');
});

// 判断用户是否为律师
const isLawyer = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('律师');
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

    console.log('[loadCaseList] 开始加载案件数据', {
      caseStatus: caseStatus.value,
      caseStatusEn,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      isAdmin: isAdminOrSuperAdmin.value
    });

    let res;

    // 管理员查看所有案件，律师只查看自己的案件
    if (isAdminOrSuperAdmin.value) {
      console.log('[loadCaseList] 管理员查看所有案件');
      res = await getCaseListApi({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        caseStatus: caseStatusEn,
      });
    } else {
      const chatUserId = localStorage.getItem('chat_user_id');
      const userId = Number(chatUserId) || 0;
      console.log('[loadCaseList] 律师查看自己的案件', { userId });
      res = await getUserCaseListApi(userId, {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        caseStatus: caseStatusEn,
      });
    }

    console.log('[loadCaseList] API响应:', res);
    console.log('[loadCaseList] 响应数据结构:', {
      hasData: !!res.data,
      hasList: !!res.data?.list,
      listLength: res.data?.list?.length,
      total: res.data?.total
    });

    // 直接使用接口返回的完整数据结构
    caseList.value = res.data?.list || [];
    totalCases.value = res.data?.total || 0;

    console.log('[loadCaseList] 案件列表数据:', caseList.value);
    console.log('[loadCaseList] 案件总数:', totalCases.value);

    // 使用当前筛选条件下的案件数作为案件总数
    caseCount.value = totalCases.value;
    console.log('[loadCaseList] 案件计数更新为:', caseCount.value);
    
    // 初始化日历数据 - 暂时注释掉，因为initCalendarData函数未定义
    // initCalendarData();
  } catch (error) {
    console.error('加载案件数据失败:', error);
    caseList.value = [];
    totalCases.value = 0;
  } finally {
    loading.value = false;
    console.log('[loadCaseList] 加载完成，loading状态:', loading.value);
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

// 公告分页变化处理
const handleAnnouncementPageChange = (page: number) => {
  // 确保页码在有效范围内
  const totalPages = Math.ceil(announcementTotal.value / announcementPageSize.value);
  if (page >= 1 && page <= totalPages) {
    announcementCurrentPage.value = page;
    loadAnnouncements();
  }
};

// 跳转到案件详情
const goToCaseDetail = (caseId: number) => {
  router.push(`/law/case-detail/${caseId}`);
};

// 加载工作团队数量
const loadTeamCount = async () => {
  try {
    const res = await getCurrentUserWorkTeamsApi();

    teamCount.value = res.data?.length || 0;
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

// 全部知晓按钮点击事件
const markAllAsRead = () => {
  ElMessage.success('已全部知晓');
};

// 修改密码相关
const showChangePasswordDialog = ref(false);
const changePasswordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const changePasswordLoading = ref(false);

// 打开修改密码弹窗
const openChangePasswordDialog = () => {
  changePasswordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  showChangePasswordDialog.value = true;
};

// 提交修改密码
const submitChangePassword = async () => {
  // 表单验证
  if (!changePasswordForm.value.oldPassword) {
    ElMessage.warning('请输入原密码');
    return;
  }
  if (!changePasswordForm.value.newPassword) {
    ElMessage.warning('请输入新密码');
    return;
  }
  if (changePasswordForm.value.newPassword.length < 6 || changePasswordForm.value.newPassword.length > 20) {
    ElMessage.warning('新密码长度应为6-20位');
    return;
  }
  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致');
    return;
  }

  changePasswordLoading.value = true;
  try {
    const result = await changePasswordApi({
      oldPassword: changePasswordForm.value.oldPassword,
      newPassword: changePasswordForm.value.newPassword,
    });

    if (result.code === 200) {
      ElMessage.success('密码修改成功，请重新登录');
      showChangePasswordDialog.value = false;
      // 修改密码成功后退出登录
      setTimeout(() => {
        handleLogout();
      }, 1500);
    } else {
      ElMessage.error(result.message || '密码修改失败');
    }
  } catch (error: any) {
    console.error('修改密码失败:', error);
    ElMessage.error(error?.message || '密码修改失败');
  } finally {
    changePasswordLoading.value = false;
  }
};

// 退出登录处理
const handleLogout = async () => {
  try {
    // 调用authStore中的logout方法，确保在请求头中添加JWT令牌
    await authStore.logout();
  } catch (error) {
    console.error('退出登录失败:', error);
    ElMessage.error('退出登录失败');
  }
};

// 月份变化处理
const handleMonthChange = async (value: any) => {
  try {
    // 确保value是一个有效的Date对象
    let dateObj: Date;
    if (value instanceof Date) {
      dateObj = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      dateObj = new Date(value);
    } else {
      dateObj = new Date();
    }
    
    // 检查dateObj是否是有效的日期
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
    
    calendarValue.value = dateObj;
    // 暂时注释掉，因为initCalendarData函数未定义
    // await initCalendarData();
  } catch (error) {
    console.error('处理月份变化失败:', error);
    calendarValue.value = new Date();
    // 暂时注释掉，因为initCalendarData函数未定义
    // await initCalendarData();
  }
};

onMounted(async () => {
  loadTodoItems();
  loadCaseList();
  loadAnnouncements();
  loadTeamCount();
  initWeather();
  await loadCalendarEvents();
});
</script>

<style scoped>
</style>

<template>
  <div class="workspace-container">
    <div class="p-0">
      <WorkbenchHeader
        :avatar="currentUserInfo?.avatar || preferences.app.defaultAvatar"
        :todo-count="todoCount"
        :todo-total="todoTotal"
        :case-count="caseCount"
        :team-count="teamCount"
        :real-name="currentUserInfo?.realName"
        @logout="handleLogout"
        @change-password="openChangePasswordDialog"
      >
        <template #title>
          <span
            >{{ greeting }}, {{ currentUserInfo?.realName }},
            开始您一天的工作吧！</span
          >
        </template>
        <template #description>
          {{ location ? location : '未知位置' }}，今日{{
            weather.condition
          }}，{{ weather.tempMin }} ~ {{ weather.tempMax }}！
        </template>
      </WorkbenchHeader>

      <div class="mt-0 flex flex-col lg:flex-row gap-[5px]">
        <!-- 左侧主要内容区 - 占页面总宽度的3/4 -->
        <div class="w-full lg:w-3/4">
          <!-- 日历板块 -->
          <AnalysisChartCard v-if="isLawyer" title="日历" class="mb-[5px] bg-white">
            <div class="calendar-container w-full">
              <!-- 自定义工具组 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <button @click="switchToView('dayGridMonth')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">月视图</button>
                <!-- <button @click="switchToView('timeGridWeek')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">周视图</button> -->
                <!-- <button @click="switchToView('listDay')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">日视图</button> -->
                <button @click="pageTurning('prev')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"><</button>
                <button @click="toToday()" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">今天</button>
                <button @click="pageTurning('next')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">></button>
              </div>
              <hr class="my-4">
              <!-- 其他按钮操作 -->
              <div class="flex flex-wrap gap-2 mt-4">
                <!-- <button @click="getViewsData()" class="px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded text-sm">获取当前日历视图数据</button> -->
                <!-- <button @click="clearAllList()" class="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm">重置清空日历</button> -->
              </div>
              <div class="fullcalendar-header flex justify-between mb-4">
                <button @click="getMatter()" class="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm">刷新</button>
                <button @click="addMatter()" class="px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-sm">[新增]待办事项</button>
              </div>
              <!-- 日历组件 -->
              <FullCalendar ref="FullCalendar_ref" :options="calendarOptions" />
              <!-- 动态插入数据 -->
          
            </div>
          </AnalysisChartCard>

          <!-- 我的案件板块 -->
          <AnalysisChartCard title="我的案件" class="mb-[5px] bg-white">
            <div class="case-header mb-4">
              <div class="case-tabs flex">
                <button
                  v-for="status in ['在办', '报结', '已结']"
                  :key="status"
                  class="case-tab-btn mr-2 rounded-full px-3 py-1 text-sm"
                  :class="{
                    'bg-primary text-white': caseStatus === status,
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
                  class="case-search-input focus:ring-primary rounded-full border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2"
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
                class="grid grid-cols-1 gap-10 md:grid-cols-3"
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
                    <span class="text-primary">{{
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



          <!-- 最新动态板块 -->
          <div class="w-full" v-if="!isLawyer">
            <AnalysisChartCard title="最新动态" class="bg-white">
              <div class="module-container">
  
                <div class="module-content">
                  <ActivityTimeline @update:count="(count) => { todoCount = count; todoTotal = count; }" />
                </div>
              </div>
            </AnalysisChartCard>
          </div>
        </div>

        <!-- 右侧辅助内容区 - 占页面总宽度的1/4 -->
        <div class="w-full lg:w-1/4">
          <!-- 功能导航板块 -->
          <AnalysisChartCard title="功能导航" :class="['bg-white']">
            <div class="module-container">
              <div class="module-content">
                <div class="grid grid-cols-3 gap-4">
                  <!-- 案件管理相关 -->
                  <router-link to="/law/case-management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">案件列表</span>
                  </router-link>
                  
                  <router-link to="/law/case-add" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">新增案件</span>
                  </router-link>
                  
                  <!-- 文书审批 -->
                  <router-link to="/approval/document" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-teal-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">文书审批</span>
                  </router-link>
                  
                  <!-- 案件审批 -->
                  <router-link to="/approval/case" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">案件审批</span>
                  </router-link>
                  
                  <!-- 费用报销 -->
                  <router-link to="/expense-reimbursement" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-purple-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">费用报销</span>
                  </router-link>
                  
                  <!-- 用户管理 -->
                  <router-link to="/management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">用户</span>
                  </router-link>
                  
                  <!-- 债权人管理 -->
                  <router-link to="/basic-data/creditor-management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-indigo-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">债权人</span>
                  </router-link>
                  
                  <!-- 债务人管理 -->
                  <router-link to="/basic-data/debtor-management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-orange-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">债务人</span>
                  </router-link>
                  
                  <!-- 法院管理 -->
                  <router-link to="/basic-data/court-management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">法院</span>
                  </router-link>
                  
                  <!-- 银行账户管理 -->
                  <router-link to="/basic-data/bank-account-management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">银行账户</span>
                  </router-link>
                  
                  <!-- 工作计划管理 -->
                  <router-link to="/basic-data/work-plan-management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">工作计划</span>
                  </router-link>
                  
                  <!-- 管理人信息 -->
                  <router-link to="/basic-data/manager-management" class="function-nav-item flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <div class="function-nav-icon mb-2 flex items-center justify-center text-purple-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span class="function-nav-text text-sm font-medium">管理人</span>
                  </router-link>
                </div>
              </div>
            </div>
          </AnalysisChartCard>

          <!-- 公告列表板块 -->
          <AnalysisChartCard title="公告列表" :class="['bg-white']">
            <div class="module-container">
              <div class="module-content" v-loading="announcementLoading">
                <div v-if="announcements.length > 0">
                  <div
                    v-for="item in announcements"
                    :key="item.id"
                    class="announcement-card cursor-pointer mb-4"
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
                          {{ item.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                        </ElTag>
                      </div>
                    </div>

                    <div
                      class="announcement-content mb-2 line-clamp-2 text-xs text-gray-600"
                      v-html="item.content"
                    ></div>

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
                          {{ announcementTypeMap[item.announcementType]
                              ?.label || '普通' }}
                        </ElTag>
                        <span class="ml-2">{{ item.publisherName || '系统' }}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="mr-2">{{ formatDateTime(item.publishTime || item.createTime) }}</span>
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

                <!-- 公告分页 -->
                <div
                  v-if="announcementTotal > 0"
                  class="announcement-pagination mt-4 flex items-center justify-center"
                >
                  <span class="pagination-text text-sm text-gray-600">
                    共 {{ announcementTotal }} 条，第
                  </span>
                  <button
                    class="pagination-btn mx-1 border border-gray-300 px-2 py-1"
                    @click="handleAnnouncementPageChange(announcementCurrentPage - 1)"
                    :disabled="announcementCurrentPage === 1"
                  >
                    &lt;
                  </button>
                  <input
                    type="number"
                    v-model.number="announcementCurrentPage"
                    min="1"
                    :max="Math.ceil(announcementTotal / announcementPageSize)"
                    class="pagination-input w-12 border border-gray-300 px-2 py-1 text-center text-sm"
                    @keyup.enter="handleAnnouncementPageChange(announcementCurrentPage)"
                    @change="handleAnnouncementPageChange(announcementCurrentPage)"
                  />
                  <button
                    class="pagination-btn mx-1 border border-gray-300 px-2 py-1"
                    @click="handleAnnouncementPageChange(announcementCurrentPage + 1)"
                    :disabled="announcementCurrentPage >= Math.ceil(announcementTotal / announcementPageSize)"
                  >
                    &gt;
                  </button>
                  <span class="pagination-text ml-1 text-sm text-gray-600">
                    /{{ Math.ceil(announcementTotal / announcementPageSize) }}页
                  </span>
                </div>
              </div>
            </div>
          </AnalysisChartCard>
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
      @close="closePreviewDialog"
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

    <!-- 添加待办事项对话框 -->
    <ElDialog
      v-model="showTodoDialog"
      title="添加待办事项"
      width="500px"
      destroy-on-close
    >
      <div class="todo-form-container">
        <div class="form-item mb-4">
          <label class="form-label mb-2 block">待办事项标题</label>
          <input
            v-model="todoForm.title"
            type="text"
            class="form-input w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="请输入待办事项标题"
            required
          />
        </div>
        <div class="form-item mb-4">
          <label class="form-label mb-2 block">待办事项描述</label>
          <textarea
            v-model="todoForm.description"
            class="form-textarea w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="请输入待办事项描述"
            rows="3"
          ></textarea>
        </div>
        <div class="form-item mb-4">
          <label class="form-label mb-2 block">优先级</label>
          <select
            v-model="todoForm.priority"
            class="form-select w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="HIGH">高</option>
            <option value="MEDIUM">中</option>
            <option value="LOW">低</option>
          </select>
        </div>
        <div class="form-item mb-4">
          <label class="form-label mb-2 block">截止日期</label>
          <ElDatePicker
            v-model="todoForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="showTodoDialog = false">取消</ElButton>
          <ElButton type="primary" @click="addTodoItem">确定</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 待办事项详情对话框 -->
    <ElDialog
      v-model="showTodoDetailDialog"
      title="待办事项详情"
      width="500px"
      destroy-on-close
    >
      <div v-if="selectedTodo" class="todo-detail-container">
        <div class="detail-item">
          <div class="label">标题：</div>
          <div class="value">{{ selectedTodo.title }}</div>
        </div>
        <div class="detail-item">
          <div class="label">优先级：</div>
          <div class="value">
            <ElTag :type="{
              'HIGH': 'danger',
              'MEDIUM': 'warning',
              'LOW': 'success'
            }[selectedTodo.priority] || 'info'">
              {{ {
                'HIGH': '高',
                'MEDIUM': '中',
                'LOW': '低'
              }[selectedTodo.priority] || selectedTodo.priority }}
            </ElTag>
          </div>
        </div>
        <div class="detail-item">
          <div class="label">状态：</div>
          <div class="value">
            <ElTag :type="{
              'PENDING': 'warning',
              'COMPLETED': 'success',
              'CANCELLED': 'info'
            }[selectedTodo.status] || 'info'">
              {{ {
                'PENDING': '待处理',
                'COMPLETED': '已完成',
                'CANCELLED': '已取消'
              }[selectedTodo.status] || selectedTodo.status }}
            </ElTag>
          </div>
        </div>
        <div class="detail-item">
          <div class="label">截止时间：</div>
          <div class="value">{{ selectedTodo.start ? new Date(selectedTodo.start).toLocaleString('zh-CN') : '无' }}</div>
        </div>
        <div class="detail-item">
          <div class="label">描述：</div>
          <div class="value">{{ selectedTodo.description || '无' }}</div>
        </div>
      </div>
      <ElEmpty v-else description="暂无详情" />
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="showTodoDetailDialog = false">关闭</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 日期数据详情对话框 -->
    <ElDialog
      v-model="showDateDetailDialog"
      :title="`${selectedDateStr} 数据详情`"
      width="500px"
      destroy-on-close
    >
      <div class="date-detail-container">
        <div v-if="selectedDateData.length > 0">
          <div
            v-for="(item, index) in selectedDateData"
            :key="index"
            class="detail-item mb-4"
          >
            <div class="detail-item-header">
              <span class="detail-item-type">
                {{ item.type === 'todo' ? '待办事项' : '案件' }}
              </span>
            </div>
            <div class="detail-item-content">
              <div class="detail-item-title font-semibold">{{ item.title }}</div>
              <div v-if="item.content" class="detail-item-description mt-2">{{ item.content }}</div>
            </div>
          </div>
        </div>
        <ElEmpty v-else description="该日期暂无数据" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="showDateDetailDialog = false">关闭</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 修改密码对话框 -->
    <ElDialog
      v-model="showChangePasswordDialog"
      title="修改密码"
      width="400px"
      destroy-on-close
    >
      <div class="change-password-form">
        <div class="form-item mb-4">
          <label class="form-label mb-2 block">原密码</label>
          <ElInput
            v-model="changePasswordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </div>
        <div class="form-item mb-4">
          <label class="form-label mb-2 block">新密码</label>
          <ElInput
            v-model="changePasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20位）"
            show-password
          />
        </div>
        <div class="form-item mb-4">
          <label class="form-label mb-2 block">确认新密码</label>
          <ElInput
            v-model="changePasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="showChangePasswordDialog = false">取消</ElButton>
          <ElButton type="primary" :loading="changePasswordLoading" @click="submitChangePassword">
            确定
          </ElButton>
        </div>
      </template>
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
  flex-wrap: wrap;
  gap: 10px;
}

.case-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.case-tab-btn {
  cursor: pointer;
  transition: all 0.3s ease;
}

.case-tab-btn:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.case-tab-btn:active {
  transform: scale(0.98);
}

.case-search {
  display: flex;
  align-items: center;
}

.case-search-input {
  width: 200px;
  transition: width 0.3s ease;
}

.case-search-input:focus {
  width: 250px;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.case-list {
  min-height: 200px;
}

.case-card {
  background-color: #f0f8ff;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.case-card:hover {
  background-color: #e6f7ff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
  border-color: #91d5ff;
}

.case-title {
  font-weight: 600;
  color: #333;
  transition: color 0.3s ease;
}

.case-card:hover .case-title {
  color: #1890ff;
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
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.pagination-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-info {
  background-color: #fff;
}

/* 右侧模块样式 */
.case-management-link {
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.case-management-link:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: #1890ff;
}

.base-info-link {
  transition: all 0.3s ease;
}

.base-info-link:hover {
  background-color: #ecf5ff !important;
  transform: translateX(4px);
}

/* 功能导航样式 */
.function-nav-item {
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.function-nav-item:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
  border-color: #1890ff;
}

.function-nav-icon {
  transition: all 0.3s ease;
  font-size: 20px;
}

.function-nav-item:hover .function-nav-icon {
  transform: scale(1.1);
  color: #1890ff;
}

.function-nav-text {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  transition: color 0.3s ease;
}

.function-nav-item:hover .function-nav-text {
  color: #1890ff;
}

/* 公告卡片样式 */
.announcement-card {
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.announcement-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: #1890ff;
  background-color: #fafafa;
}

/* 模块容器样式 */
.module-container {
  height: 100%;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.module-header-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
  background: none;
  border: 1px solid #1890ff;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.module-header-btn:hover {
  background-color: #1890ff;
  color: #fff;
}

.module-header-btn:active {
  transform: scale(0.96);
}

/* 响应式优化 */
@media (max-width: 1023px) {
  .case-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .case-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .case-search {
    width: 100%;
  }
  
  .case-search-input {
    width: 100%;
  }
  
  .case-search-input:focus {
    width: 100%;
  }
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

/* 待办事项详情对话框样式 */
.todo-detail-container {
  padding: 20px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.detail-item .label {
  width: 80px;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
  padding-top: 4px;
}

.detail-item .value {
  flex: 1;
  color: #303133;
  word-break: break-word;
  padding-top: 4px;
}

.detail-item .value :deep(.el-tag) {
  margin-right: 0;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: all 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Element Plus 滚动条样式 */
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-scrollbar__bar.is-vertical) {
  width: 8px !important;
  right: 2px !important;
}

:deep(.el-scrollbar__thumb) {
  background-color: #c1c1c1 !important;
  border-radius: 4px !important;
}

:deep(.el-scrollbar__thumb:hover) {
  background-color: #a8a8a8 !important;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  height: 8px !important;
  bottom: 2px !important;
}

/* 模块容器样式 */
.module-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.module-content {
  height: 100%;
  overflow-y: auto;
  padding: 0;
  background-color: #ffffff;
  border-radius: 6px;
}

.module-content::-webkit-scrollbar {
  width: 6px;
}

.module-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.module-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.module-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 模块头部样式 */
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.module-header-btn {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #409eff;
  color: #ffffff;
  border: none;
}

.module-header-btn:hover {
  background-color: #66b1ff;
}

/* 公告卡片样式 */
.announcement-card {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.announcement-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
  transform: translateY(-1px);
}

.announcement-title {
  font-size: 14px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 6px;
}

.announcement-content {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
  margin-bottom: 8px;
}

.announcement-meta {
  font-size: 12px;
  color: #adb5bd;
}

/* 待办事项表单样式 */
.todo-form-container {
  padding: 20px 0;
}

.form-label {
  font-weight: 500;
  color: #303133;
}

.form-input,
.form-textarea,
.form-select {
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 清理不需要的样式 */

/* 日期数据详情样式 */
.date-detail-container {
  padding: 20px 0;
}

.detail-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
}

.detail-item-header {
  margin-bottom: 8px;
}

.detail-item-type {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  background-color: #ecf5ff;
  color: #409eff;
}

.detail-item-content {
  margin-top: 8px;
}

.detail-item-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.detail-item-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}
</style>
