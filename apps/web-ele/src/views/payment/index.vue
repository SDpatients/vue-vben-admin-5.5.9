<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

const router = useRouter();

// 状态管理
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 支付订单数据
interface PaymentOrder {
  orderId: string;
  caseName: string;
  amount: number;
  orderTime: string;
  status: string;
  payMethod: string;
}

const paymentOrders = ref<PaymentOrder[]>([]);

// 模拟数据
const mockPaymentOrders: PaymentOrder[] = [
  {
    orderId: 'PAY202512120001',
    caseName: '张三诉李四合同纠纷案',
    amount: 1500,
    orderTime: '2025-12-12 10:30:00',
    status: '待支付',
    payMethod: '在线支付',
  },
  {
    orderId: 'PAY202512120002',
    caseName: '王五诉赵六侵权纠纷案',
    amount: 2800,
    orderTime: '2025-12-12 11:45:00',
    status: '待支付',
    payMethod: '在线支付',
  },
  {
    orderId: 'PAY202512110001',
    caseName: '钱七诉孙八借贷纠纷案',
    amount: 5000,
    orderTime: '2025-12-11 14:20:00',
    status: '已支付',
    payMethod: '银行转账',
  },
];

// 获取支付订单列表
const fetchPaymentOrders = () => {
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    paymentOrders.value = mockPaymentOrders;
    total.value = mockPaymentOrders.length;
    loading.value = false;
  }, 500);
};

// 去支付
const goToPay = (order: PaymentOrder) => {
  if (order.status !== '待支付') {
    ElMessage.warning('该订单已支付或状态异常');
    return;
  }

  // 跳转到支付详情页面
  router.push({
    path: `/payment/detail/${order.orderId}`,
    query: { amount: order.amount, caseName: order.caseName },
  });
};

// 查看详情
const viewDetail = (orderId: string) => {
  router.push({
    path: `/payment/detail/${orderId}`,
  });
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchPaymentOrders();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchPaymentOrders();
};

// 页面挂载时加载数据
onMounted(() => {
  fetchPaymentOrders();
});
</script>

<template>
  <div class="payment-page">
    <div class="page-header">
      <h1>支付管理</h1>
    </div>

    <div class="payment-content">
      <!-- 支付列表 -->
      <div class="payment-list">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h2>待支付订单</h2>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="paymentOrders"
            style="width: 100%"
          >
            <el-table-column prop="orderId" label="订单号" width="180" />
            <el-table-column prop="caseName" label="案件名称" width="200" />
            <el-table-column prop="amount" label="支付金额" width="150">
              <template #default="scope">
                <span class="amount-text">{{ scope.row.amount }} 元</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间" width="200" />
            <el-table-column prop="status" label="订单状态" width="120">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === '待支付' ? 'warning' : 'success'"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="payMethod" label="支付方式" width="150" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="goToPay(scope.row)"
                  :disabled="scope.row.status !== '待支付'"
                >
                  去支付
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click="viewDetail(scope.row.orderId)"
                  style="margin-left: 8px"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container" v-if="!loading">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-page {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
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

.payment-content {
  max-width: 1200px;
  margin: 0 auto;
}

.payment-list {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
