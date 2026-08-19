import { TaskPriority, TaskStatus } from './task.enum'

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: TaskPriority
  startDate?: string
  dueDate?: string | null
  assignedTo?: number | null
  labelIds?: number[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: TaskPriority
  startDate?: string
  dueDate?: string | null
  assignedTo?: number | null
}

export interface UpdateTaskStatusRequest {
  newStatus: TaskStatus
  note?: string
}

export interface AssignTaskRequest {
  assignedTo: number | null
}

export interface AddTaskLabelRequest {
  labelId: number
}

export interface RemoveTaskLabelRequest {
  labelId: number
}
