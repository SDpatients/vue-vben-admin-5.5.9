# 新增工作团队API调用总结

## 1. 新增工作团队API

### 1.1 基本信息

**API名称**：`addWorkTeamApi`

**功能描述**：添加新的工作团队信息到系统中

**请求方式**：`POST`

**请求URL**：`/api/web/addWorkTeam`

**认证方式**：通过URL参数`token`进行认证（已硬编码在函数内部）

### 1.2 请求参数

**请求体类型**：数组，包含单个对象 `[{...}]`

**请求体结构**：
```typescript
interface AddWorkTeamRequest {
  sep_ld: string;       // 案件ID
  tdfzr: string;        // 团队负责人
  zhzcy: string;        // 综合组成员
  cxzcy: string;        // 程序组成员
  ccglzcy: string;      // 财产管理组成员
  zqshzcy: string;      // 债权审核组成员
  ldrszcy: string;      // 劳动人事组成员
  zzqlzcy: string;      // 资产清理组成员
  sepauser: string;     // 操作人，从本地存储获取
  sepadate: string;     // 操作日期，格式：YYYY-MM-DDTHH:mm:ss
  ZT: string;           // 状态，默认为"0"
}
```

**必填字段**：
- `sep_ld`: 案件ID（自动填充）
- `tdfzr`: 团队负责人
- `zhzcy`: 综合组成员
- `cxzcy`: 程序组成员
- `ccglzcy`: 财产管理组成员
- `zqshzcy`: 债权审核组成员
- `ldrszcy`: 劳动人事组成员
- `zzqlzcy`: 资产清理组成员

**自动填充字段**：
- `sepauser`: 从本地存储的`chat_user_info`中获取`U_USER`
- `sepadate`: 自动生成当前时间的ISO格式字符串
- `ZT`: 默认为"0"

### 1.3 返回结果

**返回格式**：
```typescript
interface AddWorkTeamResponse {
  status: string;       // 状态码，"1"表示成功，"0"表示失败
  error: string;        // 错误信息，成功时为空
}
```

**返回示例**：
```json
{
  "status": "1",
  "error": ""
}
```

**失败示例**：
```json
{
  "status": "0",
  "error": "团队负责人不能为空"
}
```

### 1.4 使用示例

**基本使用**：
```typescript
import { addWorkTeamApi } from '#/api/core/work-team';

// 准备请求数据
const workTeamData = {
  sep_ld: '123', // 案件ID
  tdfzr: '张三', // 团队负责人
  zhzcy: '李四,王五', // 综合组成员
  cxzcy: '赵六', // 程序组成员
  ccglzcy: '孙七', // 财产管理组成员
  zqshzcy: '周八', // 债权审核组成员
  ldrszcy: '吴九', // 劳动人事组成员
  zzqlzcy: '郑十', // 资产清理组成员
  sepauser: 'admin', // 操作人
  sepadate: '2025-12-19T07:24:56', // 操作日期
  ZT: '0' // 状态
};

// 调用API
async function addWorkTeam() {
  try {
    const response = await addWorkTeamApi(workTeamData);
    if (response.status === '1') {
      console.log('工作团队添加成功');
    } else {
      console.error('工作团队添加失败:', response.error);
    }
  } catch (error) {
    console.error('API调用错误:', error);
  }
}
```

### 1.5 关键字段处理逻辑

**1.5.1 案件ID（sep_ld）**
- **类型**：`string`
- **默认值**：从路由参数中获取的案件ID
- **验证规则**：必填，确保与案件详情关联

**1.5.2 操作人（sepauser）**
- **类型**：`string`
- **来源**：从本地存储的`chat_user_info`中获取`U_USER`字段
- **默认值**：当本地存储中没有用户信息时，默认为"admin"

**1.5.3 操作日期（sepadate）**
- **类型**：`string`
- **格式**：ISO格式字符串 `YYYY-MM-DDTHH:mm:ss`
- **生成方式**：使用`new Date().toISOString()`自动生成当前时间

**1.5.4 状态（ZT）**
- **类型**：`string`
- **默认值**："0"
- **说明**：表示工作团队的状态，0为初始状态

### 1.6 注意事项

**1.6.1 数据类型转换**
- 所有字段均为字符串类型，确保输入值转换为字符串
- 日期字段使用ISO格式字符串，确保后端接收到正确格式

**1.6.2 请求格式**
- 所有请求体均为数组格式，包含单个对象：`[{...}]`
- 已自动添加`Content-Type: application/json`请求头

**1.6.3 错误处理**
- API返回的`status`字段为"1"表示成功，"0"表示失败
- 失败时，`error`字段包含详细错误信息
- 建议添加try-catch块处理网络错误和服务器错误

**1.6.4 表单验证**
- 前端实现了完整的表单验证，包括必填项检查
- 自动填充字段不需要用户输入，简化了表单操作

**1.6.5 操作人信息**
- `sepauser`字段从本地存储`chat_user_info`中获取
- 如果本地存储中没有用户信息，默认设为"admin"
- 建议在调用API前确保用户已登录，获取有效的操作人信息

### 1.7 代码实现

**API定义（work-team.ts）**：
```typescript
/** 添加工作团队请求参数 */
export interface AddWorkTeamRequest {
  sep_ld: string;       // 案件ID
  tdfzr: string;        // 团队负责人
  zhzcy: string;        // 综合组成员
  cxzcy: string;        // 程序组成员
  ccglzcy: string;      // 财产管理组成员
  zqshzcy: string;      // 债权审核组成员
  ldrszcy: string;      // 劳动人事组成员
  zzqlzcy: string;      // 资产清理组成员
  sepauser: string;     // 操作人
  sepadate: string;     // 操作日期
  ZT: string;           // 状态字段，默认为0（string类型）
}

/** 添加工作团队响应 */
export interface AddWorkTeamResponse {
  status: string;
  error: string;
}

/**
 * 添加工作团队
 */
export async function addWorkTeamApi(
  data: WorkTeamApi.AddWorkTeamRequest,
) {
  const token = 'f438aa4e6ec2436a8b6adf70f0062670';
  return requestClient.post<WorkTeamApi.AddWorkTeamResponse>('/api/web/addWorkTeam', [data], {
    params: {
      token,
    },
  });
}
```

**API调用（TaskEdit.vue）**：
```typescript
// 从本地存储获取操作人信息
const chatUserInfo = localStorage.getItem('chat_user_info');
const sepauser = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';

// 调用添加工作团队API
const workTeamData = {
  sep_ld: caseId.value, // 使用案件ID作为sep_ld
  tdfzr: formData.value.TDFZR || '',
  zhzcy: formData.value.ZHZCY || '',
  cxzcy: formData.value.CXZCY || '',
  ccglzcy: formData.value.CCGLZCY || '',
  zqshzcy: formData.value.ZQSHZCY || '',
  ldrszcy: formData.value.LDRSZCY || '',
  zzqlzcy: formData.value.ZZQLZCY || '',
  sepauser, // 从本地存储获取操作人
  sepadate: new Date().toISOString(), // 操作日期，当前时间
  ZT: "0", // 状态字段，默认为0（string类型）
};

const result = await addWorkTeamApi(workTeamData);
```

## 2. 总结

新增工作团队API是一个功能完整、类型安全的接口，用于添加工作团队信息。该API具有以下特点：

1. **类型安全**：使用TypeScript严格类型定义，确保数据类型正确
2. **自动处理**：自动填充日期、操作人等字段，简化开发
3. **表单验证**：前端实现了完整的表单验证，提高数据质量
4. **灵活扩展**：支持添加新的工作团队字段
5. **统一认证**：使用统一的token认证机制

在使用该API时，需要注意请求格式、数据类型转换和错误处理，确保API调用的正确性和可靠性。建议在实际开发中，根据具体业务需求对API进行适当的封装和扩展，提高代码的可维护性和性能。

## 3. 类似子表新增参考

对于其他类似子表的新增，建议按照以下步骤进行：

1. **定义API接口**：在对应的API文件中定义请求参数和响应的接口
2. **实现API函数**：实现调用后端API的函数，包含认证信息
3. **添加表单配置**：在任务配置中添加表单字段定义
4. **修改保存逻辑**：在保存数据时调用对应的API
5. **处理自动填充字段**：如操作人、操作日期等
6. **添加错误处理**：确保API调用失败时能给用户友好提示
7. **更新页面标题**：根据案件信息动态生成页面标题

通过遵循以上步骤，可以确保新增子表的API实现一致、可靠，提高开发效率和代码质量。