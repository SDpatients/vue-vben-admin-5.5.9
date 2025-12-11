// 操作记录数据结构
import { requestClient } from '#/api/request';

export interface OperationRecord {
  id: string;
  operator: string;
  operationTime: string;
  operationContent: string;
  operationModule: string;
  operationType: '删除' | '处理' | '新增' | '更新' | '查询';
}

// 全局操作记录存储
class OperationTracker {
  private maxRecords = 20;
  private records: OperationRecord[] = [];

  // 添加操作记录
  addRecord(record: Omit<OperationRecord, 'id'>) {
    const newRecord: OperationRecord = {
      ...record,
      id: Date.now().toString(),
    };

    this.records.unshift(newRecord);

    // 保持记录数量不超过最大值
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(0, this.maxRecords);
    }

    // 发送到后端API
    this.sendToBackend(newRecord);
  }

  // 清空操作记录
  clearRecords() {
    this.records = [];
  }

  // 获取当前用户（简化处理，实际项目中应该从store获取）
  getCurrentOperator(): string {
    // 这里应该从用户store获取当前登录用户
    return '管理员';
  }

  // 根据URL推断操作模块
  getOperationModule(url: string): string {
    if (url.includes('/user/')) return '用户管理';
    if (url.includes('/auth/')) return '认证管理';
    if (url.includes('/case/')) return '案件管理';
    if (url.includes('/creditor/')) return '债权人管理';
    if (url.includes('/debtor/')) return '债务人管理';
    if (url.includes('/menu/')) return '菜单管理';

    return '系统管理';
  }

  // 根据HTTP方法推断操作类型
  getOperationType(method: string): '删除' | '处理' | '新增' | '更新' | '查询' {
    const methodMap: Record<string, any> = {
      POST: '新增',
      PUT: '更新',
      PATCH: '更新',
      DELETE: '删除',
      GET: '查询',
    };

    return methodMap[method.toUpperCase()] || '处理';
  }

  // 获取所有操作记录（从本地存储）
  getRecords(): OperationRecord[] {
    return this.records;
  }

  // 从后端API获取所有操作记录
  async getRecordsFromBackend(
    page: number = 1,
    size: number = 20,
  ): Promise<{
    count: number;
    pages: number;
    records: any[];
  }> {
    const token = '46f6aecb8e27d95780f18459be9c4807';
    const response = await requestClient.get('/api/web/SelectAllAFollow', {
      params: {
        token,
        page,
        size,
      },
    });

    // 确保返回正确的数据结构
    if (response && response.data) {
      return {
        count: response.data.count || 0,
        pages: response.data.pages || 0,
        records: response.data.records || [],
      };
    }

    // 如果API响应格式不正确，返回空数据
    return {
      count: 0,
      pages: 0,
      records: [],
    };
  }

  // 发送操作记录到后端API
  private async sendToBackend(record: OperationRecord) {
    try {
      const operationData = {
        CZR: record.operator,
        CZSJ: record.operationTime,
        CZNR: record.operationContent,
        CZMK: record.operationModule,
      };

      const token = '79bc1eda632b6a569e4e0be4b33d3895';

      await requestClient.post('/api/web/addAFollow', operationData, {
        params: { token },
      });
    } catch (error) {
      console.error('操作记录API请求错误:', error);
    }
  }
}

// 创建全局实例
export const operationTracker = new OperationTracker();

// API请求拦截器
export function createApiTrackingInterceptor() {
  return {
    // 请求拦截器
    requestInterceptor: {
      fulfilled: (config: any) => {
        // 记录请求开始时间
        config.metadata = {
          startTime: Date.now(),
          url: config.url,
          method: config.method,
        };
        return config;
      },
      rejected: (error: any) => {
        return Promise.reject(error);
      },
    },

    // 响应拦截器
    responseInterceptor: {
      fulfilled: (response: any) => {
        const { config } = response;

        if (config.metadata) {
          const { url, method, startTime } = config.metadata;
          const endTime = Date.now();
          const duration = endTime - startTime;

          // 排除操作记录API本身，避免循环记录
          if (url && !url.includes('/api/web/addAFollow')) {
            const operationType = operationTracker.getOperationType(method);
            const operationModule = operationTracker.getOperationModule(url);
            const operator = operationTracker.getCurrentOperator();

            // 创建操作记录
            operationTracker.addRecord({
              operator,
              operationTime: new Date().toLocaleString('zh-CN'),
              operationContent: `${operationType}操作：${url} (耗时${duration}ms)`,
              operationModule,
              operationType,
            });
          }
        }

        return response;
      },
      rejected: (error: any) => {
        const { config } = error;

        if (config?.metadata) {
          const { url, method, startTime } = config.metadata;
          const endTime = Date.now();
          const duration = endTime - startTime;

          // 排除操作记录API本身
          if (url && !url.includes('/api/web/addAFollow')) {
            const operationType = operationTracker.getOperationType(method);
            const operationModule = operationTracker.getOperationModule(url);
            const operator = operationTracker.getCurrentOperator();

            // 创建失败的操作记录
            operationTracker.addRecord({
              operator,
              operationTime: new Date().toLocaleString('zh-CN'),
              operationContent: `${operationType}操作失败：${url} (耗时${duration}ms)`,
              operationModule,
              operationType,
            });
          }
        }

        return Promise.reject(error);
      },
    },
  };
}
