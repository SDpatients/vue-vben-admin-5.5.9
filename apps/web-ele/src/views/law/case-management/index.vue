<script lang="ts" setup>
import type { CaseApi } from '#/api';

import { onMounted, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElAlert,
  ElButton,
  ElCard,
  ElCol,
  ElMessage,
  ElPagination,
  ElRow,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCaseListApi } from '#/api/core/case';

// 响应式数据
const caseList = ref<CaseApi.CaseInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 调试相关
const showDebug = ref(false);
const accessStore = useAccessStore();

// 切换调试信息显示
const toggleDebug = () => {
  showDebug.value = !showDebug.value;
};

// 生成模拟数据
const generateMockData = () => {
  const mockCases = [
    {
      row: 1,
      案件ID: 'CASE2024001',
      序号: 1,
      年度: '2024',
      案号: '(2024)沪01破1号',
      申请人: '上海银行',
      债务人: '上海某科技公司',
      案由: '破产清算',
      立案时间: '2024-01-15',
      破产时间: '2024-01-20',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '已移交',
      办理期限: '2024-12-31',
      承办人: '张三',
      法院: '上海市第一中级人民法院',
      管理人: '李四律师事务所',
      债权人数: 25,
      债权总额: 15_000_000,
      财产金额: 8_000_000,
      财产比例: 0.53,
      银行账户数: 3,
      银行账户总余额: 1_200_000,
      有效账户数: 2,
    },
    {
      row: 2,
      案件ID: 'CASE2024002',
      序号: 2,
      年度: '2024',
      案号: '(2024)京02破5号',
      申请人: '建设银行',
      债务人: '北京某房地产公司',
      案由: '破产重整',
      立案时间: '2024-02-10',
      破产时间: '2024-02-15',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '未移交',
      办理期限: '2025-02-28',
      承办人: '王五',
      法院: '北京市第二中级人民法院',
      管理人: '赵六会计师事务所',
      债权人数: 48,
      债权总额: 28_000_000,
      财产金额: 15_000_000,
      财产比例: 0.54,
      银行账户数: 5,
      银行账户总余额: 3_500_000,
      有效账户数: 4,
    },
    {
      row: 3,
      案件ID: 'CASE2024003',
      序号: 3,
      年度: '2024',
      案号: '(2024)深03破8号',
      申请人: '招商银行',
      债务人: '深圳某电子公司',
      案由: '破产清算',
      立案时间: '2024-03-05',
      破产时间: '2024-03-10',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '部分移交',
      办理期限: '2024-09-30',
      承办人: '孙七',
      法院: '深圳市中级人民法院',
      管理人: '钱八律师事务所',
      债权人数: 32,
      债权总额: 9_500_000,
      财产金额: 5_200_000,
      财产比例: 0.55,
      银行账户数: 2,
      银行账户总余额: 850_000,
      有效账户数: 1,
    },
  ];

  caseList.value = mockCases;
  pagination.value.itemCount = 3;
  pagination.value.pages = 1;
};

// 获取案件列表
const fetchCaseList = async () => {
  loading.value = true;
  try {
    const token = accessStore.accessToken || '1ae18aba1f1b430c8cf22d2f668a9b79';
    const params = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
    };

    const response = await getCaseListApi(params);

    if (response.status === '1' && response.data) {
      caseList.value = response.data.records || [];
      pagination.value.itemCount = response.data.count || 0;
      pagination.value.pages = response.data.pages || 0;
      ElMessage.success('案件列表加载成功');
      console.log('✅ API请求成功');
    } else {
      ElMessage.error(response.error || '获取案件列表失败，已使用模拟数据');
      console.log('❌ API请求失败，响应状态:', response.status);
      // 使用模拟数据作为后备
      generateMockData();
    }
  } catch {
    // 显示错误提示
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 使用模拟数据作为后备
    generateMockData();
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchCaseList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchCaseList();
};

// 刷新案件列表
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchCaseList();
};

// 页面加载时获取数据
onMounted(() => {
  fetchCaseList();
});

// 格式化金额显示
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

// 格式化百分比
const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(2)}%`;
};

// 获取会计账簿状态标签类型
const getAccountBookType = (status: string) => {
  switch (status) {
    case '已移交': {
      return 'success';
    }
    case '未移交': {
      return 'warning';
    }
    case '部分移交': {
      return 'info';
    }
    default: {
      return 'danger';
    }
  }
};
</script>

<template>
  <div class="p-6">
    <ElCard header="案件管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">案件管理</span>
          <ElButton type="primary" @click="handleRefresh" :loading="loading">
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <ElSpace direction="vertical" size="large" class="w-full">
        <ElAlert type="info" title="案件信息统计" show-icon>
          当前系统共管理 {{ pagination.itemCount }} 个案件，分布在
          {{ pagination.pages }} 页中。
        </ElAlert>

        <!-- 调试信息区域 -->
        <ElCard header="调试信息" size="small" v-if="true">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-600">调试信息 (开发模式可见)</span>
              <ElButton size="small" type="info" @click="toggleDebug">
                {{ showDebug ? '隐藏' : '显示' }}调试信息
              </ElButton>
            </div>
          </template>
          <div
            v-if="showDebug"
            class="rounded bg-gray-50 p-3 font-mono text-xs"
          >
            <div>
              <strong>API请求URL:</strong>
              http://localhost:5777/api/web/selectAllCase
            </div>
            <div>
              <strong>后端API地址:</strong>
              http://192.168.0.108:8081/api/web/selectAllCase
            </div>
            <div>
              <strong>Token:</strong>
              {{
                accessStore?.accessToken || '1ae18aba1f1b430c8cf22d2f668a9b79'
              }}
            </div>
            <div>
              <strong>分页参数:</strong> page={{ pagination.page }}, size={{
                pagination.pageSize
              }}
            </div>
            <div>
              <strong>完整请求URL:</strong>
              http://localhost:5777/api/web/selectAllCase?page={{
                pagination.page
              }}&size={{ pagination.pageSize }}&token={{
                accessStore?.accessToken || '1ae18aba1f1b430c8cf22d2f668a9b79'
              }}
            </div>
          </div>
        </ElCard>

        <!-- 案件统计信息 -->
        <ElCard header="案件统计概览" size="small">
          <ElRow :gutter="16">
            <ElCol :span="6">
              <div class="rounded bg-blue-50 p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">
                  {{ pagination.itemCount }}
                </div>
                <div class="text-sm text-gray-500">总案件数</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="rounded bg-green-50 p-4 text-center">
                <div class="text-2xl font-bold text-green-600">
                  {{
                    caseList.reduce(
                      (sum, item) => sum + (item['债权人数'] || 0),
                      0,
                    )
                  }}
                </div>
                <div class="text-sm text-gray-500">总债权人数</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="rounded bg-purple-50 p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">
                  {{
                    formatCurrency(
                      caseList.reduce(
                        (sum, item) => sum + (item['债权总额'] || 0),
                        0,
                      ),
                    )
                  }}
                </div>
                <div class="text-sm text-gray-500">总债权金额</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="rounded bg-orange-50 p-4 text-center">
                <div class="text-2xl font-bold text-orange-600">
                  {{
                    formatCurrency(
                      caseList.reduce(
                        (sum, item) => sum + (item['财产金额'] || 0),
                        0,
                      ),
                    )
                  }}
                </div>
                <div class="text-sm text-gray-500">总财产金额</div>
              </div>
            </ElCol>
          </ElRow>
        </ElCard>

        <!-- 案件列表表格 -->
        <ElCard header="案件列表" size="small">
          <ElTable
            :data="caseList"
            v-loading="loading"
            stripe
            border
            size="small"
            :style="{ width: '100%' }"
          >
            <ElTableColumn
              prop="案件ID"
              label="案件ID"
              width="120"
              fixed="left"
            />
            <ElTableColumn prop="案号" label="案号" width="180" />
            <ElTableColumn
              prop="案由"
              label="案由"
              width="200"
              show-overflow-tooltip
            />
            <ElTableColumn prop="承办人" label="承办人" width="100" />
            <ElTableColumn
              prop="法院"
              label="法院"
              width="200"
              show-overflow-tooltip
            />
            <ElTableColumn prop="管理人" label="管理人" width="120" />
            <ElTableColumn
              prop="债权人数"
              label="债权人数"
              width="100"
              align="center"
            />
            <ElTableColumn
              prop="债权总额"
              label="债权总额"
              width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row['债权总额']) }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="财产金额"
              label="财产金额"
              width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row['财产金额']) }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="财产比例"
              label="财产比例"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                {{ formatPercentage(row['财产比例']) }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="会计账簿"
              label="会计账簿"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <ElTag :type="getAccountBookType(row['会计账簿'])" size="small">
                  {{ row['会计账簿'] }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="银行账户数"
              label="账户数"
              width="80"
              align="center"
            />
            <ElTableColumn
              prop="银行账户总余额"
              label="账户余额"
              width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row['银行账户总余额']) }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="有效账户数"
              label="有效账户"
              width="80"
              align="center"
            />
            <ElTableColumn label="操作" width="120" fixed="right">
              <template #default>
                <ElButton type="primary" size="small" link>查看</ElButton>
                <ElButton type="info" size="small" link>编辑</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 分页组件 -->
          <div class="mt-4 flex justify-end">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.itemCount"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </ElCard>
      </ElSpace>
    </ElCard>
  </div>
</template>

<style scoped>
:deep(.vben-card) {
  border-radius: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table .cell) {
  line-height: 1.5;
}
</style>
