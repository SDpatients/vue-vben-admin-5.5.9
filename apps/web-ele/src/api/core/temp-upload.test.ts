import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTempUploadToken,
  getTempUploadToken,
  validateTempUploadToken,
  getTempUploadFiles,
  mobileUploadFile,
  mobileUploadBatch,
  transferTempFiles,
  cancelTempUploadToken,
  type CreateTokenParams,
  type TransferParams,
  type TempUploadToken,
  type TempUploadFile,
} from './temp-upload';
// import { requestClient } from '#/api/request';

// Mock request client
vi.mock('#/api/request', () => ({
  requestClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  fileUploadRequestClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { fileUploadRequestClient } from '#/api/request';

describe('temp-upload API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTempUploadToken', () => {
    it('should create a temp upload token with required params', async () => {
      const mockParams: CreateTokenParams = {
        bizType: 'DOCUMENT',
        description: '测试上传',
        expireMinutes: 30,
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id: 1,
            token: 'TEMP550E8400E29B41D4A716446655440000',
            bizType: 'DOCUMENT',
            userId: 1,
            expireTime: '2026-02-04T17:00:00',
            status: 'ACTIVE',
            fileCount: 0,
            description: '测试上传',
            createTime: '2026-02-04T16:30:00',
            qrCodeContent: 'http://localhost:8080/api/v1/temp-upload/mobile?token=TEMP550E8400E29B41D4A716446655440000',
          } as TempUploadToken,
        },
      };

      vi.mocked(fileUploadRequestClient.post).mockResolvedValue(mockResponse);

      const result = await createTempUploadToken(mockParams);

      expect(fileUploadRequestClient.post).toHaveBeenCalledWith('/api/v1/temp-upload/token', mockParams);
      expect(result.data.code).toBe(200);
      expect(result.data.data.token).toBe('TEMP550E8400E29B41D4A716446655440000');
      expect(result.data.data.status).toBe('ACTIVE');
    });

    it('should create a temp upload token with minimal params', async () => {
      const mockParams: CreateTokenParams = {
        bizType: 'CASE_PROGRESS',
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id: 2,
            token: 'TEMP550E8400E29B41D4A716446655440001',
            bizType: 'CASE_PROGRESS',
            userId: 1,
            expireTime: '2026-02-04T17:00:00',
            status: 'ACTIVE',
            fileCount: 0,
            description: '',
            createTime: '2026-02-04T16:30:00',
            qrCodeContent: 'http://localhost:8080/api/v1/temp-upload/mobile?token=TEMP550E8400E29B41D4A716446655440001',
          } as TempUploadToken,
        },
      };

      vi.mocked(fileUploadRequestClient.post).mockResolvedValue(mockResponse);

      const result = await createTempUploadToken(mockParams);

      expect(fileUploadRequestClient.post).toHaveBeenCalledWith('/api/v1/temp-upload/token', mockParams);
      expect(result.data.code).toBe(200);
    });
  });

  describe('getTempUploadToken', () => {
    it('should get token info by token string', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id: 1,
            token,
            bizType: 'DOCUMENT',
            userId: 1,
            expireTime: '2026-02-04T17:00:00',
            status: 'ACTIVE',
            fileCount: 2,
            description: '测试上传',
            createTime: '2026-02-04T16:30:00',
          } as TempUploadToken,
        },
      };

      vi.mocked(fileUploadRequestClient.get).mockResolvedValue(mockResponse);

      const result = await getTempUploadToken(token);

      expect(fileUploadRequestClient.get).toHaveBeenCalledWith(`/api/v1/temp-upload/token/${token}`);
      expect(result.data.code).toBe(200);
      expect(result.data.data.token).toBe(token);
      expect(result.data.data.fileCount).toBe(2);
    });
  });

  describe('validateTempUploadToken', () => {
    it('should return true for valid token', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: true,
        },
      };

      vi.mocked(fileUploadRequestClient.get).mockResolvedValue(mockResponse);

      const result = await validateTempUploadToken(token);

      expect(fileUploadRequestClient.get).toHaveBeenCalledWith(`/api/v1/temp-upload/token/${token}/validate`);
      expect(result.data.code).toBe(200);
      expect(result.data.data).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const token = 'INVALID_TOKEN';

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: false,
        },
      };

      vi.mocked(fileUploadRequestClient.get).mockResolvedValue(mockResponse);

      const result = await validateTempUploadToken(token);

      expect(result.data.data).toBe(false);
    });
  });

  describe('getTempUploadFiles', () => {
    it('should get files by token', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';

      const mockFiles: TempUploadFile[] = [
        {
          id: 101,
          originalFileName: '合同.pdf',
          fileSize: 1024576,
          fileExtension: 'pdf',
          mimeType: 'application/pdf',
          description: '主合同文件',
          uploadTime: '2026-02-04T16:35:00',
          token,
        },
        {
          id: 102,
          originalFileName: '附件.jpg',
          fileSize: 204800,
          fileExtension: 'jpg',
          mimeType: 'image/jpeg',
          description: null as any,
          uploadTime: '2026-02-04T16:36:00',
          token,
        },
      ];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockFiles,
        },
      };

      vi.mocked(fileUploadRequestClient.get).mockResolvedValue(mockResponse);

      const result = await getTempUploadFiles(token);

      expect(fileUploadRequestClient.get).toHaveBeenCalledWith(`/api/v1/temp-upload/token/${token}/files`);
      expect(result.data.code).toBe(200);
      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].originalFileName).toBe('合同.pdf');
      expect(result.data.data[1].originalFileName).toBe('附件.jpg');
    });

    it('should return empty array when no files', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: [],
        },
      };

      vi.mocked(fileUploadRequestClient.get).mockResolvedValue(mockResponse);

      const result = await getTempUploadFiles(token);

      expect(result.data.data).toHaveLength(0);
    });
  });

  describe('mobileUploadFile', () => {
    it('should upload a single file with token', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const description = '测试文件';

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id: 103,
            originalFileName: 'test.pdf',
            fileSize: 12,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            description: '测试文件',
            uploadTime: '2026-02-04T16:40:00',
            token,
          } as TempUploadFile,
        },
      };

      vi.mocked(fileUploadRequestClient.post).mockResolvedValue(mockResponse);

      const result = await mobileUploadFile(token, file, description);

      expect(fileUploadRequestClient.post).toHaveBeenCalledWith(
        '/api/v1/temp-upload/mobile/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result.data.code).toBe(200);
      expect(result.data.data.originalFileName).toBe('test.pdf');
    });

    it('should upload file without description', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';
      const file = new File(['test content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id: 104,
            originalFileName: 'document.docx',
            fileSize: 12,
            fileExtension: 'docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            description: null as any,
            uploadTime: '2026-02-04T16:45:00',
            token,
          } as TempUploadFile,
        },
      };

      vi.mocked(fileUploadRequestClient.post).mockResolvedValue(mockResponse);

      const result = await mobileUploadFile(token, file);

      expect(result.data.code).toBe(200);
      expect(result.data.data.fileExtension).toBe('docx');
    });
  });

  describe('mobileUploadBatch', () => {
    it('should upload multiple files', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';
      const files = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.jpg', { type: 'image/jpeg' }),
      ];
      const descriptions = ['文件1描述', '文件2描述'];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: [
            {
              id: 105,
              originalFileName: 'file1.pdf',
              fileSize: 8,
              fileExtension: 'pdf',
              mimeType: 'application/pdf',
              description: '文件1描述',
              uploadTime: '2026-02-04T16:45:00',
              token,
            },
            {
              id: 106,
              originalFileName: 'file2.jpg',
              fileSize: 8,
              fileExtension: 'jpg',
              mimeType: 'image/jpeg',
              description: '文件2描述',
              uploadTime: '2026-02-04T16:45:00',
              token,
            },
          ] as TempUploadFile[],
        },
      };

      vi.mocked(fileUploadRequestClient.post).mockResolvedValue(mockResponse);

      const result = await mobileUploadBatch(token, files, descriptions);

      expect(fileUploadRequestClient.post).toHaveBeenCalledWith(
        '/api/v1/temp-upload/mobile/upload-batch',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result.data.code).toBe(200);
      expect(result.data.data).toHaveLength(2);
    });

    it('should upload multiple files without descriptions', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';
      const files = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      ];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: [
            {
              id: 107,
              originalFileName: 'file1.pdf',
              fileSize: 8,
              fileExtension: 'pdf',
              mimeType: 'application/pdf',
              description: null as any,
              uploadTime: '2026-02-04T16:50:00',
              token,
            },
          ] as TempUploadFile[],
        },
      };

      vi.mocked(fileUploadRequestClient.post).mockResolvedValue(mockResponse);

      const result = await mobileUploadBatch(token, files);

      expect(result.data.code).toBe(200);
      expect(result.data.data).toHaveLength(1);
    });
  });

  describe('transferTempFiles', () => {
    it('should transfer temp files to business', async () => {
      const mockParams: TransferParams = {
        token: 'TEMP550E8400E29B41D4A716446655440000',
        bizType: 'DOCUMENT',
        bizId: '10086',
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: [
            {
              id: 101,
              originalFileName: '合同.pdf',
              fileSize: 1024576,
              fileExtension: 'pdf',
              mimeType: 'application/pdf',
              description: '主合同文件',
              uploadTime: '2026-02-04T16:35:00',
              token: mockParams.token,
            },
          ] as TempUploadFile[],
        },
      };

      vi.mocked(fileUploadRequestClient.post).mockResolvedValue(mockResponse);

      const result = await transferTempFiles(mockParams);

      expect(fileUploadRequestClient.post).toHaveBeenCalledWith('/api/v1/temp-upload/transfer', mockParams);
      expect(result.data.code).toBe(200);
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].originalFileName).toBe('合同.pdf');
    });
  });

  describe('cancelTempUploadToken', () => {
    it('should cancel a temp upload token', async () => {
      const token = 'TEMP550E8400E29B41D4A716446655440000';

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: null,
        },
      };

      vi.mocked(fileUploadRequestClient.delete).mockResolvedValue(mockResponse);

      const result = await cancelTempUploadToken(token);

      expect(fileUploadRequestClient.delete).toHaveBeenCalledWith(`/api/v1/temp-upload/token/${token}`);
      expect(result.data.code).toBe(200);
      expect(result.data.data).toBeNull();
    });
  });
});
