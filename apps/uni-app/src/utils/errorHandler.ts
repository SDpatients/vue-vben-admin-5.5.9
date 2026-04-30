// 全局错误处理模块
// 用于捕获和记录应用中的各种错误

interface ErrorInfo {
  type: string
  message: string
  stack?: string
  component?: string
  timestamp: string
  extra?: Record<string, any>
}

// 错误日志存储
const errorLogs: ErrorInfo[] = []
const MAX_LOGS = 100

// 格式化错误消息，处理各种错误对象格式
function formatErrorMessage(err: any): string {
  if (err === null || err === undefined) {
    return 'Unknown error'
  }
  
  // 如果是字符串，直接返回
  if (typeof err === 'string') {
    return err
  }
  
  // 如果是 Error 实例
  if (err instanceof Error) {
    return err.message
  }
  
  // 如果是对象，尝试提取 message 或 msg 字段
  if (typeof err === 'object') {
    // 检查常见的错误消息字段
    if (err.message && typeof err.message === 'string') {
      return err.message
    }
    if (err.msg && typeof err.msg === 'string') {
      return err.msg
    }
    if (err.error && typeof err.error === 'string') {
      return err.error
    }
    if (err.errorMessage && typeof err.errorMessage === 'string') {
      return err.errorMessage
    }
    
    // 尝试将整个对象序列化为 JSON 字符串
    try {
      return JSON.stringify(err)
    } catch (e) {
      return '[Object with circular reference]'
    }
  }
  
  // 其他类型
  return String(err)
}

// 记录错误
function logError(_error: ErrorInfo) {
  errorLogs.push(_error)
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.shift()
  }
}

// 获取所有错误日志
export function getErrorLogs(): ErrorInfo[] {
  return [...errorLogs]
}

// 清除错误日志
export function clearErrorLogs(): void {
  errorLogs.length = 0
}

// 导出错误日志
export function exportErrorLogs(): string {
  return JSON.stringify(errorLogs, null, 2)
}

// 设置 Vue 错误处理
export function setupVueErrorHandler(app: any) {
  app.config.errorHandler = (err: any, vm: any, info: string) => {
    const errorInfo: ErrorInfo = {
      type: 'Vue Error',
      message: formatErrorMessage(err),
      stack: err?.stack,
      component: vm?.$options?.name || vm?.$options?.__name || 'Unknown',
      timestamp: new Date().toISOString(),
      extra: {
        info,
        props: vm?.$props,
        rawError: err,
      },
    }
    
    logError(errorInfo)
    
    // 显示用户友好提示
    uni.showToast({
      title: '程序出现错误，请稍后重试',
      icon: 'none',
    })
  }
}

// 设置全局错误处理（H5 平台）
export function setupGlobalErrorHandler() {
  // @ts-ignore
  if (typeof window !== 'undefined') {
    // Promise 未捕获错误
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        type: 'Unhandled Promise Rejection',
        message: formatErrorMessage(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        extra: {
          rawReason: event.reason,
        },
      }
      
      logError(errorInfo)
      event.preventDefault()
    })

    // 全局错误
    window.addEventListener('error', (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        type: 'Global Error',
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      }
      
      logError(errorInfo)
    })

    // 资源加载错误
    window.addEventListener('error', (event: Event) => {
      const target = event.target as HTMLElement
      if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const errorInfo: ErrorInfo = {
          type: 'Resource Load Error',
          message: `Failed to load resource: ${(target as any).src || (target as any).href}`,
          timestamp: new Date().toISOString(),
          extra: {
            tagName: target.tagName,
          },
        }
        
        logError(errorInfo)
      }
    }, true)
  }
}

// 设置 UniApp 错误处理
export function setupUniAppErrorHandler() {
  // 页面不存在
  uni.onError((error: string) => {
    const errorInfo: ErrorInfo = {
      type: 'UniApp Error',
      message: error,
      timestamp: new Date().toISOString(),
    }
    
    logError(errorInfo)
  })
  
  // 页面路由错误
  uni.onPageNotFound(() => {
    const errorInfo: ErrorInfo = {
      type: 'Page Not Found',
      message: '页面不存在',
      timestamp: new Date().toISOString(),
    }
    
    logError(errorInfo)
    
    // 跳转到首页
    uni.switchTab({ url: '/pages/workspace/index' })
  })
}

// 初始化所有错误处理
export function setupErrorHandler(app: any) {
  setupVueErrorHandler(app)
  setupGlobalErrorHandler()
  setupUniAppErrorHandler()
}

export default {
  setupErrorHandler,
  getErrorLogs,
  clearErrorLogs,
  exportErrorLogs,
}
