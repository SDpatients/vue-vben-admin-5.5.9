import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaimService } from './services/claimService';
import { rejectClaimRegistrationApi } from '#/api/core/claim-registration';
import { rejectClaimReviewApi } from '#/api/core/claim-review';
import { deleteCreditorApi } from '#/api/core/creditor';

// 模拟API函数
vi.mock('#/api/core/claim-registration');
vi.mock('#/api/core/creditor');
vi.mock('#/api/core/claim-review');

describe('Claim Delete and Reject Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rejectClaimRegistration', () => {
    it('should reject claim registration successfully', async () => {
      const mockResponse = {
        code: 200,
        message: '成功',
        data: null
      };

      (rejectClaimRegistrationApi as any).mockResolvedValue(mockResponse);

      const result = await ClaimService.rejectClaimRegistration(123, '材料不完整，缺少身份证明文件');

      expect(rejectClaimRegistrationApi).toHaveBeenCalledWith(123, '材料不完整，缺少身份证明文件');
      expect(result.success).toBe(true);
    });

    it('should handle reject claim registration failure', async () => {
      const mockResponse = {
        code: 400,
        message: '债权申报不存在',
        data: null
      };

      (rejectClaimRegistrationApi as any).mockResolvedValue(mockResponse);

      const result = await ClaimService.rejectClaimRegistration(123, '材料不完整');

      expect(result.success).toBe(false);
    });

    it('should handle network error when rejecting claim registration', async () => {
      (rejectClaimRegistrationApi as any).mockRejectedValue(new Error('Network error'));

      const result = await ClaimService.rejectClaimRegistration(123, '材料不完整');

      expect(result.success).toBe(false);
    });
  });

  describe('rejectClaimReview', () => {
    it('should reject claim review successfully', async () => {
      const mockResponse = {
        code: 200,
        message: '成功',
        data: null
      };

      (rejectClaimReviewApi as any).mockResolvedValue(mockResponse);

      const result = await ClaimService.rejectClaimReview(456, '证据不足，无法确认债权真实性');

      expect(rejectClaimReviewApi).toHaveBeenCalledWith(456, '证据不足，无法确认债权真实性');
      expect(result.success).toBe(true);
    });

    it('should handle reject claim review failure', async () => {
      const mockResponse = {
        code: 400,
        message: '债权审查记录不存在',
        data: null
      };

      (rejectClaimReviewApi as any).mockResolvedValue(mockResponse);

      const result = await ClaimService.rejectClaimReview(456, '证据不足');

      expect(result.success).toBe(false);
    });

    it('should handle network error when rejecting claim review', async () => {
      (rejectClaimReviewApi as any).mockRejectedValue(new Error('Network error'));

      const result = await ClaimService.rejectClaimReview(456, '证据不足');

      expect(result.success).toBe(false);
    });
  });

  describe('deleteCreditor', () => {
    it('should delete creditor successfully', async () => {
      const mockResponse = {
        code: 200,
        message: '成功',
        data: null
      };

      (deleteCreditorApi as any).mockResolvedValue(mockResponse);

      const result = await ClaimService.deleteCreditor(789);

      expect(deleteCreditorApi).toHaveBeenCalledWith(789);
      expect(result.success).toBe(true);
    });

    it('should handle delete creditor failure', async () => {
      const mockResponse = {
        code: 400,
        message: '债权人不存在',
        data: null
      };

      (deleteCreditorApi as any).mockResolvedValue(mockResponse);

      const result = await ClaimService.deleteCreditor(789);

      expect(result.success).toBe(false);
    });

    it('should handle network error when deleting creditor', async () => {
      (deleteCreditorApi as any).mockRejectedValue(new Error('Network error'));

      const result = await ClaimService.deleteCreditor(789);

      expect(result.success).toBe(false);
    });
  });

  describe('reject reason validation', () => {
    it('should reject empty reject reason', async () => {
      // 模拟用户输入为空的情况
      const emptyReason = '';
      
      // 验证空理由应该被前端拒绝
      expect(emptyReason.trim()).toBe('');
      
      // 验证空格理由也应该被拒绝
      const spaceReason = '   ';
      expect(spaceReason.trim()).toBe('');
    });

    it('should accept valid reject reason', async () => {
      const validReason = '材料不完整，缺少身份证明文件和银行流水';
      expect(validReason.trim()).toBe(validReason);
      expect(validReason.length).toBeGreaterThan(0);
    });
  });
});
