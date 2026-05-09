import http from './request'

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

export const getCaseStageDataList = (caseId: number) => {
  return http.get<{ code: number; message: string; data: ProcessStageData[] }>(
    `/case-process-stage/case/${caseId}`
  )
}

export const getCaseStageDataByStageNum = (caseId: number, stageNum: number) => {
  return http.get<{ code: number; message: string; data: ProcessStageData[] }>(
    `/case-process-stage/case/${caseId}/stage/${stageNum}`
  )
}

export const getCaseStageDataByModule = (caseId: number, moduleCode: string) => {
  return http.get<{ code: number; message: string; data: ProcessStageData[] }>(
    `/case-process-stage/case/${caseId}/module/${moduleCode}`
  )
}

export const deleteCaseStageData = (id: number) => {
  return http.delete<{ code: number; message: string; data: null }>(
    `/case-process-stage/${id}`
  )
}
