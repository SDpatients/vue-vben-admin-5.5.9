import http from './request'

// 阶段数据接口
export interface ProcessStageData {
  id: number
  caseId: number
  stageNum: number
  stageName: string
  moduleCode: string
  moduleName: string
  title: string
  content: string
  processDate: string
  attachments: string
  fieldData: string
  status: string
  createTime: string
  updateTime: string
}

// 查询案件的所有阶段数据
export const getCaseStageDataList = (caseId: number) => {
  return http.get<{ code: number; message: string; data: ProcessStageData[] }>(
    `/api/case-process-stage/case/${caseId}`
  )
}

// 查询案件的特定阶段数据
export const getCaseStageDataByStageNum = (caseId: number, stageNum: number) => {
  return http.get<{ code: number; message: string; data: ProcessStageData[] }>(
    `/api/case-process-stage/case/${caseId}/stage/${stageNum}`
  )
}

// 查询案件的特定模块数据
export const getCaseStageDataByModule = (caseId: number, moduleCode: string) => {
  return http.get<{ code: number; message: string; data: ProcessStageData[] }>(
    `/api/case-process-stage/case/${caseId}/module/${moduleCode}`
  )
}
