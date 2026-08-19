export interface ClassroomGroupMember {
  userId?: number
  id?: number
  userName?: string
  fullName?: string
  email?: string
}

export interface ClassroomGroupItem {
  id: number
  name: string
  subjectOrProjectName?: string
  limitedUser?: number
  groupType?: number
  inviteCode?: string
  members?: ClassroomGroupMember[]
  totalMemberCount?: number
  memberCount?: number
  isMyGroup?: boolean
}

export interface ClassroomEnrollmentItem {
  userId?: number
  id?: number
  userName?: string
  fullName?: string
  email?: string
  userCode?: string
  userRole?: string
  role?: string
  roleName?: string
  enrollmentRole?: string
  classId?: number
  classroomId?: number
}

export interface CreateClassroomGroupRequest {
  name: string
  subjectOrProjectName: string
  limitedUser: number
}

export interface ApiErrorPayload {
  code?: string
  message?: string
}

export interface ApiEnvelope<T> {
  value?: T
  data?: T
  isSuccess?: boolean
  isFailure?: boolean
  error?: ApiErrorPayload
}
