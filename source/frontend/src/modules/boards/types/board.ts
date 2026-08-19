export interface GitHubPRObject {
  number: number
  title: string
  html_url: string
  state?: 'open' | 'closed' | string
  commits?: number
  merged?: boolean
  user?: {
    login?: string
    avatar_url?: string
    html_url?: string
  }
}

export interface Card {
  _id: string
  boardId: string
  columnId: string
  issueKey?: string
  title?: string
  description?: string | null
  priority?: 'low' | 'medium' | 'high'
  assignedTo?: number | null
  reporter?: string
  pr?: GitHubPRObject | null
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  memberIds?: string[]
  comments?: string[]
  attachments?: string[]
  FE_PlaceholderCard?: boolean
}

export interface Column {
  _id: string
  boardId: string
  title: string
  cardOrderIds: string[]
  cards: Card[]
}

export interface Board {
  _id: string
  title: string
  description: string
  type: 'public' | 'private'
  ownerIds: string[]
  memberIds: string[]
  columnOrderIds: string[]
  columns: Column[]
}

export interface GroupMember {
  id: number
  userId?: number
  userName: string
  userCode: string
  avatarUrl: string | null
  isActive: boolean
  role: string
}
