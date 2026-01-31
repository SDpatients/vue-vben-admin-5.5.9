import type { ClaimRegistrationApi } from '#/api/core/claim-registration';
import type { ClaimReviewApi } from '#/api/core/claim-review';
import type { ClaimConfirmationApi } from '#/api/core/claim-confirmation';

import { ElMessage } from 'element-plus';

import { batchImportClaimsApi, exportClaimsApi } from '#/api/core/claim';
import {
  createClaimRegistrationApi,
  deleteClaimRegistrationApi,
  getClaimRegistrationDetailApi,
  getClaimRegistrationListApi,
  importClaimRegistrationApi,
  receiveClaimMaterialApi,
  updateClaimRegistrationApi,
  updateClaimRegistrationStatusApi,
} from '#/api/core/claim-registration';
import {
  createClaimReviewApi,
  getClaimReviewDetailApi,
  getClaimReviewsByCaseIdApi,
  submitClaimReviewApi,
  updateClaimReviewApi,
} from '#/api/core/claim-review';
import {
  createClaimConfirmationApi,
  finalizeClaimConfirmationApi,
  getClaimConfirmationDetailApi,
  getClaimConfirmationsByCaseIdApi,
  submitVoteApi,
  updateClaimConfirmationApi,
} from '#/api/core/claim-confirmation';

export class ClaimService {
  static handleApiResponse(
    response: any,
    successMsg: string,
    errorMsg: string,
  ): boolean {
    console.log('[ClaimService] API响应:', {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
      code: response.code,
      message: response.message,
      data: response.data,
    });
    if (response.code === 200) {
      if (successMsg) {
        ElMessage.success(successMsg);
      }
      return true;
    } else {
      ElMessage.error(`${errorMsg}：${response.message || '未知错误'}`);
      return false;
    }
  }

  static handleApiError(error: any, errorMsg: string) {
    const errorMessage =
      error?.response?.data?.message || error?.message || errorMsg;
    ElMessage.error(`${errorMsg}：${errorMessage}`);
    console.error(errorMsg, error);
  }

  static async fetchClaims(
    caseId: number,
    pageNum: number,
    pageSize: number,
    registrationStatus?: string,
  ) {
    try {
      const params: any = {
        caseId,
        pageNum,
        pageSize,
      };
      // 如果提供了registrationStatus参数，则使用该参数
      if (registrationStatus) {
        params.registrationStatus = registrationStatus;
      }
      
      const response = await getClaimRegistrationListApi(params);
      if (response.code === 200 && response.data) {
        const formattedList = (response.data.list || []).map((item: any) => ({
          ...item,
          creditor_name: item.creditorName,
          creditor_type: item.creditorType,
          credit_code: item.creditCode,
          total_amount: item.totalAmount,
          claim_nature: item.claimNature,
          claim_type: item.claimType,
          registration_status: item.registrationStatus,
          material_completeness: item.materialCompleteness,
          ...(item.reviewInfo && {
            reviewInfo: {
              ...item.reviewInfo,
              review_status: item.reviewInfo.reviewStatus,
              review_conclusion: item.reviewInfo.reviewConclusion,
            },
          }),
          ...(item.confirmationInfo && {
            confirmationInfo: {
              ...item.confirmationInfo,
              confirmation_status: item.confirmationInfo.confirmationStatus,
            },
          }),
        }));
        return {
          success: true,
          data: formattedList,
          total: response.data.total || 0,
        };
      } else {
        ElMessage.error(
          `获取债权登记表失败：${response.message || '未知错误'}`,
        );
        return { success: false, data: [], total: 0 };
      }
    } catch (error) {
      this.handleApiError(error, '获取债权登记表失败');
      return { success: false, data: [], total: 0 };
    }
  }

  static async fetchReviews(
    caseId: number,
    pageNum: number,
    pageSize: number,
    reviewStatus?: string,
  ) {
    try {
      const params: any = {
        pageNum,
        pageSize,
      };
      // 如果提供了reviewStatus参数，则使用该参数
      if (reviewStatus) {
        params.reviewStatus = reviewStatus;
      }
      
      const response = await getClaimReviewsByCaseIdApi(caseId, params);
      if (response.code === 200 && response.data) {
        const formattedList = (response.data.list || []).map((item: any) => ({
          ...item,
          creditor_name: item.creditorName,
          creditor_type: item.creditorType || item.creditor_type || '-',
          credit_code: item.creditCode || item.credit_code || '-',
          principal: item.declaredPrincipal,
          interest: item.declaredInterest,
          total_amount: item.declaredTotalAmount,
          claim_nature: item.confirmedClaimNature || item.claimNature || '-',
          claim_type: item.claimType || item.claim_type || '-',
          registration_status: item.reviewStatus === 'IN_PROGRESS' || item.reviewStatus === 'PENDING' ? 'REVIEWING' : 'REVIEW_COMPLETED',
          reviewInfo: {
            ...item,
            review_status: item.reviewStatus,
            review_conclusion: item.reviewConclusion,
          },
        }));
        return {
          success: true,
          data: formattedList,
          total: response.data.total || 0,
        };
      } else {
        ElMessage.error(
          `获取债权审查列表失败：${response.message || '未知错误'}`,
        );
        return { success: false, data: [], total: 0 };
      }
    } catch (error) {
      this.handleApiError(error, '获取债权审查列表失败');
      return { success: false, data: [], total: 0 };
    }
  }

  static async fetchConfirmations(
    caseId: number,
    pageNum: number,
    pageSize: number,
    confirmationStatus?: string,
  ) {
    try {
      const params: any = {
        pageNum,
        pageSize,
      };
      // 如果提供了confirmationStatus参数，则使用该参数
      if (confirmationStatus) {
        params.confirmationStatus = confirmationStatus;
      }
      
      const response = await getClaimConfirmationsByCaseIdApi(caseId, params);
      if (response.code === 200 && response.data) {
        const formattedList = (response.data.list || []).map((item: any) => ({
          ...item,
          creditorName: item.creditorName,
          creditorType: item.creditorType || item.creditor_type || '-',
          creditCode: item.creditCode || item.credit_code || '-',
          claimNo: item.claimNo || item.claimRegistrationId,
          principal: item.principal || item.declaredPrincipal || 0,
          totalAmount: item.finalConfirmedAmount || item.confirmedTotalAmount || item.declaredTotalAmount || 0,
          claimNature: item.confirmedClaimNature || item.claimNature || '-',
          claimType: item.claimType || item.claim_type || '-',
          confirmationStatus: item.confirmationStatus || 'PENDING',
          registration_status: item.confirmationStatus === 'IN_PROGRESS' ? 'CONFIRMING' : 'CONFIRMED',
          reviewInfo: item.reviewInfo || null,
        }));
        return {
          success: true,
          data: formattedList,
          total: response.data.total || 0,
        };
      } else {
        ElMessage.error(
          `获取债权确认列表失败：${response.message || '未知错误'}`,
        );
        return { success: false, data: [], total: 0 };
      }
    } catch (error) {
      this.handleApiError(error, '获取债权确认列表失败');
      return { success: false, data: [], total: 0 };
    }
  }

  static async fetchClaimReviews(
    caseId: number,
    pageNum: number,
    pageSize: number,
    reviewStatus?: string,
  ) {
    try {
      const params: any = {
        pageNum,
        pageSize,
      };
      // 如果提供了reviewStatus参数，则使用该参数
      if (reviewStatus) {
        params.reviewStatus = reviewStatus;
      }
      
      const response = await getClaimReviewsByCaseIdApi(caseId, params);
      if (response.code === 200 && response.data) {
        const formattedList = (response.data.list || []).map((item: any) => ({
          ...item,
          creditor_name: item.creditorName,
          creditor_type: item.creditorType || item.creditor_type || '-',
          credit_code: item.creditCode || item.credit_code || '-',
          principal: item.declaredPrincipal,
          interest: item.declaredInterest,
          total_amount: item.declaredTotalAmount,
          claim_nature: item.confirmedClaimNature || item.claimNature || '-',
          claim_type: item.claimType || item.claim_type || '-',
          registration_status: 'REGISTERED',
          reviewInfo: {
            ...item,
            review_status: item.reviewStatus,
            review_conclusion: item.reviewConclusion,
          },
        }));
        return {
          success: true,
          data: formattedList,
          total: response.data.total || 0,
        };
      } else {
        ElMessage.error(
          `获取债权审查列表失败：${response.message || '未知错误'}`,
        );
        return { success: false, data: [], total: 0 };
      }
    } catch (error) {
      this.handleApiError(error, '获取债权审查列表失败');
      return { success: false, data: [], total: 0 };
    }
  }

  static async fetchClaimConfirmations(
    caseId: number,
    pageNum: number,
    pageSize: number,
    confirmationStatus?: string,
  ) {
    try {
      const params: any = {
        pageNum,
        pageSize,
      };
      // 如果提供了confirmationStatus参数，则使用该参数
      if (confirmationStatus) {
        params.confirmationStatus = confirmationStatus;
      }
      
      const response = await getClaimConfirmationsByCaseIdApi(caseId, params);
      if (response.code === 200 && response.data) {
        const formattedList = (response.data.list || []).map((item: any) => ({
          ...item,
          creditorName: item.creditorName,
          creditorType: item.creditorType || item.creditor_type || '-',
          creditCode: item.creditCode || item.credit_code || '-',
          claimNo: item.claimNo || item.claimRegistrationId,
          principal: item.principal || item.declaredPrincipal || 0,
          totalAmount:
            item.finalConfirmedAmount ||
            item.confirmedTotalAmount ||
            item.declaredTotalAmount ||
            0,
          claimNature: item.confirmedClaimNature || item.claimNature || '-',
          claimType: item.claimType || item.claim_type || '-',
          confirmationStatus: item.confirmationStatus || 'PENDING',
          reviewInfo: item.reviewInfo || null,
        }));
        return {
          success: true,
          data: formattedList,
          total: response.data.total || 0,
        };
      } else {
        ElMessage.error(
          `获取债权确认列表失败：${response.message || '未知错误'}`,
        );
        return { success: false, data: [], total: 0 };
      }
    } catch (error) {
      this.handleApiError(error, '获取债权确认列表失败');
      return { success: false, data: [], total: 0 };
    }
  }

  static async getClaimDetail(id: number) {
    try {
      const response = await getClaimRegistrationDetailApi(id);
      if (response.code === 200 && response.data) {
        return { success: true, data: response.data };
      } else {
        ElMessage.error(`获取债权详情失败：${response.message || '未知错误'}`);
        return { success: false, data: null };
      }
    } catch (error) {
      this.handleApiError(error, '获取债权详情失败');
      return { success: false, data: null };
    }
  }

  static async getReviewDetail(id: number) {
    try {
      const response = await getClaimReviewDetailApi(id);
      if (response.code === 200 && response.data) {
        return { success: true, data: response.data };
      } else {
        ElMessage.error(`获取审查详情失败：${response.message || '未知错误'}`);
        return { success: false, data: null };
      }
    } catch (error) {
      this.handleApiError(error, '获取审查详情失败');
      return { success: false, data: null };
    }
  }

  static async getConfirmationDetail(id: number) {
    try {
      const response = await getClaimConfirmationDetailApi(id);
      if (response.code === 200 && response.data) {
        return { success: true, data: response.data };
      } else {
        ElMessage.error(`获取确认详情失败：${response.message || '未知错误'}`);
        return { success: false, data: null };
      }
    } catch (error) {
      this.handleApiError(error, '获取确认详情失败');
      return { success: false, data: null };
    }
  }

  static async createClaim(data: any) {
    try {
      const response = await createClaimRegistrationApi(data);
      if (this.handleApiResponse(response, '成功添加债权登记', '添加失败')) {
        return { success: true, data: response.data };
      }
      return { success: false, data: null };
    } catch (error) {
      this.handleApiError(error, '添加债权登记失败');
      return { success: false, data: null };
    }
  }

  static async updateClaim(id: number, data: any) {
    try {
      const response = await updateClaimRegistrationApi(id, data);
      if (this.handleApiResponse(response, '修改成功', '修改失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '修改债权登记失败');
      return { success: false };
    }
  }

  static async deleteClaim(id: number) {
    try {
      const response = await deleteClaimRegistrationApi(id);
      if (this.handleApiResponse(response, '删除成功', '删除失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '删除债权登记失败');
      return { success: false };
    }
  }

  static async receiveMaterial(id: number, data: any) {
    try {
      const response = await receiveClaimMaterialApi(id, data);
      if (this.handleApiResponse(response, '接收材料成功', '接收材料失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '接收材料失败');
      return { success: false };
    }
  }

  static async updateClaimStatus(id: number, status: string) {
    try {
      const response = await updateClaimRegistrationStatusApi(id, status);
      if (this.handleApiResponse(response, '状态更新成功', '状态更新失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '状态更新失败');
      return { success: false };
    }
  }

  static async importClaims(formData: FormData) {
    try {
      const response = await importClaimRegistrationApi(formData);
      if (response.code === 200) {
        ElMessage.success(
          `导入完成，成功${response.data.successCount}条，失败${response.data.failCount}条`,
        );
        return {
          success: true,
          data: response.data,
        };
      } else {
        ElMessage.error(`导入失败：${response.message || '未知错误'}`);
        return { success: false, data: null };
      }
    } catch (error) {
      this.handleApiError(error, 'Excel导入失败');
      return { success: false, data: null };
    }
  }

  static async exportClaims(caseId: string) {
    try {
      const response = await exportClaimsApi(caseId);
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = `债权登记表_${caseId}_${Date.now()}.xlsx`;
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      ElMessage.success('导出成功');
      return { success: true };
    } catch (error: any) {
      this.handleApiError(error, '导出失败');
      return { success: false };
    }
  }

  static async createReview(data: ClaimReviewApi.CreateClaimReviewRequest) {
    try {
      const response = await createClaimReviewApi(data);
      if (this.handleApiResponse(response, '保存审查记录成功', '保存失败')) {
        return { success: true, reviewId: response.data?.reviewId };
      }
      return { success: false, reviewId: null };
    } catch (error) {
      this.handleApiError(error, '保存审查记录失败');
      return { success: false, reviewId: null };
    }
  }

  static async updateReview(id: number, data: any) {
    try {
      const response = await updateClaimReviewApi(id, data);
      if (this.handleApiResponse(response, '更新审查记录成功', '更新失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '更新审查记录失败');
      return { success: false };
    }
  }

  static async submitReview(id: number, data: any) {
    try {
      const response = await submitClaimReviewApi(id, data);
      if (this.handleApiResponse(response, '提交审查成功', '提交审查失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '提交审查失败');
      return { success: false };
    }
  }

  static async startReview(claimId: number) {
    try {
      const response = await updateClaimRegistrationStatusApi(claimId, 'REVIEWING');
      if (this.handleApiResponse(response, '开始审查成功', '开始审查失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '开始审查失败');
      return { success: false };
    }
  }

  static async completeReview(claimId: number) {
    try {
      const response = await updateClaimRegistrationStatusApi(claimId, 'REVIEW_COMPLETED');
      if (this.handleApiResponse(response, '审查完成', '审查完成失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '审查完成失败');
      return { success: false };
    }
  }

  static async createConfirmation(
    data: ClaimConfirmationApi.CreateClaimConfirmationRequest,
  ) {
    try {
      const response = await createClaimConfirmationApi(data);
      if (this.handleApiResponse(response, '保存确认记录成功', '保存失败')) {
        return { success: true, confirmationId: response.data?.confirmationId };
      }
      return { success: false, confirmationId: null };
    } catch (error) {
      this.handleApiError(error, '保存确认记录失败');
      return { success: false, confirmationId: null };
    }
  }

  static async updateConfirmation(id: number, data: any) {
    try {
      const response = await updateClaimConfirmationApi(id, data);
      if (this.handleApiResponse(response, '更新确认记录成功', '更新失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '更新确认记录失败');
      return { success: false };
    }
  }

  static async submitVote(confirmationId: number, data: any) {
    try {
      const response = await submitVoteApi(confirmationId, data);
      if (this.handleApiResponse(response, '表决提交成功', '表决提交失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '表决提交失败');
      return { success: false };
    }
  }

  static async finalizeConfirmation(confirmationId: number) {
    try {
      const response = await finalizeClaimConfirmationApi(confirmationId);
      if (this.handleApiResponse(response, '债权确认完成', '确认失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '债权确认失败');
      return { success: false };
    }
  }

  static async startConfirmation(claimId: number) {
    try {
      const response = await updateClaimRegistrationStatusApi(claimId, 'CONFIRMING');
      if (this.handleApiResponse(response, '开始确认成功', '开始确认失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '开始确认失败');
      return { success: false };
    }
  }

  static async completeConfirmation(claimId: number) {
    try {
      const response = await updateClaimRegistrationStatusApi(claimId, 'CONFIRMED');
      if (this.handleApiResponse(response, '确认完成', '确认完成失败')) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      this.handleApiError(error, '确认完成失败');
      return { success: false };
    }
  }
}
