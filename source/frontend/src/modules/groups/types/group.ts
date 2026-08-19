export interface Group {
  id: string
  name: string
  category: string
  totalMemberCount: number
  limitedUser: number
  memberCount: number
  maxMembers: number
  progress?: number
  inviteCode?: string
  createdAt?: string
  subjectOrProjectName?: string
  majorType?: string
  totalTasks?: number
  totalTasksDone?: number
}

export interface CreateGroupPayload {
  name: string
  category: string
  maxMembers?: number
}

export interface JoinGroupPayload {
  inviteCode: string
}

export const GROUP_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Artificial Intelligence',
  'Machine Learning',
  'DevOps & Cloud',
  'Data Science',
  'Blockchain',
  'Cybersecurity',
  'Game Development',
  'IoT',
  'Other'
] as const

export type GroupCategory = (typeof GROUP_CATEGORIES)[number]
