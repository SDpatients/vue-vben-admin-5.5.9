# 文件上传功能实现指南

本文档总结了本地上传和手机上传的实现逻辑，为其他模块提供参考。

## 目录

1. [功能概述](#功能概述)
2. [核心组件](#核心组件)
3. [本地上传实现](#本地上传实现)
4. [手机上传实现](#手机上传实现)
5. [临时文件转移](#临时文件转移)
6. [IP地址配置](#ip地址配置)
7. [注意事项](#注意事项)
8. [完整示例](#完整示例)

---

## 功能概述

文件上传功能支持两种方式：
1. **本地上传**：用户通过电脑选择文件上传
2. **手机上传**：用户通过手机扫描二维码上传文件

两种方式可以同时使用，最终文件会统一处理并关联到业务数据。

---

## 核心组件

### 1. FileUpload 组件

位置：`apps/web-ele/src/views/law/case-detail/components/FileUpload.vue`

这是核心的文件上传组件，支持：
- 本地文件选择和上传
- 手机扫码上传
- 文件预览和下载
- 文件删除
- 已有文件显示

### 2. 临时上传 API

位置：`apps/web-ele/src/api/core/temp-upload.ts`

提供以下接口：
- `createTempUploadToken`：创建临时上传Token
- `getTempUploadFiles`：获取Token下的文件列表
- `transferTempFiles`：转移临时文件到业务
- `cancelTempUploadToken`：取消Token

---

## 本地上传实现

### 1. 组件使用

```vue
<template>
  <FileUpload
    ref="fileUploadRef"
    :model-value="[]"
    :biz-type="'document'"
    :biz-id="0"
    accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
    :max-size="50 * 1024 * 1024"
    :multiple="true"
    title="文件附件"
    :disabled="false"
    :local-mode="true"
    :existing-files="isEditing ? editExistingFiles : []"
    @local-files-change="handleLocalFilesChange"
  />
</template>

<script setup lang="ts">
const fileUploadRef = ref<any>();
const localFiles = ref<any[]>([]);
const isEditing = ref(false);
const editExistingFiles = ref<any[]>([]);

const handleLocalFilesChange = (files: any[]) => {
  localFiles.value = files;
  console.log('本地文件列表更新:', files);
};
</script>
```

### 2. Props 说明

| 属性 | 类型 | 说明 |
|------|------|------|
| `bizType` | string | 业务类型，如 'document'、'case_task' |
| `bizId` | number | 业务ID，新增时为0，编辑时为实际ID |
| `localMode` | boolean | 是否使用本地模式（新增和编辑时使用） |
| `existingFiles` | array | 已有文件列表（编辑时使用） |
| `accept` | string | 接受的文件类型 |
| `maxSize` | number | 最大文件大小（字节） |
| `multiple` | boolean | 是否支持多文件上传 |

### 3. 已有文件格式

编辑时需要传递已有文件列表：

```typescript
interface ExistingFileItem {
  id: number | string;
  originalFileName: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  uploadTime?: string;
  filePath?: string;
}

// 示例
editExistingFiles.value = [
  {
    id: 123,
    originalFileName: '文档.pdf',
    fileSize: 1024000,
    fileExtension: 'pdf',
    mimeType: 'application/pdf',
    filePath: '/uploads/document.pdf'
  }
];
```

---

## 手机上传实现

### 1. 工作流程

```
1. 用户点击"手机上传"按钮
2. 前端调用 createTempUploadToken 创建临时Token
3. 生成二维码URL，手机扫描访问
4. 手机上传文件到临时存储
5. 前端轮询获取临时文件列表
6. 用户提交表单时，调用 transferTempFiles 转移文件
```

### 2. 关键变量

```typescript
// 临时上传Token
const currentTempToken = ref('');

// 临时文件列表
const mobileUploadedFiles = ref<TempUploadFile[]>([]);

// 轮询定时器
const tempFilePolling = ref<NodeJS.Timeout | null>(null);

// 检查是否有未转移的临时文件
const hasUntransferredFiles = computed(() => {
  return !!currentTempToken.value && mobileUploadedFiles.value.length > 0;
});
```

### 3. 打开手机上传弹窗

```typescript
const openMobileUploadDialog = async () => {
  try {
    // 1. 创建临时上传Token
    const tokenResponse = await createTempUploadToken({
      bizType: props.bizType,
      description: `${props.title || '文件'}上传`,
      expireMinutes: 30,
    });

    if (tokenResponse.code !== 200 || !tokenResponse.data) {
      ElMessage.error('创建上传Token失败');
      return;
    }

    currentTempToken.value = tokenResponse.data.token;
    console.log('创建临时Token成功:', currentTempToken.value);

    // 2. 生成二维码URL
    let baseUrl = window.location.origin;
    
    // 使用配置的IP地址
    const configuredIP = import.meta.env.VITE_MOBILE_UPLOAD_IP;
    if (configuredIP) {
      baseUrl = `http://${configuredIP}:5779`;
    } else {
      // 使用当前主机名
      const currentUrl = new URL(window.location.href);
      baseUrl = `http://${currentUrl.hostname}:5779`;
    }

    // 生成手机上传页面URL
    const mobileUploadUrl = `${baseUrl}/mobile-upload?token=${encodeURIComponent(currentTempToken.value)}`;
    console.log(`生成的二维码URL: ${mobileUploadUrl}`);

    qrCodeUrl.value = mobileUploadUrl;
    qrCodeExpireTime.value = 1800; // 30分钟过期
    showQrCodeDialog.value = true;

    // 3. 开始轮询获取手机上传的文件列表
    startTempFilePolling();
  } catch (error) {
    console.error('打开手机上传弹窗失败:', error);
    ElMessage.error('打开手机上传弹窗失败');
  }
};
```

### 4. 轮询获取临时文件

```typescript
const startTempFilePolling = () => {
  // 清除之前的轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }

  // 每3秒轮询一次
  tempFilePolling.value = setInterval(async () => {
    await pollTempFiles();
  }, 3000);
};

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
        
        // 如果是本地模式，添加到本地文件列表
        if (isLocalMode.value) {
          const newLocalFiles = newFiles.slice(mobileUploadedFiles.value.length).map((tempFile) => ({
            file: new File([], tempFile.originalFileName, { type: tempFile.mimeType }),
            id: `mobile-${tempFile.id}`,
            originalFileName: tempFile.originalFileName,
            fileSize: tempFile.fileSize,
            fileExtension: tempFile.fileExtension,
            mimeType: tempFile.mimeType,
            uploadTime: tempFile.uploadTime,
            isMobileFile: true,
            tempFileId: tempFile.id,
          }));
          
          localFiles.value.push(...newLocalFiles);
          emit('local-files-change', localFiles.value);
        }
        
        emit('mobile-files-uploaded', newFiles);
      }
      
      mobileUploadedFiles.value = newFiles;
    }
  } catch (error) {
    console.error('获取临时文件列表失败:', error);
  }
};
```

### 5. 关闭弹窗处理

```typescript
const closeQrCodeDialog = async () => {
  showQrCodeDialog.value = false;
  
  // 停止轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }
  
  let shouldCancelToken = true;
  
  // 如果有上传的文件
  if (mobileUploadedFiles.value.length > 0) {
    // 如果有bizId，自动转移文件
    if (props.bizId) {
      await transferMobileFiles(props.bizId);
    } else {
      // 如果没有bizId，保留Token和文件列表
      shouldCancelToken = false;
      ElMessage.info('文件已保存到临时存储，创建业务实体后可转移文件');
      console.log('文件已保存到临时存储，Token:', currentTempToken.value);
    }
  }
  
  // 取消Token（只有当没有上传文件或已转移文件时）
  if (shouldCancelToken && currentTempToken.value) {
    try {
      await cancelTempUploadToken(currentTempToken.value);
      console.log('Token已取消:', currentTempToken.value);
    } catch (error) {
      console.error('取消Token失败:', error);
    }
    currentTempToken.value = '';
    mobileUploadedFiles.value = [];
  }
};
```

---

## 临时文件转移

### 1. 转移函数

```typescript
const transferMobileFiles = async (bizId: number): Promise<TempUploadFile[]> => {
  if (!currentTempToken.value || mobileUploadedFiles.value.length === 0) {
    return [];
  }

  try {
    const response = await transferTempFiles({
      token: currentTempToken.value,
      bizType: props.bizType,
      bizId: bizId.toString(),
    });

    if (response.code === 200 && response.data) {
      const transferredFiles = response.data;
      ElMessage.success(`成功转移 ${transferredFiles.length} 个文件到业务`);
      
      // 刷新文件列表
      await loadFiles();
      
      // 返回转移后的完整文件信息
      return transferredFiles;
    }
  } catch (error) {
    console.error('转移临时文件失败:', error);
    ElMessage.error('转移临时文件失败');
  }
  
  return [];
};
```

### 2. 提交表单时转移文件

```typescript
const submitForm = async () => {
  // 表单验证
  if (!formValid()) return;

  loading.value = true;
  try {
    // 用于存储所有文件的路径
    const filePaths: string[] = [];
    
    // 1. 首先检查是否有未转移的临时文件（手机上传的文件）
    if (fileUploadRef.value && fileUploadRef.value.getHasUntransferredFiles()) {
      console.log('发现未转移的临时文件，开始转移...');
      const transferredFiles = await fileUploadRef.value.transferMobileFiles(bizId);
      
      if (transferredFiles.length > 0) {
        // 提取转移后的文件路径
        const transferredFilePaths = transferredFiles
          .map((file: any) => file.filePath || file.storedFileName)
          .filter((path: string) => path);
        filePaths.push(...transferredFilePaths);
      }
    }

    // 2. 处理电脑上传的文件
    if (localFiles.value.length > 0) {
      // 过滤掉手机上传的文件（它们已经通过转移接口处理）
      const computerFiles = localFiles.value.filter(f => !f.id.toString().startsWith('mobile-'));
      
      if (computerFiles.length > 0) {
        const files = computerFiles.map(item => item.file);
        const uploadResponse = await batchUploadFilesApi(files, bizType, bizId);

        if (uploadResponse.code === 200 && uploadResponse.data) {
          const computerFilePaths = uploadResponse.data
            .map((fileData: any) => fileData.filePath || fileData.storedFileName)
            .filter((path: string) => path);
          filePaths.push(...computerFilePaths);
        }
      }
    }
    
    // 3. 将所有文件路径拼接成一个字符串
    const documentAttachment = filePaths.join(';');
    
    // 4. 提交表单数据
    const requestData = {
      ...formData,
      documentAttachment,
    };

    const response = await submitApi(requestData);

    if (response.code === 200) {
      ElMessage.success('提交成功');
      // 关闭弹窗，刷新列表等操作
    } else {
      ElMessage.error(response.message || '提交失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败');
  } finally {
    loading.value = false;
  }
};
```

---

## IP地址配置

### 1. 环境变量配置

在 `.env.development` 文件中配置：

```env
# 手机上传功能使用的本机IP地址
# 如果不设置，会自动检测；如果自动检测失败，会使用默认IP
# 格式: 192.168.x.x
VITE_MOBILE_UPLOAD_IP=192.168.0.151
```

### 2. 代码中使用

```typescript
// 从环境变量获取配置的IP地址
const getConfiguredIP = (): string | null => {
  const envIP = import.meta.env.VITE_MOBILE_UPLOAD_IP;
  if (envIP && envIP !== 'localhost' && envIP !== '127.0.0.1') {
    console.log('[IP检测] 使用环境变量配置的IP:', envIP);
    return envIP;
  }
  return null;
};

// 生成二维码URL时使用
let baseUrl = window.location.origin;
const configuredIP = getConfiguredIP();
if (configuredIP) {
  baseUrl = `http://${configuredIP}:5779`;
} else {
  // 自动检测或使用默认值
  const currentUrl = new URL(window.location.href);
  baseUrl = `http://${currentUrl.hostname}:5779`;
}
```

### 3. 默认IP地址

如果没有配置环境变量，且自动检测失败，使用默认IP：

```typescript
const defaultIP = '192.168.0.151';
```

---

## 注意事项

### 1. 本地模式 vs 服务器模式

- **本地模式**（`localMode: true`）：用于新增和编辑场景，文件先存储在本地，提交时才上传
- **服务器模式**（`localMode: false`）：用于查看场景，直接从服务器加载文件列表

### 2. bizId 的处理

- **新增时**：`bizId` 为 0，文件先存储在临时存储，创建业务后再转移
- **编辑时**：`bizId` 为实际ID，手机上传的文件可以立即转移

### 3. 文件过滤

上传电脑文件时，需要过滤掉手机上传的文件：

```typescript
// 手机上传的文件ID以 'mobile-' 开头
const computerFiles = localFiles.value.filter(f => !f.id.toString().startsWith('mobile-'));
```

### 4. 空文件处理

手机上传的文件在本地模式下会创建空File对象，需要在上传时过滤：

```typescript
// 过滤掉空的File对象（大小为0的文件）
const validFiles = files.filter(file => file.size > 0);
```

### 5. 预览和下载

手机上传的文件需要从服务器获取实际内容：

```typescript
// 检查是否为手机上传的文件
const isMobileFile = typeof file.id === 'string' && file.id.startsWith('mobile-');

if (isMobileFile || file.file.size === 0) {
  // 从服务器获取文件数据
  const fileId = file.id.toString().replace('mobile-', '');
  blob = await fileUploadRequestClient.get<Blob>(
    `/api/v1/file/preview/${fileId}`,
    { responseType: 'blob' }
  );
} else {
  // 使用本地文件
  blob = file.file;
}
```

### 6. 组件引用

需要为FileUpload组件添加ref引用，以便调用其方法：

```typescript
const fileUploadRef = ref<any>();

// 在模板中
<FileUpload ref="fileUploadRef" ... />

// 调用方法
const hasUntransferredFiles = fileUploadRef.value?.getHasUntransferredFiles();
const transferredFiles = await fileUploadRef.value?.transferMobileFiles(bizId);
```

### 7. 暴露的方法

FileUpload组件通过 `defineExpose` 暴露以下方法：

```typescript
defineExpose({
  getLocalFiles,              // 获取本地文件列表
  clearLocalFiles,            // 清空本地文件列表
  uploadLocalFiles,           // 上传本地文件
  handleRefresh,              // 刷新文件列表
  openMobileUploadDialog,     // 打开手机上传弹窗
  transferMobileFiles,        // 转移临时文件
  getMobileUploadedFiles,     // 获取手机上传的文件列表
  getHasUntransferredFiles,   // 检查是否有未转移的文件
  getCurrentTempToken,        // 获取当前临时Token
});
```

### 8. 后端接口要求

后端需要实现以下接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/temp-upload/token` | POST | 创建临时上传Token |
| `/api/v1/temp-upload/token/{token}/files` | GET | 获取Token下的文件列表 |
| `/api/v1/temp-upload/transfer` | POST | 转移临时文件到业务 |
| `/api/v1/temp-upload/token/{token}` | DELETE | 取消Token |
| `/api/v1/file/upload` | POST | 上传文件 |
| `/api/v1/file/preview/{id}` | GET | 预览文件 |
| `/api/v1/file/download/{id}` | GET | 下载文件 |

---

## 完整示例

### 1. 父组件完整示例

```vue
<template>
  <div>
    <!-- 表单 -->
    <ElForm :model="formData" :rules="formRules">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formData.name" />
      </ElFormItem>
      
      <ElFormItem label="附件">
        <FileUpload
          ref="fileUploadRef"
          :model-value="[]"
          :biz-type="'document'"
          :biz-id="isEditing ? formData.id : 0"
          accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
          :max-size="50 * 1024 * 1024"
          :multiple="true"
          title="附件"
          :disabled="false"
          :local-mode="true"
          :existing-files="isEditing ? editExistingFiles : []"
          @local-files-change="handleLocalFilesChange"
        />
      </ElFormItem>
      
      <ElFormItem>
        <ElButton type="primary" @click="submitForm" :loading="loading">
          {{ isEditing ? '更新' : '提交' }}
        </ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import FileUpload from './components/FileUpload.vue';
import { batchUploadFilesApi } from '@/api/core/file';

const fileUploadRef = ref<any>();
const loading = ref(false);
const isEditing = ref(false);
const editExistingFiles = ref<any[]>([]);
const localFiles = ref<any[]>([]);

const formData = reactive({
  id: 0,
  name: '',
  attachment: '',
});

const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
};

const handleLocalFilesChange = (files: any[]) => {
  localFiles.value = files;
};

// 编辑时加载已有文件
const loadExistingFiles = (data: any) => {
  isEditing.value = true;
  formData.id = data.id;
  formData.name = data.name;
  
  if (data.attachment) {
    const paths = data.attachment.split(';').filter(p => p.trim());
    editExistingFiles.value = paths.map((path: string, index: number) => {
      const fileName = path.split('/').pop() || path.split('\\').pop() || `文件${index + 1}`;
      return {
        id: `existing-${index}`,
        originalFileName: fileName,
        fileSize: 0,
        fileExtension: fileName.split('.').pop() || '',
        mimeType: '',
        filePath: path,
      };
    });
  }
};

const submitForm = async () => {
  loading.value = true;
  try {
    const filePaths: string[] = [];
    
    // 1. 转移手机上传的临时文件
    if (fileUploadRef.value?.getHasUntransferredFiles()) {
      const transferredFiles = await fileUploadRef.value.transferMobileFiles(formData.id || 0);
      const transferredPaths = transferredFiles
        .map((f: any) => f.filePath || f.storedFileName)
        .filter((p: string) => p);
      filePaths.push(...transferredPaths);
    }
    
    // 2. 上传电脑文件
    const computerFiles = localFiles.value.filter(f => 
      !f.id.toString().startsWith('mobile-') && f.file.size > 0
    );
    
    if (computerFiles.length > 0) {
      const files = computerFiles.map(f => f.file);
      const response = await batchUploadFilesApi(files, 'document', formData.id || 0);
      
      if (response.code === 200 && response.data) {
        const uploadedPaths = response.data
          .map((f: any) => f.filePath || f.storedFileName)
          .filter((p: string) => p);
        filePaths.push(...uploadedPaths);
      }
    }
    
    // 3. 提交表单
    formData.attachment = filePaths.join(';');
    
    // 调用提交API...
    // const response = await submitApi(formData);
    
    ElMessage.success(isEditing.value ? '更新成功' : '提交成功');
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 总结

实现文件上传功能需要注意以下几点：

1. **正确区分本地模式和服务器模式**
2. **正确处理新增和编辑场景**
3. **手机上传文件需要通过临时存储转移**
4. **上传电脑文件时过滤掉手机上传的文件**
5. **预览和下载时正确处理空File对象**
6. **配置正确的IP地址以便手机访问**

按照本文档的指南，可以快速在其他模块中实现相同的文件上传功能。
