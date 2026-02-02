import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import FileUploader from './FileUploader.vue';
import * as fileApi from '#/api/core/file';

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElCard: { name: 'ElCard', template: '<div class="el-card"><slot /></div>' },
  ElDialog: { name: 'ElDialog', template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue'] },
  ElMessage: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  ElUpload: { name: 'ElUpload', template: '<div class="el-upload"><slot /></div>' },
  ElProgress: { name: 'ElProgress', template: '<div class="progress" />' },
}));

// Mock Icon 组件
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span class="icon" />' },
}));

// Mock File API
vi.mock('#/api/core/file', () => ({
  deleteFileApi: vi.fn(),
  downloadFileApi: vi.fn(),
  getFileListApi: vi.fn(),
  getFilePreviewUrl: vi.fn((id) => `/api/file/preview/${id}`),
  uploadFileApi: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('FileUploader', () => {
  const defaultProps = {
    bizId: 1,
    bizType: 'case',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.file-uploader-component').exists()).toBe(true);
  });

  it('fetches file list on mount', async () => {
    const mockResponse = {
      code: 200,
      data: {
        list: [
          {
            id: 1,
            originalFileName: 'test.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
            uploadTime: '2024-01-15T10:00:00',
          },
        ],
      },
    };

    vi.mocked(fileApi.getFileListApi).mockResolvedValue(mockResponse);

    mount(FileUploader, {
      props: defaultProps,
    });

    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(fileApi.getFileListApi).toHaveBeenCalledWith('case', 1);
  });

  it('formats file size correctly', () => {
    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    expect(wrapper.vm.formatFileSize(500)).toBe('500 B');
    expect(wrapper.vm.formatFileSize(1024)).toBe('1.0 KB');
    expect(wrapper.vm.formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(wrapper.vm.formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    expect(wrapper.vm.formatFileSize(undefined)).toBe('0 B');
  });

  it('computes allowed types description correctly', () => {
    const wrapper = mount(FileUploader, {
      props: {
        ...defaultProps,
        allowedTypes: ['.pdf', '.doc', '.jpg'],
      },
    });

    expect(wrapper.vm.allowedTypesDesc).toBe('.pdf, .doc, .jpg');
  });

  it('validates file type before upload', () => {
    const wrapper = mount(FileUploader, {
      props: {
        ...defaultProps,
        allowedTypes: ['.pdf', '.doc'],
      },
    });

    const validFile = { name: 'test.pdf', size: 1024 } as any;
    const invalidFile = { name: 'test.exe', size: 1024 } as any;

    expect(wrapper.vm.beforeUpload(validFile)).toBe(true);
    expect(wrapper.vm.beforeUpload(invalidFile)).toBe(false);
  });

  it('validates file size before upload', () => {
    const wrapper = mount(FileUploader, {
      props: {
        ...defaultProps,
        maxSize: 1024, // 1KB
      },
    });

    const validFile = { name: 'test.pdf', size: 512 } as any;
    const invalidFile = { name: 'test.pdf', size: 2048 } as any;

    expect(wrapper.vm.beforeUpload(validFile)).toBe(true);
    expect(wrapper.vm.beforeUpload(invalidFile)).toBe(false);
  });

  it('handles file upload successfully', async () => {
    const mockResponse = {
      code: 200,
      data: {
        id: 1,
        originalFileName: 'uploaded.pdf',
        fileSize: 2048,
      },
    };

    vi.mocked(fileApi.uploadFileApi).mockResolvedValue(mockResponse);

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    const mockFile = { name: 'test.pdf', size: 1024 } as any;
    const mockOptions = {
      file: mockFile,
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await wrapper.vm.handleUpload(mockOptions);

    expect(fileApi.uploadFileApi).toHaveBeenCalledWith(mockFile, 'case', 1);
    expect(mockOptions.onSuccess).toHaveBeenCalled();
  });

  it('emits events on upload success', async () => {
    const mockResponse = {
      code: 200,
      data: { id: 1 },
    };

    vi.mocked(fileApi.uploadFileApi).mockResolvedValue(mockResponse);

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    const mockFile = { name: 'test.pdf', size: 1024 } as any;
    const mockOptions = {
      file: mockFile,
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await wrapper.vm.handleUpload(mockOptions);

    expect(wrapper.emitted('upload-success')).toBeTruthy();
    expect(wrapper.emitted('file-list-change')).toBeTruthy();
  });

  it('handles upload error', async () => {
    vi.mocked(fileApi.uploadFileApi).mockRejectedValue(new Error('Upload failed'));

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    const mockFile = { name: 'test.pdf', size: 1024 } as any;
    const mockOptions = {
      file: mockFile,
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await wrapper.vm.handleUpload(mockOptions);

    expect(wrapper.emitted('upload-error')).toBeTruthy();
  });

  it('handles file deletion', async () => {
    const mockResponse = { code: 200 };
    vi.mocked(fileApi.deleteFileApi).mockResolvedValue(mockResponse);

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    // 设置文件列表
    wrapper.vm.fileList = [
      {
        uid: 1,
        name: 'test.pdf',
        size: 1024,
        status: 'success',
        response: { id: 1 },
      },
    ];

    const fileToRemove = wrapper.vm.fileList[0];
    await wrapper.vm.handleRemove(fileToRemove);

    expect(fileApi.deleteFileApi).toHaveBeenCalledWith(1);
    expect(wrapper.vm.fileList).toHaveLength(0);
  });

  it('handles file download', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    vi.mocked(fileApi.downloadFileApi).mockResolvedValue(mockBlob);

    // Mock URL methods
    const mockUrl = 'blob:test';
    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = vi.fn();

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    const fileToDownload = {
      uid: 1,
      name: 'test.pdf',
      size: 1024,
      response: { id: 1 },
    };

    await wrapper.vm.handleDownload(fileToDownload);

    expect(fileApi.downloadFileApi).toHaveBeenCalledWith(1);
  });

  it('computes file type correctly', () => {
    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    wrapper.vm.previewFileName = 'document.pdf';
    expect(wrapper.vm.fileType).toBe('pdf');

    wrapper.vm.previewFileName = 'image.png';
    expect(wrapper.vm.fileType).toBe('png');

    wrapper.vm.previewFileName = 'archive';
    expect(wrapper.vm.fileType).toBe('archive');
  });

  it('computes isImage correctly', () => {
    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    wrapper.vm.previewFileName = 'photo.jpg';
    expect(wrapper.vm.isImage).toBe(true);

    wrapper.vm.previewFileName = 'image.png';
    expect(wrapper.vm.isImage).toBe(true);

    wrapper.vm.previewFileName = 'document.pdf';
    expect(wrapper.vm.isImage).toBe(false);
  });

  it('handles preview for PDF files', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as any);

    global.URL.createObjectURL = vi.fn(() => 'blob:test');

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    const fileToPreview = {
      uid: 1,
      name: 'test.pdf',
      size: 1024,
      response: { id: 1 },
    };

    await wrapper.vm.handlePreview(fileToPreview);

    expect(wrapper.vm.previewVisible).toBe(true);
    expect(wrapper.vm.previewFileName).toBe('test.pdf');
  });

  it('handles preview for image files', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as any);

    global.URL.createObjectURL = vi.fn(() => 'blob:test');

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    const fileToPreview = {
      uid: 1,
      name: 'test.png',
      size: 1024,
      response: { id: 1 },
    };

    await wrapper.vm.handlePreview(fileToPreview);

    expect(wrapper.vm.previewVisible).toBe(true);
    expect(wrapper.vm.isImage).toBe(true);
  });

  it('shows message for unsupported preview types', async () => {
    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    const fileToPreview = {
      uid: 1,
      name: 'test.exe',
      size: 1024,
      response: { id: 1 },
    };

    await wrapper.vm.handlePreview(fileToPreview);

    expect(wrapper.vm.previewVisible).toBe(false);
  });

  it('handles preview close correctly', () => {
    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    wrapper.vm.previewBlobUrl = 'blob:test';
    wrapper.vm.previewVisible = true;

    global.URL.revokeObjectURL = vi.fn();

    wrapper.vm.handlePreviewClose();

    expect(wrapper.vm.previewVisible).toBe(false);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('handles preview error', () => {
    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    wrapper.vm.handlePreviewError();

    expect(wrapper.vm.previewError).toBe('文件加载失败，请检查文件是否存在');
  });

  it('initializes with initial files', () => {
    const initialFiles = [
      {
        id: 1,
        originalFileName: 'initial.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        uploadTime: '2024-01-15T10:00:00',
      },
    ];

    const wrapper = mount(FileUploader, {
      props: {
        ...defaultProps,
        initialFiles,
      },
    });

    expect(wrapper.vm.fileList).toHaveLength(1);
    expect(wrapper.vm.fileList[0].name).toBe('initial.pdf');
  });

  it('handles API error when fetching file list', async () => {
    vi.mocked(fileApi.getFileListApi).mockRejectedValue(new Error('API Error'));

    const wrapper = mount(FileUploader, {
      props: defaultProps,
    });

    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.vm.uploading).toBe(false);
  });
});
