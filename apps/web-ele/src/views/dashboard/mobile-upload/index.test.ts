import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

// Mock vue-router
const mockRoute = {
  query: {
    token: 'test-token-123',
  },
};

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>',
    props: ['type', 'link', 'size', 'loading'],
  },
  ElCard: {
    name: 'ElCard',
    template: '<div><slot name="header" /><slot /></div>',
    props: ['shadow'],
  },
  ElEmpty: {
    name: 'ElEmpty',
    template: '<div>{{ description }}</div>',
    props: ['description'],
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<span><slot /></span>',
  },
  ElTag: {
    name: 'ElTag',
    template: '<span><slot /></span>',
    props: ['type', 'size'],
  },
  ElUpload: {
    name: 'ElUpload',
    template: '<div><slot /></div>',
    props: ['drag', 'multiple', 'autoUpload', 'showFileList', 'disabled', 'accept', 'onChange'],
  },
}));

// Mock @iconify/vue
vi.mock('@iconify/vue', () => ({
  Icon: {
    name: 'Icon',
    template: '<span>{{ icon }}</span>',
    props: ['icon'],
  },
}));

// Mock @element-plus/icons-vue
vi.mock('@element-plus/icons-vue', () => ({
  UploadFilled: {
    name: 'UploadFilled',
    template: '<span>UploadFilled</span>',
  },
  Delete: {
    name: 'Delete',
    template: '<span>Delete</span>',
  },
  Refresh: {
    name: 'Refresh',
    template: '<span>Refresh</span>',
  },
}));

// Mock API modules
vi.mock('#/api/core/temp-upload', () => ({
  validateTempUploadToken: vi.fn(),
  getTempUploadFiles: vi.fn(),
  mobileUploadFile: vi.fn(),
  mobileUploadBatch: vi.fn(),
}));

import MobileUpload from './index.vue';
import {
  validateTempUploadToken,
  getTempUploadFiles,
  mobileUploadFile,
  mobileUploadBatch,
} from '#/api/core/temp-upload';

describe('MobileUpload Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = { token: 'test-token-123' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createWrapper = () => {
    return mount(MobileUpload, {
      global: {
        stubs: {
          Icon: true,
          ElButton: true,
          ElCard: true,
          ElEmpty: true,
          ElIcon: true,
          ElTag: true,
          ElUpload: true,
          UploadFilled: true,
          Delete: true,
          Refresh: true,
        },
      },
    });
  };

  describe('Component Rendering', () => {
    it('should render component', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('should show loading state initially', () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;
      expect(vm.tokenLoading).toBe(true);
    });
  });

  describe('Token Validation', () => {
    it('should validate token on mount', async () => {
      vi.mocked(validateTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          token: 'test-token-123',
          bizType: 'case',
          userId: 1,
          expireTime: '2025-12-31T23:59:59Z',
          status: 'ACTIVE',
          fileCount: 0,
          description: '测试',
          createTime: '2025-01-01T00:00:00Z',
          qrCodeContent: 'http://example.com/upload?token=test-token-123',
        },
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [],
      });

      const wrapper = createWrapper();
      await nextTick();

      // Wait for onMounted to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(validateTempUploadToken).toHaveBeenCalledWith('test-token-123');
    });

    it('should handle valid token', async () => {
      vi.mocked(validateTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          token: 'test-token-123',
          bizType: 'case',
          userId: 1,
          expireTime: '2025-12-31T23:59:59Z',
          status: 'ACTIVE',
          fileCount: 0,
          description: '测试',
          createTime: '2025-01-01T00:00:00Z',
          qrCodeContent: 'http://example.com/upload?token=test-token-123',
        },
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await vm.validateToken();

      expect(vm.tokenValid).toBe(true);
      expect(vm.tokenError).toBe('');
      expect(ElMessage.success).toHaveBeenCalledWith('Token验证成功');
    });

    it('should handle invalid token', async () => {
      vi.mocked(validateTempUploadToken).mockResolvedValue({
        code: 400,
        message: 'Token无效',
        data: null as any,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await vm.validateToken();

      expect(vm.tokenValid).toBe(false);
      expect(vm.tokenError).toBe('Token无效或已过期');
      expect(ElMessage.error).toHaveBeenCalledWith('Token无效或已过期');
    });

    it('should handle missing token', async () => {
      mockRoute.query = {};

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = '';
      await vm.validateToken();

      expect(vm.tokenError).toBe('未提供Token');
      expect(vm.tokenLoading).toBe(false);
    });

    it('should handle token validation error', async () => {
      vi.mocked(validateTempUploadToken).mockRejectedValue(new Error('Network error'));

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await vm.validateToken();

      expect(vm.tokenValid).toBe(false);
      expect(ElMessage.error).toHaveBeenCalledWith('Token验证失败');
    });
  });

  describe('File List Loading', () => {
    it('should load file list after token validation', async () => {
      const mockFiles = [
        {
          id: 1,
          originalFileName: 'test.pdf',
          fileSize: 1024,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
          tokenId: 1,
          tempPath: '/tmp/test.pdf',
        },
      ];

      vi.mocked(validateTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          token: 'test-token-123',
          bizType: 'case',
          userId: 1,
          expireTime: '2025-12-31T23:59:59Z',
          status: 'ACTIVE',
          fileCount: 1,
          description: '测试',
          createTime: '2025-01-01T00:00:00Z',
          qrCodeContent: 'http://example.com/upload?token=test-token-123',
        },
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: mockFiles,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;
      await vm.loadFileList();

      expect(getTempUploadFiles).toHaveBeenCalledWith('test-token-123');
      expect(vm.fileList).toEqual(mockFiles);
    });

    it('should not load file list without token', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = '';
      vm.tokenValid = true;
      await vm.loadFileList();

      expect(getTempUploadFiles).not.toHaveBeenCalled();
    });

    it('should not load file list with invalid token', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = false;
      await vm.loadFileList();

      expect(getTempUploadFiles).not.toHaveBeenCalled();
    });

    it('should handle file list loading error', async () => {
      vi.mocked(getTempUploadFiles).mockRejectedValue(new Error('Network error'));

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;
      await vm.loadFileList();

      expect(ElMessage.error).toHaveBeenCalledWith('获取文件列表失败');
    });
  });

  describe('File Upload', () => {
    it('should upload single file successfully', async () => {
      vi.mocked(mobileUploadFile).mockResolvedValue({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          originalFileName: 'uploaded.pdf',
          fileSize: 1024,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
          tokenId: 1,
          tempPath: '/tmp/uploaded.pdf',
        },
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [
          {
            id: 1,
            originalFileName: 'uploaded.pdf',
            fileSize: 1024,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            uploadTime: '2025-01-01T00:00:00Z',
            tokenId: 1,
            tempPath: '/tmp/uploaded.pdf',
          },
        ],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await vm.handleFileChange({ raw: file });

      expect(mobileUploadFile).toHaveBeenCalledWith('test-token-123', file);
      expect(ElMessage.success).toHaveBeenCalledWith('文件 "test.pdf" 上传成功');
    });

    it('should reject upload without valid token', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = false;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await vm.handleFileChange({ raw: file });

      expect(mobileUploadFile).not.toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('Token无效，无法上传');
    });

    it('should reject files exceeding size limit', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;

      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      await vm.handleFileChange({ raw: largeFile });

      expect(mobileUploadFile).not.toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith(expect.stringContaining('文件大小不能超过'));
    });

    it('should handle upload error', async () => {
      vi.mocked(mobileUploadFile).mockRejectedValue(new Error('Upload failed'));

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await vm.handleFileChange({ raw: file });

      expect(ElMessage.error).toHaveBeenCalledWith('Upload failed');
    });

    it('should batch upload files', async () => {
      vi.mocked(mobileUploadBatch).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [
          {
            id: 1,
            originalFileName: 'file1.pdf',
            fileSize: 1024,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            uploadTime: '2025-01-01T00:00:00Z',
            tokenId: 1,
            tempPath: '/tmp/file1.pdf',
          },
          {
            id: 2,
            originalFileName: 'file2.pdf',
            fileSize: 2048,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            uploadTime: '2025-01-01T00:00:00Z',
            tokenId: 1,
            tempPath: '/tmp/file2.pdf',
          },
        ],
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [
          {
            id: 1,
            originalFileName: 'file1.pdf',
            fileSize: 1024,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            uploadTime: '2025-01-01T00:00:00Z',
            tokenId: 1,
            tempPath: '/tmp/file1.pdf',
          },
          {
            id: 2,
            originalFileName: 'file2.pdf',
            fileSize: 2048,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            uploadTime: '2025-01-01T00:00:00Z',
            tokenId: 1,
            tempPath: '/tmp/file2.pdf',
          },
        ],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;

      const files = [
        { raw: new File(['content1'], 'file1.pdf', { type: 'application/pdf' }) },
        { raw: new File(['content2'], 'file2.pdf', { type: 'application/pdf' }) },
      ];
      await vm.handleFilesChange(files);

      expect(mobileUploadBatch).toHaveBeenCalled();
      expect(ElMessage.success).toHaveBeenCalledWith('成功上传 2 个文件');
    });

    it('should skip oversized files in batch upload', async () => {
      vi.mocked(mobileUploadBatch).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [
          {
            id: 1,
            originalFileName: 'valid.pdf',
            fileSize: 1024,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            uploadTime: '2025-01-01T00:00:00Z',
            tokenId: 1,
            tempPath: '/tmp/valid.pdf',
          },
        ],
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [
          {
            id: 1,
            originalFileName: 'valid.pdf',
            fileSize: 1024,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            uploadTime: '2025-01-01T00:00:00Z',
            tokenId: 1,
            tempPath: '/tmp/valid.pdf',
          },
        ],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;

      const files = [
        { raw: new File(['content'], 'valid.pdf', { type: 'application/pdf' }) },
        { raw: new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' }) },
      ];
      await vm.handleFilesChange(files);

      expect(ElMessage.warning).toHaveBeenCalledWith(expect.stringContaining('超过大小限制'));
      expect(mobileUploadBatch).toHaveBeenCalledWith('test-token-123', [expect.any(File)]);
    });
  });

  describe('Utility Functions', () => {
    it('should format file size correctly', () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      expect(vm.formatFileSize(0)).toBe('0 B');
      expect(vm.formatFileSize(1024)).toBe('1 KB');
      expect(vm.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(vm.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should get correct file icon', () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      const file = {
        fileExtension: 'pdf',
      };

      expect(vm.getFileIcon(file)).toBe('lucide:file-text');
    });

    it('should handle file icon for unknown extension', () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      const file = {
        fileExtension: 'unknown',
      };

      expect(vm.getFileIcon(file)).toBe('lucide:file');
    });
  });

  describe('File Operations', () => {
    it('should handle file delete', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      const file = {
        id: 1,
        originalFileName: 'test.pdf',
        fileSize: 1024,
        fileExtension: 'pdf',
        mimeType: 'application/pdf',
        uploadTime: '2025-01-01T00:00:00Z',
        tokenId: 1,
        tempPath: '/tmp/test.pdf',
      };

      await vm.handleDelete(file);

      expect(ElMessage.info).toHaveBeenCalledWith('暂不支持删除已上传的文件');
    });

    it('should handle refresh', async () => {
      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.token = 'test-token-123';
      vm.tokenValid = true;
      await vm.handleRefresh();

      expect(getTempUploadFiles).toHaveBeenCalledWith('test-token-123');
      expect(ElMessage.success).toHaveBeenCalledWith('刷新成功');
    });
  });

  describe('Business Info', () => {
    it('should return business info when files exist', () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.fileList = [
        {
          id: 1,
          originalFileName: 'test.pdf',
          fileSize: 1024,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
          tokenId: 1,
          tempPath: '/tmp/test.pdf',
          token: 'test-token-123',
        },
      ];

      expect(vm.bizInfo).toEqual({
        bizType: 'test-token-123',
        fileCount: 1,
      });
    });

    it('should return null when no files exist', () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.fileList = [];

      expect(vm.bizInfo).toBeNull();
    });
  });

  describe('Debug Info', () => {
    it('should collect debug info on mount', async () => {
      vi.mocked(validateTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          token: 'test-token-123',
          bizType: 'case',
          userId: 1,
          expireTime: '2025-12-31T23:59:59Z',
          status: 'ACTIVE',
          fileCount: 0,
          description: '测试',
          createTime: '2025-01-01T00:00:00Z',
          qrCodeContent: 'http://example.com/upload?token=test-token-123',
        },
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await nextTick();

      expect(vm.debugInfo.url).toBe(window.location.href);
      expect(vm.debugInfo.query).toContain('test-token-123');
    });
  });
});
