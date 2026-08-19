import type { Group, JoinGroupPayload } from '@/modules/groups/types/group'
import type { CreateGroupRequest } from '@/modules/groups/types/group.request'
import {
  getGroups as getGroupsAPI,
  getGroupById as getGroupByIdAPI,
  createGroupAPI,
  joinGroup as joinGroupAPI,
  deleteGroup as deleteGroupAPI
} from '@/modules/groups/api/group.api'

/**
 * Get all groups (Mock API)
 */
export const getGroups = async (): Promise<Group[]> => getGroupsAPI()

/**
 * Get group by ID (Mock API)
 */
export const getGroupById = async (id: string): Promise<Group | null> =>
  getGroupByIdAPI(id)

/**
 * Create new group (Mock API)
 */
export const createGroup = async (payload: CreateGroupRequest) =>
  createGroupAPI(payload)

/**
 * Join group by invite code (Mock API)
 */
export const joinGroup = async (payload: JoinGroupPayload): Promise<Group> =>
  joinGroupAPI(payload)

/**
 * Delete group (Mock API)
 */
export const deleteGroup = async (id: string): Promise<void> =>
  deleteGroupAPI(id)
