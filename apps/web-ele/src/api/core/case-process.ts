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
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第六阶段：职工安置方案信息 */
  export interface EmployeeSettlementPlanInfo {
    row: number;
    SEP_ID: number;
    AZFANR: null | string;
    AZZJE: null | number;
    SJZGRS: null | number;
    PZRQ: null | string;
    SSZT: null | string;
    FZR: null | string;
    AZLX: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第六阶段：优先受偿信息 */
  export interface PriorityPaymentInfo {
    row: number;
    SEP_ID: number;
    ZQRLX: null | string;
    ZQRMC: null | string;
    ZFJE: null | number;
    ZFRQ: null | string;
    ZFFS: null | string;
    ZFYJ: null | string;
    ZFZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第六阶段：财产分配执行信息 */
  export interface PropertyDistributionExecutionInfo {
    row: number;
    SEP_ID: number;
    FPLX: null | string;
    ZQRMC: null | string;
    FPJE: null | number;
    FPRQ: null | string;
    FPFS: null | string;
    SJQR: null | string;
    ZHZT: null | string;
    YXJB: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第六阶段：提存管理信息 */
  export interface DepositManagementInfo {
    row: number;
    SEP_ID: number;
    TCLX: null | string;
    ZQRMC: null | string;
    TCJE: null | number;
    TCRQ: null | string;
    TCJG: null | string;
    TCYY: null | string;
    TCZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第六阶段：破产程序终结信息 */
  export interface BankruptcyProcedureTerminationInfo {
    row: number;
    SEP_ID: number;
    ZJYY: null | string;
    ZJRQ: null | string;
    FYCDWH: null | string;
    FPBG: null | string;
    TJRQ: null | string;
    FYPZRQ: null | string;
    ZJZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
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

  /** 第七阶段：注销登记信息 */
  export interface CancellationRegistrationInfo {
    row: number;
    SEP_ID: number;
    ZXLX: null | string;
    DJJG: null | string;
    SQRQ: null | string;
    ZXRQ: null | string;
    ZXWH: null | string;
    ZXZT: null | string;
    DJSX: null | string;
    DJHM: null | string;
    ZXYY: null | string;
    CLR: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：终结诉讼仲裁信息 */
  export interface TerminationLitigationInfo {
    row: number;
    SEP_ID: number;
    SSLX: null | string;
    XDF: null | string;
    FYZCJG: null | string;
    SSZT: null | string;
    CLJG: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：追加分配信息 */
  export interface AdditionalDistributionInfo {
    row: number;
    SEP_ID: number;
    FPLX: null | string;
    FPJE: null | number;
    FPRQ: null | string;
    ZQRMC: null | string;
    FPYJ: null | string;
    FPZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：账户印章管理信息 */
  export interface AccountSealManagementInfo {
    row: number;
    SEP_ID: number;
    GLLX: null | string;
    XMMC: null | string;
    CLRQ: null | string;
    CLFS: null | string;
    CLJG: null | string;
    ZMWJLJ: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：职务报告信息 */
  export interface DutyReportInfo {
    row: number;
    SEP_ID: number;
    BGLX: null | string;
    BGNR: null | string;
    TJRQ: null | string;
    TJR: null | string;
    JSF: null | string;
    SPZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：资料移交信息 */
  export interface DocumentTransferInfo {
    row: number;
    SEP_ID: number;
    YJLX: null | string;
    ZLMC: null | string;
    YJRQ: null | string;
    YJF: null | string;
    JSF: null | string;
    YJNR: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：归档管理信息 */
  export interface ArchivingManagementInfo {
    row: number;
    SEP_ID: number;
    GDLX: null | string;
    GDNR: null | string;
    GDRQ: null | string;
    GDWZ: null | string;
    FZR: null | string;
    GDZT: null | string;
    DAH: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：印章销毁信息 */
  export interface SealDestructionInfo {
    row: number;
    SEP_ID: number;
    YZLX: null | string;
    YZBH: null | string;
    XHRQ: null | string;
    XHFS: null | string;
    XHJZR: null | string;
    ZMWJ: null | string;
    YZ: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
  }

  /** 第七阶段：账户销户信息 */
  export interface AccountClosingInfo {
    row: number;
    SEP_ID: number;
    ZH: null | string;
    XHRQ: null | string;
    XHYY: null | string;
    YEJE: null | number;
    XHZT: null | string;
    ZT: null | string;
    SEP_LD: null | number;
    SEP_MD: null | number;
    SEP_ND: null | number;
    SEP_AUSER: null | string;
    SEP_ADATE: null | string;
    SEP_EUSER: null | string;
    SEP_EDATE: null | string;
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

export const getManagementApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/managementSystem/listByCase/${sepLd}`,
      {
        params: {
          page,
          size,
        },
      },
    );
  } catch (error) {
    console.error('获取管理制度数据失败:', error);
    throw error;
  }
};

export const getSealManagementApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SealManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/accountSeal/listByCase/${sepLd}`,
      {
        params: {
          page,
          size,
        },
      },
    );
  } catch (error) {
    console.error('获取账户印章管理数据失败:', error);
    throw error;
  }
};

export const getLegalProcedureApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.LegalProcedureInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/legalProcedure/listByCase/${sepLd}`,
      {
        params: {
          page,
          size,
        },
      },
    );
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

export const getAllWorkPlanApi = async (
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
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取工作计划数据失败:', error);
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

/** 第六阶段统一更新API（update6） */
export const update6Api = async (data: {
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

    return await requestClient8085.post('/api/web/update6', {
      ...data,
      SEP_EUSER,
      SEP_EDATE,
    });
  } catch (error) {
    console.error('第六阶段更新失败:', error);
    throw error;
  }
};

/** 第四阶段统一更新API（update4） */
export const update4Api = async (data: {
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

    return await requestClient8085.post('/api/web/update4', {
      ...data,
      SEP_EUSER,
      SEP_EDATE,
    });
  } catch (error) {
    console.error('第四阶段更新失败:', error);
    throw error;
  }
};

/** 第五阶段统一更新API（update5） */
export const update5Api = async (data: {
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

    return await requestClient8085.post('/api/web/update5', {
      ...data,
      SEP_EUSER,
      SEP_EDATE,
    });
  } catch (error) {
    console.error('第五阶段更新失败:', error);
    throw error;
  }
};

/** 第七阶段统一更新API（update7） */
export const update7Api = async (data: {
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

    return await requestClient8085.post('/api/web/update7', {
      ...data,
      SEP_EUSER,
      SEP_EDATE,
    });
  } catch (error) {
    console.error('第七阶段更新失败:', error);
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

/** 管理制度新增API */
export const addManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase1/managementSystem/add',
      data,
    );
  } catch (error) {
    console.error('添加管理制度失败:', error);
    throw error;
  }
};

/** 管理制度修改API */
export const updateManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase1/managementSystem/update',
      data,
    );
  } catch (error) {
    console.error('修改管理制度失败:', error);
    throw error;
  }
};

/** 管理制度删除API */
export const deleteManagementApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/managementSystem/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除管理制度失败:', error);
    throw error;
  }
};

/** 根据ID获取管理制度API */
export const getManagementByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/managementSystem/${sepId}`,
    );
  } catch (error) {
    console.error('获取管理制度详情失败:', error);
    throw error;
  }
};

/** 账户印章管理新增API */
export const addSealManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase1/accountSeal/add',
      data,
    );
  } catch (error) {
    console.error('添加账户印章管理失败:', error);
    throw error;
  }
};

/** 账户印章管理修改API */
export const updateSealManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase1/accountSeal/update',
      data,
    );
  } catch (error) {
    console.error('修改账户印章管理失败:', error);
    throw error;
  }
};

/** 账户印章管理删除API */
export const deleteSealManagementApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/accountSeal/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除账户印章管理失败:', error);
    throw error;
  }
};

/** 根据ID获取账户印章管理API */
export const getSealManagementByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/case/phase1/accountSeal/${sepId}`);
  } catch (error) {
    console.error('获取账户印章管理详情失败:', error);
    throw error;
  }
};

/** 法律程序新增API */
export const addLegalProcedureApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase1/legalProcedure/add',
      data,
    );
  } catch (error) {
    console.error('添加法律程序失败:', error);
    throw error;
  }
};

/** 法律程序修改API */
export const updateLegalProcedureApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase1/legalProcedure/update',
      data,
    );
  } catch (error) {
    console.error('修改法律程序失败:', error);
    throw error;
  }
};

/** 法律程序删除API */
export const deleteLegalProcedureApi = async (sepId: string | number) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/legalProcedure/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除法律程序失败:', error);
    throw error;
  }
};

/** 根据ID获取法律程序API */
export const getLegalProcedureByIdApi = async (sepId: string | number) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase1/legalProcedure/${sepId}`,
    );
  } catch (error) {
    console.error('获取法律程序详情失败:', error);
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

/** 第六阶段新增API */
export const addBankruptcyDistPlanApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addBankruptcyDistPlan', data);
  } catch (error) {
    console.error('添加破产财产分配方案失败:', error);
    throw error;
  }
};

export const addEmployeeSettlementPlanApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addEmployeeSettlementPlan',
      data,
    );
  } catch (error) {
    console.error('添加职工安置方案失败:', error);
    throw error;
  }
};

export const addPriorityPaymentApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addPriorityPayment', data);
  } catch (error) {
    console.error('添加优先受偿失败:', error);
    throw error;
  }
};

export const addPropertyDistributionExecutionApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addPropertyDistributionExecution',
      data,
    );
  } catch (error) {
    console.error('添加财产分配执行失败:', error);
    throw error;
  }
};

export const addDepositManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addDepositManagement', data);
  } catch (error) {
    console.error('添加提存管理失败:', error);
    throw error;
  }
};

export const addBankruptcyProcedureTerminationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addBankruptcyProcedureTermination',
      data,
    );
  } catch (error) {
    console.error('添加破产程序终结失败:', error);
    throw error;
  }
};

/** 第七阶段新增API */
export const addCancellationRegistrationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addCancellationRegistration',
      data,
    );
  } catch (error) {
    console.error('添加注销登记失败:', error);
    throw error;
  }
};

export const addTerminationLitigationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addTerminationLitigation',
      data,
    );
  } catch (error) {
    console.error('添加终结诉讼失败:', error);
    throw error;
  }
};

export const addAdditionalDistributionApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addAdditionalDistribution',
      data,
    );
  } catch (error) {
    console.error('添加追加分配失败:', error);
    throw error;
  }
};

export const addAccountSealManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addAccountSealManagement',
      data,
    );
  } catch (error) {
    console.error('添加账户印章管理失败:', error);
    throw error;
  }
};

export const addDutyReportApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addDutyReport', data);
  } catch (error) {
    console.error('添加职务报告失败:', error);
    throw error;
  }
};

export const addDocumentTransferApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addDocumentTransfer', data);
  } catch (error) {
    console.error('添加资料移交失败:', error);
    throw error;
  }
};

export const addArchivingManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/addArchivingManagement',
      data,
    );
  } catch (error) {
    console.error('添加归档管理失败:', error);
    throw error;
  }
};

export const addSealDestructionApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addSealDestruction', data);
  } catch (error) {
    console.error('添加印章销毁失败:', error);
    throw error;
  }
};

export const addAccountClosingApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addAccountClosing', data);
  } catch (error) {
    console.error('添加账户销户失败:', error);
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
    return await requestClient8085.get('/api/web/getAllBankruptcyDistPlan', {
      params: { SEP_ID, page, size },
    });
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
    CaseProcessApi.PageResponse<CaseProcessApi.EmployeeSettlementPlanInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllEmployeeSPlan', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取职工安置方案数据失败:', error);
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
    return await requestClient8085.get('/api/web/getAllPriorityPayment', {
      params: { SEP_ID, page, size },
    });
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
    return await requestClient8085.get('/api/web/getAllPropertyDEC', {
      params: { SEP_ID, page, size },
    });
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
    return await requestClient8085.get('/api/web/getAllDepositManagement', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取提存管理数据失败:', error);
    throw error;
  }
};

export const getPropertyDistributionExecutionApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PropertyDistributionExecutionInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/web/getAllPropertyDistributionExecution',
      {
        params: { SEP_ID, page, size },
      },
    );
  } catch (error) {
    console.error('获取财产分配执行数据失败:', error);
    throw error;
  }
};

export const getBankruptcyProcedureTerminationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.BankruptcyProcedureTerminationInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/web/getAllBankruptcyProcedureTermination',
      {
        params: { SEP_ID, page, size },
      },
    );
  } catch (error) {
    console.error('获取破产程序终结数据失败:', error);
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
    return await requestClient8085.get('/api/web/getAllCanRR', {
      params: { SEP_ID, page, size },
    });
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
    CaseProcessApi.PageResponse<CaseProcessApi.TerminationLitigationInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllTerminationLiti', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取终结诉讼数据失败:', error);
    throw error;
  }
};

export const getAdditionalDisiributionApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AdditionalDistributionInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/web/getAllAdditionalDisiribution',
      {
        params: { SEP_ID, page, size },
      },
    );
  } catch (error) {
    console.error('获取追加分配数据失败:', error);
    throw error;
  }
};

export const getCancellationRegistrationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.CancellationRegistrationInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/web/getAllCancellationRegistration',
      {
        params: { SEP_ID, page, size },
      },
    );
  } catch (error) {
    console.error('获取注销登记数据失败:', error);
    throw error;
  }
};

export const getAccountSealManagementApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AccountSealManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllAccountSealManagement', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取账户印章管理数据失败:', error);
    throw error;
  }
};

export const getDutyReportApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.DutyReportInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllDutyReport', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取职务报告数据失败:', error);
    throw error;
  }
};

export const getDocumentTransferApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.DocumentTransferInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllDocumentTransfer', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取资料移交数据失败:', error);
    throw error;
  }
};

export const getArchivingManagementApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ArchivingManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllArchivingManagement', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取归档管理数据失败:', error);
    throw error;
  }
};

export const getSealDestructionApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SealDestructionInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllSealDestruction', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取印章销毁数据失败:', error);
    throw error;
  }
};

export const getAccountClosingApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AccountClosingInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllAccountClosing', {
      params: { SEP_ID, page, size },
    });
  } catch (error) {
    console.error('获取账户销户数据失败:', error);
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
