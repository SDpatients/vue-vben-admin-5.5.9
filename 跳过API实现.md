# 跳过API实现总结

## 1. 功能概述

跳过功能是案件管理系统中的一个重要功能，允许用户在不填写详细数据的情况下跳过某个任务，直接将任务状态设置为"跳过"。跳过功能的核心逻辑是：

1. 调用对应的新增API，添加默认数据
2. 将任务状态设置为"跳过"

## 2. 实现架构

### 2.1 组件结构

跳过功能的实现涉及以下组件：

| 组件 | 功能 | 位置 |
|------|------|------|
| 案件详情页面 | 显示任务列表，提供跳过按钮 | `/views/law/case-detail/index.vue` |
| 阶段任务组件 | 实现跳过逻辑，调用API | `/views/law/case-detail/components/StageOneProcess.vue` |
| 任务编辑页面 | 移除跳过相关逻辑 | `/views/law/case-detail/TaskEdit.vue` |

### 2.2 API结构

实现跳过功能需要调用以下API：

| API名称 | 功能 | 位置 |
|---------|------|------|
| addWorkTeamApi | 添加工作团队默认数据 | `/api/core/work-team.ts` |
| updateTaskStatusApi | 更新任务状态为跳过 | `/api/core/case-process.ts` |

## 3. 实现步骤

### 3.1 阶段任务组件修改（以StageOneProcess.vue为例）

1. **实现skipTask函数**

```typescript
// 跳过任务
const skipTask = async (taskId: string) => {
  try {
    if (taskId === 'workTeam') {
      // 从本地存储获取操作人信息
      const chatUserInfo = localStorage.getItem('chat_user_info');
      const sepauser = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';
      
      // 准备默认数据
      const workTeamData = {
        sep_ld: props.caseId, // 使用案件ID作为sep_ld
        tdfzr: '', // 团队负责人，默认空
        zhzcy: '', // 综合组成员，默认空
        cxzcy: '', // 程序组成员，默认空
        ccglzcy: '', // 财产管理组成员，默认空
        zqshzcy: '', // 债权审核组成员，默认空
        ldrszcy: '', // 劳动人事组成员，默认空
        zzqlzcy: '', // 资产清理组成员，默认空
        sepauser, // 从本地存储获取操作人
        sepadate: new Date().toISOString(), // 操作日期，当前时间
        ZT: '2', // 状态字段，默认为2（跳过状态）
      };
      
      // 动态导入addWorkTeamApi，避免循环依赖
      const { addWorkTeamApi } = await import('#/api/core/work-team');
      // 调用添加工作团队API
      const addResponse = await addWorkTeamApi(workTeamData);
      
      if (addResponse.status !== '1') {
        ElMessage.error(
          `添加工作团队数据失败：${addResponse.error || '未知错误'}`,
        );
        return;
      }
    }
    
    // 调用API更新状态为跳过
    const result = await updateTaskStatusApi(taskId, props.caseId, '跳过');

    if (result && result.status === '1') {
      // 更新本地状态
      const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].status = '跳过';
        // 通知父组件任务状态变更
        emit('taskStatusChanged', taskId, '跳过');
        ElMessage.success('任务已跳过');
      }
    } else {
      ElMessage.error('更新任务状态失败');
    }
  } catch (error) {
    console.error('跳过任务失败:', error);
    ElMessage.error('跳过任务失败');
  }
};
```

2. **模板中添加跳过按钮**

```vue
<ElButton
  v-else
  type="warning"
  size="small"
  @click="skipTask(task.id)"
  :disabled="task.status === '完成'"
>
  <Icon icon="lucide:skip-forward" class="mr-1" />
  跳过
</ElButton>
```

### 3.2 任务编辑页面修改（TaskEdit.vue）

1. **删除跳过相关状态**

```typescript
// 删除isSkipped状态变量
// const isSkipped = ref(false);
```

2. **删除跳过相关函数**

```typescript
// 删除skipTask和revokeSkip函数
```

3. **删除跳过相关按钮**

```vue
<!-- 删除跳过和撤回跳过按钮 -->
<!-- <ElButton
  v-if="!isSkipped"
  type="warning"
  @click="skipTask"
  :loading="saving"
  :disabled="taskStatus === '完成'"
>
  <Icon icon="lucide:skip-forward" class="mr-1" />
  跳过
</ElButton>
<ElButton v-else type="warning" :loading="saving" @click="revokeSkip">
  <Icon icon="lucide:skip-back" class="mr-1" />
  撤回跳过
</ElButton> -->
```

4. **更新保存按钮禁用条件**

```vue
<ElButton
  type="primary"
  @click="saveData(false)"
  :loading="saving"
  :disabled="taskStatus === '跳过'"
>
  <Icon icon="lucide:save" class="mr-1" />
  保存
</ElButton>

<ElButton
  type="success"
  @click="saveAndConfirm"
  :loading="saving"
  :disabled="taskStatus === '完成' || taskStatus === '跳过'"
>
  <Icon icon="lucide:check-circle" class="mr-1" />
  保存并确认
</ElButton>
```

5. **删除监听任务状态变化**

```typescript
// 删除watch监听
// watch(
//   () => taskStatus.value,
//   (newStatus) => {
//     if (newStatus === '跳过') {
//       isSkipped.value = true;
//     } else if (newStatus === '未确认') {
//       isSkipped.value = false;
//     }
//   },
// );
```

6. **删除loadTaskData中的isSkipped设置**

```typescript
// 删除设置isSkipped的代码
// isSkipped.value = taskStatus.value === '跳过';
```

## 3. 不同任务类型的跳过实现

### 3.1 工作团队任务（workTeam）

**新增API**：`addWorkTeamApi`

**默认数据**：
```typescript
const workTeamData = {
  sep_ld: props.caseId, // 案件ID
  tdfzr: '', // 团队负责人
  zhzcy: '', // 综合组成员
  cxzcy: '', // 程序组成员
  ccglzcy: '', // 财产管理组成员
  zqshzcy: '', // 债权审核组成员
  ldrszcy: '', // 劳动人事组成员
  zzqlzcy: '', // 资产清理组成员
  sepauser, // 操作人
  sepadate: new Date().toISOString(), // 操作日期
  ZT: '2', // 状态，2表示跳过
};
```

### 3.2 其他任务类型

其他任务类型的跳过实现逻辑类似，需要：

1. 确定对应的新增API
2. 准备默认数据
3. 调用API添加默认数据
4. 更新任务状态为跳过

## 4. 实现要点

### 4.1 动态导入API

为避免循环依赖，建议使用动态导入API：

```typescript
// 动态导入addWorkTeamApi，避免循环依赖
const { addWorkTeamApi } = await import('#/api/core/work-team');
```

### 4.2 操作人信息获取

从本地存储获取操作人信息：

```typescript
const chatUserInfo = localStorage.getItem('chat_user_info');
const sepauser = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';
```

### 4.3 日期处理

使用当前时间作为操作日期：

```typescript
sepadate: new Date().toISOString(), // 操作日期，当前时间
```

### 4.4 状态字段处理

根据后端要求设置正确的状态值，通常"跳过"状态对应的值为2：

```typescript
ZT: '2', // 状态字段，默认为2（跳过状态）
```

### 4.5 API返回结果处理

正确处理API返回结果，提供友好的用户反馈：

```typescript
if (addResponse.status !== '1') {
  ElMessage.error(
    `添加工作团队数据失败：${addResponse.error || '未知错误'}`,
  );
  return;
}
```

### 4.6 任务状态更新

调用updateTaskStatusApi将任务状态设置为跳过：

```typescript
const result = await updateTaskStatusApi(taskId, props.caseId, '跳过');
```

### 4.7 本地状态更新

更新本地状态，通知父组件任务状态变更：

```typescript
if (result && result.status === '1') {
  // 更新本地状态
  const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1 && tasks.value[taskIndex]) {
    tasks.value[taskIndex].status = '跳过';
    // 通知父组件任务状态变更
    emit('taskStatusChanged', taskId, '跳过');
    ElMessage.success('任务已跳过');
  }
}
```

## 5. 实现注意事项

### 5.1 API调用顺序

必须先调用新增API添加默认数据，再调用updateTaskStatusApi更新任务状态，确保数据一致性。

### 5.2 错误处理

必须处理API调用可能出现的错误，提供友好的用户反馈。

### 5.3 权限控制

确保只有具有跳过权限的用户才能使用跳过功能。

### 5.4 数据完整性

跳过功能添加的默认数据应确保数据完整性，至少包含必填字段。

### 5.5 用户体验

提供明确的用户反馈，告知用户跳过操作的结果。

## 6. 测试要点

### 6.1 功能测试

1. 点击跳过按钮，检查是否调用了正确的API
2. 检查API调用是否成功
3. 检查任务状态是否更新为跳过
4. 检查本地状态是否更新
5. 检查父组件是否收到任务状态变更通知
6. 检查是否显示了正确的用户反馈

### 6.2 边界测试

1. API调用失败时的处理
2. 本地存储没有操作人信息时的处理
3. 任务已经完成时，跳过按钮是否禁用
4. 任务已经跳过时，跳过按钮是否隐藏

## 7. 代码优化建议

### 7.1 封装跳过逻辑

将跳过逻辑封装为通用函数，便于不同任务类型复用：

```typescript
const handleSkipTask = async (taskId: string, addApi: any, defaultData: any) => {
  try {
    // 调用新增API
    const addResponse = await addApi(defaultData);
    if (addResponse.status !== '1') {
      ElMessage.error(`添加数据失败：${addResponse.error || '未知错误'}`);
      return false;
    }
    
    // 更新任务状态
    const result = await updateTaskStatusApi(taskId, props.caseId, '跳过');
    if (result.status === '1') {
      return true;
    } else {
      ElMessage.error('更新任务状态失败');
      return false;
    }
  } catch (error) {
    console.error('跳过任务失败:', error);
    ElMessage.error('跳过任务失败');
    return false;
  }
};
```

### 7.2 统一默认数据格式

为不同任务类型定义统一的默认数据格式，便于维护：

```typescript
interface DefaultTaskData {
  sep_ld: string;
  sepauser: string;
  sepadate: string;
  ZT: string;
  [key: string]: any;
}
```

### 7.3 使用枚举定义状态值

使用枚举定义任务状态值，提高代码可读性和可维护性：

```typescript
enum TaskStatus {
  PENDING = '未确认',
  COMPLETED = '完成',
  SKIPPED = '跳过',
}

enum TaskStatusCode {
  PENDING = '0',
  COMPLETED = '1',
  SKIPPED = '2',
}
```

## 8. 总结

跳过功能的实现需要调用对应的新增API添加默认数据，然后将任务状态设置为跳过。实现跳过功能时，需要注意：

1. 动态导入API，避免循环依赖
2. 从本地存储获取操作人信息
3. 正确处理API返回结果
4. 通知父组件任务状态变更
5. 提供友好的用户反馈

通过遵循上述实现步骤和注意事项，可以确保跳过功能的正确实现，提高系统的易用性和用户体验。