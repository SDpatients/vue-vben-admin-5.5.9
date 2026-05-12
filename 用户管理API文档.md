# 用户管理API文档

> 本文档面向**前端管理员**，提供用户管理及用户角色控制相关API接口说明。  
> **重要规则**：管理员仅可**新增**和**删除**用户，不可修改用户信息。删除用户及分配管理员角色需进行二次校验。

---

## 一、接口总览

### 1.1 用户管理

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 新增用户 | POST | `/users` | `system:user:add` | 创建新用户，分配角色仅限律师或管理员 |
| 用户列表 | GET | `/users` | 无（登录即可） | 分页查询用户列表，支持搜索和筛选 |
| 用户详情 | GET | `/users/{id}` | `system:user:query` | 根据ID查询单个用户 |
| 删除用户 | DELETE | `/users/{id}` | `system:user:delete` | 逻辑删除，**需二次校验** |
| 管理员列表 | GET | `/users/admins` | 无（登录即可） | 获取所有管理员用户 |

### 1.2 用户角色控制

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 用户角色列表 | GET | `/user-roles/list` | `system:user:query` | 获取所有用户及其关联角色 |
| 分配角色 | POST | `/user-roles/{userId}/roles` | `system:user:assign` | 为用户分配角色，**仅限律师/管理员** |
| 查询用户角色 | GET | `/user-roles/{userId}/roles` | `system:user:query` | 查询指定用户的角色ID列表 |
| 移除角色 | DELETE | `/user-roles/{userId}/roles` | `system:user:assign` | 移除用户指定角色 |
| 清空角色 | DELETE | `/user-roles/{userId}/roles/all` | `system:user:assign` | 清空用户所有角色 |

### 1.3 角色查询（辅助）

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 角色列表 | GET | `/roles` | `system:role:query` | 获取可选角色列表，用于分配角色时展示 |

---

## 二、通用说明

### 2.1 请求头

所有接口需携带认证Token：

```
Authorization: Bearer {token}
```

### 2.2 通用响应格式

所有接口统一使用以下响应格式：

```json
{
    "code": 200,
    "message": "success",
    "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object/Array/null | 响应数据体 |

### 2.3 用户状态枚举

| 值 | 说明 |
|------|------|
| `ACTIVE` | 正常/激活 |
| `INACTIVE` | 未激活 |
| `LOCKED` | 已锁定 |
| `DELETED` | 已删除（逻辑删除） |

---

## 三、用户管理 API 详情

### 3.1 新增用户

> ⚠️ **规则说明**：  
> - 分配的角色仅允许「律师（LAWYER）」或「管理员（ADMIN）」  
> - 若分配管理员角色，**前端需弹出二次确认**，提示用户确认后再调用本接口  
> - 建议前端在调用本接口前先调用「角色列表」接口获取可选角色供下拉选择

**接口地址**：`POST /users`

**权限**：`system:user:add`

**请求体**：

```json
{
    "username": "zhangsan",
    "password": "Abc12345",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "status": "ACTIVE"
}
```

**请求参数**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|------|------|
| username | String | 是 | 不能为空 | 用户名 |
| password | String | 是 | 不能为空 | 密码 |
| realName | String | 否 | - | 真实姓名 |
| mobile | String | 否 | - | 手机号 |
| email | String | 否 | - | 邮箱 |
| phone | String | 否 | - | 座机号 |
| status | String | 否 | - | 状态，默认ACTIVE |

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1001,
        "username": "zhangsan",
        "realName": "张三",
        "mobile": "138****8000",
        "email": "zhangsan@example.com",
        "phone": "010-****5678",
        "isValid": "Y",
        "status": "ACTIVE",
        "loginType": "N",
        "lastLoginTime": null,
        "lastLoginIp": null,
        "loginCount": 0,
        "createTime": "2026-05-12T10:30:00",
        "updateTime": "2026-05-12T10:30:00"
    }
}
```

**注意**：新增用户后，需**额外调用** [3.5 为用户分配角色](#35-为用户分配角色) 接口完成角色绑定。

---

### 3.2 获取用户列表

**接口地址**：`GET /users`

**权限**：登录即可（无 @PreAuthorize）

**请求参数**（Query String）：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页数量 |
| sortField | String | 否 | createTime | 排序字段 |
| sortOrder | String | 否 | DESC | 排序方向（ASC/DESC） |
| keyword | String | 否 | - | 搜索关键词（匹配用户名/真实姓名/手机号/邮箱） |
| status | String | 否 | - | 用户状态筛选 |

**请求示例**：

```
GET /users?page=1&size=10&keyword=张三&status=ACTIVE&sortField=createTime&sortOrder=DESC
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 100,
        "page": 1,
        "size": 10,
        "totalPages": 10,
        "users": [
            {
                "id": 1001,
                "username": "zhangsan",
                "realName": "张三",
                "mobile": "138****8000",
                "email": "zhangsan@example.com",
                "phone": "010-****5678",
                "isValid": "Y",
                "status": "ACTIVE",
                "loginType": "N",
                "lastLoginTime": "2026-05-11T18:00:00",
                "lastLoginIp": "192.168.1.100",
                "loginCount": 25,
                "createTime": "2026-01-15T10:30:00",
                "updateTime": "2026-05-11T18:00:00"
            }
        ]
    }
}
```

**响应字段说明**（UserListResponse）：

| 字段 | 类型 | 说明 |
|------|------|------|
| total | Long | 总记录数 |
| page | Integer | 当前页码 |
| size | Integer | 每页数量 |
| totalPages | Integer | 总页数 |
| users | List\<UserResponse\> | 用户列表 |

**用户对象字段说明**（UserResponse）：

| 字段 | 类型 | 说明 | 备注 |
|------|------|------|------|
| id | Long | 用户ID | - |
| username | String | 用户名 | - |
| realName | String | 真实姓名 | - |
| mobile | String | 手机号 | **脱敏展示**（138****8000） |
| email | String | 邮箱 | - |
| phone | String | 座机号 | **脱敏展示**（010-****5678） |
| isValid | Character | 有效标识 | Y=有效, N=无效 |
| status | String | 状态 | ACTIVE/INACTIVE/LOCKED/DELETED |
| loginType | Character | 登录类型 | - |
| lastLoginTime | LocalDateTime | 最后登录时间 | - |
| lastLoginIp | String | 最后登录IP | - |
| loginCount | Integer | 登录次数 | - |
| createTime | LocalDateTime | 创建时间 | - |
| updateTime | LocalDateTime | 更新时间 | - |

---

### 3.3 获取用户详情

**接口地址**：`GET /users/{id}`

**权限**：`system:user:query`

**路径参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |

**请求示例**：

```
GET /users/1001
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1001,
        "username": "zhangsan",
        "realName": "张三",
        "mobile": "138****8000",
        "email": "zhangsan@example.com",
        "phone": "010-****5678",
        "isValid": "Y",
        "status": "ACTIVE",
        "loginType": "N",
        "lastLoginTime": "2026-05-11T18:00:00",
        "lastLoginIp": "192.168.1.100",
        "loginCount": 25,
        "createTime": "2026-01-15T10:30:00",
        "updateTime": "2026-05-11T18:00:00"
    }
}
```

---

### 3.4 删除用户

> ⚠️ **二次校验规则**：  
> 调用本接口前，前端**必须弹出二次确认弹窗**，要求管理员确认删除操作。  
> 建议弹窗内容：「确定要删除用户 [张三]（ID: 1001）吗？删除后该用户将无法登录系统，此操作不可恢复。」

**接口地址**：`DELETE /users/{id}`

**权限**：`system:user:delete`

**路径参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |

**请求示例**：

```
DELETE /users/1001
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

**说明**：本接口为逻辑删除（将用户状态标记为 DELETED），不会物理删除数据库记录。

---

### 3.5 获取管理员列表

**接口地址**：`GET /users/admins`

**权限**：登录即可（无 @PreAuthorize）

**请求示例**：

```
GET /users/admins
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "username": "admin",
            "realName": "系统管理员",
            "mobile": "139****9000",
            "email": "admin@example.com",
            "phone": "010-****0001",
            "isValid": "Y",
            "status": "ACTIVE",
            "loginType": "A",
            "lastLoginTime": "2026-05-12T09:00:00",
            "lastLoginIp": "192.168.1.1",
            "loginCount": 120,
            "createTime": "2025-01-01T00:00:00",
            "updateTime": "2026-05-12T09:00:00"
        }
    ]
}
```

---

## 四、用户角色控制 API 详情

### 4.1 获取用户角色总览列表

**接口地址**：`GET /user-roles/list`

**权限**：`system:user:query`

**请求示例**：

```
GET /user-roles/list
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1001,
            "username": "zhangsan",
            "realName": "张三",
            "mobile": "138****8000",
            "email": "zhangsan@example.com",
            "phone": "010-****5678",
            "isValid": "Y",
            "status": "ACTIVE",
            "loginType": "N",
            "lastLoginTime": "2026-05-11T18:00:00",
            "lastLoginIp": "192.168.1.100",
            "loginCount": 25,
            "createTime": "2026-01-15T10:30:00",
            "updateTime": "2026-05-11T18:00:00",
            "roles": [
                {
                    "id": 2,
                    "roleCode": "LAWYER",
                    "roleName": "律师",
                    "roleDesc": "律师角色，可处理案件相关操作",
                    "isSystem": "Y",
                    "status": "ACTIVE",
                    "sortOrder": 2
                }
            ]
        }
    ]
}
```

**角色信息字段说明**（RoleInfo）：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 角色ID |
| roleCode | String | 角色编码（如 LAWYER、ADMIN） |
| roleName | String | 角色名称（如 律师、管理员） |
| roleDesc | String | 角色描述 |
| isSystem | Character | 是否系统内置角色（Y/N） |
| status | String | 角色状态 |
| sortOrder | Integer | 排序号 |

---

### 4.2 为用户分配角色

> ⚠️ **规则说明**：  
> - 仅允许分配「律师（LAWYER）」或「管理员（ADMIN）」角色  
> - **若分配管理员角色，前端需弹出二次确认**：「确定要将用户 [张三] 设为管理员吗？管理员拥有系统最高权限。」  
> - 前端应在下拉/多选组件中仅展示 LAWYER 和 ADMIN 角色，或在前端做校验拦截

**接口地址**：`POST /user-roles/{userId}/roles`

**权限**：`system:user:assign`

**路径参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | Long | 是 | 用户ID |

**请求体**：

```json
{
    "roleIds": [2]
}
```

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleIds | List\<Long\> | 是 | 角色ID列表，不可为空 |

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 4.3 查询用户已分配角色

**接口地址**：`GET /user-roles/{userId}/roles`

**权限**：`system:user:query`

**路径参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | Long | 是 | 用户ID |

**请求示例**：

```
GET /user-roles/1001/roles
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": [2, 5]
}
```

**说明**：返回该用户当前拥有的角色ID列表。

---

### 4.4 移除用户角色

**接口地址**：`DELETE /user-roles/{userId}/roles`

**权限**：`system:user:assign`

**路径参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | Long | 是 | 用户ID |

**请求体**：

```json
{
    "roleIds": [2]
}
```

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleIds | List\<Long\> | 是 | 要移除的角色ID列表 |

**请求示例**：

```
DELETE /user-roles/1001/roles
Content-Type: application/json

{
    "roleIds": [2]
}
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 4.5 清空用户所有角色

> ⚠️ 谨慎使用，清空后用户将失去所有权限。

**接口地址**：`DELETE /user-roles/{userId}/roles/all`

**权限**：`system:user:assign`

**路径参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | Long | 是 | 用户ID |

**请求示例**：

```
DELETE /user-roles/1001/roles/all
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

## 五、角色查询 API（辅助参考）

### 5.1 获取角色列表

> 用于前端分配角色时展示可选角色下拉列表。

**接口地址**：`GET /roles`

**权限**：`system:role:query`

**请求参数**（Query String）：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页数量 |
| sortField | String | 否 | sortOrder | 排序字段 |
| sortOrder | String | 否 | ASC | 排序方向 |
| keyword | String | 否 | - | 搜索关键词 |
| status | String | 否 | - | 角色状态筛选 |

**请求示例**：

```
GET /roles?status=ACTIVE&size=50
```

**响应示例**：

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 2,
        "page": 1,
        "size": 50,
        "totalPages": 1,
        "roles": [
            {
                "id": 2,
                "roleCode": "LAWYER",
                "roleName": "律师",
                "roleDesc": "律师角色，可处理案件相关操作",
                "isSystem": "Y",
                "status": "ACTIVE",
                "sortOrder": 2,
                "createTime": "2025-01-01T00:00:00",
                "updateTime": "2025-01-01T00:00:00",
                "createUserId": 1,
                "updateUserId": 1,
                "permissionIds": [10, 11, 12],
                "permissionCount": 3
            },
            {
                "id": 1,
                "roleCode": "ADMIN",
                "roleName": "管理员",
                "roleDesc": "系统管理员，拥有所有权限",
                "isSystem": "Y",
                "status": "ACTIVE",
                "sortOrder": 1,
                "createTime": "2025-01-01T00:00:00",
                "updateTime": "2025-01-01T00:00:00",
                "createUserId": 1,
                "updateUserId": 1,
                "permissionIds": [1, 2, 3, 4, 5],
                "permissionCount": 5
            }
        ]
    }
}
```

---

## 六、前端操作流程

### 6.1 新增用户流程

```
1. 管理员打开新增用户表单
       │
       ▼
2. 调用 GET /roles?status=ACTIVE 获取可选角色列表
       │
       ▼
3. 前端过滤：仅展示 LAWYER 和 ADMIN 角色供选择
       │
       ▼
4. 管理员填写用户信息，选择角色
       │
       ├── 选择了 ADMIN 角色
       │       │
       │       ▼
       │   弹出二次确认弹窗：
       │   "确定要将该用户设为管理员吗？管理员拥有系统最高权限。"
       │       │
       │       ├── 取消 → 返回表单继续编辑
       │       │
       │       └── 确认 → 继续
       │
       ▼
5. 调用 POST /users 创建用户，获取返回的 userId
       │
       ▼
6. 调用 POST /user-roles/{userId}/roles 为用户分配角色
       │
       ▼
7. 提示"新增成功"，跳转回用户列表
```

### 6.2 删除用户流程

```
1. 管理员在用户列表中点击删除按钮
       │
       ▼
2. 弹出二次确认弹窗：
   "确定要删除用户 [张三]（ID: 1001）吗？删除后该用户将无法登录系统。"
       │
       ├── 取消 → 关闭弹窗
       │
       └── 确认 → 继续
              │
              ▼
       3. 调用 DELETE /users/{id}
              │
              ▼
       4. 刷新用户列表，提示"删除成功"
```

### 6.3 为用户分配/修改角色流程

```
1. 管理员在用户详情/列表中点击「角色管理」
       │
       ▼
2. 调用 GET /user-roles/{userId}/roles 获取用户当前角色
   调用 GET /roles?status=ACTIVE 获取所有可选角色
       │
       ▼
3. 前端展示角色多选列表（仅 LAWYER 和 ADMIN 可选）
       │
       ▼
4. 管理员勾选/取消角色
       │
       ├── 勾选了 ADMIN 角色
       │       │
       │       ▼
       │   弹出二次确认弹窗：
       │   "确定要将用户 [张三] 设为管理员吗？管理员拥有系统最高权限。"
       │       │
       │       ├── 取消 → 恢复勾选状态
       │       │
       │       └── 确认 → 继续
       │
       ▼
5. 调用 POST /user-roles/{userId}/roles 或
   DELETE /user-roles/{userId}/roles
       │
       ▼
6. 提示"操作成功"，刷新角色信息
```

---

## 七、前端代码示例（uni-app）

### 7.1 新增用户完整示例

```javascript
// 新增用户页面
export default {
    data() {
        return {
            form: {
                username: '',
                password: '',
                realName: '',
                mobile: '',
                email: '',
                phone: '',
                status: 'ACTIVE'
            },
            roleList: [],        // 所有角色
            selectedRoleIds: [], // 已选角色ID
            submiting: false
        }
    },
    async onLoad() {
        await this.loadRoles();
    },
    methods: {
        // 加载可选角色（仅LAWYER和ADMIN）
        async loadRoles() {
            try {
                const res = await uni.request({
                    url: this.$apiBase + '/roles',
                    method: 'GET',
                    data: { status: 'ACTIVE', size: 50 },
                    header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
                });
                if (res.data.code === 200) {
                    const allRoles = res.data.data.roles || [];
                    // 仅保留LAWYER和ADMIN
                    this.roleList = allRoles.filter(
                        r => r.roleCode === 'LAWYER' || r.roleCode === 'ADMIN'
                    );
                }
            } catch (e) {
                console.error('加载角色失败', e);
            }
        },
        
        // 提交新增用户
        async submitCreate() {
            if (this.submiting) return;
            
            // 检查是否选择了管理员角色
            const adminRole = this.roleList.find(r => r.roleCode === 'ADMIN');
            const hasAdmin = adminRole && this.selectedRoleIds.includes(adminRole.id);
            
            // 管理员角色 → 二次确认
            if (hasAdmin) {
                const confirmed = await this.showConfirm(
                    '确定要将该用户设为管理员吗？管理员拥有系统最高权限。'
                );
                if (!confirmed) return;
            }
            
            this.submiting = true;
            try {
                // 1. 创建用户
                const createRes = await uni.request({
                    url: this.$apiBase + '/users',
                    method: 'POST',
                    data: this.form,
                    header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
                });
                
                if (createRes.data.code !== 200) {
                    uni.showToast({ title: createRes.data.message || '创建失败', icon: 'none' });
                    return;
                }
                
                const userId = createRes.data.data.id;
                
                // 2. 分配角色
                if (this.selectedRoleIds.length > 0) {
                    await uni.request({
                        url: this.$apiBase + `/user-roles/${userId}/roles`,
                        method: 'POST',
                        data: { roleIds: this.selectedRoleIds },
                        header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
                    });
                }
                
                uni.showToast({ title: '新增成功', icon: 'success' });
                setTimeout(() => uni.navigateBack(), 1500);
            } catch (e) {
                console.error('新增用户失败', e);
                uni.showToast({ title: '新增失败', icon: 'none' });
            } finally {
                this.submiting = false;
            }
        },
        
        showConfirm(content) {
            return new Promise((resolve) => {
                uni.showModal({
                    title: '操作确认',
                    content: content,
                    success: (res) => resolve(res.confirm)
                });
            });
        }
    }
}
```

### 7.2 删除用户（带二次校验）

```javascript
methods: {
    async deleteUser(user) {
        const confirmed = await new Promise((resolve) => {
            uni.showModal({
                title: '删除确认',
                content: `确定要删除用户「${user.realName || user.username}」（ID: ${user.id}）吗？\n删除后该用户将无法登录系统。`,
                success: (res) => resolve(res.confirm)
            });
        });
        
        if (!confirmed) return;
        
        try {
            const res = await uni.request({
                url: this.$apiBase + `/users/${user.id}`,
                method: 'DELETE',
                header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
            });
            
            if (res.data.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadUserList(); // 刷新列表
            } else {
                uni.showToast({ title: res.data.message || '删除失败', icon: 'none' });
            }
        } catch (e) {
            console.error('删除用户失败', e);
            uni.showToast({ title: '删除失败', icon: 'none' });
        }
    }
}
```

### 7.3 用户角色管理页面

```javascript
export default {
    data() {
        return {
            userId: 0,
            allRoles: [],           // 所有可选角色（仅LAWYER/ADMIN）
            currentRoleIds: [],     // 当前用户的角色
            pendingAssign: [],      // 待分配的
            pendingRemove: []       // 待移除的
        }
    },
    async onLoad(options) {
        this.userId = Number(options.userId);
        await Promise.all([
            this.loadAllRoles(),
            this.loadUserRoles()
        ]);
    },
    
    async loadAllRoles() {
        const res = await uni.request({
            url: this.$apiBase + '/roles',
            method: 'GET',
            data: { status: 'ACTIVE', size: 50 },
            header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
        });
        if (res.data.code === 200) {
            this.allRoles = (res.data.data.roles || []).filter(
                r => r.roleCode === 'LAWYER' || r.roleCode === 'ADMIN'
            );
        }
    },
    
    async loadUserRoles() {
        const res = await uni.request({
            url: this.$apiBase + `/user-roles/${this.userId}/roles`,
            method: 'GET',
            header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
        });
        if (res.data.code === 200) {
            this.currentRoleIds = res.data.data || [];
        }
    },
    
    // 切换角色勾选
    onRoleToggle(roleId) {
        const isAdmin = this.allRoles.find(r => r.id === roleId)?.roleCode === 'ADMIN';
        const isAdding = !this.currentRoleIds.includes(roleId);
        
        // 添加管理员角色 → 二次确认
        if (isAdding && isAdmin) {
            uni.showModal({
                title: '操作确认',
                content: '确定要将该用户设为管理员吗？管理员拥有系统最高权限。',
                success: async (res) => {
                    if (res.confirm) {
                        this.doAssignRole(roleId);
                    }
                }
            });
            return;
        }
        
        if (isAdding) {
            this.doAssignRole(roleId);
        } else {
            uni.showModal({
                title: '移除确认',
                content: '确定要移除该角色吗？',
                success: async (res) => {
                    if (res.confirm) {
                        this.doRemoveRole(roleId);
                    }
                }
            });
        }
    },
    
    async doAssignRole(roleId) {
        try {
            await uni.request({
                url: this.$apiBase + `/user-roles/${this.userId}/roles`,
                method: 'POST',
                data: { roleIds: [roleId] },
                header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
            });
            this.currentRoleIds.push(roleId);
            uni.showToast({ title: '角色已分配', icon: 'success' });
        } catch (e) {
            uni.showToast({ title: '分配失败', icon: 'none' });
        }
    },
    
    async doRemoveRole(roleId) {
        try {
            await uni.request({
                url: this.$apiBase + `/user-roles/${this.userId}/roles`,
                method: 'DELETE',
                data: { roleIds: [roleId] },
                header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') }
            });
            this.currentRoleIds = this.currentRoleIds.filter(id => id !== roleId);
            uni.showToast({ title: '角色已移除', icon: 'success' });
        } catch (e) {
            uni.showToast({ title: '移除失败', icon: 'none' });
        }
    }
}
```

---

## 八、关键业务规则总结

| 规则 | 说明 | 前端实现 |
|------|------|------|
| **不可修改用户** | 管理员只能新增和删除，不能修改用户信息 | 用户列表不展示编辑按钮，详情页只读 |
| **删除二次校验** | 删除用户前必须弹窗确认 | 调用 `uni.showModal` 二次确认后调用 API |
| **角色仅限律师/管理员** | 新增用户时只能分配 LAWVYER 或 ADMIN 角色 | 前端过滤角色列表，仅展示这两种 |
| **管理员二次校验** | 分配 ADMIN 角色时需额外弹窗确认 | 检测到 ADMIN 角色时弹出二次确认 |
| **逻辑删除** | 删除操作为逻辑删除，不物理删除数据 | - |

---

## 九、错误码说明

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 参数校验失败 | 提示用户修正输入 |
| 401 | 未登录或Token失效 | 跳转登录页面 |
| 403 | 无权限 | 提示"无权限执行此操作" |
| 500 | 服务器错误 | 提示用户稍后重试 |