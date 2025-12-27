# 后端API更新方案 - 文件上传模块分离

## 1. 概述

当前CASE_FILES表同时管理了任务管理和按键管理两个模块的文件上传，导致数据混乱。本方案将更新后端API，支持通过MODULE_TYPE字段区分不同模块的文件。

## 2. 修改内容

### 2.1 文件上传API (`/api/web/uploadCaseFile`)

**修改前：**
- 接收参数：`token`, `SEP_ID`, `file`
- 保存逻辑：直接保存到CASE_FILES表，不区分模块

**修改后：**
- 接收参数：`token`, `SEP_ID`, `file`, `moduleType`（新增，默认值：`task`）
- 保存逻辑：
  - 将`moduleType`参数值保存到CASE_FILES表的MODULE_TYPE字段
  - 支持的值：`task`（任务管理）、`key`（按键管理）

### 2.2 批量文件上传API (`/api/web/batchUploadCaseFiles`)

**修改前：**
- 接收参数：`token`, `SEP_ID`, `files`
- 保存逻辑：直接保存到CASE_FILES表，不区分模块

**修改后：**
- 接收参数：`token`, `SEP_ID`, `files`, `moduleType`（新增，默认值：`task`）
- 保存逻辑：
  - 为每个文件添加MODULE_TYPE字段值
  - 支持的值：`task`（任务管理）、`key`（按键管理）

### 2.3 文件列表查询API (`/api/web/getCaseFiles`)

**修改前：**
- 接收参数：`token`, `SEP_ID`或`case_id`
- 查询逻辑：返回所有匹配的文件，不区分模块

**修改后：**
- 接收参数：`token`, `SEP_ID`或`case_id`, `moduleType`（新增，可选）
- 查询逻辑：
  - 如果提供了`moduleType`参数，只返回对应模块的文件
  - 如果未提供`moduleType`参数，返回所有匹配的文件

### 2.4 文件删除API (`/api/web/deleteCaseFile/{fileId}`)

**修改前：**
- 接收参数：`token`, `fileId`
- 删除逻辑：直接删除对应文件

**修改后：**
- 接收参数：`token`, `fileId`
- 删除逻辑：
  - 验证文件是否存在
  - 可以选择性地添加模块类型验证

## 3. 数据库操作示例

### 3.1 保存文件时添加模块类型

```java
// 假设使用Spring Boot + MyBatis
@Insert("INSERT INTO CASE_FILES (SEP_ID, case_id, file_name, file_path, MODULE_TYPE, ...) VALUES (#{sepId}, #{caseId}, #{fileName}, #{filePath}, #{moduleType}, ...)")
void insertCaseFile(CaseFile caseFile);
```

### 3.2 查询文件时按模块类型过滤

```java
// 假设使用Spring Boot + MyBatis
@Select("SELECT * FROM CASE_FILES WHERE SEP_ID = #{sepId} AND MODULE_TYPE = #{moduleType} AND is_deleted = '0'")
List<CaseFile> getCaseFilesBySepIdAndModuleType(@Param("sepId") String sepId, @Param("moduleType") String moduleType);
```

## 4. 代码修改建议

1. **添加模块类型枚举**
   ```java
   public enum ModuleType {
       TASK("task"),
       KEY("key");
       
       private String value;
       
       ModuleType(String value) {
           this.value = value;
       }
       
       public String getValue() {
           return value;
       }
   }
   ```

2. **更新CaseFile实体类**
   ```java
   public class CaseFile {
       // 现有字段
       private String sepId;
       private String caseId;
       private String fileName;
       private String filePath;
       
       // 新增字段
       private String moduleType;
       
       // getter和setter
   }
   ```

3. **更新文件上传服务**
   ```java
   @Service
   public class FileUploadService {
       public CaseFile uploadFile(MultipartFile file, String sepId, String moduleType) {
           // 验证模块类型
           if (!ModuleType.TASK.getValue().equals(moduleType) && !ModuleType.KEY.getValue().equals(moduleType)) {
               throw new IllegalArgumentException("Invalid module type: " + moduleType);
           }
           
           // 保存文件
           CaseFile caseFile = new CaseFile();
           caseFile.setSepId(sepId);
           caseFile.setFileName(file.getOriginalFilename());
           caseFile.setFilePath("/uploads/" + file.getOriginalFilename());
           caseFile.setModuleType(moduleType);
           
           // 调用DAO保存
           caseFileDao.insertCaseFile(caseFile);
           
           return caseFile;
       }
   }
   ```

## 5. 兼容性考虑

1. **默认值处理**：为`moduleType`参数设置默认值`task`，确保现有调用仍能正常工作
2. **现有数据处理**：已通过SQL脚本为现有数据添加了MODULE_TYPE值
3. **版本控制**：建议使用API版本控制，如`/api/v2/uploadCaseFile`，确保平滑过渡

## 6. 测试建议

1. **单元测试**：测试各API的模块类型参数处理逻辑
2. **集成测试**：测试前端调用带模块类型参数的API
3. **回归测试**：确保现有功能仍能正常工作
4. **边界测试**：测试无效模块类型、空模块类型等情况

## 7. 预期效果

- 任务管理和按键管理的文件数据清晰分离
- 两个模块的文件上传功能互不影响
- 便于后续功能扩展和维护
- 提高查询效率（通过模块类型索引）
