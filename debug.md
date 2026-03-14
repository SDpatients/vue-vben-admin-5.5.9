## 管理人员工 API 接口文档

### 基础路径

```
/administrator/{administratorId}/
staff
```

### 1. 创建员工

请求

```
POST /administrator/
{administratorId}/staff
Content-Type: application/json
```

路径参数

参数 类型 必填 说明 administratorId Long 是 管理人ID

请求体

```
{
    "administratorId": 1,
    "name": "张三",
    "staffType": "LAWYER",
    "idNumber": 
    "310101199001011234",
    "lawyerLicenseNumber": 
    "13101202012345678",
    "contactPhone": "13800138000",
    "email": "zhangsan@example.com",
    "responsibility": "负责法律事务",
    "appointmentDate": "2024-01-15",
    "userId": 10
}
```

请求字段说明

字段 类型 必填 说明 administratorId Long 是 管理人ID name String 是 姓名 staffType String 是 人员类型 idNumber String 否 身份证号 lawyerLicenseNumber String 否 律师执业证号 contactPhone String 否 联系电话 email String 否 电子邮箱 responsibility String 否 职责 appointmentDate Date 否 任命日期 (格式: yyyy-MM-dd) userId Long 否 关联用户ID

返回示例

```
{
    "code": 200,
    "message": "success",
    "data": {
        "staffId": 15
    }
}
```

### 2. 员工列表

请求

```
GET /administrator/
{administratorId}/staff/list
```

路径参数

参数 类型 必填 说明 administratorId Long 是 管理人ID

返回示例

```
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 15,
            "administratorId": 1,
            "name": "张三",
            "staffType": "LAWYER",
            "idNumber": 
            "310101199001011234",
            "lawyerLicenseNumber": 
            "13101202012345678",
            "contactPhone": 
            "13800138000",
            "email": 
            "zhangsan@example.com",
            "responsibility": "负责
            法律事务",
            "appointmentDate": 
            "2024-01-15",
            "userId": 10,
            "status": "ACTIVE",
            "isDeleted": false,
            "createTime": 
            "2024-01-15T10:30:00",
            "updateTime": 
            "2024-01-15T10:30:00",
            "createUserId": 1,
            "updateUserId": 1
        },
        {
            "id": 16,
            "administratorId": 1,
            "name": "李四",
            "staffType": 
            "ACCOUNTANT",
            "idNumber": 
            "310101199205052345",
            "lawyerLicenseNumber": 
            null,
            "contactPhone": 
            "13900139000",
            "email": "lisi@example.
            com",
            "responsibility": "负责
            财务审计",
            "appointmentDate": 
            "2024-02-01",
            "userId": null,
            "status": "ACTIVE",
            "isDeleted": false,
            "createTime": 
            "2024-02-01T09:00:00",
            "updateTime": 
            "2024-02-01T09:00:00",
            "createUserId": 1,
            "updateUserId": 1
        }
    ]
}
```

### 3. 员工详情

请求

```
GET /administrator/
{administratorId}/staff/{staffId}
```

路径参数

参数 类型 必填 说明 administratorId Long 是 管理人ID staffId Long 是 员工ID

返回示例

```
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 15,
        "administratorId": 1,
        "name": "张三",
        "staffType": "LAWYER",
        "idNumber": 
        "310101199001011234",
        "lawyerLicenseNumber": 
        "13101202012345678",
        "contactPhone": 
        "13800138000",
        "email": "zhangsan@example.
        com",
        "responsibility": "负责法律事
        务",
        "appointmentDate": 
        "2024-01-15",
        "userId": 10,
        "status": "ACTIVE",
        "isDeleted": false,
        "createTime": 
        "2024-01-15T10:30:00",
        "updateTime": 
        "2024-01-15T10:30:00",
        "createUserId": 1,
        "updateUserId": 1
    }
}
```

### 4. 更新员工

请求

```
PUT /administrator/
{administratorId}/staff/{staffId}
Content-Type: application/json
```

路径参数

参数 类型 必填 说明 administratorId Long 是 管理人ID staffId Long 是 员工ID

请求体 （所有字段均为可选，只传需要更新的字段）

```
{
    "name": "张三（更新）",
    "staffType": "SENIOR_LAWYER",
    "idNumber": 
    "310101199001011234",
    "lawyerLicenseNumber": 
    "13101202012345678",
    "contactPhone": "13800138001",
    "email": "zhangsan_new@example.
    com",
    "responsibility": "负责法律事务及
    合规管理",
    "appointmentDate": "2024-03-01",
    "userId": 12
}
```

返回示例

```
{
    "code": 200,
    "message": "success",
    "data": null
}
```

### 5. 删除员工

请求

```
DELETE /administrator/
{administratorId}/staff/{staffId}
```

路径参数

参数 类型 必填 说明 administratorId Long 是 管理人ID staffId Long 是 员工ID

返回示例

```
{
    "code": 200,
    "message": "success",
    "data": null
}
```

## 📊 数据字典

### staffType 人员类型枚举值（建议）

值 说明 LAWYER 律师 SENIOR\_LAWYER 高级律师 ACCOUNTANT 会计师 ASSISTANT 助理 OTHER 其他

### status 状态枚举值

值 说明 ACTIVE 激活 INACTIVE 停用 DELETED 已删除

## 🔗 关联关系

- administratorId → tb\_administrator.id
- userId → tb\_user.id （可选，用于关联系统登录账号）

