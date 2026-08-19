import api from '@/lib/axios'

export type ReportId = number | string

export interface GenerateReportResponse {
  value?: ReportId | { id?: ReportId }
}

export const generateReportAPI = async (groupId: number) => {
  return api.post<GenerateReportResponse>(`/group/${groupId}/report-generated`)
}

export const downloadReportAPI = async (reportId: ReportId) => {
  const encodedReportId = encodeURIComponent(String(reportId))

  return api.get(`/group/report/${encodedReportId}/download`, {
    responseType: 'blob'
  })
}

export const exportAllGroupsAPI = async (classroomId: number | string) => {
  return api.post(`/classroom/${classroomId}/export-all-groups`, undefined, {
    responseType: 'blob'
  })
}
