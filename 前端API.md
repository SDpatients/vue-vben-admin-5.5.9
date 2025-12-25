# 前端API接口文档

本文档汇总了前端项目中所有请求给后端的API接口与参数。

## 目录
- [认证管理](#认证管理)
- [案件管理](#案件管理)
- [债权人管理](#债权人管理)
- [债务人管理](#债务人管理)
- [法院管理](#法院管理)
- [银行账户管理](#银行账户管理)
- [工作团队管理](#工作团队管理)
- [用户管理](#用户管理)
- [聊天系统](#聊天系统)
- [案件流程管理](#案件流程管理)
- [操作记录管理](#操作记录管理)

## 认证管理

### 用户登录
- **接口路径**: `POST /api/web/login`
- **请求参数**:
  ```typescript
  {
    UserName: string,    // 用户名
    Pwd: string,         // 密码
    token: string        // 固定token值
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      U_NAME: string,    // 用户姓名
      U_PID: string,     // 用户ID
      U_TEL: string,     // 用户电话
      U_USER: string     // 用户名
    },
    status: string,      // 状态码（1表示成功）
    error: string        // 错误信息
  }
  ```

### 刷新Token
- **接口路径**: `POST /auth/refresh`
- **请求参数**: 无
- **返回结果**:
  ```typescript
  {
    data: string,        // 新的token
    status: number       // 状态码
  }
  ```

### 退出登录
- **接口路径**: `POST /auth/logout`
- **请求参数**: 无
- **返回结果**: 无

### 添加登录记录
- **接口路径**: `POST http://192.168.0.108:8081/api/web/LoginRecord`
- **请求参数**:
  ```typescript
  {
    userid: string,      // 用户ID
    username: string,    // 用户名
    logintime: string    // 登录时间
  }
  ```
- **返回结果**: 登录接口的返回格式

### 查询登录记录
- **接口路径**: `GET http://192.168.0.108:8081/api/web/selectLoginRecord`
- **请求参数**:
  ```typescript
  {
    username: string,    // 用户名
    page: number,        // 页码
    size: number         // 每页大小
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,     // 总记录数
      pages: number,     // 总页数
      records: Array<{
        logintime: string,
        userid: string,
        username: string
      }>
    },
    status: string,
    error: string
  }
  ```

## 案件管理

### 获取案件列表
- **接口路径**: `GET /api/web/selectAllCase`
- **请求参数**:
  ```typescript
  {
    page?: number,       // 页码
    size?: number,       // 每页大小
    token?: string       // token（可选）
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,     // 总记录数
      pages: number,     // 总页数
      records: Array<{
        row: number,     // 行号
        序号: number,
        年度: string | null,
        案号: string,
        申请人: string | null,
        债务人: string | null,
        案由: string,
        立案时间: string | null,
        破产时间: string | null,
        终结时间: string | null,
        注销时间: string | null,
        归档时间: string | null,
        会计账簿: string,
        办理期限: string | null,
        承办人: string,
        法院: string,
        管理人: string,
        债权人数: number,
        债权总额: number,
        财产金额: number,
        财产比例: number,
        银行账户数: number,
        银行账户总余额: number,
        有效账户数: number
      }>
    },
    status: string,
    error: string
  }
  ```

### 获取案件详情
- **接口路径**: `GET /api/web/selectOneCase`
- **请求参数**:
  ```typescript
  {
    token: string,       // 固定token值
    AJID: string         // 案件ID
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      // 案件详细信息字段（约50个字段）
      案件单据号: string,
      案件名称: string,
      案件来源: string,
      案件进度: string,
      案号: string,
      案由: string,
      法定代表人: string,
      法院裁定日期: string,
      注册地址: string,
      注册资本: string,
      // ... 其他字段
    },
    status: string,
    error: string
  }
  ```

## 债权人管理

### 获取债权人列表
- **接口路径**: `GET /api/web/getAllCreditor`
- **请求参数**:
  ```typescript
  {
    page: number,                // 页码
    size: number,                // 每页大小
    token: string,               // token
    SearchKeyword?: string,      // 搜索关键词（可选）
    SearchType?: string          // 搜索类型（可选）
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,             // 总记录数
      pages: number,             // 总页数
      records: Array<{
        row: number,             // 行号
        ZQRID: string,           // 债权人ID
        ZQR: string,             // 债权人名称
        ZQRFL: string,           // 债权人分类
        ZJHM: string,            // 证件号码
        FDDBRQY: string,         // 法定代表人（企业）
        ZCDZ: string,            // 注册地址
        JYFWQY: string,          // 经营范围（企业）
        HYFL: string,            // 行业分类
        CLRQQY: string,          // 成立日期（企业）
        ZCZBQY: number,          // 注册资本（企业）
        GLAJID: string,          // 关联案件ID
        AH: string               // 案号
      }>
    },
    status: string,
    error: string
  }
  ```

### 获取债权人详情
- **接口路径**: `GET /api/web/selectOneCreditor`
- **请求参数**:
  ```typescript
  {
    creditorId: string,  // 债权人ID
    token: string        // token
  }
  ```
- **返回结果**: 单个债权人详细信息

## 债务人管理

### 获取债务人列表
- **接口路径**: `GET /api/web/selectAllDebtor`
- **请求参数**:
  ```typescript
  {
    page: number,        // 页码
    size: number,        // 每页大小
    token: string        // token
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,     // 总记录数
      pages: number,     // 总页数
      records: Array<{
        row: number,     // 行号
        QYID: string,    // 企业ID
        AJID: string,    // 案件ID
        QYMC: string,    // 企业名称
        TYSHXYDM: string,// 统一社会信用代码
        FDDBR: string,   // 法定代表人
        DJJG: string,    // 登记机关
        CLRQ: string,    // 成立日期
        ZCZB: string,    // 注册资本
        JYFW: string,    // 经营范围
        QYLX: string,    // 企业类型
        SSHY: string,    // 所属行业
        ZCDZ: string,    // 注册地址
        LXDH: string,    // 联系电话
        LXR: string,     // 联系人
        ZT: string       // 状态
      }>
    },
    status: string,
    error: string
  }
  ```

### 获取债务人详情
- **接口路径**: `GET /api/web/selectDebtorById`
- **请求参数**:
  ```typescript
  {
    debtorId: string,    // 债务人ID
    token: string        // token
  }
  ```
- **返回结果**: 单个债务人详细信息

## 法院管理

### 获取法院列表
- **接口路径**: `GET /api/web/getAllCourt`
- **请求参数**:
  ```typescript
  {
    page?: number,       // 页码
    size?: number,       // 每页大小
    token?: string       // token（可选）
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,     // 总记录数
      pages: number,     // 总页数
      records: Array<{
        row: number,     // 行号
        FYQC: string,    // 法院全称
        FYJC: string,    // 法院简称
        FYJB: string,    // 法院级别
        DZ: string,      // 地址
        LXDH: string,    // 联系电话
        FZR: string,     // 负责人
        CBFG: string     // 承办法官
      }>
    },
    status: string,
    error: string
  }
  ```

## 银行账户管理

### 获取银行账户列表
- **接口路径**: `GET /api/web/getAllBankAccounts`
- **请求参数**:
  ```typescript
  {
    page?: number,           // 页码
    size?: number,           // 每页大小
    token?: string           // token（可选）
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,         // 总记录数
      pages: number,         // 总页数
      records: Array<{
        row: number,         // 行号
        CASEID: string,      // 案件ID
        account_name: string,// 账户名称
        bank_name: string,   // 银行名称
        account_number: string, // 账户号码
        account_type: string,// 账户类型
        currency: string,    // 币种
        balance: number,     // 余额
        KHRQ: string,        // 开户日期
        XHRQ: string,        // 销户日期
        ZT: string,          // 状态
        AH: string,          // 案号
        MM: string,          // 密码
        ZHID: string | null  // 账户ID
      }>
    },
    status: string,
    error: string
  }
  ```

## 工作团队管理

### 获取工作团队列表
- **接口路径**: `GET /api/web/getAllWorkTeam`
- **请求参数**:
  ```typescript
  {
    page?: number,       // 页码
    size?: number,       // 每页大小
    token?: string       // token（可选）
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,     // 总记录数
      pages: number,     // 总页数
      records: Array<{
        row: number,     // 行号
        TDID: string | null,     // 团队ID
        GLAJBH: string,          // 关联案件编号
        TDFZR: string | null,    // 团队负责人
        ZHZCY: string | null,    // 综合组成员
        CXZCY: string | null,    // 程序组成员
        CCGLZCY: string | null,  // 财产管理组成员
        ZQSHZCY: string | null,  // 债权审核组成员
        LDRSZCY: string | null,  // 劳动人事组成员
        ZZQLZCY: string | null,  // 资产清理组成员
        AH: string,              // 案号
        DQZT: string | null      // 当前状态
      }>
    },
    status: string,
    error: string
  }
  ```

## 用户管理

### 获取所有用户列表
- **接口路径**: `GET /api/web/selectAllUsers`
- **请求参数**:
  ```typescript
  {
    page?: number,           // 页码
    size?: number,           // 每页大小
    SearchKeyword?: string   // 搜索关键词（可选）
  }
  ```
- **返回结果**:
  ```typescript
  {
    data: {
      count: number,         // 总记录数
      pages: number,         // 总页数
      paras: any,            // 参数
      records: Array<{
        row: number,         // 行号
        U_PID: number,       // 用户ID
        U_USER: string,      // 用户名
        U_NAME: string,      // 用户姓名
        U_TEL: string | null,// 电话
        U_EMAIL: string | null, // 邮箱
        U_REMARK: string,    // 备注
        U_VALID: string      // 有效性
      }>
    },
    status: string,
    error: string
  }
  ```

### 创建用户
- **接口路径**: `POST /api/web/createUser`
- **请求参数**:
  ```typescript
  {
    U_USER: string,      // 用户名
    U_NAME: string,      // 用户姓名
    U_TEL: string,       // 电话
    U_EMAIL: string,     // 邮箱
    U_REMARK: string,    // 备注
    U_VALID: string      // 有效性
  }
  ```
- **返回结果**: 基础响应格式

### 更新用户
- **接口路径**: `PUT /api/web/updateUser/{userId}`
- **请求参数**: 同创建用户参数
- **返回结果**: 基础响应格式

### 删除用户
- **接口路径**: `DELETE /api/web/deleteUser/{userId}`
- **请求参数**: 无
- **返回结果**: 基础响应格式

## 聊天系统

### 获取联系人列表
- **接口路径**: `GET http://192.168.0.108:8081/api/web/contact`
- **请求参数**:
  ```typescript
  {
    token: string        // 固定token值
  }
  ```
- **返回结果**: 联系人列表

### 获取联系人分组列表
- **接口路径**: `GET http://192.168.0.108:8081/api/web/contact-groups`
- **请求参数**:
  ```typescript
  {
    token: string        // 固定token值
  }
  ```
- **返回结果**: 联系人分组列表

### 获取聊天会话
- **接口路径**: `GET http://192.168.0.108:8081/api/web/chatsession`
- **请求参数**:
  ```typescript
  {
    token: string,       // 固定token值
    contactId?: number   // 联系人ID（可选）
  }
  ```
- **返回结果**: 聊天会话列表

### 获取聊天消息列表
- **接口路径**: `GET http://192.168.0.108:8081/api/web/message`
- **请求参数**:
  ```typescript
  {
    token: string,       // 固定token值
    SENDERID?: number    // 发送者ID（可选）
  }
  ```
- **返回结果**: 聊天消息列表

### 更新联系人在线状态
- **接口路径**: `GET http://192.168.0.108:8081/api/web/updatestatus`
- **请求参数**:
  ```typescript
  {
    token: string,           // 固定token值
    contactuserid: number,   // 联系人用户ID
    status: string           // 状态值
  }
  ```
- **返回结果**: 基础响应格式

## 案件流程管理

案件流程管理包含多个阶段的任务API，每个API都有相似的参数结构：

### 通用参数结构
- **请求参数**:
  ```typescript
  {
    token: string,   // 固定token值
    AJID: string     // 案件ID
  }
  ```

### 第一阶段任务API
- 获取工作团队：`GET /api/web/getWorkTeam`
- 获取工作计划：`GET /api/web/getWorkPlan`
- 获取管理制度：`GET /api/web/getManagement`
- 获取印章管理：`GET /api/web/getSealManagement`
- 获取法律程序：`GET /api/web/getLegalProcedure`

### 第二阶段任务API
- 获取财产接管：`GET /api/web/getPropertyReceipt`
- 获取应急预案：`GET /api/web/getEmergency`
- 获取财产处置计划：`GET /api/web/getPropertyPlan`
- 获取人事管理：`GET /api/web/getPersonnelEmp`
- 获取内部事务：`GET /api/web/getInternalAffairs`
- 获取经营管理：`GET /api/web/getBusinessManagement`

## 操作记录管理

### 添加操作记录
- **接口路径**: `POST /api/web/addAFollow`
- **请求参数**:
  ```typescript
  {
    CZR: string,      // 操作人
    CZSJ: string,     // 操作时间
    CZNR: string,     // 操作内容
    CZMK: string,     // 操作模块
  }
  ```
- **返回结果**: 基础响应格式

### 查询所有操作记录
- **接口路径**: `GET /api/web/SelectAllAFollow`
- **请求参数**:
  ```typescript
  {
    token: string,    // 固定token值
    page: number,     // 页码
    size: number      // 每页大小
  }
  ```
- **返回结果**: 操作记录列表

## 通用响应格式

所有API接口都遵循统一的响应格式：

```typescript
{
  data: any,          // 具体数据
  status: string,     // 状态码（"1"表示成功）
  error: string       // 错误信息（成功时为空）
}
```

## 基础配置

- **API基础URL**: 通过环境变量 `VITE_GLOB_API_URL` 配置，默认为 `http://192.168.0.120:8081`
- **请求客户端**: 使用 `@vben/request` 封装的请求客户端
- **Token处理**: 支持自动刷新token和认证过期处理
- **错误处理**: 统一的错误消息拦截和处理机制

## 注意事项

1. 大部分接口都需要传递token参数
2. 分页接口通常需要page和size参数
3. 搜索功能通过SearchKeyword参数实现
4. 所有时间字段使用ISO格式字符串
5. 状态码"1"表示操作成功，其他值表示失败
