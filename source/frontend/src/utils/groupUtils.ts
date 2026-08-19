import type { ClassroomGroupItem } from '@/modules/classes/types/classroomGroup'

export const getNumericId = (value: unknown): number | null => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const getMemberIds = (group: ClassroomGroupItem): number[] => {
  if (!Array.isArray(group.members)) return []

  return group.members
    .map(member => getNumericId(member.userId ?? member.id))
    .filter((id): id is number => id !== null)
}

export const getGroupMemberCount = (group: ClassroomGroupItem): number => {
  if (typeof group.totalMemberCount === 'number') return group.totalMemberCount
  if (typeof group.memberCount === 'number') return group.memberCount
  if (Array.isArray(group.members)) return group.members.length
  return 0
}
