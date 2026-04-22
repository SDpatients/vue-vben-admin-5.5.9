# APP端新增案件功能开发指南

## 一、功能概述

新增案件功能是破产案件管理系统的核心功能，允许用户创建新的破产案件，填写案件基本信息，并上传相关文件。

## 二、页面流程

```
案件列表页 → 点击"新增案件"按钮 → 进入新增案件表单页 → 填写信息 → 提交 → 案件详情页
```

## 三、API接口列表

### 1. 创建案件接口（核心）

**接口地址：** `POST /api/v1/case`

**请求头：**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| caseNumber | string | 是 | 案号 | "(2025)浙05破1号" |
| caseName | string | 是 | 案件名称 | "某某公司破产清算案" |
| acceptanceDate | string | 是 | 受理日期 | "2025-01-20" |
| caseSource | string | 否 | 案件来源 | "法院指定" |
| acceptanceCourt | string | 否 | 受理法院 | "杭州市中级人民法院" |
| designatedJudge | string | 否 | 承办法官 | "张法官" |
| designatedInstitution | string | 否 | 指定机构 | "浙江浦源律师事务所" |
| mainResponsiblePerson | string | 否 | 主要负责人 | "李国祥" |
| undertakingPersonnel | number | 否 | 承办人员ID | 123 |
| isSimplifiedTrial | number | 否 | 是否简化审(0=否, 1=是) | 0 |
| caseProgress | string | 否 | 案件进度 | "FIRST" |
| debtClaimDeadline | string | 否 | 债权申报截止日期 | "2025-03-20" |
| remarks | string | 否 | 备注 | "案件备注信息" |

**请求示例：**
```json
{
  "caseNumber": "(2025)浙05破1号",
  "caseName": "某某公司破产清算案",
  "acceptanceDate": "2025-01-20",
  "caseSource": "法院指定",
  "acceptanceCourt": "杭州市中级人民法院",
  "designatedJudge": "张法官",
  "designatedInstitution": "浙江浦源律师事务所",
  "mainResponsiblePerson": "李国祥",
  "undertakingPersonnel": 123,
  "isSimplifiedTrial": 0,
  "caseProgress": "FIRST",
  "debtClaimDeadline": "2025-03-20",
  "remarks": "案件备注信息"
}
```

**响应示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "caseId": 123,
    "caseNumber": "(2025)浙05破1号"
  }
}
```

**响应示例（失败）：**
```json
{
  "code": 400,
  "message": "案号已存在",
  "data": null
}
```

### 2. 获取法院列表接口

**接口地址：** `GET /api/v1/court/list`

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页数量，默认100 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "fullName": "杭州市中级人民法院",
        "shortName": "杭州中院",
        "courtLevel": "中级"
      }
    ],
    "total": 10
  }
}
```

### 3. 获取管理人列表接口

**接口地址：** `GET /api/v1/administrator/list`

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认100 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "administratorName": "浙江浦源律师事务所",
        "contactPhone": "0571-12345678",
        "contactEmail": "lawyer@example.com"
      }
    ],
    "total": 10
  }
}
```

### 4. 获取用户列表接口

**接口地址：** `GET /api/v1/users`

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 否 | 搜索关键词（姓名/用户名） |
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页数量，默认10000 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "realName": "管理员"
      }
    ]
  }
}
```

### 5. 文件上传接口

**接口地址：** `POST /api/v1/file/upload`

**请求头：**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**请求参数（FormData）：**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 上传的文件 |
| bizType | string | 是 | 业务类型，固定值"case" |
| bizId | string | 是 | 案件ID（创建案件后返回的caseId） |

**响应示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 456,
    "fileName": "案件材料.pdf",
    "originalFileName": "案件材料.pdf",
    "fileSize": 1024000,
    "fileExtension": "pdf",
    "filePath": "/uploads/2025/01/xxx.pdf",
    "uploadTime": "2025-01-20T10:30:00"
  }
}
```

## 四、案件进度枚举值

| 枚举值 | 中文说明 |
|--------|----------|
| FIRST | 第一阶段 |
| SECOND | 第二阶段 |
| THIRD | 第三阶段 |
| FOURTH | 第四阶段 |
| FIFTH | 第五阶段 |
| SIXTH | 第六阶段 |
| SEVENTH | 第七阶段 |

## 五、表单验证规则

| 字段名 | 验证规则 |
|--------|----------|
| caseNumber | 必填，长度1-50字符 |
| caseName | 必填，长度1-100字符 |
| acceptanceDate | 必填，日期格式 |
| caseSource | 选填，长度不超过50字符 |
| mainResponsiblePerson | 选填，长度不超过50字符 |
| remarks | 选填，长度不超过500字符 |

## 六、文件上传规范

### 支持的文件类型
- `.doc`, `.docx` - Word文档
- `.xls`, `.xlsx` - Excel表格
- `.pdf` - PDF文档
- `.jpg`, `.png` - 图片文件
- `.txt` - 文本文件

### 文件大小限制
- 单个文件最大：10MB

### 上传流程
1. 用户选择文件（可多选）
2. 前端验证文件类型和大小
3. 先调用创建案件接口获取caseId
4. 使用caseId调用文件上传接口
5. 显示上传进度和结果

## 七、APP端实现建议

### 1. 页面结构建议
```
pages/
├── cases/
│   ├── add.vue          # 新增案件页面
│   ├── list.vue         # 案件列表页面
│   └── detail.vue       # 案件详情页面
```

### 2. 表单字段布局建议
- 案号、案件名称、受理日期（第一行）
- 案件来源、受理法院、承办法官（第二行）
- 指定机构、主要负责人、承办人员（第三行）
- 是否简化审、案件进度（第四行）
- 债权申报截止日期（第五行）
- 备注（单独一行，多行文本）
- 文件上传区域（底部）

### 3. 交互建议

#### 下拉选择器
- **受理法院**：使用可搜索的选择器，支持从法院列表接口获取数据
- **指定机构**：使用可搜索的选择器，支持从管理人列表接口获取数据
- **主要负责人/承办人员**：使用可搜索的选择器，支持从用户列表接口获取数据
- **是否简化审**：普通下拉选择（是/否）
- **案件进度**：普通下拉选择（第一阶段到第七阶段）

#### 日期选择器
- **受理日期**：日期选择器
- **债权申报截止日期**：日期选择器

#### 文件上传
- 支持从相册选择图片
- 支持从文件管理器选择文档
- 显示已选择文件列表
- 支持删除已选择的文件

### 4. 提交流程

```javascript
// 伪代码示例
async function submitCase() {
  // 1. 表单验证
  if (!validateForm()) {
    uni.showToast({ title: '请填写必填项', icon: 'none' });
    return;
  }

  // 2. 显示确认弹窗（展示案件信息摘要）
  const confirmed = await showConfirmDialog(formData);
  if (!confirmed) return;

  // 3. 显示加载中
  uni.showLoading({ title: '提交中...' });

  try {
    // 4. 创建案件
    const caseResult = await createCase(formData);
    
    if (caseResult.code === 200) {
      const caseId = caseResult.data.caseId;

      // 5. 上传文件（如果有）
      if (selectedFiles.length > 0) {
        uni.showLoading({ title: '上传文件中...' });
        await uploadFiles(selectedFiles, caseId);
      }

      // 6. 提交成功
      uni.hideLoading();
      uni.showToast({ title: '案件创建成功', icon: 'success' });
      
      // 7. 跳转到案件详情页
      uni.navigateTo({ url: `/pages/cases/detail?id=${caseId}` });
    } else {
      throw new Error(caseResult.message);
    }
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '提交失败', icon: 'none' });
  }
}
```

## 八、注意事项

### 1. 数据类型注意点
- `undertakingPersonnel` 字段类型是 **number**（用户ID），不是字符串
- `isSimplifiedTrial` 字段类型是 **number**（0或1），不是布尔值
- `acceptanceDate` 和 `debtClaimDeadline` 格式为 **YYYY-MM-DD**

### 2. 文件上传注意点
- 文件上传必须在创建案件之后进行，因为需要caseId
- 文件上传使用FormData格式，不是JSON
- 批量上传建议逐个上传，方便处理单个文件失败的情况

### 3. 错误处理
- 案号重复：后端会返回400错误，提示"案号已存在"
- 网络超时：建议设置3秒超时时间
- 文件上传失败：案件创建成功后，文件上传失败需要单独提示

### 4. 本地存储建议
- 表单数据可以本地存储，防止意外退出导致数据丢失
- 文件列表无法本地存储，只能存储文件信息，重新进入页面需要重新选择文件

### 5. 权限控制
- 只有登录用户才能创建案件
- 未登录时跳转到登录页面

## 九、参考代码（uni-app）

### API封装参考

```typescript
// api/case.ts
import http from './request';

export interface CreateCaseParams {
  caseNumber: string;
  caseName: string;
  acceptanceDate: string;
  caseSource?: string;
  acceptanceCourt?: string;
  designatedJudge?: string;
  designatedInstitution?: string;
  mainResponsiblePerson?: string;
  undertakingPersonnel?: number;
  isSimplifiedTrial?: number;
  caseProgress?: string;
  debtClaimDeadline?: string;
  remarks?: string;
}

export const createCase = (data: CreateCaseParams) => {
  return http.post<{ code: number; message: string; data: { caseId: number; caseNumber: string } }>('/case', data);
};

export const getCourtList = (params?: { page?: number; size?: number }) => {
  return http.get('/court/list', params);
};

export const getManagerList = (params?: { pageNum?: number; pageSize?: number }) => {
  return http.get('/administrator/list', params);
};

export const getUserList = (keyword?: string) => {
  return http.get('/users', { keyword, page: 1, size: 10000 });
};
```

### 文件上传参考

```typescript
// 单文件上传
export const uploadCaseFile = (filePath: string, caseId: number) => {
  const baseUrl = getBaseUrl();
  const token = uni.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseUrl}/api/v1/file/upload`,
      filePath: filePath,
      name: 'file',
      formData: {
        bizType: 'case',
        bizId: caseId.toString(),
      },
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        resolve(data);
      },
      fail: reject,
    });
  });
};

// 批量文件上传
export const batchUploadCaseFiles = async (filePaths: string[], caseId: number) => {
  const promises = filePaths.map(path => uploadCaseFile(path, caseId));
  return Promise.all(promises);
};
```

## 十、联调测试 checklist

- [ ] 创建案件接口调用成功，返回正确的caseId
- [ ] 表单验证功能正常，必填项未填写时给出提示
- [ ] 法院列表下拉正常显示
- [ ] 管理人列表下拉正常显示
- [ ] 用户列表搜索功能正常
- [ ] 单文件上传成功
- [ ] 多文件批量上传成功
- [ ] 文件类型验证正常（拒绝不支持的类型）
- [ ] 文件大小验证正常（拒绝超过10MB的文件）
- [ ] 案件创建成功后正确跳转到详情页
- [ ] 网络异常时给出友好提示
- [ ] 案号重复时给出正确提示
