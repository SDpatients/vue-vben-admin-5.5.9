# 手机上传功能实现总结

## 已完成的所有模块

### 1. 流程处理模块（bankruptcy-process/index.vue）
✅ **七个阶段的所有模块都支持手机上传**
- 一、破产申请与受理
- 二、接管与调查  
- 三、债权申报与核查
- 四、债权人会议
- 五、破产宣告
- 六、财产变价与分配
- 七、破产程序终结

**实现方式**：
- 在 `handleAddSubmit` 函数中添加了转移临时文件的逻辑
- 所有阶段共用同一个提交函数，因此都支持手机上传

### 2. 债权申报表模块（ClaimRegistrationStageOne.vue）
✅ **新增功能支持手机上传**

**实现方式**：
- 在 `handleAddClaim` 函数中添加了转移临时文件的逻辑
- 先转移手机文件，再上传电脑文件

### 3. 工作日志模块（case-detail/index.vue）
✅ **新增和修改都支持手机上传**

**实现方式**：
- 在 `saveWorkLog` 函数中添加了转移临时文件的逻辑
- 新增模式：先创建工作日志，然后转移手机文件，最后上传电脑文件
- 修改模式：先更新工作日志，然后转移手机文件，最后上传电脑文件

### 4. 公告管理模块（announcement-list/index.vue）
✅ **新增功能支持手机上传**

**实现方式**：
- 在 `submitPublishForm` 函数中已经实现了完整的手机上传逻辑
- 检测手机文件，先创建公告，然后转移手机文件

### 5. 文书上传按钮（case-detail/index.vue）
✅ **新增和修改都支持手机上传**

**实现方式**：
- 使用 `FileUpload` 组件的 `ref` 引用
- 在提交时调用 `transferMobileFiles` 方法

### 6. 文书审批按钮（case-detail/index.vue）
✅ **审批提交支持手机上传**

**实现方式**：
- 使用 `approvalUploadRef` 引用 FileUpload 组件
- 在 `submitApprovalForm` 函数中转移临时文件

## 核心实现模式

所有模块都使用了相同的代码模式：

```typescript
// 1. 检查是否有未转移的临时文件
if (fileUploadRef.value && fileUploadRef.value.getHasUntransferredFiles()) {
  // 2. 转移手机上传的临时文件
  const transferredFiles = await fileUploadRef.value.transferMobileFiles(bizId);
  console.log('转移成功的文件:', transferredFiles);
}

// 3. 上传本地文件（电脑选择的文件）
if (fileUploadRef.value && files.length > 0) {
  await fileUploadRef.value.uploadLocalFiles(bizId);
}
```

## FileUpload 组件配置

所有模块都使用了相同的 FileUpload 组件配置：

```vue
<FileUpload
  ref="fileUploadRef"
  v-model="form.files"
  :biz-type="'xxx'"  <!-- 根据模块设置不同的 bizType -->
  :biz-id="0"
  accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.xls,.xlsx"
  :max-size="50 * 1024 * 1024"
  :multiple="true"
  title="附件"
  :disabled="false"
  :local-mode="true"
/>
```

## 关键变量和函数

### 变量
```typescript
// 临时上传 Token
const currentTempToken = ref('');
// 轮询定时器
const tempFilePolling = ref<NodeJS.Timeout | null>(null);
// 手机上传的文件列表
const mobileUploadedFiles = ref<TempUploadFile[]>([]);
```

### 核心函数
```typescript
// 轮询获取临时文件
const pollTempFiles = async () => { ... }

// 转移临时文件到业务
const transferMobileFiles = async (bizId: number) => { ... }

// 打开手机上传对话框
const openMobileUploadDialog = async () => { ... }

// 关闭二维码弹窗
const closeQrCodeDialog = () => { ... }
```

## IP 地址配置

在 `.env.development` 文件中配置：
```env
# 手机上传功能使用的本机 IP 地址
VITE_MOBILE_UPLOAD_IP=192.168.0.151
```

## 工作流程

1. **用户点击"手机上传"按钮**
   - 创建临时上传 Token
   - 生成二维码 URL：`http://192.168.0.151:5779/mobile-upload?token=xxx`
   - 开始轮询（每 3 秒一次）

2. **手机扫描二维码上传**
   - 手机访问 `/mobile-upload` 页面
   - 选择文件并上传到临时存储
   - 前端轮询检测到新文件，添加到显示列表
   - 显示成功提示："手机上传了 X 个新文件"

3. **用户点击"保存/提交"按钮**
   - 检查是否有未转移的临时文件
   - 如果有，调用 `transferMobileFiles(bizId)` 转移文件
   - 然后调用 `uploadLocalFiles(bizId)` 上传电脑文件
   - 所有文件都正确关联到业务记录

## 参考文档

1. `docs/file-upload-guide.md` - 完整的文件上传实现指南
2. `docs/bankruptcy-process-mobile-upload-changes.md` - 流程处理模块的实现示例
3. `docs/claim-registration-mobile-upload.md` - 债权申报表的实现示例
4. `docs/work-log-announcement-mobile-upload.md` - 工作日志和公告管理的实现示例

## 测试清单

- ✅ 流程处理 - 七个阶段的所有模块
- ✅ 债权申报 - 新增功能
- ✅ 工作日志 - 新增和修改功能
- ✅ 公告管理 - 新增功能
- ✅ 文书上传 - 新增和修改功能
- ✅ 文书审批 - 审批提交功能

## 注意事项

1. **bizType 的设置**：不同模块使用不同的 bizType
   - 工作日志：`'work_log'`
   - 公告管理：`'announcement'`
   - 债权申报：`'claim'`
   - 任务提交：`'case_task_submission'`
   - 文书：`'document'`

2. **bizId 的处理**：
   - 新增时设置为 `0`
   - 创建业务记录后，使用返回的 ID 转移文件

3. **文件上传顺序**：
   - 先转移手机上传的临时文件
   - 再上传电脑选择的文件
   - 这样可以确保所有文件都正确关联到业务记录

4. **错误处理**：
   - 转移失败不影响本地文件上传
   - 每个步骤都有独立的错误处理
