# 流程处理模块手机上传功能实现进度

## 已完成的修改（bankruptcy-process/index.vue）

### 1. 导入临时上传 API
```typescript
import {
  createTempUploadToken,
  getTempUploadFiles,
  transferTempFiles,
  cancelTempUploadToken,
  type TempUploadFile,
} from '../../../api/core/temp-upload';
```

### 2. 添加变量定义
```typescript
// 临时上传 Token 相关
const currentTempToken = ref('');
const tempFilePolling = ref<NodeJS.Timeout | null>(null);
const mobileUploadedFiles = ref<TempUploadFile[]>([]);

// 移动端上传配置
const mobileUploadConfig = ref({
  ip: '',
  port: 5779,
  autoDetect: true
});
```

### 3. 添加核心函数

#### 3.1 开始轮询获取临时文件列表
```typescript
const startTempFilePolling = () => {
  // 清除之前的轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }

  // 每 3 秒轮询一次
  tempFilePolling.value = setInterval(async () => {
    await pollTempFiles();
  }, 3000);
};
```

#### 3.2 轮询获取临时文件列表
```typescript
const pollTempFiles = async () => {
  if (!currentTempToken.value) return;

  try {
    const response = await getTempUploadFiles(currentTempToken.value);
    
    if (response.code === 200 && response.data) {
      const newFiles = response.data;
      
      // 检查是否有新文件上传
      if (newFiles.length > mobileUploadedFiles.value.length) {
        const diffCount = newFiles.length - mobileUploadedFiles.value.length;
        ElMessage.success(`手机上传了 ${diffCount} 个新文件`);
        
        // 刷新当前任务提交的文件列表
        if (currentItem.value) {
          refreshSubmissionFiles(currentItem.value.id);
        }
      }
      
      mobileUploadedFiles.value = newFiles;
    }
  } catch (error) {
    console.error('获取临时文件列表失败:', error);
  }
};
```

#### 3.3 转移临时文件到业务
```typescript
const transferMobileFiles = async (bizId: number): Promise<TempUploadFile[]> => {
  if (!currentTempToken.value || mobileUploadedFiles.value.length === 0) {
    return [];
  }

  try {
    const response = await transferTempFiles({
      token: currentTempToken.value,
      bizType: 'case_task_submission',
      bizId: bizId.toString(),
    });

    if (response.code === 200 && response.data) {
      const transferredFiles = response.data;
      ElMessage.success(`成功转移 ${transferredFiles.length} 个文件到业务`);
      
      // 清空临时文件列表
      mobileUploadedFiles.value = [];
      currentTempToken.value = '';
      
      // 返回转移后的完整文件信息
      return transferredFiles;
    }
  } catch (error: any) {
    console.error('转移临时文件失败:', error);
    ElMessage.error('转移临时文件失败');
  }
  
  return [];
};
```

#### 3.4 打开手机上传对话框
```typescript
const openMobileUploadDialog = async () => {
  if (!currentItem.value) {
    ElMessage.warning('请先选择或创建一个任务提交记录');
    return;
  }
  
  try {
    // 1. 创建临时上传 Token
    const tokenResponse = await createTempUploadToken({
      bizType: 'case_task_submission',
      description: `任务提交附件上传`,
      expireMinutes: 30,
    });

    if (tokenResponse.code !== 200 || !tokenResponse.data) {
      ElMessage.error('创建上传 Token 失败');
      return;
    }

    currentTempToken.value = tokenResponse.data.token;
    console.log('创建临时 Token 成功:', currentTempToken.value);

    // 2. 生成二维码 URL
    let baseUrl = window.location.origin;
    
    // 使用配置的 IP 地址
    const configuredIP = import.meta.env.VITE_MOBILE_UPLOAD_IP;
    if (configuredIP && configuredIP !== 'localhost' && configuredIP !== '127.0.0.1') {
      baseUrl = `http://${configuredIP}:5779`;
      console.log('[IP 检测] 使用环境变量配置的 IP:', configuredIP);
    } else if (mobileUploadConfig.value.ip) {
      // 使用检测到的 IP
      baseUrl = `http://${mobileUploadConfig.value.ip}:5779`;
      console.log('[IP 检测] 使用检测到的 IP:', mobileUploadConfig.value.ip);
    } else {
      // 使用当前主机名
      const currentUrl = new URL(window.location.href);
      baseUrl = `http://${currentUrl.hostname}:5779`;
      console.log('[IP 检测] 使用当前主机名:', currentUrl.hostname);
    }

    // 生成手机上传页面 URL
    const mobileUploadUrl = `${baseUrl}/api/v1/temp-upload/mobile?token=${encodeURIComponent(currentTempToken.value)}`;
    console.log(`生成的二维码 URL: ${mobileUploadUrl}`);

    qrCodeUrl.value = mobileUploadUrl;
    qrCodeExpireTime.value = 1800; // 30 分钟过期
    showQrCodeDialog.value = true;

    // 3. 开始轮询获取手机上传的文件列表
    startTempFilePolling();
    
    ElMessage.success('二维码已生成，请使用手机扫描上传');
  } catch (error: any) {
    console.error('打开手机上传弹窗失败:', error);
    ElMessage.error('打开手机上传弹窗失败');
  }
};
```

### 4. 修改关闭二维码弹窗函数
```typescript
const closeQrCodeDialog = () => {
  showQrCodeDialog.value = false;
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }
  // 停止临时文件轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }
};
```

### 5. 在提交表单时转移临时文件
在 `handleAddSubmit` 函数中添加：
```typescript
// 1. 转移手机上传的临时文件（如果有）
if (currentTempToken.value && mobileUploadedFiles.value.length > 0) {
  console.log('发现手机上传的临时文件，开始转移...');
  const transferredFiles = await transferMobileFiles(submissionId);
  console.log('转移成功的文件:', transferredFiles);
}

// 2. 上传文件：只上传没有 id 的本地文件
// ... 原有代码
```

### 6. 配置 IP 地址
在 `.env.development` 文件中配置：
```env
# 手机上传功能使用的本机 IP 地址
VITE_MOBILE_UPLOAD_IP=192.168.0.151
```

## 功能说明

### 工作流程
1. 用户点击"手机上传"按钮
2. 前端调用 `createTempUploadToken` 创建临时 Token
3. 生成二维码 URL，手机扫描访问 `/api/v1/temp-upload/mobile?token=xxx`
4. 手机上传文件到临时存储
5. 前端轮询获取临时文件列表（每 3 秒一次）
6. 用户点击"保存"按钮时，调用 `transferMobileFiles` 转移文件
7. 文件成功转移到业务数据中

### 文件上传方式
- **本地上传**：用户通过电脑选择文件，直接上传到业务
- **手机上传**：用户通过手机扫描二维码上传，文件先存储在临时存储，提交时转移

两种方式可以同时使用，最终文件会统一处理并关联到业务数据。

## 其他模块需要完成的修改

其他 6 个流程阶段模块需要按照相同的方式修改：

1. 导入临时上传 API
2. 添加变量定义
3. 添加轮询和转移函数
4. 添加打开手机上传对话框函数
5. 在提交时转移临时文件
6. 配置 IP 地址

## 参考文档
详细实现指南请参考：`docs/file-upload-guide.md`
