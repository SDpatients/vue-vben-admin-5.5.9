// 获取环境变量中的API基础地址
const API_BASE_URL =
  import.meta.env.VITE_GLOB_API_URL || 'http://192.168.0.107:8081';

export namespace CaseProcessApi {
  /** 工作团队信息 */
  export interface WorkTeamInfo {
    SEP_ID: string;
    TDFZR: string;
    ZHZCY: string;
    CXZCY: string;
    CCGLZCY: string;
    ZQSHZCY: string;
    LDRSZCY: string;
    ZZQLZCY: string;
    DQZT: string;
  }

  /** 工作计划信息 */
  export interface WorkPlanInfo {
    SEP_ID: string;
    JHLX: string;
    JHNR: string;
    KSRQ: string;
    JSRQ: string;
    FZR: string;
    ZHZT: string;
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
    GLMC: string;
    GLNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 印章管理信息 */
  export interface SealManagementInfo {
    SEP_ID: string;
    YZMC: string;
    YZLX: string;
    YZNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 法律程序信息 */
  export interface LegalProcedureInfo {
    SEP_ID: string;
    FLMC: string;
    FLNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 第二阶段：财产接管信息 */
  export interface PropertyReceiptInfo {
    SEP_ID: string;
    JCMC: string;
    JCNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 第二阶段：应急预案信息 */
  export interface EmergencyInfo {
    SEP_ID: string;
    YJMC: string;
    YJNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 第二阶段：财产处置计划信息 */
  export interface PropertyPlanInfo {
    SEP_ID: string;
    CZMC: string;
    CZNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 第二阶段：人事管理信息 */
  export interface PersonnelEmpInfo {
    SEP_ID: string;
    RSMC: string;
    RSNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 第二阶段：内部事务信息 */
  export interface InternalAffairsInfo {
    SEP_ID: string;
    NBMC: string;
    NBNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
  }

  /** 第二阶段：经营管理信息 */
  export interface BusinessManagementInfo {
    SEP_ID: string;
    JYMC: string;
    JYNR: string;
    FZR: string;
    ZT: string;
    DQZT: string;
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
    const token = '4015f285dc41bd1bb931ba8430966c3f';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllWorkTeam?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.WorkPlanInfo>
  >
> => {
  try {
    const token = '8a62e323a84173fd8ec72557e6fc616d';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllWorkPlan?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.ManagementInfo>
  >
> => {
  try {
    const token = '6bbdf0bf97117c1bac495072c961e778';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllManagement?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.SealManagementInfo>
  >
> => {
  try {
    const token = '203cadf061d22b2aaa2ce1c59b9c4bbb';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllSealManagement?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.LegalProcedureInfo>
  >
> => {
  try {
    const token = 'a81a3a18b6d52abb4b6c38132e1198da';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllLegalProcedure?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PropertyReceiptInfo>
  >
> => {
  try {
    const token = '699a11d9338b983ce9eafc5e75f1833f';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllPropertyReceipt?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.EmergencyInfo>
  >
> => {
  try {
    const token = 'c6c85c5e695fec908ded4f05f9e9bfc9';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllEmergency?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PropertyPlanInfo>
  >
> => {
  try {
    const token = '924180f974b81f375d6625ab0fd59f60';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllPropertyPlan?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.PersonnelEmpInfo>
  >
> => {
  try {
    const token = 'ae3987ea39249e94edb9bdccf1c859d7';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllPersonnelEmp?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.InternalAffairsInfo>
  >
> => {
  try {
    const token = 'ba251b8fffee8a47a71b3429ab9cccb5';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllInternalAffairs?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<
  CaseProcessApi.TaskResponse<
    CaseProcessApi.PageResponse<CaseProcessApi.BusinessManagementInfo>
  >
> => {
  try {
    const token = '0611b92b9a4bd76e5fc315d145a90fc2';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllBusinessManagement?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
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

/** 统一任务操作API */
export const unifiedTaskOperationApi = async (data: {
  [key: string]: any;
  OperateType: string;
  SEP_ID?: string;
  SEP_LD: string;
  ZT: string;
}): Promise<{ error: string; status: string }> => {
  try {
    // 设置API基础地址和token
    const API_BASE_URL =
      import.meta.env.VITE_GLOB_API_URL || 'http://192.168.0.107:8081';
    const token = 'b8b63b32acfc6dc4a07ef45cd1fea18a';
    const url = `${API_BASE_URL}/api/web/update1?token=${token}`;

    // 从本地存储获取操作人信息
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const SEP_EUSER = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';
    const SEP_EDATE = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD

    // 准备请求数据
    const requestData = {
      SEP_EUSER,
      SEP_EDATE,
      ...data,
    };

    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('统一任务操作失败:', error);
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

/** 工作计划新增API */
export const addWorkPlanApi = async (data: any) => {
  try {
    const token = '8a62e323a84173fd8ec72557e6fc616d';
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
    const token = '6bbdf0bf97117c1bac495072c961e778';
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

/** 法律程序新增API */
export const addLegalProcedureApi = async (data: any) => {
  try {
    const token = 'a81a3a18b6d52abb4b6c38132e1198da';
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

/** 印章管理新增API */
export const addSealManagementApi = async (data: any) => {
  try {
    const token = '203cadf061d22b2aaa2ce1c59b9c4bbb';
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

/** 财产接管新增API */
export const addPropertyReceiptApi = async (data: any) => {
  try {
    const token = '699a11d9338b983ce9eafc5e75f1833f';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addPropertyReceipt?token=${token}`,
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
    console.error('添加财产接管失败:', error);
    throw error;
  }
};

/** 应急预案新增API */
export const addEmergencyApi = async (data: any) => {
  try {
    const token = 'c6c85c5e695fec908ded4f05f9e9bfc9';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addEmergency?token=${token}`,
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
    console.error('添加应急预案失败:', error);
    throw error;
  }
};

/** 财产处置计划新增API */
export const addPropertyPlanApi = async (data: any) => {
  try {
    const token = '924180f974b81f375d6625ab0fd59f60';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addPropertyPlan?token=${token}`,
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
    console.error('添加财产处置计划失败:', error);
    throw error;
  }
};

/** 人事管理新增API */
export const addPersonnelEmploymentApi = async (data: any) => {
  try {
    const token = 'ae3987ea39249e94edb9bdccf1c859d7';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addPersonnelEmployment?token=${token}`,
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
    console.error('添加人事管理失败:', error);
    throw error;
  }
};

/** 内部事务新增API */
export const addInternalAffairsApi = async (data: any) => {
  try {
    const token = 'ba251b8fffee8a47a71b3429ab9cccb5';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addInternalAffairs?token=${token}`,
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
    console.error('添加内部事务失败:', error);
    throw error;
  }
};

/** 合同管理新增API */
export const addContractManagementApi = async (data: any) => {
  try {
    const token = '0611b92b9a4bd76e5fc315d145a90fc2';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addContractManagement?token=${token}`,
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
    console.error('添加合同管理失败:', error);
    throw error;
  }
};

/** 经营管理新增API */
export const addBusinessManagementApi = async (data: any) => {
  try {
    const token = '0611b92b9a4bd76e5fc315d145a90fc2';
    const response = await fetch(
      `${API_BASE_URL}/api/web/addBusinessManagement?token=${token}`,
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
    console.error('添加经营管理失败:', error);
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

/** 第四阶段API函数 - 债权确认 */
export const getClaimConfirmationApi = async (
  SEP_ID: string,
  page: number = 1,
  size: number = 10,
): Promise<CaseProcessApi.TaskResponse<CaseProcessApi.PageResponse<any>>> => {
  try {
    const token = 'de323eee29dc56312ccd17a02571d460';
    const response = await fetch(
      `${API_BASE_URL}/api/web/getAllClaimConfirmation?token=${token}&SEP_ID=${SEP_ID}&page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取债权确认数据失败:', error);
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
