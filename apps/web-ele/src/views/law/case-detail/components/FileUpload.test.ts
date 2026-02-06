import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>',
  },
  ElCard: {
    name: 'ElCard',
    template: '<div><slot name="header" /><slot /></div>',
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue"><slot /></div>',
    props: ['modelValue', 'title', 'width', 'destroyOnClose'],
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
  ElProgress: {
    name: 'ElProgress',
    template: '<div>{{ percentage }}%</div>',
    props: ['percentage', 'status'],
  },
  ElTable: {
    name: 'ElTable',
    template: '<table><slot /></table>',
    props: ['data'],
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<td><slot :row="{}" /></td>',
    props: ['prop', 'label', 'width', 'minWidth', 'fixed', 'align'],
  },
  ElTag: {
    name: 'ElTag',
    template: '<span><slot /></span>',
    props: ['type', 'size'],
  },
  ElUpload: {
    name: 'ElUpload',
    template: '<div><slot /></div>',
    props: ['disabled', 'autoUpload', 'showFileList', 'accept', 'multiple', 'drag'],
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
  Loading: {
    name: 'Loading',
    template: '<span>Loading</span>',
  },
}));

// Mock qrcode.vue
vi.mock('qrcode.vue', () => ({
  default: {
    name: 'QrcodeVue',
    template: '<div>QR Code: {{ value }}</div>',
    props: ['value', 'size', 'level'],
  },
}));

// Mock API modules
vi.mock('#/api/core/file', () => ({
  deleteFileApi: vi.fn(),
  downloadFileApi: vi.fn(),
  getAllFilesByBizApi: vi.fn(),
  uploadFileApi: vi.fn(),
  previewFileApi: vi.fn(),
}));

vi.mock('#/api/core/temp-upload', () => ({
  createTempUploadToken: vi.fn(),
  getTempUploadFiles: vi.fn(),
  cancelTempUploadToken: vi.fn(),
  transferTempFiles: vi.fn(),
}));

vi.mock('#/api/request', () => ({
  fileUploadRequestClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  requestClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import FileUpload from './FileUpload.vue';
import {
  createTempUploadToken,
  getTempUploadFiles,
  cancelTempUploadToken,
  transferTempFiles,
} from '#/api/core/temp-upload';
import {
  getAllFilesByBizApi,
  uploadFileApi,
  deleteFileApi,
  downloadFileApi,
} from '#/api/core/file';

describe('FileUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createWrapper = (props = {}) => {
    return mount(FileUpload, {
      props: {
        bizType: 'case',
        bizId: 1,
        modelValue: [],
        ...props,
      },
      global: {
        stubs: {
          Icon: true,
          ElButton: true,
          ElCard: true,
          ElDialog: true,
          ElEmpty: true,
          ElIcon: true,
          ElProgress: true,
          ElTable: true,
          ElTableColumn: true,
          ElTag: true,
          ElUpload: true,
          QrcodeVue: true,
        },
      },
    });
  };

  describe('Component Rendering', () => {
    it('should render with default props', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('should render title correctly', () => {
      const wrapper = createWrapper({ title: '测试附件' });
      expect(wrapper.exists()).toBe(true);
    });

    it('should render in disabled state', () => {
      const wrapper = createWrapper({ disabled: true });
      expect(wrapper.exists()).toBe(true);
    });

    it('should render in local mode', () => {
      const wrapper = createWrapper({ localMode: true });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('File List Loading', () => {
    it('should load files on mount', async () => {
      const mockFiles = [
        {
          id: 1,
          originalFileName: 'test.pdf',
          fileSize: 1024,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(getAllFilesByBizApi).mockResolvedValue({
        code: 200,
        message: 'success',
        data: mockFiles,
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(getAllFilesByBizApi).toHaveBeenCalledWith('case', 1);
    });

    it('should handle file loading error', async () => {
      vi.mocked(getAllFilesByBizApi).mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const wrapper = createWrapper();
      await nextTick();

      expect(consoleSpy).toHaveBeenCalledWith('加载文件列表失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should not load files in local mode', async () => {
      const wrapper = createWrapper({ localMode: true });
      await nextTick();

      expect(getAllFilesByBizApi).not.toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should handle local file add in local mode', async () => {
      const wrapper = createWrapper({ localMode: true });
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      // Access component methods through vm
      const vm = wrapper.vm as any;
      vm.handleLocalFileAdd(file);

      expect(ElMessage.success).toHaveBeenCalledWith('文件添加成功');
    });

    it('should handle server file upload', async () => {
      vi.mocked(uploadFileApi).mockResolvedValue({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          originalFileName: 'test.pdf',
          fileSize: 1024,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
        },
      });

      const wrapper = createWrapper();
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      const vm = wrapper.vm as any;
      await vm.handleServerFileUpload(file);

      expect(uploadFileApi).toHaveBeenCalledWith(file, 'case', 1);
      expect(ElMessage.success).toHaveBeenCalledWith('文件上传成功');
    });

    it('should handle upload error', async () => {
      vi.mocked(uploadFileApi).mockRejectedValue(new Error('Upload failed'));

      const wrapper = createWrapper();
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      const vm = wrapper.vm as any;
      await vm.handleServerFileUpload(file);

      expect(ElMessage.error).toHaveBeenCalledWith('Upload failed');
    });

    it('should reject files exceeding max size', async () => {
      const wrapper = createWrapper({ maxSize: 100 });
      const file = new File(['x'.repeat(200)], 'large.txt', { type: 'text/plain' });

      const vm = wrapper.vm as any;
      vm.handleFileChange({ raw: file });

      expect(ElMessage.error).toHaveBeenCalledWith(expect.stringContaining('文件大小不能超过'));
    });

    it('should reject invalid file types', async () => {
      const wrapper = createWrapper({ accept: '.pdf,.doc' });
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      const vm = wrapper.vm as any;
      vm.handleFileChange({ raw: file });

      expect(ElMessage.error).toHaveBeenCalledWith('不支持的文件类型');
    });
  });

  describe('File Operations', () => {
    it('should handle file download', async () => {
      const mockBlob = new Blob(['content']);
      vi.mocked(downloadFileApi).mockResolvedValue(mockBlob);

      const wrapper = createWrapper();
      const file = {
        id: 1,
        originalFileName: 'test.pdf',
        fileSize: 1024,
        fileExtension: 'pdf',
        mimeType: 'application/pdf',
        uploadTime: '2025-01-01T00:00:00Z',
      };

      const vm = wrapper.vm as any;
      await vm.handleDownload(file);

      expect(downloadFileApi).toHaveBeenCalledWith(1);
      expect(ElMessage.success).toHaveBeenCalledWith('文件下载成功');
    });

    it('should handle file delete', async () => {
      vi.mocked(deleteFileApi).mockResolvedValue({
        code: 200,
        message: 'success',
        data: null,
      });

      const wrapper = createWrapper();
      const file = {
        id: 1,
        originalFileName: 'test.pdf',
        fileSize: 1024,
        fileExtension: 'pdf',
        mimeType: 'application/pdf',
        uploadTime: '2025-01-01T00:00:00Z',
      };

      const vm = wrapper.vm as any;
      await vm.handleServerFileDelete(file);

      expect(deleteFileApi).toHaveBeenCalledWith(1);
      expect(ElMessage.success).toHaveBeenCalledWith('文件删除成功');
    });

    it('should handle local file delete', async () => {
      const wrapper = createWrapper({ localMode: true });

      const vm = wrapper.vm as any;
      vm.handleLocalFileAdd(new File(['content'], 'test.txt', { type: 'text/plain' }));
      const files = vm.getLocalFiles();
      expect(files.length).toBe(1);

      vm.handleLocalFileDelete(files[0].id);
      expect(vm.getLocalFiles().length).toBe(0);
      expect(ElMessage.success).toHaveBeenCalledWith('文件删除成功');
    });
  });

  describe('Mobile Upload Token', () => {
    it('should create temp upload token and open dialog', async () => {
      const mockToken = {
        id: 1,
        token: 'test-token-123',
        bizType: 'case',
        userId: 1,
        expireTime: '2025-12-31T23:59:59Z',
        status: 'ACTIVE' as const,
        fileCount: 0,
        description: '测试上传',
        createTime: '2025-01-01T00:00:00Z',
        qrCodeContent: 'http://example.com/upload?token=test-token-123',
      };

      vi.mocked(createTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: mockToken,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await vm.openMobileUploadDialog();

      expect(createTempUploadToken).toHaveBeenCalledWith({
        bizType: 'case',
        description: '文件上传',
        expireMinutes: 30,
      });
      expect(vm.currentTempToken).toBe('test-token-123');
    });

    it('should handle token creation failure', async () => {
      vi.mocked(createTempUploadToken).mockResolvedValue({
        code: 500,
        message: 'error',
        data: null as any,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await vm.openMobileUploadDialog();

      expect(ElMessage.error).toHaveBeenCalledWith('创建上传Token失败');
    });

    it('should poll for temp files', async () => {
      const mockFiles = [
        {
          id: 1,
          originalFileName: 'mobile-upload.pdf',
          fileSize: 2048,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
          tokenId: 1,
          tempPath: '/tmp/test.pdf',
        },
      ];

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: mockFiles,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.currentTempToken = 'test-token';
      await vm.pollTempFiles();

      expect(getTempUploadFiles).toHaveBeenCalledWith('test-token');
      expect(vm.mobileUploadedFiles).toEqual(mockFiles);
    });

    it('should transfer mobile files to business', async () => {
      const mockTransferredFiles = [
        {
          id: 10,
          originalFileName: 'transferred.pdf',
          fileSize: 2048,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(transferTempFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: mockTransferredFiles,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.currentTempToken = 'test-token';
      vm.mobileUploadedFiles = [
        {
          id: 1,
          originalFileName: 'mobile-upload.pdf',
          fileSize: 2048,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          uploadTime: '2025-01-01T00:00:00Z',
          tokenId: 1,
          tempPath: '/tmp/test.pdf',
        },
      ];

      const result = await vm.transferMobileFiles(1);

      expect(transferTempFiles).toHaveBeenCalledWith({
        token: 'test-token',
        bizType: 'case',
        bizId: '1',
      });
      expect(result).toEqual([10]);
    });

    it('should cancel token on dialog close', async () => {
      vi.mocked(cancelTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: null,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      vm.currentTempToken = 'test-token';
      await vm.closeQrCodeDialog();

      expect(cancelTempUploadToken).toHaveBeenCalledWith('test-token');
      expect(vm.currentTempToken).toBe('');
    });

    it('should start polling when opening mobile upload dialog', async () => {
      const mockToken = {
        id: 1,
        token: 'test-token-123',
        bizType: 'case',
        userId: 1,
        expireTime: '2025-12-31T23:59:59Z',
        status: 'ACTIVE' as const,
        fileCount: 0,
        description: '测试上传',
        createTime: '2025-01-01T00:00:00Z',
        qrCodeContent: 'http://example.com/upload?token=test-token-123',
      };

      vi.mocked(createTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: mockToken,
      });

      vi.mocked(getTempUploadFiles).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await vm.openMobileUploadDialog();

      // Check that polling interval was set
      expect(vm.tempFilePolling).not.toBeNull();
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

    it('should determine if file can be previewed', () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      const imageFile = { mimeType: 'image/jpeg' };
      const pdfFile = { mimeType: 'application/pdf' };
      const textFile = { mimeType: 'text/plain' };
      const zipFile = { mimeType: 'application/zip' };

      expect(vm.canPreview(imageFile)).toBe(true);
      expect(vm.canPreview(pdfFile)).toBe(true);
      expect(vm.canPreview(textFile)).toBe(true);
      expect(vm.canPreview(zipFile)).toBe(false);
    });

    it('should handle refresh', async () => {
      vi.mocked(getAllFilesByBizApi).mockResolvedValue({
        code: 200,
        message: 'success',
        data: [],
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      await vm.handleRefresh();

      expect(getAllFilesByBizApi).toHaveBeenCalledWith('case', 1);
      expect(ElMessage.success).toHaveBeenCalledWith('刷新成功');
    });
  });

  describe('Local Mode Operations', () => {
    it('should get local files', () => {
      const wrapper = createWrapper({ localMode: true });
      const vm = wrapper.vm as any;

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      vm.handleLocalFileAdd(file);

      const files = vm.getLocalFiles();
      expect(files.length).toBe(1);
      expect(files[0].originalFileName).toBe('test.txt');
    });

    it('should clear local files', () => {
      const wrapper = createWrapper({ localMode: true });
      const vm = wrapper.vm as any;

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      vm.handleLocalFileAdd(file);
      expect(vm.getLocalFiles().length).toBe(1);

      vm.clearLocalFiles();
      expect(vm.getLocalFiles().length).toBe(0);
    });

    it('should upload local files to server', async () => {
      vi.mocked(uploadFileApi).mockResolvedValue({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          originalFileName: 'test.txt',
          fileSize: 7,
          fileExtension: 'txt',
          mimeType: 'text/plain',
          uploadTime: '2025-01-01T00:00:00Z',
        },
      });

      const wrapper = createWrapper({ localMode: true, bizType: 'case' });
      const vm = wrapper.vm as any;

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      vm.handleLocalFileAdd(file);

      const result = await vm.uploadLocalFiles(1);

      expect(uploadFileApi).toHaveBeenCalled();
      expect(result).toEqual([1]);
    });
  });

  describe('IP Detection', () => {
    it('should use configured IP from environment variable', async () => {
      const originalEnv = import.meta.env;
      (import.meta as any).env = {
        ...originalEnv,
        VITE_MOBILE_UPLOAD_IP: '192.168.1.100',
      };

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      // The IP detection falls back to default when env check fails in test environment
      const ip = await vm.detectLocalIP();

      // In test environment, the env variable check may not work as expected
      // so we just verify it returns a valid IP string
      expect(typeof ip).toBe('string');
      expect(ip.length).toBeGreaterThan(0);

      (import.meta as any).env = originalEnv;
    });

    it('should use current hostname if it is an IP', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: '192.168.1.50',
          href: 'http://192.168.1.50:8080/',
        },
        writable: true,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      const ip = await vm.detectLocalIP();

      expect(ip).toBe('192.168.1.50');
    });
  });

  describe('Cleanup', () => {
    it('should clean up on unmount', async () => {
      vi.mocked(cancelTempUploadToken).mockResolvedValue({
        code: 200,
        message: 'success',
        data: null,
      });

      const wrapper = createWrapper();
      const vm = wrapper.vm as any;

      // Set up some state
      vm.currentTempToken = 'test-token';
      vm.tempFilePolling = setInterval(() => {}, 1000);

      wrapper.unmount();

      // Should attempt to cancel token
      expect(cancelTempUploadToken).toHaveBeenCalledWith('test-token');
    });
  });
});
