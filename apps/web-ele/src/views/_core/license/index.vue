<script lang="ts" setup>
import type { UploadFile } from 'element-plus';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';

import {
  ArrowLeft,
  ArrowRight,
  ChatDotRound,
  CircleCloseFilled,
  DocumentCopy,
  Message,
  Phone,
  Service,
  SuccessFilled,
  UploadFilled,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { useLicenseStore } from '#/store';

const router = useRouter();
const licenseStore = useLicenseStore();

const currentStep = ref(0);
const copied = ref(false);
const uploadResult = ref<{ type: string; icon: string; message: string } | null>(null);

const machineCode = computed(() => licenseStore.machineCode);
const licenseStatus = computed(() => licenseStore.licenseStatus);
const licenseInfo = computed(() => licenseStore.getLicenseInfo());
const remainingDays = computed(() => licenseStore.getRemainingDays());
const loading = computed(() => licenseStore.loading);

const moduleNames: Record<string, string> = {
  ai: 'AI助手',
  approval: '审批流程',
  case: '案件管理',
  chat: '实时聊天',
  creditor: '债权人管理',
  document: '文档管理',
  fund: '资金管理',
  report: '统计报表',
};

onMounted(async () => {
  console.log('LicensePage: onMounted 开始获取数据...');
  await licenseStore.fetchMachineCode();
  console.log('LicensePage: 机器码获取完成:', licenseStore.machineCode);
  await licenseStore.fetchLicenseStatus();
  console.log('LicensePage: 许可证状态获取完成:', licenseStore.licenseStatus);
});

async function copyMachineCode() {
  try {
    await navigator.clipboard.writeText(machineCode.value);
    copied.value = true;
    ElMessage.success('机器码已复制到剪贴板');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    ElMessage.error('复制失败，请手动复制');
  }
}

function contactService() {
  currentStep.value = 1;
}

function openEmail() {
  const subject = encodeURIComponent('申请法律案件管理系统许可证');
  const body = encodeURIComponent(
    `机器码：${machineCode.value}\n` +
    `客户名称：\n` +
    `需要的功能模块：\n` +
    `授权用户数：\n`
  );
  window.open(`mailto:support@yourcompany.com?subject=${subject}&body=${body}`);
}

function openWeChat() {
  ElMessage.info('请添加客服微信：support123');
}

function openPhone() {
  ElMessage.info('客服电话：400-123-4567');
}

async function handleFileChange(uploadFile: UploadFile) {
  if (!uploadFile.raw) return;
  
  const result = await licenseStore.uploadLicense(uploadFile.raw);
  
  if (result.success) {
    uploadResult.value = {
      icon: 'el-icon-check',
      message: result.message,
      type: 'success',
    };
    
    ElMessage.success('许可证验证通过，正在跳转...');
    
    setTimeout(() => {
      router.push(LOGIN_PATH);
    }, 1500);
  } else {
    uploadResult.value = {
      icon: 'el-icon-close',
      message: result.message || '许可证验证失败',
      type: 'error',
    };
  }
}

function getModuleName(module: string) {
  return moduleNames[module] || module;
}

function formatDate(date: string) {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
}
</script>

<template>
  <div class="license-container">
    <div class="license-card">
      <div class="license-header">
        <div class="license-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        </div>
        <h2>软件授权激活</h2>
        <p class="subtitle">请完成授权激活以继续使用系统</p>
      </div>

      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="获取机器码" />
        <el-step title="联系客服" />
        <el-step title="上传许可证" />
      </el-steps>

      <div v-if="currentStep === 0" class="step-content">
        <div class="machine-code-box">
          <label>您的机器码（请复制发送给客服）</label>
          <div class="code-display">
            <code>{{ machineCode || '正在获取...' }}</code>
            <el-button
              type="primary"
              size="small"
              :disabled="!machineCode"
              @click="copyMachineCode"
            >
              <el-icon><component :is="copied ? SuccessFilled : DocumentCopy" /></el-icon>
              {{ copied ? '已复制' : '复制' }}
            </el-button>
          </div>
          <p class="tip">此机器码唯一标识您的服务器，请勿泄露给他人</p>
        </div>

        <div class="action-buttons">
          <el-button type="success" @click="contactService">
            <el-icon><Service /></el-icon>
            联系客服获取许可证
          </el-button>
          <el-button type="primary" link @click="currentStep = 2">
            已有许可证？直接上传
          </el-button>
        </div>
      </div>

      <div v-if="currentStep === 1" class="step-content">
        <div class="contact-info">
          <h3>请联系客服获取许可证</h3>
          <p>请将以下信息发送给客服：</p>
          <ul>
            <li>机器码：{{ machineCode }}</li>
            <li>客户名称：您的公司/律所名称</li>
            <li>需要的功能模块</li>
            <li>授权用户数</li>
          </ul>
          
          <div class="contact-methods">
            <el-button type="primary" @click="openEmail">
              <el-icon><Message /></el-icon>
              发送邮件
            </el-button>
            <el-button type="success" @click="openWeChat">
              <el-icon><ChatDotRound /></el-icon>
              企业微信
            </el-button>
            <el-button type="warning" @click="openPhone">
              <el-icon><Phone /></el-icon>
              电话联系
            </el-button>
          </div>
        </div>
        
        <el-button type="primary" @click="currentStep = 2">
          下一步：上传许可证
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div v-if="currentStep === 2" class="step-content">
        <el-upload
          class="license-uploader"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept=".lic,.json"
          :disabled="loading"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将许可证文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .lic 或 .json 格式的许可证文件
            </div>
          </template>
        </el-upload>

        <div v-if="uploadResult" class="upload-result" :class="uploadResult.type">
          <el-icon v-if="uploadResult.type === 'success'"><SuccessFilled /></el-icon>
          <el-icon v-else><CircleCloseFilled /></el-icon>
          <span>{{ uploadResult.message }}</span>
        </div>

        <div class="action-buttons">
          <el-button type="primary" link @click="currentStep = 0">
            <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
            返回上一步
          </el-button>
        </div>
      </div>

      <div v-if="licenseStatus && licenseStatus.valid && licenseInfo" class="license-info">
        <el-divider />
        <h3>当前许可证信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户名称">
            {{ licenseInfo.customerName }}
          </el-descriptions-item>
          <el-descriptions-item label="许可证编号">
            {{ licenseInfo.licenseId }}
          </el-descriptions-item>
          <el-descriptions-item label="授权模块">
            <el-tag
              v-for="mod in licenseInfo.modules"
              :key="mod"
              size="small"
              class="module-tag"
            >
              {{ getModuleName(mod) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最大用户数">
            {{ licenseInfo.maxUsers }}
          </el-descriptions-item>
          <el-descriptions-item label="到期时间" :span="2">
            <span :class="{ 'text-danger': remainingDays < 30 }">
              {{ formatDate(licenseInfo.expireDate) }}
              <el-tag
                v-if="remainingDays < 30"
                type="danger"
                size="small"
              >
                剩余 {{ remainingDays }} 天
              </el-tag>
            </span>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="goto-login">
          <el-button type="primary" size="large" @click="router.push(LOGIN_PATH)">
            前往登录页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.license-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.license-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 600px;
}

.license-header {
  text-align: center;
  margin-bottom: 30px;
}

.license-icon {
  color: #409eff;
  margin-bottom: 20px;
}

.license-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.step-content {
  margin-top: 30px;
  min-height: 200px;
}

.machine-code-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.machine-code-box label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.code-display code {
  flex: 1;
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  border: 1px solid #dcdfe6;
  font-size: 13px;
  color: #303133;
}

.tip {
  color: #909399;
  font-size: 12px;
  margin: 10px 0 0 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.license-uploader {
  text-align: center;
}

.license-uploader :deep(.el-upload-dragger) {
  padding: 40px;
}

.upload-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-result.success {
  background: #f0f9eb;
  color: #67c23a;
}

.upload-result.error {
  background: #fef0f0;
  color: #f56c6c;
}

.contact-info {
  text-align: center;
  margin-bottom: 20px;
}

.contact-info h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.contact-info p {
  color: #606266;
  margin-bottom: 15px;
}

.contact-info ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  text-align: left;
  display: inline-block;
}

.contact-info li {
  padding: 5px 0;
  color: #606266;
  font-size: 14px;
}

.contact-methods {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.license-info {
  margin-top: 20px;
}

.license-info h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.module-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.text-danger {
  color: #f56c6c;
}

.goto-login {
  margin-top: 20px;
  text-align: center;
}
</style>
