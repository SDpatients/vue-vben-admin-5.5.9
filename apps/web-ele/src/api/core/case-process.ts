// 获取环境变量中的API基础地址
import {
  deleteFileApi,
  downloadFileApi,
  getFileListApi,
  uploadFileApi,
} from '#/api/core/file';

import { requestClient8085 } from '../request';

const API_BASE_URL =
  import.meta.env.VITE_GLOB_API_URL || 'http://192.168.0.120:8080';

export namespace CaseProcessApi {
  /** 工作团队信息 */
  export interface WorkTeamInfo {
    SEP_ID: number;
    TDFZR: string;
    ZHZCY: string;
    CXZCY: string;
    CCGLZCY: string;
    ZQSHZCY: string;
    LDRSZCY: string;
    ZZQLZCY: string;
    ZT: string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 工作计划信息 */
  export interface WorkPlanInfo {
    SEP_ID: number;
    JHLX: string;
    JHNR: string;
    KSRQ: string;
    JSRQ: string;
    FZR: string;
    ZT: string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 管理制度信息 */
  export interface ManagementInfo {
    SEP_ID: number;
    ZDLX: string;
    ZDMC: string;
    ZDNR: string;
    SXRQ: string;
    ZT: string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 印章管理信息 */
  export interface SealManagementInfo {
    SEP_ID: number;
    GLLX: string;
    XMMC: string;
    CLRQ: string;
    CLFS: string;
    CLJG: string;
    ZMWJLJ: string;
    ZT: string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 法律程序信息 */
  export interface LegalProcedureInfo {
    SEP_ID: number;
    CXLX: string;
    CXNR: string;
    ZHRQ: string;
    FZR: string;
    ZT: string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第二阶段：财产接收信息 */
  export interface PropertyReceiptInfo {
    row: number;
    SEP_ID: number;
    JJHYRQ: null | string;
    CHRY: null | string;
    CCZKSM: null | string;
    JJRQ: null | string;
    JJR: null | string;
    JSR: null | string;
    JSZT: null | string;
    CCLX: null | string;
    CCMC: null | string;
    CCJE: null | number;
    CFDD: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第二阶段：应急管理信息 */
  export interface EmergencyManagementInfo {
    row: number;
    SEP_ID: number;
    FZR: null | string;
    ABCS: null | string;
    BXXX: null | string;
    BZCCCL: null | string;
    QLSXYQJ: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第二阶段：财产方案管理信息 */
  export interface PropertyManagementPlanInfo {
    row: number;
    SEP_ID: number;
    FAMC: null | string;
    BDCGLCS: null | string;
    DCGLCS: null | string;
    HBCCGLCS: null | string;
    WXCCGLCS: null | string;
    DWTZGLCS: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第二阶段：人员聘用信息 */
  export interface PersonnelEmploymentInfo {
    row: number;
    SEP_ID: number;
    YGXM: null | string;
    YGLX: null | string;
    ZW: null | string;
    PYRQ: null | string;
    XCXX: null | string;
    FYPZQK: null | string;
    PYZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第二阶段：内部事务管理信息 */
  export interface InternalAffairsInfo {
    row: number;
    SEP_ID: number;
    SWLX: null | string;
    SWNR: null | string;
    JDRQ: null | string;
    JDR: null | string;
    KZJE: null | number;
    KZSM: null | string;
    CLZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第二阶段：合同管理信息 */
  export interface ContractManagementInfo {
    row: number;
    SEP_ID: number;
    HTLX: null | string;
    HTMC: null | string;
    HTXDF: null | string;
    HTNR: null | string;
    LHZT: null | string;
    SCRQ: null | string;
    SCR: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第二阶段：营业管理信息 */
  export interface BusinessManagementInfo {
    row: number;
    SEP_ID: number;
    YYQKTC: null | string;
    FXLZBG: null | string;
    JDNR: null | string;
    FYPZRQ: null | string;
    SSZT: null | string;
    FZR: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第六阶段：破产财产分配方案信息 */
  export interface BankruptcyDistPlanInfo {
    row: number;
    SEP_ID: number;
    FAMC: null | string;
    FANR: null | string;
    KFPZE: null | number;
    HYBJJG: null | string;
    FYPZRQ: null | string;
    SSRQ: null | string;
    FAZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第六阶段：员工安置方案信息 */
  export interface EmployeeSPlanInfo {
    row: number;
    SEP_ID: number;
    [key: string]: any;
  }

  /** 第六阶段：优先受偿权信息 */
  export interface PriorityPaymentInfo {
    row: number;
    SEP_ID: number;
    [key: string]: any;
  }

  /** 第六阶段：财产状况说明信息 */
  export interface PropertyDECInfo {
    row: number;
    SEP_ID: number;
    [key: string]: any;
  }

  /** 第六阶段：存款管理信息 */
  export interface DepositManagementInfo {
    row: number;
    SEP_ID: number;
    [key: string]: any;
  }

  /** 分页响应数据 */
  export interface PageResponse<T> {
    count: number;
    pages: number;
    records: T[];
    paras?: {
      SEP_LD?: string;
      zt0_count?: string;
      zt1_count?: string;
      zt2_count?: string;
    };
  }

  /** 第七阶段：债权人会议决议信息 */
  export interface CanRRInfo {
    row: number;
    SEP_ID: number;
    [key: string]: any;
  }

  /** 第七阶段：终止诉讼信息 */
  export interface TerminationLitiInfo {
    row: number;
    SEP_ID: number;
    [key: string]: any;
  }

  /** 第七阶段：追加分配信息 */
  export interface AdditionalDisiributionInfo {
    row: number;
    SEP_ID: number;
    [key: string]: any;
  }

  /** 第三阶段：财产调查表信息 */
  export interface PropertyInvestigationInfo {
    row: number;
    SEP_ID: number;
    TCLX: null | string;
    TCNR: null | string;
    TCRQ: null | string;
    TCR: null | string;
    TCFX: null | string;
    TCZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第三阶段：破产费用管理信息 */
  export interface BankExpensesInfo {
    row: number;
    SEP_ID: number;
    FYLX: null | string;
    FYMC: null | string;
    JE: null | number;
    ZFRQ: null | string;
    ZFZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第三阶段：权利主张表信息 */
  export interface RightsClaimInfo {
    row: number;
    SEP_ID: number;
    ZZLXCX: null | string;
    ZZNR: null | string;
    ZZRQ: null | string;
    ZZR: null | string;
    FYHY: null | string;
    ZZZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第三阶段：取回权审查表信息 */
  export interface ReclaimReviewInfo {
    row: number;
    SEP_ID: number;
    QLRMC: null | string;
    QHQJC: null | string;
    CCSFCZ: null | string;
    DDGFYW: null | string;
    SCRQ: null | string;
    SCR: null | string;
    SCJD: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第三阶段：诉讼仲裁表信息 */
  export interface LitigationArbitrationInfo {
    row: number;
    SEP_ID: number;
    LX: null | string;
    XDF: null | string;
    FY: null | string;
    SSNR: null | string;
    SSZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第三阶段：债权申报表信息 */
  export interface CreditorClaimInfo {
    row: number;
    SEP_ID: number;
    ZQRMC: null | string;
    ZQRLX: null | string;
    SBJE: null | number;
    SBYJ: null | string;
    JSR: null | string;
    SBLX: null | string;
    BZ: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第三阶段：社保费用表信息 */
  export interface SocialSecurityFeesInfo {
    row: number;
    SEP_ID: number;
    FYLX: null | string;
    FYJE: null | number;
    SBJG: null | string;
    HDRQ: null | string;
    HDR: null | string;
    HDZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第三阶段：税收核定表信息 */
  export interface TaxVerificationInfo {
    row: number;
    SEP_ID: number;
    SZ: null | string;
    SKJE: null | number;
    SWJG: null | string;
    HDRQ: null | string;
    HDR: null | string;
    HDZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 任务状态类型 */
  export type TaskStatus = '完成' | '待开发' | '未确认' | '跳过';

  /** 任务基本信息 */
  export interface TaskInfo {
    id: string;
    name: string;
    status: TaskStatus;
    apiUrl: string;
    token: string;
    data?: any;
    isPending?: boolean;
    count?: number; // 任务数量
    zt?: 0 | 1 | 2; // 任务状态：0-未完成，1-完成，2-跳过
    paras?: {
      zt0_count?: string;
      zt1_count?: string;
      zt2_count?: string;
    };
  }

  /** 任务响应 */
  export interface TaskResponse<T> {
    data: T;
    status: string;
    error: string;
  }
}

/** API函数 */
export const getWorkTeamApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.WorkTeamInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllWorkTeam', {
      params: {
        SEP_ID,
        page,
        size,
      },
    });
  } catch (error) {
    console.error('获取工作团队数据失败:', error);
    throw error;
  }
};

export const getWorkPlanApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.WorkPlanInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllWorkPlan', {
      params: {
        SEP_ID,
        page,
        size,
      },
    });
  } catch (error) {
    console.error('获取工作计划数据失败:', error);
    throw error;
  }
};

export const getManagementApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllManagement', {
      params: {
        SEP_ID,
        page,
        size,
      },
    });
  } catch (error) {
    console.error('获取管理制度数据失败:', error);
    throw error;
  }
};

export const getSealManagementApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SealManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllSealManagement', {
      params: {
        SEP_ID,
        page,
        size,
      },
    });
  } catch (error) {
    console.error('获取印章管理数据失败:', error);
    throw error;
  }
};

export const getLegalProcedureApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.LegalProcedureInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllLegalProcedure', {
      params: {
        SEP_ID,
        page,
        size,
      },
    });
  } catch (error) {
    console.error('获取法律程序数据失败:', error);
    throw error;
  }
};

/** 第二阶段API函数 */
export const getAllPropertyReceiptApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PropertyReceiptInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllPropertyReceipt', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取财产接收数据失败:', error);
    throw error;
  }
};

export const getAllEmergencyApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.EmergencyManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllEmergency', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取应急管理数据失败:', error);
    throw error;
  }
};

export const getAllPropertyPlanApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PropertyManagementPlanInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllPropertyPlan', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取财产方案管理数据失败:', error);
    throw error;
  }
};

export const getAllPersonnelEmpApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PersonnelEmploymentInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllPersonnelEmp', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取人员聘用数据失败:', error);
    throw error;
  }
};

export const getAllInternalAffairsApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.InternalAffairsInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllInternalAffairs', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取内部事务管理数据失败:', error);
    throw error;
  }
};

export const getAllContractManagementApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ContractManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllContractManagement', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取合同管理数据失败:', error);
    throw error;
  }
};

export const getAllBManagementApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.BusinessManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllBManagement', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取营业管理数据失败:', error);
    throw error;
  }
};

/** 统一任务操作API */
export const unifiedTaskOperationApi = async (data: {
  [key: string]: any;
  OperateType: string;
  SEP_ID?: string;
  SEP_LD: string;
  ZT: string;
}): Promise<{ error: string; status: string }> => {
  try {
    const chatUserInfo = localStorage.getItem('chat_user_info');
    let SEP_EUSER = 'admin';
    try {
      if (chatUserInfo) {
        const userInfo = JSON.parse(chatUserInfo);
        SEP_EUSER =
          userInfo.user?.uName || userInfo.U_USER || userInfo.U_NAME || 'admin';
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      SEP_EUSER = 'admin';
    }
    const SEP_EDATE = new Date().toISOString().split('T')[0];

    const requestData = {
      SEP_EUSER,
      SEP_EDATE,
      OperateType: data.OperateType,
      SEP_LD: data.SEP_LD,
      ZT: data.ZT,
      ...(data.SEP_ID && { SEP_ID: data.SEP_ID }),
      ...(data.TDFZR && { TDFZR: data.TDFZR }),
      ...(data.ZHZCY && { ZHZCY: data.ZHZCY }),
      ...(data.CXZCY && { CXZCY: data.CXZCY }),
      ...(data.CCGLZCY && { CCGLZCY: data.CCGLZCY }),
      ...(data.ZQSHZCY && { ZQSHZCY: data.ZQSHZCY }),
      ...(data.LDRSZCY && { LDRSZCY: data.LDRSZCY }),
      ...(data.ZZQLZCY && { ZZQLZCY: data.ZZQLZCY }),
      ...(data.JHLX && { JHLX: data.JHLX }),
      ...(data.JHNR && { JHNR: data.JHNR }),
      ...(data.KSRQ && { KSRQ: data.KSRQ }),
      ...(data.JSRQ && { JSRQ: data.JSRQ }),
      ...(data.FZR && { FZR: data.FZR }),
      ...(data.ZDLX && { ZDLX: data.ZDLX }),
      ...(data.ZDMC && { ZDMC: data.ZDMC }),
      ...(data.ZDNR && { ZDNR: data.ZDNR }),
      ...(data.SXRQ && { SXRQ: data.SXRQ }),
      ...(data.YZLX && { YZLX: data.YZLX }),
      ...(data.YZBH && { YZBH: data.YZBH }),
      ...(data.YZYBLJ && { YZYBLJ: data.YZYBLJ }),
      ...(data.BARQ && { BARQ: data.BARQ }),
      ...(data.YZMC && { YZMC: data.YZMC }),
      ...(data.CXLX && { CXLX: data.CXLX }),
      ...(data.CXNR && { CXNR: data.CXNR }),
      ...(data.ZHRQ && { ZHRQ: data.ZHRQ }),
    };

    return await requestClient8085.post('/api/web/update1', requestData);
  } catch (error) {
    console.error('统一任务操作失败:', error);
    throw error;
  }
};

/** 第二阶段统一更新API（update2） */
export const update2Api = async (data: {
  [key: string]: any;
  OperateType: number;
  SEP_ID?: string;
  SEP_LD: string;
  ZT: string;
}): Promise<{ error: string; status: string }> => {
  try {
    const chatUserInfo = localStorage.getItem('chat_user_info');
    let SEP_EUSER = 'admin';
    try {
      if (chatUserInfo) {
        const userInfo = JSON.parse(chatUserInfo);
        SEP_EUSER =
          userInfo.user?.uName || userInfo.U_USER || userInfo.U_NAME || 'admin';
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      SEP_EUSER = 'admin';
    }
    const SEP_EDATE = new Date().toISOString();

    return await requestClient8085.post('/api/web/update2', {
      ...data,
      SEP_EUSER,
      SEP_EDATE,
    });
  } catch (error) {
    console.error('第二阶段更新失败:', error);
    throw error;
  }
};

/** 第三阶段统一更新API（update3） */
export const update3Api = async (data: {
  [key: string]: any;
  OperateType: number;
  SEP_ID?: string;
  SEP_LD: string;
  ZT: string;
}): Promise<{ error: string; status: string }> => {
  try {
    const chatUserInfo = localStorage.getItem('chat_user_info');
    let SEP_EUSER = 'admin';
    try {
      if (chatUserInfo) {
        const userInfo = JSON.parse(chatUserInfo);
        SEP_EUSER =
          userInfo.user?.uName || userInfo.U_USER || userInfo.U_NAME || 'admin';
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      SEP_EUSER = 'admin';
    }
    const SEP_EDATE = new Date().toISOString();

    return await requestClient8085.post('/api/web/update3', {
      ...data,
      SEP_EUSER,
      SEP_EDATE,
    });
  } catch (error) {
    console.error('第三阶段更新失败:', error);
    throw error;
  }
};

/** 更新任务状态API（兼容旧调用） */
export const updateTaskStatusApi = async (
  taskType: string,
  SEP_ID: string,
  status: CaseProcessApi.TaskStatus,
  data?: any,
): Promise<{ error?: string; message?: string; status: string }> => {
  try {
    // 任务类型映射到OperateType
    const taskTypeToOperateType: Record<string, string> = {
      workTeam: '0',
      workPlan: '1',
      management: '2',
      sealManagement: '3',
      legalProcedure: '4',
    };

    // 状态映射到ZT
    const statusToZT: Record<string, string> = {
      完成: '1',
      跳过: '2',
      未确认: '0',
    };

    // 准备统一API参数
    const params = {
      SEP_LD: SEP_ID,
      ZT: statusToZT[status],
      OperateType: taskTypeToOperateType[taskType] || '0',
      ...data,
    };

    // 调用统一API
    const result = await unifiedTaskOperationApi(params);

    return {
      status: result.status,
      message: result.status === '1' ? '操作成功' : result.error,
      error: result.error,
    };
  } catch (error) {
    console.error('更新任务状态失败:', error);
    return {
      status: '0',
      message: '操作失败',
      error: '网络错误或服务器异常',
    };
  }
};

/** 工作团队新增API */
export const addWorkTeamApi = async (data: any) => {
  try {
    const token = '2a5f7f6a75486015359bf5e2067c6061';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addWorkTeam?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([data]),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('添加工作团队失败:', error);
    throw error;
  }
};

/** 工作计划新增API */
export const addWorkPlanApi = async (data: any) => {
  try {
    const token = 'c310a4999c680d78b7232549849ae64d';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addWorkPlan?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([data]),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('添加工作计划失败:', error);
    throw error;
  }
};

/** 管理制度新增API */
export const addManagementApi = async (data: any) => {
  try {
    const token = '03414cb311024b3b7487c2af8eb6b430';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addManagement?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([data]),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('添加管理制度失败:', error);
    throw error;
  }
};

/** 印章管理新增API */
export const addSealManagementApi = async (data: any) => {
  try {
    const token = 'f4ba5cb06d5d1792b35229b402e3ab18';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addSealManagement?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([data]),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('添加印章管理失败:', error);
    throw error;
  }
};

/** 法律程序新增API */
export const addLegalProcedureApi = async (data: any) => {
  try {
    const token = 'ca4bc9b5c65eedc893c1b207e2087cc7';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addLegalProcedure?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([data]),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('添加法律程序失败:', error);
    throw error;
  }
};

/** 财产接收新增API */
export const addPropertyReceiptApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addPropertyReceipt', data);
  } catch (error) {
    console.error('添加财产接收失败:', error);
    throw error;
  }
};

/** 应急管理新增API */
export const addEmergencyApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addEmergency', data);
  } catch (error) {
    console.error('添加应急管理失败:', error);
    throw error;
  }
};

/** 财产方案管理新增API */
export const addPropertyPlanApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addPropertyPlan', data);
  } catch (error) {
    console.error('添加财产方案管理失败:', error);
    throw error;
  }
};

/** 人员聘用新增API */
export const addPersonnelEmploymentApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addPersonnelEmployment',
      data,
    );
  } catch (error) {
    console.error('添加人员聘用失败:', error);
    throw error;
  }
};

/** 内部事务管理新增API */
export const addInternalAffairsApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addInternalAffairs', data);
  } catch (error) {
    console.error('添加内部事务管理失败:', error);
    throw error;
  }
};

/** 合同管理新增API */
export const addContractManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addContractManagement', data);
  } catch (error) {
    console.error('添加合同管理失败:', error);
    throw error;
  }
};

/** 营业管理新增API */
export const addBusinessManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addBusinessManagement', data);
  } catch (error) {
    console.error('添加营业管理失败:', error);
    throw error;
  }
};

/** 第三阶段新增API */
export const addPropertyInvestigationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addPropertyInvestigation',
      data,
    );
  } catch (error) {
    console.error('添加财产调查失败:', error);
    throw error;
  }
};

export const addBankExpensesApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addBankpuptcyExpenes', data);
  } catch (error) {
    console.error('添加破产费用失败:', error);
    throw error;
  }
};

export const addRightsClaimApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addRightsClaim', data);
  } catch (error) {
    console.error('添加权利主张失败:', error);
    throw error;
  }
};

export const addReclaimReviewApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addReclaimReview', data);
  } catch (error) {
    console.error('添加取回权审查失败:', error);
    throw error;
  }
};

export const addLitigationArbitrationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addLitigationArbitration',
      data,
    );
  } catch (error) {
    console.error('添加诉讼仲裁失败:', error);
    throw error;
  }
};

export const addCreditorClaimApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addCreditorClaim', data);
  } catch (error) {
    console.error('添加债权申报失败:', error);
    throw error;
  }
};

export const addSocialSecurtyFeesApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addSocialSecurtyFees', data);
  } catch (error) {
    console.error('添加社保费用失败:', error);
    throw error;
  }
};

export const addTaxVerificationApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addTaxVerification', data);
  } catch (error) {
    console.error('添加税款核定失败:', error);
    throw error;
  }
};

/** 第四阶段新增API */
export const addSessionApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addSession', data);
  } catch (error) {
    console.error('添加债权人会议失败:', error);
    throw error;
  }
};

export const addMeetingDocumentsApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addMeetingDocuments', data);
  } catch (error) {
    console.error('添加债权人会议文件失败:', error);
    throw error;
  }
};

export const addClaimConfirmationApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addClaimConfirmation', data);
  } catch (error) {
    console.error('添加债权确认失败:', error);
    throw error;
  }
};

/** 第六阶段API函数 */
export const getBankruptcyDistPlanApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.BankruptcyDistPlanInfo>
  >
> => {
  try {
    const token = '1cf410da5126134db95b41ad20557098';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllBankruptcyDistPlan?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取破产财产分配方案数据失败:', error);
    throw error;
  }
};

export const getEmployeeSPlanApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.EmployeeSPlanInfo>
  >
> => {
  try {
    const token = '15e4fe855b3ac9217ba42ac37a049026';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllEmployeeSPlan?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取员工安置方案数据失败:', error);
    throw error;
  }
};

export const getPriorityPaymentApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PriorityPaymentInfo>
  >
> => {
  try {
    const token = 'd8b58a8dade9ee9f4047c0faef6b701b';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllPriorityPayment?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取优先受偿权数据失败:', error);
    throw error;
  }
};

export const getPropertyDECApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PropertyDECInfo>
  >
> => {
  try {
    const token = '7b23de744671f96a654bdf843b092808';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllPropertyDEC?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取财产状况说明数据失败:', error);
    throw error;
  }
};

export const getDepositManagementApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.DepositManagementInfo>
  >
> => {
  try {
    const token = '0e422bd12a2426db4878f646d7815302';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllDepositManagement?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取存款管理数据失败:', error);
    throw error;
  }
};

/** 第四阶段API函数 */
export const getClaimConfirmationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllClaimConfirmation', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取债权确认数据失败:', error);
    throw error;
  }
};

export const getAllClaimConfirmationApi = getClaimConfirmationApi;

export const getAllAuditReportApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllAuditReport', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取审计报告数据失败:', error);
    throw error;
  }
};

export const getAllImportantActionsApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllImportantActions', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取重要行为数据失败:', error);
    throw error;
  }
};

export const getAllMeetingDocumentsApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllMeetingDocuments', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取会议文件数据失败:', error);
    throw error;
  }
};

export const getAllRemunerationPlanApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllRemunerationPlan', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取报酬方案数据失败:', error);
    throw error;
  }
};

export const getAllSessionApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllSession', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取会议数据失败:', error);
    throw error;
  }
};

export const getAllSetoffReviewApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllSetoffReview', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取抵销审查数据失败:', error);
    throw error;
  }
};

/** 第五阶段API函数 */
export const getAllAssetValuationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllAssetValuation', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取资产评估数据失败:', error);
    throw error;
  }
};

export const getAllBankruptcyDeclarationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllBankruptcyDeclaration', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取破产申报数据失败:', error);
    throw error;
  }
};

export const getAllPropertyVIMApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllPropertyVIM', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取财产管理方案数据失败:', error);
    throw error;
  }
};

export const getAllPropertyVPlanApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllPropertyVPlan', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取财产变价方案数据失败:', error);
    throw error;
  }
};

export const getAllAuctionAgencyApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get('/api/web/getAllAuctionAgency', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取拍卖机构数据失败:', error);
    throw error;
  }
};

/** 第七阶段API函数 */
export const getCanRRInfoApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.CanRRInfo>
  >
> => {
  try {
    const token = 'b9687d9bae9050728ce5f471ae32c737';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllCanRR?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取债权人会议决议数据失败:', error);
    throw error;
  }
};

export const getTerminationLitiApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.TerminationLitiInfo>
  >
> => {
  try {
    const token = '8e4a5f0694dc40db05031994e3b3b332';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllTerminationLiti?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取终止诉讼数据失败:', error);
    throw error;
  }
};

export const getAdditionalDisiributionApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AdditionalDisiributionInfo>
  >
> => {
  try {
    const token = '17da492375ef4f11867f65c39406594c';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllAdditionalDisiribution?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取追加分配数据失败:', error);
    throw error;
  }
};

/**
 * 流程处理文件上传API
 * 根据文档，流程处理文件使用统一的 /api/file/* 接口
 */

/**
 * 上传流程处理文件（单文件）
 * @param params 参数对象
 * @param params.taskId 任务ID（对应案件的SEP_ID）
 * @param params.file 文件对象
 * @param params.caseId 案件ID
 * @param params.taskType 任务类型
 * @returns 上传结果
 */
export const uploadProcessFileApi = async (params: {
  caseId: string;
  file: File;
  taskId: string;
  taskType: string;
}) => {
  return uploadFileApi(params.file, 'process', Number(params.taskId));
};

/**
 * 批量上传流程处理文件
 * @param taskId 任务ID（对应案件的SEP_ID）
 * @param files 文件数组
 * @returns 上传结果
 */
export const batchUploadProcessFilesApi = async (
  taskId: string,
  files: File[],
) => {
  const { batchUploadFilesApi } = await import('#/api/core/file');
  return batchUploadFilesApi(files, 'process', Number(taskId));
};

/**
 * 获取流程处理文件列表
 * @param params 参数对象
 * @param params.taskType 任务类型
 * @param params.taskId 任务ID
 * @param params.caseId 案件ID
 * @returns 文件列表
 */
export const getProcessFileListApi = async (params: {
  caseId: string;
  taskId: string;
  taskType: string;
}) => {
  return getFileListApi('process', Number(params.taskId));
};

/**
 * 下载流程处理文件
 * @param fileId 文件ID
 * @returns 文件Blob
 */
export const downloadProcessFileApi = async (fileId: number) => {
  return downloadFileApi(fileId);
};

/**
 * 删除流程处理文件
 * @param params 参数对象
 * @param params.fileId 文件ID
 * @param params.caseId 案件ID
 * @returns 删除结果
 */
export const deleteProcessFileApi = async (params: {
  caseId: string;
  fileId: number;
}) => {
  return deleteFileApi(params.fileId);
};

/**
 * 预览流程处理文件
 * @param fileId 文件ID
 * @returns 文件预览URL
 */
export const previewProcessFileApi = async (fileId: number) => {
  const { getFilePreviewUrl } = await import('#/api/core/file');
  return getFilePreviewUrl(fileId);
};

/** 第三阶段API函数 */
export const getAllPropertyInvestigationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PropertyInvestigationInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllPropertyInvestigation', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取财产调查数据失败:', error);
    throw error;
  }
};

export const getAllBankExpensesApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.BankExpensesInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllBankExpenses', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取破产费用数据失败:', error);
    throw error;
  }
};

export const getAllRightsClaimApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.RightsClaimInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllRightsClaim', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取权利主张数据失败:', error);
    throw error;
  }
};

export const getAllReclaimReviewApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ReclaimReviewInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllReclaimReview', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取取回权审查数据失败:', error);
    throw error;
  }
};

export const getAllLitigationArbitrationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.LitigationArbitrationInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllLitigationArbitration', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取诉讼仲裁数据失败:', error);
    throw error;
  }
};

export const getAllCreditorClaimApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.CreditorClaimInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllCreditorClaim', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取债权申报数据失败:', error);
    throw error;
  }
};

export const getAllSociaSFApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SocialSecurityFeesInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllSociaSF', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取社保费用数据失败:', error);
    throw error;
  }
};

export const getAllTaxVerificationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.TaxVerificationInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllTaxVerification', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取税收核定数据失败:', error);
    throw error;
  }
};
