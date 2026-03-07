# 债权申报表手机上传功能实现

## 修改文件
`apps/web-ele/src/views/law/case-detail/components/ClaimRegistrationStageOne.vue`

## 修改内容

### 1. 确认 FileUpload 组件配置
债权申报表的新增对话框中已经正确配置了 `FileUpload` 组件：

```vue
<FileUpload
  ref="fileUploadRef"
  v-model="claimForm.evidenceAttachments"
  :biz-type="'claim'"
  :biz-id="0"
  :accept="'.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar'"
  :max-size="50 * 1024 * 1024"
  :multiple="true"
  title="债权申报附件"
  :disabled="false"
  :local-mode="true"
/>
```

### 2. 修改 handleAddClaim 函数
在提交新增债权申报时，添加了转移手机上传临时文件的逻辑：

```typescript
const result = await ClaimService.createClaim(requestData);
if (result.success) {
  const claimId = result.data?.claimId || result.data?.id;
  if (claimId && fileUploadRef.value) {
    // 1. 首先转移手机上传的临时文件（如果有）
    if (fileUploadRef.value.getHasUntransferredFiles()) {
      console.log('发现手机上传的临时文件，开始转移...');
      const transferredFiles = await fileUploadRef.value.transferMobileFiles(claimId);
      console.log('转移成功的文件:', transferredFiles);
    }
    
    // 2. 上传本地文件（电脑选择的文件）
    const uploadedIds = await fileUploadRef.value.uploadLocalFiles(claimId);
    if (uploadedIds.length > 0) {
      localFileIds.value = uploadedIds;
    }
  }
  await fetchClaims();
  closeAddDialog();
}
addLoading.value = false;
```

## 工作流程

1. **用户点击"手机上传"按钮**
   - `FileUpload` 组件调用 `createTempUploadToken` 创建临时 Token
   - 生成二维码，手机扫描访问 `/mobile-upload?token=xxx`

2. **手机上传文件**
   - 手机浏览器访问上传页面
   - 选择文件并上传到临时存储
   - 前端轮询检测到新文件，添加到显示列表

3. **用户点击"提交"按钮**
   - 首先调用 `getHasUntransferredFiles()` 检查是否有未转移的临时文件
   - 如果有，调用 `transferMobileFiles(claimId)` 转移文件到业务
   - 然后调用 `uploadLocalFiles(claimId)` 上传电脑选择的文件
   - 所有文件都关联到债权申报记录

## 注意事项

1. **FileUpload 组件已经内置了完整的手机上传功能**，包括：
   - 创建临时 Token
   - 生成二维码
   - 轮询检测新文件
   - 显示文件列表
   - 转移临时文件

2. **父组件需要做的**：
   - 在提交表单时，先调用 `getHasUntransferredFiles()` 检查
   - 如果有未转移的文件，调用 `transferMobileFiles(bizId)` 转移
   - 然后调用 `uploadLocalFiles(bizId)` 上传电脑文件

3. **bizId 的处理**：
   - 新增时 `biz-id="0"`，文件先存储在临时存储
   - 创建业务记录后，使用返回的 ID 转移文件

## 参考文档
- `docs/file-upload-guide.md` - 完整的文件上传实现指南
- `docs/bankruptcy-process-mobile-upload-changes.md` - 流程处理模块的实现示例
