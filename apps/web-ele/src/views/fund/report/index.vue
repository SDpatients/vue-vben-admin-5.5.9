<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

import { getFundReportApi } from '#/api/core/fund';

// 状态管理
const loading = ref(false);
const chartLoading = ref(false);

// 报表类型选项
const reportTypeOptions = [
  { label: '账户余额报表', value: 'balance' },
  { label: '收支汇总报表', value: 'summary' },
  { label: '月度收支报表', value: 'monthly' },
  { label: '资金趋势报表', value: 'trend' },
];

// 搜索表单
const searchForm = reactive({
  case_no: '',
  account_id: '',
  start_date: '',
  end_date: '',
  report_type: 'balance',
});

// 图表实例
let balanceChart: echarts.ECharts | null = null;
let summaryChart: echarts.ECharts | null = null;
let monthlyChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;



// 初始化图表
const initCharts = () => {
  // 账户余额报表 - 柱状图
  const balanceChartDom = document.getElementById('balanceChart');
  if (balanceChartDom) {
    balanceChart = echarts.init(balanceChartDom);
  }

  // 收支汇总报表 - 饼图
  const summaryChartDom = document.getElementById('summaryChart');
  if (summaryChartDom) {
    summaryChart = echarts.init(summaryChartDom);
  }

  // 月度收支报表 - 柱状图
  const monthlyChartDom = document.getElementById('monthlyChart');
  if (monthlyChartDom) {
    monthlyChart = echarts.init(monthlyChartDom);
  }

  // 资金趋势报表 - 折线图
  const trendChartDom = document.getElementById('trendChart');
  if (trendChartDom) {
    trendChart = echarts.init(trendChartDom);
  }
};

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  balanceChart?.resize();
  summaryChart?.resize();
  monthlyChart?.resize();
  trendChart?.resize();
};

// 渲染账户余额报表
const renderBalanceReport = (data: any) => {
  if (!balanceChart) return;

  const option = {
    title: {
      text: '账户余额报表',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: '{b}: {c} 元',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.accounts,
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
      name: '金额（元）',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '账户余额',
        type: 'bar',
        data: data.balances,
        itemStyle: {
          color: '#409eff',
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c} 元',
        },
      },
    ],
  };

  balanceChart.setOption(option);
};

// 渲染收支汇总报表
const renderSummaryReport = (data: any) => {
  if (!summaryChart) return;

  const option = {
    title: {
      text: '收支汇总报表',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 元 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '收支汇总',
        type: 'pie',
        radius: '50%',
        center: ['50%', '55%'],
        data: data.categories.map((category: string, index: number) => ({
          name: category,
          value: data.amounts[index],
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {d}%',
        },
      },
    ],
  };

  summaryChart.setOption(option);
};

// 渲染月度收支报表
const renderMonthlyReport = (data: any) => {
  if (!monthlyChart) return;

  const option = {
    title: {
      text: '月度收支报表',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any) {
        let result = params[0].axisValue + '<br/>';
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value} 元<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['收入', '支出'],
      top: '15%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: '25%',
    },
    xAxis: {
      type: 'category',
      data: data.months,
    },
    yAxis: {
      type: 'value',
      name: '金额（元）',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: data.income,
        itemStyle: {
          color: '#67c23a',
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c} 元',
        },
      },
      {
        name: '支出',
        type: 'bar',
        data: data.expense,
        itemStyle: {
          color: '#f56c6c',
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c} 元',
        },
      },
    ],
  };

  monthlyChart.setOption(option);
};

// 渲染资金趋势报表
const renderTrendReport = (data: any) => {
  if (!trendChart) return;

  const option = {
    title: {
      text: '资金趋势报表',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 元',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates,
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
      name: '金额（元）',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '资金余额',
        type: 'line',
        data: data.balances,
        smooth: true,
        itemStyle: {
          color: '#409eff',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)',
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)',
            },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c} 元',
          fontSize: 10,
        },
      },
    ],
  };

  trendChart.setOption(option);
};

// 获取报表数据
const fetchReportData = async () => {
  chartLoading.value = true;
  try {
    const response = await getFundReportApi({
      case_no: searchForm.case_no,
      account_id: searchForm.account_id,
      start_date: searchForm.start_date,
      end_date: searchForm.end_date,
      report_type: searchForm.report_type,
    });
    const reportData = response.data;
    
    // 根据报表类型渲染不同的图表
    switch (searchForm.report_type) {
      case 'balance':
        renderBalanceReport(reportData.balance);
        break;
      case 'summary':
        renderSummaryReport(reportData.summary);
        break;
      case 'monthly':
        renderMonthlyReport(reportData.monthly);
        break;
      case 'trend':
        renderTrendReport(reportData.trend);
        break;
      default:
        renderBalanceReport(reportData.balance);
    }
  } catch (error) {
    ElMessage.error('获取报表数据失败');
    console.error('获取报表数据失败:', error);
    // 出错时使用空数据
    const emptyData = {
      balance: { accounts: [], balances: [] },
      summary: { categories: [], amounts: [] },
      monthly: { months: [], income: [], expense: [] },
      trend: { dates: [], balances: [] }
    };
    
    // 根据报表类型渲染不同的图表
    switch (searchForm.report_type) {
      case 'balance':
        renderBalanceReport(emptyData.balance);
        break;
      case 'summary':
        renderSummaryReport(emptyData.summary);
        break;
      case 'monthly':
        renderMonthlyReport(emptyData.monthly);
        break;
      case 'trend':
        renderTrendReport(emptyData.trend);
        break;
      default:
        renderBalanceReport(emptyData.balance);
    }
  } finally {
    chartLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  fetchReportData();
};

// 重置搜索
const handleReset = () => {
  searchForm.case_no = '';
  searchForm.account_id = '';
  searchForm.start_date = '';
  searchForm.end_date = '';
  searchForm.report_type = 'balance';
  fetchReportData();
};

// 监听报表类型变化
watch(
  () => searchForm.report_type,
  () => {
    fetchReportData();
  }
);

// 页面挂载时初始化图表
onMounted(() => {
  initCharts();
  fetchReportData();
  window.addEventListener('resize', handleResize);
});
</script>

<template>
  <div class="fund-report-page">
    <div class="page-header">
      <h1>统计报表</h1>
    </div>

    <div class="fund-report-content">
      <!-- 搜索区域 -->
      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="80px">
          <el-form-item label="案号">
            <el-input
              v-model="searchForm.case_no"
              placeholder="请输入案号"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="账户">
            <el-select
              v-model="searchForm.account_id"
              placeholder="请选择账户"
              clearable
              style="width: 200px"
            >
              <!-- 账户选项将在实际实现中动态加载 -->
              <el-option label="所有账户" value="" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="searchForm.start_date"
              type="date"
              placeholder="选择开始日期"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="searchForm.end_date"
              type="date"
              placeholder="选择结束日期"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="报表类型">
            <el-select
              v-model="searchForm.report_type"
              placeholder="请选择报表类型"
              style="width: 200px"
            >
              <el-option
                v-for="option in reportTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <i class="el-icon-search"></i> 查询
            </el-button>
            <el-button @click="handleReset">
              <i class="el-icon-refresh"></i> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 图表区域 -->
      <el-card shadow="hover" class="chart-card">
        <div v-loading="chartLoading" class="chart-container">
          <!-- 账户余额报表 -->
          <div
            v-if="searchForm.report_type === 'balance'"
            id="balanceChart"
            class="chart"
          ></div>

          <!-- 收支汇总报表 -->
          <div
            v-else-if="searchForm.report_type === 'summary'"
            id="summaryChart"
            class="chart"
          ></div>

          <!-- 月度收支报表 -->
          <div
            v-else-if="searchForm.report_type === 'monthly'"
            id="monthlyChart"
            class="chart"
          ></div>

          <!-- 资金趋势报表 -->
          <div
            v-else-if="searchForm.report_type === 'trend'"
            id="trendChart"
            class="chart"
          ></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.fund-report-page {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.fund-report-content {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.search-card {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  position: relative;
  min-height: 500px;
}

.chart {
  width: 100%;
  height: 500px;
}
</style>
