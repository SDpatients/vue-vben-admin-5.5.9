# 用户登录信息记录功能设计文档

## 一、功能需求概述

用户登录后，调用后端接口，记录用户登录相关信息，包括：
- 用户基本信息（U_NAME、U_USER、U_PID等）
- 登录时间
- 登录地点（IP地址对应的地理位置）

## 二、数据库设计

### 1. 新增数据表：用户登录记录表（TB_LOGIN_RECORD）

**SQL Server 2008 CREATE语句：**

```sql
CREATE TABLE [dbo].[TB_LOGIN_RECORD] (
    [LOGIN_ID]          VARCHAR(36)     NOT NULL  PRIMARY KEY, -- 登录记录ID（UUID）
    [U_PID]             VARCHAR(36)     NOT NULL,              -- 用户ID（关联用户表）
    [U_USER]            VARCHAR(50)     NOT NULL,              -- 用户名
    [U_NAME]            VARCHAR(50)     NOT NULL,              -- 真实姓名
    [LOGIN_TIME]        DATETIME        NOT NULL,              -- 登录时间
    [LOGIN_IP]          VARCHAR(20)     NOT NULL,              -- 登录IP地址
    [LOGIN_LOCATION]    VARCHAR(100)    NULL,                 -- 登录地点（IP解析）
    [LOGIN_DEVICE]      VARCHAR(100)    NULL,                 -- 登录设备信息
    [LOGIN_BROWSER]     VARCHAR(100)    NULL,                 -- 登录浏览器信息
    [LOGIN_STATUS]      VARCHAR(10)     NOT NULL,              -- 登录状态（SUCCESS/FAIL）
    [ERROR_MSG]         VARCHAR(200)    NULL,                 -- 错误信息（登录失败时）
    [CREATE_TIME]       DATETIME        NOT NULL  DEFAULT GETDATE() -- 记录创建时间
);

-- 添加索引
CREATE INDEX [IDX_LOGIN_RECORD_USER] ON [dbo].[TB_LOGIN_RECORD]([U_PID], [LOGIN_TIME]);
CREATE INDEX [IDX_LOGIN_RECORD_TIME] ON [dbo].[TB_LOGIN_RECORD]([LOGIN_TIME]);
```

### 2. 表关系说明

- `TB_LOGIN_RECORD.U_PID` 关联 `用户表.U_PID`（外键关系，需根据实际用户表名调整）
- 登录记录ID使用UUID生成，确保唯一性
- 登录时间、创建时间使用数据库默认时间函数`GETDATE()`

## 三、SSM后端操作流程

### 1. 核心技术栈

- **框架**: Spring + SpringMVC + MyBatis
- **数据库**: SQL Server 2008
- **认证方式**: Token认证（Bearer Token）
- **IP解析**: 可使用第三方API（如高德地图、百度地图IP定位）或本地IP库

### 2. 后端操作详细流程

#### 步骤1：登录接口扩展

**文件位置**: `src/main/java/com/xxx/web/controller/AuthController.java`

- 在现有登录接口（`/api/web/login`）中，添加登录记录逻辑
- 登录成功后，调用登录记录服务保存登录信息
- 登录失败时，同样记录失败信息和错误原因

#### 步骤2：创建登录记录实体类

**文件位置**: `src/main/java/com/xxx/web/entity/LoginRecord.java`

```java
public class LoginRecord {
    private String loginId;      // 登录记录ID
    private String uPid;         // 用户ID
    private String uUser;        // 用户名
    private String uName;        // 真实姓名
    private Date loginTime;      // 登录时间
    private String loginIp;      // 登录IP
    private String loginLocation; // 登录地点
    private String loginDevice;  // 登录设备
    private String loginBrowser; // 登录浏览器
    private String loginStatus;  // 登录状态
    private String errorMsg;     // 错误信息
    private Date createTime;     // 创建时间
    
    //  getter/setter方法
}
```

#### 步骤3：创建Mapper接口和XML

**Mapper接口位置**: `src/main/java/com/xxx/web/mapper/LoginRecordMapper.java`

```java
public interface LoginRecordMapper {
    // 插入登录记录
    int insertLoginRecord(LoginRecord loginRecord);
    
    // 根据用户ID查询登录记录列表
    List<LoginRecord> selectLoginRecordsByUserId(@Param("uPid") String uPid);
    
    // 查询最新登录记录
    LoginRecord selectLastLoginRecord(@Param("uPid") String uPid);
}
```

**Mapper XML位置**: `src/main/resources/mapper/LoginRecordMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.xxx.web.mapper.LoginRecordMapper">
    <!-- 插入登录记录 -->
    <insert id="insertLoginRecord" parameterType="LoginRecord">
        INSERT INTO TB_LOGIN_RECORD (
            LOGIN_ID, U_PID, U_USER, U_NAME, LOGIN_TIME, LOGIN_IP, 
            LOGIN_LOCATION, LOGIN_DEVICE, LOGIN_BROWSER, LOGIN_STATUS, 
            ERROR_MSG, CREATE_TIME
        ) VALUES (
            #{loginId}, #{uPid}, #{uUser}, #{uName}, #{loginTime}, #{loginIp}, 
            #{loginLocation}, #{loginDevice}, #{loginBrowser}, #{loginStatus}, 
            #{errorMsg}, #{createTime}
        )
    </insert>
    
    <!-- 根据用户ID查询登录记录列表 -->
    <select id="selectLoginRecordsByUserId" resultType="LoginRecord">
        SELECT * FROM TB_LOGIN_RECORD 
        WHERE U_PID = #{uPid} 
        ORDER BY LOGIN_TIME DESC
    </select>
    
    <!-- 查询最新登录记录 -->
    <select id="selectLastLoginRecord" resultType="LoginRecord">
        SELECT TOP 1 * FROM TB_LOGIN_RECORD 
        WHERE U_PID = #{uPid} 
        ORDER BY LOGIN_TIME DESC
    </select>
</mapper>
```

#### 步骤4：创建Service层

**Service接口位置**: `src/main/java/com/xxx/web/service/LoginRecordService.java`

```java
public interface LoginRecordService {
    // 保存登录记录
    void saveLoginRecord(LoginRecord loginRecord);
    
    // 根据用户ID获取登录记录
    List<LoginRecord> getLoginRecordsByUserId(String uPid);
    
    // 获取用户最新登录记录
    LoginRecord getLastLoginRecord(String uPid);
}
```

**Service实现类位置**: `src/main/java/com/xxx/web/service/impl/LoginRecordServiceImpl.java`

```java
@Service
public class LoginRecordServiceImpl implements LoginRecordService {
    
    @Autowired
    private LoginRecordMapper loginRecordMapper;
    
    @Override
    public void saveLoginRecord(LoginRecord loginRecord) {
        loginRecordMapper.insertLoginRecord(loginRecord);
    }
    
    @Override
    public List<LoginRecord> getLoginRecordsByUserId(String uPid) {
        return loginRecordMapper.selectLoginRecordsByUserId(uPid);
    }
    
    @Override
    public LoginRecord getLastLoginRecord(String uPid) {
        return loginRecordMapper.selectLastLoginRecord(uPid);
    }
}
```

#### 步骤5：添加IP解析工具类

**文件位置**: `src/main/java/com/xxx/web/utils/IpUtils.java`

- 实现IP地址解析为地理位置功能
- 可集成第三方API（如高德地图IP定位）或使用本地IP库
- 示例代码（使用高德地图API）：

```java
public class IpUtils {
    // 高德地图API密钥
    private static final String AMAP_KEY = "your_amap_key";
    
    // 根据IP获取地理位置
    public static String getLocationByIp(String ip) {
        // 调用高德地图IP定位API
        // 示例URL: https://restapi.amap.com/v3/ip?ip=114.114.114.114&key=your_key
        // 解析返回结果，获取省份、城市等信息
        // 返回格式："北京市北京市"
        return "";
    }
}
```

#### 步骤6：修改登录Controller，添加登录记录

**文件位置**: `src/main/java/com/xxx/web/controller/AuthController.java`

```java
@Controller
@RequestMapping("/api/web")
public class AuthController {
    
    @Autowired
    private LoginRecordService loginRecordService;
    
    @PostMapping("/login")
    @ResponseBody
    public Result login(@RequestBody LoginParam param, HttpServletRequest request) {
        // 1. 获取登录IP
        String loginIp = IpUtils.getClientIp(request);
        // 2. 获取设备信息
        String userAgent = request.getHeader("User-Agent");
        // 解析设备和浏览器信息
        String device = "";
        String browser = "";
        
        try {
            // 3. 执行登录逻辑（现有代码）
            // ...
            
            // 4. 登录成功，保存登录记录
            LoginRecord loginRecord = new LoginRecord();
            loginRecord.setLoginId(UUID.randomUUID().toString());
            loginRecord.setuPid(user.getuPid()); // user为登录成功后获取的用户信息
            loginRecord.setuUser(param.getUsername());
            loginRecord.setuName(user.getuName());
            loginRecord.setLoginTime(new Date());
            loginRecord.setLoginIp(loginIp);
            loginRecord.setLoginLocation(IpUtils.getLocationByIp(loginIp));
            loginRecord.setLoginDevice(device);
            loginRecord.setLoginBrowser(browser);
            loginRecord.setLoginStatus("SUCCESS");
            loginRecord.setCreateTime(new Date());
            
            loginRecordService.saveLoginRecord(loginRecord);
            
            return Result.success("登录成功", userInfo);
        } catch (Exception e) {
            // 5. 登录失败，保存失败记录
            LoginRecord loginRecord = new LoginRecord();
            loginRecord.setLoginId(UUID.randomUUID().toString());
            loginRecord.setuUser(param.getUsername());
            loginRecord.setLoginTime(new Date());
            loginRecord.setLoginIp(loginIp);
            loginRecord.setLoginLocation(IpUtils.getLocationByIp(loginIp));
            loginRecord.setLoginDevice(device);
            loginRecord.setLoginBrowser(browser);
            loginRecord.setLoginStatus("FAIL");
            loginRecord.setErrorMsg(e.getMessage());
            loginRecord.setCreateTime(new Date());
            
            loginRecordService.saveLoginRecord(loginRecord);
            
            return Result.error("登录失败", e.getMessage());
        }
    }
}
```

#### 步骤7：添加获取登录记录的API

**文件位置**: `src/main/java/com/xxx/web/controller/UserController.java`

```java
@PostMapping("/getLoginRecords")
@ResponseBody
public Result getLoginRecords(@RequestBody Map<String, String> params) {
    String uPid = params.get("uPid");
    List<LoginRecord> loginRecords = loginRecordService.getLoginRecordsByUserId(uPid);
    return Result.success("获取登录记录成功", loginRecords);
}

@PostMapping("/getLastLoginRecord")
@ResponseBody
public Result getLastLoginRecord(@RequestBody Map<String, String> params) {
    String uPid = params.get("uPid");
    LoginRecord lastLoginRecord = loginRecordService.getLastLoginRecord(uPid);
    return Result.success("获取最新登录记录成功", lastLoginRecord);
}
```

### 3. 配置文件调整

- 在 `application.properties` 或 `application.yml` 中添加IP解析API密钥配置
- 确保MyBatis配置中包含新创建的Mapper扫描路径

### 4. 异常处理

- 添加IP解析失败的异常处理，确保不影响登录主流程
- 登录记录保存失败时，记录日志但不影响登录结果

## 四、前端调用示例

### 1. 登录后获取用户信息和登录记录

```javascript
// 登录成功后
loginApi(params).then(res => {
    // 保存用户信息到本地
    localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo));
    
    // 调用API获取登录记录
    getLastLoginRecordApi({
        uPid: res.data.userInfo.uPid
    }).then(loginRes => {
        // 保存最新登录记录
        localStorage.setItem('lastLoginRecord', JSON.stringify(loginRes.data));
    });
});
```

### 2. 在用户中心展示登录记录

```vue
<template>
    <div class="user-login-records">
        <h3>登录记录</h3>
        <el-table :data="loginRecords">
            <el-table-column prop="loginTime" label="登录时间" />
            <el-table-column prop="loginIp" label="登录IP" />
            <el-table-column prop="loginLocation" label="登录地点" />
            <el-table-column prop="loginDevice" label="登录设备" />
            <el-table-column prop="loginStatus" label="登录状态" />
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getLoginRecordsApi } from '@/api/user';

const loginRecords = ref([]);

onMounted(() => {
    // 获取当前用户ID
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    // 调用API获取登录记录
    getLoginRecordsApi({ uPid: userInfo.uPid }).then(res => {
        loginRecords.value = res.data;
    });
});
</script>
```

## 五、安全性考虑

1. **IP地址保护**: 登录记录中的IP地址属于用户隐私，需注意保护
2. **数据加密**: 敏感信息（如用户ID）在传输过程中需加密
3. **权限控制**: 获取登录记录API需验证用户身份，确保只能查询自己的登录记录
4. **日志管理**: 定期清理过期登录记录，避免数据过大
5. **API限流**: 对登录记录查询API设置限流，防止恶意请求

## 六、测试要点

1. 登录成功时，验证登录记录是否正确插入
2. 登录失败时，验证失败记录是否正确插入
3. IP地址解析是否准确
4. 设备和浏览器信息解析是否正确
5. 获取登录记录API是否能正确返回数据
6. 多用户登录时，记录是否相互隔离

## 七、总结

通过以上设计，实现了用户登录信息的完整记录功能，包括：

1. **数据库层面**: 新增了登录记录表，用于存储用户登录的详细信息
2. **后端层面**: 扩展了登录接口，添加了登录记录保存逻辑，实现了IP解析和设备信息获取
3. **前端层面**: 提供了获取登录记录的API，可在用户中心展示登录历史

该功能能够有效记录用户登录行为，便于系统管理员进行安全审计和用户行为分析。
