# 流程处理整合API以及SQL汇总

## 1. 项目背景

案件管理系统中的流程处理包含7个阶段，每个阶段包含多个小模块。为了简化数据库设计和API开发，将这些模块整合到一个SQL表中，通过统一的字段和JSON扩展来存储所有阶段的数据。

## 2. 数据库设计

### 2.1 表结构设计

```sql
CREATE TABLE `case_process_stage` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `case_id` BIGINT NOT NULL COMMENT '案件ID',
  `stage_num` TINYINT NOT NULL COMMENT '阶段编号：1-7',
  `stage_name` VARCHAR(50) NOT NULL COMMENT '阶段名称',
  `module_code` VARCHAR(50) NOT NULL COMMENT '模块编码',
  `module_name` VARCHAR(50) NOT NULL COMMENT '模块名称',
  `title` VARCHAR(255) DEFAULT NULL COMMENT '标题',
  `content` TEXT DEFAULT NULL COMMENT '内容',
  `process_date` DATETIME DEFAULT NULL COMMENT '日期',
  `attachments` JSON DEFAULT NULL COMMENT '附件列表，JSON格式',
  `field_data` JSON NOT NULL COMMENT '模块特有字段数据，JSON格式',
  `status` TINYINT DEFAULT 0 COMMENT '审核状态: PENDING-待审批，APPROVED-已通过，REJECTED-已驳回',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` VARCHAR(50) DEFAULT NULL COMMENT '修改人',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  INDEX `idx_case_id` (`case_id`),
  INDEX `idx_stage_num` (`stage_num`),
  INDEX `idx_module_code` (`module_code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件流程阶段表';
```

### 2.2 表字段说明

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | BIGINT | NOT NULL AUTO_INCREMENT | 主键ID |
| case_id | BIGINT | NOT NULL | 案件ID，关联案件表 |
| stage_num | TINYINT | NOT NULL | 阶段编号：1-7 |
| stage_name | VARCHAR(50) | NOT NULL | 阶段名称 |
| module_code | VARCHAR(50) | NOT NULL | 模块编码，用于区分不同模块 |
| module_name | VARCHAR(50) | NOT NULL | 模块名称 |
| title | VARCHAR(255) | DEFAULT NULL | 标题 |
| content | TEXT | DEFAULT NULL | 内容 |
| process_date | DATETIME | DEFAULT NULL | 日期 |
| attachments | JSON | DEFAULT NULL | 附件列表，JSON格式，存储文件路径等信息 |
| field_data | JSON | NOT NULL | 模块特有字段数据，JSON格式 |
| status | TINYINT | DEFAULT 0 | 审核状态: PENDING-待审批，APPROVED-已通过，REJECTED-已驳回' |
| created_by | VARCHAR(50) | NOT NULL | 创建人 |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_by | VARCHAR(50) | DEFAULT NULL | 修改人 |
| updated_at | DATETIME | DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP | 修改时间 |

## 3. Java后端设计

### 3.1 实体类设计

```java
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName(value = "case_process_stage", autoResultMap = true)
public class CaseProcessStage implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId
    private Long id;
    
    private Long caseId;
    
    private Integer stageNum;
    
    private String stageName;
    
    private String moduleCode;
    
    private String moduleName;
    
    private String title;
    
    private String content;
    
    private LocalDateTime processDate;
    
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Attachment> attachments;
    
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object fieldData;
    
    private Integer status;
    
    private String createdBy;
    
    private LocalDateTime createdAt;
    
    private String updatedBy;
    
    private LocalDateTime updatedAt;
    
    // 附件内部类
    @Data
    public static class Attachment implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private String fileName;
        private String filePath;
        private String fileType;
        private Long fileSize;
    }
}
```

### 3.2 Mapper接口设计

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.CaseProcessStage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CaseProcessStageMapper extends BaseMapper<CaseProcessStage> {
    
    // 查询案件的所有阶段数据
    List<CaseProcessStage> selectByCaseId(@Param("caseId") Long caseId);
    
    // 查询案件的特定阶段数据
    List<CaseProcessStage> selectByCaseIdAndStageNum(@Param("caseId") Long caseId, @Param("stageNum") Integer stageNum);
    
    // 查询案件的特定模块数据
    List<CaseProcessStage> selectByCaseIdAndModuleCode(@Param("caseId") Long caseId, @Param("moduleCode") String moduleCode);
}
```

### 3.3 Service层设计

```java
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.CaseProcessStage;

import java.util.List;

public interface CaseProcessStageService extends IService<CaseProcessStage> {
    
    // 新增阶段数据
    boolean saveStage(CaseProcessStage stage);
    
    // 更新阶段数据
    boolean updateStage(CaseProcessStage stage);
    
    // 删除阶段数据
    boolean removeStage(Long id);
    
    // 查询单个阶段数据
    CaseProcessStage getStageById(Long id);
    
    // 查询案件的所有阶段数据
    List<CaseProcessStage> getStagesByCaseId(Long caseId);
    
    // 查询案件的特定阶段数据
    List<CaseProcessStage> getStagesByCaseIdAndStageNum(Long caseId, Integer stageNum);
    
    // 查询案件的特定模块数据
    List<CaseProcessStage> getStagesByCaseIdAndModuleCode(Long caseId, String moduleCode);
}
```

```java
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.CaseProcessStage;
import com.example.demo.mapper.CaseProcessStageMapper;
import com.example.demo.service.CaseProcessStageService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CaseProcessStageServiceImpl extends ServiceImpl<CaseProcessStageMapper, CaseProcessStage> implements CaseProcessStageService {
    
    @Override
    public boolean saveStage(CaseProcessStage stage) {
        return this.save(stage);
    }
    
    @Override
    public boolean updateStage(CaseProcessStage stage) {
        return this.updateById(stage);
    }
    
    @Override
    public boolean removeStage(Long id) {
        return this.removeById(id);
    }
    
    @Override
    public CaseProcessStage getStageById(Long id) {
        return this.getById(id);
    }
    
    @Override
    public List<CaseProcessStage> getStagesByCaseId(Long caseId) {
        return baseMapper.selectByCaseId(caseId);
    }
    
    @Override
    public List<CaseProcessStage> getStagesByCaseIdAndStageNum(Long caseId, Integer stageNum) {
        return baseMapper.selectByCaseIdAndStageNum(caseId, stageNum);
    }
    
    @Override
    public List<CaseProcessStage> getStagesByCaseIdAndModuleCode(Long caseId, String moduleCode) {
        return baseMapper.selectByCaseIdAndModuleCode(caseId, moduleCode);
    }
}
```

### 3.4 Controller层设计

```java
import com.example.demo.entity.CaseProcessStage;
import com.example.demo.service.CaseProcessStageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/case-process-stage")
public class CaseProcessStageController {
    
    @Autowired
    private CaseProcessStageService caseProcessStageService;
    
    // 新增阶段数据
    @PostMapping
    public ResponseEntity<Boolean> saveStage(@RequestBody CaseProcessStage stage) {
        return ResponseEntity.ok(caseProcessStageService.saveStage(stage));
    }
    
    // 更新阶段数据
    @PutMapping("/{id}")
    public ResponseEntity<Boolean> updateStage(@PathVariable Long id, @RequestBody CaseProcessStage stage) {
        stage.setId(id);
        return ResponseEntity.ok(caseProcessStageService.updateStage(stage));
    }
    
    // 删除阶段数据
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> removeStage(@PathVariable Long id) {
        return ResponseEntity.ok(caseProcessStageService.removeStage(id));
    }
    
    // 查询单个阶段数据
    @GetMapping("/{id}")
    public ResponseEntity<CaseProcessStage> getStageById(@PathVariable Long id) {
        return ResponseEntity.ok(caseProcessStageService.getStageById(id));
    }
    
    // 查询案件的所有阶段数据
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<CaseProcessStage>> getStagesByCaseId(@PathVariable Long caseId) {
        return ResponseEntity.ok(caseProcessStageService.getStagesByCaseId(caseId));
    }
    
    // 查询案件的特定阶段数据
    @GetMapping("/case/{caseId}/stage/{stageNum}")
    public ResponseEntity<List<CaseProcessStage>> getStagesByCaseIdAndStageNum(
            @PathVariable Long caseId, @PathVariable Integer stageNum) {
        return ResponseEntity.ok(caseProcessStageService.getStagesByCaseIdAndStageNum(caseId, stageNum));
    }
    
    // 查询案件的特定模块数据
    @GetMapping("/case/{caseId}/module/{moduleCode}")
    public ResponseEntity<List<CaseProcessStage>> getStagesByCaseIdAndModuleCode(
            @PathVariable Long caseId, @PathVariable String moduleCode) {
        return ResponseEntity.ok(caseProcessStageService.getStagesByCaseIdAndModuleCode(caseId, moduleCode));
    }
}
```

## 4. 模块编码设计

为了区分不同阶段的不同模块，设计以下模块编码：

| 阶段 | 阶段名称 | 模块 | 模块编码 |
| --- | --- | --- | --- |
| 1 | 立案阶段 | 立案信息 | STAGE1_REGISTER_INFO |
| 1 | 立案阶段 | 案件受理 | STAGE1_CASE_ACCEPT |
| 1 | 立案阶段 | 案件分配 | STAGE1_CASE_ASSIGN |
| 2 | 接管阶段 | 财产接收 | STAGE2_PROPERTY_RECEIPT |
| 2 | 接管阶段 | 应急管理 | STAGE2_EMERGENCY_MANAGEMENT |
| 2 | 接管阶段 | 财产方案管理 | STAGE2_PROPERTY_PLAN |
| 2 | 接管阶段 | 人员聘用 | STAGE2_PERSONNEL_EMPLOYMENT |
| 2 | 接管阶段 | 内部事务管理 | STAGE2_INTERNAL_AFFAIRS |
| 2 | 接管阶段 | 合同管理 | STAGE2_CONTRACT_MANAGEMENT |
| 2 | 接管阶段 | 营业管理 | STAGE2_BUSINESS_MANAGEMENT |
| 3 | 调查阶段 | 财产调查 | STAGE3_PROPERTY_INVESTIGATION |
| 3 | 调查阶段 | 社保费用 | STAGE3_SOCIAL_SECURITY |
| 3 | 调查阶段 | 税收核定 | STAGE3_TAX_VERIFICATION |
| 4 | 债权阶段 | 债权人会议文件 | STAGE4_MEETING_DOCUMENTS |
| 4 | 债权阶段 | 债权确认 | STAGE4_CLAIM_CONFIRMATION |
| 4 | 债权阶段 | 报酬方案 | STAGE4_REMUNERATION_PLAN |
| 4 | 债权阶段 | 重要行为报告 | STAGE4_IMPORTANT_ACTIONS |
| 4 | 债权阶段 | 抵消权审查 | STAGE4_SETOFF_REVIEW |
| 5 | 重整阶段 | 重整计划 | STAGE5_REORGANIZATION_PLAN |
| 5 | 重整阶段 | 重整执行 | STAGE5_REORGANIZATION_EXECUTION |
| 6 | 分配阶段 | 破产财产分配方案 | STAGE6_BANKRUPTCY_DIST_PLAN |
| 6 | 分配阶段 | 职工安置方案 | STAGE6_EMPLOYEE_SETTLEMENT |
| 6 | 分配阶段 | 优先受偿 | STAGE6_PRIORITY_PAYMENT |
| 6 | 分配阶段 | 财产分配执行 | STAGE6_PROPERTY_DISTR_EXEC |
| 6 | 分配阶段 | 提存管理 | STAGE6_DEPOSIT_MANAGEMENT |
| 6 | 分配阶段 | 破产程序终结 | STAGE6_BANKRUPTCY_TERMINATION |
| 7 | 终结阶段 | 注销登记 | STAGE7_CANCELLATION_REG |
| 7 | 终结阶段 | 终结诉讼仲裁 | STAGE7_TERMINATION_LITIGATION |
| 7 | 终结阶段 | 追加分配 | STAGE7_ADDITIONAL_DISTRIBUTION |
| 7 | 终结阶段 | 账户印章管理 | STAGE7_ACCOUNT_SEAL_MANAGE |
| 7 | 终结阶段 | 职务报告 | STAGE7_DUTY_REPORT |
| 7 | 终结阶段 | 资料移交 | STAGE7_DOCUMENT_TRANSFER |
| 7 | 终结阶段 | 归档管理 | STAGE7_ARCHIVING_MANAGEMENT |
| 7 | 终结阶段 | 印章销毁 | STAGE7_SEAL_DESTRUCTION |
| 7 | 终结阶段 | 账户销户 | STAGE7_ACCOUNT_CLOSING |

## 5. 模拟数据

### 5.1 插入模拟数据SQL

```sql
-- 阶段一：立案阶段 - 立案信息
INSERT INTO `case_process_stage` (`case_id`, `stage_num`, `stage_name`, `module_code`, `module_name`, `title`, `content`, `process_date`, `attachments`, `field_data`, `status`, `created_by`) VALUES
(1, 1, '立案阶段', 'STAGE1_REGISTER_INFO', '立案信息', '案件立案', '案件基本信息立案', '2023-01-10 10:00:00', '[{"fileName": "立案申请书.pdf", "filePath": "/uploads/20230110/立案申请书.pdf", "fileType": "pdf", "fileSize": 1024000}]', '{"registerNo": "L20230110001", "registerDate": "2023-01-10", "caseType": "破产清算", "applicant": "张三", "respondent": "XX公司"}', 1, 'admin');

-- 阶段二：接管阶段 - 财产接收
INSERT INTO `case_process_stage` (`case_id`, `stage_num`, `stage_name`, `module_code`, `module_name`, `title`, `content`, `process_date`, `attachments`, `field_data`, `status`, `created_by`) VALUES
(1, 2, '接管阶段', 'STAGE2_PROPERTY_RECEIPT', '财产接收', '财产接收记录', '接收XX公司财产', '2023-02-15 14:30:00', '[{"fileName": "财产清单.xlsx", "filePath": "/uploads/20230215/财产清单.xlsx", "fileType": "xlsx", "fileSize": 2048000}]', '{"receiver": "李四", "receiveDate": "2023-02-15", "propertyType": "固定资产", "propertyValue": 10000000}', 1, 'admin');

-- 阶段三：调查阶段 - 财产调查
INSERT INTO `case_process_stage` (`case_id`, `stage_num`, `stage_name`, `module_code`, `module_name`, `title`, `content`, `process_date`, `attachments`, `field_data`, `status`, `created_by`) VALUES
(1, 3, '调查阶段', 'STAGE3_PROPERTY_INVESTIGATION', '财产调查', '财产调查报告', 'XX公司财产调查结果', '2023-03-20 09:15:00', '[{"fileName": "财产调查报告.pdf", "filePath": "/uploads/20230320/财产调查报告.pdf", "fileType": "pdf", "fileSize": 3072000}]', '{"investigator": "王五", "investigateDate": "2023-03-20", "investigateResult": "正常", "totalValue": 15000000}', 1, 'admin');

-- 阶段四：债权阶段 - 债权确认
INSERT INTO `case_process_stage` (`case_id`, `stage_num`, `stage_name`, `module_code`, `module_name`, `title`, `content`, `process_date`, `attachments`, `field_data`, `status`, `created_by`) VALUES
(1, 4, '债权阶段', 'STAGE4_CLAIM_CONFIRMATION', '债权确认', '债权确认书', '确认债权人债权', '2023-04-25 11:00:00', '[{"fileName": "债权确认书.pdf", "filePath": "/uploads/20230425/债权确认书.pdf", "fileType": "pdf", "fileSize": 1536000}]', '{"creditorName": "赵六", "claimAmount": 500000, "claimStatus": "确认", "confirmDate": "2023-04-25"}', 1, 'admin');

-- 阶段五：重整阶段 - 重整计划
INSERT INTO `case_process_stage` (`case_id`, `stage_num`, `stage_name`, `module_code`, `module_name`, `title`, `content`, `process_date`, `attachments`, `field_data`, `status`, `created_by`) VALUES
(1, 5, '重整阶段', 'STAGE5_REORGANIZATION_PLAN', '重整计划', '重整计划草案', 'XX公司重整计划', '2023-05-30 16:45:00', '[{"fileName": "重整计划草案.pdf", "filePath": "/uploads/20230530/重整计划草案.pdf", "fileType": "pdf", "fileSize": 4096000}]', '{"planName": "XX公司重整计划", "planContent": "详细重整计划内容", "draftDate": "2023-05-30", "approveStatus": "待批准"}', 0, 'admin');

-- 阶段六：分配阶段 - 破产财产分配方案
INSERT INTO `case_process_stage` (`case_id`, `stage_num`, `stage_name`, `module_code`, `module_name`, `title`, `content`, `process_date`, `attachments`, `field_data`, `status`, `created_by`) VALUES
(1, 6, '分配阶段', 'STAGE6_BANKRUPTCY_DIST_PLAN', '破产财产分配方案', '财产分配方案', 'XX公司财产分配方案', '2023-06-15 10:30:00', '[{"fileName": "财产分配方案.pdf", "filePath": "/uploads/20230615/财产分配方案.pdf", "fileType": "pdf", "fileSize": 2560000}]', '{"planName": "XX公司财产分配方案", "totalAssets": 12000000, "distributionPrinciple": "按比例分配"}', 0, 'admin');

-- 阶段七：终结阶段 - 注销登记
INSERT INTO `case_process_stage` (`case_id`, `stage_num`, `stage_name`, `module_code`, `module_name`, `title`, `content`, `process_date`, `attachments`, `field_data`, `status`, `created_by`) VALUES
(1, 7, '终结阶段', 'STAGE7_CANCELLATION_REG', '注销登记', '公司注销登记', 'XX公司注销登记', '2023-07-20 15:20:00', '[{"fileName": "注销登记申请书.pdf", "filePath": "/uploads/20230720/注销登记申请书.pdf", "fileType": "pdf", "fileSize": 1280000}]', '{"cancelType": "破产注销", "applyDate": "2023-07-20", "approvalDate": null, "approvalStatus": "待批准"}', 0, 'admin');
```

### 5.2 模拟数据查询示例

```sql
-- 查询案件1的所有阶段数据
SELECT * FROM `case_process_stage` WHERE `case_id` = 1;

-- 查询案件1的阶段2数据
SELECT * FROM `case_process_stage` WHERE `case_id` = 1 AND `stage_num` = 2;

-- 查询案件1的财产接收模块数据
SELECT * FROM `case_process_stage` WHERE `case_id` = 1 AND `module_code` = 'STAGE2_PROPERTY_RECEIPT';
```

## 6. API调用示例

### 6.1 新增阶段数据

```http
POST /api/case-process-stage
Content-Type: application/json

{
  "caseId": 1,
  "stageNum": 2,
  "stageName": "接管阶段",
  "moduleCode": "STAGE2_EMERGENCY_MANAGEMENT",
  "moduleName": "应急管理",
  "title": "应急管理预案",
  "content": "XX公司应急管理预案",
  "processDate": "2023-02-20T10:00:00",
  "attachments": [
    {
      "fileName": "应急管理预案.pdf",
      "filePath": "/uploads/20230220/应急管理预案.pdf",
      "fileType": "pdf",
      "fileSize": 1536000
    }
  ],
  "fieldData": {
    "manager": "李四",
    "emergencyMeasures": "详细应急措施",
    "contactPerson": "王五",
    "contactPhone": "13800138000"
  },
  "status": 0,
  "createdBy": "admin"
}
```

### 6.2 查询案件的所有阶段数据

```http
GET /api/case-process-stage/case/1
```

### 6.3 查询案件的特定阶段数据

```http
GET /api/case-process-stage/case/1/stage/2
```

### 6.4 查询案件的特定模块数据

```http
GET /api/case-process-stage/case/1/module/STAGE2_PROPERTY_RECEIPT
```

## 7. 优势与注意事项

### 7.1 优势

1. **简化数据库设计**：将多个阶段的多个模块整合到一个表中，减少了表的数量，简化了数据库结构。
2. **统一API接口**：所有阶段的数据操作都通过统一的API接口进行，简化了前端开发。
3. **灵活性强**：通过JSON字段存储特有数据，可以轻松扩展新的阶段和模块，无需修改表结构。
4. **便于查询**：可以通过阶段编号、模块编码等条件灵活查询数据。

### 7.2 注意事项

1. **JSON字段索引**：对于需要频繁查询的JSON字段，可以考虑使用MySQL的JSON索引功能。
2. **数据一致性**：需要确保同一案件的不同阶段数据之间的一致性。
3. **性能考虑**：对于大量数据的查询，需要合理设计索引，优化查询性能。
4. **事务管理**：对于涉及多个阶段数据的操作，需要使用事务管理确保数据完整性。

## 8. 总结

本设计方案通过将案件流程的7个阶段的所有模块数据整合到一个SQL表中，实现了数据库设计的简化和API接口的统一。通过使用JSON字段存储各个模块的特有数据，保证了系统的灵活性和可扩展性。Java后端采用了MyBatis Plus框架，提供了完整的增删改查接口，可以满足前端各种数据操作需求。模拟数据展示了如何使用该表存储不同阶段、不同模块的数据，以及如何进行查询操作。

该设计方案适用于案件管理系统中的流程处理模块，可以根据实际需求进行调整和扩展。
