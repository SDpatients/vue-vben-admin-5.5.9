# 用户协议管理 API 文档

> **日期：2026年5月11日**
>
> **基础路径：** `/api/v1/agreement`
>
> **统一返回格式：** `ApiResponse<T>`
>
> **认证说明：** 所有接口需要 JWT Token 认证（Header: `Authorization: Bearer {token}`）

---

## 目录

1. [协议类型说明](#协议类型说明)
2. [API 接口](#api-接口)
   - [1. 记录用户同意协议](#1-记录用户同意协议)
   - [2. 查询协议同意历史](#2-查询协议同意历史)
   - [3. 查询最新同意记录](#3-查询最新同意记录)
   - [4. 检查全部协议同意状态](#4-检查全部协议同意状态)
   - [5. 检查指定协议状态](#5-检查指定协议状态)
   - [6. 版本级别检查](#6-版本级别检查)

---

## 协议类型说明

| 协议类型值 | 说明 | 建议版本号 |
|-----------|------|-----------|
| `PRIVACY_POLICY` | 隐私政策 | `v1.0`, `v1.1`, `v2.0` 等 |
| `USER_AGREEMENT` | 用户协议 | `v1.0`, `v1.1`, `v2.0` 等 |

---

## API 接口

---

### 1. 记录用户同意协议

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/api/v1/agreement/agree` |
| **接口说明** | 记录用户对隐私政策或用户协议的同意操作，会保存当前时间、IP地址、协议版本和内容快照 |

**请求头**

| 字段 | 值 |
|------|-----|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer {token}` |

**请求参数（Body）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `agreementType` | String | 是 | 协议类型 | `"PRIVACY_POLICY"` 或 `"USER_AGREEMENT"` |
| `agreementVersion` | String | 是 | 协议版本号 | `"v1.0"`, `"v2.0"` |
| `agreed` | Boolean | 是 | 是否同意 | `true` |
| `agreementContent` | String | 否 | 协议内容快照（可选） | `"本隐私政策说明了我们如何收集、使用和保护您的个人信息..."` |

**请求示例**

```json
{
  "agreementType": "PRIVACY_POLICY",
  "agreementVersion": "v1.0",
  "agreed": true,
  "agreementContent": "本隐私政策说明了我们如何收集、使用和保护您的个人信息。..."
}
```

**成功响应示例（200 OK）**

```json
{
  "code": 200,
  "message": "协议同意记录成功",
  "data": {
    "id": 1,
    "userId": 123,
    "userAccount": "zhangsan",
    "agreementType": "PRIVACY_POLICY",
    "agreementVersion": "v1.0",
    "agreed": true,
    "agreementContent": "本隐私政策说明了我们如何收集、使用和保护您的个人信息。...",
    "ipAddress": "192.168.1.100",
    "agreeTime": "2026-05-11T10:30:00",
    "isDeleted": false,
    "createTime": "2026-05-11T10:30:00",
    "updateTime": "2026-05-11T10:30:00",
    "createUserId": 123,
    "updateUserId": 123
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 记录 ID |
| `userId` | Long | 用户 ID |
| `userAccount` | String | 用户账号 |
| `agreementType` | String | 协议类型 |
| `agreementVersion` | String | 协议版本 |
| `agreed` | Boolean | 是否同意 |
| `agreementContent` | String | 协议内容快照 |
| `ipAddress` | String | 同意时的 IP 地址 |
| `agreeTime` | LocalDateTime | 同意时间 |
| `createTime` | LocalDateTime | 创建时间 |
| `updateTime` | LocalDateTime | 更新时间 |

---

### 2. 查询协议同意历史

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/api/v1/agreement/history` |
| **接口说明** | 查询当前登录用户的所有协议同意历史记录，按时间倒序排列 |

**请求头**

| 字段 | 值 |
|------|-----|
| `Authorization` | `Bearer {token}` |

**请求参数**

无参数（仅需 Token）

**请求示例 URL**

```
GET /api/v1/agreement/history
```

**成功响应示例（200 OK）**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 2,
      "userId": 123,
      "userAccount": "zhangsan",
      "agreementType": "USER_AGREEMENT",
      "agreementVersion": "v1.0",
      "agreed": true,
      "agreementContent": "欢迎使用我们的法律破产管理系统...",
      "ipAddress": "192.168.1.100",
      "agreeTime": "2026-05-11T10:32:00",
      "isDeleted": false,
      "createTime": "2026-05-11T10:32:00",
      "updateTime": "2026-05-11T10:32:00",
      "createUserId": 123,
      "updateUserId": 123
    },
    {
      "id": 1,
      "userId": 123,
      "userAccount": "zhangsan",
      "agreementType": "PRIVACY_POLICY",
      "agreementVersion": "v1.0",
      "agreed": true,
      "agreementContent": "本隐私政策说明了我们如何收集、使用和保护您的个人信息...",
      "ipAddress": "192.168.1.100",
      "agreeTime": "2026-05-11T10:30:00",
      "isDeleted": false,
      "createTime": "2026-05-11T10:30:00",
      "updateTime": "2026-05-11T10:30:00",
      "createUserId": 123,
      "updateUserId": 123
    }
  ]
}
```

---

### 3. 查询最新同意记录

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/api/v1/agreement/latest` |
| **接口说明** | 查询当前登录用户对指定类型协议的最新一条同意记录 |

**请求头**

| 字段 | 值 |
|------|-----|
| `Authorization` | `Bearer {token}` |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `agreementType` | String | 是 | 协议类型 | `"PRIVACY_POLICY"` 或 `"USER_AGREEMENT"` |

**请求示例 URL**

```
GET /api/v1/agreement/latest?agreementType=PRIVACY_POLICY
```

**成功响应示例（200 OK，有记录）**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 123,
    "userAccount": "zhangsan",
    "agreementType": "PRIVACY_POLICY",
    "agreementVersion": "v1.0",
    "agreed": true,
    "agreementContent": "本隐私政策说明了我们如何收集、使用和保护您的个人信息...",
    "ipAddress": "192.168.1.100",
    "agreeTime": "2026-05-11T10:30:00",
    "isDeleted": false,
    "createTime": "2026-05-11T10:30:00",
    "updateTime": "2026-05-11T10:30:00",
    "createUserId": 123,
    "updateUserId": 123
  }
}
```

**成功响应示例（200 OK，无记录）**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 4. 检查全部协议同意状态

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/api/v1/agreement/check` |
| **接口说明** | 检查当前登录用户是否已同意隐私政策和用户协议，并返回所有状态聚合 |

**请求头**

| 字段 | 值 |
|------|-----|
| `Authorization` | `Bearer {token}` |

**请求参数**

无参数（仅需 Token）

**请求示例 URL**

```
GET /api/v1/agreement/check
```

**成功响应示例（200 OK）**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "agreements": {
      "PRIVACY_POLICY": true,
      "USER_AGREEMENT": true
    },
    "allAgreed": true,
    "checkTime": "2026-05-11T11:00:00"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `agreements` | Map<String, Boolean> | 各协议的同意状态（key 为协议类型，value 为是否同意） |
| `allAgreed` | Boolean | 是否所有协议都已同意 |
| `checkTime` | LocalDateTime | 检查时间 |

---

### 5. 检查指定协议状态

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/api/v1/agreement/check/{agreementType}` |
| **接口说明** | 检查当前登录用户是否已同意指定类型的协议 |

**请求头**

| 字段 | 值 |
|------|-----|
| `Authorization` | `Bearer {token}` |

**路径参数**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `agreementType` | String | 是 | 协议类型（路径参数） | `"PRIVACY_POLICY"` 或 `"USER_AGREEMENT"` |

**请求示例 URL**

```
GET /api/v1/agreement/check/PRIVACY_POLICY
GET /api/v1/agreement/check/USER_AGREEMENT
```

**成功响应示例（200 OK，已同意）**

```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

**成功响应示例（200 OK，未同意）**

```json
{
  "code": 200,
  "message": "success",
  "data": false
}
```

---

### 6. 版本级别检查

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/api/v1/agreement/version-check` |
| **接口说明** | 检查当前登录用户是否同意过指定版本的协议，适用于协议更新后要求用户重新同意的场景 |

**请求头**

| 字段 | 值 |
|------|-----|
| `Authorization` | `Bearer {token}` |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `agreementType` | String | 是 | 协议类型 | `"PRIVACY_POLICY"` 或 `"USER_AGREEMENT"` |
| `agreementVersion` | String | 是 | 协议版本 | `"v1.0"`, `"v2.0"` |

**请求示例 URL**

```
GET /api/v1/agreement/version-check?agreementType=PRIVACY_POLICY&agreementVersion=v1.0
```

**成功响应示例（200 OK，有该版本记录）**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 123,
    "userAccount": "zhangsan",
    "agreementType": "PRIVACY_POLICY",
    "agreementVersion": "v1.0",
    "agreed": true,
    "agreementContent": "本隐私政策说明了我们如何收集、使用和保护您的个人信息...",
    "ipAddress": "192.168.1.100",
    "agreeTime": "2026-05-11T10:30:00",
    "isDeleted": false,
    "createTime": "2026-05-11T10:30:00",
    "updateTime": "2026-05-11T10:30:00",
    "createUserId": 123,
    "updateUserId": 123
  }
}
```

**成功响应示例（200 OK，无该版本记录）**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 错误响应示例

所有接口在发生错误时返回以下格式：

**未登录或 Token 过期（401 Unauthorized）**

```json
{
  "code": 401,
  "message": "用户未登录或Token已过期",
  "data": null
}
```

**参数校验失败（400 Bad Request）**

```json
{
  "code": 400,
  "message": "agreementType不能为空",
  "data": null
}
```

**服务器错误（500 Internal Server Error）**

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

---

## 前端使用建议

### 典型登录流程

```
1. 用户输入账号密码
2. 登录成功获取 Token
3. 调用 /api/v1/agreement/check
   ├─ allAgreed = true → 进入主页面
   └─ allAgreed = false → 显示协议弹窗
      └─ 用户点击同意 → 调用 /api/v1/agreement/agree
```

### 协议更新流程

```
1. 系统更新隐私政策为 v2.0
2. 用户登录后调用 /api/v1/agreement/version-check?agreementType=PRIVACY_POLICY&agreementVersion=v2.0
   ├─ data 不为空 → 用户已同意新版本，正常使用
   └─ data = null → 提示用户阅读并同意新版本
```

---

## 数据库表说明

如需手动执行建表 SQL，请参考：[sql/user_agreement_record.sql](sql/user_agreement_record.sql)

---

## 相关文件

| 文件路径 | 说明 |
|---------|------|
| `src/main/java/com/lawbackend2/lawbackend2/controller/UserAgreementRecordController.java` | 控制器 |
| `src/main/java/com/lawbackend2/lawbackend2/entity/UserAgreementRecord.java` | 实体类 |
| `src/main/java/com/lawbackend2/lawbackend2/service/UserAgreementRecordService.java` | 服务接口 |
| `src/main/java/com/lawbackend2/lawbackend2/dto/AgreementRecordRequest.java` | 请求 DTO |
| `src/main/java/com/lawbackend2/lawbackend2/dto/AgreementCheckResponse.java` | 响应 DTO |
