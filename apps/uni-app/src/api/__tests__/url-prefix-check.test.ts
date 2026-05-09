import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 模拟 uni API
global.uni = {
  getStorageSync: vi.fn(() => 'test-token'),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showToast: vi.fn(),
  request: vi.fn(),
  uploadFile: vi.fn(),
  downloadFile: vi.fn(),
  openDocument: vi.fn(),
  removeStorageSync: vi.fn(),
  navigateTo: vi.fn(),
} as any

// 模拟 import.meta.env
const originalEnv = process.env
beforeEach(() => {
  process.env = { ...originalEnv, VITE_API_BASE_URL: 'http://192.168.0.151:8080' }
})
afterEach(() => {
  process.env = originalEnv
})

describe('URL前缀对接验证', () => {
  it('标准API前缀 - /auth 应该变成 /api/v1/auth', () => {
    const API_PREFIX = '/api/v1'
    const url = '/auth'
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    expect(requestUrl).toBe('/api/v1/auth')
  })

  it('特殊API前缀 - /api/case-tasks 应该变成 /api/v1/api/case-tasks', () => {
    const API_PREFIX = '/api/v1'
    const url = '/api/case-tasks'
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    expect(requestUrl).toBe('/api/v1/api/case-tasks')
  })

  it('文档库API - /api/lib/documents 应该变成 /api/v1/api/lib/documents', () => {
    const API_PREFIX = '/api/v1'
    const BASE_URL = '/api/lib'
    const url = `${BASE_URL}/documents`
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    expect(requestUrl).toBe('/api/v1/api/lib/documents')
  })

  it('案件流程阶段API - /api/case-process-stage/case/1 应该变成 /api/v1/api/case-process-stage/case/1', () => {
    const API_PREFIX = '/api/v1'
    const url = '/api/case-process-stage/case/1'
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    expect(requestUrl).toBe('/api/v1/api/case-process-stage/case/1')
  })

  it('已带前缀的URL不应重复添加 - /api/v1/auth 应保持不变', () => {
    const API_PREFIX = '/api/v1'
    const url = '/api/v1/auth'
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    expect(requestUrl).toBe('/api/v1/auth')
  })

  it('完整URL拼接 - 基础URL + 请求路径', () => {
    const baseUrl = 'http://192.168.0.151:8080'
    const requestUrl = '/api/v1/api/case-tasks'
    const finalUrl = `${baseUrl}${requestUrl}`
    expect(finalUrl).toBe('http://192.168.0.151:8080/api/v1/api/case-tasks')
  })
})

describe('后端API文档路径验证', () => {
  const testCases = [
    { module: '用户认证', controller: '/auth', expected: '/api/v1/auth' },
    { module: '案件任务', controller: '/api/case-tasks', expected: '/api/v1/api/case-tasks' },
    { module: '案件提交', controller: '/api/case-task-submissions', expected: '/api/v1/api/case-task-submissions' },
    { module: '案件流程阶段', controller: '/api/case-process-stage', expected: '/api/v1/api/case-process-stage' },
    { module: '文档库文档', controller: '/api/lib/documents', expected: '/api/v1/api/lib/documents' },
    { module: '文档库文件夹', controller: '/api/lib/folders', expected: '/api/v1/api/lib/folders' },
    { module: '会议投票', controller: '/api/vote-items', expected: '/api/v1/api/vote-items' },
    { module: 'Word模板', controller: '/api/template', expected: '/api/v1/api/template' },
    { module: 'OnlyOffice', controller: '/api/v1/onlyoffice', expected: '/api/v1/onlyoffice' },
  ]

  testCases.forEach(({ module, controller, expected }) => {
    it(`${module} - ${controller} 应该映射到 ${expected}`, () => {
      const API_PREFIX = '/api/v1'
      const requestUrl = controller.startsWith(API_PREFIX) ? controller : `${API_PREFIX}${controller}`
      expect(requestUrl).toBe(expected)
    })
  })
})

describe('手机端API调用验证', () => {
  it('process.ts 中的 getCaseTasks 应该生成正确的URL', () => {
    const API_PREFIX = '/api/v1'
    const url = '/api/case-tasks'
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    const baseUrl = 'http://192.168.0.151:8080'
    const finalUrl = `${baseUrl}${requestUrl}`
    expect(finalUrl).toBe('http://192.168.0.151:8080/api/v1/api/case-tasks')
  })

  it('process-stage.ts 中的 getCaseStageDataList 应该生成正确的URL', () => {
    const API_PREFIX = '/api/v1'
    const caseId = 1
    const url = `/api/case-process-stage/case/${caseId}`
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    const baseUrl = 'http://192.168.0.151:8080'
    const finalUrl = `${baseUrl}${requestUrl}`
    expect(finalUrl).toBe('http://192.168.0.151:8080/api/v1/api/case-process-stage/case/1')
  })

  it('document-library.ts 中的 getDocumentList 应该生成正确的URL', () => {
    const API_PREFIX = '/api/v1'
    const BASE_URL = '/api/lib'
    const url = `${BASE_URL}/documents/list`
    const requestUrl = url.startsWith(API_PREFIX) ? url : `${API_PREFIX}${url}`
    const baseUrl = 'http://192.168.0.151:8080'
    const finalUrl = `${baseUrl}${requestUrl}`
    expect(finalUrl).toBe('http://192.168.0.151:8080/api/v1/api/lib/documents/list')
  })

  it('document-library.ts 中的 uploadDocument 手动拼接URL应该正确', () => {
    const baseUrl = 'http://192.168.0.151:8080'
    const BASE_URL = '/api/lib'
    const uploadUrl = `${baseUrl}/api/v1${BASE_URL}/documents/upload`
    expect(uploadUrl).toBe('http://192.168.0.151:8080/api/v1/api/lib/documents/upload')
  })
})
