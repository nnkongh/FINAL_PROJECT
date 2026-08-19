import api from '@/lib/axios'
import type { Group, JoinGroupPayload } from '../types/group'
import type {
  AddMemberRequest,
  CreateGroupRequest
} from '../types/group.request'

interface GroupListItemDto {
  id: number
  name: string
  subjectOrProjectName: string
  isActive: boolean
  limitedUser?: number
  totalMemberCount?: number
  majorType?: string
  totalTasks?: number
  totalTasksDone?: number
}

interface GroupListResponseDto {
  value: GroupListItemDto[]
  isSuccess: boolean
  isFailure: boolean
  error?: {
    code: string
    message: string
  }
}

const mapGroupItemToGroup = (item: GroupListItemDto): Group => ({
  id: String(item.id),
  name: item.name,
  category: item.subjectOrProjectName || 'General',
  totalMemberCount: item.totalMemberCount ?? 0,
  limitedUser: item.limitedUser ?? 0,
  memberCount: item.totalMemberCount ?? 0,
  maxMembers: item.limitedUser ?? 0,
  majorType: item.majorType,
  subjectOrProjectName: item.subjectOrProjectName,
  totalTasks: item.totalTasks ?? 0,
  totalTasksDone: item.totalTasksDone ?? 0
})

/**
 * Get all groups (Mock API)
 */
export const getGroups = async (): Promise<Group[]> => {
  const response = await api.get<GroupListResponseDto>('/group/my-groups')
  const payload = response.data

  if (!payload?.isSuccess) {
    throw new Error(payload?.error?.message || 'Không thể tải danh sách nhóm')
  }

  return (payload.value || []).map(mapGroupItemToGroup)
}

/**
 * Get group by ID
 */
export const getGroupById = async (id: string): Promise<Group | null> => {
  const numericId = Number(id)
  if (!Number.isFinite(numericId) || numericId <= 0) return null

  const response = await api.get(`/group/${numericId}/detail`)
  const detail = response.data?.value || response.data

  if (!detail) return null

  return mapGroupItemToGroup({
    id: Number(detail.id ?? numericId),
    name: detail.name || '',
    subjectOrProjectName: detail.subjectOrProjectName || 'General',
    isActive: detail.isActive ?? true,
    limitedUser: detail.limitedUser,
    totalMemberCount: detail.totalMemberCount
  })
}

export const createGroupAPI = async (body: CreateGroupRequest) => {
  const response = await api.post('/group', body)
  return response.data
}

/**
 * Add member to group
 * Endpoint: POST /api/group/{groupId}/member
 */
export const addMemberToGroupAPI = async (
  groupId: number,
  body: AddMemberRequest
) => {
  const response = await api.post(`/group/${groupId}/member`, body)
  return response.data
}

export const getGroupDetailAPI = async (groupId: number) => {
  const response = await api.get(`/group/${groupId}/detail`)
  return response.data
}

export const getGroupMembersAPI = async (groupId: number) => {
  const response = await api.get(`/group/${groupId}/members`)
  return response.data
}

export const deactivateGroupAPI = async (groupId: number) => {
  const response = await api.put(`/group/${groupId}/deactivate`)
  return response.data
}

export const reactiveGroupAPI = async (groupId: number) => {
  const response = await api.put(`/group/${groupId}/reactive`)
  return response.data
}

export interface UpdateGroupMemberRoleRequest {
  newRole: 'Leader' | 'Member'
}

export const updateGroupMemberRoleAPI = async (
  groupId: number,
  userId: number,
  body: UpdateGroupMemberRoleRequest
) => {
  const response = await api.put(`/group/${groupId}/members/${userId}`, body)
  return response.data
}

export interface UpdateGroupInfoRequest {
  name: string
  subjectOrProjectName: string
}

export const updateGroupInfoAPI = async (
  groupId: number,
  body: UpdateGroupInfoRequest
) => {
  const response = await api.put(`/group/${groupId}`, body)
  return response.data
}

export interface UpdateGroupGithubRepoRequest {
  repoUrl: string
}

export const updateGroupGithubRepoAPI = async (
  groupId: number,
  body: UpdateGroupGithubRepoRequest
) => {
  const response = await api.put(`/group/${groupId}/update-github-repo`, body)
  return response.data
}

/**
 * Delete member from group
 * Endpoint: DELETE /api/group/{groupId}/member/{userId}
 */
export const deleteGroupMemberAPI = async (groupId: number, userId: number) => {
  const response = await api.delete(`/group/${groupId}/member/${userId}`)
  return response.data
}
/**
 * Join group by invite code
 */
export const joinGroup = async (payload: JoinGroupPayload): Promise<Group> => {
  const response = await api.post('/group/join', payload)
  const detail = response.data?.value || response.data

  return mapGroupItemToGroup({
    id: Number(detail?.id ?? 0),
    name: detail?.name || '',
    subjectOrProjectName: detail?.subjectOrProjectName || 'General',
    isActive: detail?.isActive ?? true,
    limitedUser: detail?.limitedUser,
    totalMemberCount: detail?.totalMemberCount
  })
}

/**
 * Delete group
 */
export const deleteGroup = async (id: string): Promise<void> => {
  await api.delete(`/group/${id}`)
}

export const deleteClassroomGroupAPI = async (
  classroomId: number | string,
  groupId: number | string
): Promise<void> => {
  await api.delete(`/classroom/${classroomId}/groups/${groupId}`)
}
