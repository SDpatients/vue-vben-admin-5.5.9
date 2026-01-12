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

  export interface SessionInfo {
    sepId: number;
    sepLd: number;
    sepMd: number;
    sepNd: string;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string;
    sepEdate: string;
    hyrq: string;
    hydd: string;
    hyzt: string;
    hyjl: string;
    zt: string;
  }

  /** 第四阶段：债权人会议文件信息 */
  export interface MeetingDocumentsInfo {
    sepId: number;
    sepLd: number;
    sepMd: number;
    sepNd: string;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string;
    sepEdate: string;
    wjmc: string;
    wjlx: string;
    wjlj: string;
    zt: string;
  }

  /** 第四阶段：债权确认信息 */
  export interface ClaimConfirmationInfo {
    sepId: number;
    sepLd: number;
    sepMd: number;
    sepNd: string;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string;
    sepEdate: string;
    zqzqrmc: string;
    zqzqje: number;
    zqzqzt: string;
    zqzqrq: string;
    zqzqqr: string;
    zt: string;
  }

  /** 第四阶段：报酬方案信息 */
  export interface RemunerationPlanInfo {
    sepId: number;
    sepLd: number;
    sepMd: number;
    sepNd: string;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string;
    sepEdate: string;
    famc: string;
    fanr: string;
    fazt: string;
    zt: string;
  }

  /** 第四阶段：重要行为报告信息 */
  export interface ImportantActionsInfo {
    sepId: number;
    sepLd: number;
    sepMd: number;
    sepNd: string;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string;
    sepEdate: string;
    zysx: string;
    zysxnr: string;
    zysxrq: string;
    zysxzr: string;
    zt: string;
  }

  /** 第四阶段：抵消权审查信息 */
  export interface SetoffReviewInfo {
    sepId: number;
    sepLd: number;
    sepMd: number;
    sepNd: string;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string;
    sepEdate: string;
    dxqmc: string;
    dxqje: number;
    dxqzt: string;
    dxqrq: string;
    dxqqr: string;
    zt: string;
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
    ZQZQRMC: null | string;
    ZQZQRLX: null | string;
    ZQZQRSFZH: null | string;
    ZQZQRDH: null | string;
    ZQZQRDZ: null | string;
    ZQZQJJE: null | number;
    ZQZQJJEBZ: null | string;
    ZQZQJZQSJ: null | string;
    ZQZQJZQSJBZ: null | string;
    ZQZQJZQSJZDY: null | string;
    ZQZQJZQSJZDYDZ: null | string;
    ZQZQJZQSJZDYDZBZ: null | string;
    ZQZQJZQSJZDYDZLXDH: null | string;
    ZQZQJZQSJZDYDZLXDHBZ: null | string;
    ZQZQJZQSJZDYDZLXDHYX: null | string;
    ZQZQJZQSJZDYDZLXDHYXBZ: null | string;
    ZQZQJZQSJZDYDZLXDHZJ: null | string;
    ZQZQJZQSJZDYDZLXDHZJBZ: null | string;
    ZQZQJZQSJZDYDZLXDHZJLX: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXBZ: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMC: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMCBZ: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMCDZ: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMCDZBZ: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDH: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDHBZ: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDHYX: null | string;
    ZQZQJZQSJZDYDZLXDHZJLXMCDZDHYXBZ: null | string;
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

  /** 第七阶段：注销登记信息 */
  export interface CancellationRegistrationInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    zxlx: string;
    djjg: string;
    sqrq: string;
    zxrq: string;
    zxwh: string;
    zxzt: string;
    djsx: string;
    djhm: string;
    zxyy: string;
    clr: string;
    zt: string;
  }

  /** 第七阶段：终结诉讼仲裁信息 */
  export interface TerminationLitigationInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    sslx: string;
    xdf: string;
    fyzcjg: string;
    sszt: string;
    cljg: string;
    zt: string;
  }

  /** 第七阶段：追加分配信息 */
  export interface AdditionalDistributionInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    fplx: string;
    fpje: number;
    fprq: string;
    zqrmc: string;
    fpyj: string;
    fpzt: string;
    zt: string;
  }

  /** 第七阶段：账户印章管理信息 */
  export interface AccountSealManagementPhase7Info {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    gllx: string;
    xmmc: string;
    clrq: string;
    clfs: string;
    cljg: string;
    zmwjlj: string;
    zt: string;
  }

  /** 第七阶段：职务报告信息 */
  export interface DutyReportInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    bglx: string;
    bgnr: string;
    tjrq: string;
    tjr: string;
    jsf: string;
    spzt: string;
    zt: string;
  }

  /** 第七阶段：资料移交信息 */
  export interface DocumentTransferInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    yjlx: string;
    zlmc: string;
    yjrq: string;
    yjf: string;
    jsf: string;
    yjnr: string;
    zt: string;
  }

  /** 第七阶段：归档管理信息 */
  export interface ArchivingManagementInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    gdlx: string;
    gdnr: string;
    gdrq: string;
    gdwz: string;
    fzr: string;
    gdzt: string;
    dah: string;
    zt: string;
  }

  /** 第七阶段：印章销毁信息 */
  export interface SealDestructionInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    yzlx: string;
    yzbh: string;
    xhrq: string;
    xhfs: string;
    xhjzr: string;
    zmwj: string;
    yz: string;
    zt: string;
  }

  /** 第七阶段：账户销户信息 */
  export interface AccountClosingInfo {
    sepId: number;
    sepLd: number;
    sepMd: number | null;
    sepNd: string | null;
    sepAuser: string;
    sepAdate: string;
    sepEuser: string | null;
    sepEdate: string | null;
    zh: string;
    xhrq: string;
    xhyy: string;
    yeje: string;
    xhzt: string;
    zt: string;
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

export const getAllManagementApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/case/phase1/managementSystem/list',
      {
        params: {
          page,
          size,
        },
      },
    );
  } catch (error) {
    console.error('获取所有管理制度数据失败:', error);
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

export const getAllSealManagementApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SealManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/case/phase1/accountSeal/list', {
      params: {
        page,
        size,
      },
    });
  } catch (error) {
    console.error('获取所有账户印章管理数据失败:', error);
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

export const getAllLegalProcedureApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.LegalProcedureInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/case/phase1/legalProcedure/list', {
      params: {
        page,
        size,
      },
    });
  } catch (error) {
    console.error('获取所有法律程序数据失败:', error);
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
    return await requestClient8085.get(
      `/api/case/phase2/propertyReceipt/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase2/emergency/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase2/propertyPlan/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase2/personnelEmp/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase2/internalAffairs/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase2/contractManagement/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase2/businessManagement/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取营业管理数据失败:', error);
    throw error;
  }
};

export const getAllWorkPlanApi = async (
  caseId?: string,
  pageNum: number = 1,
  pageSize: number = 10,
  planType?: string,
  executionStatus?: string,
  status?: string,
): Promise<{
  code: number;
  message: string;
  data: {
    total: number;
    list: Array<{
      id: number;
      status: string;
      isDeleted: boolean;
      createTime: string;
      updateTime: string;
      createUserId: number | null;
      updateUserId: number | null;
      planNumber: string;
      planType: string;
      planContent: string;
      startDate: string;
      endDate: string;
      responsibleUserId: number;
      executionStatus: string;
      caseId: number;
    }>;
  };
}> => {
  try {
    return await requestClient8085.get('/work-plan/list', {
      params: { caseId, pageNum, pageSize, planType, executionStatus, status },
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

    return await requestClient8085.post('/api/case/phase1/update', requestData);
  } catch (error) {
    console.error('统一任务操作失败:', error);
    throw error;
  }
};

/** 第一阶段统一更新API（update1） */
export const update1Api = async (data: {
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

    const operateTypeToModule: Record<number, string> = {
      7: 'managementSystem',
      8: 'accountSeal',
      9: 'legalProcedure',
    };

    const moduleName = operateTypeToModule[data.OperateType] || '';
    if (!moduleName) {
      throw new Error('无效的OperateType');
    }

    // 构建更新API路径
    const apiPath = `/api/case/phase1/${moduleName}/update`;

    return await requestClient8085.post(apiPath, {
      ...data,
      SEP_EUSER,
      SEP_EDATE,
    });
  } catch (error) {
    console.error('第一阶段更新失败:', error);
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

    const operateTypeToModule: Record<number, string> = {
      0: 'propertyReceipt',
      1: 'emergency',
      2: 'propertyPlan',
      3: 'personnelEmp',
      4: 'internalAffairs',
      5: 'contractManagement',
      6: 'businessManagement',
    };

    const moduleName = operateTypeToModule[data.OperateType] || '';
    if (!moduleName) {
      throw new Error('无效的OperateType');
    }

    // 构建更新API路径
    const apiPath = `/api/case/phase2/${moduleName}/update`;

    return await requestClient8085.post(apiPath, {
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

    return await requestClient8085.post('/api/case/phase3/update', {
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
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase1/managementSystem/update',
      requestData,
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
    // 确保传递正确的sepId参数名
    const requestData = {
      ...data,
      // 确保sepId字段被正确传递，无论其值是什么
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase1/accountSeal/update',
      requestData,
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
    // 确保传递正确的sepId参数名
    const requestData = {
      ...data,
      // 确保sepId字段被正确传递，无论其值是什么
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase1/legalProcedure/update',
      requestData,
    );
  } catch (error) {
    console.error('修改法律程序失败:', error);
    throw error;
  }
};

/** 法律程序删除API */
export const deleteLegalProcedureApi = async (sepId: number | string) => {
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
export const getLegalProcedureByIdApi = async (sepId: number | string) => {
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
    return await requestClient8085.post(
      '/api/case/phase2/propertyReceipt/add',
      data,
    );
  } catch (error) {
    console.error('添加财产接收失败:', error);
    throw error;
  }
};

/** 应急管理新增API */
export const addEmergencyApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/case/phase2/emergency/add', data);
  } catch (error) {
    console.error('添加应急管理失败:', error);
    throw error;
  }
};

/** 财产方案管理新增API */
export const addPropertyPlanApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase2/propertyPlan/add',
      data,
    );
  } catch (error) {
    console.error('添加财产方案管理失败:', error);
    throw error;
  }
};

/** 人员聘用新增API */
export const addPersonnelEmploymentApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase2/personnelEmp/add',
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
    return await requestClient8085.post(
      '/api/case/phase2/internalAffairs/add',
      data,
    );
  } catch (error) {
    console.error('添加内部事务管理失败:', error);
    throw error;
  }
};

/** 合同管理新增API */
export const addContractManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase2/contractManagement/add',
      data,
    );
  } catch (error) {
    console.error('添加合同管理失败:', error);
    throw error;
  }
};

/** 营业管理新增API */
export const addBusinessManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase2/businessManagement/add',
      data,
    );
  } catch (error) {
    console.error('添加营业管理失败:', error);
    throw error;
  }
};

/** 第三阶段新增API */
export const addPropertyInvestigationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/propertyInvestigation/add',
      data,
    );
  } catch (error) {
    console.error('添加财产调查失败:', error);
    throw error;
  }
};

export const addBankExpensesApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/bankruptcyExpenses/add',
      data,
    );
  } catch (error) {
    console.error('添加破产费用失败:', error);
    throw error;
  }
};

export const addRightsClaimApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/rightsClaim/add',
      data,
    );
  } catch (error) {
    console.error('添加权利主张失败:', error);
    throw error;
  }
};

export const addReclaimReviewApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/reclaimReview/add',
      data,
    );
  } catch (error) {
    console.error('添加取回权审查失败:', error);
    throw error;
  }
};

export const addLitigationArbitrationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/litigationArbitration/add',
      data,
    );
  } catch (error) {
    console.error('添加诉讼仲裁失败:', error);
    throw error;
  }
};

export const addCreditorClaimApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/creditorClaim/add',
      data,
    );
  } catch (error) {
    console.error('添加债权申报失败:', error);
    throw error;
  }
};

export const addSocialSecurtyFeesApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/socialSecurityFees/add',
      data,
    );
  } catch (error) {
    console.error('添加社保费用失败:', error);
    throw error;
  }
};

export const addTaxVerificationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase3/taxVerification/add',
      data,
    );
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


export const addSessionApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/case/phase4/session/add', data);
  } catch (error) {
    console.error('添加债权人会议失败:', error);
    throw error;
  }
};

export const addMeetingDocumentsApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/meetingDocuments/add',
      data,
    );
  } catch (error) {
    console.error('添加债权人会议文件失败:', error);
    throw error;
  }
};

export const addClaimConfirmationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/claimConfirmation/add',
      data,
    );
  } catch (error) {
    console.error('添加债权确认失败:', error);
    throw error;
  }
};

export const addRemunerationPlanApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/remunerationPlan/add',
      data,
    );
  } catch (error) {
    console.error('添加报酬方案失败:', error);
    throw error;
  }
};

export const addImportantActionsApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/importantActions/add',
      data,
    );
  } catch (error) {
    console.error('添加重要行为报告失败:', error);
    throw error;
  }
};

export const addSetoffReviewApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/setoffReview/add',
      data,
    );
  } catch (error) {
    console.error('添加抵消权审查失败:', error);
    throw error;
  }
};

/** 第四阶段债权人会议CRUD接口 */
export const getAllSessionApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SessionInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/case/phase4/session/list', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有债权人会议数据失败:', error);
    throw error;
  }
};

export const getSessionByCaseApi = async (
  caseId: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SessionInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/session/listByCase/${caseId}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取债权人会议数据失败:', error);
    throw error;
  }
};

export const getSessionByIdApi = async (id: number | string) => {
  try {
    return await requestClient8085.get(`/api/case/phase4/session/${id}`);
  } catch (error) {
    console.error('获取债权人会议详情失败:', error);
    throw error;
  }
};

export const updateSessionApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/session/update',
      requestData,
    );
  } catch (error) {
    console.error('修改债权人会议失败:', error);
    throw error;
  }
};

export const deleteSessionApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/session/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除债权人会议失败:', error);
    throw error;
  }
};

/** 第四阶段债权人会议文件CRUD接口 */
export const getAllMeetingDocumentsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.MeetingDocumentsInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/case/phase4/meetingDocuments/list',
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取所有债权人会议文件数据失败:', error);
    throw error;
  }
};

export const getMeetingDocumentsByCaseApi = async (
  caseId: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.MeetingDocumentsInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/meetingDocuments/listByCase/${caseId}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取债权人会议文件数据失败:', error);
    throw error;
  }
};

export const getMeetingDocumentsByIdApi = async (id: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/meetingDocuments/${id}`,
    );
  } catch (error) {
    console.error('获取债权人会议文件详情失败:', error);
    throw error;
  }
};

export const updateMeetingDocumentsApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/meetingDocuments/update',
      requestData,
    );
  } catch (error) {
    console.error('修改债权人会议文件失败:', error);
    throw error;
  }
};

export const deleteMeetingDocumentsApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/meetingDocuments/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除债权人会议文件失败:', error);
    throw error;
  }
};

/** 第四阶段债权确认CRUD接口 */
export const getAllClaimConfirmationApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ClaimConfirmationInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/case/phase4/claimConfirmation/list',
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取所有债权确认数据失败:', error);
    throw error;
  }
};

export const getClaimConfirmationByCaseApi = async (
  caseId: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ClaimConfirmationInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/claimConfirmation/listByCase/${caseId}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取债权确认数据失败:', error);
    throw error;
  }
};

export const getClaimConfirmationByIdApi = async (id: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/claimConfirmation/${id}`,
    );
  } catch (error) {
    console.error('获取债权确认详情失败:', error);
    throw error;
  }
};

export const updateClaimConfirmationApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/claimConfirmation/update',
      requestData,
    );
  } catch (error) {
    console.error('修改债权确认失败:', error);
    throw error;
  }
};

export const deleteClaimConfirmationApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/claimConfirmation/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除债权确认失败:', error);
    throw error;
  }
};

/** 第四阶段报酬方案CRUD接口 */
export const getAllRemunerationPlanApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.RemunerationPlanInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/case/phase4/remunerationPlan/list',
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取所有报酬方案数据失败:', error);
    throw error;
  }
};

export const getRemunerationPlanByCaseApi = async (
  caseId: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.RemunerationPlanInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/remunerationPlan/listByCase/${caseId}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取报酬方案数据失败:', error);
    throw error;
  }
};

export const getRemunerationPlanByIdApi = async (id: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/remunerationPlan/${id}`,
    );
  } catch (error) {
    console.error('获取报酬方案详情失败:', error);
    throw error;
  }
};

export const updateRemunerationPlanApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/remunerationPlan/update',
      requestData,
    );
  } catch (error) {
    console.error('修改报酬方案失败:', error);
    throw error;
  }
};

export const deleteRemunerationPlanApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/remunerationPlan/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除报酬方案失败:', error);
    throw error;
  }
};

/** 第四阶段重要行为报告CRUD接口 */
export const getAllImportantActionsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ImportantActionsInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      '/api/case/phase4/importantActions/list',
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取所有重要行为报告数据失败:', error);
    throw error;
  }
};

export const getImportantActionsByCaseApi = async (
  caseId: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ImportantActionsInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/importantActions/listByCase/${caseId}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取重要行为报告数据失败:', error);
    throw error;
  }
};

export const getImportantActionsByIdApi = async (id: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/importantActions/${id}`,
    );
  } catch (error) {
    console.error('获取重要行为报告详情失败:', error);
    throw error;
  }
};

export const updateImportantActionsApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/importantActions/update',
      requestData,
    );
  } catch (error) {
    console.error('修改重要行为报告失败:', error);
    throw error;
  }
};

export const deleteImportantActionsApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/importantActions/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除重要行为报告失败:', error);
    throw error;
  }
};

/** 第四阶段抵消权审查CRUD接口 */
export const getAllSetoffReviewApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SetoffReviewInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/case/phase4/setoffReview/list', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有抵消权审查数据失败:', error);
    throw error;
  }
};

export const getSetoffReviewByCaseApi = async (
  caseId: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SetoffReviewInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/setoffReview/listByCase/${caseId}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取抵消权审查数据失败:', error);
    throw error;
  }
};

export const getSetoffReviewByIdApi = async (id: number | string) => {
  try {
    return await requestClient8085.get(`/api/case/phase4/setoffReview/${id}`);
  } catch (error) {
    console.error('获取抵消权审查详情失败:', error);
    throw error;
  }
};

export const updateSetoffReviewApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/setoffReview/update',
      requestData,
    );
  } catch (error) {
    console.error('修改抵消权审查失败:', error);
    throw error;
  }
};

export const deleteSetoffReviewApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/setoffReview/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除抵消权审查失败:', error);
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
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ClaimConfirmationInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/claimConfirmation/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取债权确认数据失败:', error);
    throw error;
  }
};

export const getAllAuditReportApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/auditReport/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取审计报告数据失败:', error);
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
    return await requestClient8085.get(
      `/api/case/phase4/assetValuation/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase4/bankruptcyDeclaration/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取破产宣告数据失败:', error);
    throw error;
  }
};

export const getAllPropertyVIMApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/propertyValuationImplementation/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取财产变价实施数据失败:', error);
    throw error;
  }
};

export const getAllPropertyVPlanApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/propertyValuationPlan/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase4/auctionAgency/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取拍卖机构数据失败:', error);
    throw error;
  }
};

/** 第五阶段新增API */
export const addAuditReportApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/auditReport/add',
      data,
    );
  } catch (error) {
    console.error('添加审计报告失败:', error);
    throw error;
  }
};

export const updateAuditReportApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/auditReport/update',
      requestData,
    );
  } catch (error) {
    console.error('修改审计报告失败:', error);
    throw error;
  }
};

export const deleteAuditReportApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/auditReport/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除审计报告失败:', error);
    throw error;
  }
};

export const getAuditReportByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/case/phase4/auditReport/${sepId}`);
  } catch (error) {
    console.error('获取审计报告详情失败:', error);
    throw error;
  }
};

export const addAssetValuationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/assetValuation/add',
      data,
    );
  } catch (error) {
    console.error('添加资产评估失败:', error);
    throw error;
  }
};

export const updateAssetValuationApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/assetValuation/update',
      requestData,
    );
  } catch (error) {
    console.error('修改资产评估失败:', error);
    throw error;
  }
};

export const deleteAssetValuationApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/assetValuation/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除资产评估失败:', error);
    throw error;
  }
};

export const getAssetValuationByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/assetValuation/${sepId}`,
    );
  } catch (error) {
    console.error('获取资产评估详情失败:', error);
    throw error;
  }
};

export const addPropertyValuationPlanApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/propertyValuationPlan/add',
      data,
    );
  } catch (error) {
    console.error('添加财产变价方案失败:', error);
    throw error;
  }
};

export const updatePropertyValuationPlanApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/propertyValuationPlan/update',
      requestData,
    );
  } catch (error) {
    console.error('修改财产变价方案失败:', error);
    throw error;
  }
};

export const deletePropertyValuationPlanApi = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/propertyValuationPlan/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除财产变价方案失败:', error);
    throw error;
  }
};

export const getPropertyValuationPlanByIdApi = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/propertyValuationPlan/${sepId}`,
    );
  } catch (error) {
    console.error('获取财产变价方案详情失败:', error);
    throw error;
  }
};

export const addAuctionAgencyApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/auctionAgency/add',
      data,
    );
  } catch (error) {
    console.error('添加拍卖机构失败:', error);
    throw error;
  }
};

export const updateAuctionAgencyApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/auctionAgency/update',
      requestData,
    );
  } catch (error) {
    console.error('修改拍卖机构失败:', error);
    throw error;
  }
};

export const deleteAuctionAgencyApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/auctionAgency/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除拍卖机构失败:', error);
    throw error;
  }
};

export const getAuctionAgencyByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/auctionAgency/${sepId}`,
    );
  } catch (error) {
    console.error('获取拍卖机构详情失败:', error);
    throw error;
  }
};

export const addBankruptcyDeclarationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/bankruptcyDeclaration/add',
      data,
    );
  } catch (error) {
    console.error('添加破产宣告失败:', error);
    throw error;
  }
};

export const updateBankruptcyDeclarationApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/bankruptcyDeclaration/update',
      requestData,
    );
  } catch (error) {
    console.error('修改破产宣告失败:', error);
    throw error;
  }
};

export const deleteBankruptcyDeclarationApi = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/bankruptcyDeclaration/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除破产宣告失败:', error);
    throw error;
  }
};

export const getBankruptcyDeclarationByIdApi = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/bankruptcyDeclaration/${sepId}`,
    );
  } catch (error) {
    console.error('获取破产宣告详情失败:', error);
    throw error;
  }
};

export const addPropertyValuationImplementationApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/case/phase4/propertyValuationImplementation/add',
      data,
    );
  } catch (error) {
    console.error('添加财产变价实施失败:', error);
    throw error;
  }
};

export const updatePropertyValuationImplementationApi = async (data: any) => {
  try {
    const requestData = {
      ...data,
      ...(('sepId' in data || 'sep_id' in data || 'SEP_ID' in data) && {
        sepId: data.sepId || data.sep_id || data.SEP_ID,
      }),
    };
    return await requestClient8085.post(
      '/api/case/phase4/propertyValuationImplementation/update',
      requestData,
    );
  } catch (error) {
    console.error('修改财产变价实施失败:', error);
    throw error;
  }
};

export const deletePropertyValuationImplementationApi = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/propertyValuationImplementation/delete/${sepId}`,
    );
  } catch (error) {
    console.error('删除财产变价实施失败:', error);
    throw error;
  }
};

export const getPropertyValuationImplementationByIdApi = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.get(
      `/api/case/phase4/propertyValuationImplementation/${sepId}`,
    );
  } catch (error) {
    console.error('获取财产变价实施详情失败:', error);
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
    return await requestClient8085.get(
      `/api/case/phase3/propertyInvestigation/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase3/bankruptcyExpenses/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase3/rightsClaim/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase3/reclaimReview/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase3/litigationArbitration/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase3/creditorClaim/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase3/socialSecurityFees/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
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
    return await requestClient8085.get(
      `/api/case/phase3/taxVerification/listByCase/${SEP_ID}`,
      {
        params: { page, size },
      },
    );
  } catch (error) {
    console.error('获取税收核定数据失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 注销登记 (CANCELLATION_REGISTRATION)
// ============================================

export const getAllCancellationRegistrationsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.CancellationRegistrationInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllCancellationRegistrations', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有注销登记数据失败:', error);
    throw error;
  }
};

export const getCancellationRegistrationsByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.CancellationRegistrationInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/web/getCancellationRegistrationsByCaseId`,
      {
        params: { sepLd, page, size },
      },
    );
  } catch (error) {
    console.error('获取注销登记数据失败:', error);
    throw error;
  }
};

export const getCancellationRegistrationByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getCancellationRegistrationById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取注销登记详情失败:', error);
    throw error;
  }
};

export const addCancellationRegistrationApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addCancellationRegistration', data);
  } catch (error) {
    console.error('添加注销登记失败:', error);
    throw error;
  }
};

export const updateCancellationRegistrationApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateCancellationRegistration', data);
  } catch (error) {
    console.error('修改注销登记失败:', error);
    throw error;
  }
};

export const updateCancellationRegistrationByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/updateCancellationRegistrationByCaseId',
      data,
    );
  } catch (error) {
    console.error('根据案件ID更新注销登记失败:', error);
    throw error;
  }
};

export const deleteCancellationRegistrationApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteCancellationRegistration', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除注销登记失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 终结诉讼仲裁 (TERMINATION_LITIGATION)
// ============================================

export const getAllTerminationLitigationsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.TerminationLitigationInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllTerminationLitigations', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有终结诉讼仲裁数据失败:', error);
    throw error;
  }
};

export const getTerminationLitigationsByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.TerminationLitigationInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/web/getTerminationLitigationsByCaseId`,
      {
        params: { sepLd, page, size },
      },
    );
  } catch (error) {
    console.error('获取终结诉讼仲裁数据失败:', error);
    throw error;
  }
};

export const getTerminationLitigationByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getTerminationLitigationById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取终结诉讼仲裁详情失败:', error);
    throw error;
  }
};

export const addTerminationLitigationApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addTerminationLitigation', data);
  } catch (error) {
    console.error('添加终结诉讼仲裁失败:', error);
    throw error;
  }
};

export const updateTerminationLitigationApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateTerminationLitigation', data);
  } catch (error) {
    console.error('修改终结诉讼仲裁失败:', error);
    throw error;
  }
};

export const updateTerminationLitigationByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/updateTerminationLitigationByCaseId',
      data,
    );
  } catch (error) {
    console.error('根据案件ID更新终结诉讼仲裁失败:', error);
    throw error;
  }
};

export const deleteTerminationLitigationApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteTerminationLitigation', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除终结诉讼仲裁失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 追加分配 (ADDITIONAL_DISTRIBUTION)
// ============================================

export const getAllAdditionalDistributionsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AdditionalDistributionInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllAdditionalDistributions', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有追加分配数据失败:', error);
    throw error;
  }
};

export const getAdditionalDistributionsByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AdditionalDistributionInfo>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/web/getAdditionalDistributionsByCaseId`,
      {
        params: { sepLd, page, size },
      },
    );
  } catch (error) {
    console.error('获取追加分配数据失败:', error);
    throw error;
  }
};

export const getAdditionalDistributionByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getAdditionalDistributionById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取追加分配详情失败:', error);
    throw error;
  }
};

export const addAdditionalDistributionApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addAdditionalDistribution', data);
  } catch (error) {
    console.error('添加追加分配失败:', error);
    throw error;
  }
};

export const updateAdditionalDistributionApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateAdditionalDistribution', data);
  } catch (error) {
    console.error('修改追加分配失败:', error);
    throw error;
  }
};

export const updateAdditionalDistributionByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/updateAdditionalDistributionByCaseId',
      data,
    );
  } catch (error) {
    console.error('根据案件ID更新追加分配失败:', error);
    throw error;
  }
};

export const deleteAdditionalDistributionApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteAdditionalDistribution', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除追加分配失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 账户印章管理 (ACCOUNT_SEAL_MANAGEMENT)
// ============================================

export const getAllAccountSealManagementsPhase7Api = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AccountSealManagementPhase7Info>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllAccountSealManagements', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有账户印章管理数据失败:', error);
    throw error;
  }
};

export const getAccountSealManagementsPhase7ByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AccountSealManagementPhase7Info>
  >
> => {
  try {
    return await requestClient8085.get(
      `/api/web/getAccountSealManagementsByCaseId`,
      {
        params: { sepLd, page, size },
      },
    );
  } catch (error) {
    console.error('获取账户印章管理数据失败:', error);
    throw error;
  }
};

export const getAccountSealManagementPhase7ByIdApi = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.get(`/api/web/getAccountSealManagementById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取账户印章管理详情失败:', error);
    throw error;
  }
};

export const addAccountSealManagementPhase7Api = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addAccountSealManagement', data);
  } catch (error) {
    console.error('添加账户印章管理失败:', error);
    throw error;
  }
};

export const updateAccountSealManagementPhase7Api = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateAccountSealManagement', data);
  } catch (error) {
    console.error('修改账户印章管理失败:', error);
    throw error;
  }
};

export const updateAccountSealManagementPhase7ByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/updateAccountSealManagementByCaseId',
      data,
    );
  } catch (error) {
    console.error('根据案件ID更新账户印章管理失败:', error);
    throw error;
  }
};

export const deleteAccountSealManagementPhase7Api = async (
  sepId: number | string,
) => {
  try {
    return await requestClient8085.post(
      '/api/web/deleteAccountSealManagement',
      null,
      { params: { sepId } },
    );
  } catch (error) {
    console.error('删除账户印章管理失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 职务报告 (DUTY_REPORT)
// ============================================

export const getAllDutyReportsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.DutyReportInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllDutyReports', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有职务报告数据失败:', error);
    throw error;
  }
};

export const getDutyReportsByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.DutyReportInfo>
  >
> => {
  try {
    return await requestClient8085.get(`/api/web/getDutyReportsByCaseId`, {
      params: { sepLd, page, size },
    });
  } catch (error) {
    console.error('获取职务报告数据失败:', error);
    throw error;
  }
};

export const getDutyReportByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getDutyReportById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取职务报告详情失败:', error);
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

export const updateDutyReportApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateDutyReport', data);
  } catch (error) {
    console.error('修改职务报告失败:', error);
    throw error;
  }
};

export const updateDutyReportByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateDutyReportByCaseId', data);
  } catch (error) {
    console.error('根据案件ID更新职务报告失败:', error);
    throw error;
  }
};

export const deleteDutyReportApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteDutyReport', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除职务报告失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 资料移交 (DOCUMENT_TRANSFER)
// ============================================

export const getAllDocumentTransfersApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.DocumentTransferInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllDocumentTransfers', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有资料移交数据失败:', error);
    throw error;
  }
};

export const getDocumentTransfersByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.DocumentTransferInfo>
  >
> => {
  try {
    return await requestClient8085.get(`/api/web/getDocumentTransfersByCaseId`, {
      params: { sepLd, page, size },
    });
  } catch (error) {
    console.error('获取资料移交数据失败:', error);
    throw error;
  }
};

export const getDocumentTransferByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getDocumentTransferById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取资料移交详情失败:', error);
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

export const updateDocumentTransferApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateDocumentTransfer', data);
  } catch (error) {
    console.error('修改资料移交失败:', error);
    throw error;
  }
};

export const updateDocumentTransferByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/updateDocumentTransferByCaseId',
      data,
    );
  } catch (error) {
    console.error('根据案件ID更新资料移交失败:', error);
    throw error;
  }
};

export const deleteDocumentTransferApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteDocumentTransfer', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除资料移交失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 归档管理 (ARCHIVING_MANAGEMENT)
// ============================================

export const getAllArchivingManagementsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ArchivingManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllArchivingManagements', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有归档管理数据失败:', error);
    throw error;
  }
};

export const getArchivingManagementsByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ArchivingManagementInfo>
  >
> => {
  try {
    return await requestClient8085.get(`/api/web/getArchivingManagementsByCaseId`, {
      params: { sepLd, page, size },
    });
  } catch (error) {
    console.error('获取归档管理数据失败:', error);
    throw error;
  }
};

export const getArchivingManagementByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getArchivingManagementById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取归档管理详情失败:', error);
    throw error;
  }
};

export const addArchivingManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/addArchivingManagement', data);
  } catch (error) {
    console.error('添加归档管理失败:', error);
    throw error;
  }
};

export const updateArchivingManagementApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateArchivingManagement', data);
  } catch (error) {
    console.error('修改归档管理失败:', error);
    throw error;
  }
};

export const updateArchivingManagementByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post(
      '/api/web/updateArchivingManagementByCaseId',
      data,
    );
  } catch (error) {
    console.error('根据案件ID更新归档管理失败:', error);
    throw error;
  }
};

export const deleteArchivingManagementApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteArchivingManagement', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除归档管理失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 印章销毁 (SEAL_DESTRUCTION)
// ============================================

export const getAllSealDestructionsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SealDestructionInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllSealDestructions', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有印章销毁数据失败:', error);
    throw error;
  }
};

export const getSealDestructionsByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SealDestructionInfo>
  >
> => {
  try {
    return await requestClient8085.get(`/api/web/getSealDestructionsByCaseId`, {
      params: { sepLd, page, size },
    });
  } catch (error) {
    console.error('获取印章销毁数据失败:', error);
    throw error;
  }
};

export const getSealDestructionByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getSealDestructionById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取印章销毁详情失败:', error);
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

export const updateSealDestructionApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateSealDestruction', data);
  } catch (error) {
    console.error('修改印章销毁失败:', error);
    throw error;
  }
};

export const updateSealDestructionByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateSealDestructionByCaseId', data);
  } catch (error) {
    console.error('根据案件ID更新印章销毁失败:', error);
    throw error;
  }
};

export const deleteSealDestructionApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteSealDestruction', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除印章销毁失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段 API - 账户销户 (ACCOUNT_CLOSING)
// ============================================

export const getAllAccountClosingsApi = async (
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AccountClosingInfo>
  >
> => {
  try {
    return await requestClient8085.get('/api/web/getAllAccountClosings', {
      params: { page, size },
    });
  } catch (error) {
    console.error('获取所有账户销户数据失败:', error);
    throw error;
  }
};

export const getAccountClosingsByCaseApi = async (
  sepLd: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.AccountClosingInfo>
  >
> => {
  try {
    return await requestClient8085.get(`/api/web/getAccountClosingsByCaseId`, {
      params: { sepLd, page, size },
    });
  } catch (error) {
    console.error('获取账户销户数据失败:', error);
    throw error;
  }
};

export const getAccountClosingByIdApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.get(`/api/web/getAccountClosingById`, {
      params: { sepId },
    });
  } catch (error) {
    console.error('获取账户销户详情失败:', error);
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

export const updateAccountClosingApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateAccountClosing', data);
  } catch (error) {
    console.error('修改账户销户失败:', error);
    throw error;
  }
};

export const updateAccountClosingByCaseApi = async (data: any) => {
  try {
    return await requestClient8085.post('/api/web/updateAccountClosingByCaseId', data);
  } catch (error) {
    console.error('根据案件ID更新账户销户失败:', error);
    throw error;
  }
};

export const deleteAccountClosingApi = async (sepId: number | string) => {
  try {
    return await requestClient8085.post('/api/web/deleteAccountClosing', null, {
      params: { sepId },
    });
  } catch (error) {
    console.error('删除账户销户失败:', error);
    throw error;
  }
};

// ============================================
// 第七阶段统一更新API
// ============================================

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
