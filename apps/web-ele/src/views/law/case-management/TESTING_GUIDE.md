# 案件管理模块测试指南

## 概述

本文档介绍如何对案件管理模块进行完整的 CRUD（增删改查）真实操作测试。

## 测试文件结构

```
case-management/
├── index.vue              # 案件管理页面组件
├── index.test.ts          # 单元测试文件（已创建）
├── index.e2e.test.ts      # E2E测试文件（可选）
├── components/            # 子组件
│   └── ReviewModal.vue
└── TESTING_GUIDE.md       # 本指南
```

## 测试类型

### 1. 单元测试 (Unit Test)

使用 **Vitest** + **Vue Test Utils** 进行组件和 API 的单元测试。

**测试范围：**
- API 接口调用测试
- 数据格式验证
- 错误处理测试
- 组件渲染测试

**运行命令：**
```bash
# 运行所有测试
pnpm test:unit

# 运行特定测试文件
pnpm vitest run apps/web-ele/src/views/law/case-management/index.test.ts

# 运行测试并生成覆盖率报告
pnpm vitest run --coverage
```

### 2. 集成测试 (Integration Test)

测试多个组件或模块之间的交互。

**测试范围：**
- 组件间数据传递
- 状态管理（Pinia）
- 路由跳转
- 表单验证

### 3. E2E 测试 (End-to-End Test)

使用 **Playwright** 进行端到端测试。

**测试范围：**
- 完整的用户操作流程
- 页面渲染和交互
- 真实浏览器环境下的功能验证

**运行命令：**
```bash
# 运行 E2E 测试
pnpm test:e2e

# 运行特定 E2E 测试文件
pnpm playwright test apps/web-ele/src/views/law/case-management/index.e2e.test.ts
```

## CRUD 测试详解

### Create (创建)

测试创建案件的各种场景：

```typescript
// 1. 正常创建
it('应该成功创建一个新案件', async () => {
  const response = await createCaseApi(testCaseData);
  expect(response.code).toBe(200);
  expect(response.data.caseId).toBeDefined();
});

// 2. 验证必填字段
it('创建案件时应该验证必填字段', async () => {
  // 测试缺少必填字段的情况
});

// 3. 验证唯一性
it('创建案件时案号应该唯一', async () => {
  // 测试重复案号
});
```

### Read (查询)

测试查询案件的各种场景：

```typescript
// 1. 查询列表
it('应该能够查询案件列表', async () => {
  const response = await getCaseListApi({ pageNum: 1, pageSize: 10 });
  expect(response.code).toBe(200);
  expect(Array.isArray(response.data.list)).toBe(true);
});

// 2. 查询详情
it('应该能够查询案件详情', async () => {
  const response = await getCaseDetailApi(caseId);
  expect(response.code).toBe(200);
  expect(response.data.caseNumber).toBe(expectedCaseNumber);
});

// 3. 分页查询
it('应该支持分页查询', async () => {
  // 测试分页功能
});
```

### Update (更新)

测试更新案件的各种场景：

```typescript
// 1. 正常更新
it('应该能够更新案件信息', async () => {
  const response = await updateCaseApi(caseId, updateData);
  expect(response.code).toBe(200);
});

// 2. 部分更新
it('应该能够部分更新案件信息', async () => {
  // 只更新部分字段
});

// 3. 更新不存在的数据
it('更新不存在的案件应该返回错误', async () => {
  // 测试错误处理
});
```

### Delete (删除)

测试删除案件的各种场景：

```typescript
// 1. 正常删除
it('应该能够删除案件', async () => {
  const response = await deleteCaseApi(caseId);
  expect(response.code).toBe(200);
});

// 2. 删除后验证
it('删除后应该无法查询到该案件', async () => {
  // 验证删除成功
});

// 3. 删除不存在的数据
it('删除不存在的案件应该返回错误', async () => {
  // 测试错误处理
});
```

## 测试数据管理

### 1. 测试数据生成

使用动态生成的数据避免冲突：

```typescript
const testCaseData = {
  caseNumber: `TEST-${Date.now()}`,  // 使用时间戳确保唯一性
  caseName: '测试案件-自动化测试',
  acceptanceDate: new Date().toISOString().split('T')[0],
  // ...
};
```

### 2. 测试数据清理

在测试完成后清理测试数据：

```typescript
afterAll(async () => {
  // 清理所有测试创建的数据
  if (createdCaseId) {
    await deleteCaseApi(createdCaseId);
  }
});
```

### 3. 测试隔离

每个测试用例应该独立运行，不依赖其他测试的结果：

```typescript
beforeEach(() => {
  // 重置状态
  vi.clearAllMocks();
});
```

## 测试环境配置

### 1. 环境变量

创建 `.env.test` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:8085

# 测试环境标识
NODE_ENV=test
```

### 2. Vitest 配置

在项目根目录创建/更新 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',  // 或 'jsdom'
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './apps/web-ele/src'),
    },
  },
});
```

## 测试最佳实践

### 1. 测试命名规范

- 使用描述性的测试名称
- 遵循 `应该...当...` 的格式
- 使用中文描述业务场景

```typescript
// ✅ 好的命名
it('应该成功创建一个新案件', async () => {});
it('应该返回错误当必填字段缺失时', async () => {});

// ❌ 不好的命名
it('test create case', async () => {});
it('create case 1', async () => {});
```

### 2. 测试结构

使用 `describe` 分组组织测试：

```typescript
describe('案件管理模块', () => {
  describe('Create - 创建案件', () => {
    it('应该成功创建一个新案件', async () => {});
    it('应该验证必填字段', async () => {});
  });

  describe('Read - 查询案件', () => {
    it('应该能够查询案件列表', async () => {});
    it('应该能够查询案件详情', async () => {});
  });
});
```

### 3. 断言使用

使用明确的断言：

```typescript
// ✅ 好的断言
expect(response.code).toBe(200);
expect(response.data.caseId).toBeDefined();
expect(Array.isArray(response.data.list)).toBe(true);

// ❌ 不好的断言
expect(response).toBeTruthy();
expect(response.data).toBeDefined();
```

### 4. 错误处理

测试错误场景：

```typescript
it('应该处理 API 错误', async () => {
  try {
    await createCaseApi(invalidData);
    // 如果没有抛出错误，测试失败
    expect(true).toBe(false);
  } catch (error) {
    expect(error).toBeDefined();
    expect(error.message).toContain('必填字段');
  }
});
```

## 常见问题

### 1. 测试超时

如果测试运行时间过长，可以增加超时时间：

```typescript
it('应该完成复杂操作', async () => {
  // 测试代码
}, 10000);  // 10秒超时
```

### 2. 异步测试

确保正确处理异步操作：

```typescript
// ✅ 使用 async/await
it('应该异步创建案件', async () => {
  const response = await createCaseApi(data);
  expect(response.code).toBe(200);
});

// ❌ 不使用 await
it('应该异步创建案件', () => {
  createCaseApi(data).then(response => {
    expect(response.code).toBe(200);
  });
});
```

### 3. 测试数据冲突

使用唯一标识避免数据冲突：

```typescript
const uniqueId = Date.now();
const testData = {
  caseNumber: `TEST-${uniqueId}`,
  caseName: `测试案件-${uniqueId}`,
};
```

## 持续集成

在 CI/CD 流程中运行测试：

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run unit tests
        run: pnpm test:unit
      - name: Run E2E tests
        run: pnpm test:e2e
```

## 总结

1. **测试覆盖率**：确保核心功能都有测试覆盖
2. **测试隔离**：每个测试独立运行，不依赖其他测试
3. **测试数据**：使用动态生成的数据，测试后清理
4. **错误处理**：测试正常场景和异常场景
5. **持续集成**：将测试集成到 CI/CD 流程中

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Playwright 文档](https://playwright.dev/)
