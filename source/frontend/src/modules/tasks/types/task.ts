import { TaskPriority, TaskStatus } from './task.enum'

export interface TaskHistoryItem {
  id: number | string
  taskId: number | string
  changedBy: number | string
  oldStatus: TaskStatus | string
  newStatus: TaskStatus | string
  changedAt: string
}

export interface OverdueTaskItem {
  id: number | string
  title: string
  assigneeName?: string | null
  dueDate?: string | null
  status?: TaskStatus | string
  priority?: TaskPriority | string
  groupId?: number | string
  groupName?: string
  description?: string | null
  overdueDays?: number
  isOverdue?: boolean
}

export interface TaskHistoryRequestParams {
  taskId: number | string
}

export interface OverdueTasksRequestParams {
  groupId: number | string
}
