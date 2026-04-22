# 破管通 UniApp 移动端

基于 UniApp + Vue3 + TypeScript 的移动端应用，支持编译到微信小程序、H5、iOS、Android 等多个平台。

破产执业业务·管理人主办·全生命周期打通完成

## 特性

- 🚀 基于 Vue 3 + TypeScript，与现有 Web 端技术栈保持一致
- 📱 一套代码，多端运行（微信小程序、H5、APP）
- 🎨 复用现有项目的 API 层和业务逻辑
- 🔧 使用 Pinia 进行状态管理
- 💪 完整的类型支持

## 目录结构

```
uni-app/
├── src/
│   ├── api/           # API 接口（复用现有项目）
│   ├── components/    # 公共组件
│   ├── config/        # 配置文件
│   ├── pages/         # 页面
│   │   ├── login/     # 登录页
│   │   ├── workspace/ # 工作台
│   │   ├── cases/     # 案件管理
│   │   └── profile/   # 个人中心
│   ├── stores/        # Pinia 状态管理
│   ├── styles/        # 全局样式
│   ├── utils/         # 工具函数
│   ├── App.vue        # 应用入口
│   └── main.ts        # 主入口
├── manifest.json      # 应用配置
├── pages.json         # 页面配置
├── package.json       # 依赖配置
├── tsconfig.json      # TypeScript 配置
└── vite.config.ts     # Vite 配置
```

## 快速开始

### 1. 安装依赖

```bash
# 在项目根目录执行
pnpm install

# 或进入 uni-app 目录
cd apps/uni-app
pnpm install
```

### 2. 运行开发服务器

```bash
# H5 端
pnpm dev:h5

# 微信小程序
pnpm dev:mp-weixin

# APP 端
pnpm dev:app
```

### 3. 构建生产版本

```bash
# H5 端
pnpm build:h5

# 微信小程序
pnpm build:mp-weixin

# APP 端
pnpm build:app
```

## 开发指南

### 复用现有代码

1. **API 层**：直接复制 `apps/web-ele/src/api/` 下的接口文件
2. **类型定义**：复用 `packages/types/` 中的类型
3. **工具函数**：复用 `packages/utils/` 中的工具函数
4. **常量**：复用 `packages/constants/` 中的常量

### 页面开发规范

1. 使用 `<script setup lang="ts">` 语法
2. 样式使用 SCSS，文件名为 `index.vue`
3. 使用 `rpx` 作为尺寸单位
4. 遵循现有的命名规范

### 条件编译

```vue
<!-- #ifdef H5 -->
<h5>仅在 H5 平台显示</h5>
<!-- #endif -->

<!-- #ifdef MP-WEIXIN -->
<view>仅在微信小程序显示</view>
<!-- #endif -->

<!-- #ifdef APP-PLUS -->
<view>仅在 APP 显示</view>
<!-- #endif -->
```

## 注意事项

1. **Element Plus 替换**：UniApp 不支持 Element Plus，需要使用 UniApp 内置组件或 uview-plus
2. **路由跳转**：使用 `uni.navigateTo` 替代 `vue-router`
3. **本地存储**：使用 `uni.getStorageSync` 替代 `localStorage`
4. **网络请求**：使用 `uni.request` 替代 `axios`

## 常见问题

### Q: 如何调试微信小程序？

A: 运行 `pnpm dev:mp-weixin` 后，使用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

### Q: 如何真机调试 APP？

A: 运行 `pnpm dev:app` 后，使用 HBuilderX 进行真机调试。

### Q: 如何复用现有项目的 API？

A: 将 `apps/web-ele/src/api/` 下的文件复制到 `apps/uni-app/src/api/`，并替换 `axios` 为 `uni.request`。
