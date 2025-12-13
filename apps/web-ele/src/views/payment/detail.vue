<template>
  <div class="payment-detail-page">
    <div class="page-header">
      <el-button type="primary" plain size="small" @click="goBack">
        <el-icon><arrow-left /></el-icon>
        返回
      </el-button>
      <h1>支付详情</h1>
    </div>
    
    <div class="payment-detail-content">
      <!-- 支付信息卡片 -->
      <el-card shadow="hover" class="payment-info-card">
        <template #header>
          <div class="card-header">
            <h2>订单信息</h2>
          </div>
        </template>
        
        <div class="order-info">
          <div class="info-row">
            <span class="info-label">订单号：</span>
            <span class="info-value">{{ orderInfo.orderId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">案件名称：</span>
            <span class="info-value">{{ orderInfo.caseName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">支付金额：</span>
            <span class="info-value amount">{{ orderInfo.amount }} 元</span>
          </div>
          <div class="info-row">
            <span class="info-label">下单时间：</span>
            <span class="info-value">{{ orderInfo.orderTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">订单状态：</span>
            <el-tag :type="orderInfo.status === '待支付' ? 'warning' : 'success'">
              {{ orderInfo.status }}
            </el-tag>
          </div>
        </div>
      </el-card>
      
      <!-- 支付方式选择 -->
      <el-card shadow="hover" class="payment-method-card" v-if="orderInfo.status === '待支付'">
        <template #header>
          <div class="card-header">
            <h2>选择支付方式</h2>
          </div>
        </template>
        
        <div class="payment-methods">
          <el-radio-group v-model="selectedPayMethod" class="payment-method-list">
            <el-radio-button label="alipay" class="payment-method-item">
              <div class="method-content">
                <el-icon><money /></el-icon>
                <span>支付宝</span>
              </div>
            </el-radio-button>
            <el-radio-button label="wechat" class="payment-method-item">
              <div class="method-content">
                <el-icon><chat-dot-round /></el-icon>
                <span>微信支付</span>
              </div>
            </el-radio-button>
            <el-radio-button label="bank" class="payment-method-item">
              <div class="method-content">
                <el-icon><bank-card /></el-icon>
                <span>银行卡</span>
              </div>
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 支付按钮 -->
        <div class="payment-action">
          <el-button 
            type="primary" 
            size="large" 
            @click="confirmPayment"
            :loading="confirmLoading"
            class="pay-button"
          >
            <el-icon><credit-card /></el-icon>
            确认支付
          </el-button>
        </div>
      </el-card>
      
      <!-- 已支付信息 -->
      <el-card shadow="hover" class="payment-success-card" v-else>
        <template #header>
          <div class="card-header">
            <h2>支付成功</h2>
          </div>
        </template>
        
        <div class="payment-success-info">
          <div class="success-icon">
            <el-icon :size="60" color="#67c23a"><circle-check /></el-icon>
          </div>
          <h3>支付已完成</h3>
          <div class="success-detail">
            <div class="detail-row">
              <span class="detail-label">支付方式：</span>
              <span class="detail-value">{{ getPayMethodName(orderInfo.payMethod) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">支付时间：</span>
              <span class="detail-value">{{ orderInfo.payTime }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">支付金额：</span>
              <span class="detail-value amount">{{ orderInfo.amount }} 元</span>
            </div>
          </div>
          <el-button type="primary" @click="goBack" class="back-button">
            返回订单列表
          </el-button>
        </div>
      </el-card>
      
      <!-- 支付二维码弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        title="扫描二维码支付"
        width="400px"
        :before-close="handleDialogClose"
        center
      >
        <div class="qr-code-container">
          <div class="qr-code-info">
            <h3>{{ getPayMethodName(selectedPayMethod) }}支付</h3>
            <p>请使用{{ getPayMethodName(selectedPayMethod) }}扫描下方二维码完成支付</p>
            <div class="qr-code-amount">金额：{{ orderInfo.amount }} 元</div>
          </div>
          <div class="qr-code">
            <!-- 模拟二维码，实际项目中应根据支付方式生成真实二维码 -->
            <div class="mock-qr-code">
              <div class="mock-qr-content">{{ selectedPayMethod }}_QR_CODE</div>
            </div>
          </div>
          <div class="qr-code-tip">
            <p>支付完成后点击"已完成支付"按钮，或等待系统自动检测</p>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleDialogClose">取消</el-button>
            <el-button type="primary" @click="confirmPaymentSuccess">已完成支付</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ArrowLeft,
  BankCard,
  ChatDotRound,
  CircleCheck,
  CreditCard,
  Money
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 状态管理
const confirmLoading = ref(false);
const dialogVisible = ref(false);
const selectedPayMethod = ref('alipay');
const orderId = computed(() => route.params.id as string);

// 订单信息
interface OrderInfo {
  orderId: string;
  caseName: string;
  amount: number;
  orderTime: string;
  status: string;
  payMethod: string;
  payTime?: string;
}

const orderInfo = ref<OrderInfo>({
  orderId: '',
  caseName: '',
  amount: 0,
  orderTime: '',
  status: '待支付',
  payMethod: ''
});

// 模拟订单数据
const mockOrders: Record<string, OrderInfo> = {
  'PAY202512120001': {
    orderId: 'PAY202512120001',
    caseName: '张三诉李四合同纠纷案',
    amount: 1500.00,
    orderTime: '2025-12-12 10:30:00',
    status: '待支付',
    payMethod: ''
  },
  'PAY202512120002': {
    orderId: 'PAY202512120002',
    caseName: '王五诉赵六侵权纠纷案',
    amount: 2800.00,
    orderTime: '2025-12-12 11:45:00',
    status: '待支付',
    payMethod: ''
  },
  'PAY202512110001': {
    orderId: 'PAY202512110001',
    caseName: '钱七诉孙八借贷纠纷案',
    amount: 5000.00,
    orderTime: '2025-12-11 14:20:00',
    status: '已支付',
    payMethod: '银行转账',
    payTime: '2025-12-11 14:25:30'
  }
};

// 获取订单详情
const fetchOrderDetail = () => {
  // 从URL参数获取订单ID
  const id = orderId.value;
  
  // 模拟API请求
  setTimeout(() => {
    const order = mockOrders[id] || {
      orderId: id,
      caseName: '未知案件',
      amount: 0,
      orderTime: new Date().toLocaleString(),
      status: '待支付',
      payMethod: ''
    };
    
    orderInfo.value = order;
  }, 500);
};

// 获取支付方式名称
const getPayMethodName = (method: string): string => {
  const methodMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    bank: '银行卡',
    '银行转账': '银行转账'
  };
  return methodMap[method] || method;
};

// 返回上一页
const goBack = () => {
  router.push('/payment');
};

// 确认支付
const confirmPayment = () => {
  confirmLoading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    confirmLoading.value = false;
    // 显示支付二维码弹窗
    dialogVisible.value = true;
    
    // 模拟5秒后自动检测支付状态
    setTimeout(() => {
      if (dialogVisible.value) {
        ElMessage.info('检测到支付已完成');
        confirmPaymentSuccess();
      }
    }, 5000);
  }, 1000);
};

// 处理弹窗关闭
const handleDialogClose = () => {
  dialogVisible.value = false;
};

// 确认支付成功
const confirmPaymentSuccess = () => {
  dialogVisible.value = false;
  
  // 更新订单状态
  orderInfo.value.status = '已支付';
  orderInfo.value.payMethod = selectedPayMethod.value;
  orderInfo.value.payTime = new Date().toLocaleString();
  
  ElMessage.success('支付成功！');
};

// 页面挂载时获取订单详情
onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
.payment-detail-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.payment-detail-content {
  max-width: 800px;
  margin: 0 auto;
}

.payment-info-card,
.payment-method-card,
.payment-success-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  width: 100px;
  font-weight: 500;
  color: #606266;
}

.info-value {
  color: #303133;
}

.amount {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.payment-methods {
  padding: 20px 0;
}

.payment-method-list {
  display: flex;
  gap: 10px;
}

.payment-method-item {
  flex: 1;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.method-content .el-icon {
  font-size: 24px;
}

.payment-action {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.pay-button {
  width: 200px;
  height: 48px;
  font-size: 16px;
}

.payment-success-card {
  text-align: center;
}

.payment-success-info {
  padding: 40px 0;
}

.success-icon {
  margin-bottom: 20px;
}

.payment-success-info h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 30px;
}

.success-detail {
  margin-bottom: 30px;
  text-align: left;
  max-width: 300px;
  margin: 0 auto 30px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-label {
  color: #606266;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

.back-button {
  width: 200px;
  height: 48px;
  font-size: 16px;
}

.qr-code-container {
  padding: 20px 0;
}

.qr-code-info {
  text-align: center;
  margin-bottom: 20px;
}

.qr-code-info h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #303133;
}

.qr-code-info p {
  color: #606266;
  margin-bottom: 10px;
}

.qr-code-amount {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  margin-top: 10px;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.mock-qr-code {
  width: 200px;
  height: 200px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

.mock-qr-content {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.qr-code-tip {
  text-align: center;
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  text-align: center;
}
</style>