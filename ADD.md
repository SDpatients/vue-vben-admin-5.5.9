# 接口文档

## 文档说明
本文档描述了破产案件管理系统的新增数据接口，包括案件添加、债务人添加和债权人添加三个接口的详细信息。

## 接口列表
| 接口名称 | 请求方式 | URL | 功能描述 |
|---------|---------|-----|---------|
| AddOneCase | POST | /api/web/AddOneCase | 添加单个破产案件信息 |
| addDebtor | POST | /api/web/addDebtor | 添加债务人企业信息 |
| AddCreditor | POST | /api/web/AddCreditor | 添加债权人信息 |

## 通用说明
1. 所有接口均需要提供token参数进行认证
2. 请求体格式为JSON
3. 返回格式统一为Result对象，包含status、error和data字段
   - status: "1"表示成功，"0"表示失败
   - error: 错误信息，成功时为空
   - data: 返回数据，失败时为null

## 接口详细描述

### 1. AddOneCase - 添加单个破产案件

#### 请求信息
- **URL**: `/api/web/AddOneCase`
- **请求方式**: `POST`
- **请求参数**:
  | 参数名 | 类型 | 位置 | 必填 | 描述 |
  |-------|------|------|------|------|
  | token | String | Query | 是 | 认证令牌 |
  | 案件信息 | JSON | Body | 是 | 案件详情，见下表 |

#### 案件信息字段
| 字段名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| ah | String | 是 | 案号 |
| ajmc | String | 是 | 案件名称 |
| slrq | Date | 否 | 受理日期，格式：yyyy-MM-dd HH:mm:ss |
| ajly | String | 否 | 案件来源 |
| slfy | String | 否 | 受理法院 |
| zdjg | String | 否 | 管理人 |
| glrfzr | String | 否 | 主要负责人 |
| sfjhs | String | 否 | 是否简化审，0：否，1：是 |
| ay | String | 否 | 案由 |
| ajjd | String | 否 | 案件进度 |
| zqsbjzsj | Date | 否 | 债权申报截止时间，格式：yyyy-MM-dd HH:mm:ss |
| larq | Date | 否 | 立案日期，格式：yyyy-MM-dd HH:mm:ss |
| jarq | Date | 否 | 结案日期，格式：yyyy-MM-dd HH:mm:ss |
| pcsj | Date | 否 | 破产时间，格式：yyyy-MM-dd HH:mm:ss |
| zjsj | Date | 否 | 终结时间，格式：yyyy-MM-dd HH:mm:ss |
| zxsj | Date | 否 | 注销时间，格式：yyyy-MM-dd HH:mm:ss |
| gdsj | Date | 否 | 归档时间，格式：yyyy-MM-dd HH:mm:ss |
| beizhu | String | 否 | 备注 |
| wjsc | String | 否 | 文件上传，文件路径 |
| sepLd | Integer | 否 | 年度 |
| sepMd | Integer | 否 | 月份 |
| sepNd | String | 否 | 年份 |

#### 请求体示例
```json
{
  "ah": "(2024)苏01破1号",
  "ajmc": "南京某某有限公司破产清算案",
  "slrq": "2024-01-15 10:30:00",
  "slfy": "江苏省南京市中级人民法院",
  "zdjg": "江苏某某律师事务所",
  "glrfzr": "张三",
  "sfjhs": "0",
  "ay": "破产清算",
  "ajjd": "已受理"
}
```

#### 返回格式
```json
{
  "status": "1",
  "error": "",
  "data": "案件添加成功"
}
```

### 2. addDebtor - 添加债务人企业

#### 请求信息
- **URL**: `/api/web/addDebtor`
- **请求方式**: `POST`
- **请求参数**:
  | 参数名 | 类型 | 位置 | 必填 | 描述 |
  |-------|------|------|------|------|
  | token | String | Query | 是 | 认证令牌 |
  | 债务人信息 | JSON | Body | 是 | 债务人详情，见下表 |

#### 债务人信息字段
| 字段名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| qymc | String | 是 | 企业名称 |
| tyshxydm | String | 是 | 统一社会信用代码 |
| fddbr | String | 否 | 法定代表人 |
| djjg | String | 否 | 登记机关 |
| clrq | Date | 否 | 成立日期，格式：yyyy-MM-dd HH:mm:ss |
| zczb | String | 否 | 注册资本 |
| jyfw | String | 否 | 经营范围 |
| qylx | String | 否 | 企业类型 |
| sshy | String | 否 | 所属行业 |
| zcdz | String | 否 | 注册地址 |
| lxdh | String | 否 | 联系电话 |
| lxr | String | 否 | 联系人 |
| zt | String | 否 | 状态，0：正常，1：注销 |
| sepLd | Integer | 否 | 年度 |
| sepMd | Integer | 否 | 月份 |
| sepNd | String | 否 | 年份 |

#### 请求体示例
```json
{
  "qymc": "南京某某有限公司",
  "tyshxydm": "91320100MA1N000000",
  "fddbr": "李四",
  "djjg": "南京市市场监督管理局",
  "clrq": "2010-05-20 00:00:00",
  "zczb": "5000万人民币",
  "jyfw": "电子产品销售",
  "qylx": "有限责任公司",
  "zcdz": "南京市玄武区某某路123号",
  "lxdh": "025-88888888",
  "lxr": "王五",
  "zt": "0"
}
```

#### 返回格式
```json
{
  "status": "1",
  "error": "",
  "data": "债务人添加成功"
}
```

### 3. AddCreditor - 添加债权人

#### 请求信息
- **URL**: `/api/web/AddCreditor`
- **请求方式**: `POST`
- **请求参数**:
  | 参数名 | 类型 | 位置 | 必填 | 描述 |
  |-------|------|------|------|------|
  | token | String | Query | 是 | 认证令牌 |
  | 债权人信息 | JSON | Body | 是 | 债权人详情，见下表 |

#### 债权人信息字段
| 字段名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| zqr | String | 是 | 债权人名称 |
| zqrfl | String | 否 | 类型，0：个人，1：企业 |
| zjhm | String | 否 | 证件号码（个人为身份证号，企业为统一社会信用代码） |
| fddbrqy | String | 否 | 法定代表人（企业时必填） |
| zcdz | String | 否 | 注册地址 |
| jyfwqy | String | 否 | 经营范围（企业） |
| hyfl | String | 否 | 行业分类（企业） |
| clrqqy | Date | 否 | 成立日期（企业），格式：yyyy-MM-dd HH:mm:ss |
| zczbqy | String | 否 | 注册资本（企业） |
| sepLd | Integer | 否 | 年度 |
| sepMd | Integer | 否 | 月份 |
| sepNd | String | 否 | 年份 |

#### 请求体示例
```json
{
  "zqr": "江苏某某贸易有限公司",
  "zqrfl": "1",
  "zjhm": "91320100MA1M000000",
  "fddbrqy": "赵六",
  "zcdz": "南京市建邺区某某路456号",
  "jyfwqy": "建筑材料销售",
  "hyfl": "批发和零售业",
  "clrqqy": "2015-03-10 00:00:00",
  "zczbqy": "3000万人民币"
}
```

#### 返回格式
```json
{
  "status": "1",
  "error": "",
  "data": "债权人添加成功"
}
```

## 错误码说明
| 错误码 | 错误信息 | 说明 |
|-------|---------|-----|
| 0 | 案件添加失败 | 案件添加过程中出现错误 |
| 0 | 债务人添加失败 | 债务人添加过程中出现错误 |
| 0 | 债权人添加失败 | 债权人添加过程中出现错误 |
| 0 | 添加案件时发生错误: xxx | 案件添加时的具体错误信息 |
| 0 | 添加债务人时发生错误: xxx | 债务人添加时的具体错误信息 |
| 0 | 添加债权人时发生错误: xxx | 债权人添加时的具体错误信息 |

## 注意事项
1. 所有日期字段格式必须为"yyyy-MM-dd HH:mm:ss"，否则会导致添加失败
2. 统一社会信用代码必须符合国家标准格式
3. 敏感字段请确保数据准确性
4. 建议在调用接口前进行数据格式验证

## 版本历史
| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2024-01-15 | 初始版本，包含三个新增接口 |
