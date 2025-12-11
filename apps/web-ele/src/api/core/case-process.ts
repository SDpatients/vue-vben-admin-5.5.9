// 获取环境变量中的API基础地址
const API_BASE_URL =
  import.meta.env.VITE_GLOB_API_URL || 'http://192.168.0.107:8081';

export namespace CaseProcessApi {
  /** 工作团队信息 */
  export interface WorkTeamInfo {
    SEP_ID: string;
    TDID: string;
    GLAJBH: string;
    TDFZR: string;
    ZHZCY: string;
    CXZCY: string;
    CCGLZCY: string;
    ZQSHZCY: string;
    LDRSZCY: string;
    ZZQLZCY: string;
    AH: string;
    DQZT: string;
  }

  /** 工作计划信息 */
  export interface WorkPlanInfo {
    SEP_ID: string;
    JHID: string;
    GLAJBH: string;
    JHLX: string;
    JHNR: string;
    KSRQ: string;
    JSRQ: string;
    FZR: string;
    ZHZT: string;
    AH: string;
    DQZT: string;
    SEP_LD: string;
    SEP_MD: string;
    SEP_ND: string;
    SEP_AUSER: string;
    SEP_ADATE: string;
    SEP_EUSER: string;
    SEP_EDATE: string;
  }

  /** 管理制度信息 */
  export interface ManagementInfo {
    SEP_ID: string;
    GLID: string;
    GLAJBH: string;
    GLMC: string;
    GLNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 印章管理信息 */
  export interface SealManagementInfo {
    SEP_ID: string;
    YZID: string;
    GLAJBH: string;
    YZMC: string;
    YZLX: string;
    YZNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 法律程序信息 */
  export interface LegalProcedureInfo {
    SEP_ID: string;
    FLID: string;
    GLAJBH: string;
    FLMC: string;
    FLNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 第二阶段：财产接管信息 */
  export interface PropertyReceiptInfo {
    SEP_ID: string;
    JCID: string;
    GLAJBH: string;
    JCMC: string;
    JCNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 第二阶段：应急预案信息 */
  export interface EmergencyInfo {
    SEP_ID: string;
    YJID: string;
    GLAJBH: string;
    YJMC: string;
    YJNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 第二阶段：财产处置计划信息 */
  export interface PropertyPlanInfo {
    SEP_ID: string;
    CZID: string;
    GLAJBH: string;
    CZMC: string;
    CZNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 第二阶段：人事管理信息 */
  export interface PersonnelEmpInfo {
    SEP_ID: string;
    RSID: string;
    GLAJBH: string;
    RSMC: string;
    RSNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 第二阶段：内部事务信息 */
  export interface InternalAffairsInfo {
    SEP_ID: string;
    NBID: string;
    GLAJBH: string;
    NBMC: string;
    NBNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 第二阶段：经营管理信息 */
  export interface BusinessManagementInfo {
    SEP_ID: string;
    JYID: string;
    GLAJBH: string;
    JYMC: string;
    JYNR: string;
    FZR: string;
    ZT: string;
    AH: string;
    DQZT: string;
  }

  /** 任务状态类型 */
  export type TaskStatus = '完成' | '未确认' | '跳过' | '待开发';

  /** 任务基本信息 */
  export interface TaskInfo {
    id: string;
    name: string;
    status: TaskStatus;
    apiUrl: string;
    token: string;
    data?: any;
    isPending?: boolean;
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
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.WorkTeamInfo>> => {
  try {
    const token = '4015f285dc41bd1bb931ba8430966c3f';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getWorkTeam?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取工作团队数据失败:', error);
    throw error;
  }
};

export const getWorkPlanApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.WorkPlanInfo>> => {
  try {
    const token = '8a62e323a84173fd8ec72557e6fc616d';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getWorkPlan?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取工作计划数据失败:', error);
    throw error;
  }
};

export const getManagementApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.ManagementInfo>> => {
  try {
    const token = '6bbdf0bf97117c1bac495072c961e778';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getManagement?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取管理制度数据失败:', error);
    throw error;
  }
};

export const getSealManagementApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.SealManagementInfo>> => {
  try {
    const token = '203cadf061d22b2aaa2ce1c59b9c4bbb';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getSealManagement?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取印章管理数据失败:', error);
    throw error;
  }
};

export const getLegalProcedureApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.LegalProcedureInfo>> => {
  try {
    const token = 'a81a3a18b6d52abb4b6c38132e1198da';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getLegalProcedure?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取法律程序数据失败:', error);
    throw error;
  }
};

/** 第二阶段API函数 */
export const getPropertyReceiptApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PropertyReceiptInfo>> => {
  try {
    const token = '699a11d9338b983ce9eafc5e75f1833f';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getPropertyReceipt?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取财产接管数据失败:', error);
    throw error;
  }
};

export const getEmergencyApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.EmergencyInfo>> => {
  try {
    const token = 'c6c85c5e695fec908ded4f05f9e9bfc9';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getEmergency?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取应急预案数据失败:', error);
    throw error;
  }
};

export const getPropertyPlanApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PropertyPlanInfo>> => {
  try {
    const token = '924180f974b81f375d6625ab0fd59f60';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getPropertyPlan?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取财产处置计划数据失败:', error);
    throw error;
  }
};

export const getPersonnelEmpApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PersonnelEmpInfo>> => {
  try {
    const token = 'ae3987ea39249e94edb9bdccf1c859d7';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getPersonnelEmp?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取人事管理数据失败:', error);
    throw error;
  }
};

export const getInternalAffairsApi = async (
  AJID: string,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.InternalAffairsInfo>> => {
  try {
    const token = 'ba251b8fffee8a47a71b3429ab9cccb5';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getInternalAffairs?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取内部事务数据失败:', error);
    throw error;
  }
};

export const getBusinessManagementApi = async (
  AJID: string,
): Promise<
  CaseProcessApi.TaskResponse<CaseProcessApi.BusinessManagementInfo>
> => {
  try {
    const token = '0611b92b9a4bd76e5fc315d145a90fc2';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getBusinessManagement?token=${token}&AJID=${AJID}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取经营管理数据失败:', error);
    throw error;
  }
};

/** 更新任务状态API */
export const updateTaskStatusApi = async (
  _taskType: string,
  _AJID: string,
  _status: CaseProcessApi.TaskStatus,
  _data?: any,
): Promise<{ error?: string; message?: string; status: string }> => {
  try {
    // 这里应该调用对应的更新API
    // 暂时模拟成功响应
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      status: '1',
      message: '更新成功',
    };
  } catch (error) {
    console.error('更新任务状态失败:', error);
    throw error;
  }
};
