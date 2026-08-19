import { GroupMemberRole } from './group.enum'

export interface CreateGroupRequest {
  name: string
  subjectOrProjectName: string
  limitedUser: number
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  subjectOrProjectName?: string
}

export interface AddMemberRequest {
  userId?: number
  role?: GroupMemberRole
  userName?: string
  email?: string
  avatarUrl?: string
  userCode?: string
  isActive?: boolean
  userRole?: string
}

export interface UpdateMemberRoleRequest {
  userId: number
  newRole: GroupMemberRole
}

export interface RemoveMemberRequest {
  userId: number
}
