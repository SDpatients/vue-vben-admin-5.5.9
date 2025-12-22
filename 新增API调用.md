# 新增债权人API调用总结

## 1. 新增债权人API

### 1.1 基本信息

**API名称**：`addCreditorApi`

**功能描述**：添加新的债权人信息到系统中

**请求方式**：`POST`

**请求URL**：`/api/web/addCreditor`

**认证方式**：通过URL参数`token`进行认证（已硬编码在函数内部）

### 1.2 请求参数

**请求体类型**：数组，包含单个对象 `[{...}]`

**请求体结构**：
```typescript
interface AddCreditorRequest {
  sep_ld: string;       // 预留字段，默认空字符串
  sep_auser: string;    // 操作人，从本地存储获取或手动设置
  sep_adate: string;    // 操作日期，格式：YYYY-MM-DDTHH:mm:ss
  zqr: string;          // 债权人名称（必填）
  zqrfl: string;        // 债权人分类（必填），支持"个人"、"企业"等
  zjhm: string;         // 证件号码（必填）
  fddbrqy: string;      // 法定代表人（企业），个人类型时可空
  zcdz: string;         // 注册地址，个人类型时可空
  jyfwqy: string;       // 经营范围（企业），个人类型时可空
  hyfl: string;         // 行业分类，个人类型时可空
  clrqqy: string | null; // 成立日期（企业），可为null，个人类型时自动设为null
  zczbqy: number;       // 注册资本（企业），int类型，默认为0
  zt: string;           // 状态，默认为"1"
}
```

**必填字段**：
- `zqr`: 债权人名称
- `zqrfl`: 债权人分类
- `zjhm`: 证件号码

**可选字段**：
- 除必填字段外的其他字段均为可选，根据债权人分类自动显示/隐藏

### 1.3 返回结果

**返回格式**：
```typescript
interface AddCreditorResponse {
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
  "error": "债权人名称不能为空"
}
```

### 1.4 使用示例

**基本使用**：
```typescript
import { addCreditorApi } from '#/api/core/creditor';

// 准备请求数据
const creditorData = {
  sep_ld: '',
  sep_auser: 'admin',
  sep_adate: '2025-12-19T07:24:56',
  zqr: '方文凯',
  zqrfl: '个人',
  zjhm: '14241',
  fddbrqy: '',
  zcdz: '',
  jyfwqy: '',
  hyfl: '',
  clrqqy: null,
  zczbqy: 0,
  zt: '1'
};

// 调用API
async function addCreditor() {
  try {
    const response = await addCreditorApi(creditorData);
    if (response.status === '1') {
      console.log('债权人添加成功');
    } else {
      console.error('债权人添加失败:', response.error);
    }
  } catch (error) {
    console.error('API调用错误:', error);
  }
}
```

**企业类型债权人示例**：
```typescript
const enterpriseCreditorData = {
  sep_ld: '',
  sep_auser: 'admin',
  sep_adate: '2025-12-19T07:24:56',
  zqr: '测试企业',
  zqrfl: '企业',
  zjhm: '91110000MA12345678',
  fddbrqy: '张三',
  zcdz: '北京市朝阳区',
  jyfwqy: '技术开发、咨询服务',
  hyfl: '信息技术',
  clrqqy: '2020-01-01',
  zczbqy: 1000000,
  zt: '1'
};
```

### 1.5 关键字段处理逻辑

**1.5.1 注册资本（zczbqy）**
- **类型**：`number`（int类型）
- **默认值**：`0`
- **验证规则**：
  - 企业类型时必填
  - 必须为数字，支持整数和小数
  - 自动转换为数字类型，确保后端接收到正确类型

**1.5.2 成立日期（clrqqy）**
- **类型**：`string | null`
- **默认值**：`null`
- **验证规则**：
  - 企业类型时必填
  - 支持null值，当没有输入时自动设为null
  - 格式为ISO格式：`YYYY-MM-DDTHH:mm:ss`

**1.5.3 债权人分类（zqrfl）**
- **影响**：根据分类动态显示/隐藏表单字段
  - 个人类型：隐藏企业相关字段（法定代表人、注册地址等）
  - 企业类型：显示所有字段
- **验证规则**：必填，必须选择有效的分类值

### 1.6 注意事项

**1.6.1 数据类型转换**
- 注册资本（zczbqy）使用`v-model.number`指令，确保输入值转换为数字类型
- 日期字段使用日期选择器，自动生成ISO格式字符串
- 空值处理：空字符串`''`用于字符串字段，`null`用于日期字段

**1.6.2 请求格式**
- 所有请求体均为数组格式，包含单个对象：`[{...}]`
- 已自动添加`Content-Type: application/json`请求头
- 日期字段格式统一为ISO格式：`YYYY-MM-DDTHH:mm:ss`

**1.6.3 错误处理**
- API返回的`status`字段为"1"表示成功，"0"表示失败
- 失败时，`error`字段包含详细错误信息
- 建议添加try-catch块处理网络错误和服务器错误

**1.6.4 表单验证**
- 前端实现了完整的表单验证，包括必填项检查、格式验证等
- 企业类型时，自动验证企业相关字段
- 个人类型时，跳过企业相关字段验证

**1.6.5 操作人信息**
- `sep_auser`字段从本地存储`chat_user_info`中获取
- 如果本地存储中没有用户信息，默认设为空字符串
- 建议在调用API前确保用户已登录，获取有效的操作人信息

### 1.7 代码优化点

**1.7.1 自动填充**
- `sep_adate`字段自动填充当前日期时间
- `sep_auser`字段自动从本地存储获取
- `clrqqy`字段在个人类型时自动设为null

**1.7.2 类型安全**
- 使用TypeScript严格类型定义，确保参数类型正确
- 数字类型字段做了严格的类型转换和验证
- 日期字段支持null值，避免无效日期格式

**1.7.3 用户体验**
- 根据债权人分类动态显示/隐藏字段
- 表单验证提供友好的错误提示
- 提交时显示加载状态，避免重复提交

### 1.8 典型使用场景

**场景1：添加个人债权人**
```typescript
const personalCreditor = {
  sep_ld: '',
  sep_auser: 'admin',
  sep_adate: '2025-12-19T07:24:56',
  zqr: '张三',
  zqrfl: '个人',
  zjhm: '110101199001011234',
  fddbrqy: '',
  zcdz: '',
  jyfwqy: '',
  hyfl: '',
  clrqqy: null,
  zczbqy: 0,
  zt: '1'
};
```

**场景2：添加企业债权人**
```typescript
const enterpriseCreditor = {
  sep_ld: '',
  sep_auser: 'admin',
  sep_adate: '2025-12-19T07:24:56',
  zqr: '北京科技有限公司',
  zqrfl: '企业',
  zjhm: '91110000MA12345678',
  fddbrqy: '李四',
  zcdz: '北京市海淀区中关村',
  jyfwqy: '技术开发、技术咨询、技术转让',
  hyfl: '信息技术',
  clrqqy: '2015-01-01T00:00:00',
  zczbqy: 5000000,
  zt: '1'
};
```

## 2. 总结

新增债权人API是一个功能完整、类型安全的接口，支持添加个人和企业两种类型的债权人信息。该API具有以下特点：

1. **类型安全**：使用TypeScript严格类型定义，确保数据类型正确
2. **自动处理**：自动填充日期、操作人等字段，简化开发
3. **动态验证**：根据债权人分类动态验证字段，提高数据质量
4. **友好体验**：动态显示/隐藏字段，提供友好的错误提示
5. **灵活扩展**：支持添加新的债权人分类和字段

在使用该API时，需要注意请求格式、数据类型转换和错误处理，确保API调用的正确性和可靠性。建议在实际开发中，根据具体业务需求对API进行适当的封装和扩展，提高代码的可维护性和性能。
