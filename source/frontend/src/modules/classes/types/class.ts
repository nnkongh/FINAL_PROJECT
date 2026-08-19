/**
 * Student Interface
 */
export interface Student {
  id: string
  mssv: string
  fullName: string
  email: string
  groupId?: string // null nếu chưa vào nhóm
}

/**
 * Group Interface (trong 1 Class)
 */
export interface ClassGroup {
  id: string
  rawGroupId?: number
  name: string
  classId: string
  memberCount: number
  maxMembers: number
  progress: number | null
  leaderId?: string
}

/**
 * Payload tạo lớp học (API)
 */
export interface CreateClassPayload {
  className: string
  subjectName: string
  majorType: string
  maxMembersPerGroup: number
}

/**
 * Response lớp học từ API
 */
export interface ClassResponse {
  id: number
  className: string
  classCode: string
  subjectName: string
  isActive: boolean
  totalGroups: number
  totalEnrollments: number
  majorType?: string
  maxMembersPerGroup?: number
  membersWithoutGroup?: number
  createdAt?: string
  updatedAt?: string
  totalStudents?: number
  inviteCode?: string
}

/**
 * Subject Options
 */
export const SUBJECTS = [
  'Phát triển ứng dụng Web',
  'Phát triển ứng dụng Di động',
  'Artificial Intelligence',
  'Machine Learning',
  'Điện toán đám mây',
  'An toàn và Bảo mật',
  'Cơ sở dữ liệu',
  'Mạng máy tính',
  'Phát triển phần mềm',
  'Kiến trúc phần mềm'
] as const

export type Subject = (typeof SUBJECTS)[number]
